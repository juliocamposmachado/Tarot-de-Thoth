import asyncio
import os
import time
from typing import Optional

from playwright.async_api import async_playwright, BrowserContext, Page


# ChatGPT interface selectors — kept in one place for easy maintenance.
# We use multiple fallbacks because the ChatGPT DOM changes frequently.
COMPOSE_TEXTAREA_SELECTORS = [
    'div[contenteditable="true"]#prompt-textarea',
    'textarea#prompt-textarea',
    'div[contenteditable="true"][data-id]',
    'textarea[data-id]',
    'div[contenteditable="true"][role="textbox"]',
    'textarea[placeholder*="Message"]',
    'div[contenteditable="true"][class*="prose"]',
]

SEND_BUTTON_SELECTORS = [
    'button[data-testid="send-button"]',
    'button[aria-label*="Send"]',
    'button[aria-label*="send"]',
    'button[type="submit"]',
    'form button:last-of-type',
]

# The streaming/generation indicator that appears while ChatGPT is composing.
GENERATING_INDICATOR_SELECTORS = [
    'button[aria-label*="Stop"]',
    'button[data-testid="stop-button"]',
    'svg[class*="animate"]',
]


async def find_element(page: Page, selectors: list[str], timeout: int = 10000) -> Optional[object]:
    for selector in selectors:
        try:
            el = await page.wait_for_selector(selector, timeout=timeout)
            if el:
                return el
        except Exception:
            continue
    return None


async def check_exists(page: Page, selectors: list[str]) -> bool:
    for selector in selectors:
        try:
            el = await page.query_selector(selector)
            if el:
                return True
        except Exception:
            continue
    return False


class BrowserWorker:
    def __init__(self, config: dict):
        self.conversation_url = config.get(
            "conversation_url",
            "https://chatgpt.com/c/6acad485-8b30-83e9-81e3-8ee2b80196dd"
        )
        self.profile_dir = os.path.join(
            os.path.dirname(os.path.abspath(__file__)),
            config.get("profile_dir", ".browser-profile")
        )
        self.headless = config.get("headless", False)
        self.generation_timeout = int(config.get("generation_timeout", 120))
        self.poll_interval = float(config.get("poll_interval", 2))

        self._playwright = None
        self._browser = None
        self._context: Optional[BrowserContext] = None
        self._page: Optional[Page] = None
        self._lock = asyncio.Lock()
        self._authenticated = False

    async def start(self):
        if self._context:
            return
        os.makedirs(self.profile_dir, exist_ok=True)
        self._playwright = await async_playwright().start()
        self._browser = await self._playwright.chromium.launch_persistent_context(
            user_data_dir=self.profile_dir,
            headless=self.headless,
            viewport={"width": 1280, "height": 900},
            args=["--disable-blink-features=AutomationControlled"],
        )
        self._context = self._browser
        self._page = self._context.pages[0] if self._context.pages else await self._context.new_page()

    async def stop(self):
        if self._browser:
            await self._browser.close()
        if self._playwright:
            await self._playwright.stop()
        self._context = None
        self._browser = None
        self._playwright = None
        self._page = None
        self._authenticated = False

    async def ensure_session(self) -> dict:
        await self.start()
        try:
            await self._page.goto(self.conversation_url, wait_until="networkidle", timeout=30000)
        except Exception:
            pass

        # Check if we're on a login page (URL changed to auth/login)
        current_url = self._page.url
        if "auth" in current_url or "login" in current_url:
            self._authenticated = False
            return {
                "browser_ready": True,
                "authenticated": False,
                "message": "Sessao do ChatGPT expirada. Faca login manualmente na janela aberta."
            }

        # Check if the compose textarea is available
        textarea = await find_element(self._page, COMPOSE_TEXTAREA_SELECTORS, timeout=8000)
        if textarea:
            self._authenticated = True
            return {
                "browser_ready": True,
                "authenticated": True,
                "message": "Sessao ativa e conversa carregada."
            }

        self._authenticated = False
        return {
            "browser_ready": True,
            "authenticated": False,
            "message": "Nao foi possivel encontrar o campo de mensagem. Faca login manualmente."
        }

    async def send_prompt_and_capture(self, prompt: str) -> dict:
        async with self._lock:
            await self.start()

            try:
                await self._page.goto(self.conversation_url, wait_until="networkidle", timeout=30000)
            except Exception:
                pass

            await asyncio.sleep(2)

            # Count existing assistant messages before sending
            prior_count = await self._count_assistant_messages()

            # Find and fill the compose area
            textarea = await find_element(self._page, COMPOSE_TEXTAREA_SELECTORS, timeout=15000)
            if not textarea:
                return {"success": False, "error": "Campo de mensagem nao encontrado. Verifique se a sessao do ChatGPT esta ativa."}

            await textarea.click()
            await asyncio.sleep(0.3)

            # Type the prompt — use keyboard to trigger React state updates
            await self._page.keyboard.type(prompt, delay=5)
            await asyncio.sleep(0.5)

            # Find and click the send button
            send_btn = await find_element(self._page, SEND_BUTTON_SELECTORS, timeout=5000)
            if send_btn:
                await send_btn.click()
            else:
                # Fallback: press Enter
                await self._page.keyboard.press("Enter")

            await asyncio.sleep(1)

            # Wait for generation to start, then complete
            await self._wait_for_generation_complete()

            # Capture the new assistant message
            response_text = await self._capture_new_assistant_message(prior_count)

            if not response_text or len(response_text.strip()) < 20:
                return {"success": False, "error": "Resposta vazia ou muito curta. Tente novamente."}

            return {"success": True, "response": response_text.strip()}

    async def _count_assistant_messages(self) -> int:
        try:
            messages = await self._page.query_selector_all('[data-message-author-role="assistant"]')
            return len(messages)
        except Exception:
            return 0

    async def _wait_for_generation_complete(self):
        # First, wait for a generating indicator to appear (up to 10s)
        deadline_start = time.time() + 10
        generating_seen = False
        while time.time() < deadline_start:
            if await check_exists(self._page, GENERATING_INDICATOR_SELECTORS):
                generating_seen = True
                break
            await asyncio.sleep(0.5)

        if not generating_seen:
            # Maybe generation already finished quickly, or send didn't work
            await asyncio.sleep(3)
            return

        # Now wait for the indicator to disappear
        deadline = time.time() + self.generation_timeout
        while time.time() < deadline:
            if not await check_exists(self._page, GENERATING_INDICATOR_SELECTORS):
                await asyncio.sleep(1)  # extra settle time
                return
            await asyncio.sleep(self.poll_interval)

        # Timeout — generation took too long

    async def _capture_new_assistant_message(self, prior_count: int) -> str:
        try:
            messages = await self._page.query_selector_all('[data-message-author-role="assistant"]')
            if len(messages) <= prior_count:
                # Fallback: try to get the last message by other selectors
                fallback = await self._page.query_selector_all('[class*="markdown"]')
                if fallback:
                    last = fallback[-1]
                    text = await last.inner_text()
                    return text
                return ""

            # Get the last assistant message (the new one)
            last_msg = messages[-1]
            text = await last_msg.inner_text()
            return text
        except Exception:
            return ""

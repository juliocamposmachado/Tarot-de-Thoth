import os
import sys
import uuid
import asyncio
import threading
from datetime import datetime

from flask import Flask, request, jsonify
from flask_cors import CORS

from storage import init_db, create_reading, update_reading, get_reading, list_readings
from prompt_validator import validate_reading_request, sanitize_for_storage
from browser_worker import BrowserWorker

# --- Configuration ---

BRIDGE_PORT = int(os.environ.get("BRIDGE_PORT", "5317"))
CONVERSATION_URL = os.environ.get(
    "CHATGPT_CONVERSATION_URL",
    "https://chatgpt.com/c/6acad485-8b30-83e9-81e3-8ee2b80196dd"
)
ALLOWED_ORIGINS = [
    o.strip() for o in os.environ.get(
        "ALLOWED_ORIGINS",
        "https://tarot-de-thoth.vercel.app,http://localhost:5173,http://127.0.0.1:5173"
    ).split(",") if o.strip()
]
PROFILE_DIR = os.environ.get("BROWSER_PROFILE_DIR", ".browser-profile")
GENERATION_TIMEOUT = int(os.environ.get("GENERATION_TIMEOUT", "120"))
POLL_INTERVAL = float(os.environ.get("POLL_INTERVAL", "2"))
HEADLESS = os.environ.get("HEADLESS", "false").lower() == "true"

app = Flask(__name__)
CORS(app, origins=ALLOWED_ORIGINS, methods=["GET", "POST", "OPTIONS"],
     allow_headers=["Content-Type", "Authorization"])

# --- Async infrastructure ---
# Playwright needs a dedicated event loop running in a background thread.
# Flask handlers submit coroutines to it via run_coroutine_threadsafe.

_bg_loop: asyncio.AbstractEventLoop = None
_bg_thread: threading.Thread = None
_worker: BrowserWorker = None
_processing_lock = threading.Lock()


def _bg_loop_main():
    global _bg_loop
    _bg_loop = asyncio.new_event_loop()
    asyncio.set_event_loop(_bg_loop)
    _bg_loop.run_forever()


def submit_async(coro):
    """Submit a coroutine to the background event loop and block until it completes."""
    future = asyncio.run_coroutine_threadsafe(coro, _bg_loop)
    return future.result(timeout=300)  # 5-minute hard cap


def get_worker() -> BrowserWorker:
    global _worker
    if _worker is None:
        _worker = BrowserWorker({
            "conversation_url": CONVERSATION_URL,
            "profile_dir": PROFILE_DIR,
            "headless": HEADLESS,
            "generation_timeout": GENERATION_TIMEOUT,
            "poll_interval": POLL_INTERVAL,
        })
    return _worker


def start_bg_loop():
    global _bg_thread
    if _bg_thread and _bg_thread.is_alive():
        return
    _bg_thread = threading.Thread(target=_bg_loop_main, daemon=True)
    _bg_thread.start()
    # Wait for the loop to be ready
    while _bg_loop is None:
        import time; time.sleep(0.05)


# --- Routes ---

@app.route("/api/v1/health", methods=["GET"])
def health():
    try:
        worker = get_worker()
        result = submit_async(worker.ensure_session())
        return jsonify({
            "status": "ok",
            "bridge": True,
            "browser_ready": result.get("browser_ready", False),
            "authenticated": result.get("authenticated", False),
            "message": result.get("message", ""),
            "conversation_url": CONVERSATION_URL,
            "timestamp": datetime.now().isoformat()
        })
    except Exception as e:
        return jsonify({
            "status": "error",
            "bridge": True,
            "browser_ready": False,
            "authenticated": False,
            "message": str(e)
        }), 500


@app.route("/api/v1/readings", methods=["POST"])
def create_reading_request():
    data = request.get_json(silent=True)
    if not data:
        return jsonify({"error": "Corpo da requisicao vazio ou invalido."}), 400

    valid, msg = validate_reading_request(data)
    if not valid:
        return jsonify({"error": msg}), 400

    reading_id = str(uuid.uuid4())

    create_reading(
        reading_id=reading_id,
        question=data["question"],
        reading_type=data["reading_type"],
        cards=data["cards"],
        prompt=data["prompt"],
        consulente_name=data.get("user_name", ""),
        birth_date=data.get("birth_date", "")
    )

    def process():
        if not _processing_lock.acquire(blocking=False):
            update_reading(reading_id, "queued", error="Outra leitura esta em processamento. Aguarde.")
            return

        try:
            update_reading(reading_id, "opening_browser")
            worker = get_worker()
            result = submit_async(worker.send_prompt_and_capture(data["prompt"]))

            if result.get("success"):
                response_text = sanitize_for_storage(result["response"])
                update_reading(reading_id, "completed", response=response_text)
            else:
                update_reading(reading_id, "failed", error=result.get("error", "Erro desconhecido."))
        except Exception as e:
            update_reading(reading_id, "failed", error=str(e))
        finally:
            _processing_lock.release()

    threading.Thread(target=process, daemon=True).start()
    return jsonify({"id": reading_id, "status": "queued"}), 202


@app.route("/api/v1/readings/<reading_id>", methods=["GET"])
def get_reading_status(reading_id: str):
    reading = get_reading(reading_id)
    if not reading:
        return jsonify({"error": "Leitura nao encontrada."}), 404
    return jsonify(reading)


@app.route("/api/v1/readings", methods=["GET"])
def list_all_readings():
    limit = request.args.get("limit", 50, type=int)
    offset = request.args.get("offset", 0, type=int)
    readings = list_readings(limit=min(limit, 200), offset=max(offset, 0))
    return jsonify({"readings": readings, "count": len(readings)})


@app.route("/api/v1/readings/<reading_id>/cancel", methods=["POST"])
def cancel_reading(reading_id: str):
    reading = get_reading(reading_id)
    if not reading:
        return jsonify({"error": "Leitura nao encontrada."}), 404
    if reading["status"] in ("completed", "failed", "cancelled"):
        return jsonify({"error": "Leitura ja finalizada."}), 400
    update_reading(reading_id, "cancelled")
    return jsonify({"id": reading_id, "status": "cancelled"})


@app.route("/api/v1/shutdown", methods=["POST"])
def shutdown():
    def stop_worker():
        try:
            worker = get_worker()
            submit_async(worker.stop())
        except Exception:
            pass
    threading.Thread(target=stop_worker, daemon=True).start()
    return jsonify({"status": "shutting down"})


# --- Main ---

import ssl
import subprocess

CERT_DIR = os.path.join(os.path.dirname(os.path.abspath(__file__)), ".cert")


def ensure_self_signed_cert():
    """Generate a self-signed SSL certificate for HTTPS (needed when site is on HTTPS)."""
    os.makedirs(CERT_DIR, exist_ok=True)
    cert_file = os.path.join(CERT_DIR, "cert.pem")
    key_file = os.path.join(CERT_DIR, "key.pem")
    if os.path.exists(cert_file) and os.path.exists(key_file):
        return cert_file, key_file
    try:
        subprocess.run([
            "openssl", "req", "-x509", "-newkey", "rsa:2048",
            "-keyout", key_file, "-out", cert_file,
            "-days", "365", "-nodes",
            "-subj", "/CN=127.0.0.1",
            "-addext", "subjectAltName=IP:127.0.0.1",
        ], check=True, capture_output=True)
        return cert_file, key_file
    except Exception as e:
        print(f"Aviso: nao foi possivel gerar certificado SSL: {e}")
        print("O servidor HTTPS nao estara disponivel. Apenas HTTP funcionara.")
        return None, None


if __name__ == "__main__":
    init_db()
    start_bg_loop()

    cert_file, key_file = ensure_self_signed_cert()

    print("=" * 50)
    print("  Tarot de Thoth - Ponte Local")
    print(f"  HTTP porta: {BRIDGE_PORT}")
    print(f"  HTTPS porta: {BRIDGE_PORT + 1}")
    print(f"  Conversa: {CONVERSATION_URL}")
    print(f"  Origens permitidas: {ALLOWED_ORIGINS}")
    print("=" * 50)

    # Start HTTPS server in a background thread (for production sites on HTTPS)
    if cert_file and key_file:
        def run_https():
            ctx = ssl.SSLContext(ssl.PROTOCOL_TLS_SERVER)
            ctx.load_cert_chain(cert_file, key_file)
            https_app = app
            https_app.run(
                host="127.0.0.1",
                port=BRIDGE_PORT + 1,
                debug=False,
                threaded=True,
                ssl_context=ctx,
            )
        t = threading.Thread(target=run_https, daemon=True)
        t.start()
        print(f"  HTTPS: https://127.0.0.1:{BRIDGE_PORT + 1}")
    else:
        print("  HTTPS: indisponivel (sem certificado)")

    print(f"  HTTP:  http://127.0.0.1:{BRIDGE_PORT}")
    print("  Pressione Ctrl+C para encerrar.")
    print("=" * 50)

    # Main HTTP server (for local dev)
    app.run(host="127.0.0.1", port=BRIDGE_PORT, debug=False, threaded=True)

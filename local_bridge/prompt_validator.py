import re

MAX_PROMPT_LENGTH = 8000
MAX_QUESTION_LENGTH = 1000
MAX_CARDS = 20


def validate_prompt(prompt: str) -> tuple[bool, str]:
    if not prompt or not isinstance(prompt, str):
        return False, "Prompt vazio ou invalido."
    stripped = prompt.strip()
    if len(stripped) < 10:
        return False, "Prompt muito curto."
    if len(stripped) > MAX_PROMPT_LENGTH:
        return False, f"Prompt excede o limite de {MAX_PROMPT_LENGTH} caracteres."
    return True, ""


def validate_reading_request(data: dict) -> tuple[bool, str]:
    if not data or not isinstance(data, dict):
        return False, "Dados invalidos."

    question = data.get("question", "")
    if not question or not isinstance(question, str):
        return False, "Pergunta ausente ou invalida."
    if len(question) > MAX_QUESTION_LENGTH:
        return False, f"Pergunta excede o limite de {MAX_QUESTION_LENGTH} caracteres."

    cards = data.get("cards", [])
    if not isinstance(cards, list) or len(cards) == 0:
        return False, "Cartas ausentes ou invalidas."
    if len(cards) > MAX_CARDS:
        return False, f"Numero de cartas excede o limite de {MAX_CARDS}."

    for card in cards:
        if not isinstance(card, dict):
            return False, "Carta com formato invalido."
        if not card.get("name") or not isinstance(card["name"], str):
            return False, "Carta sem nome."
        if not card.get("position") or not isinstance(card["position"], str):
            return False, "Carta sem posicao."

    prompt = data.get("prompt", "")
    valid, msg = validate_prompt(prompt)
    if not valid:
        return False, msg

    reading_type = data.get("reading_type", "")
    if not reading_type or not isinstance(reading_type, str):
        return False, "Tipo de tiragem ausente ou invalido."

    return True, ""


def sanitize_for_storage(text: str) -> str:
    if not text:
        return ""
    return text[:10000]

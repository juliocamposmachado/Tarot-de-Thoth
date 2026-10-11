import os
import sys
import uuid
import asyncio
import threading
from datetime import datetime

from flask import Flask, request, jsonify
from flask_cors import CORS

from storage import init_db, create_reading, update_reading, get_reading, list_readings
from prompt_validator import validate_reading_request, validate_prompt, sanitize_for_storage
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
cors = CORS(app, origins=ALLOWED_ORIGINS, methods=["GET", "POST", "OPTIONS"],
            allow_headers=["Content-Type", "Authorization"])

# --- Browser Worker ---

worker_config = {
    "conversation_url": CONVERSATION_URL,
    "profile_dir": PROFILE_DIR,
    "headless": HEADLESS,
    "generation_timeout": GENERATION_TIMEOUT,
    "poll_interval": POLL_INTERVAL,
}
worker = BrowserWorker(worker_config)

# Thread-safe task queue: one prompt at a time
_processing_lock = threading.Lock()
_loop = None


def get_or_create_loop():
    global _loop
    if _loop is None or _loop.is_closed():
        _loop = asyncio.new_event_loop()
        asyncio.set_event_loop(_loop)
    return _loop


def run_async(coro):
    loop = get_or_create_loop()
    return loop.run_until_complete(coro)


# --- Routes ---

@app.route("/api/v1/health", methods=["GET"])
def health():
    try:
        result = run_async(worker.ensure_session())
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

    # Process in background thread
    def process():
        if not _processing_lock.acquire(blocking=False):
            update_reading(reading_id, "queued", error="Outra leitura esta em processamento. Aguarde.")
            return

        try:
            update_reading(reading_id, "opening_browser")
            result = run_async(worker.send_prompt_and_capture(data["prompt"]))

            if result.get("success"):
                response_text = sanitize_for_storage(result["response"])
                update_reading(reading_id, "completed", response=response_text)
            else:
                update_reading(reading_id, "failed", error=result.get("error", "Erro desconhecido."))
        except Exception as e:
            update_reading(reading_id, "failed", error=str(e))
        finally:
            _processing_lock.release()

    thread = threading.Thread(target=process, daemon=True)
    thread.start()

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
        run_async(worker.stop())
    threading.Thread(target=stop_worker, daemon=True).start()
    return jsonify({"status": "shutting down"})


# --- Main ---

if __name__ == "__main__":
    init_db()
    print(f"Tarot de Thoth - Ponte Local")
    print(f"Porta: {BRIDGE_PORT}")
    print(f"Conversa: {CONVERSATION_URL}")
    print(f"Origens permitidas: {ALLOWED_ORIGINS}")
    print(f"Iniciando servidor...")
    app.run(host="127.0.0.1", port=BRIDGE_PORT, debug=False, threaded=True)

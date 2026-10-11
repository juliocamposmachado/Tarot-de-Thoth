import sqlite3
import json
import os
from datetime import datetime
from typing import Optional


DB_PATH = os.path.join(os.path.dirname(os.path.abspath(__file__)), "readings.db")


def get_connection():
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn


def init_db():
    conn = get_connection()
    conn.execute(
        """
        CREATE TABLE IF NOT EXISTS readings (
            id TEXT PRIMARY KEY,
            created_at TEXT NOT NULL,
            question TEXT NOT NULL,
            reading_type TEXT NOT NULL,
            cards_json TEXT NOT NULL,
            prompt TEXT NOT NULL,
            response TEXT,
            status TEXT NOT NULL DEFAULT 'queued',
            error TEXT,
            consulente_name TEXT,
            birth_date TEXT
        )
        """
    )
    conn.commit()
    conn.close()


def create_reading(reading_id: str, question: str, reading_type: str,
                   cards: list, prompt: str, consulente_name: str = "",
                   birth_date: str = ""):
    conn = get_connection()
    conn.execute(
        """INSERT INTO readings
           (id, created_at, question, reading_type, cards_json, prompt,
            status, consulente_name, birth_date)
           VALUES (?, ?, ?, ?, ?, ?, 'queued', ?, ?)""",
        (reading_id, datetime.now().isoformat(), question, reading_type,
         json.dumps(cards), prompt, consulente_name, birth_date)
    )
    conn.commit()
    conn.close()


def update_reading(reading_id: str, status: str, response: str = None,
                   error: str = None):
    conn = get_connection()
    if response is not None:
        conn.execute(
            "UPDATE readings SET status = ?, response = ? WHERE id = ?",
            (status, response, reading_id)
        )
    elif error is not None:
        conn.execute(
            "UPDATE readings SET status = ?, error = ? WHERE id = ?",
            (status, error, reading_id)
        )
    else:
        conn.execute(
            "UPDATE readings SET status = ? WHERE id = ?",
            (status, reading_id)
        )
    conn.commit()
    conn.close()


def get_reading(reading_id: str) -> Optional[dict]:
    conn = get_connection()
    row = conn.execute(
        "SELECT * FROM readings WHERE id = ?", (reading_id,)
    ).fetchone()
    conn.close()
    if not row:
        return None
    result = dict(row)
    result["cards"] = json.loads(result.pop("cards_json"))
    return result


def list_readings(limit: int = 50, offset: int = 0) -> list:
    conn = get_connection()
    rows = conn.execute(
        "SELECT * FROM readings ORDER BY created_at DESC LIMIT ? OFFSET ?",
        (limit, offset)
    ).fetchall()
    conn.close()
    results = []
    for row in rows:
        item = dict(row)
        item["cards"] = json.loads(item.pop("cards_json"))
        results.append(item)
    return results

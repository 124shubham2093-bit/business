import sqlite3
import os

from app.config.settings import settings

def enable_wal():
    db_path = settings.get_cognee_db_path()
    if not os.path.exists(db_path):
        print(f"[-] Database not found at {db_path}")
        return
    try:
        conn = sqlite3.connect(db_path)
        cursor = conn.cursor()
        cursor.execute("PRAGMA journal_mode=WAL;")
        res = cursor.fetchone()
        print(f"[+] WAL status: {res[0] if res else 'Unknown'}")
        conn.commit()
        conn.close()
        print("[+] Successfully enabled WAL mode on Cognee SQLite database.")
    except Exception as e:
        print("[-] Error enabling WAL:", e)

if __name__ == "__main__":
    enable_wal()

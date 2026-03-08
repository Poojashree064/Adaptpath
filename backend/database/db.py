import sqlite3

conn = sqlite3.connect("diagnostic.db", check_same_thread=False)
cursor = conn.cursor()

cursor.execute("""
CREATE TABLE IF NOT EXISTS diagnostic_results (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    weak_areas TEXT,
    strong_areas TEXT,
    learning_style TEXT,
    learning_speed TEXT,
    best_study_time TEXT,
    summary TEXT
)
""")

conn.commit()

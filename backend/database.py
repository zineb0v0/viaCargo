import psycopg2
from psycopg2.extras import RealDictCursor
from config import Config

def get_connection():
    return psycopg2.connect(
        host=Config.DB_HOST,
        user=Config.DB_USER,
        password=Config.DB_PASSWORD,
        dbname=Config.DB_NAME,
        port=Config.DB_PORT,
        cursor_factory=RealDictCursor
    )

def query(sql, params=None, fetch=False):
    conn = get_connection()
    cur = conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor)

    cur.execute(sql, params)

    data = None
    if fetch:
        data = cur.fetchall()

    conn.commit()
    cur.close()
    conn.close()

    return data

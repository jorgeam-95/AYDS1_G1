import psycopg2
from dotenv import load_dotenv
import os

load_dotenv()

def get_connection():
    return psycopg2.connect(os.getenv("DATABASE_URL"))

conn = get_connection()
cursor = conn.cursor()

cursor.execute("SELECT * FROM usuarios")
print(cursor.fetchall())

cursor.close()
conn.close()
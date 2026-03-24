import psycopg2

DATABASE_URL = "postgresql://neondb_owner:npg_ZRqksrybx3a2@ep-super-forest-adq4q8j9-pooler.c-2.us-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require"

conexion = psycopg2.connect(DATABASE_URL)

cursor = conexion.cursor()

print("Conectado a PostgreSQL en Neon")
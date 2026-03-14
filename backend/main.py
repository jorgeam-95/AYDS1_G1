from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from connexion.config import get_connection

from db import Base, engine
import models
from auth import router as auth_router
import bcrypt

from model.ladmin import Ladmin
from model.LoginUser import LoginUser

app = FastAPI(title="AYDS1 Backend")

Base.metadata.create_all(bind=engine)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth_router)


@app.get("/")
def root():
    return {"message": "Backend funcionando correctamente"}

@app.post("/login/admin")
def login_admin(datos: Ladmin):

    conn = get_connection()
    cursor = conn.cursor()

    query = """
    SELECT correo, password_hash
    FROM usuarios 
    WHERE correo = %s AND role_id = 1
    """

    cursor.execute(query, (datos.correo,))
    admin = cursor.fetchone()

    cursor.close()
    conn.close()

    if not admin:
        raise HTTPException(status_code=401, detail="Administrador no encontrado")

    if bcrypt.checkpw(datos.contrasena.encode(), admin[1].encode()):
        return JSONResponse(
            status_code=200,
            content={"mensaje": "Login correcto"}
        )
    else:
        raise HTTPException(status_code=401, detail="Contraseña incorrecta")

@app.get("/admin/medicos/pendientes")
def obtener_medicos_pendientes():

    conn = get_connection()
    cursor = conn.cursor()

    query = """
    SELECT m.nombre, m.apellido, m.dpi, m.fecha_nacimiento, m.genero, m.direccion,
           m.telefono, m.fotografia, m.numero_colegiado, m.especialidad, m.correo, m.fecha_registro
    FROM medicos m
    WHERE m.aprobado = false
    """

    cursor.execute(query)
    medicos = cursor.fetchall()

    cursor.close()
    conn.close()

    resultado = []
    for m in medicos:
        resultado.append({
            "nombre": m[0],
            "apellido": m[1],
            "dpi": m[2],
            "fecha_nacimiento": m[3],
            "genero": m[4],
            "direccion": m[5],
            "telefono": m[6],
            "fotografia":m[7],
            "numero_colegiado":m[8],
            "especialidad":m[9],
            "correo":m[10],
            "fecha_registro":m[11]
        })

    return resultado

@app.get("/admin/pacientes/pendientes")
def obtener_pacientes_pendientes():

    conn = get_connection()
    cursor = conn.cursor()

    query = """
    SELECT p.nombre, p.apellido, p.dpi, p.genero, p.direccion,
           p.telefono, p.fecha_nacimiento, p.fotografia, p.correo
    FROM patients p
    WHERE p.aprobado = false
    """

    cursor.execute(query)
    medicos = cursor.fetchall()

    cursor.close()
    conn.close()

    resultado = []
    for m in medicos:
        resultado.append({
            "nombre": m[0],
            "apellido": m[1],
            "dpi": m[2],
            "genero": m[3],
            "direccion": m[4],   
            "telefono": m[5],      
            "fecha_nacimiento": m[6],
            "fotografia":m[7],
            "correo":m[8],
        })

    return resultado


@app.post("/login")
def login_usuario(datos: LoginUser):

    conn = get_connection()
    cursor = conn.cursor()

    query = """"""

    if (datos.tipo == "medico"):
        query = """
                SELECT correo, password_hash, aprobado, activo
                FROM medicos 
                WHERE correo = %s
                """
    else:
         query = """
                SELECT correo, password_hash, aprobado, activo
                FROM patients 
                WHERE correo = %s
                """

    cursor.execute(query, (datos.correo,))
    usuario = cursor.fetchone()

    cursor.close()
    conn.close()

    if not usuario:
        raise HTTPException(status_code=401, detail="Usuario no encontrado")

    if bcrypt.checkpw(datos.contrasena.encode(), usuario[1].encode()):
        return JSONResponse(
            status_code=200,
            content={"mensaje": "Login correcto",
                     "aprobado": usuario[2],
                     "activo": usuario[3]}
        )
    else:
        raise HTTPException(status_code=401, detail="Contraseña incorrecta")
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from connexion.config import get_connection

from db import Base, engine
import bcrypt
from Security.security import hash_password, verify_password

from model.ladmin import Ladmin
from model.LoginUser import LoginUser
from model.AceptarUsuario import AceptarUsuario
from model.AdminFileEcnript import TxtEccript
from model.RegistroPaciente import PatientCreate
from model.RegistroMedico import MedicoCreate

app = FastAPI(title="AYDS1 Backend")

Base.metadata.create_all(bind=engine)

origins = [
    "http://localhost:5173",
    "http://127.0.0.1:5173"
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

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

@app.post("/login/admin/file/encript")
def fileencript( datos: TxtEccript ):

    if datos.passwordEncript == "82a79f11b4acb52a642ef7e339dfce4aa92ff65ed2e7ab702d798dbe10eca0b8":
         return JSONResponse(
            status_code=200,
            content={"mensaje": "Archivo Correcto!!"}
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
    

@app.post("/admin/aprobar/usuario")
def aceptar_usuario(datos: AceptarUsuario):

    try:
        conn = get_connection()
        cursor = conn.cursor()

        query = """"""

        if (datos.tipo == "medico"):
            query = """
                    UPDATE medicos
                    SET aprobado = true
                    WHERE dpi = %s
                    """
        else:
            query = """
                    UPDATE patients
                    SET aprobado = true
                    WHERE dpi = %s
                    """
            
        cursor.execute(query, (datos.dpi,))
        conn.commit()

        if cursor.rowcount == 0:
            raise HTTPException(status_code=404, detail="Usuario no encontrado")
        
        return JSONResponse(
                status_code=200,
                content={"Resultado": "Usuario Activado con exito",}
            )
    
    finally:
        cursor.execute(query, (datos.dpi,))
        conn.commit()

@app.post("/api/auth/register-patient")
def register_patient(patient: PatientCreate):

    try:
        conn = get_connection()
        cursor = conn.cursor()

        cursor.execute("SELECT id FROM patients WHERE correo = %s", (patient.correo,))
        if cursor.fetchone():
            raise HTTPException(status_code=400, detail="El correo ya está registrado")

        cursor.execute("SELECT id FROM patients WHERE dpi = %s", (patient.dpi,))
        if cursor.fetchone():
            raise HTTPException(status_code=400, detail="El DPI ya está registrado")

        hashed_password = hash_password(patient.password)

        cursor.execute("""
            INSERT INTO patients 
            (nombre, apellido, dpi, genero, direccion, telefono, fecha_nacimiento, fotografia, correo, password_hash, aprobado, activo)
            VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
            RETURNING id;
        """, (
            patient.nombre,
            patient.apellido,
            patient.dpi,
            patient.genero,
            patient.direccion,
            patient.telefono,
            patient.fecha_nacimiento,
            patient.fotografia,
            patient.correo,
            hashed_password,
            False,  
            True    
        ))

        new_id = cursor.fetchone()[0]

        conn.commit()
        cursor.close()
        conn.close()

        return {
            "message": "Paciente registrado correctamente",
            "id": new_id,
            "aprobado": False,
            "activo": True
        }

    except psycopg2.Error as e:
        raise HTTPException(status_code=500, detail=str(e))
    

@app.post("/api/auth/register-medico")
def register_medico(medico: MedicoCreate):

    try:
        conn = get_connection()
        cursor = conn.cursor()

        cursor.execute("SELECT id FROM medicos WHERE correo = %s", (medico.correo,))
        if cursor.fetchone():
            raise HTTPException(status_code=400, detail="El correo ya está registrado")
          
        cursor.execute("SELECT id FROM medicos WHERE dpi = %s", (medico.dpi,))
        if cursor.fetchone():
            raise HTTPException(status_code=400, detail="El DPI ya está registrado")
                
        cursor.execute("SELECT id FROM medicos WHERE numero_colegiado = %s", (medico.numero_colegiado,))
        if cursor.fetchone():
            raise HTTPException(status_code=400, detail="El número colegiado ya está registrado")

        hashed_password = hash_password(medico.password)

        cursor.execute("""
            INSERT INTO medicos 
            (nombre, apellido, dpi, fecha_nacimiento, genero, direccion, telefono, fotografia,
             numero_colegiado, especialidad, direccion_clinica, correo, password_hash, aprobado, activo)
            VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
            RETURNING id;
        """, (
            medico.nombre,
            medico.apellido,
            medico.dpi,
            medico.fecha_nacimiento,
            medico.genero,
            medico.direccion,
            medico.telefono,
            medico.fotografia,
            medico.numero_colegiado,
            medico.especialidad,
            medico.direccion_clinica,
            medico.correo,
            hashed_password,
            False,  
            True    
        ))

        new_id = cursor.fetchone()[0]

        conn.commit()
        cursor.close()
        conn.close()

        return {
            "message": "Médico registrado correctamente",
            "id": new_id,
            "aprobado": False,
            "activo": True
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
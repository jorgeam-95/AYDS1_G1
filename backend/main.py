from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from connexion.config import get_connection
from psycopg2.extras import execute_values

from db import Base, engine
import bcrypt
from Security.security import hash_password, verify_password
from Security.token_jwt import crear_token

from model.ladmin import Ladmin
from model.LoginUser import LoginUser
from model.AceptarUsuario import AceptarUsuario
from model.AdminFileEcnript import TxtEccript
from model.RegistroPaciente import PatientCreate
from model.RegistroMedico import MedicoCreate
from model.RegistroHorarios import RegistroHorario
from model.Idmedico import IdMedico
from model.AgendarCita import AgendarCita
from model.RecetaRequest import RecetaRequest
from model.CancelarCitaRequest import CancelarCitaRequest
from auth import enviar_correo_verificacion
import secrets
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
import os

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
        token = crear_token ( {
            "user" : "administrador",
            "rol" : "admin"
        } ) 

        return JSONResponse(
            status_code=200,
            content={
                "mensaje": "Login correcto",
                "acces_token" : token,
                "rol" : "admin"
                }
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
def login_usuario(datos: LoginUser, token_ingresado: str = None):

    conn = get_connection()
    cursor = conn.cursor()

    querymedicos = """SELECT correo, password_hash, aprobado, activo
                FROM medicos 
                WHERE correo = %s"""
    
    querypacientes = """SELECT correo, password_hash, aprobado, es_verificado 
                FROM patients 
                WHERE correo = %s"""

    cursor.execute(querymedicos, (datos.correo,))
    usuariomedicos = cursor.fetchone()
    cursor.execute(querypacientes, (datos.correo,))
    usuariopacientes = cursor.fetchone()

    cursor.close()
    conn.close()

    if (not usuariomedicos) and (not usuariopacientes):
        raise HTTPException(status_code=401, detail="Usuario no encontrado")

    if (usuariomedicos):
        if bcrypt.checkpw(datos.contrasena.encode(), usuariomedicos[1].encode()):
            token = crear_token ( {
                "user" : usuariomedicos[0],
                "rol" : "medico",
                "aprobado" : usuariomedicos[2],
                "activo" : usuariomedicos[3]
            } ) 

            return JSONResponse(
                status_code=200,
                content={"mensaje": "Login correcto",
                        "acces_token" : token,
                        "rol" : "medico"}
        )
        else:
            raise HTTPException(status_code=401, detail="Contraseña incorrecta")

    if (usuariopacientes):
        if bcrypt.checkpw(datos.contrasena.encode(), usuariopacientes[1].encode()):
                
                if not usuariopacientes[2]: 
                    raise HTTPException(status_code=403, detail="Tu cuenta está pendiente de aprobación por el administrador")
        
                # Validación de Token/Verificación (401)
                if not usuariopacientes[3]: # Ahora usuariopacientes[3] es 'es_verificado'
                    raise HTTPException(status_code=401, detail="Debes verificar tu cuenta con el código enviado a tu correo")
                
                token = crear_token ( {
                    "user": usuariopacientes[0],
                    "rol": "paciente"
                } ) 

                return JSONResponse(
                    status_code=200,
                    content={"mensaje": "Login correcto",
                            "acces_token" : token,
                            "rol" : "paciente"}
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
                    WHERE correo = %s
                    """
        else:
            query = """
                    UPDATE patients
                    SET aprobado = true
                    WHERE correo = %s
                    """
            
        cursor.execute(query, (datos.correo,))
        conn.commit()

        if cursor.rowcount == 0:
            raise HTTPException(status_code=404, detail="Usuario no encontrado")
        
        return JSONResponse(
                status_code=200,
                content={"Resultado": "Usuario Activado con exito",}
            )
    finally:
        cursor.close()
        conn.close()

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
        token_val = secrets.token_hex(3).upper()

        cursor.execute("""
            INSERT INTO patients 
            (nombre, apellido, dpi, genero, direccion, telefono, fecha_nacimiento, fotografia, correo, password_hash, aprobado, activo, token_validacion, es_verificado)
            VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
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
            False,     # aprobado
            True,      # activo
            token_val, # token_validacion
            False      # es_verificado 
        ))

        new_id = cursor.fetchone()[0]

        conn.commit()
        enviar_correo_verificacion(patient.correo, token_val)

        return {
            "message": "Paciente registrado correctamente. Se ha enviado un token a su correo.",
            "id": new_id,
            "aprobado": False,
            "es_verificado": False
        }

    except Exception as e:
        if conn: conn.rollback()
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        if cursor: cursor.close()
        if conn: conn.close()
    

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


@app.post("/medico/registrar/horario")
def registerhorario(registrohorario: RegistroHorario):
    try:
        conn = get_connection()
        cursor = conn.cursor()

        cursor.execute(
            "SELECT dpi FROM medicos WHERE correo = %s",
            (registrohorario.correo,)
        )
        result = cursor.fetchone()
        if not result:
            raise HTTPException(
                status_code=404,
                detail="Médico no encontrado"
            )
        dpi = result[0]

        query = """ 
        INSERT INTO horarios_medico(dpi, dia_semana, hora_inicio, hora_fin)
        VALUES %s
        ON CONFLICT DO NOTHING;"""

        valores = [
            (dpi, dia, registrohorario.hora_inicio, registrohorario.hora_fin )
            for dia in registrohorario.dias_semana
        ]

        execute_values(cursor, query, valores)
        conn.commit()
        cursor.close()
        conn.close()

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    
@app.post("/medico/get/horario")
def gethorarios(correo: AceptarUsuario):
    try:
        conn = get_connection()
        cursor = conn.cursor()

        # Obtener el DPI del médico
        cursor.execute(
            "SELECT dpi FROM medicos WHERE correo = %s",
            (correo.correo,)
        )
        result = cursor.fetchone()

        if not result:
            raise HTTPException(
                status_code=404,
                detail="Médico no encontrado"
            )

        dpi = result[0]

        # Consulta para obtener los horarios agrupados
        query = """
        SELECT 
            hora_inicio,
            hora_fin,
            ARRAY_AGG(dia_semana ORDER BY dia_semana) AS dias_semana
        FROM horarios_medico
        WHERE dpi = %s
        GROUP BY hora_inicio, hora_fin
        ORDER BY hora_inicio;
        """

        cursor.execute(query, (dpi,))
        horarios = cursor.fetchall()

        cursor.close()
        conn.close()
        
        resultado = []
        for h in horarios:
            resultado.append({
                "hora_inicio": h[0].strftime("%H:%M"),
                "hora_fin": h[1].strftime("%H:%M"),
                "dias_semana": h[2],
            })

        return resultado

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    
@app.get("/paciente/get/horarios/medicos")
def obtener_pacientes_pendientes():

    conn = get_connection()
    cursor = conn.cursor()

    query = """
    SELECT DISTINCT
        m.id,
        m.nombre,
        m.apellido,
        m.especialidad,
        m.direccion_clinica,
        m.fotografia,
        m.correo
    FROM medicos m
    INNER JOIN horarios_medico h 
        ON m.dpi = h.dpi
    WHERE m.aprobado = TRUE
    AND m.activo = TRUE
    ORDER BY m.nombre, m.apellido;
    """

    cursor.execute(query)
    medicos = cursor.fetchall()

    cursor.close()
    conn.close()

    resultado = []
    for m in medicos:
        resultado.append({
            "id": m[0],
            "nombre": m[1],
            "apellido": m[2],
            "especialidad": m[3],   
            "direccion_clinica": m[4],      
            "fotografia": m[5],
            "correo": m[6],
        })

    return resultado

@app.post("/paciente/citas/agendar")
def agendar_cita(data: AgendarCita):
    try:
        conn = get_connection()
        cursor = conn.cursor()

        cursor.execute(
            "SELECT id FROM patients WHERE correo = %s",
            (data.paciente_correo,)
        )
        paciente = cursor.fetchone()
        if not paciente:
            raise HTTPException(status_code=404, detail="Paciente no encontrado")
        paciente_id = paciente[0]

        cursor.execute(
            "SELECT id FROM medicos WHERE correo = %s",
            (data.medico_correo,)
        )
        medico = cursor.fetchone()
        if not medico:
            raise HTTPException(status_code=404, detail="Médico no encontrado")
        medico_id = medico[0]

        cursor.execute("""
            SELECT 1 FROM citas
            WHERE medico_id = %s AND fecha = %s AND hora = %s
        """, (medico_id, data.fecha, data.hora))

        if cursor.fetchone():
            raise HTTPException(
                status_code=400,
                detail="Este horario ya no está disponible"
            )

        cursor.execute("""
            INSERT INTO citas (usuario_id, medico_id, fecha, hora, estado_id)
            VALUES (%s, %s, %s, %s, 1)
            RETURNING id
        """, (
            paciente_id,
            medico_id,
            data.fecha,
            data.hora,
        ))

        cita_id = cursor.fetchone()[0]
        conn.commit()

        cursor.close()
        conn.close()

        return {
            "mensaje": "Cita agendada correctamente",
            "cita_id": cita_id
        }

    except Exception as e:
        print(e)
        raise HTTPException(status_code=500, detail=str(e))
    

@app.post("/paciente/get/horario")
def getCitasPaciente(data: AceptarUsuario):
    try:
        conn = get_connection()
        cursor = conn.cursor()

        cursor.execute("SELECT id FROM patients WHERE correo = %s",(data.correo,))
        paciente = cursor.fetchone()
        if not paciente:
            raise HTTPException(status_code=404, detail="Paciente no encontrado")
        paciente_id = paciente[0]

        cursor.execute("""
                        SELECT 
                            c.id,
                            c.fecha,
                            c.hora,
                            ec.nombre AS estado,
                            m.nombre,
                            m.apellido,
                            m.especialidad,
                            m.direccion_clinica
                        FROM citas c
                        INNER JOIN estados_cita ec ON c.estado_id = ec.id
                        INNER JOIN medicos m ON c.medico_id = m.id
                        WHERE c.usuario_id = %s and ec.nombre = 'pendiente'
                    """, (paciente_id,))

        citas = cursor.fetchall()

        cursor.close()
        conn.close()

        resultado = []
        for c in citas:
            resultado.append({
                "id" : c[0],
                "fecha": c[1],
                "hora": c[2],
                "estado": c[3],
                "medico_nombre": c[4],   
                "medico_apellido": c[5],      
                "especialidad": c[6],
                "direccion_clinica": c[7],
            })
        return resultado

    except Exception as e:
        print(e)
        raise HTTPException(status_code=500, detail=str(e))
    

@app.post("/medico/get/citas")
def getCitasMedicos(data: AceptarUsuario):
    try:
        conn = get_connection()
        cursor = conn.cursor()

        cursor.execute("SELECT id FROM medicos WHERE correo = %s",(data.correo,))
        paciente = cursor.fetchone()
        if not paciente:
            raise HTTPException(status_code=404, detail="Paciente no encontrado")
        paciente_id = paciente[0]

        cursor.execute("""
                        SELECT 
                            c.id,
                            c.fecha,
                            c.hora,
                            ec.nombre AS estado,
                            m.nombre,
                            m.apellido,
                            m.especialidad,
                            m.direccion_clinica
                        FROM citas c
                        INNER JOIN estados_cita ec ON c.estado_id = ec.id
                        INNER JOIN medicos m ON c.medico_id = m.id
                        WHERE c.usuario_id = %s AND ec.nombre = 'pendiente' 
                    """, (paciente_id,))

        citas = cursor.fetchall()

        cursor.close()
        conn.close()

        resultado = []
        for c in citas:
            resultado.append({
                "id" : c[0],
                "fecha": c[1],
                "hora": c[2],
                "estado": c[3],
                "paciente_nombre": c[4],   
                "paciente_apellido": c[5],      
                "especialidad": c[6],
                "direccion_clinica": c[7],
            })
        return resultado

    except Exception as e:
        print(e)
        raise HTTPException(status_code=500, detail=str(e))
    

@app.post("/medico/recetas/registrar")
def registrar_receta(data: RecetaRequest):
    try:
        conn = get_connection()
        cursor = conn.cursor()

        cursor.execute("""
            INSERT INTO recetas (cita_id, observaciones)
            VALUES (%s, %s)
            RETURNING id
        """, (data.cita_id, data.observaciones))

        receta_id = cursor.fetchone()[0]

        for detalle in data.detalles:
            cursor.execute("""
                INSERT INTO receta_detalle (
                    receta_id,
                    medicamento,
                    dosis,
                    indicaciones
                )
                VALUES (%s, %s, %s, %s)
            """, (
                receta_id,
                detalle.medicamento,
                detalle.dosis,
                detalle.indicaciones
            ))

        cursor.execute("""
            UPDATE citas
            SET estado_id = (
                SELECT id FROM estados_cita
                WHERE LOWER(nombre) = 'completada'
            )
            WHERE id = %s
        """, (data.cita_id,))

        conn.commit()
        cursor.close()
        conn.close()

        return {"mensaje": "Receta registrada correctamente"}

    except Exception as e:
        print(e)
        raise HTTPException(status_code=500, detail=str(e))
    

@app.post("/medico/citas/cancelar")
def cancelar_cita(data: CancelarCitaRequest):
    try:
        conn = get_connection()
        cursor = conn.cursor()

        cursor.execute(
            "SELECT id FROM citas WHERE id = %s",
            (data.cita_id,)
        )
        cita = cursor.fetchone()

        if not cita:
            raise HTTPException(
                status_code=404,
                detail="La cita no existe"
            )

        # Obtener el estado "cancelada"
        cursor.execute(
            "SELECT id FROM estados_cita WHERE LOWER(nombre) = 'cancelada'"
        )
        estado = cursor.fetchone()

        if not estado:
            raise HTTPException(
                status_code=404,
                detail="El estado 'cancelada' no está registrado"
            )

        estado_id = estado[0]

        cursor.execute("""
            UPDATE citas
            SET estado_id = %s,
                motivo_cancelacion = %s
            WHERE id = %s
        """, (
            estado_id,
            data.motivo_cancelacion,
            data.cita_id
        ))

        conn.commit()
        cursor.close()
        conn.close()

        return {"mensaje": "Cita cancelada correctamente"}

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    

@app.post("/medico/get/historial-citas")
def obtener_historial_citas(data: AceptarUsuario):
    try:
        conn = get_connection()
        cursor = conn.cursor()

        print(data.correo);

        cursor.execute(
            "SELECT id FROM medicos WHERE correo = %s",
            (data.correo,)
        )
        medico = cursor.fetchone()

        if not medico:
            raise HTTPException(
                status_code=404,
                detail="Médico no encontrado"
            )

        medico_id = medico[0]
        print(medico_id)

        query = """
        SELECT 
        c.id,
        p.nombre,
        p.apellido,
        c.fecha,
        c.hora,
        CASE 
            WHEN LOWER(ec.nombre) = 'completada' THEN 'Atendida'
            ELSE ec.nombre
        END AS estado,
        c.motivo_cancelacion,
        r.observaciones,
        COALESCE(
            json_agg(
                json_build_object(
                    'medicamento', rd.medicamento,
                    'dosis', rd.dosis,
                    'indicaciones', rd.indicaciones
                )
            ) FILTER (WHERE rd.id IS NOT NULL),
            '[]'
        ) AS detalles
        FROM citas c
        INNER JOIN patients p ON c.usuario_id = p.id
        INNER JOIN estados_cita ec ON c.estado_id = ec.id
        LEFT JOIN recetas r ON r.cita_id = c.id
        LEFT JOIN receta_detalle rd ON rd.receta_id = r.id
        WHERE c.medico_id = %s
        GROUP BY 
            c.id,
            p.nombre,
            p.apellido,
            c.fecha,
            c.hora,
            ec.nombre,
            c.motivo_cancelacion,
            r.observaciones
        ORDER BY c.fecha DESC, c.hora DESC;
        """

        cursor.execute(query, (medico_id,))
        citas = cursor.fetchall()

        cursor.close()
        conn.close()

        resultado = []
        for cita in citas:
            resultado.append({
                "id": cita[0],
                "paciente_nombre": cita[1],
                "paciente_apellido": cita[2],
                "fecha": cita[3].isoformat(),
                "hora": str(cita[4]),
                "estado": cita[5],
                "motivo_cancelacion": cita[6],
                "observaciones": cita[7],
                "detalles": cita[8] if cita[8] else []
            })

        return resultado

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    

@app.post("/paciente/get/historial-citas")
def obtener_historial_citas_paciente(data: AceptarUsuario):
    try:
        conn = get_connection()
        cursor = conn.cursor()

        cursor.execute(
            "SELECT id FROM patients WHERE correo = %s",
            (data.correo,)
        )
        paciente = cursor.fetchone()

        if not paciente:
            raise HTTPException(
                status_code=404,
                detail="Paciente no encontrado"
            )

        paciente_id = paciente[0]

        query = """
            SELECT 
            c.id,
            m.nombre,
            m.apellido,
            c.fecha,
            c.hora,
            CASE 
                WHEN LOWER(ec.nombre) = 'completada' THEN 'Atendida'
                ELSE ec.nombre
            END AS estado,
            c.motivo_cancelacion,
            r.observaciones,
            COALESCE(
                json_agg(
                    json_build_object(
                        'medicamento', rd.medicamento,
                        'dosis', rd.dosis,
                        'indicaciones', rd.indicaciones
                    )
                ) FILTER (WHERE rd.id IS NOT NULL),
                '[]'
            ) AS detalles
            FROM citas c
            INNER JOIN medicos m ON c.medico_id = m.id
            INNER JOIN estados_cita ec ON c.estado_id = ec.id
            LEFT JOIN recetas r ON r.cita_id = c.id
            LEFT JOIN receta_detalle rd ON rd.receta_id = r.id
            WHERE c.usuario_id = %s
            AND LOWER(ec.nombre) IN ('completada', 'cancelada')
            GROUP BY 
                c.id,
                m.nombre,
                m.apellido,
                c.fecha,
                c.hora,
                ec.nombre,
                c.motivo_cancelacion,
                r.observaciones
            ORDER BY c.fecha DESC, c.hora DESC;
        """

        cursor.execute(query, (paciente_id,))
        citas = cursor.fetchall()

        resultado = []
        for cita in citas:
            resultado.append({
                "id": cita[0],
                "medico_nombre": cita[1],
                "medico_apellido": cita[2],
                "fecha": cita[3].isoformat(),
                "hora": str(cita[4]),
                "estado": cita[5],
                "motivo_cancelacion": cita[6],
                "observaciones": cita[7],
                "detalles": cita[8] if cita[8] else []
            })

        cursor.close()
        conn.close()

        return resultado

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    
@app.post("/api/auth/verify-token")
def verificar_token(correo: str, token_ingresado: str):
    conn = get_connection()
    cursor = conn.cursor()
    
    # Buscamos al usuario y su token
    cursor.execute("SELECT token_validacion FROM patients WHERE correo = %s", (correo,))
    resultado = cursor.fetchone()
    
    if not resultado or resultado[0] != token_ingresado:
        cursor.close()
        conn.close()
        raise HTTPException(status_code=400, detail="Token incorrecto o expirado")
    
    # Si es correcto, lo marcamos como verificado
    cursor.execute("UPDATE patients SET es_verificado = TRUE WHERE correo = %s", (correo,))
    conn.commit()
    cursor.close()
    conn.close()
    
    return {"message": "Cuenta verificada con éxito. Ahora espera la aprobación del admin."}
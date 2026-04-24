from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from backend.Security.security import verify_password
from db import get_db
from models import Patient
from schemas import PatientRegister
from backend.Security.security import hash_password
import secrets
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart

router = APIRouter(prefix="/api/auth", tags=["Auth"])


@router.post("/register-patient", status_code=status.HTTP_201_CREATED)
def register_patient(data: PatientRegister, db: Session = Depends(get_db)):
    Texisting_email = db.query(Patient).filter(Patient.correo == data.correo).first()
    if Texisting_email:
        raise HTTPException(status_code=400, detail="El correo ya está registrado")

    existing_dpi = db.query(Patient).filter(Patient.dpi == data.dpi).first()
    if existing_dpi:
        raise HTTPException(status_code=400, detail="El DPI ya está registrado")

    password_hashed = hash_password(data.password)
    token_generado = secrets.token_hex(3).upper() # Crea algo como 'A1B2C3'

    new_patient = Patient(
        nombre=data.nombre,
        apellido=data.apellido,
        dpi=data.dpi,
        genero=data.genero,
        direccion=data.direccion,
        telefono=data.telefono,
        fecha_nacimiento=data.fecha_nacimiento,
        fotografia=data.fotografia,
        correo=data.correo,
        password_hash=password_hashed,
        token_validacion=token_generado,
        aprobado=False,
        activo=True
    )

    db.add(new_patient)
    db.commit()
    db.refresh(new_patient)

    enviar_correo_verificacion(data.correo, token_generado)

    return {
        "message": "Paciente registrado correctamente",
        "patient": {
            "id": new_patient.id,
            "nombre": new_patient.nombre,
            "apellido": new_patient.apellido,
            "correo": new_patient.correo,
            "aprobado": new_patient.aprobado,
            "activo": new_patient.activo
        }
    }

@router.post("/login")
def login(correo: str, password: str, token_ingresado: str = None, db: Session = Depends(get_db)):

    patient = db.query(Patient).filter(Patient.correo == correo).first()

   # Validación 1: Credenciales básicas
    if not patient or not verify_password(password, patient.password_hash):
        raise HTTPException(status_code=401, detail="Credenciales incorrectas")

    # TAREA 4: Validación de Aprobación del Administrador
    if not patient.es_aprobado:
        raise HTTPException(status_code=403, detail="Tu cuenta aún no ha sido aprobada por el administrador")

    # TAREA 3: Validación de Token (Primer inicio de sesión)
    if not patient.es_verificado:
        if not token_ingresado:
            raise HTTPException(status_code=400, detail="Se requiere el token de verificación para el primer inicio de sesión")
        
        if token_ingresado != patient.token_validacion:
            raise HTTPException(status_code=400, detail="El token de verificación es incorrecto")
        
        # Si el token es correcto, marcamos como verificado para siempre
        patient.es_verificado = True
        db.commit()

    return {
        "message": "Login exitoso",
        "user": {"id": patient.id, "nombre": patient.nombre, "correo": patient.correo}
    }

def enviar_correo_verificacion(destinatario, token):
    remitente = "saludplus_oficial@tudominio.com"
    password_app = "tu_password_de_aplicacion" # Usa variables de entorno (.env)

    msg = MIMEMultipart()
    msg['From'] = f"Salud Plus <{remitente}>"
    msg['To'] = destinatario
    msg['Subject'] = "Verifica tu cuenta - Salud Plus"

    html = f"""
    <html>
        <body>
            <img src="URL_DE_TU_LOGO" width="150" alt="Salud Plus Logo">
            <h2>¡Bienvenido a Salud Plus!</h2>
            <p>Para completar tu registro, utiliza el siguiente token en tu primer inicio de sesión:</p>
            <h1 style="color: #2c3e50;">{token}</h1>
            <p><b>Instrucciones:</b> Ingresa a la plataforma, coloca tus credenciales y pega este código cuando se te solicite.</p>
        </body>
    </html>
    """
    msg.attach(MIMEText(html, 'html'))

    # Configuración SMTP (Ejemplo con Gmail)
    with smtplib.SMTP_SSL('smtp.gmail.com', 465) as server:
        server.login(remitente, password_app)
        server.send_message(msg)
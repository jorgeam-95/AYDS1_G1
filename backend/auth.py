from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from backend.Security.security import verify_password
from db import get_db
from models import Patient
from schemas import PatientRegister
from backend.Security.security import hash_password

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
        aprobado=False,
        activo=True
    )

    db.add(new_patient)
    db.commit()
    db.refresh(new_patient)

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
def login(correo: str, password: str, db: Session = Depends(get_db)):

    patient = db.query(Patient).filter(Patient.correo == correo).first()

    if not patient:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Credenciales incorrectas"
        )

    if not verify_password(password, patient.password_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Credenciales incorrectas"
        )

    return {
        "message": "Login exitoso",
        "patient": {
            "id": patient.id,
            "nombre": patient.nombre,
            "apellido": patient.apellido,
            "correo": patient.correo
        }
    }
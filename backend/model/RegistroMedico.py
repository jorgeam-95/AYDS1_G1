from pydantic import BaseModel, EmailStr
from datetime import date
from typing import Optional

class MedicoCreate(BaseModel):
    nombre: str
    apellido: str
    dpi: str
    fecha_nacimiento: date
    genero: str
    direccion: str
    telefono: str
    fotografia: Optional[str] = None
    numero_colegiado: str
    especialidad: str
    direccion_clinica: str
    correo: EmailStr
    password: str
    cv_pdf: Optional[str] = None
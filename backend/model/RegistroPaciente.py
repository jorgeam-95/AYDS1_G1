from pydantic import BaseModel, EmailStr
from typing import Optional
from datetime import date


class PatientCreate(BaseModel):
    nombre: str
    apellido: str
    dpi: str
    genero: str
    direccion: str
    telefono: str
    fecha_nacimiento: date
    fotografia: Optional[str] = None
    correo: EmailStr
    password: str
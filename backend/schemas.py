import re
from datetime import date
from pydantic import BaseModel, EmailStr, field_validator


class PatientRegister(BaseModel):
    nombre: str
    apellido: str
    dpi: str
    genero: str
    direccion: str
    telefono: str
    fecha_nacimiento: date
    fotografia: str | None = None
    correo: EmailStr
    password: str

    @field_validator("nombre", "apellido", "genero", "direccion")
    @classmethod
    def validar_campos_texto(cls, value: str):
        if not value or not value.strip():
            raise ValueError("Este campo es obligatorio")
        return value.strip()

    @field_validator("dpi")
    @classmethod
    def validar_dpi(cls, value: str):
        if not re.fullmatch(r"\d{13}", value):
            raise ValueError("El DPI debe tener exactamente 13 dígitos")
        return value

    @field_validator("telefono")
    @classmethod
    def validar_telefono(cls, value: str):
        if not re.fullmatch(r"\d{8,15}", value):
            raise ValueError("El teléfono debe tener entre 8 y 15 dígitos")
        return value

    @field_validator("password")
    @classmethod
    def validar_password(cls, value: str):
        if len(value) < 8:
            raise ValueError("La contraseña debe tener al menos 8 caracteres")
        if not re.search(r"[A-Z]", value):
            raise ValueError("La contraseña debe contener al menos una mayúscula")
        if not re.search(r"[a-z]", value):
            raise ValueError("La contraseña debe contener al menos una minúscula")
        if not re.search(r"\d", value):
            raise ValueError("La contraseña debe contener al menos un número")

        # Validación importante para bcrypt
        if len(value.encode("utf-8")) > 72:
            raise ValueError("La contraseña no puede exceder 72 bytes para bcrypt")

        return value

    @field_validator("fecha_nacimiento")
    @classmethod
    def validar_fecha(cls, value: date):
        if value >= date.today():
            raise ValueError("La fecha de nacimiento debe ser anterior a hoy")
        return value
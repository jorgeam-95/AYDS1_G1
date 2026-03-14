from sqlalchemy import Column, Integer, String, Date, Boolean
from db import Base


class Patient(Base):
    __tablename__ = "patients"

    id = Column(Integer, primary_key=True, index=True)
    nombre = Column(String(100), nullable=False)
    apellido = Column(String(100), nullable=False)
    dpi = Column(String(13), unique=True, nullable=False, index=True)
    genero = Column(String(20), nullable=False)
    direccion = Column(String(255), nullable=False)
    telefono = Column(String(20), nullable=False)
    fecha_nacimiento = Column(Date, nullable=False)
    fotografia = Column(String(255), nullable=True)
    correo = Column(String(100), unique=True, nullable=False, index=True)
    password_hash = Column(String(255), nullable=False)
    aprobado = Column(Boolean, default=False)
    activo = Column(Boolean, default=True)
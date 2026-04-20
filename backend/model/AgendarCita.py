from pydantic import BaseModel
from datetime import date, time

class AgendarCita(BaseModel):
    paciente_correo: str
    medico_correo: str
    fecha: date
    hora: time
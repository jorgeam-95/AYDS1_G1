from pydantic import BaseModel
from datetime import time
from typing import List

class RegistroHorario(BaseModel):
    dias_semana: List[int]
    hora_inicio: time
    hora_fin: time
    correo: str
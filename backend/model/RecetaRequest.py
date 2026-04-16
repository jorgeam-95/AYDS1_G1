from pydantic import BaseModel
from typing import List
from .RecetaDetalle import RecetaDetalle

class RecetaRequest(BaseModel):
    cita_id: int
    observaciones: str
    detalles: List[RecetaDetalle]
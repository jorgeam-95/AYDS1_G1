from pydantic import BaseModel

class CancelarCitaRequest(BaseModel):
    cita_id: int
    motivo_cancelacion: str
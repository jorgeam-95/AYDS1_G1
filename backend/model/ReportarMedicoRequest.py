from pydantic import BaseModel

class ReportarMedicoRequest(BaseModel):
    cita_id: int
    correo: str
    categoria: str
    motivo: str
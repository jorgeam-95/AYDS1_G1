from pydantic import BaseModel

class ReportarPacienteRequest(BaseModel):
    cita_id: int
    motivo: str
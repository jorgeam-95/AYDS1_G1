from pydantic import BaseModel

class CalificarPacienteRequest(BaseModel):
    cita_id: int
    puntuacion: int
    comentario: str
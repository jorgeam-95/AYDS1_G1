from pydantic import BaseModel, Field

class CalificarMedicoRequest(BaseModel):
    cita_id: int
    correo: str
    estrellas: int = Field(ge=0, le=5)
    comentario: str | None = None
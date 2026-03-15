from pydantic import BaseModel

class AceptarUsuario(BaseModel):
    tipo: str
    dpi: str
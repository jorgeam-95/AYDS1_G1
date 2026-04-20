from pydantic import BaseModel

class AceptarUsuario(BaseModel):
    tipo: str
    correo: str
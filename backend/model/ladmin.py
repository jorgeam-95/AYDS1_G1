from pydantic import BaseModel

class Ladmin(BaseModel):
    correo: str
    contrasena: str
from pydantic import BaseModel

class LoginUser(BaseModel):
    correo: str
    contrasena: str
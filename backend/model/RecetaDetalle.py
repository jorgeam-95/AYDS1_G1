from pydantic import BaseModel

class RecetaDetalle(BaseModel):
    medicamento: str
    dosis: str
    indicaciones: str
    
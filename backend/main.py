from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from db import Base, engine
import models
from auth import router as auth_router

app = FastAPI(title="AYDS1 Backend")

Base.metadata.create_all(bind=engine)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth_router)


@app.get("/")
def root():
    return {"message": "Backend funcionando correctamente"}
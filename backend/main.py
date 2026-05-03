from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import models
from database import engine
from routers import users

# Create tables if they don't exist
models.Base.metadata.create_all(bind=engine)

app = FastAPI(title="Questifinal Backend")

# Middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # Update this in production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Routers
app.include_router(users.router)

@app.get("/")
def read_root():
    return {"message": "Questifinal FastAPI Backend is running"}

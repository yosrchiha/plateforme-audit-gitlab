from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.config.database import Base, engine
from app.models.user import User  # ⚠️ Important, sinon create_all ne voit pas le modèle
from app.routes import auth

# Création des tables si elles n'existent pas
print("Création des tables...")
Base.metadata.create_all(bind=engine)
print("Tables créées !")

app = FastAPI()

# Autoriser le frontend Next.js
origins = [
    "http://localhost:3000",
    "http://127.0.0.1:3000",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Inclure les routes
app.include_router(auth.router)

@app.get("/")
def root():
    return {"message": "Plateforme Audit GitLab API"}
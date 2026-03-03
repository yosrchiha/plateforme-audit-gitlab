from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.config.database import Base, engine
from app.models.user import User       # ✅ utilisateur
from app.models.depot import Depot  # ✅ dépôt  # ⚠️ Important pour create_all
from app.routes import auth,depots  # <-- ajouter repository ici


from app.config.mail import fm, MessageSchema
from fastapi_mail.errors import ConnectionErrors

# ---- Création des tables si elles n'existent pas ----
print("Création des tables...")
Base.metadata.create_all(bind=engine)
print("Tables créées !")

# ---- Application FastAPI ----
app = FastAPI(title="Plateforme Audit GitLab API")

# ---- CORS ----
origins = [
    "http://localhost:3000",
    "http://127.0.0.1:3000",
    "http://localhost:3001",
    "http://localhost:8000",
    "http://127.0.0.1:8000"  # si Next.js utilise 3001
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],   
    allow_headers=["*"],
)

# ---- Routes ----
app.include_router(auth.router)
app.include_router(depots.router)   # ✅ maintenant repository est défini

# ---- Route racine ----
@app.get("/")
def root():
    return {"message": "Plateforme Audit GitLab API"}
    

# ---- Test d'envoi d'email au démarrage ----
@app.on_event("startup")
async def startup_event():
    # ⚠️ Vérifie que tu veux vraiment envoyer un email à chaque démarrage
    message = MessageSchema(
        subject="Test email",
        recipients=["adresse_destinataire@gmail.com"],  # change ici pour ton email
        body="Ceci est un test d'envoi avec FastMail",
        subtype="plain"
    )
    try:
        await fm.send_message(message)
        print("Email envoyé avec succès !")
    except ConnectionErrors as e:
        print("Erreur de connexion au serveur mail :", e)
    except Exception as e:
        print("Erreur lors de l'envoi de l'email :", e)
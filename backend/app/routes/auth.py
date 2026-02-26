# app/routes/auth.py

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from datetime import datetime, timedelta
from jose import jwt, JWTError
import random
import requests
from app.config.database import SessionLocal
from app.models.user import User
from app.schemas.user import UserCreate, UserLogin, ForgotPassword, ResetPassword
from app.core.security import hash_password, verify_password, create_access_token
from app.config.mail import fm, MessageSchema
from app.config.settings import settings
from fastapi.responses import RedirectResponse


router = APIRouter(prefix="/auth", tags=["Auth"])


# ------------------- DATABASE DEPENDENCY -------------------

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


# ------------------- REGISTER -------------------

@router.post("/register", status_code=status.HTTP_201_CREATED)
def register(user: UserCreate, db: Session = Depends(get_db)):

    existing_user = db.query(User).filter(User.email == user.email).first()
    if existing_user:
        raise HTTPException(
            status_code=400,
            detail="Email already registered"
        )

    new_user = User(
        email=user.email,
        username=user.username,
        hashed_password=hash_password(user.password)
    )

    db.add(new_user)
    db.commit()
    db.refresh(new_user)

    return {"message": "User created successfully"}


# ------------------- LOGIN -------------------

@router.post("/login")
def login(user: UserLogin, db: Session = Depends(get_db)):

    db_user = db.query(User).filter(User.email == user.email).first()

    if not db_user or not verify_password(user.password, db_user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid credentials"
        )

    token = create_access_token({"sub": db_user.email})

    return {
        "access_token": token,
        "token_type": "bearer"
    }


# ------------------- FORGOT PASSWORD -------------------





def generate_otp(length: int = 6) -> str:
    return ''.join([str(random.randint(0, 9)) for _ in range(length)])

# ---------------- FORGOT PASSWORD ----------------
# ---------------- FORGOT PASSWORD ----------------
@router.post("/forgot-password")
async def forgot_password(request: ForgotPassword, db: Session = Depends(get_db)):
    # Vérifier si l'utilisateur existe
    user = db.query(User).filter(User.email == request.email).first()
    if not user:
        raise HTTPException(status_code=404, detail="Utilisateur non trouvé")

    # Générer un OTP et définir la date d'expiration
    otp = generate_otp()
    user.otp = otp
    user.otp_expiry = datetime.utcnow() + timedelta(minutes=10)
    db.commit()

    # Préparer l'email
    message = MessageSchema(
        subject="Votre code OTP pour réinitialisation",
        recipients=[user.email],
        body=f"""
        <h3>Bonjour {user.username}</h3>
        <p>Voici votre code OTP : <b>{otp}</b></p>
        <p>Il expire dans 10 minutes.</p>
        """,
        subtype="html"
    )

    # Envoyer l'OTP par email
    try:
        await fm.send_message(message)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Impossible d'envoyer l'email: {str(e)}")

    return {"msg": f"OTP envoyé à {user.email}"}





@router.post("/reset-password")
async def reset_password(request: ResetPassword, db: Session = Depends(get_db)):

    user = db.query(User).filter(User.email == request.email).first()

    if not user:
        raise HTTPException(status_code=404, detail="Utilisateur non trouvé")

    # Vérifier OTP
    if user.otp != request.otp:
        raise HTTPException(status_code=400, detail="Code OTP invalide")

    # Vérifier expiration
    if not user.otp_expiry or datetime.utcnow() > user.otp_expiry:
        raise HTTPException(status_code=400, detail="Code OTP expiré")

    # Changer mot de passe
    user.hashed_password = hash_password(request.password)

    # Supprimer OTP après utilisation
    user.otp = None
    user.otp_expiry = None

    db.commit()

    return {"msg": "Mot de passe réinitialisé avec succès"}

# ---------------- GITLAB LOGIN ----------------

# ---------------- GITLAB LOGIN ----------------

@router.get("/gitlab/login")
def gitlab_login():
    gitlab_auth_url = (
        "https://gitlab.com/oauth/authorize"
        f"?client_id={settings.GITLAB_CLIENT_ID}"
        "&response_type=code"
        f"&redirect_uri={settings.GITLAB_REDIRECT_URI}"
    )
    return RedirectResponse(gitlab_auth_url)


@router.get("/gitlab/callback")
def gitlab_callback(code: str, db: Session = Depends(get_db)):

    # 1️⃣ échanger code contre token GitLab
    token_url = "https://gitlab.com/oauth/token"

    response = requests.post(token_url, data={
        "client_id": settings.GITLAB_CLIENT_ID,
        "client_secret": settings.GITLAB_CLIENT_SECRET,
        "code": code,
        "grant_type": "authorization_code",
        "redirect_uri": settings.GITLAB_REDIRECT_URI,
    })

    token_data = response.json()

    if "access_token" not in token_data:
        raise HTTPException(status_code=400, detail="Erreur OAuth GitLab")

    access_token = token_data.get("access_token")

    # 2️⃣ récupérer infos utilisateur GitLab
    user_info = requests.get(
        "https://gitlab.com/api/v4/user",
        headers={"Authorization": f"Bearer {access_token}"}
    )

    gitlab_user = user_info.json()

    email = gitlab_user.get("email")
    username = gitlab_user.get("username")

    if not email:
        raise HTTPException(status_code=400, detail="Email non fourni par GitLab")

    # 3️⃣ vérifier si utilisateur existe déjà
    user = db.query(User).filter(User.email == email).first()

    if not user:
        user = User(
            email=email,
            username=username,
            hashed_password=hash_password("oauth_default")
        )
        db.add(user)
        db.commit()
        db.refresh(user)

    # 4️⃣ créer token JWT interne
    token = create_access_token({"sub": user.email})

    # 5️⃣ redirection vers frontend
    return RedirectResponse(
        f"http://localhost:3000/dashboard?token={token}"
    )
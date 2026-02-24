# app/routes/auth.py

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from datetime import datetime, timedelta
from jose import jwt, JWTError

from app.config.database import SessionLocal
from app.models.user import User
from app.schemas.user import UserCreate, UserLogin, ForgotPassword, ResetPassword
from app.core.security import hash_password, verify_password, create_access_token
from app.config.mail import fm, MessageSchema
from app.config.settings import settings

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

@router.post("/forgot-password")
async def forgot_password(request: ForgotPassword, db: Session = Depends(get_db)):

    user = db.query(User).filter(User.email == request.email).first()

    if not user:
        raise HTTPException(
            status_code=404,
            detail="Utilisateur non trouvé"
        )

    expire = datetime.utcnow() + timedelta(minutes=15)

    token = jwt.encode(
        {
            "sub": user.email,
            "exp": expire
        },
        settings.SECRET_KEY,
        algorithm=settings.ALGORITHM
    )

    reset_link = f"http://localhost:3000/reset-password?token={token}"

    message = MessageSchema(
        subject="Réinitialisation du mot de passe",
        recipients=[user.email],
        body=f"""
        <h3>Bonjour {user.username}</h3>
        <p>Cliquez sur le lien ci-dessous pour réinitialiser votre mot de passe :</p>
        <a href="{reset_link}">Réinitialiser le mot de passe</a>
        <p>Ce lien expire dans 15 minutes.</p>
        """,
        subtype="html"
    )

    await fm.send_message(message)

    return {"msg": "Email de réinitialisation envoyé avec succès"}


# ------------------- RESET PASSWORD -------------------

@router.post("/reset-password")
async def reset_password(request: ResetPassword, db: Session = Depends(get_db)):

    try:
        payload = jwt.decode(
            request.token,
            settings.SECRET_KEY,
            algorithms=[settings.ALGORITHM]
        )

        email = payload.get("sub")

        if email is None:
            raise HTTPException(
                status_code=400,
                detail="Token invalide"
            )

    except JWTError:
        raise HTTPException(
            status_code=400,
            detail="Token invalide ou expiré"
        )

    user = db.query(User).filter(User.email == email).first()

    if not user:
        raise HTTPException(
            status_code=404,
            detail="Utilisateur non trouvé"
        )

    user.hashed_password = hash_password(request.password)
    db.commit()

    return {"msg": "Mot de passe réinitialisé avec succès"}
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base
import os
from dotenv import load_dotenv

# Charger les variables d'environnement
load_dotenv()

DATABASE_URL = os.getenv("DATABASE_URL")

# Vérifie que l'URL est bien chargée
if not DATABASE_URL:
    raise ValueError("DATABASE_URL non défini ! Vérifie ton fichier .env")

# Création de l'engine SQLAlchemy
engine = create_engine(DATABASE_URL, echo=True)  # echo=True pour voir les logs SQL

# Générateur de sessions
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Base pour les modèles
Base = declarative_base()
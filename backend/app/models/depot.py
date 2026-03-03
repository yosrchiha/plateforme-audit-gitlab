from sqlalchemy import Column, Integer, String, ForeignKey
from app.config.database import Base

class Depot(Base):
    __tablename__ = "depots"

    id = Column(Integer, primary_key=True, index=True)
    nom = Column(String, nullable=False)
    url_branche_principale = Column(String, nullable=False)
    url_branche_developpement = Column(String, nullable=False)
    token_gitlab = Column(String, nullable=False)
    proprietaire_id = Column(Integer, ForeignKey("users.id"), nullable=False)
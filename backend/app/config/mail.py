from pydantic_settings import BaseSettings
from pydantic import EmailStr
from fastapi_mail import FastMail, MessageSchema, ConnectionConfig

class Settings(BaseSettings):
    MAIL_USERNAME: str = "tonmail@gmail.com"
    MAIL_PASSWORD: str = "ton_mot_de_passe_app"
    MAIL_FROM: EmailStr = "tonmail@gmail.com"
    MAIL_PORT: int = 587
    MAIL_SERVER: str = "smtp.gmail.com"
    MAIL_STARTTLS: bool = True   # <-- remplace MAIL_TLS
    MAIL_SSL_TLS: bool = False   # <-- remplace MAIL_SSL

settings = Settings()

conf = ConnectionConfig(
    MAIL_USERNAME = settings.MAIL_USERNAME,
    MAIL_PASSWORD = settings.MAIL_PASSWORD,
    MAIL_FROM = settings.MAIL_FROM,
    MAIL_PORT = settings.MAIL_PORT,
    MAIL_SERVER = settings.MAIL_SERVER,
    MAIL_STARTTLS = settings.MAIL_STARTTLS,
    MAIL_SSL_TLS = settings.MAIL_SSL_TLS,
    USE_CREDENTIALS = True
)

fm = FastMail(conf)
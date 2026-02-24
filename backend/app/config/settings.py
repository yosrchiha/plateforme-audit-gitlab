from pydantic_settings import BaseSettings
from pydantic import EmailStr


class Settings(BaseSettings):

    # 🔐 JWT
    SECRET_KEY: str
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60

    # 🗄 Database
    DATABASE_URL: str

    # 📦 GitLab
    GITLAB_TOKEN: str
    GITLAB_URL: str

    # 📧 Mail
    MAIL_USERNAME: str
    MAIL_PASSWORD: str
    MAIL_FROM: EmailStr
    MAIL_PORT: int
    MAIL_SERVER: str
    MAIL_TLS: bool = True
    MAIL_SSL: bool = False

    class Config:
        env_file = ".env"
        extra = "ignore"  # 🔥 IMPORTANT pour éviter les erreurs


settings = Settings()
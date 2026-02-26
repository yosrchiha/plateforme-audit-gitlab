# app/config/mail.py

from fastapi_mail import FastMail, ConnectionConfig, MessageSchema
from app.config.settings import settings

# ------------------- CONFIGURATION MAIL -------------------
conf = ConnectionConfig(
    MAIL_USERNAME="yosrchiha01@gmail.com",       # ton email Gmail
    MAIL_PASSWORD="kfkq kirx dwdu sdps",       # ton mot de passe d'application Gmail
    MAIL_FROM="yosrchiha01@gmail.com",               # même email Gmail
    MAIL_PORT=587,
    MAIL_SERVER="smtp.gmail.com",
     MAIL_STARTTLS=True,      # à la place de MAIL_TLS
    MAIL_SSL_TLS=False,  
    USE_CREDENTIALS=True,
    VALIDATE_CERTS=True
)

# Instance FastMail
fm = FastMail(conf)

# ------------------- FONCTION POUR ENVOYER MAIL -------------------
async def send_email(subject: str, recipients: list[str], body: str, subtype: str = "html"):
    """
    Envoie un email via FastMail.

    :param subject: Objet du mail
    :param recipients: Liste des emails des destinataires
    :param body: Contenu du mail (HTML ou texte)
    :param subtype: "html" ou "plain"
    """
    message = MessageSchema(
        subject=subject,
        recipients=recipients,
        body=body,
        subtype=subtype
    )
    await fm.send_message(message)
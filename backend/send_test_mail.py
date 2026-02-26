import asyncio
import random
from fastapi_mail import FastMail, MessageSchema, ConnectionConfig

# Configuration mail
conf = ConnectionConfig(
    MAIL_USERNAME="yosrchiha01@gmail.com",
    MAIL_PASSWORD="kfkq kirx dwdu sdps",
    MAIL_FROM="yosrchiha01@gmail.com",
    MAIL_PORT=587,
    MAIL_SERVER="smtp.gmail.com",
    MAIL_STARTTLS=True,   # ✅ Remplace MAIL_TLS
    MAIL_SSL_TLS=False,  
    USE_CREDENTIALS=True,
)

# Fonction pour générer un OTP
def generate_otp(length=6):
    return ''.join([str(random.randint(0, 9)) for _ in range(length)])

# Fonction pour envoyer le mail
async def send_otp_email(recipient_email: str):
    otp = generate_otp()
    message = MessageSchema(
        subject="Votre OTP",
        recipients=[recipient_email],
        body=f"Bonjour, votre code OTP est : {otp}",
        subtype="plain"
    )

    fm = FastMail(conf)
    await fm.send_message(message)
    print(f"OTP envoyé à {recipient_email}: {otp}")

# Lancer le test
if __name__ == "__main__":
    asyncio.run(send_otp_email("yosrchiha01@gmail.com"))
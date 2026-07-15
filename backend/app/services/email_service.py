import logging
from fastapi_mail import FastMail, MessageSchema, ConnectionConfig, MessageType
from app.core.config import settings

logger = logging.getLogger(__name__)

_conf = None
if settings.MAIL_USERNAME and settings.MAIL_PASSWORD:
    _conf = ConnectionConfig(
        MAIL_USERNAME=settings.MAIL_USERNAME,
        MAIL_PASSWORD=settings.MAIL_PASSWORD,
        MAIL_FROM=settings.MAIL_FROM,
        MAIL_PORT=settings.MAIL_PORT,
        MAIL_SERVER=settings.MAIL_SERVER,
        MAIL_STARTTLS=True,
        MAIL_SSL_TLS=False,
        USE_CREDENTIALS=True,
        VALIDATE_CERTS=True,
    )


async def send_password_reset_email(to_email: str, reset_token: str) -> None:
    reset_link = f"{settings.FRONTEND_URL}/reset-password?token={reset_token}"
    html = f"""
    <div style="font-family: Arial, sans-serif; max-width: 480px; margin: auto;">
      <h2 style="color:#4F46E5;">Notera Password Reset</h2>
      <p>We received a request to reset your Notera password. Click below to set a new one. This link expires in {settings.RESET_TOKEN_EXPIRE_MINUTES} minutes.</p>
      <a href="{reset_link}" style="display:inline-block;padding:12px 24px;background:#4F46E5;color:#fff;border-radius:8px;text-decoration:none;margin:16px 0;">Reset Password</a>
      <p>If you did not request this, you can safely ignore this email.</p>
    </div>
    """
    if not _conf:
        logger.warning("Mail not configured. Reset link for %s: %s", to_email, reset_link)
        return

    message = MessageSchema(
        subject="Reset your Notera password",
        recipients=[to_email],
        body=html,
        subtype=MessageType.html,
    )
    fm = FastMail(_conf)
    await fm.send_message(message)

import os
import logging
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

logger.info("1. Importing settings...")

from app.core.config import settings

logger.info("2. Importing routes...")

from app.api.routes import auth, courses, dashboard, chat

logger.info("3. Creating directories...")

os.makedirs(settings.UPLOAD_DIR, exist_ok=True)
os.makedirs(settings.CHROMA_PERSIST_DIR, exist_ok=True)

logger.info("4. Creating FastAPI app...")

app = FastAPI(title="Notera API", version="1.0.0")

logger.info("5. Adding middleware...")

app.add_middleware(
    CORSMiddleware,
    allow_origins=[settings.FRONTEND_URL, "http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

logger.info("6. Mounting static files...")

app.mount("/static/uploads", StaticFiles(directory=settings.UPLOAD_DIR), name="uploads")

logger.info("7. Including routers...")

app.include_router(auth.router)
app.include_router(courses.router)
app.include_router(dashboard.router)
app.include_router(chat.router)

logger.info("8. Startup complete.")

@app.get("/api/health")
async def health_check():
    return {"status": "ok", "service": "notera-api"}
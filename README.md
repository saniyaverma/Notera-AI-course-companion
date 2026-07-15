# Notera — AI Study Companion

Notera turns a course's syllabus, notes, and past exam papers into a prioritized study plan,
AI-generated revision notes, an extracted diagram gallery, and a RAG-powered chat tutor.

## Architecture

- **Backend**: FastAPI (async), PostgreSQL (SQLAlchemy 2.0 async), ChromaDB (local vector store),
  OpenAI for LLM calls, JWT auth + Google OAuth.
- **Frontend**: Next.js 14 (App Router), TypeScript, Tailwind CSS, Zustand for auth state.
- **Agentic pipeline**: on course upload, a background task chain runs:
  1. Parse syllabus/notes/PYQs (pypdf / python-docx)
  2. Chunk + embed into ChromaDB (per-course collection)
  3. Topic extraction agent (LLM) → syllabus topics
  4. PYQ analysis agent (LLM + RAG) → Q&A pairs, topic frequency
  5. Priority ranking agent (LLM) → high/medium/low per topic
  6. Diagram extraction (embedded PDF images)
  7. On-demand: short-notes agent (RAG) and chat agent (RAG)

## Local Setup

### 1. Backend

```bash
cd backend
cp .env.example .env   # fill in SECRET_KEY, OPENAI_API_KEY, Google OAuth creds, SMTP creds
python -m venv venv && source venv/bin/activate
pip install -r requirements.txt

# Start Postgres (or use docker-compose up db)
alembic upgrade head

uvicorn app.main:app --reload --port 8000
```

### 2. Frontend

```bash
cd frontend
cp .env.local.example .env.local
npm install
npm run dev
```

Visit `http://localhost:3000`.

### 3. Or run everything with Docker Compose

```bash
docker-compose up --build
```

## Environment Variables

See `backend/.env.example` and `frontend/.env.local.example`.

Required for full functionality:
- `OPENAI_API_KEY` — powers all agentic features (topic extraction, PYQ analysis, notes, chat)
- `GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET` — Google sign-in
- `MAIL_USERNAME` / `MAIL_PASSWORD` — password reset emails (SMTP, e.g. Gmail App Password)

Without `OPENAI_API_KEY`, course upload will succeed but processing will fail — auth, course CRUD,
and file upload still work end-to-end.

## Notes on Production Deployment

- Swap `CHROMA_PERSIST_DIR` for a persistent volume, or point to a hosted Chroma/PGVector instance.
- Put `uploads/` on object storage (S3) for horizontal scaling; update `file_parser`/`static` mount accordingly.
- Run Alembic migrations as a release step, not on container boot.
- Set `FRONTEND_URL`, `GOOGLE_REDIRECT_URI`, and CORS origins to your deployed domains.

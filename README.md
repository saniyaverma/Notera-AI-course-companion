# 🚀 Notera — AI Course Companion

> **From notes to knowledge.**

Notera is an AI-powered Course Companion that transforms scattered academic resources into structured, personalized study material.

Instead of manually reading hundreds of pages of notes, students upload their course materials, and Notera automatically extracts topics, analyzes previous year questions, prioritizes important concepts, generates revision notes, and provides an AI-powered chat grounded in their own resources.

---

# 🎥 Demo

> **Watch Notera in action**

https://github.com/user-attachments/assets/3b00eff8-0389-4090-ac39-c20d98a8e5e3





---

## ✨ Features

- 📚 Upload course notes, syllabus, and previous year question papers
- 🧠 AI-powered topic extraction
- 📊 Automatic topic prioritization (High / Medium / Low)
- 📝 AI-generated revision notes
- ❓ Important question extraction from PYQs
- 🖼️ Automatic diagram extraction from PDFs
- 💬 Retrieval-Augmented Generation (RAG) based AI chat
- 🔒 Secure authentication (JWT + Google OAuth)

---

# 🏗️ System Architecture

```text
                 Upload Course Files
                         │
                         ▼
               Text & Image Extraction
                         │
                         ▼
              Chunking + Embedding
                         │
                         ▼
             Chroma Vector Database
                         │
        ┌────────────────┼────────────────┐
        ▼                ▼                ▼
 Topic Extraction   PYQ Analysis   Diagram Extraction
        │                │
        └──────────┬─────┘
                   ▼
          Priority Ranking Agent
                   │
                   ▼
          AI Course Dashboard
                   │
         ┌─────────┴─────────┐
         ▼                   ▼
    Revision Notes      AI Chat (RAG)
```

---

# 🤖 Agentic AI Pipeline

Every uploaded course automatically triggers an asynchronous AI pipeline.

### Step 1 — Document Parsing

- Extract text from Notes, Syllabus and PYQs
- Extract embedded diagrams from PDFs

### Step 2 — Semantic Indexing

- Split documents into semantic chunks
- Generate embeddings
- Store vectors inside ChromaDB

### Step 3 — Topic Extraction Agent

Uses an LLM to identify all important syllabus topics.

### Step 4 — PYQ Analysis Agent

Analyzes previous year papers to:

- identify recurring questions
- map questions to topics
- estimate topic frequency

### Step 5 — Priority Ranking Agent

Ranks every topic as:

- 🔴 High
- 🟡 Medium
- 🟢 Low

based on:

- syllabus
- PYQs
- notes
- LLM reasoning

### Step 6 — Revision Notes Agent

Generates concise AI-powered revision notes using Retrieval-Augmented Generation.

### Step 7 — Chat Agent

Allows students to ask questions about their course while grounding every response in uploaded documents.

---

# 🛠️ Tech Stack

## Backend

- FastAPI
- Python
- SQLAlchemy 2.0
- PostgreSQL
- Alembic
- ChromaDB
- Sentence Transformers
- Gemini / OpenAI
- JWT Authentication
- Google OAuth

## Frontend

- Next.js 14
- TypeScript
- Tailwind CSS
- Zustand

## AI & ML

- Retrieval-Augmented Generation (RAG)
- Semantic Search
- Vector Embeddings
- Prompt Engineering
- LLM-based Topic Extraction
- LLM-based Priority Ranking
- Background AI Pipelines

---

# 📂 Project Structure

```text
backend/
    app/
        agents/
        api/
        models/
        services/
        pipeline.py

frontend/
    src/
        app/
        components/
        lib/
```

---

# 🚀 Running Locally

## Backend

```bash
cd backend

python -m venv venv
```

Windows

```bash
venv\Scripts\activate
```

Linux/macOS

```bash
source venv/bin/activate
```

Install dependencies

```bash
pip install -r requirements.txt
```

Run migrations

```bash
alembic upgrade head
```

Start backend

```bash
uvicorn app.main:app --reload
```

---

## Frontend

```bash
cd frontend

npm install

npm run dev
```

Open

```
http://localhost:3000
```

---

# 🐳 Docker

```bash
docker-compose up --build
```


---

# 🎯 Why Notera?

Unlike traditional PDF chatbots, Notera understands the academic workflow.

It combines:

- document intelligence
- semantic retrieval
- AI reasoning
- previous year paper analysis
- personalized study planning

to help students study more efficiently.

---

# 👩‍💻 Author

**Saniya Verma**

Built as an end-to-end AI Engineering project exploring Retrieval-Augmented Generation (RAG), Agentic AI pipelines, and intelligent educational systems.

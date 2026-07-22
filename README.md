# 🚀 Notera — AI Course Companion

> **From notes to knowledge.**

Notera is an AI-powered Course Companion that transforms scattered academic resources into structured, personalized study material.

Instead of manually reading hundreds of pages of notes, students upload their course materials, and Notera automatically extracts topics, analyzes previous year questions, generates revision notes, and provides an AI-powered chat grounded in their own resources.

---

# 🎥 Demo

> **Watch Notera in action**



https://github.com/user-attachments/assets/f0aa5008-fcf7-4f1f-bc1d-6d951cbf1015






---

## ✨ Features

- 📚 Create courses by uploading notes, syllabus, and previous year question papers
- 📋 AI-generated syllabus checklist with progress tracking
- 📝 Generate concise AI-powered revision notes for the syllabus topics
- ❓ Automatic extraction of important questions from previous year papers
- 🖼️ Extract diagrams and figures from uploaded PDFs
- 💬 AI-powered course chat grounded in your own study material (RAG)
- 📖 Persistent chat history for every course
- 🔒 Secure authentication with Email/Password and Google OAuth
  
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
        ┌────────────────┼─────────────────┐
        ▼                ▼                 ▼
 Topic Extraction   PYQ Analysis   Diagram Extraction
        │                │
        └──────────┬─────┘
                   ▼
        AI Course Dashboard
                   │
    ┌──────────────┼──────────────┐
    ▼              ▼              ▼
Syllabus      Revision Notes   AI Chat (RAG)
Checklist
```

---

# 🤖 AI Processing Pipeline

Every uploaded course automatically triggers an asynchronous AI processing pipeline.

### Step 1 — Document Parsing

- Extract text from notes, syllabus, and previous year papers
- Extract diagrams and figures from PDFs

### Step 2 — Semantic Indexing

- Split documents into chunks
- Generate vector embeddings
- Store embeddings in ChromaDB

### Step 3 — Topic Extraction

An LLM identifies the syllabus topics covered across the uploaded material.

### Step 4 — PYQ Analysis

Analyzes previous year papers to:

- identify recurring questions
- map questions to syllabus topics
- estimate topic coverage

### Step 5 — Syllabus Checklist Generation

Builds a structured checklist of syllabus topics that students can track while studying.

### Step 6 — Revision Notes

Generates concise revision notes for selected topics using Retrieval-Augmented Generation.

### Step 7 — AI Chat

Answers questions using semantic retrieval over uploaded documents while maintaining per-course chat history.
---

# 🛠️ Tech Stack

## Backend

- FastAPI
- Python
- SQLAlchemy 2.0
- PostgreSQL
- Alembic
- ChromaDB
- Sentence Transformers (Embeddings)
- Groq API (LLM)
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
- Previous Year Question Analysis
- Asynchronous AI Processing Pipeline
  
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

Students often juggle lecture notes, syllabus documents, and previous year papers across multiple sources.

Notera brings them together into a single AI-powered course workspace where students can:

- organize course resources
- track syllabus completion
- generate revision notes
- review important previous year questions
- ask questions grounded in their own study material

Instead of acting as a generic PDF chatbot, Notera is designed specifically around the academic workflow.
---

# 👩‍💻 Author

**Saniya Verma**

Built as an end-to-end AI Engineering project exploring Retrieval-Augmented Generation (RAG), semantic search, document intelligence, and AI-powered educational tools using FastAPI, Next.js, PostgreSQL, ChromaDB, and modern LLMs.

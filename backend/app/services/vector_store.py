import chromadb
from chromadb.utils import embedding_functions
from langchain_text_splitters import RecursiveCharacterTextSplitter
from app.core.config import settings

_client = chromadb.PersistentClient(path=settings.CHROMA_PERSIST_DIR)

_embedding_fn = embedding_functions.SentenceTransformerEmbeddingFunction(
    model_name=settings.EMBEDDING_MODEL
)

_splitter = RecursiveCharacterTextSplitter(
    chunk_size=800,
    chunk_overlap=120,
    separators=["\n\n", "\n", ". ", " ", ""],
)


def _collection_name(course_id: str) -> str:
    return f"course_{course_id.replace('-', '')}"


def get_or_create_collection(course_id: str):
    return _client.get_or_create_collection(
        name=_collection_name(course_id),
        embedding_function=_embedding_fn,
        metadata={"hnsw:space": "cosine"},
    )


def index_document(course_id: str, text: str, source: str, category: str) -> int:
    if not text or not text.strip():
        return 0

    collection = get_or_create_collection(course_id)
    chunks = _splitter.split_text(text)
    if not chunks:
        return 0

    ids = [f"{source}-{i}" for i in range(len(chunks))]
    metadatas = [{"source": source, "category": category, "chunk_index": i} for i in range(len(chunks))]

    collection.upsert(ids=ids, documents=chunks, metadatas=metadatas)
    return len(chunks)


def query_similar_chunks(course_id: str, query: str, n_results: int = 6, category: str | None = None) -> list[dict]:
    collection = get_or_create_collection(course_id)
    where = {"category": category} if category else None

    try:
        results = collection.query(
            query_texts=[query],
            n_results=n_results,
            where=where,
        )
    except Exception:
        return []

    chunks = []
    docs = results.get("documents", [[]])[0]
    metas = results.get("metadatas", [[]])[0]
    for doc, meta in zip(docs, metas):
        chunks.append({"text": doc, "metadata": meta})
    return chunks


def delete_course_collection(course_id: str) -> None:
    try:
        _client.delete_collection(_collection_name(course_id))
    except Exception:
        pass

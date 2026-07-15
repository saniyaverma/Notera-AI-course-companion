from app.services.llm_client import chat_completion
from app.services.vector_store import query_similar_chunks
from app.agents.prompts import CHAT_SYSTEM, CHAT_USER


async def answer_question(course_id: str, question: str, history: list[dict]) -> str:
    chunks = query_similar_chunks(course_id, question, n_results=8)
    context = "\n\n---\n\n".join(
        f"[Source: {c['metadata'].get('category', 'unknown')}] {c['text']}" for c in chunks
    )
    if not context.strip():
        context = "No relevant material found in the course documents."

    history_text = "\n".join(
        f"{'Student' if h['role'] == 'user' else 'Notera'}: {h['content']}" for h in history[-6:]
    ) or "No prior conversation."

    answer = await chat_completion(
        CHAT_SYSTEM,
        CHAT_USER.format(context=context[:8000], history=history_text, question=question),
        temperature=0.4,
    )
    return answer

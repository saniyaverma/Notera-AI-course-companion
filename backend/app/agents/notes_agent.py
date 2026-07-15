from app.services.llm_client import chat_completion
from app.services.vector_store import query_similar_chunks
from app.agents.prompts import SHORT_NOTES_SYSTEM, SHORT_NOTES_USER


async def generate_short_note(course_id: str, topic_title: str) -> str:
    chunks = query_similar_chunks(course_id, topic_title, n_results=5, category="notes")
    context = "\n\n".join(c["text"] for c in chunks)

    if not context.strip():
        chunks = query_similar_chunks(course_id, topic_title, n_results=5)
        context = "\n\n".join(c["text"] for c in chunks)

    if not context.strip():
        context = "No detailed source material found for this topic in the uploaded notes."

    content = await chat_completion(
        SHORT_NOTES_SYSTEM,
        SHORT_NOTES_USER.format(topic_title=topic_title, context=context[:6000]),
        temperature=0.4,
    )
    return content

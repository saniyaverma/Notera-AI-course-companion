from app.services.llm_client import chat_completion_json
from app.agents.prompts import TOPIC_EXTRACTION_SYSTEM, TOPIC_EXTRACTION_USER


async def extract_topics(syllabus_text: str) -> list[dict]:
    if not syllabus_text.strip():
        return []

    truncated = syllabus_text[:12000]
    result = await chat_completion_json(
        TOPIC_EXTRACTION_SYSTEM,
        TOPIC_EXTRACTION_USER.format(syllabus_text=truncated),
    )
    topics = result.get("topics", [])
    return [
        {"title": t.get("title", "").strip(), "order_index": t.get("order_index", i)}
        for i, t in enumerate(topics)
        if t.get("title", "").strip()
    ]

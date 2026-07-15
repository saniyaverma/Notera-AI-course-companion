from app.services.llm_client import chat_completion_json
from app.services.vector_store import query_similar_chunks
from app.agents.prompts import PYQ_ANALYSIS_SYSTEM, PYQ_ANALYSIS_USER


async def analyze_pyqs(course_id: str, pyqs_text: str, topic_titles: list[str]) -> dict:
    if not pyqs_text.strip():
        return {"questions": [], "topic_frequency": {}}

    topics_list = "\n".join(f"- {t}" for t in topic_titles) or "No syllabus topics extracted."

    notes_chunks = query_similar_chunks(course_id, pyqs_text[:500], n_results=8, category="notes")
    notes_context = "\n\n".join(c["text"] for c in notes_chunks) or "No notes available."

    result = await chat_completion_json(
        PYQ_ANALYSIS_SYSTEM,
        PYQ_ANALYSIS_USER.format(
            topics_list=topics_list,
            pyqs_text=pyqs_text[:10000],
            notes_context=notes_context[:6000],
        ),
    )
    return {
        "questions": result.get("questions", []),
        "topic_frequency": result.get("topic_frequency", {}),
    }

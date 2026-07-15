import json
from app.services.llm_client import chat_completion_json
from app.agents.prompts import PRIORITY_SYSTEM, PRIORITY_USER


async def rank_priorities(topics_with_meta: list[dict]) -> list[dict]:
    """topics_with_meta: [{title, pyq_frequency, is_covered_in_notes}]"""
    if not topics_with_meta:
        return []

    result = await chat_completion_json(
        PRIORITY_SYSTEM,
        PRIORITY_USER.format(topics_json=json.dumps(topics_with_meta, indent=2)),
    )
    return result.get("priorities", [])

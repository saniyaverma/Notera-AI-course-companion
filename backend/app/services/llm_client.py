import json
import logging
from openai import AsyncOpenAI
from tenacity import retry, stop_after_attempt, wait_exponential
from app.core.config import settings

logger = logging.getLogger(__name__)

_client = AsyncOpenAI(api_key=settings.OPENAI_API_KEY) if settings.OPENAI_API_KEY else None


@retry(stop=stop_after_attempt(3), wait=wait_exponential(multiplier=1, min=2, max=10))
async def chat_completion(system_prompt: str, user_prompt: str, json_mode: bool = False, temperature: float = 0.3) -> str:
    if not _client:
        raise RuntimeError("OPENAI_API_KEY is not configured")

    kwargs = {}
    if json_mode:
        kwargs["response_format"] = {"type": "json_object"}

    response = await _client.chat.completions.create(
        model=settings.OPENAI_MODEL,
        temperature=temperature,
        messages=[
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": user_prompt},
        ],
        **kwargs,
    )
    return response.choices[0].message.content or ""


async def chat_completion_json(system_prompt: str, user_prompt: str, temperature: float = 0.3) -> dict:
    raw = await chat_completion(system_prompt, user_prompt, json_mode=True, temperature=temperature)
    try:
        return json.loads(raw)
    except json.JSONDecodeError:
        logger.error("Failed to parse LLM JSON output: %s", raw[:500])
        cleaned = raw.strip().strip("```json").strip("```").strip()
        return json.loads(cleaned)

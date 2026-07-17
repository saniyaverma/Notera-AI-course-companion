import json
import logging

import httpx
from tenacity import retry, stop_after_attempt, wait_exponential

from app.core.config import settings

logger = logging.getLogger(__name__)

GROQ_URL = "https://api.groq.com/openai/v1/chat/completions"


@retry(stop=stop_after_attempt(3), wait=wait_exponential(multiplier=1, min=2, max=10))
async def chat_completion(
    system_prompt: str,
    user_prompt: str,
    json_mode: bool = False,
    temperature: float = 0.3,
) -> str:
    if not settings.GROQ_API_KEY:
        raise RuntimeError("GROQ_API_KEY is not configured")

    messages = [
        {
            "role": "system",
            "content": system_prompt,
        },
        {
            "role": "user",
            "content": user_prompt,
        },
    ]

    if json_mode:
        messages[1]["content"] += """

Return ONLY valid JSON.
Do not use markdown.
Do not wrap the response in ```json.
"""

    payload = {
        "model": settings.GROQ_MODEL,
        "messages": messages,
        "temperature": temperature,
    }

    async with httpx.AsyncClient(timeout=120) as client:
        response = await client.post(
            GROQ_URL,
            headers={
                "Authorization": f"Bearer {settings.GROQ_API_KEY}",
                "Content-Type": "application/json",
            },
            json=payload,
        )

    if response.status_code != 200:
        logger.error("Groq Error: %s", response.text)
        response.raise_for_status()

    data = response.json()

    return data["choices"][0]["message"]["content"]


async def chat_completion_json(
    system_prompt: str,
    user_prompt: str,
    temperature: float = 0.3,
) -> dict:
    raw = await chat_completion(
        system_prompt,
        user_prompt,
        json_mode=True,
        temperature=temperature,
    )

    try:
        return json.loads(raw)

    except json.JSONDecodeError:
        logger.warning("Model returned non-clean JSON.")

        cleaned = (
            raw.replace("```json", "")
            .replace("```", "")
            .strip()
        )

        try:
            return json.loads(cleaned)

        except json.JSONDecodeError:
            logger.error("Failed to parse JSON:\n%s", raw)
            raise
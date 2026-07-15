import json
import logging

import httpx
from tenacity import retry, stop_after_attempt, wait_exponential

from app.core.config import settings

logger = logging.getLogger(__name__)

GEMINI_URL = (
    f"https://generativelanguage.googleapis.com/v1beta/models/"
    f"{settings.GEMINI_MODEL}:generateContent"
)


@retry(stop=stop_after_attempt(3), wait=wait_exponential(multiplier=1, min=2, max=10))
async def chat_completion(
    system_prompt: str,
    user_prompt: str,
    json_mode: bool = False,
    temperature: float = 0.3,
) -> str:

    if not settings.GEMINI_API_KEY:
        raise RuntimeError("GEMINI_API_KEY is not configured")

    prompt = f"""System Instructions:

{system_prompt}

User:

{user_prompt}
"""

    if json_mode:
        prompt += """

Return ONLY valid JSON.
Do not use markdown.
Do not wrap in ```json.
"""

    payload = {
        "contents": [
            {
                "parts": [
                    {
                        "text": prompt
                    }
                ]
            }
        ],
        "generationConfig": {
            "temperature": temperature
        }
    }

    async with httpx.AsyncClient(timeout=120) as client:
        response = await client.post(
            GEMINI_URL,
            headers={
            "x-goog-api-key": settings.GEMINI_API_KEY,
            "Content-Type": "application/json",
            },
            json=payload,
        )

    if response.status_code != 200:
        logger.error("Gemini Error: %s", response.text)
        response.raise_for_status()

    data = response.json()

    return data["candidates"][0]["content"]["parts"][0]["text"]


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

        logger.warning("Gemini returned non-clean JSON.")

        cleaned = (
            raw.replace("```json", "")
            .replace("```", "")
            .strip()
        )

        return json.loads(cleaned)
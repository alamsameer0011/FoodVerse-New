
import json
import os
import re

from google import genai
from google.genai import types


def ask_json(prompt: str, images=None) -> dict:
    """Get a JSON response from Gemini with a bounded request timeout."""

    api_key = os.getenv("GEMINI_API_KEY")
    if not api_key:
        raise RuntimeError(
            "GEMINI_API_KEY is missing. Set it in Render Environment."
        )

    model = os.getenv("GEMINI_MODEL", "gemini-3.8-flash")

    # Timeout is in milliseconds.
    client = genai.Client(
        api_key=api_key,
        http_options=types.HttpOptions(timeout=20000),
    )

    contents = [prompt]

    if images:
        for image_data, mime_type in images:
            contents.append(
                types.Part.from_bytes(
                    data=image_data,
                    mime_type=mime_type or "image/jpeg",
                )
            )

    try:
        response = client.models.generate_content(
            model=model,
            contents=contents,
            config=types.GenerateContentConfig(
                response_mime_type="application/json",
                temperature=0.3,
            ),
        )
    except Exception as exc:
        message = str(exc)
        lowered = message.lower()

        if "429" in lowered or "resource_exhausted" in lowered:
            raise RuntimeError(
                "Gemini free quota exceeded or rate limit reached. "
                "Please try again when quota is available."
            ) from exc

        if any(word in lowered for word in (
            "timeout", "timed out", "deadline exceeded"
        )):
            raise RuntimeError(
                "Gemini request timed out. Please try again."
            ) from exc

        raise RuntimeError(
            f"Gemini API request failed: {message[:500]}"
        ) from exc

    response_text = response.text
    if not response_text:
        raise ValueError("Gemini returned an empty response.")

    text = response_text.strip()

    try:
        result = json.loads(text)
    except json.JSONDecodeError:
        match = re.search(r"\{.*\}", text, re.DOTALL)
        if not match:
            raise ValueError("Gemini did not return valid JSON.")
        result = json.loads(match.group(0))

    if not isinstance(result, dict):
        raise ValueError("Expected a JSON object from Gemini.")

    return result

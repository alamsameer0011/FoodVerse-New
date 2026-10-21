
import json
import os
import re
import time

from google import genai
from google.genai import types


def ask_json(prompt: str, images=None) -> dict:
    """Return a JSON object from Gemini, retrying temporary server errors."""

    api_key = os.getenv("GEMINI_API_KEY")
    if not api_key:
        raise RuntimeError(
            "GEMINI_API_KEY is missing. Set it in Render Environment."
        )

    model = os.getenv("GEMINI_MODEL", "gemini-3.8-flash")
    client = genai.Client(api_key=api_key)

    contents = [prompt]

    if images:
        for image_data, mime_type in images:
            contents.append(
                types.Part.from_bytes(
                    data=image_data,
                    mime_type=mime_type or "image/jpeg",
                )
            )

    response = None

    for attempt in range(3):
        try:
            response = client.models.generate_content(
                model=model,
                contents=contents,
                config=types.GenerateContentConfig(
                    response_mime_type="application/json",
                ),
            )
            break

        except Exception as exc:
            error_message = str(exc).lower()

            temporary_error = any(
                marker in error_message
                for marker in (
                    "503",
                    "unavailable",
                    "429",
                    "resource_exhausted",
                    "500",
                    "502",
                    "504",
                    "deadline exceeded",
                    "timed out",
                    "timeout",
                )
            )

            if not temporary_error or attempt == 2:
                raise

            time.sleep(2 ** (attempt + 1))

    if response is None or not response.text:
        raise ValueError("Gemini returned an empty response.")

    text = response.text.strip()

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

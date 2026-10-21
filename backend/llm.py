
import json
import os
import re

from google import genai
from google.genai import types


def ask_json(prompt: str, images=None) -> dict:
    """Return a JSON object from Gemini, optionally using images."""

    api_key = os.getenv("GEMINI_API_KEY")
    if not api_key:
        raise RuntimeError(
            "GEMINI_API_KEY is missing. Set it in Render Environment."
        )

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

    response = client.models.generate_content(
        model=os.getenv("GEMINI_MODEL", "gemini-3.8-flash"),
        contents=contents,
        config=types.GenerateContentConfig(
            response_mime_type="application/json",
        ),
    )

    text = response.text
    if not text:
        raise ValueError("Gemini returned an empty response.")

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

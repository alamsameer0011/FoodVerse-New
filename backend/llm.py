
import base64
import json
import os
import re
import urllib.error
import urllib.request


def ask_json(prompt: str, images=None) -> dict:
    """
    Send a prompt to OpenRouter and return a JSON object.
    Compatible with cooking.py calls using ask_json(prompt).
    """

    api_key = os.getenv("OPENROUTER_API_KEY")
    if not api_key:
        raise RuntimeError(
            "OPENROUTER_API_KEY is missing. Add it in Render Environment."
        )

    model = os.getenv(
        "OPENROUTER_MODEL",
        "recursive/flint-v1.0:free"
    )

    if images:
        raise RuntimeError(
            "The currently configured free model may not support images. "
            "Text-based recipe generation can still work."
        )

    payload = {
        "model": model,
        "messages": [
            {
                "role": "system",
                "content": (
                    "Return only a valid JSON object. "
                    "Do not use Markdown fences or extra text."
                )
            },
            {
                "role": "user",
                "content": prompt
            }
        ],
        "temperature": 0.3
    }

    request = urllib.request.Request(
        "https://openrouter.ai/api/v1/chat/completions",
        data=json.dumps(payload).encode("utf-8"),
        headers={
            "Authorization": f"Bearer {api_key}",
            "Content-Type": "application/json",
            "HTTP-Referer": "https://foodverse-frontend.onrender.com",
            "X-Title": "FoodVerse"
        },
        method="POST"
    )

    try:
        with urllib.request.urlopen(request, timeout=60) as response:
            result = json.loads(response.read().decode("utf-8"))

    except urllib.error.HTTPError as exc:
        error_body = exc.read().decode("utf-8", errors="replace")
        message = error_body[:700]

        if exc.code == 401:
            raise RuntimeError(
                "OpenRouter API key invalid. Check OPENROUTER_API_KEY in Render."
            ) from exc

        if exc.code == 402:
            raise RuntimeError(
                "OpenRouter rejected the request due to account/key limits. "
                "Check the free model and key limits; do not add payment unless you choose to."
            ) from exc

        if exc.code == 429:
            raise RuntimeError(
                "OpenRouter rate limit or free-model quota reached. Try again later."
            ) from exc

        raise RuntimeError(
            f"OpenRouter API error ({exc.code}): {message}"
        ) from exc

    except urllib.error.URLError as exc:
        raise RuntimeError(
            f"Could not connect to OpenRouter: {exc.reason}"
        ) from exc

    try:
        content = result["choices"][0]["message"]["content"]
    except (KeyError, IndexError, TypeError) as exc:
        raise RuntimeError(
            f"Unexpected OpenRouter response: {str(result)[:500]}"
        ) from exc

    if isinstance(content, list):
        content = "\n".join(
            item.get("text", "")
            for item in content
            if isinstance(item, dict)
        )

    if not isinstance(content, str) or not content.strip():
        raise RuntimeError("OpenRouter returned an empty response.")

    content = content.strip()

    try:
        data = json.loads(content)
    except json.JSONDecodeError:
        match = re.search(r"\{.*\}", content, re.DOTALL)
        if not match:
            raise ValueError(
                "The AI did not return valid JSON. Please try again."
            )
        data = json.loads(match.group(0))

    if not isinstance(data, dict):
        raise ValueError("The AI response must be a JSON object.")

    return data

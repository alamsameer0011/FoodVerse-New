
import base64
import json
import os
import re
import urllib.error
import urllib.request


def ask_json(prompt: str, images=None) -> dict:
    """Call OpenRouter for JSON text or image analysis."""

    api_key = os.getenv("OPENROUTER_API_KEY")
    if not api_key:
        raise RuntimeError(
            "OPENROUTER_API_KEY is missing. Add it in Render Environment."
        )

    if images:
        # Separate vision model; free router selects a compatible model.
        model = os.getenv("OPENROUTER_VISION_MODEL", "openrouter/free")

        content = [{"type": "text", "text": prompt}]

        for image_bytes, mime_type in images:
            encoded = base64.b64encode(image_bytes).decode("utf-8")
            content.append({
                "type": "image_url",
                "image_url": {
                    "url": f"data:{mime_type};base64,{encoded}"
                }
            })
    else:
        # Keep the existing text model for recipes and meal plans.
        model = os.getenv(
            "OPENROUTER_MODEL",
            "recursive/flint-v1.0:free"
        )
        content = prompt

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
                "content": content
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
        with urllib.request.urlopen(request, timeout=90) as response:
            result = json.loads(response.read().decode("utf-8"))

    except urllib.error.HTTPError as exc:
        error_body = exc.read().decode("utf-8", errors="replace")

        if exc.code == 401:
            raise RuntimeError(
                "OpenRouter API key invalid. Check Render Environment."
            ) from exc

        if exc.code == 402:
            raise RuntimeError(
                "OpenRouter account or model limit reached. "
                "Check free-model availability."
            ) from exc

        if exc.code == 429:
            raise RuntimeError(
                "OpenRouter free-model rate limit reached. Try again later."
            ) from exc

        raise RuntimeError(
            f"OpenRouter API error ({exc.code}): {error_body[:700]}"
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
            raise RuntimeError(
                "The AI did not return valid JSON. Please try again."
            )
        data = json.loads(match.group(0))

    if not isinstance(data, dict):
        raise RuntimeError("The AI response must be a JSON object.")

    return data

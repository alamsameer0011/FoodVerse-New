from fastapi import APIRouter, UploadFile, File, HTTPException
from llm import ask_json

router = APIRouter()

HYGIENE_PROMPT = """
Analyze this image for visible restaurant or kitchen hygiene indicators.

Return valid JSON in this exact structure:
{
  "hygiene_score": 0,
  "risk_level": "Low",
  "observations": [
    {
      "area": "Food preparation surface",
      "status": "Good",
      "details": "Visible observation from the image"
    }
  ],
  "recommendations": [
    "Practical hygiene improvement"
  ],
  "limitations": "Explain what cannot be confirmed from an image"
}

Rules:
- hygiene_score must be an integer from 0 to 100.
- risk_level must be Low, Moderate, or High.
- Base observations only on visible evidence.
- Do not invent unseen conditions.
- If the image is unclear, explain this in observations.
- Do not claim that food is microbiologically safe based on an image.
- Return JSON only.
"""


@router.post("/analyze")
async def analyze_hygiene(file: UploadFile = File(...)):
    if not file.content_type or not file.content_type.startswith("image/"):
        raise HTTPException(
            status_code=400,
            detail="Please upload a valid image file."
        )

    image_bytes = await file.read()

    if not image_bytes:
        raise HTTPException(
            status_code=400,
            detail="The uploaded image is empty."
        )

    if len(image_bytes) > 10 * 1024 * 1024:
        raise HTTPException(
            status_code=413,
            detail="Image size must be 10 MB or less."
        )

    try:
        result = ask_json(
            HYGIENE_PROMPT,
            [(image_bytes, file.content_type)]
        )
        return result

    except Exception:
        raise HTTPException(
            status_code=502,
            detail="Hygiene analysis failed. Please try again."
      )

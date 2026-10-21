
from fastapi import APIRouter, UploadFile, File
from llm import ask_json

router = APIRouter()

ANALYZE = """Analyze this food image. Return JSON:
{"items":[{"name":"food name","portion":"estimated portion","confidence":0.8}],
 "nutrition":{"calories":0,"protein_g":0,"carbs_g":0,"fat_g":0},
 "health_score":0,"health_notes":"brief notes",
 "freshness":{"label":"Fresh","reason":"brief reason"}}
Nutrition is an estimate for the whole visible meal."""

FRESH = """Judge food freshness from visible color, texture, discoloration, mold,
and surface patterns. Return JSON:
{"label":"Fresh","confidence":0.8,"indicators":["visible indicator"],
"safety_advice":"Visual inspection cannot guarantee food safety."}"""


async def _img(file):
    data = await file.read()
    return [(data, file.content_type or "image/jpeg")]


@router.post("/analyze")
async def analyze(file: UploadFile = File(...)):
    images = await _img(file)
    return ask_json(ANALYZE, images)


@router.post("/freshness")
async def freshness(file: UploadFile = File(...)):
    images = await _img(file)
    return ask_json(FRESH, images)

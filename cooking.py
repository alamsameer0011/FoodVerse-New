import tempfile
from fastapi import APIRouter, UploadFile, File
from pydantic import BaseModel
from llm import ask_json
router = APIRouter()
_whisper = None

class RecipeReq(BaseModel):
    query: str            # dish name, ingredients, or a cooking question
    servings: int = 2
    diet: str = ""

class Profile(BaseModel):
    age: int; weight_kg: float; height_cm: float
    goal: str = "maintain"       # lose / gain / maintain
    diet: str = "none"           # veg / vegan / keto ...
    allergies: str = ""; dislikes: str = ""; days: int = 3

@router.post("/recipe")
def recipe(r: RecipeReq):
    return ask_json(f"""User request: "{r.query}", servings {r.servings}, diet "{r.diet}".
Return JSON: {{"dish":str,"ingredients":[str],"steps":[str],"time_min":int,
"tips":[str],"substitutions":[str]}}""")

@router.post("/mealplan")
def mealplan(p: Profile):
    return ask_json(f"""Create a {p.days}-day meal plan for: {p.model_dump_json()}.
Return JSON: {{"daily_calories":int,"macro_split":{{"protein":int,"carbs":int,"fat":int}},
"days":[{{"day":int,"meals":[{{"type":str,"name":str,"calories":int}}]}}],"advice":str}}""")

@router.post("/transcribe")
async def transcribe(file: UploadFile = File(...)):
    global _whisper
    from faster_whisper import WhisperModel
    _whisper = _whisper or WhisperModel("base", compute_type="int8")
    with tempfile.NamedTemporaryFile(suffix=".webm") as t:
        t.write(await file.read()); t.flush()
        segs, _ = _whisper.transcribe(t.name)
        text = " ".join(s.text for s in segs).strip()
    return {"text": text, "recipe": recipe(RecipeReq(query=text)) if text else None}

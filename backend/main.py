
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

import vision
import hygiene
import cooking

app = FastAPI(title="FoodVerse")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(vision.router, prefix="/api/food", tags=["food"])
app.include_router(hygiene.router, prefix="/api/hygiene", tags=["hygiene"])
app.include_router(cooking.router, prefix="/api/cook", tags=["cooking"])


@app.get("/api/health")
def health():
    return {"ok": True}

from fastapi import APIRouter
from pydantic import BaseModel

router = APIRouter(prefix="/tutor", tags=["Tutor"])

# -----------------------------
# Schema
# -----------------------------
class TutorRequest(BaseModel):
    question: str
    weak_areas: list[str] = []


# -----------------------------
# Tutor API
# -----------------------------
@router.post("/explain")
def explain_topic(payload: TutorRequest):
    question = payload.question
    weak_areas = payload.weak_areas

    # Temporary static response (Gemini later)
    explanation = (
        f"You asked: '{question}'. "
        f"Based on your weak areas {weak_areas}, "
        f"I recommend revising fundamentals and practicing examples."
    )

    return {
        "answer": explanation
    }


from fastapi import APIRouter
from pydantic import BaseModel
from typing import Dict, List

router = APIRouter(prefix="/diagnostic", tags=["Diagnostic"])

# -------------------------------
# Schemas
# -------------------------------
class DiagnosticRequest(BaseModel):
    responses: Dict[str, str]


# -------------------------------
# Questions API
# -------------------------------
@router.get("/questions")
def get_questions():
    # TEMP SAMPLE (we’ll replace with your 100 questions next)
    return [
        {
            "id": "q1",
            "question": "If log₂(x) = 5, what is x?",
            "options": ["10", "16", "25", "32"],
            "answer": "32",
            "topic": "Aptitude"
        },
        {
            "id": "q2",
            "question": "Time complexity of binary search?",
            "options": ["O(n)", "O(log n)", "O(n²)", "O(1)"],
            "answer": "O(log n)",
            "topic": "DSA"
        }
    ]


# -------------------------------
# Analysis API
# -------------------------------
@router.post("/analyze")
def analyze_test(payload: DiagnosticRequest):
    responses = payload.responses

    weak = set()
    strong = set()

    # VERY BASIC analysis (placeholder)
    for qid, ans in responses.items():
        if ans:
            strong.add("General")
        else:
            weak.add("General")

    return {
        "weak_areas": list(weak),
        "strong_areas": list(strong),
        "learning_style": "Visual",
        "learning_speed": "Medium",
        "best_study_time": "Morning",
        "summary": "Diagnostic analysis completed."
    }

# backend/api/diagnostic_analyzer.py

from collections import defaultdict
from typing import Dict, List

def analyze_diagnostic(answers: Dict[str, str], questions: List[Dict]):
    topic_stats = defaultdict(lambda: {"correct": 0, "total": 0})

    # -------- Evaluate answers ----------
    for q in questions:
        qid = str(q["id"])
        topic = q.get("topic", "General")
        correct = q.get("correct_answer")

        topic_stats[topic]["total"] += 1
        if answers.get(qid) == correct:
            topic_stats[topic]["correct"] += 1

    weak_areas = []
    strong_areas = []

    for topic, stats in topic_stats.items():
        accuracy = stats["correct"] / max(stats["total"], 1)

        if accuracy < 0.4:
            weak_areas.append(topic)
        elif accuracy >= 0.7:
            strong_areas.append(topic)

    total_questions = sum(v["total"] for v in topic_stats.values())
    total_correct = sum(v["correct"] for v in topic_stats.values())

    accuracy_pct = int((total_correct / max(total_questions, 1)) * 100)

    learning_speed = (
        "Slow" if accuracy_pct < 40 else
        "Medium" if accuracy_pct < 70 else
        "Fast"
    )

    learning_style = "Visual" if weak_areas else "Logical"
    best_study_time = "Morning" if learning_speed != "Fast" else "Evening"

    return {
        "weak_areas": weak_areas or ["None"],
        "strong_areas": strong_areas or ["None"],
        "learning_style": learning_style,
        "learning_speed": learning_speed,
        "best_study_time": best_study_time,
        "summary": f"Accuracy: {accuracy_pct}%. Focus on weak topics."
    }

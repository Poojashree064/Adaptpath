from pydantic import BaseModel

class PredictRequest(BaseModel):
    ability: float
    time_taken: int
    hints_used: int
    topic_enc: int
    subtopic_enc: int
    difficulty_enc: int
    style_enc: int
    speed_enc: int
    student_enc: int
    prev_correct_1: int
    prev_correct_2: int
    prev_correct_3: int
    rolling_accuracy_5: float
    rolling_accuracy_10: float
    topic_attempt_count: int
    topic_correct_rate: float

class TutorRequest(BaseModel):
    question: str
    learning_style: str

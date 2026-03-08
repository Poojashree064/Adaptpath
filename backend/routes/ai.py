"""
AdaptPath Backend API - Fixed Version
No dependency on routes.ai to avoid import errors
"""

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from typing import List, Dict, Optional, Any
import json
import os
from datetime import datetime
import joblib
import numpy as np

# Try to import Gemini, handle if not available
try:
    import google.generativeai as genai
    GEMINI_AVAILABLE = True
except ImportError:
    GEMINI_AVAILABLE = False
    print("⚠️ google-generativeai not installed. Install with: pip install google-generativeai")

# Initialize FastAPI
app = FastAPI(
    title="AdaptPath API",
    description="AI-Powered Adaptive Learning Platform",
    version="2.0.0"
)

# ==================== CORS Configuration (FIXED!) ====================
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://localhost:5173",
        "http://localhost:5174",
        "http://localhost:5175",
        "http://localhost:5176",
        "http://localhost:5177",  # Your current port
        "http://localhost:5178",
        "http://127.0.0.1:5173",
        "http://127.0.0.1:5177",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ==================== CONFIGURATION ====================

GEMINI_API_KEY = os.getenv("GEMINI_API_KEY", "")
MODEL_PATH = os.getenv("MODEL_PATH", "models/adaptpath_xgb_v2.pkl")

# Configure Gemini AI
gemini_model = None
if GEMINI_API_KEY and GEMINI_AVAILABLE:
    genai.configure(api_key=GEMINI_API_KEY)
    gemini_model = genai.GenerativeModel('gemini-1.5-flash')
    print("✅ Gemini AI configured successfully")
else:
    print("⚠️ Gemini AI not configured - using fallback responses")

# Load ML Model
ml_model = None
try:
    if os.path.exists(MODEL_PATH):
        ml_model = joblib.load(MODEL_PATH)
        print(f"✅ ML Model loaded from {MODEL_PATH}")
    else:
        print(f"⚠️ Model file not found at {MODEL_PATH}")
except Exception as e:
    print(f"⚠️ Error loading ML model: {e}")

# ==================== PYDANTIC MODELS ====================

class Question(BaseModel):
    id: int
    section: str
    question: str
    options: Optional[List[str]] = None
    answer: str
    type: Optional[str] = None

class DiagnosticAnalysisRequest(BaseModel):
    answers: Dict[str, Any]
    questions: List[Question]

class DiagnosticAnalysisResponse(BaseModel):
    total: Dict[str, Any]
    sections: Dict[str, Any]
    weak_areas: List[str]
    medium_areas: List[str]
    strong_areas: List[str]
    learning_path: List[Dict[str, str]]
    study_plan: List[Dict[str, str]]

class TutorRequest(BaseModel):
    question: str
    weak_areas: List[str] = []
    context: Optional[str] = None

class TutorResponse(BaseModel):
    answer: str
    suggestions: List[str] = []

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

class PredictResponse(BaseModel):
    prediction: int
    confidence: float
    recommendation: str

# AI TUTOR MODELS
class Message(BaseModel):
    role: str
    content: str
    timestamp: str

class ChatRequest(BaseModel):
    student_id: str
    message: str
    conversation_history: Optional[List[Message]] = []

class ChatResponse(BaseModel):
    response: str
    timestamp: str
    source: str = "gemini"

# ==================== HELPER FUNCTIONS ====================

def analyze_test_results(questions: List[Question], answers: Dict[str, Any]) -> Dict:
    """Analyze diagnostic test results"""
    
    report = {
        "total": {
            "correct": 0,
            "attempted": 0,
            "accuracy": 0
        },
        "sections": {}
    }
    
    for q in questions:
        section = q.section
        if section not in report["sections"]:
            report["sections"][section] = {
                "correct": 0,
                "total": 0,
                "accuracy": 0
            }
        
        report["sections"][section]["total"] += 1
        
        answer_key = str(q.id)
        if answer_key in answers and answers[answer_key]:
            report["total"]["attempted"] += 1
            
            user_answer = answers[answer_key]
            if user_answer == q.answer:
                report["total"]["correct"] += 1
                report["sections"][section]["correct"] += 1
    
    if len(questions) > 0:
        report["total"]["accuracy"] = (report["total"]["correct"] / len(questions)) * 100
    
    for section in report["sections"]:
        s = report["sections"][section]
        if s["total"] > 0:
            s["accuracy"] = (s["correct"] / s["total"]) * 100
    
    return report

def generate_learning_path(sections: Dict[str, Any]) -> tuple:
    """Generate personalized learning path"""
    
    weak = []
    medium = []
    strong = []
    
    for section, data in sections.items():
        accuracy = data.get("accuracy", 0)
        
        if accuracy < 40:
            weak.append(section)
        elif accuracy < 70:
            medium.append(section)
        else:
            strong.append(section)
    
    return weak, medium, strong

def create_study_plan(weak: List[str], medium: List[str], strong: List[str]) -> List[Dict]:
    """Create actionable study plan"""
    
    plan = []
    
    for topic in weak:
        plan.append({
            "topic": topic,
            "priority": "HIGH",
            "action": "Intensive Practice Required",
            "recommendation": "Start with basics, do 10+ problems daily",
            "time_allocation": "2-3 hours/day"
        })
    
    for topic in medium:
        plan.append({
            "topic": topic,
            "priority": "MEDIUM",
            "action": "Regular Practice Needed",
            "recommendation": "Solve 5-7 problems daily, focus on concepts",
            "time_allocation": "1-2 hours/day"
        })
    
    for topic in strong:
        plan.append({
            "topic": topic,
            "priority": "LOW",
            "action": "Maintain Proficiency",
            "recommendation": "Weekly revision, solve advanced problems",
            "time_allocation": "30 mins/day"
        })
    
    return plan

def generate_ai_tutor_response(message: str, history: List[Message]) -> str:
    """Generate AI Tutor response using Gemini or fallback"""
    
    message_lower = message.lower()
    
    # Try Gemini first
    if gemini_model:
        try:
            conversation = []
            
            system_prompt = """You are an expert AI Tutor for AdaptPath, helping students prepare for placements.

Specialize in: DSA, DBMS, OS, Networks, OOP, Interview Prep.

Style:
- Concise (200-400 words)
- Use bullet points
- Code examples when relevant
- Time/space complexity
- Encouraging

Format code:
```python
def example():
    return "code"
```"""
            
            conversation.append({"role": "user", "parts": [system_prompt]})
            conversation.append({"role": "model", "parts": ["Ready to help! What would you like to learn?"]})
            
            for msg in history[-6:]:
                role = "model" if msg.role == "assistant" else "user"
                conversation.append({"role": role, "parts": [msg.content]})
            
            chat = gemini_model.start_chat(history=conversation)
            response = chat.send_message(message)
            return response.text
            
        except Exception as e:
            print(f"Gemini error: {e}")
    
    # Fallback responses
    if 'binary search' in message_lower:
        return """**Binary Search Algorithm** 🔍

Finds target in **sorted array** efficiently.

**Steps:**
1. Compare with middle
2. If equal → Found!
3. If less → Search left
4. If more → Search right

**Code:**
```python
def binary_search(arr, target):
    left, right = 0, len(arr) - 1
    
    while left <= right:
        mid = (left + right) // 2
        
        if arr[mid] == target:
            return mid
        elif arr[mid] < target:
            left = mid + 1
        else:
            right = mid - 1
    
    return -1
```

**Complexity:**
• Time: O(log n)
• Space: O(1)

**Key:** Array must be sorted!

Practice: LeetCode #704"""

    elif 'normalization' in message_lower or 'normal form' in message_lower:
        return """**Database Normalization** 🗄️

Reduces redundancy, improves integrity.

**Forms:**

**1NF:** Atomic values, no repeating
**2NF:** 1NF + no partial dependencies  
**3NF:** 2NF + no transitive dependencies

**Example:**

Before:
```
Student(ID, Name, Course1, Course2)
```

After:
```
Student(StudentID, Name)
Enrollment(StudentID, CourseID)
Course(CourseID, CourseName)
```

**Benefits:**
• Less redundancy
• No anomalies
• Better consistency"""

    elif 'process' in message_lower and 'thread' in message_lower:
        return """**Process vs Thread** ⚙️

**Process:**
• Independent unit
• Own memory
• Heavy-weight

**Thread:**
• Lightweight
• Shares memory
• Faster

**Comparison:**

| Aspect | Process | Thread |
|--------|---------|--------|
| Memory | Separate | Shared |
| Speed | Slower | Faster |
| Communication | IPC | Shared memory |

**Use:**
• Processes: Isolation needed
• Threads: Shared data, parallel"""

    elif 'time complexity' in message_lower or 'big o' in message_lower:
        return """**Time Complexity** ⏱️

**Common:**

O(1) - Constant
O(log n) - Logarithmic
O(n) - Linear  
O(n log n) - Linearithmic
O(n²) - Quadratic
O(2ⁿ) - Exponential

**Examples:**

```python
# O(1) - Array access
arr[5]

# O(log n) - Binary search
binary_search(arr, target)

# O(n) - Linear search
for x in arr:
    print(x)

# O(n²) - Nested loops
for i in range(n):
    for j in range(n):
        # operation
```

**Order:**
O(1) < O(log n) < O(n) < O(n log n) < O(n²)"""

    else:
        return f"""Hi! I'm your AI Tutor 👋

I can help with:
✅ DSA (Arrays, Trees, Graphs, DP)
✅ DBMS (SQL, Normalization)
✅ OS (Processes, Threads, Memory)
✅ Interview prep

**Try:**
• "Explain binary search"
• "What is normalization?"
• "Process vs thread"
• "Time complexity basics"

What would you like to learn? 🚀"""

# ==================== API ENDPOINTS ====================

@app.get("/")
def root():
    return {
        "message": "AdaptPath API v2.0",
        "status": "running",
        "gemini": gemini_model is not None,
        "ml_model": ml_model is not None,
        "ai_tutor": "enabled",
        "timestamp": datetime.now().isoformat()
    }

@app.get("/health")
@app.get("/api/health")
def health_check():
    return {
        "status": "healthy",
        "services": {
            "api": "running",
            "gemini": "active" if gemini_model else "fallback",
            "ml_model": "loaded" if ml_model else "not loaded",
            "ai_tutor": "enabled"
        }
    }

# ==================== DIAGNOSTIC ENDPOINTS ====================

@app.post("/api/diagnostic/analyze", response_model=DiagnosticAnalysisResponse)
async def analyze_diagnostic(request: DiagnosticAnalysisRequest):
    try:
        report = analyze_test_results(request.questions, request.answers)
        weak, medium, strong = generate_learning_path(report["sections"])
        study_plan = create_study_plan(weak, medium, strong)
        
        return {
            "total": report["total"],
            "sections": report["sections"],
            "weak_areas": weak,
            "medium_areas": medium,
            "strong_areas": strong,
            "learning_path": [
                {"category": "weak", "topics": weak},
                {"category": "medium", "topics": medium},
                {"category": "strong", "topics": strong}
            ],
            "study_plan": study_plan
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# ==================== AI TUTOR ENDPOINTS ====================

@app.post("/ai-tutor/chat", response_model=ChatResponse)
async def chat_with_ai_tutor(request: ChatRequest):
    """Main AI Tutor chat endpoint"""
    try:
        response_text = generate_ai_tutor_response(
            request.message,
            request.conversation_history
        )
        
        return ChatResponse(
            response=response_text,
            timestamp=datetime.now().isoformat(),
            source="gemini" if gemini_model else "fallback"
        )
    except Exception as e:
        print(f"AI Tutor error: {str(e)}")
        return ChatResponse(
            response="I'm having trouble. Please try again!",
            timestamp=datetime.now().isoformat(),
            source="error"
        )

@app.get("/ai-tutor/health")
async def ai_tutor_health():
    return {
        "status": "operational",
        "gemini_available": gemini_model is not None,
        "mode": "gemini" if gemini_model else "fallback"
    }

@app.get("/ai-tutor")
async def ai_tutor_info():
    return {
        "name": "AdaptPath AI Tutor",
        "version": "1.0.0",
        "powered_by": "Gemini" if gemini_model else "Fallback",
        "status": "active"
    }

# ==================== ORIGINAL TUTOR ====================

@app.post("/api/tutor/explain", response_model=TutorResponse)
async def ask_tutor(request: TutorRequest):
    try:
        if gemini_model:
            prompt = f"Explain: {request.question}\nWeak areas: {request.weak_areas}"
            response = gemini_model.generate_content(prompt)
            answer = response.text
        else:
            answer = f"About '{request.question}': Start with basics, practice daily, review thoroughly."
        
        return TutorResponse(
            answer=answer,
            suggestions=["Practice daily", "Review concepts", "Take tests"]
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# ==================== ML PREDICTION ====================

@app.post("/api/model/predict", response_model=PredictResponse)
async def predict_performance(request: PredictRequest):
    try:
        if not ml_model:
            raise HTTPException(status_code=503, detail="ML model not loaded")
        
        features = np.array([[
            request.ability, request.time_taken, request.hints_used,
            request.topic_enc, request.subtopic_enc, request.difficulty_enc,
            request.style_enc, request.speed_enc, request.student_enc,
            request.prev_correct_1, request.prev_correct_2, request.prev_correct_3,
            request.rolling_accuracy_5, request.rolling_accuracy_10,
            request.topic_attempt_count, request.topic_correct_rate
        ]])
        
        prob = ml_model.predict_proba(features)[0][1]
        pred = int(prob >= 0.5)
        
        if prob >= 0.8:
            rec = "Excellent!"
        elif prob >= 0.6:
            rec = "Good chance!"
        elif prob >= 0.4:
            rec = "Moderate difficulty"
        else:
            rec = "Review first"
        
        return PredictResponse(
            prediction=pred,
            confidence=float(prob),
            recommendation=rec
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# ==================== AUTH ====================

@app.post("/api/auth/register")
async def register(user_data: Dict[str, str]):
    return {"success": True, "user_id": "temp"}

@app.post("/api/auth/login")
async def login(credentials: Dict[str, str]):
    return {"success": True, "token": "temp"}

# ==================== STARTUP ====================

@app.on_event("startup")
async def startup():
    print("\n" + "="*60)
    print("🚀 AdaptPath Backend Starting...")
    print("="*60)
    print(f"✅ Gemini AI: {'Active' if gemini_model else 'Fallback Mode'}")
    print(f"✅ ML Model: {'Loaded' if ml_model else 'Not Loaded'}")
    print(f"✅ AI Tutor: Enabled")
    print(f"✅ CORS: Fixed for all ports")
    print("="*60)
    print(f"📡 Server: http://localhost:8000")
    print(f"🤖 AI Tutor: http://localhost:8000/ai-tutor/health")
    print("="*60 + "\n")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
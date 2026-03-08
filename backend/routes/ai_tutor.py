"""
AI Tutor Router
Add this file to: backend/routes/ai_tutor.py
"""

from fastapi import APIRouter
from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime
import os

# Try Gemini import
try:
    import google.generativeai as genai
    GEMINI_AVAILABLE = True
except:
    GEMINI_AVAILABLE = False

router = APIRouter(prefix="/ai-tutor", tags=["AI Tutor"])

# Configure Gemini if available
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY", "")
gemini_model = None

if GEMINI_API_KEY and GEMINI_AVAILABLE:
    genai.configure(api_key=GEMINI_API_KEY)
    gemini_model = genai.GenerativeModel('gemini-1.5-flash')

# Models
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

# AI Response Generator
def get_ai_response(message: str) -> str:
    """Generate AI response"""
    msg = message.lower()
    
    # Try Gemini
    if gemini_model:
        try:
            prompt = f"""You are an expert tutor. Answer concisely (200-400 words).
Question: {message}
Provide clear explanation with examples."""
            response = gemini_model.generate_content(prompt)
            return response.text
        except:
            pass
    
    # Fallback
    if 'binary search' in msg:
        return """**Binary Search** 🔍

Finds target in sorted array.

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

**Time:** O(log n)
**Space:** O(1)

Try LeetCode #704!"""

    elif 'normalization' in msg:
        return """**Database Normalization** 🗄️

**1NF:** Atomic values
**2NF:** No partial dependencies
**3NF:** No transitive dependencies

**Example:**
Before: Student(ID, Name, Course1, Course2)
After: Student(ID, Name) + Enrollment(StudentID, CourseID)

Reduces redundancy!"""

    elif 'process' in msg and 'thread' in msg:
        return """**Process vs Thread** ⚙️

**Process:** Independent, own memory, heavier
**Thread:** Shares memory, lighter, faster

Use processes for isolation, threads for shared data."""

    else:
        return f"""Hi! I'm your AI Tutor 👋

I can help with:
✅ DSA (Arrays, Trees, DP)
✅ DBMS (SQL, Normalization)
✅ OS (Processes, Threads)

**Try:**
• "Explain binary search"
• "What is normalization?"
• "Process vs thread"

What would you like to learn? 🚀"""

# Endpoints
@router.post("/chat", response_model=ChatResponse)
async def chat(request: ChatRequest):
    """Chat with AI Tutor"""
    try:
        response_text = get_ai_response(request.message)
        return ChatResponse(
            response=response_text,
            timestamp=datetime.now().isoformat(),
            source="gemini" if gemini_model else "fallback"
        )
    except Exception as e:
        return ChatResponse(
            response="Sorry, having trouble. Try again!",
            timestamp=datetime.now().isoformat(),
            source="error"
        )

@router.get("/health")
async def health():
    """Health check"""
    return {
        "status": "operational",
        "mode": "gemini" if gemini_model else "fallback",
        "message": "AI Tutor ready!"
    }

@router.get("")
@router.get("/")
async def info():
    """Tutor info"""
    return {
        "name": "AdaptPath AI Tutor",
        "version": "1.0.0",
        "status": "active"
    }
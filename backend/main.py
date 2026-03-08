"""
AdaptPath Backend - Working Version with google-generativeai
FastAPI backend with AI Tutor and Study Plan Generation
"""

# ✅ Load .env file FIRST
from dotenv import load_dotenv
load_dotenv()

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional, Dict, Any
from datetime import datetime
import os

# ✅ Using OLD (but working) package
import google.generativeai as genai

# ============================================================
# FASTAPI APP INITIALIZATION
# ============================================================

app = FastAPI(
    title="AdaptPath API",
    description="AI-Powered Adaptive Learning Platform",
    version="2.0.0"
)

# CORS Configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ============================================================
# GEMINI AI CONFIGURATION
# ============================================================

GEMINI_API_KEY = os.getenv("GEMINI_API_KEY", "")
if GEMINI_API_KEY:
    genai.configure(api_key=GEMINI_API_KEY)

# ============================================================
# PYDANTIC MODELS
# ============================================================

class ChatRequest(BaseModel):
    student_id: str
    message: str
    conversation_history: List[Dict[str, str]] = []

class StudyPlanRequest(BaseModel):
    student_id: str
    weak_topics: List[str]
    learning_style: str = "visual"
    target_weeks: int = 1

class DiagnosticAnalysisRequest(BaseModel):
    questions: List[Dict[str, Any]]
    answers: Dict[str, Any]

# ============================================================
# AI TUTOR SERVICE CLASS
# ============================================================

class AITutorService:
    """Handles all AI Tutor interactions using Gemini"""
    
    def __init__(self):
        try:
            if not GEMINI_API_KEY:
                print("⚠️ GEMINI_API_KEY not found in environment variables")
                self.model = None
                self.is_configured = False
                return
            
            self.model = genai.GenerativeModel('models/gemini-2.5-flash')
            self.is_configured = True
            print("✅ Gemini API initialized successfully")
            
        except Exception as e:
            self.model = None
            self.is_configured = False
            print(f"⚠️ Gemini API initialization failed: {str(e)}")
    
    def chat(self, student_id: str, message: str, conversation_history: List[Dict[str, str]]) -> str:
        """Chat with AI tutor"""
        try:
            if not self.is_configured or not self.model:
                return "I'm having trouble connecting to my AI brain right now. Please check if the GEMINI_API_KEY is configured correctly. 🔧"
            
            # Build conversation context
            system_prompt = """You are an expert AI tutor specializing in computer science, data structures, 
            algorithms, aptitude, and placement preparation. You are patient, encouraging, and provide 
            clear explanations with examples. Always:
            
            1. Break down complex concepts into simple steps
            2. Provide practical examples and analogies
            3. Encourage the student and build confidence
            4. Suggest practice problems when relevant
            5. Use emojis occasionally to make learning fun
            6. Be concise but thorough
            
            Student context: You're helping a placement preparation student."""
            
            # Format conversation
            full_conversation = f"{system_prompt}\n\n"
            for msg in conversation_history[-5:]:
                role = msg.get("role", "user")
                content = msg.get("content", "")
                full_conversation += f"{role.upper()}: {content}\n"
            
            full_conversation += f"\nSTUDENT: {message}\n\nAI TUTOR:"
            
            # Generate response
            response = self.model.generate_content(full_conversation)
            return response.text
            
        except Exception as e:
            print(f"❌ Error in chat: {str(e)}")
            return f"I encountered an error while processing your question. Please try rephrasing it or try again."
    
    def generate_hint(self, question: str) -> str:
        """Generate a hint without revealing the answer"""
        try:
            if not self.is_configured or not self.model:
                return "Hint service unavailable. Please check API configuration."
            
            prompt = f"""For the following problem, provide a helpful hint that guides the student 
            toward the solution WITHOUT revealing the answer directly:
            
            Problem: {question}
            
            Provide a hint that:
            1. Points to the key concept needed
            2. Suggests an approach or pattern
            3. Doesn't give away the answer
            4. Is encouraging and supportive"""
            
            response = self.model.generate_content(prompt)
            return response.text
            
        except Exception as e:
            return f"Error generating hint: {str(e)[:100]}"

# Initialize AI Tutor Service
ai_tutor_service = AITutorService()

# ============================================================
# HEALTH CHECK ENDPOINTS
# ============================================================

@app.get("/")
async def root():
    """Root endpoint - health check"""
    return {
        "status": "online",
        "service": "AdaptPath API",
        "version": "2.0.0",
        "timestamp": datetime.now().isoformat(),
        "ai_configured": ai_tutor_service.is_configured
    }

@app.get("/health")
async def health_check():
    """Detailed health check"""
    return {
        "status": "healthy",
        "gemini_configured": ai_tutor_service.is_configured,
        "endpoints_available": [
            "/ai-tutor/chat",
            "/ai-tutor/generate-plan",
            "/ai-tutor/hint",
            "/diagnostic/analyze"
        ],
        "timestamp": datetime.now().isoformat()
    }

# ============================================================
# AI TUTOR ENDPOINTS
# ============================================================

@app.post("/ai-tutor/chat")
async def chat_with_tutor(request: ChatRequest):
    """Chat with AI tutor for learning support"""
    try:
        print(f"\n{'='*60}")
        print(f"📨 NEW CHAT MESSAGE")
        print(f"{'='*60}")
        print(f"Student: {request.student_id}")
        print(f"Message: {request.message}")
        print(f"History: {len(request.conversation_history)} previous messages")
        
        # ✅ Include student_id parameter
        response_text = ai_tutor_service.chat(
            student_id=request.student_id,
            message=request.message,
            conversation_history=request.conversation_history
        )
        
        print(f"✅ Response generated successfully")
        print(f"{'='*60}\n")
        
        return {
            "response": response_text,
            "timestamp": datetime.now().isoformat()
        }
        
    except Exception as e:
        print(f"\n❌ ERROR during chat:")
        print(f"   Error: {str(e)}")
        print(f"{'='*60}\n")
        
        return {
            "response": "I'm having trouble connecting right now. Please try again in a moment! 🔄",
            "timestamp": datetime.now().isoformat()
        }

@app.post("/ai-tutor/generate-plan")
async def generate_study_plan(request: StudyPlanRequest):
    """Generate personalized AI study plan based on weak topics"""
    try:
        print(f"\n{'='*60}")
        print(f"📚 GENERATING STUDY PLAN")
        print(f"{'='*60}")
        print(f"Student: {request.student_id}")
        print(f"Weak Topics: {request.weak_topics}")
        
        days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']
        focus_topic = request.weak_topics[0] if request.weak_topics else 'General Practice'
        
        resource_map = {
            'DSA': {
                'youtube': ['Striver SDE Sheet', 'Abdul Bari Algorithms', 'GeeksforGeeks'],
                'practice': ['LeetCode', 'HackerRank', 'CodeChef']
            },
            'Aptitude': {
                'youtube': ['PrepInsta', 'IndiaBix', 'Career Anna'],
                'practice': ['IndiaBix Practice', 'Aptitude Tests']
            },
            'DBMS': {
                'youtube': ['Gate Smashers DBMS', 'Knowledge Gate'],
                'practice': ['SQL Practice', 'GeeksforGeeks DBMS']
            },
            'OS': {
                'youtube': ['Gate Smashers OS', 'Neso Academy'],
                'practice': ['OS Concepts Practice']
            },
            'CN': {
                'youtube': ['Gate Smashers Networks', 'Kurose Ross'],
                'practice': ['Network Protocol Practice']
            }
        }
        
        topic_resources = resource_map.get(focus_topic, resource_map['DSA'])
        
        plan = {
            "plan_summary": f"Personalized {request.target_weeks}-week study plan focusing on {', '.join(request.weak_topics[:2])}. Tailored to your {request.learning_style} learning style.",
            "weeks": [{
                "week": 1,
                "focus_topic": focus_topic,
                "current_accuracy": 0,
                "priority_level": "HIGH",
                "difficulty_level": "Foundation Building",
                "target_accuracy": 75,
                "learning_objectives": [
                    f"Master {focus_topic} fundamentals",
                    "Build problem-solving foundation",
                    "Improve accuracy to 75%+",
                    "Develop consistent practice habits"
                ],
                "daily_breakdown": [
                    {
                        "day": day,
                        "theme": f"Day {idx + 1}: {'Foundation' if idx < 2 else 'Practice' if idx < 5 else 'Review'}",
                        "tasks": [
                            f"📖 Review {focus_topic} core concepts ({30 + idx * 5} min)",
                            f"🎥 Watch 2-3 tutorial videos",
                            f"💻 Practice {10 + idx * 2} problems",
                            "📝 Take a short quiz",
                            "✍️ Document learnings and mistakes"
                        ],
                        "estimated_time": f"{2.5 + (idx * 0.2):.1f} hours",
                        "practice_problems": 10 + (idx * 2),
                        "focus": "Understanding basics" if idx < 3 else "Building speed and accuracy",
                        "resources": {
                            "youtube": [
                                {
                                    "title": f"{focus_topic} - Day {idx + 1} Tutorial",
                                    "channel": topic_resources['youtube'][idx % len(topic_resources['youtube'])],
                                    "url": f"https://www.youtube.com/results?search_query={focus_topic.replace(' ', '+')}+tutorial",
                                    "duration": f"{30 + idx * 5} min"
                                },
                                {
                                    "title": f"{focus_topic} Practice Problems",
                                    "channel": topic_resources['youtube'][(idx + 1) % len(topic_resources['youtube'])],
                                    "url": f"https://www.youtube.com/results?search_query={focus_topic.replace(' ', '+')}+problems",
                                    "duration": f"{25 + idx * 3} min"
                                }
                            ]
                        }
                    }
                    for idx, day in enumerate(days)
                ]
            }],
            "motivation_tips": [
                "🎯 Focus on understanding, not memorizing",
                "💪 Practice daily for best results",
                "📈 Track your progress",
                "🤝 Ask for help when needed",
                "✨ Consistency beats intensity"
            ]
        }
        
        print(f"✅ Study plan generated successfully")
        print(f"{'='*60}\n")
        
        return {"plan": plan}
        
    except Exception as e:
        print(f"\n❌ ERROR generating study plan: {str(e)}")
        print(f"{'='*60}\n")
        raise HTTPException(status_code=500, detail=f"Failed to generate study plan: {str(e)}")

@app.post("/ai-tutor/hint")
async def get_hint(request: dict):
    """Get a hint for a question without revealing the answer"""
    try:
        question = request.get("question", "")
        
        if not question:
            raise HTTPException(status_code=400, detail="Question is required")
        
        hint = ai_tutor_service.generate_hint(question)
        
        return {
            "hint": hint,
            "timestamp": datetime.now().isoformat()
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error generating hint: {str(e)}")

# ============================================================
# DIAGNOSTIC TEST ENDPOINTS
# ============================================================

@app.post("/diagnostic/analyze")
async def analyze_diagnostic(request: DiagnosticAnalysisRequest):
    """Analyze diagnostic test results"""
    try:
        questions = request.questions
        answers = request.answers
        
        report = {
            "total": {
                "correct": 0,
                "attempted": 0,
                "total": len(questions),
                "accuracy": 0
            },
            "sections": {}
        }
        
        for question in questions:
            section = question.get("section", "General")
            question_id = question.get("id")
            correct_answer = question.get("answer")
            
            if section not in report["sections"]:
                report["sections"][section] = {
                    "correct": 0,
                    "total": 0,
                    "attempted": 0,
                    "accuracy": 0
                }
            
            report["sections"][section]["total"] += 1
            
            if question_id in answers:
                report["total"]["attempted"] += 1
                report["sections"][section]["attempted"] += 1
                
                if answers[question_id] == correct_answer:
                    report["total"]["correct"] += 1
                    report["sections"][section]["correct"] += 1
        
        if report["total"]["attempted"] > 0:
            report["total"]["accuracy"] = (report["total"]["correct"] / report["total"]["attempted"]) * 100
        
        for section_data in report["sections"].values():
            if section_data["attempted"] > 0:
                section_data["accuracy"] = (section_data["correct"] / section_data["attempted"]) * 100
        
        return report
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Analysis error: {str(e)}")

# ============================================================
# MAIN ENTRY POINT
# ============================================================

if __name__ == "__main__":
    import uvicorn
    print("\n" + "="*60)
    print("🚀 Starting AdaptPath Backend Server")
    print("="*60)
    print(f"📡 Server: http://localhost:8000")
    print(f"📚 API Docs: http://localhost:8000/docs")
    print(f"🔧 Gemini AI: {'✅ Configured' if ai_tutor_service.is_configured else '⚠️ Not Configured'}")
    print("="*60 + "\n")
    
    uvicorn.run(app, host="0.0.0.0", port=8000, reload=True)
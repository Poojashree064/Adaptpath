"""
AI Tutor Service - FIXED VERSION
Handles chat interactions with Gemini AI
"""

import os
from typing import Optional, List, Dict
import google.generativeai as genai

class AITutorService:
    def __init__(self):
        """Initialize Gemini AI client"""
        api_key = os.getenv("GEMINI_API_KEY")
        
        if not api_key:
            print("⚠️  WARNING: GEMINI_API_KEY not found in environment")
            self.client = None
            return
        
        try:
            # Configure the API
            genai.configure(api_key=api_key)
            
            # FIXED: Use the correct model name for the stable API
            # Try gemini-1.5-flash first, fallback to gemini-pro
            try:
                self.model = genai.GenerativeModel('gemini-1.5-flash')
                print("✅ Gemini API configured with gemini-1.5-flash")
            except Exception as e:
                print(f"⚠️  gemini-1.5-flash not available, trying gemini-pro: {e}")
                self.model = genai.GenerativeModel('gemini-pro')
                print("✅ Gemini API configured with gemini-pro")
                
            self.client = True
            
        except Exception as e:
            print(f"❌ Failed to initialize Gemini: {e}")
            self.client = None
    
    def chat(
        self, 
        student_id: str, 
        message: str, 
        conversation_history: Optional[List[Dict]] = None
    ) -> str:
        """
        Handle chat interaction with AI tutor
        
        Args:
            student_id: Student identifier
            message: User's message
            conversation_history: Previous conversation context
            
        Returns:
            AI tutor's response
        """
        
        if not self.client:
            return "❌ AI Tutor is currently unavailable. Please check your API configuration."
        
        try:
            # Build conversation context
            context = self._build_context(conversation_history or [])
            
            # System prompt for the AI tutor
            system_prompt = """You are an expert AI tutor specializing in computer science placement preparation. 
Your role is to:
- Explain concepts clearly and concisely
- Provide step-by-step problem-solving guidance
- Offer study tips and interview preparation advice
- Be encouraging and supportive
- Use examples and analogies to make concepts easier to understand

Keep responses focused, helpful, and under 200 words unless detailed explanation is needed.
Use emojis occasionally to make the conversation friendly."""

            # Combine context and current message
            full_prompt = f"{system_prompt}\n\n{context}\n\nStudent: {message}\n\nAI Tutor:"
            
            # Generate response using Gemini
            response = self.model.generate_content(full_prompt)
            
            # Extract text from response
            if response and response.text:
                print(f"✅ Gemini responded successfully!")
                print(f"   Response length: {len(response.text)} characters")
                print(f"   Preview: {response.text[:100]}...")
                return response.text.strip()
            else:
                print("⚠️  Empty response from Gemini")
                return "I apologize - I had trouble processing that. Could you rephrase your question? 😊"
                
        except Exception as e:
            print(f"❌ Chat error: {type(e).__name__}. {str(e)}")
            import traceback
            traceback.print_exc()
            
            # User-friendly error message
            return "I apologize - I encountered an issue. Could you try rephrasing your question? 🤔"
    
    def _build_context(self, history: List[Dict]) -> str:
        """Build conversation context from history"""
        if not history:
            return "This is the start of a new conversation."
        
        context_lines = ["Previous conversation:"]
        for entry in history[-5:]:  # Last 5 messages for context
            role = entry.get('role', 'user')
            content = entry.get('content', '')
            context_lines.append(f"{role}: {content}")
        
        return "\n".join(context_lines)
    
    def generate_study_plan(
        self,
        student_id: str,
        weak_topics: List[str],
        learning_style: str = "visual",
        target_weeks: int = 4
    ) -> Dict:
        """
        Generate personalized study plan
        
        Args:
            student_id: Student identifier
            weak_topics: List of topics student needs to improve
            learning_style: Student's learning preference
            target_weeks: Duration for the plan
            
        Returns:
            Structured study plan
        """
        
        if not self.client:
            return self._generate_fallback_plan(weak_topics, target_weeks)
        
        try:
            prompt = f"""Create a detailed {target_weeks}-week study plan for a student who needs to improve in these topics:
{', '.join(weak_topics)}

Learning style: {learning_style}

Provide a structured plan in this format:

Week [number]: Focus on [main topic]
- Daily breakdown with specific tasks
- Practice problem recommendations
- Time allocation
- Success criteria

Make it actionable and realistic for someone preparing for tech interviews."""

            response = self.model.generate_content(prompt)
            
            if response and response.text:
                # Parse the response into structured format
                return self._parse_study_plan(response.text, weak_topics, target_weeks)
            else:
                return self._generate_fallback_plan(weak_topics, target_weeks)
                
        except Exception as e:
            print(f"❌ Study plan generation error: {e}")
            return self._generate_fallback_plan(weak_topics, target_weeks)
    
    def _parse_study_plan(self, ai_response: str, weak_topics: List[str], target_weeks: int) -> Dict:
        """Parse AI-generated study plan into structured format"""
        
        # This is a simplified parser - you can enhance it based on your needs
        return {
            "plan_summary": f"AI-generated {target_weeks}-week plan focusing on: {', '.join(weak_topics[:3])}",
            "weeks": [
                {
                    "week": i + 1,
                    "focus_topic": weak_topics[i % len(weak_topics)] if weak_topics else "General Practice",
                    "daily_breakdown": [
                        {
                            "day": day,
                            "tasks": [
                                "Review core concepts",
                                "Practice 5-7 problems",
                                "Watch tutorial videos",
                                "Take short quiz"
                            ]
                        }
                        for day in ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"]
                    ]
                }
                for i in range(target_weeks)
            ],
            "ai_response": ai_response  # Include full AI response
        }
    
    def _generate_fallback_plan(self, weak_topics: List[str], target_weeks: int) -> Dict:
        """Generate a basic study plan when AI is unavailable"""
        
        return {
            "plan_summary": f"Basic {target_weeks}-week study plan",
            "weeks": [
                {
                    "week": i + 1,
                    "focus_topic": weak_topics[i % len(weak_topics)] if weak_topics else "General Practice",
                    "daily_breakdown": [
                        {
                            "day": day,
                            "tasks": [
                                f"Study {weak_topics[i % len(weak_topics)] if weak_topics else 'core topics'} concepts",
                                "Practice 5 problems",
                                "Review mistakes",
                                "Take notes"
                            ]
                        }
                        for day in ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"]
                    ]
                }
                for i in range(target_weeks)
            ]
        }

# Global instance
ai_tutor_service = AITutorService()
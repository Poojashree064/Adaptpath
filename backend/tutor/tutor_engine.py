import google.generativeai as genai
from utils.config import settings

genai.configure(api_key=settings.GEMINI_API_KEY)

model = genai.GenerativeModel("gemini-1.5-flash")

def generate_explanation(result):
    prompt = f"""
    Student Diagnostic Report:
    Weak Areas: {result['weak_areas']}
    Learning Style: {result['learning_style']}
    Learning Speed: {result['learning_speed']}

    Give short, friendly study advice.
    """

    response = model.generate_content(prompt)
    return response.text

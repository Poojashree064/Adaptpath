"""
Test Script for AI Tutor Features
File: backend/test_ai_tutor.py

Run this to test all AI Tutor capabilities
"""

import requests
import json

API_URL = "http://localhost:8000"

def print_section(title):
    print("\n" + "="*70)
    print(f"  {title}")
    print("="*70)

def test_personalized_plan():
    print_section("TEST 1: PERSONALIZED LEARNING PLAN")
    
    response = requests.post(f"{API_URL}/ai-tutor/generate-plan", json={
        "student_id": "S001",
        "weak_topics": ["Binary Search", "Dynamic Programming", "Graphs"],
        "learning_style": "visual",
        "target_weeks": 4
    })
    
    if response.status_code == 200:
        data = response.json()
        plan = data['plan']
        
        print("\n📋 PLAN SUMMARY:")
        print(plan.get('plan_summary', 'No summary'))
        
        print("\n📅 WEEKLY BREAKDOWN:")
        for week in plan.get('weeks', [])[:2]:  # Show first 2 weeks
            print(f"\n  Week {week['week']}: {week['focus_topic']}")
            print(f"  Success Criteria: {week.get('success_criteria', 'N/A')}")
            
            # Show first 3 days
            for day in week.get('daily_breakdown', [])[:3]:
                print(f"\n    {day['day']}:")
                for task in day.get('tasks', []):
                    print(f"      • {task}")
                print(f"      Practice: {day.get('practice_problems', 0)} problems")
        
        print("\n✅ Plan generated successfully!")
    else:
        print(f"❌ Error: {response.status_code}")
        print(response.text)

def test_adaptive_explanation():
    print_section("TEST 2: ADAPTIVE EXPLANATION")
    
    # Test for beginner (35% accuracy)
    print("\n🎯 Beginner Level (35% accuracy):")
    response = requests.post(f"{API_URL}/ai-tutor/adaptive-explanation", json={
        "student_id": "S001",
        "topic": "Binary Search",
        "topic_accuracy": 0.35,
        "learning_style": "visual"
    })
    
    if response.status_code == 200:
        data = response.json()
        print(f"Level Adapted: {data['adapted_for_level']}")
        print(f"\nExplanation Preview:")
        print(data['explanation']['explanation'][:300] + "...")
    
    # Test for advanced (85% accuracy)
    print("\n\n🎯 Advanced Level (85% accuracy):")
    response = requests.post(f"{API_URL}/ai-tutor/adaptive-explanation", json={
        "student_id": "S001",
        "topic": "Binary Search",
        "topic_accuracy": 0.85,
        "learning_style": "visual"
    })
    
    if response.status_code == 200:
        data = response.json()
        print(f"Level Adapted: {data['adapted_for_level']}")
        print(f"\nExplanation Preview:")
        print(data['explanation']['explanation'][:300] + "...")

def test_mistake_analysis():
    print_section("TEST 3: MISTAKE PATTERN ANALYSIS")
    
    response = requests.post(f"{API_URL}/ai-tutor/analyze-mistakes", json={
        "student_id": "S001",
        "question_history": [
            {
                "topic": "Arrays",
                "correct": False,
                "question": "Find duplicate in array"
            },
            {
                "topic": "Arrays",
                "correct": False,
                "question": "Two sum problem"
            },
            {
                "topic": "Arrays",
                "correct": False,
                "question": "Remove duplicates from sorted array"
            },
            {
                "topic": "Linked Lists",
                "correct": False,
                "question": "Reverse a linked list"
            }
        ]
    })
    
    if response.status_code == 200:
        data = response.json()
        analysis = data['analysis']
        
        print("\n🔍 ANALYSIS RESULTS:")
        print(f"Pattern Detected: {analysis.get('has_pattern', False)}")
        print(f"Most Common Mistake: {analysis.get('most_common_mistake_topic', 'N/A')}")
        print(f"Frequency: {analysis.get('frequency', 0)} times")
        print(f"\n📊 AI Analysis:")
        print(analysis.get('analysis', 'No analysis available'))
        print(f"\n🎯 Recommended Focus:")
        for topic in analysis.get('recommended_focus', []):
            print(f"  • {topic}")

def test_real_time_feedback():
    print_section("TEST 4: REAL-TIME FEEDBACK")
    
    response = requests.post(f"{API_URL}/ai-tutor/real-time-feedback", json={
        "question": "What is the time complexity of binary search?",
        "user_answer": "O(n)",
        "correct_answer": "O(log n)",
        "explanation_needed": True
    })
    
    if response.status_code == 200:
        data = response.json()
        feedback = data['feedback']
        
        print("\n⚡ INSTANT FEEDBACK:")
        print(f"Correct: {feedback.get('is_correct', False)}")
        print(f"\n{feedback.get('feedback', 'No feedback')}")

def test_motivation():
    print_section("TEST 5: MOTIVATION MESSAGE")
    
    response = requests.post(f"{API_URL}/ai-tutor/motivation", json={
        "student_id": "S001",
        "overall_accuracy": 0.72,
        "streak_days": 5,
        "total_questions": 150
    })
    
    if response.status_code == 200:
        data = response.json()
        print("\n💪 MOTIVATION:")
        print(data['message'])

def main():
    print("\n" + "="*70)
    print("  🤖 TESTING AI TUTOR FEATURES")
    print("="*70)
    print("\nMake sure backend is running: python main.py")
    print("Press Enter to continue...")
    input()
    
    try:
        # Test all features
        test_personalized_plan()
        test_adaptive_explanation()
        test_mistake_analysis()
        test_real_time_feedback()
        test_motivation()
        
        print("\n" + "="*70)
        print("  ✅ ALL TESTS COMPLETED!")
        print("="*70)
        
    except requests.exceptions.ConnectionError:
        print("\n❌ ERROR: Cannot connect to backend!")
        print("Make sure the backend is running on http://localhost:8000")
    except Exception as e:
        print(f"\n❌ ERROR: {str(e)}")

if __name__ == "__main__":
    main()
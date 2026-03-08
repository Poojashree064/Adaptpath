"""
Analytics API Endpoints
Real-time analytics, tracking, and reporting
"""

from fastapi import APIRouter, HTTPException, Query
from pydantic import BaseModel, Field
from typing import List, Dict, Optional, Any
from datetime import datetime, timedelta
from enum import Enum

# Import analytics engines
import sys
sys.path.append('..')
from services.advanced_analytics import analytics_engine
from services.adaptive_planner import adaptive_engine
from services.interference import interference_detector
from services.spaced_repetition import spaced_repetition

router = APIRouter(prefix="/analytics", tags=["Analytics"])


# ==================== SCHEMAS ====================

class TimeRange(str, Enum):
    """Time range options for analytics"""
    WEEK = "week"
    MONTH = "month"
    QUARTER = "quarter"
    ALL_TIME = "all_time"


class AnalyticsRequest(BaseModel):
    """Request for analytics generation"""
    student_id: str
    time_range: TimeRange = TimeRange.MONTH
    include_predictions: bool = True
    include_peer_comparison: bool = False


class PerformanceLogEntry(BaseModel):
    """Single performance log entry"""
    student_id: str
    question_id: str
    topic: str
    subtopic: Optional[str] = None
    difficulty: str
    correct: bool
    time_taken: int
    hints_used: int = 0
    timestamp: Optional[str] = None


class BulkPerformanceLog(BaseModel):
    """Bulk performance logging"""
    entries: List[PerformanceLogEntry]


class LearningSession(BaseModel):
    """Learning session tracking"""
    student_id: str
    session_start: str
    session_end: str
    questions_attempted: int
    topics_covered: List[str]
    average_accuracy: float


class GoalSetting(BaseModel):
    """Student goal setting"""
    student_id: str
    goal_type: str  # "accuracy", "questions", "topics", "streak"
    target_value: float
    deadline: str
    current_value: float = 0.0


class ComparisonRequest(BaseModel):
    """Peer comparison request"""
    student_id: str
    comparison_group: str = "all"  # "all", "same_college", "same_level"


# ==================== ANALYTICS ENDPOINTS ====================

@router.get("/dashboard/{student_id}")
async def get_analytics_dashboard(
    student_id: str,
    time_range: TimeRange = Query(TimeRange.MONTH)
) -> Dict[str, Any]:
    """
    Get comprehensive analytics dashboard for a student
    
    Returns:
        - Overall performance metrics
        - Topic-wise breakdown
        - Learning patterns
        - Recommendations
        - Progress tracking
    """
    try:
        # In production, fetch from database
        # For now, simulate data retrieval
        learning_history = _fetch_student_history(student_id, time_range)
        diagnostic_results = _fetch_diagnostic_results(student_id)
        
        # Get time range in days
        time_days = {
            TimeRange.WEEK: 7,
            TimeRange.MONTH: 30,
            TimeRange.QUARTER: 90,
            TimeRange.ALL_TIME: 365
        }[time_range]
        
        # Generate comprehensive report
        report = analytics_engine.generate_comprehensive_report(
            student_id=student_id,
            learning_history=learning_history,
            diagnostic_results=diagnostic_results,
            time_period_days=time_days
        )
        
        return {
            "status": "success",
            "student_id": student_id,
            "time_range": time_range,
            "generated_at": datetime.now().isoformat(),
            "analytics": report
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Analytics generation failed: {str(e)}")


@router.get("/performance-trends/{student_id}")
async def get_performance_trends(
    student_id: str,
    days: int = Query(30, ge=7, le=365)
) -> Dict[str, Any]:
    """
    Get detailed performance trends over time
    
    Returns time-series data for:
    - Daily/weekly accuracy
    - Topic progression
    - Difficulty progression
    - Time management trends
    """
    try:
        history = _fetch_student_history(student_id, days=days)
        
        # Group by date
        from collections import defaultdict
        daily_stats = defaultdict(lambda: {
            "total": 0,
            "correct": 0,
            "topics": set(),
            "avg_time": []
        })
        
        for entry in history:
            date = entry.get('timestamp', datetime.now().isoformat())[:10]
            daily_stats[date]["total"] += 1
            if entry.get('correct', False):
                daily_stats[date]["correct"] += 1
            daily_stats[date]["topics"].add(entry.get('topic'))
            daily_stats[date]["avg_time"].append(entry.get('time_taken', 0))
        
        # Convert to trend data
        trends = []
        for date in sorted(daily_stats.keys()):
            stats = daily_stats[date]
            accuracy = (stats["correct"] / stats["total"] * 100) if stats["total"] > 0 else 0
            avg_time = sum(stats["avg_time"]) / len(stats["avg_time"]) if stats["avg_time"] else 0
            
            trends.append({
                "date": date,
                "accuracy": round(accuracy, 2),
                "questions_attempted": stats["total"],
                "questions_correct": stats["correct"],
                "unique_topics": len(stats["topics"]),
                "average_time_seconds": round(avg_time, 1)
            })
        
        return {
            "status": "success",
            "student_id": student_id,
            "period_days": days,
            "trends": trends,
            "summary": {
                "total_days_active": len(daily_stats),
                "average_daily_questions": round(sum(s["total"] for s in daily_stats.values()) / len(daily_stats), 1) if daily_stats else 0,
                "overall_accuracy": round(
                    sum(s["correct"] for s in daily_stats.values()) / 
                    sum(s["total"] for s in daily_stats.values()) * 100, 2
                ) if sum(s["total"] for s in daily_stats.values()) > 0 else 0
            }
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Trend analysis failed: {str(e)}")


@router.get("/topic-mastery/{student_id}")
async def get_topic_mastery(student_id: str) -> Dict[str, Any]:
    """
    Get detailed topic mastery analysis with progression tracking
    """
    try:
        history = _fetch_student_history(student_id)
        
        # Analyze topics
        topic_analysis = analytics_engine._analyze_topics(history)
        
        # Add progression data for each topic
        for topic, stats in topic_analysis.items():
            topic_history = [h for h in history if h.get('topic') == topic]
            
            # Calculate progression
            if len(topic_history) >= 5:
                first_five = topic_history[:5]
                last_five = topic_history[-5:]
                
                first_acc = sum(1 for h in first_five if h.get('correct', False)) / len(first_five) * 100
                last_acc = sum(1 for h in last_five if h.get('correct', False)) / len(last_five) * 100
                
                stats["progression"] = {
                    "initial_accuracy": round(first_acc, 2),
                    "current_accuracy": round(last_acc, 2),
                    "improvement": round(last_acc - first_acc, 2),
                    "trend": "improving" if last_acc > first_acc + 5 else 
                            "declining" if last_acc < first_acc - 5 else "stable"
                }
            else:
                stats["progression"] = {
                    "status": "insufficient_data"
                }
        
        # Categorize topics
        mastered = {t: s for t, s in topic_analysis.items() if s["mastery_level"] == "mastered"}
        proficient = {t: s for t, s in topic_analysis.items() if s["mastery_level"] == "proficient"}
        learning = {t: s for t, s in topic_analysis.items() if s["mastery_level"] == "learning"}
        struggling = {t: s for t, s in topic_analysis.items() if s["mastery_level"] == "struggling"}
        
        return {
            "status": "success",
            "student_id": student_id,
            "topic_breakdown": topic_analysis,
            "mastery_summary": {
                "mastered": {
                    "count": len(mastered),
                    "topics": list(mastered.keys()),
                    "average_accuracy": round(
                        sum(s["accuracy"] for s in mastered.values()) / len(mastered), 2
                    ) if mastered else 0
                },
                "proficient": {
                    "count": len(proficient),
                    "topics": list(proficient.keys())
                },
                "learning": {
                    "count": len(learning),
                    "topics": list(learning.keys())
                },
                "struggling": {
                    "count": len(struggling),
                    "topics": list(struggling.keys()),
                    "needs_attention": True
                }
            },
            "overall_mastery_score": round(
                (len(mastered) * 1.0 + len(proficient) * 0.7 + len(learning) * 0.4) / 
                len(topic_analysis) * 100, 2
            ) if topic_analysis else 0
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Topic mastery analysis failed: {str(e)}")


@router.get("/learning-insights/{student_id}")
async def get_learning_insights(student_id: str) -> Dict[str, Any]:
    """
    Get advanced learning insights including:
    - Learning style
    - Optimal study times
    - Interference patterns
    - Adaptive recommendations
    """
    try:
        history = _fetch_student_history(student_id)
        
        if not history or len(history) < 10:
            return {
                "status": "insufficient_data",
                "message": "Need at least 10 questions answered for insights",
                "current_count": len(history)
            }
        
        # Learning patterns
        patterns = analytics_engine._detect_learning_patterns(history)
        
        # Interference detection
        interference = interference_detector.detect_interference(history)
        
        # Adaptive recommendations
        weak_topics = [
            h.get('topic') for h in history 
            if not h.get('correct', False)
        ]
        weak_topics = list(set(weak_topics))[:5]
        
        study_plan = adaptive_engine.get_practice_plan(
            student_profile={"weak_topics": weak_topics},
            weak_topics=weak_topics,
            duration_minutes=30
        )
        
        return {
            "status": "success",
            "student_id": student_id,
            "learning_patterns": patterns,
            "interference_analysis": {
                "interference_score": interference["interference_score"],
                "critical_interferences": interference["retroactive_interference"][:3],
                "topic_confusions": interference["topic_confusion"],
                "recommendations": interference["recommendations"]
            },
            "adaptive_recommendations": {
                "study_plan": study_plan,
                "optimal_study_duration": "30-45 minutes per session",
                "recommended_frequency": "Daily practice recommended"
            },
            "personalized_tips": _generate_personalized_tips(patterns, history)
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Insights generation failed: {str(e)}")


@router.post("/log-performance")
async def log_performance(entry: PerformanceLogEntry) -> Dict[str, Any]:
    """
    Log a single performance entry
    """
    try:
        # Add timestamp if not provided
        if not entry.timestamp:
            entry.timestamp = datetime.now().isoformat()
        
        # In production, save to database
        # For now, return success with analytics
        
        # Calculate immediate feedback
        feedback = {
            "logged": True,
            "timestamp": entry.timestamp,
            "performance_category": "excellent" if entry.correct else "needs_practice",
            "time_efficiency": "good" if entry.time_taken < 60 else 
                               "slow" if entry.time_taken > 120 else "moderate"
        }
        
        return {
            "status": "success",
            "message": "Performance logged successfully",
            "entry_id": f"{entry.student_id}_{datetime.now().timestamp()}",
            "feedback": feedback
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Logging failed: {str(e)}")


@router.post("/log-performance-bulk")
async def log_performance_bulk(bulk_log: BulkPerformanceLog) -> Dict[str, Any]:
    """
    Log multiple performance entries at once (for session completion)
    """
    try:
        logged_count = len(bulk_log.entries)
        
        # Calculate session statistics
        correct_count = sum(1 for e in bulk_log.entries if e.correct)
        accuracy = (correct_count / logged_count * 100) if logged_count > 0 else 0
        
        total_time = sum(e.time_taken for e in bulk_log.entries)
        avg_time = total_time / logged_count if logged_count > 0 else 0
        
        topics = set(e.topic for e in bulk_log.entries)
        
        return {
            "status": "success",
            "message": f"Successfully logged {logged_count} entries",
            "session_summary": {
                "total_questions": logged_count,
                "correct_answers": correct_count,
                "accuracy": round(accuracy, 2),
                "total_time_seconds": total_time,
                "average_time_seconds": round(avg_time, 1),
                "topics_covered": list(topics),
                "performance_rating": "excellent" if accuracy >= 80 else
                                    "good" if accuracy >= 60 else
                                    "needs_improvement"
            }
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Bulk logging failed: {str(e)}")


@router.post("/track-session")
async def track_learning_session(session: LearningSession) -> Dict[str, Any]:
    """
    Track a complete learning session
    """
    try:
        # Calculate session duration
        start = datetime.fromisoformat(session.session_start)
        end = datetime.fromisoformat(session.session_end)
        duration_minutes = (end - start).total_seconds() / 60
        
        # Calculate metrics
        questions_per_minute = session.questions_attempted / duration_minutes if duration_minutes > 0 else 0
        
        return {
            "status": "success",
            "session_id": f"session_{datetime.now().timestamp()}",
            "summary": {
                "duration_minutes": round(duration_minutes, 1),
                "questions_attempted": session.questions_attempted,
                "topics_covered": len(session.topics_covered),
                "average_accuracy": session.average_accuracy,
                "questions_per_minute": round(questions_per_minute, 2),
                "effectiveness_score": _calculate_session_effectiveness(
                    duration_minutes,
                    session.questions_attempted,
                    session.average_accuracy
                )
            },
            "next_session_recommendation": {
                "recommended_gap": "1 day" if duration_minutes >= 30 else "Same day OK",
                "focus_areas": session.topics_covered[:3] if session.average_accuracy < 70 else ["New topics"],
                "suggested_duration": "30-45 minutes"
            }
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Session tracking failed: {str(e)}")


@router.get("/readiness-assessment/{student_id}")
async def assess_interview_readiness(student_id: str) -> Dict[str, Any]:
    """
    Comprehensive interview/placement readiness assessment
    """
    try:
        history = _fetch_student_history(student_id)
        diagnostic = _fetch_diagnostic_results(student_id)
        
        # Get readiness score
        readiness = analytics_engine._calculate_readiness_score(history, diagnostic)
        
        # Get topic coverage
        topic_analysis = analytics_engine._analyze_topics(history)
        required_topics = [
            "Arrays", "Linked Lists", "Trees", "Graphs", "Sorting",
            "Dynamic Programming", "SQL", "OOPS", "OS", "Networks"
        ]
        
        covered_topics = [t for t in required_topics if t in topic_analysis]
        coverage_percentage = len(covered_topics) / len(required_topics) * 100
        
        # Interview simulation score
        hard_questions = [h for h in history if h.get('difficulty') == 'hard']
        interview_simulation_score = (
            sum(1 for h in hard_questions if h.get('correct', False)) / 
            len(hard_questions) * 100
        ) if hard_questions else 0
        
        # Generate action plan
        if readiness["level"] == "ready":
            action_plan = [
                "Schedule mock interviews",
                "Practice company-specific questions",
                "Review system design concepts",
                "Polish communication skills"
            ]
        elif readiness["level"] == "nearly_ready":
            action_plan = [
                "Complete remaining weak topics",
                "Practice 5-10 hard problems daily",
                "Take full-length mock tests",
                "Review common interview patterns"
            ]
        else:
            action_plan = [
                "Build strong foundation in core topics",
                "Practice fundamentals daily",
                "Start with easy and medium problems",
                "Follow structured learning path"
            ]
        
        return {
            "status": "success",
            "student_id": student_id,
            "readiness_assessment": {
                "overall_readiness": readiness,
                "topic_coverage": {
                    "percentage": round(coverage_percentage, 2),
                    "covered": covered_topics,
                    "missing": [t for t in required_topics if t not in covered_topics]
                },
                "interview_simulation": {
                    "score": round(interview_simulation_score, 2),
                    "hard_problems_attempted": len(hard_questions),
                    "rating": "excellent" if interview_simulation_score >= 70 else
                             "good" if interview_simulation_score >= 50 else
                             "needs_practice"
                },
                "estimated_readiness_date": _estimate_readiness_date(readiness["score"]),
                "action_plan": action_plan,
                "strengths": _identify_strengths(topic_analysis),
                "focus_areas": readiness.get("areas_to_improve", [])
            }
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Readiness assessment failed: {str(e)}")


@router.get("/compare-peers/{student_id}")
async def compare_with_peers(
    student_id: str,
    comparison_group: str = "all"
) -> Dict[str, Any]:
    """
    Compare student performance with peers
    """
    try:
        history = _fetch_student_history(student_id)
        
        # Calculate student metrics
        student_accuracy = (
            sum(1 for h in history if h.get('correct', False)) / 
            len(history) * 100
        ) if history else 0
        
        student_questions = len(history)
        
        # Simulated peer data (in production, fetch from database)
        peer_stats = {
            "all": {"avg_accuracy": 65.5, "avg_questions": 150, "total_students": 10000},
            "same_college": {"avg_accuracy": 68.2, "avg_questions": 175, "total_students": 250},
            "same_level": {"avg_accuracy": 67.8, "avg_questions": 160, "total_students": 1500}
        }
        
        peers = peer_stats.get(comparison_group, peer_stats["all"])
        
        # Calculate rankings
        percentile = min(99, max(1, int(student_accuracy * 0.95)))  # Simulated
        
        return {
            "status": "success",
            "student_id": student_id,
            "comparison_group": comparison_group,
            "your_performance": {
                "accuracy": round(student_accuracy, 2),
                "questions_attempted": student_questions,
                "percentile": percentile
            },
            "peer_average": {
                "accuracy": peers["avg_accuracy"],
                "questions_attempted": peers["avg_questions"],
                "total_students": peers["total_students"]
            },
            "comparison": {
                "accuracy_difference": round(student_accuracy - peers["avg_accuracy"], 2),
                "questions_difference": student_questions - peers["avg_questions"],
                "performance_vs_peers": "above_average" if student_accuracy > peers["avg_accuracy"] else
                                       "below_average" if student_accuracy < peers["avg_accuracy"] else
                                       "average",
                "ranking_message": _get_ranking_message(percentile)
            },
            "leaderboard_position": {
                "rank": max(1, int(peers["total_students"] * (1 - percentile/100))),
                "total": peers["total_students"],
                "top_percentage": percentile
            }
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Peer comparison failed: {str(e)}")


@router.post("/set-goal")
async def set_learning_goal(goal: GoalSetting) -> Dict[str, Any]:
    """
    Set a learning goal and track progress
    """
    try:
        # Calculate progress
        progress_percentage = (goal.current_value / goal.target_value * 100) if goal.target_value > 0 else 0
        
        # Calculate days until deadline
        deadline = datetime.fromisoformat(goal.deadline)
        days_remaining = (deadline - datetime.now()).days
        
        # Calculate required daily progress
        remaining_value = goal.target_value - goal.current_value
        daily_target = remaining_value / max(days_remaining, 1) if days_remaining > 0 else remaining_value
        
        # Determine feasibility
        if progress_percentage >= 100:
            status = "achieved"
            message = "Congratulations! Goal achieved!"
        elif days_remaining <= 0:
            status = "expired"
            message = "Goal deadline has passed. Consider setting a new goal."
        elif daily_target <= 0:
            status = "achieved"
            message = "Goal already achieved!"
        elif progress_percentage >= 75:
            status = "on_track"
            message = "Great progress! Keep it up!"
        elif progress_percentage >= 50:
            status = "needs_effort"
            message = "Good start, but needs more consistent effort"
        else:
            status = "behind"
            message = "Behind schedule. Consider increasing daily practice"
        
        return {
            "status": "success",
            "goal_id": f"goal_{datetime.now().timestamp()}",
            "goal_details": {
                "type": goal.goal_type,
                "target": goal.target_value,
                "current": goal.current_value,
                "deadline": goal.deadline,
                "days_remaining": max(0, days_remaining)
            },
            "progress": {
                "percentage": round(progress_percentage, 2),
                "status": status,
                "message": message
            },
            "recommendations": {
                "daily_target": round(daily_target, 2),
                "weekly_target": round(daily_target * 7, 2),
                "suggested_action": _get_goal_action(goal.goal_type, daily_target)
            }
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Goal setting failed: {str(e)}")


@router.get("/export-report/{student_id}")
async def export_comprehensive_report(
    student_id: str,
    format: str = Query("json", regex="^(json|pdf|csv)$")
) -> Dict[str, Any]:
    """
    Export comprehensive performance report in various formats
    """
    try:
        # Generate comprehensive report
        history = _fetch_student_history(student_id)
        diagnostic = _fetch_diagnostic_results(student_id)
        
        report = analytics_engine.generate_comprehensive_report(
            student_id=student_id,
            learning_history=history,
            diagnostic_results=diagnostic,
            time_period_days=90
        )
        
        # Add export metadata
        export_data = {
            "export_date": datetime.now().isoformat(),
            "student_id": student_id,
            "report_period": "Last 90 days",
            "format": format,
            "report": report
        }
        
        if format == "json":
            return export_data
        elif format == "pdf":
            # In production, generate actual PDF
            return {
                "status": "success",
                "message": "PDF generation not implemented in this demo",
                "download_url": f"/downloads/report_{student_id}.pdf"
            }
        elif format == "csv":
            # In production, generate actual CSV
            return {
                "status": "success",
                "message": "CSV generation not implemented in this demo",
                "download_url": f"/downloads/report_{student_id}.csv"
            }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Report export failed: {str(e)}")


# ==================== HELPER FUNCTIONS ====================

def _fetch_student_history(student_id: str, time_range: TimeRange = None, days: int = None) -> List[Dict]:
    """
    Fetch student learning history from database
    In production, this would query the actual database
    """
    # Simulated data for demo
    from datetime import timedelta
    import random
    
    topics = ["Arrays", "Linked Lists", "Trees", "Dynamic Programming", "SQL", "OOPS"]
    difficulties = ["easy", "medium", "hard"]
    
    # Generate sample history
    history = []
    num_questions = random.randint(50, 200)
    
    for i in range(num_questions):
        timestamp = datetime.now() - timedelta(days=random.randint(0, 30))
        
        history.append({
            "question_id": f"Q{i:04d}",
            "topic": random.choice(topics),
            "difficulty": random.choice(difficulties),
            "correct": random.random() > 0.35,  # 65% accuracy
            "time_taken": random.randint(20, 120),
            "hints_used": random.randint(0, 2),
            "timestamp": timestamp.isoformat()
        })
    
    return sorted(history, key=lambda x: x['timestamp'])


def _fetch_diagnostic_results(student_id: str) -> Dict:
    """
    Fetch diagnostic test results from database
    """
    # Simulated data
    return {
        "total_questions": 100,
        "correct_answers": 65,
        "accuracy": 65.0,
        "weak_topics": ["Dynamic Programming", "Graphs"],
        "strong_topics": ["Arrays", "SQL"]
    }


def _calculate_session_effectiveness(duration: float, questions: int, accuracy: float) -> float:
    """
    Calculate session effectiveness score (0-100)
    """
    # Ideal: 30-45 minutes, 10-20 questions, 60%+ accuracy
    duration_score = 100 if 30 <= duration <= 45 else max(0, 100 - abs(duration - 37.5) * 2)
    question_score = 100 if 10 <= questions <= 20 else max(0, 100 - abs(questions - 15) * 5)
    accuracy_score = accuracy
    
    effectiveness = (duration_score * 0.3 + question_score * 0.2 + accuracy_score * 0.5)
    return round(effectiveness, 2)


def _generate_personalized_tips(patterns: Dict, history: List[Dict]) -> List[str]:
    """
    Generate personalized learning tips
    """
    tips = []
    
    # Based on peak performance time
    if "peak_performance_time" in patterns:
        peak = patterns["peak_performance_time"]
        if peak.get("best_time"):
            tips.append(f"You perform best during {peak['best_time']}. Schedule important practice then.")
    
    # Based on pacing
    if "question_pacing" in patterns:
        pacing = patterns["question_pacing"]
        if pacing.get("style") == "fast":
            tips.append("You work quickly. Consider double-checking answers before submitting.")
        elif pacing.get("style") == "slow":
            tips.append("Try to improve speed without sacrificing accuracy for interview readiness.")
    
    # Based on learning style
    if "learning_style" in patterns:
        style = patterns["learning_style"]
        if style == "explorer":
            tips.append("You learn by exploring. Consider focusing deeply on one topic at a time.")
        elif style == "deep_learner":
            tips.append("Your deep learning approach is excellent. Ensure you cover all required topics.")
    
    return tips[:3]  # Top 3 tips


def _estimate_readiness_date(readiness_score: float) -> str:
    """
    Estimate when student will be interview ready
    """
    if readiness_score >= 80:
        return "Ready now"
    elif readiness_score >= 60:
        weeks = int((80 - readiness_score) / 5)
        return f"{weeks}-{weeks+2} weeks"
    else:
        months = int((80 - readiness_score) / 15)
        return f"{months}-{months+1} months"


def _identify_strengths(topic_analysis: Dict) -> List[str]:
    """
    Identify student's top strengths
    """
    strengths = []
    for topic, stats in topic_analysis.items():
        if stats["accuracy"] >= 80:
            strengths.append(topic)
    
    return strengths[:5]  # Top 5 strengths


def _get_ranking_message(percentile: int) -> str:
    """
    Get encouraging message based on percentile
    """
    if percentile >= 95:
        return "🏆 Outstanding! You're in the top 5%!"
    elif percentile >= 90:
        return "🌟 Excellent! You're in the top 10%!"
    elif percentile >= 75:
        return "⭐ Great job! You're in the top 25%!"
    elif percentile >= 50:
        return "👍 Good work! You're above average!"
    else:
        return "💪 Keep practicing to improve your ranking!"


def _get_goal_action(goal_type: str, daily_target: float) -> str:
    """
    Get suggested action for goal achievement
    """
    actions = {
        "accuracy": f"Aim for {int(daily_target * 10)} correct answers per day",
        "questions": f"Practice {int(daily_target)} questions daily",
        "topics": f"Complete {int(daily_target)} topics per week",
        "streak": "Practice every day without breaks"
    }
    
    return actions.get(goal_type, "Maintain consistent daily practice")
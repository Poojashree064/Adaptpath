"""
Advanced Analytics Engine for AdaptPath
Provides comprehensive analytics, insights, and predictions
"""

from typing import Dict, List, Optional, Tuple
from datetime import datetime, timedelta
from collections import defaultdict
import statistics
import math


class AdvancedAnalytics:
    """
    Comprehensive analytics system for student performance tracking and insights
    """
    
    def __init__(self):
        self.performance_categories = {
            "excellent": (80, 100),
            "good": (60, 80),
            "average": (40, 60),
            "needs_improvement": (0, 40)
        }
    
    def generate_comprehensive_report(
        self,
        student_id: str,
        learning_history: List[Dict],
        diagnostic_results: Dict,
        time_period_days: int = 30
    ) -> Dict:
        """
        Generate comprehensive analytics report for a student
        """
        
        # Time-based filtering
        cutoff_date = datetime.now() - timedelta(days=time_period_days)
        recent_history = [
            h for h in learning_history 
            if datetime.fromisoformat(h.get('timestamp', datetime.now().isoformat())) > cutoff_date
        ]
        
        report = {
            "student_id": student_id,
            "report_date": datetime.now().isoformat(),
            "period_days": time_period_days,
            
            # Core metrics
            "overall_performance": self._calculate_overall_performance(recent_history),
            "topic_analytics": self._analyze_topics(recent_history),
            "learning_velocity": self._calculate_learning_velocity(learning_history),
            "consistency_score": self._calculate_consistency(learning_history),
            
            # Advanced insights
            "strength_analysis": self._analyze_strengths(recent_history),
            "weakness_analysis": self._analyze_weaknesses(recent_history),
            "learning_patterns": self._detect_learning_patterns(learning_history),
            "time_analysis": self._analyze_time_patterns(recent_history),
            
            # Predictions
            "readiness_score": self._calculate_readiness_score(recent_history, diagnostic_results),
            "projected_improvement": self._project_improvement(learning_history),
            "estimated_completion": self._estimate_completion_time(recent_history, diagnostic_results),
            
            # Recommendations
            "recommendations": self._generate_recommendations(recent_history, diagnostic_results),
            "focus_areas": self._identify_focus_areas(recent_history),
            
            # Comparative metrics
            "peer_comparison": self._generate_peer_comparison(recent_history),
            "progress_milestones": self._track_milestones(learning_history)
        }
        
        return report
    
    def _calculate_overall_performance(self, history: List[Dict]) -> Dict:
        """
        Calculate comprehensive overall performance metrics
        """
        if not history:
            return {
                "overall_accuracy": 0.0,
                "total_questions": 0,
                "correct_answers": 0,
                "category": "needs_improvement",
                "grade": "N/A"
            }
        
        total = len(history)
        correct = sum(1 for h in history if h.get('correct', False))
        accuracy = (correct / total) * 100
        
        # Determine category
        category = "needs_improvement"
        for cat, (low, high) in self.performance_categories.items():
            if low <= accuracy < high:
                category = cat
                break
        
        # Calculate grade
        grade = self._accuracy_to_grade(accuracy)
        
        # Calculate trend
        if len(history) >= 10:
            first_half = history[:len(history)//2]
            second_half = history[len(history)//2:]
            
            first_acc = (sum(1 for h in first_half if h.get('correct', False)) / len(first_half)) * 100
            second_acc = (sum(1 for h in second_half if h.get('correct', False)) / len(second_half)) * 100
            
            trend = "improving" if second_acc > first_acc + 5 else \
                    "declining" if second_acc < first_acc - 5 else "stable"
        else:
            trend = "insufficient_data"
        
        return {
            "overall_accuracy": round(accuracy, 2),
            "total_questions": total,
            "correct_answers": correct,
            "incorrect_answers": total - correct,
            "category": category,
            "grade": grade,
            "trend": trend,
            "performance_index": round(accuracy / 100, 3)
        }
    
    def _analyze_topics(self, history: List[Dict]) -> Dict:
        """
        Detailed topic-wise analytics
        """
        topic_stats = defaultdict(lambda: {
            "attempts": 0,
            "correct": 0,
            "incorrect": 0,
            "accuracy": 0.0,
            "avg_time": 0.0,
            "difficulty_distribution": defaultdict(int),
            "recent_trend": "stable"
        })
        
        for item in history:
            topic = item.get('topic', 'Unknown')
            topic_stats[topic]["attempts"] += 1
            
            if item.get('correct', False):
                topic_stats[topic]["correct"] += 1
            else:
                topic_stats[topic]["incorrect"] += 1
            
            # Time tracking
            time_taken = item.get('time_taken', 0)
            topic_stats[topic]["avg_time"] += time_taken
            
            # Difficulty tracking
            difficulty = item.get('difficulty', 'medium')
            topic_stats[topic]["difficulty_distribution"][difficulty] += 1
        
        # Calculate final metrics
        for topic, stats in topic_stats.items():
            if stats["attempts"] > 0:
                stats["accuracy"] = round((stats["correct"] / stats["attempts"]) * 100, 2)
                stats["avg_time"] = round(stats["avg_time"] / stats["attempts"], 1)
            
            # Determine mastery level
            if stats["accuracy"] >= 80:
                stats["mastery_level"] = "mastered"
            elif stats["accuracy"] >= 60:
                stats["mastery_level"] = "proficient"
            elif stats["accuracy"] >= 40:
                stats["mastery_level"] = "learning"
            else:
                stats["mastery_level"] = "struggling"
            
            # Convert difficulty distribution to dict
            stats["difficulty_distribution"] = dict(stats["difficulty_distribution"])
        
        return dict(topic_stats)
    
    def _calculate_learning_velocity(self, history: List[Dict]) -> Dict:
        """
        Calculate how fast the student is learning (improvement rate)
        """
        if len(history) < 10:
            return {
                "velocity": 0.0,
                "status": "insufficient_data",
                "description": "Need more data to calculate learning velocity"
            }
        
        # Split history into time windows
        window_size = max(5, len(history) // 5)
        windows = [history[i:i+window_size] for i in range(0, len(history), window_size)]
        
        if len(windows) < 2:
            return {
                "velocity": 0.0,
                "status": "insufficient_data",
                "description": "Need more data to calculate learning velocity"
            }
        
        # Calculate accuracy for each window
        accuracies = []
        for window in windows:
            if window:
                acc = (sum(1 for h in window if h.get('correct', False)) / len(window)) * 100
                accuracies.append(acc)
        
        # Calculate velocity (average improvement per window)
        if len(accuracies) > 1:
            improvements = [accuracies[i+1] - accuracies[i] for i in range(len(accuracies)-1)]
            avg_velocity = statistics.mean(improvements)
            
            # Determine status
            if avg_velocity > 5:
                status = "accelerating"
                description = "Learning speed is increasing rapidly"
            elif avg_velocity > 2:
                status = "improving"
                description = "Steady improvement in learning"
            elif avg_velocity > -2:
                status = "stable"
                description = "Maintaining consistent performance"
            else:
                status = "declining"
                description = "Learning speed has decreased"
        else:
            avg_velocity = 0
            status = "stable"
            description = "Insufficient windows for velocity calculation"
        
        return {
            "velocity": round(avg_velocity, 2),
            "status": status,
            "description": description,
            "accuracy_progression": [round(a, 1) for a in accuracies],
            "velocity_trend": "positive" if avg_velocity > 0 else "negative" if avg_velocity < 0 else "neutral"
        }
    
    def _calculate_consistency(self, history: List[Dict]) -> Dict:
        """
        Calculate learning consistency and engagement
        """
        if not history:
            return {
                "score": 0.0,
                "rating": "none",
                "description": "No learning activity recorded"
            }
        
        # Group by date
        dates = defaultdict(int)
        for item in history:
            timestamp = item.get('timestamp', datetime.now().isoformat())
            date = datetime.fromisoformat(timestamp).date()
            dates[date] += 1
        
        if len(dates) < 2:
            return {
                "score": 0.3,
                "rating": "insufficient",
                "description": "Need more activity days to assess consistency",
                "active_days": len(dates),
                "total_days": 1
            }
        
        # Calculate metrics
        sorted_dates = sorted(dates.keys())
        first_date = sorted_dates[0]
        last_date = sorted_dates[-1]
        total_days = (last_date - first_date).days + 1
        active_days = len(dates)
        
        # Consistency score (0-1)
        consistency_ratio = active_days / total_days if total_days > 0 else 0
        
        # Calculate activity variance
        daily_counts = list(dates.values())
        if len(daily_counts) > 1:
            variance = statistics.stdev(daily_counts) / statistics.mean(daily_counts) if statistics.mean(daily_counts) > 0 else 1
            regularity_bonus = 1 - min(variance, 1)
        else:
            regularity_bonus = 0
        
        # Final consistency score
        consistency_score = (consistency_ratio * 0.7) + (regularity_bonus * 0.3)
        
        # Determine rating
        if consistency_score >= 0.8:
            rating = "excellent"
            description = "Highly consistent learning pattern"
        elif consistency_score >= 0.6:
            rating = "good"
            description = "Regular learning with some gaps"
        elif consistency_score >= 0.4:
            rating = "moderate"
            description = "Irregular learning pattern"
        else:
            rating = "poor"
            description = "Inconsistent learning activity"
        
        # Calculate streak
        current_streak = self._calculate_current_streak(sorted_dates)
        
        return {
            "score": round(consistency_score, 3),
            "rating": rating,
            "description": description,
            "active_days": active_days,
            "total_days": total_days,
            "activity_rate": round((active_days / total_days) * 100, 1),
            "current_streak": current_streak,
            "avg_daily_questions": round(statistics.mean(daily_counts), 1) if daily_counts else 0
        }
    
    def _calculate_current_streak(self, sorted_dates: List) -> int:
        """
        Calculate current consecutive day streak
        """
        if not sorted_dates:
            return 0
        
        streak = 1
        for i in range(len(sorted_dates) - 1, 0, -1):
            diff = (sorted_dates[i] - sorted_dates[i-1]).days
            if diff == 1:
                streak += 1
            else:
                break
        
        return streak
    
    def _analyze_strengths(self, history: List[Dict]) -> Dict:
        """
        Identify and analyze student's strengths
        """
        topic_analysis = self._analyze_topics(history)
        
        strengths = []
        for topic, stats in topic_analysis.items():
            if stats["accuracy"] >= 70:
                strengths.append({
                    "topic": topic,
                    "accuracy": stats["accuracy"],
                    "mastery_level": stats["mastery_level"],
                    "attempts": stats["attempts"],
                    "confidence": "high" if stats["accuracy"] >= 85 else "moderate"
                })
        
        # Sort by accuracy
        strengths.sort(key=lambda x: x["accuracy"], reverse=True)
        
        return {
            "top_strengths": strengths[:5],
            "total_strong_topics": len(strengths),
            "average_strength_accuracy": round(
                statistics.mean([s["accuracy"] for s in strengths]), 2
            ) if strengths else 0.0
        }
    
    def _analyze_weaknesses(self, history: List[Dict]) -> Dict:
        """
        Identify and analyze student's weaknesses with detailed insights
        """
        topic_analysis = self._analyze_topics(history)
        
        weaknesses = []
        for topic, stats in topic_analysis.items():
            if stats["accuracy"] < 60:
                # Analyze error patterns
                topic_history = [h for h in history if h.get('topic') == topic]
                error_pattern = self._analyze_error_pattern(topic_history)
                
                weaknesses.append({
                    "topic": topic,
                    "accuracy": stats["accuracy"],
                    "mastery_level": stats["mastery_level"],
                    "attempts": stats["attempts"],
                    "severity": "critical" if stats["accuracy"] < 40 else "moderate",
                    "error_pattern": error_pattern,
                    "recommended_practice_time": self._estimate_practice_time(stats["accuracy"])
                })
        
        # Sort by severity (lowest accuracy first)
        weaknesses.sort(key=lambda x: x["accuracy"])
        
        return {
            "critical_weaknesses": [w for w in weaknesses if w["severity"] == "critical"],
            "moderate_weaknesses": [w for w in weaknesses if w["severity"] == "moderate"],
            "total_weak_topics": len(weaknesses),
            "average_weakness_accuracy": round(
                statistics.mean([w["accuracy"] for w in weaknesses]), 2
            ) if weaknesses else 0.0,
            "priority_topics": [w["topic"] for w in weaknesses[:3]]
        }
    
    def _analyze_error_pattern(self, topic_history: List[Dict]) -> str:
        """
        Analyze the pattern of errors in a topic
        """
        if len(topic_history) < 3:
            return "insufficient_data"
        
        recent = topic_history[-5:]
        recent_correct = [h.get('correct', False) for h in recent]
        
        # Check for patterns
        if all(not c for c in recent_correct):
            return "consistent_failure"
        elif all(c for c in recent_correct):
            return "improving"
        elif recent_correct.count(True) > recent_correct.count(False):
            return "irregular_success"
        else:
            return "struggling"
    
    def _estimate_practice_time(self, accuracy: float) -> str:
        """
        Estimate recommended practice time based on accuracy
        """
        if accuracy < 20:
            return "3-4 hours/week"
        elif accuracy < 40:
            return "2-3 hours/week"
        elif accuracy < 60:
            return "1-2 hours/week"
        else:
            return "30-60 minutes/week"
    
    def _detect_learning_patterns(self, history: List[Dict]) -> Dict:
        """
        Detect various learning patterns and behaviors
        """
        if len(history) < 10:
            return {"status": "insufficient_data"}
        
        patterns = {
            "peak_performance_time": self._find_peak_time(history),
            "question_pacing": self._analyze_pacing(history),
            "difficulty_preference": self._analyze_difficulty_preference(history),
            "topic_hopping": self._detect_topic_hopping(history),
            "learning_style": self._infer_learning_style(history)
        }
        
        return patterns
    
    def _find_peak_time(self, history: List[Dict]) -> Dict:
        """
        Identify when student performs best
        """
        time_performance = defaultdict(lambda: {"correct": 0, "total": 0})
        
        for item in history:
            timestamp = item.get('timestamp', datetime.now().isoformat())
            hour = datetime.fromisoformat(timestamp).hour
            
            time_period = "morning" if 6 <= hour < 12 else \
                         "afternoon" if 12 <= hour < 18 else \
                         "evening" if 18 <= hour < 22 else "night"
            
            time_performance[time_period]["total"] += 1
            if item.get('correct', False):
                time_performance[time_period]["correct"] += 1
        
        # Calculate accuracies
        accuracies = {}
        for period, stats in time_performance.items():
            if stats["total"] > 0:
                accuracies[period] = (stats["correct"] / stats["total"]) * 100
        
        if accuracies:
            best_time = max(accuracies.items(), key=lambda x: x[1])
            return {
                "best_time": best_time[0],
                "accuracy_at_best_time": round(best_time[1], 2),
                "all_time_accuracies": {k: round(v, 2) for k, v in accuracies.items()}
            }
        
        return {"best_time": "unknown", "accuracy_at_best_time": 0.0}
    
    def _analyze_pacing(self, history: List[Dict]) -> Dict:
        """
        Analyze how student paces through questions
        """
        times = [h.get('time_taken', 0) for h in history if h.get('time_taken', 0) > 0]
        
        if not times:
            return {"status": "no_time_data"}
        
        avg_time = statistics.mean(times)
        median_time = statistics.median(times)
        
        # Determine pacing style
        if avg_time < 30:
            style = "fast"
            description = "Quick pace, may benefit from slowing down"
        elif avg_time < 60:
            style = "moderate"
            description = "Balanced pacing"
        else:
            style = "slow"
            description = "Careful and thorough approach"
        
        return {
            "style": style,
            "description": description,
            "average_time_seconds": round(avg_time, 1),
            "median_time_seconds": round(median_time, 1),
            "consistency": "consistent" if statistics.stdev(times) < avg_time * 0.5 else "variable"
        }
    
    def _analyze_difficulty_preference(self, history: List[Dict]) -> Dict:
        """
        Analyze student's performance across difficulty levels
        """
        difficulty_stats = defaultdict(lambda: {"correct": 0, "total": 0})
        
        for item in history:
            difficulty = item.get('difficulty', 'medium')
            difficulty_stats[difficulty]["total"] += 1
            if item.get('correct', False):
                difficulty_stats[difficulty]["correct"] += 1
        
        # Calculate accuracies
        accuracies = {}
        for difficulty, stats in difficulty_stats.items():
            if stats["total"] > 0:
                accuracies[difficulty] = (stats["correct"] / stats["total"]) * 100
        
        # Determine comfort zone
        if accuracies:
            comfort_zone = max(accuracies.items(), key=lambda x: x[1])[0]
        else:
            comfort_zone = "unknown"
        
        return {
            "comfort_zone": comfort_zone,
            "difficulty_accuracies": {k: round(v, 2) for k, v in accuracies.items()},
            "attempts_by_difficulty": {k: v["total"] for k, v in difficulty_stats.items()},
            "recommendation": self._get_difficulty_recommendation(accuracies)
        }
    
    def _get_difficulty_recommendation(self, accuracies: Dict) -> str:
        """
        Get recommendation based on difficulty performance
        """
        if not accuracies:
            return "Start with easy questions to build confidence"
        
        easy_acc = accuracies.get('easy', 0)
        medium_acc = accuracies.get('medium', 0)
        hard_acc = accuracies.get('hard', 0)
        
        if easy_acc > 80 and medium_acc > 70:
            return "Ready for more hard questions"
        elif easy_acc > 70 and medium_acc < 60:
            return "Focus on medium difficulty to progress"
        elif easy_acc < 60:
            return "Strengthen fundamentals with easy questions"
        else:
            return "Maintain balanced practice across all levels"
    
    def _detect_topic_hopping(self, history: List[Dict]) -> Dict:
        """
        Detect if student is switching topics too frequently
        """
        if len(history) < 5:
            return {"status": "insufficient_data"}
        
        topic_switches = 0
        for i in range(1, len(history)):
            if history[i].get('topic') != history[i-1].get('topic'):
                topic_switches += 1
        
        switch_rate = topic_switches / (len(history) - 1) if len(history) > 1 else 0
        
        if switch_rate > 0.7:
            behavior = "high_switching"
            recommendation = "Try to focus on one topic for longer periods"
        elif switch_rate > 0.4:
            behavior = "moderate_switching"
            recommendation = "Good balance between focus and variety"
        else:
            behavior = "low_switching"
            recommendation = "Excellent focus on topics"
        
        return {
            "behavior": behavior,
            "switch_rate": round(switch_rate, 3),
            "total_switches": topic_switches,
            "recommendation": recommendation
        }
    
    def _infer_learning_style(self, history: List[Dict]) -> str:
        """
        Infer learning style from behavior patterns
        """
        if len(history) < 10:
            return "insufficient_data"
        
        # Analyze patterns
        avg_time = statistics.mean([h.get('time_taken', 0) for h in history if h.get('time_taken', 0) > 0])
        topic_switches = sum(1 for i in range(1, len(history)) if history[i].get('topic') != history[i-1].get('topic'))
        switch_rate = topic_switches / (len(history) - 1)
        
        # Infer style
        if avg_time > 90 and switch_rate < 0.3:
            return "deep_learner"  # Takes time, focuses deeply
        elif avg_time < 45 and switch_rate > 0.5:
            return "explorer"  # Quick pace, tries many topics
        elif switch_rate < 0.3:
            return "systematic"  # Methodical approach
        else:
            return "balanced"  # Balanced approach
    
    def _analyze_time_patterns(self, history: List[Dict]) -> Dict:
        """
        Analyze time-related patterns
        """
        if not history:
            return {}
        
        # Daily distribution
        daily_activity = defaultdict(int)
        hourly_activity = defaultdict(int)
        
        for item in history:
            timestamp = item.get('timestamp', datetime.now().isoformat())
            dt = datetime.fromisoformat(timestamp)
            
            daily_activity[dt.strftime('%A')] += 1
            hourly_activity[dt.hour] += 1
        
        # Find most active day and hour
        most_active_day = max(daily_activity.items(), key=lambda x: x[1]) if daily_activity else ("Unknown", 0)
        most_active_hour = max(hourly_activity.items(), key=lambda x: x[1]) if hourly_activity else (0, 0)
        
        return {
            "most_active_day": most_active_day[0],
            "most_active_hour": f"{most_active_hour[0]:02d}:00",
            "daily_distribution": dict(daily_activity),
            "hourly_distribution": dict(hourly_activity),
            "study_pattern": self._classify_study_pattern(daily_activity)
        }
    
    def _classify_study_pattern(self, daily_activity: Dict) -> str:
        """
        Classify study pattern based on daily activity
        """
        if not daily_activity:
            return "unknown"
        
        weekend_activity = daily_activity.get('Saturday', 0) + daily_activity.get('Sunday', 0)
        weekday_activity = sum(daily_activity.values()) - weekend_activity
        
        if weekend_activity > weekday_activity * 0.5:
            return "weekend_warrior"
        elif weekday_activity > 0 and weekend_activity == 0:
            return "weekday_focused"
        else:
            return "balanced_schedule"
    
    def _calculate_readiness_score(self, history: List[Dict], diagnostic: Dict) -> Dict:
        """
        Calculate interview/placement readiness score
        """
        if not history:
            return {
                "score": 0.0,
                "level": "not_ready",
                "description": "No practice data available"
            }
        
        # Factors for readiness
        factors = {}
        
        # 1. Overall accuracy (40% weight)
        overall_acc = (sum(1 for h in history if h.get('correct', False)) / len(history)) * 100
        factors["accuracy"] = overall_acc * 0.4
        
        # 2. Topic coverage (30% weight)
        unique_topics = len(set(h.get('topic') for h in history))
        required_topics = 10  # Assume 10 core topics
        coverage_score = min(unique_topics / required_topics, 1.0) * 30
        factors["coverage"] = coverage_score
        
        # 3. Difficulty progression (20% weight)
        hard_questions = sum(1 for h in history if h.get('difficulty') == 'hard')
        hard_correct = sum(1 for h in history if h.get('difficulty') == 'hard' and h.get('correct', False))
        hard_accuracy = (hard_correct / hard_questions * 100) if hard_questions > 0 else 0
        factors["difficulty"] = hard_accuracy * 0.2
        
        # 4. Consistency (10% weight)
        consistency = self._calculate_consistency(history)
        factors["consistency"] = consistency["score"] * 10
        
        # Total readiness score
        readiness_score = sum(factors.values())
        
        # Determine level
        if readiness_score >= 80:
            level = "ready"
            description = "Well prepared for interviews"
        elif readiness_score >= 60:
            level = "nearly_ready"
            description = "Almost ready, needs minor improvements"
        elif readiness_score >= 40:
            level = "preparing"
            description = "Making good progress, continue practicing"
        else:
            level = "not_ready"
            description = "Needs more preparation"
        
        return {
            "score": round(readiness_score, 2),
            "level": level,
            "description": description,
            "breakdown": {k: round(v, 2) for k, v in factors.items()},
            "areas_to_improve": self._identify_readiness_gaps(factors)
        }
    
    def _identify_readiness_gaps(self, factors: Dict) -> List[str]:
        """
        Identify gaps in readiness
        """
        gaps = []
        
        if factors["accuracy"] < 32:  # < 80% accuracy
            gaps.append("Improve overall accuracy")
        
        if factors["coverage"] < 24:  # < 80% coverage
            gaps.append("Cover more topics")
        
        if factors["difficulty"] < 16:  # < 80% on hard questions
            gaps.append("Practice more hard questions")
        
        if factors["consistency"] < 8:  # < 80% consistency
            gaps.append("Maintain regular practice schedule")
        
        return gaps
    
    def _project_improvement(self, history: List[Dict]) -> Dict:
        """
        Project future improvement based on current trajectory
        """
        if len(history) < 20:
            return {
                "projection": "insufficient_data",
                "description": "Need more history to project improvement"
            }
        
        velocity = self._calculate_learning_velocity(history)
        current_acc = (sum(1 for h in history[-20:] if h.get('correct', False)) / 20) * 100
        
        # Project 30 days ahead
        projected_velocity = velocity["velocity"]
        projected_accuracy = min(100, max(0, current_acc + (projected_velocity * 6)))  # 6 windows ahead
        
        improvement = projected_accuracy - current_acc
        
        if improvement > 10:
            outlook = "excellent"
            description = "Strong upward trajectory"
        elif improvement > 5:
            outlook = "good"
            description = "Steady improvement expected"
        elif improvement > -5:
            outlook = "stable"
            description = "Maintaining current level"
        else:
            outlook = "declining"
            description = "Performance may decline without intervention"
        
        return {
            "current_accuracy": round(current_acc, 2),
            "projected_accuracy_30d": round(projected_accuracy, 2),
            "expected_improvement": round(improvement, 2),
            "outlook": outlook,
            "description": description,
            "confidence": "high" if len(history) >= 50 else "moderate"
        }
    
    def _estimate_completion_time(self, history: List[Dict], diagnostic: Dict) -> Dict:
        """
        Estimate time to reach proficiency
        """
        if not history:
            return {
                "estimate": "unknown",
                "description": "Insufficient data"
            }
        
        current_acc = (sum(1 for h in history if h.get('correct', False)) / len(history)) * 100
        target_acc = 75  # Target proficiency
        
        velocity = self._calculate_learning_velocity(history)
        improvement_rate = velocity["velocity"]
        
        if improvement_rate <= 0:
            return {
                "estimate": "needs_improvement",
                "description": "Current trajectory won't reach target",
                "recommendation": "Review learning strategy"
            }
        
        # Calculate weeks needed
        points_needed = target_acc - current_acc
        if points_needed <= 0:
            return {
                "estimate": "already_proficient",
                "description": "Already at or above target proficiency",
                "current_level": round(current_acc, 2)
            }
        
        windows_needed = points_needed / improvement_rate if improvement_rate > 0 else float('inf')
        weeks_needed = windows_needed * 0.5  # Assuming 2 windows per week
        
        return {
            "estimate": f"{int(weeks_needed)}-{int(weeks_needed)+2} weeks",
            "weeks": round(weeks_needed, 1),
            "target_accuracy": target_acc,
            "current_accuracy": round(current_acc, 2),
            "improvement_needed": round(points_needed, 2),
            "recommended_weekly_practice": "3-4 hours"
        }
    
    def _generate_recommendations(self, history: List[Dict], diagnostic: Dict) -> List[str]:
        """
        Generate personalized recommendations
        """
        recommendations = []
        
        if not history:
            return ["Start with diagnostic test to assess your level"]
        
        # Accuracy-based recommendations
        current_acc = (sum(1 for h in history if h.get('correct', False)) / len(history)) * 100
        
        if current_acc < 50:
            recommendations.append("Focus on fundamentals - start with easier topics")
            recommendations.append("Review basic concepts before attempting practice questions")
        elif current_acc < 70:
            recommendations.append("Good progress - maintain consistent practice")
            recommendations.append("Start incorporating medium difficulty questions")
        else:
            recommendations.append("Excellent work - challenge yourself with hard problems")
            recommendations.append("Focus on interview-style questions")
        
        # Consistency recommendations
        consistency = self._calculate_consistency(history)
        if consistency["score"] < 0.5:
            recommendations.append("Increase practice consistency - aim for daily sessions")
        
        # Topic coverage recommendations
        topic_analysis = self._analyze_topics(history)
        weak_topics = [t for t, s in topic_analysis.items() if s["accuracy"] < 60]
        if weak_topics:
            recommendations.append(f"Priority topics to focus on: {', '.join(weak_topics[:3])}")
        
        # Time management
        pacing = self._analyze_pacing(history)
        if pacing.get("style") == "fast":
            recommendations.append("Take more time to understand questions thoroughly")
        elif pacing.get("style") == "slow":
            recommendations.append("Try to improve time management for interview readiness")
        
        return recommendations[:5]  # Top 5 recommendations
    
    def _identify_focus_areas(self, history: List[Dict]) -> List[Dict]:
        """
        Identify specific areas to focus on
        """
        topic_analysis = self._analyze_topics(history)
        
        focus_areas = []
        for topic, stats in topic_analysis.items():
            if stats["accuracy"] < 70:
                priority = "high" if stats["accuracy"] < 50 else "medium"
                
                focus_areas.append({
                    "topic": topic,
                    "priority": priority,
                    "current_accuracy": stats["accuracy"],
                    "target_accuracy": 75,
                    "gap": 75 - stats["accuracy"],
                    "estimated_questions_needed": int((75 - stats["accuracy"]) * 2),
                    "recommended_difficulty": "easy" if stats["accuracy"] < 50 else "medium"
                })
        
        # Sort by priority
        focus_areas.sort(key=lambda x: (x["priority"] == "high", -x["current_accuracy"]), reverse=True)
        
        return focus_areas[:5]  # Top 5 focus areas
    
    def _generate_peer_comparison(self, history: List[Dict]) -> Dict:
        """
        Generate peer comparison metrics (simulated)
        """
        if not history:
            return {"status": "no_data"}
        
        current_acc = (sum(1 for h in history if h.get('correct', False)) / len(history)) * 100
        
        # Simulated percentile (in real system, compare with actual peer data)
        percentile = min(99, max(1, int(current_acc * 0.9)))
        
        if percentile >= 90:
            ranking = "top_10"
            message = "You're in the top 10% of students!"
        elif percentile >= 75:
            ranking = "top_25"
            message = "You're performing better than 75% of students"
        elif percentile >= 50:
            ranking = "above_average"
            message = "You're performing above average"
        else:
            ranking = "below_average"
            message = "Keep practicing to improve your ranking"
        
        return {
            "percentile": percentile,
            "ranking": ranking,
            "message": message,
            "peer_average_accuracy": 65.5,  # Simulated
            "your_accuracy": round(current_acc, 2),
            "comparison": "above" if current_acc > 65.5 else "below"
        }
    
    def _track_milestones(self, history: List[Dict]) -> Dict:
        """
        Track learning milestones achieved
        """
        milestones = {
            "total_questions_answered": len(history),
            "milestones_achieved": [],
            "next_milestone": {}
        }
        
        total = len(history)
        
        # Question count milestones
        if total >= 1000:
            milestones["milestones_achieved"].append("🏆 1000+ questions answered!")
        elif total >= 500:
            milestones["milestones_achieved"].append("🎯 500+ questions answered!")
            milestones["next_milestone"] = {"target": 1000, "progress": total, "remaining": 1000 - total}
        elif total >= 100:
            milestones["milestones_achieved"].append("⭐ 100+ questions answered!")
            milestones["next_milestone"] = {"target": 500, "progress": total, "remaining": 500 - total}
        elif total >= 50:
            milestones["milestones_achieved"].append("🎉 50+ questions answered!")
            milestones["next_milestone"] = {"target": 100, "progress": total, "remaining": 100 - total}
        else:
            milestones["next_milestone"] = {"target": 50, "progress": total, "remaining": 50 - total}
        
        # Accuracy milestones
        if history:
            accuracy = (sum(1 for h in history if h.get('correct', False)) / len(history)) * 100
            if accuracy >= 90:
                milestones["milestones_achieved"].append("💎 90%+ accuracy achieved!")
            elif accuracy >= 80:
                milestones["milestones_achieved"].append("🌟 80%+ accuracy achieved!")
            elif accuracy >= 70:
                milestones["milestones_achieved"].append("✨ 70%+ accuracy achieved!")
        
        # Topic mastery
        topic_analysis = self._analyze_topics(history)
        mastered_topics = [t for t, s in topic_analysis.items() if s["accuracy"] >= 80]
        if len(mastered_topics) >= 5:
            milestones["milestones_achieved"].append(f"🎓 Mastered {len(mastered_topics)} topics!")
        
        return milestones
    
    def _accuracy_to_grade(self, accuracy: float) -> str:
        """
        Convert accuracy percentage to grade
        """
        if accuracy >= 90:
            return "A+"
        elif accuracy >= 85:
            return "A"
        elif accuracy >= 80:
            return "A-"
        elif accuracy >= 75:
            return "B+"
        elif accuracy >= 70:
            return "B"
        elif accuracy >= 65:
            return "B-"
        elif accuracy >= 60:
            return "C+"
        elif accuracy >= 55:
            return "C"
        elif accuracy >= 50:
            return "C-"
        else:
            return "D"


# Singleton instance
analytics_engine = AdvancedAnalytics()
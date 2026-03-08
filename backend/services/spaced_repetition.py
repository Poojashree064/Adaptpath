"""
Spaced Repetition System
Optimizes learning schedule using modified SM-2 algorithm
"""

from datetime import datetime, timedelta
from typing import Dict, List, Optional
import math


class SpacedRepetitionEngine:
    """
    Implements spaced repetition algorithm for optimal learning
    """
    
    def __init__(self):
        # SM-2 algorithm parameters
        self.min_easiness = 1.3
        self.max_easiness = 2.5
        self.initial_easiness = 2.5
        
    def calculate_next_review(
        self,
        item_id: str,
        performance: float,  # 0-1 scale
        current_interval: int = 0,
        repetitions: int = 0,
        easiness_factor: float = 2.5,
        last_review: datetime = None
    ) -> Dict:
        """
        Calculate when to review an item next
        
        Args:
            item_id: Question/concept ID
            performance: How well answered (0.0 to 1.0)
            current_interval: Days since last review
            repetitions: Number of successful reviews
            easiness_factor: Current easiness (1.3 to 2.5)
            last_review: Last review timestamp
            
        Returns:
            Dict with next_review_date, new_interval, new_easiness, etc.
        """
        
        # Convert performance to quality (0-5 scale for SM-2)
        quality = self._performance_to_quality(performance)
        
        # Update easiness factor
        new_easiness = self._update_easiness(easiness_factor, quality)
        
        # Calculate new interval
        if quality < 3:  # Failed (need to review soon)
            new_interval = 1
            new_repetitions = 0
        else:  # Passed
            if repetitions == 0:
                new_interval = 1
            elif repetitions == 1:
                new_interval = 6
            else:
                new_interval = math.ceil(current_interval * new_easiness)
            
            new_repetitions = repetitions + 1
        
        # Calculate next review date
        now = datetime.now()
        next_review = now + timedelta(days=new_interval)
        
        # Return updated card data
        return {
            "item_id": item_id,
            "next_review_date": next_review.isoformat(),
            "interval_days": new_interval,
            "repetitions": new_repetitions,
            "easiness_factor": new_easiness,
            "last_review": now.isoformat(),
            "performance_score": performance,
            "due_for_review": False
        }
    
    def _performance_to_quality(self, performance: float) -> int:
        """
        Convert performance (0-1) to SM-2 quality (0-5)
        """
        if performance >= 0.9:
            return 5  # Perfect
        elif performance >= 0.8:
            return 4  # Good with hesitation
        elif performance >= 0.6:
            return 3  # Correct with difficulty
        elif performance >= 0.4:
            return 2  # Incorrect but remembered
        elif performance >= 0.2:
            return 1  # Incorrect, vague memory
        else:
            return 0  # Complete blackout
    
    def _update_easiness(self, current_easiness: float, quality: int) -> float:
        """
        Update easiness factor based on performance
        """
        new_easiness = current_easiness + (0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02))
        
        # Clamp to valid range
        return max(self.min_easiness, min(self.max_easiness, new_easiness))
    
    def get_due_reviews(
        self,
        review_cards: List[Dict],
        current_date: datetime = None
    ) -> List[Dict]:
        """
        Get items that are due for review
        """
        if current_date is None:
            current_date = datetime.now()
        
        due_items = []
        
        for card in review_cards:
            next_review = datetime.fromisoformat(card['next_review_date'])
            
            if next_review <= current_date:
                card['due_for_review'] = True
                card['days_overdue'] = (current_date - next_review).days
                due_items.append(card)
        
        # Sort by priority (overdue items first)
        due_items.sort(key=lambda x: x.get('days_overdue', 0), reverse=True)
        
        return due_items
    
    def get_daily_schedule(
        self,
        all_topics: List[Dict],
        target_items_per_day: int = 20
    ) -> Dict:
        """
        Generate daily review schedule
        """
        now = datetime.now()
        
        schedule = {
            "date": now.date().isoformat(),
            "new_items": [],
            "review_items": [],
            "total_items": 0
        }
        
        # Separate new and review items
        for topic in all_topics:
            if topic.get('repetitions', 0) == 0:
                schedule["new_items"].append(topic)
            else:
                next_review = datetime.fromisoformat(topic.get('next_review_date', now.isoformat()))
                if next_review <= now:
                    schedule["review_items"].append(topic)
        
        # Prioritize reviews over new items
        review_count = min(len(schedule["review_items"]), int(target_items_per_day * 0.7))
        new_count = min(len(schedule["new_items"]), target_items_per_day - review_count)
        
        schedule["review_items"] = schedule["review_items"][:review_count]
        schedule["new_items"] = schedule["new_items"][:new_count]
        schedule["total_items"] = len(schedule["review_items"]) + len(schedule["new_items"])
        
        return schedule
    
    def optimize_review_timing(
        self,
        student_availability: List[str],  # e.g., ["09:00", "13:00", "20:00"]
        review_items: List[Dict]
    ) -> Dict:
        """
        Optimize review timing based on student's schedule
        """
        optimal_schedule = {}
        
        # Distribute reviews across available time slots
        items_per_slot = math.ceil(len(review_items) / len(student_availability))
        
        for idx, time_slot in enumerate(student_availability):
            start = idx * items_per_slot
            end = start + items_per_slot
            slot_items = review_items[start:end]
            
            optimal_schedule[time_slot] = {
                "time": time_slot,
                "items": slot_items,
                "estimated_duration": len(slot_items) * 3  # 3 min per item
            }
        
        return optimal_schedule
    
    def get_retention_prediction(
        self,
        item: Dict,
        days_from_now: int = 7
    ) -> float:
        """
        Predict retention probability after N days
        """
        easiness = item.get('easiness_factor', self.initial_easiness)
        last_interval = item.get('interval_days', 1)
        
        # Exponential decay model
        decay_rate = 1 / (easiness * last_interval)
        retention = math.exp(-decay_rate * days_from_now)
        
        return max(0.0, min(1.0, retention))
    
    def get_learning_streak(self, review_history: List[Dict]) -> Dict:
        """
        Calculate learning streak and consistency
        """
        if not review_history:
            return {"streak_days": 0, "consistency": 0.0}
        
        # Sort by date
        sorted_history = sorted(review_history, key=lambda x: x['last_review'])
        
        streak_days = 0
        last_date = None
        
        for review in reversed(sorted_history):
            review_date = datetime.fromisoformat(review['last_review']).date()
            
            if last_date is None:
                last_date = review_date
                streak_days = 1
            elif (last_date - review_date).days == 1:
                streak_days += 1
                last_date = review_date
            else:
                break
        
        # Calculate consistency (reviews per week)
        if len(sorted_history) > 1:
            first_review = datetime.fromisoformat(sorted_history[0]['last_review'])
            last_review = datetime.fromisoformat(sorted_history[-1]['last_review'])
            days_active = (last_review - first_review).days + 1
            reviews_per_week = (len(review_history) / days_active) * 7 if days_active > 0 else 0
        else:
            reviews_per_week = 0
        
        return {
            "streak_days": streak_days,
            "consistency_score": min(1.0, reviews_per_week / 10),  # Target: 10 reviews/week
            "total_reviews": len(review_history),
            "reviews_per_week": round(reviews_per_week, 2)
        }
    
    def recommend_study_time(self, student_profile: Dict) -> Dict:
        """
        Recommend optimal daily study time
        """
        weak_topics_count = len(student_profile.get('weak_topics', []))
        current_accuracy = student_profile.get('overall_accuracy', 0.5)
        
        # Base recommendation
        if current_accuracy < 0.4:
            base_minutes = 60  # 1 hour for struggling students
        elif current_accuracy < 0.7:
            base_minutes = 45  # 45 min for average
        else:
            base_minutes = 30  # 30 min for strong students
        
        # Adjust for weak topics
        additional_minutes = weak_topics_count * 5
        
        total_minutes = base_minutes + additional_minutes
        
        return {
            "recommended_daily_minutes": min(total_minutes, 90),  # Cap at 90 min
            "sessions_per_day": 2 if total_minutes > 45 else 1,
            "break_duration": 10,  # 10 min break between sessions
            "best_times": ["09:00-10:00", "19:00-20:00"]  # Morning and evening
        }


# Singleton instance
spaced_repetition = SpacedRepetitionEngine()
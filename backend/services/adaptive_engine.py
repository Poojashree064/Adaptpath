"""
Adaptive Engine - Smart Question Selection System
Selects optimal questions based on student performance and learning patterns
"""

import random
from typing import List, Dict, Optional
from datetime import datetime
import math


class AdaptiveEngine:
    """
    Intelligent question selection engine that adapts to student's learning patterns
    """
    
    def __init__(self):
        self.difficulty_levels = ["easy", "medium", "hard"]
        self.initial_difficulty = "easy"
        
    def select_next_question(
        self, 
        student_profile: Dict,
        question_bank: List[Dict],
        recent_history: List[Dict],
        weak_topics: List[str] = None
    ) -> Dict:
        """
        Select the optimal next question based on multiple factors
        
        Args:
            student_profile: Student's learning profile and stats
            question_bank: Available questions
            recent_history: Recent answers (last 10-20)
            weak_topics: Topics that need focus
            
        Returns:
            Selected question dictionary
        """
        
        # Calculate student's current ability level
        current_ability = self._calculate_ability(student_profile, recent_history)
        
        # Get appropriate difficulty
        target_difficulty = self._determine_difficulty(current_ability, recent_history)
        
        # Filter questions
        candidate_questions = self._filter_candidates(
            question_bank,
            target_difficulty,
            weak_topics,
            recent_history
        )
        
        if not candidate_questions:
            # Fallback to any available question
            candidate_questions = [q for q in question_bank if q['id'] not in 
                                 [h['question_id'] for h in recent_history[-20:]]]
        
        # Score and rank candidates
        scored_questions = self._score_questions(
            candidate_questions,
            student_profile,
            weak_topics,
            current_ability
        )
        
        # Select best question
        selected = self._select_best_question(scored_questions)
        
        return selected
    
    def _calculate_ability(self, profile: Dict, history: List[Dict]) -> float:
        """
        Calculate student's current ability level (0.0 to 1.0)
        """
        if not history:
            return profile.get('ability', 0.5)
        
        # Recent performance (last 10 questions)
        recent = history[-10:]
        recent_accuracy = sum(1 for h in recent if h.get('correct', False)) / len(recent)
        
        # Overall accuracy
        overall_accuracy = profile.get('overall_accuracy', 0.5)
        
        # Weighted combination (recent performance matters more)
        ability = (recent_accuracy * 0.7) + (overall_accuracy * 0.3)
        
        return max(0.1, min(0.9, ability))
    
    def _determine_difficulty(self, ability: float, history: List[Dict]) -> str:
        """
        Determine target difficulty based on ability and recent performance
        """
        if not history:
            return self.initial_difficulty
        
        recent = history[-5:]
        recent_correct = sum(1 for h in recent if h.get('correct', False))
        
        # If doing well, increase difficulty
        if recent_correct >= 4:  # 80%+ accuracy
            if ability > 0.7:
                return "hard"
            elif ability > 0.5:
                return "medium"
            else:
                return "easy"
        
        # If struggling, decrease difficulty
        elif recent_correct <= 2:  # 40% or less
            return "easy"
        
        # Normal case - match difficulty to ability
        if ability >= 0.65:
            return "hard"
        elif ability >= 0.4:
            return "medium"
        else:
            return "easy"
    
    def _filter_candidates(
        self,
        questions: List[Dict],
        target_difficulty: str,
        weak_topics: List[str],
        history: List[Dict]
    ) -> List[Dict]:
        """
        Filter question bank to get suitable candidates
        """
        # Get recently attempted question IDs
        recent_ids = [h['question_id'] for h in history[-30:]] if history else []
        
        candidates = []
        
        for q in questions:
            # Skip recently attempted
            if q['id'] in recent_ids:
                continue
            
            # Priority to weak topics
            if weak_topics and q['topic'] in weak_topics:
                if q['difficulty'] in [target_difficulty, "easy"]:
                    candidates.append(q)
            
            # Also include matching difficulty
            elif q['difficulty'] == target_difficulty:
                candidates.append(q)
        
        return candidates
    
    def _score_questions(
        self,
        questions: List[Dict],
        profile: Dict,
        weak_topics: List[str],
        ability: float
    ) -> List[Dict]:
        """
        Score questions based on relevance and learning value
        """
        scored = []
        
        for q in questions:
            score = 0.0
            
            # Base score by difficulty match
            difficulty_scores = {"easy": 0.3, "medium": 0.6, "hard": 1.0}
            score += difficulty_scores.get(q['difficulty'], 0.5)
            
            # Bonus for weak topics
            if weak_topics and q['topic'] in weak_topics:
                score += 0.5
            
            # Bonus for topics with low attempt count
            topic_attempts = profile.get('topic_attempts', {}).get(q['topic'], 0)
            if topic_attempts < 5:
                score += 0.3
            
            # Penalty for overworked topics
            elif topic_attempts > 20:
                score -= 0.2
            
            # Learning value (questions student can grow from)
            expected_success = self._estimate_success_probability(q, ability)
            # Sweet spot is 50-70% success probability
            if 0.5 <= expected_success <= 0.7:
                score += 0.4
            
            scored.append({**q, 'selection_score': max(0, score)})
        
        # Sort by score descending
        scored.sort(key=lambda x: x['selection_score'], reverse=True)
        
        return scored
    
    def _estimate_success_probability(self, question: Dict, ability: float) -> float:
        """
        Estimate probability of answering correctly
        """
        difficulty_map = {"easy": 0.3, "medium": 0.6, "hard": 0.9}
        q_difficulty = difficulty_map.get(question['difficulty'], 0.5)
        
        # Simple IRT-like model
        probability = 1 / (1 + math.exp(-(ability - q_difficulty) * 3))
        
        return probability
    
    def _select_best_question(self, scored_questions: List[Dict]) -> Dict:
        """
        Select from top candidates with some randomization
        """
        if not scored_questions:
            return None
        
        # Take top 3 candidates
        top_candidates = scored_questions[:min(3, len(scored_questions))]
        
        # Weighted random selection (higher scores = higher probability)
        weights = [q['selection_score'] for q in top_candidates]
        total = sum(weights)
        
        if total == 0:
            return random.choice(top_candidates)
        
        normalized_weights = [w/total for w in weights]
        selected = random.choices(top_candidates, weights=normalized_weights, k=1)[0]
        
        return selected
    
    def update_difficulty_dynamically(
        self,
        current_difficulty: str,
        recent_performance: List[bool]
    ) -> str:
        """
        Dynamically adjust difficulty during session
        """
        if len(recent_performance) < 3:
            return current_difficulty
        
        recent_accuracy = sum(recent_performance[-5:]) / len(recent_performance[-5:])
        
        difficulties = ["easy", "medium", "hard"]
        current_idx = difficulties.index(current_difficulty)
        
        # Increase difficulty if doing very well
        if recent_accuracy >= 0.8 and current_idx < len(difficulties) - 1:
            return difficulties[current_idx + 1]
        
        # Decrease if struggling
        elif recent_accuracy <= 0.4 and current_idx > 0:
            return difficulties[current_idx - 1]
        
        return current_difficulty
    
    def get_practice_plan(
        self,
        student_profile: Dict,
        weak_topics: List[str],
        duration_minutes: int = 30
    ) -> List[str]:
        """
        Generate a practice session plan
        """
        estimated_questions = duration_minutes // 3  # ~3 min per question
        
        plan = []
        
        # Allocate questions
        weak_count = int(estimated_questions * 0.6)  # 60% on weak topics
        medium_count = int(estimated_questions * 0.3)  # 30% on medium topics
        review_count = estimated_questions - weak_count - medium_count  # 10% review
        
        plan.append({
            "phase": "Focus on Weak Areas",
            "topics": weak_topics[:3] if weak_topics else ["Mixed"],
            "count": weak_count,
            "difficulty": "easy-medium"
        })
        
        plan.append({
            "phase": "Practice Medium Topics",
            "count": medium_count,
            "difficulty": "medium"
        })
        
        plan.append({
            "phase": "Review Strong Topics",
            "count": review_count,
            "difficulty": "hard"
        })
        
        return plan


# Singleton instance
adaptive_engine = AdaptiveEngine()
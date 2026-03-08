"""
Interference Detection System
Identifies learning interference patterns and topic dependencies
"""

from typing import List, Dict, Set, Tuple
from collections import defaultdict
import statistics


class InterferenceDetector:
    """
    Detects when learning one topic interferes with retention of another
    """
    
    def __init__(self):
        # Known interference patterns (can be expanded)
        self.known_interferences = {
            "Arrays": ["Linked Lists", "Strings"],
            "Stacks": ["Queues"],
            "BFS": ["DFS"],
            "Sorting": ["Searching"],
            "SQL Joins": ["SQL Subqueries"],
            "Threads": ["Processes"]
        }
        
        # Minimum accuracy drop to consider interference
        self.interference_threshold = 0.15  # 15% drop
    
    def detect_interference(
        self,
        learning_history: List[Dict],
        min_attempts: int = 3
    ) -> Dict:
        """
        Detect interference patterns in student's learning history
        
        Args:
            learning_history: Chronological list of questions answered
            min_attempts: Minimum attempts per topic to consider
            
        Returns:
            Dict with interference patterns and recommendations
        """
        
        # Organize by topic
        topic_performance = self._organize_by_topic(learning_history)
        
        # Detect retroactive interference (new learning affects old)
        retroactive = self._detect_retroactive_interference(
            learning_history,
            topic_performance,
            min_attempts
        )
        
        # Detect proactive interference (old learning affects new)
        proactive = self._detect_proactive_interference(
            learning_history,
            topic_performance,
            min_attempts
        )
        
        # Detect similar topic confusion
        confusion_pairs = self._detect_topic_confusion(
            learning_history,
            topic_performance
        )
        
        # Generate recommendations
        recommendations = self._generate_recommendations(
            retroactive,
            proactive,
            confusion_pairs
        )
        
        return {
            "retroactive_interference": retroactive,
            "proactive_interference": proactive,
            "topic_confusion": confusion_pairs,
            "recommendations": recommendations,
            "interference_score": self._calculate_interference_score(
                retroactive, proactive, confusion_pairs
            )
        }
    
    def _organize_by_topic(self, history: List[Dict]) -> Dict:
        """
        Organize learning history by topic
        """
        topics = defaultdict(list)
        
        for idx, item in enumerate(history):
            topics[item['topic']].append({
                **item,
                'sequence_index': idx
            })
        
        return dict(topics)
    
    def _detect_retroactive_interference(
        self,
        history: List[Dict],
        topic_performance: Dict,
        min_attempts: int
    ) -> List[Dict]:
        """
        Detect when learning topic B causes performance drop in topic A
        """
        interferences = []
        
        for topic_a, attempts_a in topic_performance.items():
            if len(attempts_a) < min_attempts:
                continue
            
            # Calculate accuracy before and after learning other topics
            for topic_b, attempts_b in topic_performance.items():
                if topic_a == topic_b or len(attempts_b) < min_attempts:
                    continue
                
                # Find when topic B was learned
                topic_b_start = min(a['sequence_index'] for a in attempts_b)
                
                # Get topic A attempts before and after topic B
                before = [a for a in attempts_a if a['sequence_index'] < topic_b_start]
                after = [a for a in attempts_a if a['sequence_index'] > topic_b_start]
                
                if len(before) >= 2 and len(after) >= 2:
                    accuracy_before = sum(1 for a in before if a.get('correct', False)) / len(before)
                    accuracy_after = sum(1 for a in after if a.get('correct', False)) / len(after)
                    
                    # Check for significant drop
                    if accuracy_before - accuracy_after >= self.interference_threshold:
                        interferences.append({
                            "interfered_topic": topic_a,
                            "interfering_topic": topic_b,
                            "accuracy_before": round(accuracy_before, 3),
                            "accuracy_after": round(accuracy_after, 3),
                            "drop_percentage": round((accuracy_before - accuracy_after) * 100, 1),
                            "type": "retroactive",
                            "severity": self._calculate_severity(accuracy_before - accuracy_after)
                        })
        
        # Sort by severity
        interferences.sort(key=lambda x: x['drop_percentage'], reverse=True)
        
        return interferences
    
    def _detect_proactive_interference(
        self,
        history: List[Dict],
        topic_performance: Dict,
        min_attempts: int
    ) -> List[Dict]:
        """
        Detect when prior knowledge of topic A interferes with learning topic B
        """
        interferences = []
        
        for topic_b, attempts_b in topic_performance.items():
            if len(attempts_b) < min_attempts:
                continue
            
            topic_b_start = min(a['sequence_index'] for a in attempts_b)
            
            # Check all topics learned before topic B
            for topic_a, attempts_a in topic_performance.items():
                if topic_a == topic_b:
                    continue
                
                topic_a_attempts_before = [a for a in attempts_a if a['sequence_index'] < topic_b_start]
                
                if len(topic_a_attempts_before) >= 2:
                    # Check if topic B has lower accuracy than expected
                    early_b_attempts = attempts_b[:min(5, len(attempts_b))]
                    early_accuracy = sum(1 for a in early_b_attempts if a.get('correct', False)) / len(early_b_attempts)
                    
                    # Compare with typical first-attempt accuracy
                    expected_accuracy = 0.5  # Baseline
                    
                    if expected_accuracy - early_accuracy >= self.interference_threshold:
                        # Check if topics are similar (potential confusion)
                        if self._are_topics_similar(topic_a, topic_b):
                            interferences.append({
                                "new_topic": topic_b,
                                "interfering_prior_topic": topic_a,
                                "early_accuracy": round(early_accuracy, 3),
                                "expected_accuracy": expected_accuracy,
                                "type": "proactive",
                                "severity": self._calculate_severity(expected_accuracy - early_accuracy)
                            })
        
        return interferences
    
    def _detect_topic_confusion(
        self,
        history: List[Dict],
        topic_performance: Dict
    ) -> List[Dict]:
        """
        Detect confusion between similar topics
        """
        confusions = []
        topics = list(topic_performance.keys())
        
        for i, topic_a in enumerate(topics):
            for topic_b in topics[i+1:]:
                # Check if topics are similar
                if not self._are_topics_similar(topic_a, topic_b):
                    continue
                
                # Analyze alternating performance
                combined_attempts = []
                for attempt in history:
                    if attempt['topic'] in [topic_a, topic_b]:
                        combined_attempts.append(attempt)
                
                if len(combined_attempts) < 6:
                    continue
                
                # Check for pattern of confusion (alternating low accuracy)
                confusion_score = self._calculate_confusion_score(combined_attempts)
                
                if confusion_score > 0.6:  # High confusion
                    confusions.append({
                        "topic_1": topic_a,
                        "topic_2": topic_b,
                        "confusion_score": round(confusion_score, 3),
                        "severity": "high" if confusion_score > 0.75 else "medium",
                        "recommendation": f"Review differences between {topic_a} and {topic_b}"
                    })
        
        return confusions
    
    def _are_topics_similar(self, topic_a: str, topic_b: str) -> bool:
        """
        Check if two topics are similar (likely to cause confusion)
        """
        # Check known interference patterns
        if topic_a in self.known_interferences:
            if topic_b in self.known_interferences[topic_a]:
                return True
        
        if topic_b in self.known_interferences:
            if topic_a in self.known_interferences[topic_b]:
                return True
        
        # Check for similar words
        words_a = set(topic_a.lower().split())
        words_b = set(topic_b.lower().split())
        
        if len(words_a.intersection(words_b)) > 0:
            return True
        
        return False
    
    def _calculate_confusion_score(self, attempts: List[Dict]) -> float:
        """
        Calculate confusion score based on alternating performance
        """
        if len(attempts) < 4:
            return 0.0
        
        # Count transitions between topics
        transitions = 0
        errors_after_transition = 0
        
        for i in range(1, len(attempts)):
            if attempts[i]['topic'] != attempts[i-1]['topic']:
                transitions += 1
                if not attempts[i].get('correct', False):
                    errors_after_transition += 1
        
        if transitions == 0:
            return 0.0
        
        confusion_score = errors_after_transition / transitions
        return confusion_score
    
    def _calculate_severity(self, drop: float) -> str:
        """
        Calculate interference severity
        """
        if drop >= 0.3:
            return "high"
        elif drop >= 0.2:
            return "medium"
        else:
            return "low"
    
    def _calculate_interference_score(
        self,
        retroactive: List[Dict],
        proactive: List[Dict],
        confusion: List[Dict]
    ) -> float:
        """
        Calculate overall interference score (0-1)
        """
        total_issues = len(retroactive) + len(proactive) + len(confusion)
        
        if total_issues == 0:
            return 0.0
        
        # Weight by severity
        severity_scores = {
            "high": 1.0,
            "medium": 0.6,
            "low": 0.3
        }
        
        total_severity = 0
        for item in retroactive + proactive:
            total_severity += severity_scores.get(item['severity'], 0.5)
        
        for item in confusion:
            total_severity += severity_scores.get(item['severity'], 0.5)
        
        # Normalize to 0-1
        interference_score = min(1.0, total_severity / (total_issues * 2))
        
        return round(interference_score, 3)
    
    def _generate_recommendations(
        self,
        retroactive: List[Dict],
        proactive: List[Dict],
        confusion: List[Dict]
    ) -> List[str]:
        """
        Generate learning recommendations based on interference patterns
        """
        recommendations = []
        
        # Retroactive interference recommendations
        if retroactive:
            for item in retroactive[:3]:  # Top 3
                recommendations.append(
                    f"Review '{item['interfered_topic']}' before learning more about '{item['interfering_topic']}'. "
                    f"Performance dropped by {item['drop_percentage']}%."
                )
        
        # Proactive interference recommendations
        if proactive:
            for item in proactive[:2]:
                recommendations.append(
                    f"'{item['new_topic']}' may be confused with '{item['interfering_prior_topic']}'. "
                    f"Study them separately with clear distinctions."
                )
        
        # Confusion recommendations
        if confusion:
            for item in confusion:
                recommendations.append(
                    f"High confusion detected between '{item['topic_1']}' and '{item['topic_2']}'. "
                    f"{item['recommendation']}"
                )
        
        # General recommendations
        if len(retroactive) + len(proactive) + len(confusion) == 0:
            recommendations.append("Great! No significant learning interference detected. Keep up the good work!")
        elif len(recommendations) > 5:
            recommendations = recommendations[:5]
            recommendations.append(f"+ {len(recommendations) - 5} more recommendations...")
        
        return recommendations
    
    def get_topic_dependencies(self, topic: str) -> Dict:
        """
        Get prerequisites and follow-up topics
        """
        # This would typically come from a knowledge graph
        # For now, using hardcoded dependencies
        
        dependencies = {
            "Arrays": {
                "prerequisites": ["Basic Programming", "Loops"],
                "follow_ups": ["Strings", "Linked Lists", "Stacks"],
                "difficulty": "beginner"
            },
            "Linked Lists": {
                "prerequisites": ["Arrays", "Pointers"],
                "follow_ups": ["Trees", "Graphs"],
                "difficulty": "intermediate"
            },
            "Trees": {
                "prerequisites": ["Linked Lists", "Recursion"],
                "follow_ups": ["Binary Search Trees", "Heaps", "Graphs"],
                "difficulty": "intermediate"
            },
            "Dynamic Programming": {
                "prerequisites": ["Recursion", "Arrays", "Problem Solving"],
                "follow_ups": ["Advanced Algorithms", "Optimization"],
                "difficulty": "advanced"
            }
        }
        
        return dependencies.get(topic, {
            "prerequisites": [],
            "follow_ups": [],
            "difficulty": "intermediate"
        })


# Singleton instance
interference_detector = InterferenceDetector()
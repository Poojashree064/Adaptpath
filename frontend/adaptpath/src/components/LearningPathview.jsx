/**
 * Learning Path View - Displays Personalized Study Plan
 */

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Calendar,
  CheckCircle,
  Circle,
  Book,
  Target,
  TrendingUp,
  Lightbulb,
  ArrowLeft,
  Sparkles
} from 'lucide-react';
import './LearningPathView.css';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

export default function LearningPathView({ weak_topics = [], learning_style = 'visual' }) {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [plan, setPlan] = useState(null);
  const [selectedWeek, setSelectedWeek] = useState(0);
  const [completedTasks, setCompletedTasks] = useState({});

  const studentId = localStorage.getItem('student_id') || '1';

  useEffect(() => {
    if (weak_topics.length > 0) {
      generatePlan();
    }
  }, [weak_topics]);

  const generatePlan = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${API_URL}/ai-tutor/generate-plan`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          student_id: studentId,
          weak_topics: weak_topics,
          learning_style: learning_style,
          target_weeks: 4
        })
      });

      const data = await response.json();
      setPlan(data.plan);
    } catch (error) {
      console.error('Failed to generate plan:', error);
    } finally {
      setLoading(false);
    }
  };

  const toggleTaskCompletion = (weekIdx, dayIdx, taskIdx) => {
    const key = `${weekIdx}-${dayIdx}-${taskIdx}`;
    setCompletedTasks(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  if (loading) {
    return (
      <div className="learning-path-loading">
        <Sparkles size={48} className="spin-icon" />
        <p>Generating your personalized plan...</p>
      </div>
    );
  }

  if (!plan) {
    return (
      <div className="learning-path-error">
        <p>No learning plan available. Complete diagnostic test first.</p>
        <button onClick={() => navigate('/diagnostic')} className="btn-primary">
          Take Diagnostic Test
        </button>
      </div>
    );
  }

  const currentWeek = plan.weeks[selectedWeek];

  return (
    <div className="learning-path-container">
      {/* Header */}
      <div className="learning-path-header">
        <button onClick={() => navigate('/dashboard')} className="back-btn">
          <ArrowLeft size={20} />
        </button>
        <div>
          <h1>📚 Your Personalized Learning Plan</h1>
          <p>{plan.plan_summary}</p>
        </div>
      </div>

      {/* Week Selector */}
      <div className="week-selector">
        {plan.weeks.map((week, idx) => (
          <button
            key={idx}
            onClick={() => setSelectedWeek(idx)}
            className={`week-btn ${selectedWeek === idx ? 'active' : ''}`}
          >
            <Calendar size={18} />
            <span>Week {week.week}</span>
          </button>
        ))}
      </div>

      {/* Current Week Details */}
      <div className="week-details-card">
        <div className="week-header">
          <div>
            <h2>Week {currentWeek.week}: {currentWeek.focus_topic}</h2>
            <p className="week-goal">{currentWeek.success_criteria}</p>
          </div>
          <div className="week-progress">
            <div className="circular-progress">
              <span className="progress-text">
                {Math.round((Object.keys(completedTasks).filter(k => k.startsWith(`${selectedWeek}-`)).length / 
                  (currentWeek.daily_breakdown.length * 3)) * 100)}%
              </span>
            </div>
          </div>
        </div>

        {/* Daily Breakdown */}
        <div className="daily-breakdown">
          {currentWeek.daily_breakdown.map((day, dayIdx) => (
            <div key={dayIdx} className="day-card">
              <div className="day-header">
                <h3>{day.day}</h3>
                <span className="practice-count">
                  {day.practice_problems} problems
                </span>
              </div>
              
              <div className="task-list">
                {day.tasks.map((task, taskIdx) => {
                  const taskKey = `${selectedWeek}-${dayIdx}-${taskIdx}`;
                  const isCompleted = completedTasks[taskKey];
                  
                  return (
                    <div key={taskIdx} className="task-item">
                      <button
                        onClick={() => toggleTaskCompletion(selectedWeek, dayIdx, taskIdx)}
                        className={`task-checkbox ${isCompleted ? 'completed' : ''}`}
                      >
                        {isCompleted ? <CheckCircle size={18} /> : <Circle size={18} />}
                      </button>
                      <span className={`task-text ${isCompleted ? 'completed' : ''}`}>
                        {task}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        {/* Week Assessment */}
        <div className="week-assessment">
          <Target size={20} />
          <div>
            <h4>Weekly Assessment</h4>
            <p>{currentWeek.assessment}</p>
          </div>
        </div>
      </div>

      {/* Learning Resources */}
      <div className="resources-section">
        <h3>📖 Recommended Resources</h3>
        <div className="resources-grid">
          {plan.learning_resources.visual && (
            <div className="resource-card">
              <Book size={24} />
              <h4>Visual Learning</h4>
              <ul>
                {plan.learning_resources.visual.map((resource, idx) => (
                  <li key={idx}>{resource}</li>
                ))}
              </ul>
            </div>
          )}
          
          {plan.learning_resources.interactive && (
            <div className="resource-card">
              <Sparkles size={24} />
              <h4>Interactive Practice</h4>
              <ul>
                {plan.learning_resources.interactive.map((resource, idx) => (
                  <li key={idx}>{resource}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>

      {/* Motivation Tips */}
      <div className="motivation-section">
        <Lightbulb size={24} />
        <div>
          <h3>💪 Stay Motivated</h3>
          <ul className="motivation-tips">
            {plan.motivation_tips.map((tip, idx) => (
              <li key={idx}>{tip}</li>
            ))}
          </ul>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="action-buttons">
        <button
          onClick={() => navigate('/practice')}
          className="btn-primary-large"
        >
          <TrendingUp size={20} />
          Start Today's Practice
        </button>
        
        <button
          onClick={() => navigate('/ai-tutor')}
          className="btn-secondary-large"
        >
          <Sparkles size={20} />
          Ask AI Tutor
        </button>
      </div>
    </div>
  );
}
/**
 * Goal Setting Page
 * Set and track learning goals with progress monitoring
 */

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Target,
  TrendingUp,
  Calendar,
  Zap,
  CheckCircle,
  ArrowLeft,
  Plus,
  Edit2,
  Trash2,
  Award
} from 'lucide-react';
import {
  CircularProgressbar,
  buildStyles
} from 'react-circular-progressbar';
import 'react-circular-progressbar/dist/styles.css';
import './GoalSetting.css';

const API_BASE = 'http://localhost:8000/api';

const GOAL_TYPES = [
  { value: 'accuracy', label: 'Accuracy Target', icon: <Target />, unit: '%' },
  { value: 'questions', label: 'Questions Count', icon: <Zap />, unit: ' questions' },
  { value: 'topics', label: 'Topics Mastery', icon: <TrendingUp />, unit: ' topics' },
  { value: 'streak', label: 'Daily Streak', icon: <Calendar />, unit: ' days' }
];

export default function GoalSetting() {
  const navigate = useNavigate();
  const [goals, setGoals] = useState([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingGoal, setEditingGoal] = useState(null);
  const [loading, setLoading] = useState(true);

  const studentId = 'student_123';

  useEffect(() => {
    loadGoals();
  }, []);

  const loadGoals = async () => {
    setLoading(true);
    try {
      // In production, fetch from API
      // For now, use local storage
      const stored = localStorage.getItem('learning_goals');
      if (stored) {
        setGoals(JSON.parse(stored));
      }
    } catch (error) {
      console.error('Failed to load goals:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveGoal = async (goalData) => {
    try {
      const response = await fetch(`${API_BASE}/analytics/set-goal`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          student_id: studentId,
          ...goalData
        })
      });

      const result = await response.json();

      if (editingGoal) {
        // Update existing goal
        const updated = goals.map(g =>
          g.id === editingGoal.id ? { ...g, ...goalData } : g
        );
        setGoals(updated);
        localStorage.setItem('learning_goals', JSON.stringify(updated));
      } else {
        // Add new goal
        const newGoal = {
          id: Date.now().toString(),
          ...goalData,
          current_value: 0,
          progress: 0,
          created_at: new Date().toISOString()
        };
        const updated = [...goals, newGoal];
        setGoals(updated);
        localStorage.setItem('learning_goals', JSON.stringify(updated));
      }

      setShowAddModal(false);
      setEditingGoal(null);
    } catch (error) {
      console.error('Failed to save goal:', error);
      alert('Failed to save goal. Please try again.');
    }
  };

  const handleDeleteGoal = (goalId) => {
    if (window.confirm('Are you sure you want to delete this goal?')) {
      const updated = goals.filter(g => g.id !== goalId);
      setGoals(updated);
      localStorage.setItem('learning_goals', JSON.stringify(updated));
    }
  };

  const handleEditGoal = (goal) => {
    setEditingGoal(goal);
    setShowAddModal(true);
  };

  const getAchievementLevel = () => {
    const completed = goals.filter(g => g.progress >= 100).length;
    if (completed >= 10) return { level: 'Legend', color: '#fbbf24' };
    if (completed >= 5) return { level: 'Expert', color: '#8b5cf6' };
    if (completed >= 3) return { level: 'Advanced', color: '#3b82f6' };
    if (completed >= 1) return { level: 'Intermediate', color: '#22c55e' };
    return { level: 'Beginner', color: '#9ca3af' };
  };

  const achievement = getAchievementLevel();
  const completedGoals = goals.filter(g => g.progress >= 100).length;
  const activeGoals = goals.filter(g => g.progress < 100).length;

  if (loading) {
    return (
      <div className="goals-loading">
        <div className="loader-spinner" />
        <p>Loading goals...</p>
      </div>
    );
  }

  return (
    <div className="goal-setting-page">
      {/* Header */}
      <header className="goals-header">
        <button onClick={() => navigate(-1)} className="back-btn">
          <ArrowLeft size={20} />
        </button>
        <div>
          <h1 className="page-title">Learning Goals</h1>
          <p className="page-subtitle">Set targets, track progress, and achieve your learning objectives</p>
        </div>
        <button
          onClick={() => {
            setEditingGoal(null);
            setShowAddModal(true);
          }}
          className="btn-add-goal"
        >
          <Plus size={20} />
          New Goal
        </button>
      </header>

      {/* Stats Overview */}
      <div className="goals-stats">
        <div className="stat-card">
          <Award size={32} color={achievement.color} />
          <div>
            <span className="stat-label">Achievement Level</span>
            <span className="stat-value" style={{ color: achievement.color }}>
              {achievement.level}
            </span>
          </div>
        </div>
        <div className="stat-card">
          <CheckCircle size={32} color="#22c55e" />
          <div>
            <span className="stat-label">Completed Goals</span>
            <span className="stat-value">{completedGoals}</span>
          </div>
        </div>
        <div className="stat-card">
          <Target size={32} color="#8b5cf6" />
          <div>
            <span className="stat-label">Active Goals</span>
            <span className="stat-value">{activeGoals}</span>
          </div>
        </div>
        <div className="stat-card">
          <TrendingUp size={32} color="#3b82f6" />
          <div>
            <span className="stat-label">Total Goals</span>
            <span className="stat-value">{goals.length}</span>
          </div>
        </div>
      </div>

      {/* Goals Grid */}
      {goals.length > 0 ? (
        <div className="goals-grid">
          {goals.map(goal => (
            <GoalCard
              key={goal.id}
              goal={goal}
              onEdit={() => handleEditGoal(goal)}
              onDelete={() => handleDeleteGoal(goal.id)}
            />
          ))}
        </div>
      ) : (
        <div className="empty-state">
          <Target size={64} color="rgba(255,255,255,0.3)" />
          <h3>No Goals Set Yet</h3>
          <p>Start your learning journey by setting your first goal</p>
          <button
            onClick={() => setShowAddModal(true)}
            className="btn-add-first"
          >
            <Plus size={20} />
            Create Your First Goal
          </button>
        </div>
      )}

      {/* Add/Edit Goal Modal */}
      {showAddModal && (
        <GoalModal
          goal={editingGoal}
          onClose={() => {
            setShowAddModal(false);
            setEditingGoal(null);
          }}
          onSave={handleSaveGoal}
        />
      )}
    </div>
  );
}

// Goal Card Component
function GoalCard({ goal, onEdit, onDelete }) {
  const goalType = GOAL_TYPES.find(t => t.value === goal.goal_type);
  const isCompleted = goal.progress >= 100;

  return (
    <div className={`goal-card ${isCompleted ? 'completed' : ''}`}>
      <div className="goal-header">
        <div className="goal-icon" style={{ color: isCompleted ? '#22c55e' : '#8b5cf6' }}>
          {goalType?.icon}
        </div>
        <div className="goal-actions">
          <button onClick={onEdit} className="btn-action">
            <Edit2 size={16} />
          </button>
          <button onClick={onDelete} className="btn-action danger">
            <Trash2 size={16} />
          </button>
        </div>
      </div>

      <div className="goal-content">
        <h3 className="goal-title">{goal.description || goalType?.label}</h3>
        <div className="goal-target">
          <span className="current">{goal.current_value || 0}</span>
          <span className="separator">/</span>
          <span className="target">{goal.target_value}</span>
          <span className="unit">{goalType?.unit}</span>
        </div>

        <div className="goal-progress">
          <div style={{ width: 80, height: 80, margin: '0 auto' }}>
            <CircularProgressbar
              value={goal.progress || 0}
              text={`${Math.round(goal.progress || 0)}%`}
              styles={buildStyles({
                pathColor: isCompleted ? '#22c55e' : '#8b5cf6',
                textColor: '#fff',
                trailColor: 'rgba(255,255,255,0.1)',
                textSize: '24px'
              })}
            />
          </div>
        </div>

        {goal.deadline && (
          <div className="goal-deadline">
            <Calendar size={14} />
            <span>Deadline: {new Date(goal.deadline).toLocaleDateString()}</span>
          </div>
        )}

        {isCompleted && (
          <div className="completion-badge">
            <CheckCircle size={16} />
            Goal Achieved!
          </div>
        )}
      </div>
    </div>
  );
}

// Goal Modal Component
function GoalModal({ goal, onClose, onSave }) {
  const [formData, setFormData] = useState({
    goal_type: goal?.goal_type || 'accuracy',
    target_value: goal?.target_value || '',
    deadline: goal?.deadline || '',
    description: goal?.description || ''
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.target_value) {
      alert('Please enter a target value');
      return;
    }
    onSave(formData);
  };

  const selectedType = GOAL_TYPES.find(t => t.value === formData.goal_type);

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>{goal ? 'Edit Goal' : 'Create New Goal'}</h2>
          <button onClick={onClose} className="modal-close">×</button>
        </div>

        <form onSubmit={handleSubmit} className="modal-body">
          <div className="form-group">
            <label>Goal Type</label>
            <div className="goal-type-grid">
              {GOAL_TYPES.map(type => (
                <button
                  key={type.value}
                  type="button"
                  onClick={() => setFormData({ ...formData, goal_type: type.value })}
                  className={`goal-type-btn ${formData.goal_type === type.value ? 'active' : ''}`}
                >
                  <div className="type-icon">{type.icon}</div>
                  <span>{type.label}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="form-group">
            <label>Target Value</label>
            <div className="input-with-unit">
              <input
                type="number"
                value={formData.target_value}
                onChange={(e) => setFormData({ ...formData, target_value: e.target.value })}
                placeholder="Enter target"
                className="form-input"
                required
              />
              <span className="unit-label">{selectedType?.unit}</span>
            </div>
          </div>

          <div className="form-group">
            <label>Deadline (Optional)</label>
            <input
              type="date"
              value={formData.deadline}
              onChange={(e) => setFormData({ ...formData, deadline: e.target.value })}
              className="form-input"
              min={new Date().toISOString().split('T')[0]}
            />
          </div>

          <div className="form-group">
            <label>Description (Optional)</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Add a description for this goal..."
              className="form-textarea"
              rows={3}
            />
          </div>

          <div className="modal-footer">
            <button type="button" onClick={onClose} className="btn-cancel">
              Cancel
            </button>
            <button type="submit" className="btn-save">
              {goal ? 'Update Goal' : 'Create Goal'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
/**
 * Learning Insights Page
 * Displays detailed learning patterns, interference analysis, and adaptive recommendations
 */

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Brain,
  AlertTriangle,
  TrendingUp,
  Clock,
  Zap,
  Target,
  BookOpen,
  ArrowLeft,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell
} from 'recharts';
import './LearningInsights.css';

const API_BASE = 'http://localhost:8000/api';

const COLORS = {
  primary: '#8b5cf6',
  danger: '#ef4444',
  warning: '#f59e0b',
  success: '#22c55e',
  info: '#3b82f6'
};

export default function LearningInsights() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [insightsData, setInsightsData] = useState(null);
  const [expandedSections, setExpandedSections] = useState({});

  const studentId = 'student_123';

  useEffect(() => {
    loadInsights();
  }, []);

  const loadInsights = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${API_BASE}/analytics/learning-insights/${studentId}`);
      const data = await response.json();
      setInsightsData(data);
    } catch (error) {
      console.error('Failed to load insights:', error);
    } finally {
      setLoading(false);
    }
  };

  const toggleSection = (section) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  if (loading) {
    return (
      <div className="insights-loading">
        <div className="loader-spinner" />
        <p>Analyzing learning patterns...</p>
      </div>
    );
  }

  return (
    <div className="learning-insights">
      {/* Header */}
      <header className="insights-header">
        <button onClick={() => navigate(-1)} className="back-btn">
          <ArrowLeft size={20} />
        </button>
        <div>
          <h1 className="page-title">Learning Insights</h1>
          <p className="page-subtitle">Deep analysis of your learning patterns and behaviors</p>
        </div>
      </header>

      {/* Overview Cards */}
      <div className="insights-overview">
        <InsightCard
          icon={<Brain />}
          title="Learning Style"
          value={insightsData?.learning_patterns?.learning_style}
          description={insightsData?.learning_patterns?.style_description}
          color={COLORS.primary}
        />
        <InsightCard
          icon={<Clock />}
          title="Peak Performance"
          value={insightsData?.learning_patterns?.peak_time}
          description={`Best time for focused study`}
          color={COLORS.info}
        />
        <InsightCard
          icon={<Zap />}
          title="Pacing Style"
          value={insightsData?.learning_patterns?.pacing}
          description={`${insightsData?.learning_patterns?.avg_time_per_question}s per question`}
          color={COLORS.warning}
        />
        <InsightCard
          icon={<Target />}
          title="Focus Topics"
          value={insightsData?.focus_areas?.length || 0}
          description="Topics requiring attention"
          color={COLORS.danger}
        />
      </div>

      {/* Interference Analysis */}
      <section className="insights-section">
        <div className="section-header" onClick={() => toggleSection('interference')}>
          <div className="section-title-group">
            <AlertTriangle size={24} color={COLORS.warning} />
            <h2>Interference Detection</h2>
          </div>
          <button className="toggle-btn">
            {expandedSections.interference ? <ChevronUp /> : <ChevronDown />}
          </button>
        </div>

        {expandedSections.interference !== false && (
          <div className="section-content">
            {insightsData?.interference_patterns?.retroactive?.length > 0 && (
              <div className="interference-group">
                <h3>Retroactive Interference</h3>
                <p className="group-description">
                  New learning affecting retention of previously learned topics
                </p>
                <div className="interference-list">
                  {insightsData.interference_patterns.retroactive.map((item, idx) => (
                    <InterferenceItem key={idx} data={item} type="retroactive" />
                  ))}
                </div>
              </div>
            )}

            {insightsData?.interference_patterns?.proactive?.length > 0 && (
              <div className="interference-group">
                <h3>Proactive Interference</h3>
                <p className="group-description">
                  Prior knowledge interfering with new learning
                </p>
                <div className="interference-list">
                  {insightsData.interference_patterns.proactive.map((item, idx) => (
                    <InterferenceItem key={idx} data={item} type="proactive" />
                  ))}
                </div>
              </div>
            )}

            {insightsData?.interference_patterns?.confusion?.length > 0 && (
              <div className="interference-group">
                <h3>Topic Confusion</h3>
                <p className="group-description">
                  Similar topics causing confusion
                </p>
                <div className="interference-list">
                  {insightsData.interference_patterns.confusion.map((item, idx) => (
                    <ConfusionItem key={idx} data={item} />
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </section>

      {/* Time Pattern Analysis */}
      <section className="insights-section">
        <div className="section-header" onClick={() => toggleSection('timePatterns')}>
          <div className="section-title-group">
            <Clock size={24} color={COLORS.info} />
            <h2>Time & Activity Patterns</h2>
          </div>
          <button className="toggle-btn">
            {expandedSections.timePatterns ? <ChevronUp /> : <ChevronDown />}
          </button>
        </div>

        {expandedSections.timePatterns !== false && (
          <div className="section-content">
            <div className="chart-container">
              <h3>Hourly Activity Distribution</h3>
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={insightsData?.time_patterns?.hourly_distribution || []}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                  <XAxis dataKey="hour" stroke="rgba(255,255,255,0.6)" />
                  <YAxis stroke="rgba(255,255,255,0.6)" />
                  <Tooltip
                    contentStyle={{
                      background: '#1e1432',
                      border: '1px solid #8b5cf6',
                      borderRadius: 8
                    }}
                  />
                  <Bar dataKey="questions" radius={[8, 8, 0, 0]}>
                    {insightsData?.time_patterns?.hourly_distribution?.map((entry, index) => (
                      <Cell 
                        key={index} 
                        fill={entry.hour === insightsData?.learning_patterns?.peak_hour ? 
                          COLORS.success : COLORS.primary
                        }
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>

            <div className="chart-container">
              <h3>Daily Activity Trend</h3>
              <ResponsiveContainer width="100%" height={250}>
                <LineChart data={insightsData?.time_patterns?.daily_trend || []}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                  <XAxis dataKey="day" stroke="rgba(255,255,255,0.6)" />
                  <YAxis stroke="rgba(255,255,255,0.6)" />
                  <Tooltip
                    contentStyle={{
                      background: '#1e1432',
                      border: '1px solid #8b5cf6',
                      borderRadius: 8
                    }}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="questions" 
                    stroke={COLORS.primary} 
                    strokeWidth={2}
                    dot={{ fill: COLORS.primary, r: 4 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}
      </section>

      {/* Focus Areas */}
      <section className="insights-section">
        <div className="section-header" onClick={() => toggleSection('focusAreas')}>
          <div className="section-title-group">
            <Target size={24} color={COLORS.danger} />
            <h2>Priority Focus Areas</h2>
          </div>
          <button className="toggle-btn">
            {expandedSections.focusAreas ? <ChevronUp /> : <ChevronDown />}
          </button>
        </div>

        {expandedSections.focusAreas !== false && (
          <div className="section-content">
            <div className="focus-areas-grid">
              {insightsData?.focus_areas?.map((area, idx) => (
                <FocusAreaCard key={idx} area={area} />
              ))}
            </div>
          </div>
        )}
      </section>

      {/* Adaptive Recommendations */}
      <section className="insights-section">
        <div className="section-header" onClick={() => toggleSection('recommendations')}>
          <div className="section-title-group">
            <BookOpen size={24} color={COLORS.success} />
            <h2>Adaptive Recommendations</h2>
          </div>
          <button className="toggle-btn">
            {expandedSections.recommendations ? <ChevronUp /> : <ChevronDown />}
          </button>
        </div>

        {expandedSections.recommendations !== false && (
          <div className="section-content">
            <div className="recommendations-container">
              {insightsData?.adaptive_recommendations?.next_topics?.map((topic, idx) => (
                <RecommendationCard key={idx} topic={topic} />
              ))}
            </div>
          </div>
        )}
      </section>

      {/* Action Buttons */}
      <div className="insights-actions">
        <button 
          onClick={() => navigate('/practice')} 
          className="action-btn primary"
        >
          <Zap size={20} />
          Start Optimized Practice
        </button>
        <button 
          onClick={() => navigate('/analytics')} 
          className="action-btn secondary"
        >
          View Full Analytics
        </button>
      </div>
    </div>
  );
}

// Helper Components

function InsightCard({ icon, title, value, description, color }) {
  return (
    <div className="insight-card">
      <div className="insight-icon" style={{ background: `${color}20`, color }}>
        {icon}
      </div>
      <div className="insight-content">
        <h3>{title}</h3>
        <p className="insight-value">{value}</p>
        <p className="insight-description">{description}</p>
      </div>
    </div>
  );
}

function InterferenceItem({ data, type }) {
  const severityColor = {
    high: COLORS.danger,
    medium: COLORS.warning,
    low: COLORS.info
  };

  return (
    <div className="interference-item">
      <div 
        className="severity-indicator" 
        style={{ background: severityColor[data.severity] }}
      />
      <div className="interference-content">
        {type === 'retroactive' ? (
          <>
            <h4>
              <span className="topic-label">{data.interfered_topic}</span>
              <span className="arrow">←</span>
              <span className="topic-label interfering">{data.interfering_topic}</span>
            </h4>
            <p>
              Performance dropped by <strong>{data.drop_percentage}%</strong> after learning {data.interfering_topic}
            </p>
            <div className="accuracy-change">
              <span>Before: {(data.accuracy_before * 100).toFixed(1)}%</span>
              <span className="arrow-icon">→</span>
              <span>After: {(data.accuracy_after * 100).toFixed(1)}%</span>
            </div>
          </>
        ) : (
          <>
            <h4>
              <span className="topic-label">{data.new_topic}</span>
              <span className="arrow">affected by</span>
              <span className="topic-label interfering">{data.interfering_prior_topic}</span>
            </h4>
            <p>
              Early accuracy: <strong>{(data.early_accuracy * 100).toFixed(1)}%</strong>
            </p>
          </>
        )}
      </div>
    </div>
  );
}

function ConfusionItem({ data }) {
  return (
    <div className="confusion-item">
      <div className="confusion-header">
        <h4>
          <span className="topic-label">{data.topic_1}</span>
          <span className="vs">vs</span>
          <span className="topic-label">{data.topic_2}</span>
        </h4>
        <span 
          className="confusion-badge"
          style={{ 
            background: data.severity === 'high' ? `${COLORS.danger}20` : `${COLORS.warning}20`,
            color: data.severity === 'high' ? COLORS.danger : COLORS.warning
          }}
        >
          {data.severity} confusion
        </span>
      </div>
      <p>{data.recommendation}</p>
      <div className="confusion-score">
        <span>Confusion Score:</span>
        <div className="score-bar">
          <div 
            className="score-fill" 
            style={{ 
              width: `${data.confusion_score * 100}%`,
              background: data.severity === 'high' ? COLORS.danger : COLORS.warning
            }}
          />
        </div>
        <span>{(data.confusion_score * 100).toFixed(0)}%</span>
      </div>
    </div>
  );
}

function FocusAreaCard({ area }) {
  return (
    <div className="focus-area-card">
      <div className="focus-header">
        <h4>{area.topic}</h4>
        <span className="priority-badge" style={{ background: `${COLORS.danger}20`, color: COLORS.danger }}>
          {area.priority}
        </span>
      </div>
      <div className="focus-stats">
        <div className="stat">
          <span className="stat-label">Current Accuracy</span>
          <span className="stat-value">{area.current_accuracy}%</span>
        </div>
        <div className="stat">
          <span className="stat-label">Questions Needed</span>
          <span className="stat-value">{area.estimated_questions}</span>
        </div>
      </div>
      <p className="focus-action">{area.action_plan}</p>
    </div>
  );
}

function RecommendationCard({ topic }) {
  return (
    <div className="recommendation-card">
      <div className="rec-header">
        <h4>{topic.name}</h4>
        <span className="difficulty-badge">
          {topic.difficulty}
        </span>
      </div>
      <p className="rec-reason">{topic.reason}</p>
      <div className="rec-stats">
        <span><strong>Estimated time:</strong> {topic.estimated_time}</span>
        <span><strong>Success probability:</strong> {topic.success_probability}%</span>
      </div>
      <button className="start-btn">
        Start Learning
        <ChevronDown size={16} />
      </button>
    </div>
  );
}
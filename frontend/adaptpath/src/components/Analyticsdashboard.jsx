/**
 * Analytics Dashboard - Main Analytics Page
 * Displays comprehensive performance metrics, charts, and insights
 */

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  TrendingUp,
  Target,
  Award,
  Clock,
  Brain,
  Zap,
  Calendar,
  ChevronRight,
  Download,
  RefreshCw
} from 'lucide-react';
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  RadarChart,
  Radar,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';
import './AnalyticsDashboard.css';

const COLORS = {
  primary: '#8b5cf6',
  secondary: '#ec4899',
  success: '#22c55e',
  warning: '#f59e0b',
  danger: '#ef4444',
  info: '#3b82f6'
};

const API_BASE = 'http://localhost:8000/api';

export default function AnalyticsDashboard() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState('MONTH');
  const [dashboardData, setDashboardData] = useState(null);
  const [performanceTrends, setPerformanceTrends] = useState(null);
  const [topicMastery, setTopicMastery] = useState(null);
  const [readinessData, setReadinessData] = useState(null);

  const studentId = 'student_123'; // Replace with actual student ID

  useEffect(() => {
    loadAnalytics();
  }, [timeRange]);

  const loadAnalytics = async () => {
    setLoading(true);
    try {
      // Load all analytics data
      const [dashboard, trends, topics, readiness] = await Promise.all([
        fetch(`${API_BASE}/analytics/dashboard/${studentId}`).then(r => r.json()),
        fetch(`${API_BASE}/analytics/performance-trends/${studentId}?days=30`).then(r => r.json()),
        fetch(`${API_BASE}/analytics/topic-mastery/${studentId}`).then(r => r.json()),
        fetch(`${API_BASE}/analytics/readiness-assessment/${studentId}`).then(r => r.json())
      ]);

      setDashboardData(dashboard);
      setPerformanceTrends(trends);
      setTopicMastery(topics);
      setReadinessData(readiness);
    } catch (error) {
      console.error('Failed to load analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  const exportReport = async (format) => {
    try {
      const response = await fetch(
        `${API_BASE}/analytics/export-report/${studentId}?format=${format}`,
        { method: 'GET' }
      );
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `analytics_report.${format}`;
      a.click();
    } catch (error) {
      console.error('Export failed:', error);
    }
  };

  if (loading) {
    return (
      <div className="analytics-loading">
        <div className="loader-spinner" />
        <p>Loading analytics...</p>
      </div>
    );
  }

  return (
    <div className="analytics-dashboard">
      {/* Header */}
      <header className="analytics-header">
        <div className="header-content">
          <div>
            <h1 className="dashboard-title">Performance Analytics</h1>
            <p className="dashboard-subtitle">Comprehensive insights into your learning journey</p>
          </div>
          <div className="header-actions">
            <button onClick={loadAnalytics} className="btn-icon">
              <RefreshCw size={20} />
            </button>
            <div className="dropdown">
              <button className="btn-export">
                <Download size={20} />
                <span>Export Report</span>
              </button>
              <div className="dropdown-menu">
                <button onClick={() => exportReport('pdf')}>Export as PDF</button>
                <button onClick={() => exportReport('json')}>Export as JSON</button>
                <button onClick={() => exportReport('csv')}>Export as CSV</button>
              </div>
            </div>
          </div>
        </div>

        {/* Time Range Selector */}
        <div className="time-range-selector">
          {['WEEK', 'MONTH', 'QUARTER', 'ALL_TIME'].map(range => (
            <button
              key={range}
              onClick={() => setTimeRange(range)}
              className={`time-btn ${timeRange === range ? 'active' : ''}`}
            >
              {range.replace('_', ' ')}
            </button>
          ))}
        </div>
      </header>

      {/* Key Metrics Cards */}
      <div className="metrics-grid">
        <MetricCard
          icon={<Target size={24} />}
          label="Overall Accuracy"
          value={`${dashboardData?.overall_performance?.accuracy?.toFixed(1)}%`}
          trend={dashboardData?.overall_performance?.trend}
          color={COLORS.primary}
        />
        <MetricCard
          icon={<TrendingUp size={24} />}
          label="Learning Velocity"
          value={dashboardData?.learning_velocity?.current_rate?.toFixed(1)}
          subtitle="points/month"
          trend={dashboardData?.learning_velocity?.trend}
          color={COLORS.success}
        />
        <MetricCard
          icon={<Zap size={24} />}
          label="Consistency Score"
          value={`${(dashboardData?.consistency_score?.score * 100)?.toFixed(0)}%`}
          subtitle={`${dashboardData?.consistency_score?.current_streak} day streak`}
          color={COLORS.warning}
        />
        <MetricCard
          icon={<Award size={24} />}
          label="Interview Readiness"
          value={`${dashboardData?.readiness_score?.overall_score}/100`}
          subtitle={dashboardData?.readiness_score?.level}
          trend={dashboardData?.readiness_score?.trend}
          color={COLORS.info}
        />
      </div>

      {/* Performance Trends Chart */}
      <div className="chart-card">
        <div className="chart-header">
          <h3>Performance Trends</h3>
          <div className="chart-legend">
            <span><div className="legend-dot" style={{ background: COLORS.primary }} /> Accuracy</span>
            <span><div className="legend-dot" style={{ background: COLORS.success }} /> Questions</span>
          </div>
        </div>
        <ResponsiveContainer width="100%" height={300}>
          <AreaChart data={performanceTrends?.trend_data || []}>
            <defs>
              <linearGradient id="colorAccuracy" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={COLORS.primary} stopOpacity={0.3} />
                <stop offset="95%" stopColor={COLORS.primary} stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
            <XAxis dataKey="date" stroke="rgba(255,255,255,0.6)" />
            <YAxis stroke="rgba(255,255,255,0.6)" />
            <Tooltip
              contentStyle={{
                background: '#1e1432',
                border: '1px solid #8b5cf6',
                borderRadius: 8
              }}
            />
            <Area
              type="monotone"
              dataKey="accuracy"
              stroke={COLORS.primary}
              fill="url(#colorAccuracy)"
              strokeWidth={2}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Two Column Layout */}
      <div className="two-column-grid">
        {/* Topic Mastery */}
        <div className="chart-card">
          <div className="chart-header">
            <h3>Topic Mastery</h3>
            <button className="btn-link">View All <ChevronRight size={16} /></button>
          </div>
          <div className="topic-list">
            {topicMastery?.topics?.slice(0, 8).map((topic, idx) => (
              <TopicMasteryItem key={idx} topic={topic} />
            ))}
          </div>
        </div>

        {/* Readiness Breakdown */}
        <div className="chart-card">
          <div className="chart-header">
            <h3>Interview Readiness Breakdown</h3>
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <RadarChart data={readinessData?.breakdown_chart || []}>
              <PolarGrid stroke="rgba(255,255,255,0.2)" />
              <PolarAngleAxis dataKey="factor" stroke="rgba(255,255,255,0.6)" />
              <PolarRadiusAxis stroke="rgba(255,255,255,0.3)" />
              <Radar
                dataKey="score"
                stroke={COLORS.primary}
                fill={COLORS.primary}
                fillOpacity={0.6}
              />
              <Tooltip
                contentStyle={{
                  background: '#1e1432',
                  border: '1px solid #8b5cf6',
                  borderRadius: 8
                }}
              />
            </RadarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Learning Patterns */}
      <div className="chart-card">
        <div className="chart-header">
          <h3>Learning Patterns & Insights</h3>
        </div>
        <div className="patterns-grid">
          <PatternCard
            icon={<Clock />}
            title="Peak Performance Time"
            value={dashboardData?.learning_patterns?.peak_time}
            insight="You perform best during this time"
          />
          <PatternCard
            icon={<Brain />}
            title="Learning Style"
            value={dashboardData?.learning_patterns?.learning_style}
            insight="Your preferred learning approach"
          />
          <PatternCard
            icon={<Zap />}
            title="Pacing"
            value={dashboardData?.learning_patterns?.pacing}
            insight={`${dashboardData?.learning_patterns?.avg_time_per_question}s per question`}
          />
          <PatternCard
            icon={<Target />}
            title="Difficulty Preference"
            value={dashboardData?.learning_patterns?.difficulty_preference}
            insight="Your comfort zone level"
          />
        </div>
      </div>

      {/* Recommendations */}
      <div className="chart-card recommendations-card">
        <div className="chart-header">
          <h3>Personalized Recommendations</h3>
        </div>
        <div className="recommendations-list">
          {dashboardData?.recommendations?.map((rec, idx) => (
            <div key={idx} className="recommendation-item">
              <div className="rec-icon">
                <ChevronRight size={20} />
              </div>
              <div className="rec-content">
                <h4>{rec.title}</h4>
                <p>{rec.description}</p>
                {rec.action && (
                  <button className="btn-action">{rec.action}</button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="quick-actions">
        <button onClick={() => navigate('/practice')} className="action-btn">
          <Zap size={20} />
          <span>Start Practice Session</span>
        </button>
        <button onClick={() => navigate('/learning-insights')} className="action-btn secondary">
          <Brain size={20} />
          <span>View Detailed Insights</span>
        </button>
        <button onClick={() => navigate('/goal-setting')} className="action-btn secondary">
          <Target size={20} />
          <span>Set Learning Goals</span>
        </button>
      </div>
    </div>
  );
}

// Helper Components

function MetricCard({ icon, label, value, subtitle, trend, color }) {
  return (
    <div className="metric-card">
      <div className="metric-icon" style={{ background: `${color}20`, color }}>
        {icon}
      </div>
      <div className="metric-content">
        <p className="metric-label">{label}</p>
        <h2 className="metric-value">{value}</h2>
        {subtitle && <p className="metric-subtitle">{subtitle}</p>}
        {trend && (
          <div className={`metric-trend ${trend > 0 ? 'positive' : 'negative'}`}>
            <TrendingUp size={16} />
            <span>{Math.abs(trend)}%</span>
          </div>
        )}
      </div>
    </div>
  );
}

function TopicMasteryItem({ topic }) {
  const getMasteryColor = (level) => {
    switch (level) {
      case 'mastered': return COLORS.success;
      case 'proficient': return COLORS.info;
      case 'learning': return COLORS.warning;
      default: return COLORS.danger;
    }
  };

  return (
    <div className="topic-item">
      <div className="topic-info">
        <h4>{topic.name}</h4>
        <p className="topic-stats">
          {topic.correct}/{topic.total} correct · {topic.accuracy}%
        </p>
      </div>
      <div className="topic-mastery">
        <div className="mastery-bar">
          <div
            className="mastery-fill"
            style={{
              width: `${topic.accuracy}%`,
              background: getMasteryColor(topic.mastery_level)
            }}
          />
        </div>
        <span className="mastery-label" style={{ color: getMasteryColor(topic.mastery_level) }}>
          {topic.mastery_level}
        </span>
      </div>
    </div>
  );
}

function PatternCard({ icon, title, value, insight }) {
  return (
    <div className="pattern-card">
      <div className="pattern-icon">{icon}</div>
      <h4>{title}</h4>
      <p className="pattern-value">{value}</p>
      <p className="pattern-insight">{insight}</p>
    </div>
  );
}
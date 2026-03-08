import { useLocation, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";
import { Trophy, TrendingUp, Target, BookOpen, AlertCircle, ExternalLink, Youtube, CheckCircle, Sparkles } from "lucide-react";
import { analyzeTest } from "../utils/analyzeTest";
import './testcomplete.css';

const COLORS = {
  excellent: "#22c55e",
  good: "#3b82f6",
  average: "#eab308",
  poor: "#ef4444"
};

const SECTION_COLORS = ["#8b5cf6", "#ec4899", "#3b82f6", "#10b981", "#f59e0b", "#ef4444"];

export default function TestComplete() {
  const navigate = useNavigate();
  const location = useLocation();
  
  const [mounted, setMounted] = useState(false);
  const [studyPlan, setStudyPlan] = useState(null);
  const [loadingPlan, setLoadingPlan] = useState(true);
  const [expandedDay, setExpandedDay] = useState(null);
  const [completedTasks, setCompletedTasks] = useState({});
  const [backendAvailable, setBackendAvailable] = useState(true);

  const { questions = [], answers = {} } = location.state || {};

  useEffect(() => {
    setMounted(true);
    if (questions.length > 0) {
      const report = analyzeTest(questions, answers);
      
      const diagnosticReport = {
        total: {
          correct: report.total.correct,
          attempted: report.total.attempted,
          accuracy: report.total.accuracy,
          total: questions.length
        },
        sections: report.sections,
        timestamp: new Date().toISOString(),
        answers: answers,
        questions: questions.map(q => ({
          id: q.id,
          section: q.section,
          userAnswer: answers[q.id],
          correctAnswer: q.answer,
          isCorrect: answers[q.id] === q.answer,
          question: q.question
        }))
      };

      localStorage.setItem('diagnosticReport', JSON.stringify(diagnosticReport));

      const dashboardData = {
        overall_accuracy: report.total.accuracy,
        total_questions: questions.length,
        correct_answers: report.total.correct,
        attempted: report.total.attempted,
        sections: report.sections,
        timestamp: new Date().toISOString()
      };

      localStorage.setItem('dashboardData', JSON.stringify(dashboardData));

      generateAIPoweredPlan();
    }
  }, [questions]);

  const generateAIPoweredPlan = async () => {
    setLoadingPlan(true);
    
    const report = analyzeTest(questions, answers);
    const weakTopics = Object.entries(report.sections)
      .filter(([_, data]) => data.accuracy < 60)
      .map(([topic]) => topic);

    try {
      // Try to connect to backend
      const response = await fetch('http://localhost:8000/ai-tutor/generate-plan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          student_id: 'student_001',
          weak_topics: weakTopics.length > 0 ? weakTopics : ['General Practice'],
          learning_style: report.learning_style || 'visual',
          target_weeks: 1
        })
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      const data = await response.json();
      const enhancedPlan = await enhanceWithResources(data.plan, weakTopics);
      setStudyPlan(enhancedPlan);
      localStorage.setItem('studyPlan', JSON.stringify(enhancedPlan));
      setBackendAvailable(true);
    } catch (error) {
      console.warn('Backend not available, using fallback plan:', error.message);
      setBackendAvailable(false);
      // Use fallback plan when backend is down
      const fallbackPlan = await generateFallbackPlan(weakTopics);
      setStudyPlan(fallbackPlan);
      localStorage.setItem('studyPlan', JSON.stringify(fallbackPlan));
    } finally {
      setLoadingPlan(false);
    }
  };

  const enhanceWithResources = async (plan, topics) => {
    const resourceMap = {
      'Aptitude': {
        youtube: [
          { title: 'Quantitative Aptitude Full Course', channel: 'Study IQ Education', url: 'https://youtube.com/watch?v=dQw4w9WgXcQ', duration: '45 min' },
          { title: 'Aptitude Made Easy', channel: 'Career Anna', url: 'https://youtube.com/playlist?list=aptitude', duration: '30 min' }
        ]
      },
      'Logical Reasoning': {
        youtube: [
          { title: 'Logical Reasoning Masterclass', channel: 'Unacademy', url: 'https://youtube.com/watch?v=logic', duration: '60 min' },
          { title: 'Pattern Recognition', channel: 'Gradeup', url: 'https://youtube.com/watch?v=patterns', duration: '40 min' }
        ]
      },
      'DSA': {
        youtube: [
          { title: 'DSA Complete Course', channel: 'Apna College', url: 'https://youtube.com/playlist?list=DSA', duration: '120 min' },
          { title: 'Arrays & Strings', channel: 'Striver', url: 'https://youtube.com/watch?v=arrays', duration: '90 min' }
        ]
      },
      'OS': {
        youtube: [
          { title: 'Operating Systems Full Course', channel: 'Gate Smashers', url: 'https://youtube.com/playlist?list=OS', duration: '90 min' },
          { title: 'Process Management', channel: 'Knowledge Gate', url: 'https://youtube.com/watch?v=process', duration: '45 min' }
        ]
      },
      'DBMS': {
        youtube: [
          { title: 'DBMS Complete Course', channel: 'Gate Smashers', url: 'https://youtube.com/playlist?list=DBMS', duration: '80 min' },
          { title: 'SQL Queries Practice', channel: 'Programming with Mosh', url: 'https://youtube.com/watch?v=sql', duration: '60 min' }
        ]
      },
      'CN': {
        youtube: [
          { title: 'Computer Networks', channel: 'Gate Smashers', url: 'https://youtube.com/playlist?list=CN', duration: '70 min' },
          { title: 'TCP/IP Protocol', channel: 'Neso Academy', url: 'https://youtube.com/watch?v=tcp', duration: '50 min' }
        ]
      }
    };

    if (plan && plan.weeks && plan.weeks[0]) {
      plan.weeks[0].daily_breakdown = plan.weeks[0].daily_breakdown.map(day => ({
        ...day,
        resources: topics.map(topic => resourceMap[topic] || resourceMap['DSA']).reduce((acc, curr) => {
          acc.youtube = [...(acc.youtube || []), ...(curr.youtube || [])];
          return acc;
        }, { youtube: [] })
      }));
    }

    return plan;
  };

  const generateFallbackPlan = async (weakTopics) => {
    const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
    
    const topicFocus = weakTopics.length > 0 ? weakTopics : ['DSA', 'Aptitude', 'DBMS'];
    
    return {
      plan_summary: `One-week intensive study plan focusing on ${topicFocus.slice(0, 2).join(' and ')}. This plan adapts to your ${analyzeTest(questions, answers).total.accuracy.toFixed(0)}% accuracy level.`,
      weeks: [{
        week: 1,
        focus_topic: topicFocus[0] || 'DSA',
        daily_breakdown: days.map((day, idx) => ({
          day,
          tasks: [
            `📖 Review ${topicFocus[idx % topicFocus.length]} fundamentals`,
            '🎥 Watch 2-3 tutorial videos',
            '💻 Practice 10-15 problems',
            '📝 Take a short quiz',
            '✍️ Document mistakes and learnings'
          ],
          resources: {
            youtube: [
              {
                title: `${topicFocus[idx % topicFocus.length]} - Day ${idx + 1} Tutorial`,
                channel: 'GeeksforGeeks',
                url: `https://www.youtube.com/results?search_query=${topicFocus[idx % topicFocus.length]}+tutorial`,
                duration: '45 min'
              },
              {
                title: `${topicFocus[idx % topicFocus.length]} Practice Problems`,
                channel: 'Code with Harry',
                url: `https://www.youtube.com/results?search_query=${topicFocus[idx % topicFocus.length]}+practice`,
                duration: '30 min'
              }
            ]
          }
        }))
      }]
    };
  };

  const toggleTask = (dayIndex, taskIndex) => {
    const key = `${dayIndex}-${taskIndex}`;
    setCompletedTasks(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  const openResource = (url) => {
    window.open(url, '_blank');
  };

  if (!questions.length) {
    return (
      <div className="no-data-container">
        <div className="no-data-content">
          <AlertCircle size={64} className="error-icon" />
          <h2>No Test Data Found</h2>
          <p>Please complete the diagnostic test first</p>
          <button
            onClick={() => navigate("/diagnostic")}
            className="btn-primary"
          >
            Start Diagnostic Test
          </button>
        </div>
      </div>
    );
  }

  const report = analyzeTest(questions, answers);

  const sectionData = Object.entries(report.sections).map(([name, data]) => ({
    name,
    accuracy: parseFloat(data.accuracy.toFixed(1)),
    correct: data.correct,
    total: data.total
  }));

  const performanceData = [
    { name: "Correct", value: report.total.correct, color: COLORS.excellent },
    { name: "Incorrect", value: report.total.attempted - report.total.correct, color: COLORS.poor },
    { name: "Unanswered", value: questions.length - report.total.attempted, color: "#6b7280" }
  ];

  const performance = 
    report.total.accuracy >= 80 ? { label: "Excellent", color: COLORS.excellent } :
    report.total.accuracy >= 60 ? { label: "Good", color: COLORS.good } :
    report.total.accuracy >= 40 ? { label: "Average", color: COLORS.average } :
    { label: "Needs Work", color: COLORS.poor };

  return (
    <div className={`test-complete-container ${mounted ? 'mounted' : ''}`}>
      <div className="content-wrapper">
        <div className="header-section">
          <div className="trophy-icon">
            <Trophy size={40} color="white" />
          </div>
          <h1 className="main-title">Test Complete!</h1>
          <p className="subtitle">
            {backendAvailable 
              ? "AI-powered personalized study plan generated" 
              : "Personalized study plan ready (offline mode)"}
          </p>
        </div>

        <div className="stats-grid">
          <StatCard
            icon={<Target size={24} />}
            label="Overall Accuracy"
            value={`${report.total.accuracy.toFixed(1)}%`}
            color={performance.color}
            subtitle={performance.label}
          />
          <StatCard
            icon={<BookOpen size={24} />}
            label="Questions Attempted"
            value={`${report.total.attempted}/${questions.length}`}
            color="#3b82f6"
            subtitle={`${((report.total.attempted/questions.length)*100).toFixed(0)}% completion`}
          />
          <StatCard
            icon={<TrendingUp size={24} />}
            label="Correct Answers"
            value={report.total.correct}
            color="#22c55e"
            subtitle={`${report.total.correct} out of ${report.total.attempted}`}
          />
        </div>

        <div className="charts-grid">
          <ChartCard title="Section Performance">
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={sectionData}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                <XAxis dataKey="name" tick={{ fill: 'rgba(255,255,255,0.7)', fontSize: 11 }} />
                <YAxis tick={{ fill: 'rgba(255,255,255,0.7)', fontSize: 11 }} domain={[0, 100]} />
                <Tooltip
                  contentStyle={{ background: "#1e1432", border: "1px solid #a855f7", borderRadius: 8 }}
                />
                <Bar dataKey="accuracy" radius={[8, 8, 0, 0]}>
                  {sectionData.map((entry, index) => (
                    <Cell key={index} fill={SECTION_COLORS[index % SECTION_COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </ChartCard>

          <ChartCard title="Answer Distribution">
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie
                  data={performanceData}
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  dataKey="value"
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                >
                  {performanceData.map((entry, index) => (
                    <Cell key={index} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{ background: "#1e1432", border: "1px solid #a855f7", borderRadius: 8 }}
                />
              </PieChart>
            </ResponsiveContainer>
          </ChartCard>
        </div>

        <div className="study-plan-container">
          <div className="plan-header">
            <Sparkles size={28} color="#a855f7" />
            <div className="plan-header-content">
              <h2 className="plan-title">Personalized Study Plan</h2>
              <p className="plan-description">
                {backendAvailable 
                  ? "AI-generated based on your performance" 
                  : "Generated based on your test performance"}
              </p>
            </div>
          </div>

          {loadingPlan ? (
            <div className="loading-container">
              <div className="spinner" />
              <p className="loading-text">
                🤖 Analyzing your performance and creating your study plan...
              </p>
            </div>
          ) : studyPlan && studyPlan.weeks[0] ? (
            <div>
              <div className="plan-summary">
                <p>{studyPlan.plan_summary}</p>
              </div>

              <div className="days-grid">
                {studyPlan.weeks[0].daily_breakdown.map((day, dayIdx) => (
                  <DayCard
                    key={dayIdx}
                    day={day}
                    dayIdx={dayIdx}
                    expanded={expandedDay === dayIdx}
                    onToggle={() => setExpandedDay(expandedDay === dayIdx ? null : dayIdx)}
                    completedTasks={completedTasks}
                    onToggleTask={(taskIdx) => toggleTask(dayIdx, taskIdx)}
                    onOpenResource={openResource}
                  />
                ))}
              </div>
            </div>
          ) : (
            <p style={{ color: "rgba(255,255,255,0.6)", textAlign: "center" }}>
              Unable to generate study plan. Please try again.
            </p>
          )}
        </div>

        <div className="action-buttons">
          <button
            onClick={() => navigate("/dashboard")}
            className="btn-primary"
          >
            Go to Dashboard →
          </button>
          <button
            onClick={() => navigate("/ai-tutor")}
            className="btn-secondary"
          >
            Chat with AI Tutor
          </button>
        </div>
      </div>
    </div>
  );
}

function DayCard({ day, dayIdx, expanded, onToggle, completedTasks, onToggleTask, onOpenResource }) {
  return (
    <div className="day-card">
      <div
        onClick={onToggle}
        className={`day-header ${expanded ? 'expanded' : ''}`}
      >
        <div className="day-info">
          <div className="day-number">{dayIdx + 1}</div>
          <div className="day-details">
            <h3>{day.day}</h3>
          </div>
        </div>
        <div className={`expand-arrow ${expanded ? 'expanded' : ''}`}>
          ▼
        </div>
      </div>

      {expanded && (
        <div className="day-content">
          <div className="tasks-section">
            <h4 className="section-title">📋 Tasks</h4>
            <div className="tasks-list">
              {day.tasks.map((task, taskIdx) => {
                const isCompleted = completedTasks[`${dayIdx}-${taskIdx}`];
                return (
                  <div
                    key={taskIdx}
                    onClick={() => onToggleTask(taskIdx)}
                    className={`task-item ${isCompleted ? 'completed' : ''}`}
                  >
                    <div className={`task-checkbox ${isCompleted ? 'completed' : ''}`}>
                      {isCompleted && <CheckCircle size={14} color="white" />}
                    </div>
                    <span className={`task-text ${isCompleted ? 'completed' : ''}`}>
                      {task}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {day.resources?.youtube?.length > 0 && (
            <div className="resources-section">
              <h4 className="section-title">🎥 Video Tutorials</h4>
              <div className="resources-grid">
                {day.resources.youtube.slice(0, 3).map((video, idx) => (
                  <div
                    key={idx}
                    onClick={() => onOpenResource(video.url)}
                    className="resource-card resource-card-youtube"
                  >
                    <Youtube size={20} className="resource-icon" />
                    <div className="resource-info">
                      <div className="resource-title">{video.title}</div>
                      <div className="resource-meta">
                        {video.channel} • {video.duration}
                      </div>
                    </div>
                    <ExternalLink size={16} />
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function StatCard({ icon, label, value, color, subtitle }) {
  return (
    <div className="stat-card">
      <div className="stat-icon" style={{ background: `${color}20`, color }}>
        {icon}
      </div>
      <div className="stat-content">
        <div className="stat-label">{label}</div>
        <div className="stat-value">{value}</div>
        <div className="stat-subtitle" style={{ color }}>{subtitle}</div>
      </div>
    </div>
  );
}

function ChartCard({ title, children }) {
  return (
    <div className="chart-card">
      <h3 className="chart-title">{title}</h3>
      {children}
    </div>
  );
}
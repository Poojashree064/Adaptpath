import React, { useState, useEffect } from 'react';
import { 
  Target, BookOpen, TrendingUp, Award, Brain, Zap, MessageSquare, 
  ArrowRight, Calendar, Clock, TrendingDown, Sparkles, ChevronRight,
  CheckCircle, AlertCircle, Play, BarChart3, Users, Trophy, Star,
  Activity, BookMarked, Lightbulb, Eye, ListChecks, XCircle, ChevronDown, 
  ChevronUp, Home, RefreshCw, ArrowLeft
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { 
  BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, 
  Tooltip, ResponsiveContainer, Cell, RadarChart, Radar, PolarGrid, 
  PolarAngleAxis, PolarRadiusAxis, Legend
} from 'recharts';
import { generateAIFeedback, getStudyTimeRecommendation } from '../utils/aiAnalytics';
import './EnhancedDashboard.css';

const EnhancedDashboardWithDetails = () => {
  const navigate = useNavigate();
  const [diagnosticReport, setDiagnosticReport] = useState(null);
  const [dashboardData, setDashboardData] = useState(null);
  const [activeTab, setActiveTab] = useState('overview');
  const [expandedSection, setExpandedSection] = useState(null);
  const [mounted, setMounted] = useState(false);
  const [aiFeedback, setAiFeedback] = useState([]);
  const [loadingFeedback, setLoadingFeedback] = useState(true);
  const [studyRecommendation, setStudyRecommendation] = useState(null);

  // Resource links for each topic
  const getTopicResourceLink = (topicName) => {
    const resourceMap = {
      'Logical Reasoning': 'https://prepinsta.com/learn-aptitude/',
      'Aptitude': 'https://prepinsta.com/learn-aptitude/',
      'DSA': 'https://www.scribd.com/document/911292405/DSA-Placement-Preparation-Notes',
      'Algorithms': 'https://www.scribd.com/document/911292405/DSA-Placement-Preparation-Notes',
      'OS': 'https://www.codehelp.in/dashboard/core-subjects/operating-system-placement-sheet',
      'DBMS': 'https://www.interviewbit.com/dbms-interview-questions/',
      'SQL': 'https://www.scribd.com/document/592583099/SQL-Placement-Preparation',
      'CN': 'https://www.geeksforgeeks.org/computer-networks/computer-network-tutorials/'
    };
    
    // Check for exact match or partial match
    for (let [key, link] of Object.entries(resourceMap)) {
      if (topicName.includes(key) || key.includes(topicName)) {
        return link;
      }
    }
    return null;
  };

  // Get hierarchical button text based on topic
  const getResourceButtonText = (topicName) => {
    if (topicName.includes('Logical') || topicName.includes('Aptitude')) {
      return '📊 Aptitude Resources';
    } else if (topicName.includes('DSA') || topicName.includes('Algorithms')) {
      return '💻 DSA Notes & Practice';
    } else if (topicName.includes('OS')) {
      return '⚙️ OS Placement Sheet';
    } else if (topicName.includes('DBMS')) {
      return '🗄️ DBMS → Interview Questions';
    } else if (topicName.includes('SQL')) {
      return '🗄️ SQL → Excel SQL Concepts';
    } else if (topicName.includes('CN')) {
      return '🌐 CN Tutorials';
    }
    return '📚 Learn More';
  };

  // Check if topic should be displayed (filter out Programming/Coding/Logical Reasoning)
  const shouldDisplayTopic = (topicName) => {
    const excludedKeywords = ['Programming', 'Coding', 'Algorithms', 'Logical Reasoning'];
    return !excludedKeywords.some(keyword => topicName.includes(keyword));
  };

  const tabs = [
    { id: 'overview', label: 'Overview', icon: <BarChart3 size={18} /> },
    { id: 'detailed-results', label: 'Detailed Results', icon: <ListChecks size={18} /> },
    { id: 'ai-insights', label: 'AI Insights', icon: <Brain size={18} /> },
    { id: 'progress', label: 'Progress', icon: <TrendingUp size={18} /> }
  ];

  useEffect(() => {
    setMounted(true);
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    const storedReport = localStorage.getItem('diagnosticReport');
    
    if (storedReport) {
      const report = JSON.parse(storedReport);
      setDiagnosticReport(report);
      
      const weakAreas = [];
      const strongAreas = [];
      
      Object.entries(report.sections || {}).forEach(([section, data]) => {
        if (data.accuracy < 60) {
          weakAreas.push(section);
        } else if (data.accuracy >= 75) {
          strongAreas.push(section);
        }
      });

      // Process sections to calculate all required metrics
      const processedSections = {};
      Object.entries(report.sections || {}).forEach(([section, data]) => {
        // Calculate incorrect and skipped from total and correct
        const correct = data.correct || 0;
        const total = data.total || 0;
        const attempted = data.attempted || correct; // If not provided, assume attempted = correct
        const incorrect = attempted - correct; // Incorrect = attempted - correct
        const skipped = total - attempted; // Skipped = total - attempted
        
        processedSections[section] = {
          ...data,
          correct: correct,
          total: total,
          attempted: attempted,
          incorrect: incorrect,
          skipped: skipped,
          accuracy: data.accuracy || 0
        };
      });

      // Calculate real streak based on test completion dates
      const calculateStreak = () => {
        const streakData = localStorage.getItem('learningStreak');
        const today = new Date().toDateString();
        
        if (!streakData) {
          // First time - start streak at Day 1
          const newStreak = {
            currentStreak: 1,
            lastActiveDate: today,
            startDate: today
          };
          localStorage.setItem('learningStreak', JSON.stringify(newStreak));
          return 1;
        }
        
        const streak = JSON.parse(streakData);
        const lastActive = new Date(streak.lastActiveDate);
        const todayDate = new Date(today);
        const diffDays = Math.floor((todayDate - lastActive) / (1000 * 60 * 60 * 24));
        
        if (diffDays === 0) {
          // Same day - keep current streak
          return streak.currentStreak;
        } else if (diffDays === 1) {
          // Next day - increment streak
          const newStreak = {
            currentStreak: streak.currentStreak + 1,
            lastActiveDate: today,
            startDate: streak.startDate
          };
          localStorage.setItem('learningStreak', JSON.stringify(newStreak));
          return newStreak.currentStreak;
        } else {
          // Streak broken - reset to Day 1
          const newStreak = {
            currentStreak: 1,
            lastActiveDate: today,
            startDate: today
          };
          localStorage.setItem('learningStreak', JSON.stringify(newStreak));
          return 1;
        }
      };

      const dashData = {
        overall_accuracy: report.total?.accuracy || 0,
        total_questions: report.total?.total || 0,
        correct_answers: report.total?.correct || 0,
        attempted: report.total?.attempted || 0,
        weak_areas: weakAreas,
        strong_areas: strongAreas,
        learning_speed: 'Moderate',
        best_study_time: 'Evening',
        learning_style: 'Visual',
        streak_days: calculateStreak(),
        improvement_rate: 40,
        sections: processedSections
      };

      setDashboardData(dashData);

      // Generate AI feedback
      setLoadingFeedback(true);
      try {
        const feedback = await generateAIFeedback(report);
        setAiFeedback(feedback);
        
        const recommendation = getStudyTimeRecommendation(report);
        setStudyRecommendation(recommendation);
      } catch (error) {
        console.error('Failed to generate AI feedback:', error);
      } finally {
        setLoadingFeedback(false);
      }
    } else {
      setDashboardData({
        overall_accuracy: 0,
        total_questions: 104,
        correct_answers: 0,
        attempted: 0,
        weak_areas: [],
        strong_areas: [],
        learning_speed: 'Not assessed',
        best_study_time: 'Not assessed',
        learning_style: 'Not assessed',
        streak_days: 0,
        improvement_rate: 0,
        sections: {}
      });
      setLoadingFeedback(false);
    }
  };

  const refreshAIFeedback = async () => {
    if (!diagnosticReport) return;
    
    setLoadingFeedback(true);
    try {
      const feedback = await generateAIFeedback(diagnosticReport);
      setAiFeedback(feedback);
    } catch (error) {
      console.error('Failed to refresh AI feedback:', error);
    } finally {
      setLoadingFeedback(false);
    }
  };

  const getSectionIcon = (accuracy) => {
    if (accuracy >= 75) return <CheckCircle size={20} color="#22c55e" />;
    if (accuracy >= 60) return <AlertCircle size={20} color="#f59e0b" />;
    return <XCircle size={20} color="#ef4444" />;
  };

  const getSectionColor = (accuracy) => {
    if (accuracy >= 75) return '#22c55e';
    if (accuracy >= 60) return '#f59e0b';
    return '#ef4444';
  };

  if (!dashboardData) {
    return (
      <div style={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #1a1625 0%, #2d1b3d 100%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: 'white'
      }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{
            width: '48px',
            height: '48px',
            border: '4px solid rgba(139, 92, 246, 0.3)',
            borderTopColor: '#8b5cf6',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite',
            margin: '0 auto 20px'
          }} />
          <p>Loading dashboard...</p>
        </div>
      </div>
    );
  }

  // Generate performance trend data
  const performanceTrendData = Object.entries(dashboardData.sections).map(([name, data]) => ({
    name: name.length > 10 ? name.substring(0, 10) + '...' : name,
    fullName: name,
    accuracy: parseFloat(data.accuracy.toFixed(1)),
    questions: data.total
  }));

  // Generate radar chart data for skills assessment
  const radarData = Object.entries(dashboardData.sections).slice(0, 6).map(([name, data]) => ({
    subject: name.length > 8 ? name.substring(0, 8) : name,
    score: parseFloat(data.accuracy.toFixed(1)),
    fullMark: 100
  }));

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #1a1625 0%, #2d1b3d 100%)',
      padding: '2rem',
      color: 'white',
      opacity: mounted ? 1 : 0,
      transition: 'opacity 0.5s'
    }}>
      <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
        {/* Header */}
        <div style={{ marginBottom: '2rem' }}>
          {/* Back Button */}
          <div style={{ marginBottom: '1rem' }}>
            <button
              onClick={() => navigate(-1)}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: '44px',
                height: '44px',
                background: 'rgba(255, 255, 255, 0.05)',
                border: '1px solid rgba(255, 255, 255, 0.15)',
                borderRadius: '12px',
                color: 'white',
                cursor: 'pointer',
                transition: 'all 0.3s ease'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)';
                e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.25)';
                e.currentTarget.style.transform = 'scale(1.05)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)';
                e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.15)';
                e.currentTarget.style.transform = 'scale(1)';
              }}
              title="Go back"
            >
              <ArrowLeft size={20} strokeWidth={2} />
            </button>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem', flexWrap: 'wrap', gap: '1rem' }}>
            <div style={{ flex: 1 }}>
              <h1 style={{
                fontSize: '2.5rem',
                fontWeight: 800,
                background: 'linear-gradient(135deg, #a855f7 0%, #ec4899 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                marginBottom: '0.5rem'
              }}>
                Your Adaptive Dashboard
              </h1>
              <p style={{ fontSize: '1rem', color: '#9ca3af' }}>
                AI-powered learning tailored just for you
              </p>
            </div>
            
            <div style={{
              background: 'linear-gradient(135deg, #f59e0b 0%, #ef4444 100%)',
              borderRadius: '16px',
              padding: '1rem 1.5rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.75rem',
              boxShadow: '0 10px 30px rgba(245, 158, 11, 0.3)'
            }}>
              <Zap size={28} />
              <div>
                <div style={{ fontSize: '1.75rem', fontWeight: 800 }}>Day {dashboardData.streak_days}</div>
                <div style={{ fontSize: '0.75rem', opacity: 0.9 }}>Learning Streak 🔥</div>
              </div>
            </div>
          </div>

          {/* Tabs */}
          <div style={{
            display: 'flex',
            gap: '0.5rem',
            background: 'rgba(255,255,255,0.05)',
            padding: '0.5rem',
            borderRadius: '12px',
            marginTop: '1.5rem',
            flexWrap: 'wrap'
          }}>
            {tabs.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                style={{
                  flex: 1,
                  minWidth: '140px',
                  padding: '0.75rem 1rem',
                  background: activeTab === tab.id ? 'linear-gradient(135deg, #8b5cf6 0%, #ec4899 100%)' : 'transparent',
                  border: 'none',
                  borderRadius: '8px',
                  color: 'white',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.5rem',
                  fontWeight: 600,
                  transition: 'all 0.3s',
                  fontSize: '0.9rem'
                }}
              >
                {tab.icon}
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <>
            {/* Stats Grid */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
              gap: '1rem',
              marginBottom: '2rem'
            }}>
              <StatCard 
                icon={<Target size={20} />} 
                label="Overall Accuracy" 
                value={`${dashboardData.overall_accuracy.toFixed(1)}%`} 
                color="#ef4444" 
                trend={dashboardData.improvement_rate > 0 ? `+${dashboardData.improvement_rate}%` : null}
              />
              <StatCard 
                icon={<BookOpen size={20} />} 
                label="Questions Done" 
                value={dashboardData.attempted} 
                color="#3b82f6" 
                trend={`${dashboardData.attempted}/${dashboardData.total_questions}`}
              />
              <StatCard 
                icon={<TrendingUp size={20} />} 
                label="Correct Answers" 
                value={dashboardData.correct_answers} 
                color="#10b981" 
                trend={dashboardData.attempted > 0 ? `${((dashboardData.correct_answers/dashboardData.attempted)*100).toFixed(0)}%` : '0%'}
              />
              <StatCard 
                icon={<Award size={20} />} 
                label="Topics Mastered" 
                value={dashboardData.strong_areas.length} 
                color="#f59e0b" 
                trend={`${dashboardData.strong_areas.length} strong`}
              />
            </div>

            {/* Test Status Banner */}
            {diagnosticReport ? (
              <div style={{
                background: 'linear-gradient(135deg, rgba(139, 92, 246, 0.2) 0%, rgba(236, 72, 153, 0.2) 100%)',
                border: '2px solid rgba(139, 92, 246, 0.3)',
                borderRadius: '16px',
                padding: '1.5rem',
                marginBottom: '2rem',
                display: 'flex',
                gap: '1rem',
                alignItems: 'center',
                flexWrap: 'wrap'
              }}>
                <div style={{
                  width: '48px',
                  height: '48px',
                  background: 'linear-gradient(135deg, #8b5cf6 0%, #ec4899 100%)',
                  borderRadius: '12px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0
                }}>
                  <Brain size={24} />
                </div>
                <div style={{ flex: 1, minWidth: '250px' }}>
                  <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '0.25rem' }}>
                    AI Analysis Complete ✨
                  </h3>
                  <p style={{ fontSize: '0.875rem', color: 'rgba(255,255,255,0.8)', margin: 0 }}>
                    You scored <strong style={{ color: '#10b981' }}>{dashboardData.overall_accuracy.toFixed(1)}%</strong> ({dashboardData.correct_answers}/{dashboardData.total_questions} correct). 
                    {dashboardData.weak_areas.length > 0 ? (
                      <> Focus areas: <strong>{dashboardData.weak_areas.slice(0, 2).join(', ')}</strong></>
                    ) : (
                      <> Great job! Keep it up! 🎉</>
                    )}
                  </p>
                </div>
                <button 
                  onClick={() => setActiveTab('detailed-results')}
                  style={{
                    padding: '0.75rem 1.5rem',
                    background: 'white',
                    color: '#8b5cf6',
                    border: 'none',
                    borderRadius: '8px',
                    fontWeight: 600,
                    cursor: 'pointer',
                    whiteSpace: 'nowrap'
                  }}
                >
                  View Details
                </button>
              </div>
            ) : (
              <div style={{
                background: 'rgba(59, 130, 246, 0.1)',
                border: '1px solid rgba(59, 130, 246, 0.3)',
                borderRadius: '16px',
                padding: '1.5rem',
                marginBottom: '2rem',
                textAlign: 'center'
              }}>
                <h3 style={{ fontSize: '1.1rem', marginBottom: '0.5rem' }}>👋 Welcome to AdaptPath!</h3>
                <p style={{ color: 'rgba(255,255,255,0.7)', marginBottom: '1rem' }}>
                  Take the diagnostic test to get your personalized learning path
                </p>
                <button
                  onClick={() => navigate('/diagnostic')}
                  style={{
                    padding: '0.75rem 1.5rem',
                    background: 'linear-gradient(135deg, #8b5cf6 0%, #ec4899 100%)',
                    color: 'white',
                    border: 'none',
                    borderRadius: '8px',
                    fontWeight: 600,
                    cursor: 'pointer'
                  }}
                >
                  Start Diagnostic Test →
                </button>
              </div>
            )}

            {/* Main Content Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '1.5rem', marginBottom: '2rem' }}>
              {/* Knowledge Gap Analyzer - LEFT SIDE */}
              <div style={{
                background: 'rgba(30, 20, 40, 0.7)',
                borderRadius: '16px',
                padding: '1.5rem',
                border: '1px solid rgba(139, 92, 246, 0.2)'
              }}>
                <h3 style={{ fontSize: '1.25rem', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <Lightbulb size={20} color="#a855f7" />
                  Knowledge Gap Analyzer
                </h3>
                
                {performanceTrendData.length > 0 ? (
                  <>
                    {/* Gap Analysis Summary Card */}
                    <div style={{
                      background: 'linear-gradient(135deg, rgba(139, 92, 246, 0.15) 0%, rgba(168, 85, 247, 0.05) 100%)',
                      border: '1px solid rgba(139, 92, 246, 0.3)',
                      borderRadius: '12px',
                      padding: '1.25rem',
                      marginBottom: '1.5rem'
                    }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                        <div>
                          <div style={{ fontSize: '0.85rem', color: 'rgba(255,255,255,0.6)', marginBottom: '0.25rem' }}>
                            Overall Gap Score
                          </div>
                          <div style={{ fontSize: '2rem', fontWeight: 700, color: '#a855f7' }}>
                            {(() => {
                              const avgAccuracy = performanceTrendData.reduce((sum, t) => sum + t.accuracy, 0) / performanceTrendData.length;
                              const gapScore = Math.max(0, 100 - avgAccuracy);
                              return gapScore.toFixed(0);
                            })()}%
                          </div>
                        </div>
                        <div style={{
                          width: '80px',
                          height: '80px',
                          borderRadius: '50%',
                          background: `conic-gradient(#a855f7 ${(() => {
                            const avgAccuracy = performanceTrendData.reduce((sum, t) => sum + t.accuracy, 0) / performanceTrendData.length;
                            return avgAccuracy;
                          })()}%, rgba(255,255,255,0.1) 0)`,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          position: 'relative'
                        }}>
                          <div style={{
                            width: '60px',
                            height: '60px',
                            borderRadius: '50%',
                            background: 'rgba(30, 20, 40, 0.9)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: '0.75rem',
                            fontWeight: 600,
                            color: '#a855f7'
                          }}>
                            {(() => {
                              const avgAccuracy = performanceTrendData.reduce((sum, t) => sum + t.accuracy, 0) / performanceTrendData.length;
                              return avgAccuracy.toFixed(0);
                            })()}%
                          </div>
                        </div>
                      </div>
                      <div style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.7)' }}>
                        {(() => {
                          const criticalGaps = performanceTrendData.filter(t => t.accuracy < 60 && shouldDisplayTopic(t.fullName)).length;
                          return criticalGaps > 0 
                            ? `⚠️ ${criticalGaps} critical knowledge gap${criticalGaps > 1 ? 's' : ''} identified`
                            : '✅ No critical gaps found - keep building!';
                        })()}
                      </div>
                    </div>

                    {/* Critical Gaps - Topics Below 60% */}
                    {performanceTrendData.filter(t => t.accuracy < 60 && shouldDisplayTopic(t.fullName)).length > 0 && (
                      <div style={{ marginBottom: '1.5rem' }}>
                        <div style={{ 
                          display: 'flex', 
                          alignItems: 'center', 
                          gap: '0.5rem',
                          marginBottom: '0.75rem'
                        }}>
                          <AlertCircle size={16} color="#ef4444" />
                          <h4 style={{ fontSize: '0.95rem', margin: 0, color: 'rgba(255,255,255,0.9)' }}>
                            Critical Knowledge Gaps
                          </h4>
                          <span style={{
                            background: 'rgba(239, 68, 68, 0.2)',
                            color: '#ef4444',
                            padding: '0.15rem 0.5rem',
                            borderRadius: '12px',
                            fontSize: '0.7rem',
                            fontWeight: 600
                          }}>
                            PRIORITY
                          </span>
                        </div>
                        
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                          {performanceTrendData
                            .filter(t => t.accuracy < 60 && shouldDisplayTopic(t.fullName))
                            .sort((a, b) => {
                              // Prioritize Aptitude at the top
                              const aIsAptitude = a.fullName.includes('Aptitude');
                              const bIsAptitude = b.fullName.includes('Aptitude');
                              
                              if (aIsAptitude && !bIsAptitude) return -1;
                              if (!aIsAptitude && bIsAptitude) return 1;
                              
                              // Otherwise sort by accuracy (lowest first)
                              return a.accuracy - b.accuracy;
                            })
                            .map((topic, index) => (
                            <div key={index} style={{
                              background: 'rgba(239, 68, 68, 0.08)',
                              border: '1px solid rgba(239, 68, 68, 0.3)',
                              borderRadius: '10px',
                              padding: '0.75rem',
                              transition: 'all 0.3s ease'
                            }}
                            onMouseEnter={(e) => {
                              e.currentTarget.style.background = 'rgba(239, 68, 68, 0.12)';
                              e.currentTarget.style.borderColor = 'rgba(239, 68, 68, 0.5)';
                            }}
                            onMouseLeave={(e) => {
                              e.currentTarget.style.background = 'rgba(239, 68, 68, 0.08)';
                              e.currentTarget.style.borderColor = 'rgba(239, 68, 68, 0.3)';
                            }}
                            >
                              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <div style={{ flex: 1 }}>
                                  <div style={{ fontWeight: 600, color: 'rgba(255,255,255,0.9)', fontSize: '0.9rem', marginBottom: '0.25rem' }}>
                                    {topic.fullName}
                                  </div>
                                  <div style={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.6)' }}>
                                    Gap: {(100 - topic.accuracy).toFixed(0)}% | Score: {topic.accuracy.toFixed(0)}%
                                  </div>
                                </div>
                                <div style={{
                                  background: 'rgba(239, 68, 68, 0.2)',
                                  color: '#ef4444',
                                  padding: '0.25rem 0.65rem',
                                  borderRadius: '6px',
                                  fontSize: '0.8rem',
                                  fontWeight: 700
                                }}>
                                  {topic.accuracy.toFixed(0)}%
                                </div>
                              </div>

                              {/* Resource Link */}
                              {(() => {
                                const resourceLink = getTopicResourceLink(topic.fullName);
                                return resourceLink ? (
                                  <a 
                                    href={resourceLink}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    style={{
                                      display: 'flex',
                                      alignItems: 'center',
                                      gap: '0.5rem',
                                      background: 'rgba(139, 92, 246, 0.15)',
                                      border: '1px solid rgba(139, 92, 246, 0.3)',
                                      borderRadius: '6px',
                                      padding: '0.5rem 0.75rem',
                                      marginTop: '0.5rem',
                                      textDecoration: 'none',
                                      fontSize: '0.75rem',
                                      color: '#a855f7',
                                      fontWeight: 600,
                                      transition: 'all 0.3s ease'
                                    }}
                                    onMouseEnter={(e) => {
                                      e.currentTarget.style.background = 'rgba(139, 92, 246, 0.25)';
                                      e.currentTarget.style.borderColor = 'rgba(139, 92, 246, 0.5)';
                                    }}
                                    onMouseLeave={(e) => {
                                      e.currentTarget.style.background = 'rgba(139, 92, 246, 0.15)';
                                      e.currentTarget.style.borderColor = 'rgba(139, 92, 246, 0.3)';
                                    }}
                                  >
                                    {getResourceButtonText(topic.fullName)}
                                    <ArrowRight size={12} style={{ marginLeft: 'auto' }} />
                                  </a>
                                ) : null;
                              })()}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Improvement Opportunities - Topics 60-75% */}
                    {performanceTrendData.filter(t => t.accuracy >= 60 && t.accuracy < 75 && shouldDisplayTopic(t.fullName)).length > 0 && (
                      <div style={{ marginBottom: '1.5rem' }}>
                        <div style={{ 
                          display: 'flex', 
                          alignItems: 'center', 
                          gap: '0.5rem',
                          marginBottom: '0.75rem'
                        }}>
                          <TrendingUp size={16} color="#f59e0b" />
                          <h4 style={{ fontSize: '0.95rem', margin: 0, color: 'rgba(255,255,255,0.9)' }}>
                            Improvement Opportunities
                          </h4>
                        </div>
                        
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '0.75rem' }}>
                          {performanceTrendData
                            .filter(t => t.accuracy >= 60 && t.accuracy < 75 && shouldDisplayTopic(t.fullName))
                            .sort((a, b) => {
                              // Prioritize Aptitude at the top
                              const aIsAptitude = a.fullName.includes('Aptitude');
                              const bIsAptitude = b.fullName.includes('Aptitude');
                              
                              if (aIsAptitude && !bIsAptitude) return -1;
                              if (!aIsAptitude && bIsAptitude) return 1;
                              
                              // Otherwise maintain original order
                              return 0;
                            })
                            .map((topic, index) => (
                            <div key={index} style={{
                              background: 'rgba(245, 158, 11, 0.08)',
                              border: '1px solid rgba(245, 158, 11, 0.3)',
                              borderRadius: '10px',
                              padding: '0.875rem',
                              transition: 'all 0.3s ease',
                              cursor: 'pointer'
                            }}
                            onMouseEnter={(e) => {
                              e.currentTarget.style.transform = 'translateY(-2px)';
                              e.currentTarget.style.boxShadow = '0 4px 12px rgba(245, 158, 11, 0.2)';
                            }}
                            onMouseLeave={(e) => {
                              e.currentTarget.style.transform = 'translateY(0)';
                              e.currentTarget.style.boxShadow = 'none';
                            }}
                            >
                              <div style={{ fontWeight: 600, fontSize: '0.85rem', color: 'rgba(255,255,255,0.9)', marginBottom: '0.5rem' }}>
                                {topic.fullName}
                              </div>
                              <div style={{ fontSize: '1.25rem', fontWeight: 700, color: '#f59e0b', marginBottom: '0.5rem' }}>
                                {topic.accuracy.toFixed(0)}%
                              </div>
                              <div style={{
                                fontSize: '0.7rem',
                                color: 'rgba(255,255,255,0.6)',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '0.25rem',
                                marginBottom: '0.5rem'
                              }}>
                                <ArrowRight size={12} />
                                {(75 - topic.accuracy).toFixed(0)}% to mastery
                              </div>
                              
                              {/* Resource Link */}
                              {(() => {
                                const resourceLink = getTopicResourceLink(topic.fullName);
                                return resourceLink ? (
                                  <a 
                                    href={resourceLink}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    style={{
                                      display: 'inline-flex',
                                      alignItems: 'center',
                                      gap: '0.25rem',
                                      fontSize: '0.7rem',
                                      color: '#a855f7',
                                      textDecoration: 'none',
                                      fontWeight: 600,
                                      marginTop: '0.25rem'
                                    }}
                                    onClick={(e) => e.stopPropagation()}
                                  >
                                    {getResourceButtonText(topic.fullName).split(' ').slice(1).join(' ')}
                                    <ArrowRight size={10} />
                                  </a>
                                ) : null;
                              })()}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Strong Foundation - Topics Above 75% */}
                    {performanceTrendData.filter(t => t.accuracy >= 75 && shouldDisplayTopic(t.fullName)).length > 0 && (
                      <div>
                        <div style={{ 
                          display: 'flex', 
                          alignItems: 'center', 
                          gap: '0.5rem',
                          marginBottom: '0.75rem'
                        }}>
                          <CheckCircle size={16} color="#22c55e" />
                          <h4 style={{ fontSize: '0.95rem', margin: 0, color: 'rgba(255,255,255,0.9)' }}>
                            Strong Foundation
                          </h4>
                        </div>
                        
                        <div style={{
                          background: 'rgba(34, 197, 94, 0.08)',
                          border: '1px solid rgba(34, 197, 94, 0.3)',
                          borderRadius: '10px',
                          padding: '1rem'
                        }}>
                          <div style={{ 
                            display: 'flex', 
                            flexWrap: 'wrap', 
                            gap: '0.5rem',
                            marginBottom: '0.75rem'
                          }}>
                            {performanceTrendData
                              .filter(t => t.accuracy >= 75 && shouldDisplayTopic(t.fullName))
                              .map((topic, index) => (
                              <div key={index} style={{
                                background: 'rgba(34, 197, 94, 0.2)',
                                color: '#22c55e',
                                padding: '0.4rem 0.75rem',
                                borderRadius: '8px',
                                fontSize: '0.75rem',
                                fontWeight: 600,
                                display: 'flex',
                                alignItems: 'center',
                                gap: '0.25rem'
                              }}>
                                ✓ {topic.fullName} ({topic.accuracy.toFixed(0)}%)
                              </div>
                            ))}
                          </div>
                          <div style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.7)' }}>
                            💪 Keep practicing these topics to maintain mastery
                          </div>
                        </div>
                      </div>
                    )}
                  </>
                ) : (
                  <div style={{ textAlign: 'center', padding: '3rem', color: 'rgba(255,255,255,0.5)' }}>
                    <Lightbulb size={48} style={{ margin: '0 auto 1rem', opacity: 0.3 }} />
                    <p>Complete the diagnostic test to identify knowledge gaps</p>
                  </div>
                )}
              </div>

              {/* AI Feedback - RIGHT SIDE */}
              <div style={{
                background: 'rgba(30, 20, 40, 0.7)',
                borderRadius: '16px',
                padding: '1.5rem',
                border: '1px solid rgba(139, 92, 246, 0.2)',
                display: 'flex',
                flexDirection: 'column'
              }}>
                <div style={{ 
                  display: 'flex', 
                  justifyContent: 'space-between', 
                  alignItems: 'center',
                  marginBottom: '1.5rem'
                }}>
                  <h3 style={{ fontSize: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem', margin: 0 }}>
                    <MessageSquare size={20} color="#a855f7" />
                    AI Feedback
                  </h3>
                  <button
                    onClick={refreshAIFeedback}
                    disabled={loadingFeedback}
                    style={{
                      padding: '0.5rem',
                      background: 'rgba(139, 92, 246, 0.2)',
                      border: '1px solid rgba(139, 92, 246, 0.3)',
                      borderRadius: '8px',
                      color: '#a855f7',
                      cursor: loadingFeedback ? 'not-allowed' : 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      opacity: loadingFeedback ? 0.5 : 1
                    }}
                    title="Refresh AI Feedback"
                  >
                    <RefreshCw size={16} style={{ 
                      animation: loadingFeedback ? 'spin 1s linear infinite' : 'none' 
                    }} />
                  </button>
                </div>
                
                <div style={{ 
                  flex: 1, 
                  display: 'flex', 
                  flexDirection: 'column', 
                  gap: '0.75rem'
                }}>
                  {loadingFeedback ? (
                    <div style={{ textAlign: 'center', padding: '2rem' }}>
                      <div style={{
                        width: '32px',
                        height: '32px',
                        border: '3px solid rgba(139, 92, 246, 0.3)',
                        borderTopColor: '#a855f7',
                        borderRadius: '50%',
                        animation: 'spin 1s linear infinite',
                        margin: '0 auto 1rem'
                      }} />
                      <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.875rem' }}>
                        Analyzing your performance...
                      </p>
                    </div>
                  ) : aiFeedback.length > 0 ? (
                    <>
                      {aiFeedback.map((feedback, idx) => (
                        <FeedbackCard key={idx} feedback={feedback} />
                      ))}
                      
                      {/* Study Recommendation Card */}
                      {studyRecommendation && (
                        <div style={{
                          marginTop: '1rem',
                          padding: '1rem',
                          background: 'rgba(59, 130, 246, 0.1)',
                          border: '1px solid rgba(59, 130, 246, 0.3)',
                          borderRadius: '10px'
                        }}>
                          <h4 style={{ 
                            fontSize: '0.9rem', 
                            marginBottom: '0.5rem',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.5rem'
                          }}>
                            <Clock size={16} color="#3b82f6" />
                            Study Recommendation
                          </h4>
                          <p style={{ 
                            fontSize: '0.85rem', 
                            color: 'rgba(255,255,255,0.8)',
                            margin: 0,
                            lineHeight: 1.5
                          }}>
                            {studyRecommendation}
                          </p>
                        </div>
                      )}
                    </>
                  ) : (
                    <div style={{ textAlign: 'center', padding: '2rem', color: 'rgba(255,255,255,0.5)' }}>
                      <MessageSquare size={48} style={{ margin: '0 auto 1rem', opacity: 0.3 }} />
                      <p>Complete the diagnostic test to receive AI-powered feedback</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </>
        )}

        {/* Detailed Results Tab */}
        {activeTab === 'detailed-results' && (
          <div style={{
            background: 'rgba(30, 20, 40, 0.7)',
            borderRadius: '16px',
            padding: '1.5rem',
            border: '1px solid rgba(139, 92, 246, 0.2)'
          }}>
            <h3 style={{ fontSize: '1.25rem', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <ListChecks size={20} color="#a855f7" />
              Detailed Section Results
            </h3>
            
            {Object.keys(dashboardData.sections).length > 0 ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {Object.entries(dashboardData.sections).map(([sectionName, sectionData]) => (
                  <SectionDetailCard
                    key={sectionName}
                    sectionName={sectionName}
                    sectionData={sectionData}
                    isExpanded={expandedSection === sectionName}
                    onToggle={() => setExpandedSection(expandedSection === sectionName ? null : sectionName)}
                    getSectionIcon={getSectionIcon}
                    getSectionColor={getSectionColor}
                  />
                ))}
              </div>
            ) : (
              <div style={{ textAlign: 'center', padding: '3rem', color: 'rgba(255,255,255,0.5)' }}>
                <ListChecks size={48} style={{ margin: '0 auto 1rem', opacity: 0.3 }} />
                <p>Complete the diagnostic test to see detailed section results</p>
              </div>
            )}
          </div>
        )}

        {/* AI Insights Tab */}
        {activeTab === 'ai-insights' && (
          <div style={{
            background: 'rgba(30, 20, 40, 0.7)',
            borderRadius: '16px',
            padding: '1.5rem',
            border: '1px solid rgba(139, 92, 246, 0.2)'
          }}>
            <div style={{ 
              display: 'flex', 
              justifyContent: 'space-between', 
              alignItems: 'center',
              marginBottom: '1.5rem'
            }}>
              <h3 style={{ fontSize: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem', margin: 0 }}>
                <Brain size={20} color="#a855f7" />
                AI-Powered Insights
              </h3>
              <button
                onClick={refreshAIFeedback}
                disabled={loadingFeedback}
                style={{
                  padding: '0.5rem 1rem',
                  background: 'rgba(139, 92, 246, 0.2)',
                  border: '1px solid rgba(139, 92, 246, 0.3)',
                  borderRadius: '8px',
                  color: '#a855f7',
                  cursor: loadingFeedback ? 'not-allowed' : 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  fontWeight: 600,
                  fontSize: '0.875rem',
                  opacity: loadingFeedback ? 0.5 : 1
                }}
              >
                <RefreshCw size={16} style={{ 
                  animation: loadingFeedback ? 'spin 1s linear infinite' : 'none' 
                }} />
                Refresh Analysis
              </button>
            </div>

            {loadingFeedback ? (
              <div style={{ textAlign: 'center', padding: '3rem' }}>
                <div style={{
                  width: '48px',
                  height: '48px',
                  border: '4px solid rgba(139, 92, 246, 0.3)',
                  borderTopColor: '#a855f7',
                  borderRadius: '50%',
                  animation: 'spin 1s linear infinite',
                  margin: '0 auto 1rem'
                }} />
                <p style={{ color: 'rgba(255,255,255,0.6)' }}>
                  AI is analyzing your performance...
                </p>
              </div>
            ) : aiFeedback.length > 0 ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {aiFeedback.map((feedback, idx) => (
                  <FeedbackCard key={idx} feedback={feedback} expanded={true} />
                ))}

                {studyRecommendation && (
                  <div style={{
                    padding: '1.5rem',
                    background: 'rgba(59, 130, 246, 0.1)',
                    border: '1px solid rgba(59, 130, 246, 0.3)',
                    borderRadius: '12px'
                  }}>
                    <h4 style={{ 
                      fontSize: '1.1rem', 
                      marginBottom: '0.75rem',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.5rem'
                    }}>
                      <Lightbulb size={20} color="#3b82f6" />
                      Personalized Study Plan
                    </h4>
                    <p style={{ 
                      fontSize: '0.95rem', 
                      color: 'rgba(255,255,255,0.85)',
                      margin: 0,
                      lineHeight: 1.6
                    }}>
                      {studyRecommendation}
                    </p>
                  </div>
                )}
              </div>
            ) : (
              <div style={{ textAlign: 'center', padding: '3rem', color: 'rgba(255,255,255,0.5)' }}>
                <Brain size={48} style={{ margin: '0 auto 1rem', opacity: 0.3 }} />
                <p>Complete the diagnostic test to unlock AI-powered insights</p>
              </div>
            )}
          </div>
        )}

        {/* Progress Tab */}
        {activeTab === 'progress' && (
          <div style={{
            background: 'rgba(30, 20, 40, 0.7)',
            borderRadius: '16px',
            padding: '1.5rem',
            border: '1px solid rgba(139, 92, 246, 0.2)'
          }}>
            <h3 style={{ fontSize: '1.25rem', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <TrendingUp size={20} color="#a855f7" />
              Your Progress
            </h3>

            {diagnosticReport ? (
              <>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.5rem', marginBottom: '1.5rem' }}>
                  {/* Test Completion Stats */}
                  <div style={{
                    padding: '1.5rem',
                    background: 'rgba(139, 92, 246, 0.1)',
                    border: '1px solid rgba(139, 92, 246, 0.3)',
                    borderRadius: '12px'
                  }}>
                    <h4 style={{ fontSize: '1rem', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <Target size={18} color="#a855f7" />
                      Test Completion
                    </h4>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                      <ProgressItem 
                        label="Questions Attempted" 
                        value={`${diagnosticReport.total?.attempted || 0}/${diagnosticReport.total?.total || 0}`}
                        icon={<CheckCircle size={14} color="#a855f7" />}
                      />
                      <ProgressItem 
                        label="Completion Rate" 
                        value={`${((diagnosticReport.total?.attempted || 0) / (diagnosticReport.total?.total || 1) * 100).toFixed(0)}%`}
                        icon={<Activity size={14} color="#a855f7" />}
                      />
                      <ProgressItem 
                        label="Questions Skipped" 
                        value={`${(diagnosticReport.total?.total || 0) - (diagnosticReport.total?.attempted || 0)}`}
                        icon={<XCircle size={14} color="#6b7280" />}
                      />
                    </div>
                  </div>

                  {/* Accuracy Breakdown */}
                  <div style={{
                    padding: '1.5rem',
                    background: 'rgba(34, 197, 94, 0.1)',
                    border: '1px solid rgba(34, 197, 94, 0.3)',
                    borderRadius: '12px'
                  }}>
                    <h4 style={{ fontSize: '1rem', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <Award size={18} color="#22c55e" />
                      Accuracy Metrics
                    </h4>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                      <ProgressItem 
                        label="Overall Accuracy" 
                        value={`${(diagnosticReport.total?.accuracy || 0).toFixed(1)}%`}
                        icon={<Star size={14} color="#22c55e" />}
                      />
                      <ProgressItem 
                        label="Correct Answers" 
                        value={`${diagnosticReport.total?.correct || 0}/${diagnosticReport.total?.attempted || 0}`}
                        icon={<CheckCircle size={14} color="#22c55e" />}
                      />
                      <ProgressItem 
                        label="Incorrect Answers" 
                        value={`${(diagnosticReport.total?.attempted || 0) - (diagnosticReport.total?.correct || 0)}`}
                        icon={<XCircle size={14} color="#ef4444" />}
                      />
                    </div>
                  </div>

                  {/* Achievements */}
                  <div style={{
                    padding: '1.5rem',
                    background: 'rgba(245, 158, 11, 0.1)',
                    border: '1px solid rgba(245, 158, 11, 0.3)',
                    borderRadius: '12px'
                  }}>
                    <h4 style={{ fontSize: '1rem', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <Trophy size={18} color="#f59e0b" />
                      Achievements
                    </h4>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                      <ProgressItem 
                        label="Topics Mastered" 
                        value={`${Object.entries(diagnosticReport.sections || {}).filter(([_, data]) => data.accuracy >= 75).length} topics`} 
                        icon={<Star size={14} color="#f59e0b" />}
                      />
                      <ProgressItem 
                        label="Strong Areas" 
                        value={`${dashboardData.strong_areas.length} sections`} 
                        icon={<CheckCircle size={14} color="#22c55e" />}
                      />
                      <ProgressItem 
                        label="Needs Improvement" 
                        value={`${dashboardData.weak_areas.length} sections`} 
                        icon={<AlertCircle size={14} color="#ef4444" />}
                      />
                    </div>
                  </div>
                </div>

                {/* Unique Insights Section */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.5rem' }}>
                  {/* Success Rate Analysis */}
                  <div style={{
                    padding: '1.5rem',
                    background: 'rgba(59, 130, 246, 0.1)',
                    border: '1px solid rgba(59, 130, 246, 0.3)',
                    borderRadius: '12px'
                  }}>
                    <h4 style={{ fontSize: '1rem', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <Brain size={18} color="#3b82f6" />
                      Success Rate Analysis
                    </h4>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                      <ProgressItem 
                        label="Attempted Success Rate" 
                        value={`${diagnosticReport.total?.attempted > 0 ? ((diagnosticReport.total?.correct || 0) / (diagnosticReport.total?.attempted || 1) * 100).toFixed(1) : 0}%`}
                        icon={<TrendingUp size={14} color="#3b82f6" />}
                      />
                      <ProgressItem 
                        label="Answer Confidence" 
                        value={(() => {
                          const attempted = diagnosticReport.total?.attempted || 0;
                          const total = diagnosticReport.total?.total || 1;
                          const confidence = (attempted / total) * 100;
                          return confidence >= 80 ? 'High' : confidence >= 50 ? 'Medium' : 'Low';
                        })()}
                        icon={<Zap size={14} color="#3b82f6" />}
                      />
                      <ProgressItem 
                        label="Readiness Level" 
                        value={(() => {
                          const accuracy = diagnosticReport.total?.accuracy || 0;
                          return accuracy >= 75 ? 'Interview Ready' : accuracy >= 60 ? 'Preparing' : 'Foundation Building';
                        })()}
                        icon={<Target size={14} color="#3b82f6" />}
                      />
                    </div>
                  </div>

                  {/* Study Focus Recommendations */}
                  <div style={{
                    padding: '1.5rem',
                    background: 'rgba(168, 85, 247, 0.1)',
                    border: '1px solid rgba(168, 85, 247, 0.3)',
                    borderRadius: '12px'
                  }}>
                    <h4 style={{ fontSize: '1rem', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <Lightbulb size={18} color="#a855f7" />
                      Study Focus
                    </h4>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                      <ProgressItem 
                        label="Priority Topics" 
                        value={`${Object.entries(diagnosticReport.sections || {}).filter(([_, data]) => data.accuracy < 60).length} topics`}
                        icon={<AlertCircle size={14} color="#ef4444" />}
                      />
                      <ProgressItem 
                        label="Estimated Study Time" 
                        value={(() => {
                          const accuracy = diagnosticReport.total?.accuracy || 0;
                          return accuracy >= 75 ? '2-3 weeks' : accuracy >= 60 ? '4-6 weeks' : '8-12 weeks';
                        })()}
                        icon={<Clock size={14} color="#a855f7" />}
                      />
                      <ProgressItem 
                        label="Recommended Daily" 
                        value={(() => {
                          const accuracy = diagnosticReport.total?.accuracy || 0;
                          return accuracy >= 75 ? '1-2 hours' : accuracy >= 60 ? '2-3 hours' : '3-4 hours';
                        })()}
                        icon={<Calendar size={14} color="#a855f7" />}
                      />
                    </div>
                  </div>
                </div>
              </>
            ) : (
              <div style={{ textAlign: 'center', padding: '3rem', color: 'rgba(255,255,255,0.5)' }}>
                <TrendingUp size={48} style={{ margin: '0 auto 1rem', opacity: 0.3 }} />
                <p>Complete the diagnostic test to track your progress</p>
              </div>
            )}
          </div>
        )}

        {/* Quick Actions */}
        <div style={{
          marginTop: '2rem',
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
          gap: '1rem'
        }}>
          <ActionCard
            icon={<Play size={20} />}
            title="Continue Learning"
            description="Resume your personalized study path"
            onClick={() => navigate('/learn')}
            color="#8b5cf6"
          />
          <ActionCard
            icon={<BookOpen size={20} />}
            title="Practice Questions"
            description="Test your knowledge with practice problems"
            onClick={() => navigate('/practice')}
            color="#3b82f6"
          />
          <ActionCard
            icon={<BarChart3 size={20} />}
            title="Retake Diagnostic"
            description="Measure your progress with a new test"
            onClick={() => navigate('/diagnostic')}
            color="#10b981"
          />
        </div>
      </div>
    </div>
  );
};

// Helper Components
const StatCard = ({ icon, label, value, color, trend }) => (
  <div style={{
    background: 'rgba(30, 20, 40, 0.7)',
    borderRadius: '12px',
    padding: '1.25rem',
    border: '1px solid rgba(139, 92, 246, 0.2)',
    transition: 'transform 0.3s, box-shadow 0.3s'
  }}
  onMouseEnter={(e) => {
    e.currentTarget.style.transform = 'translateY(-4px)';
    e.currentTarget.style.boxShadow = `0 8px 24px ${color}40`;
  }}
  onMouseLeave={(e) => {
    e.currentTarget.style.transform = 'translateY(0)';
    e.currentTarget.style.boxShadow = 'none';
  }}
  >
    <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
      <div style={{
        width: '40px',
        height: '40px',
        background: `${color}20`,
        borderRadius: '10px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: color
      }}>
        {icon}
      </div>
      {trend && (
        <span style={{
          fontSize: '0.75rem',
          color: '#10b981',
          background: 'rgba(16, 185, 129, 0.1)',
          padding: '0.25rem 0.5rem',
          borderRadius: '6px',
          fontWeight: 600
        }}>
          {trend}
        </span>
      )}
    </div>
    <div style={{ fontSize: '0.875rem', color: 'rgba(255,255,255,0.6)', marginBottom: '0.25rem' }}>
      {label}
    </div>
    <div style={{ fontSize: '1.75rem', fontWeight: 700, color: 'white' }}>
      {value}
    </div>
  </div>
);

const AreaCard = ({ title, items, color, icon, action }) => (
  <div style={{
    padding: '1rem',
    background: `${color}15`,
    border: `1px solid ${color}40`,
    borderRadius: '10px'
  }}>
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
      <h5 style={{ fontSize: '0.9rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.5rem', margin: 0 }}>
        {icon}
        {title}
      </h5>
      <span style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.5)' }}>{action}</span>
    </div>
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
      {items.map((item, idx) => (
        <span
          key={idx}
          style={{
            fontSize: '0.8rem',
            padding: '0.4rem 0.75rem',
            background: `${color}25`,
            border: `1px solid ${color}50`,
            borderRadius: '6px',
            color: 'rgba(255,255,255,0.9)'
          }}
        >
          {item}
        </span>
      ))}
    </div>
  </div>
);

const FeedbackCard = ({ feedback, expanded = false }) => {
  const getIconForType = (type) => {
    switch (type) {
      case 'strength': return <CheckCircle size={18} color="#10b981" />;
      case 'weakness': return <AlertCircle size={18} color="#f59e0b" />;
      case 'suggestion': return <Lightbulb size={18} color="#3b82f6" />;
      default: return <Sparkles size={18} color="#a855f7" />;
    }
  };

  const getColorForType = (type) => {
    switch (type) {
      case 'strength': return '#10b981';
      case 'weakness': return '#f59e0b';
      case 'suggestion': return '#3b82f6';
      default: return '#a855f7';
    }
  };

  const color = getColorForType(feedback.type);

  return (
    <div style={{
      padding: expanded ? '1.25rem' : '1rem',
      background: `${color}10`,
      border: `1px solid ${color}30`,
      borderRadius: '10px'
    }}>
      <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'flex-start' }}>
        <div style={{ flexShrink: 0, marginTop: '0.1rem' }}>
          {getIconForType(feedback.type)}
        </div>
        <div style={{ flex: 1 }}>
          <h5 style={{ 
            fontSize: expanded ? '0.95rem' : '0.85rem', 
            fontWeight: 600, 
            marginBottom: '0.4rem',
            color: 'rgba(255,255,255,0.95)'
          }}>
            {feedback.title}
          </h5>
          <p style={{ 
            fontSize: expanded ? '0.9rem' : '0.8rem', 
            color: 'rgba(255,255,255,0.75)', 
            margin: 0,
            lineHeight: 1.5
          }}>
            {feedback.message}
          </p>
        </div>
      </div>
    </div>
  );
};

const SectionDetailCard = ({ sectionName, sectionData, isExpanded, onToggle, getSectionIcon, getSectionColor }) => {
  const accuracy = sectionData.accuracy;
  const color = getSectionColor(accuracy);

  return (
    <div style={{
      background: 'rgba(255,255,255,0.03)',
      border: `1px solid ${color}40`,
      borderRadius: '12px',
      overflow: 'hidden',
      transition: 'all 0.3s'
    }}>
      <div
        onClick={onToggle}
        style={{
          padding: '1.25rem',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          background: `${color}10`
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flex: 1 }}>
          {getSectionIcon(accuracy)}
          <div style={{ flex: 1 }}>
            <h4 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: '0.25rem' }}>
              {sectionName}
            </h4>
            <div style={{ fontSize: '0.875rem', color: 'rgba(255,255,255,0.6)' }}>
              {sectionData.correct}/{sectionData.total} correct • {accuracy.toFixed(1)}% accuracy
            </div>
          </div>
          <div style={{
            fontSize: '1.5rem',
            fontWeight: 700,
            color: color,
            minWidth: '80px',
            textAlign: 'right'
          }}>
            {accuracy.toFixed(1)}%
          </div>
        </div>
        {isExpanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
      </div>

      {isExpanded && (
        <div style={{ padding: '1.25rem', borderTop: `1px solid ${color}20` }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem', marginBottom: '1rem' }}>
            <MetricBox label="Correct" value={sectionData.correct} color="#10b981" />
            <MetricBox label="Incorrect" value={sectionData.incorrect} color="#ef4444" />
            <MetricBox label="Skipped" value={sectionData.skipped} color="#6b7280" />
          </div>

          {/* Progress Bar */}
          <div style={{ marginTop: '1rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem', fontSize: '0.875rem' }}>
              <span style={{ color: 'rgba(255,255,255,0.7)' }}>Progress</span>
              <span style={{ color: 'rgba(255,255,255,0.9)', fontWeight: 600 }}>{sectionData.attempted}/{sectionData.total} attempted</span>
            </div>
            <div style={{
              width: '100%',
              height: '8px',
              background: 'rgba(255,255,255,0.1)',
              borderRadius: '4px',
              overflow: 'hidden'
            }}>
              <div style={{
                width: `${(sectionData.attempted / sectionData.total) * 100}%`,
                height: '100%',
                background: `linear-gradient(90deg, ${color} 0%, ${color}cc 100%)`,
                transition: 'width 0.3s'
              }} />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const MetricBox = ({ label, value, color }) => (
  <div style={{
    padding: '0.75rem',
    background: `${color}15`,
    border: `1px solid ${color}30`,
    borderRadius: '8px',
    textAlign: 'center'
  }}>
    <div style={{ fontSize: '1.5rem', fontWeight: 700, color: color, marginBottom: '0.25rem' }}>
      {value}
    </div>
    <div style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.6)' }}>
      {label}
    </div>
  </div>
);

const ProgressItem = ({ label, value, icon }) => (
  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
    <span style={{ fontSize: '0.875rem', color: 'rgba(255,255,255,0.7)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
      {icon}
      {label}
    </span>
    <span style={{ fontSize: '0.875rem', fontWeight: 600, color: 'rgba(255,255,255,0.95)' }}>
      {value}
    </span>
  </div>
);

const ActionCard = ({ icon, title, description, onClick, color }) => (
  <div
    onClick={onClick}
    style={{
      background: 'rgba(30, 20, 40, 0.7)',
      border: '1px solid rgba(139, 92, 246, 0.2)',
      borderRadius: '12px',
      padding: '1.25rem',
      cursor: 'pointer',
      transition: 'all 0.3s',
      display: 'flex',
      gap: '1rem',
      alignItems: 'flex-start'
    }}
    onMouseEnter={(e) => {
      e.currentTarget.style.transform = 'translateY(-4px)';
      e.currentTarget.style.boxShadow = `0 8px 24px ${color}40`;
      e.currentTarget.style.borderColor = color;
    }}
    onMouseLeave={(e) => {
      e.currentTarget.style.transform = 'translateY(0)';
      e.currentTarget.style.boxShadow = 'none';
      e.currentTarget.style.borderColor = 'rgba(139, 92, 246, 0.2)';
    }}
  >
    <div style={{
      width: '48px',
      height: '48px',
      background: `${color}20`,
      borderRadius: '12px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      color: color,
      flexShrink: 0
    }}>
      {icon}
    </div>
    <div style={{ flex: 1 }}>
      <h4 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: '0.25rem' }}>
        {title}
      </h4>
      <p style={{ fontSize: '0.875rem', color: 'rgba(255,255,255,0.6)', margin: 0 }}>
        {description}
      </p>
    </div>
    <ArrowRight size={20} style={{ color: 'rgba(255,255,255,0.4)', flexShrink: 0, marginTop: '0.5rem' }} />
  </div>
);

export default EnhancedDashboardWithDetails;
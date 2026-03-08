import React, { useState, useEffect, useRef } from 'react';
import { Send, BookOpen, Brain, Lightbulb, Calendar, Target, TrendingUp, Sparkles, ArrowLeft, X, CheckCircle, AlertCircle, Clock, Award } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import './AITutor.css';

const AITutor = () => {
  const navigate = useNavigate();
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [studentData, setStudentData] = useState(null);
  const [isInitialized, setIsInitialized] = useState(false);
  const [learningPlan, setLearningPlan] = useState(null);
  const [showPlanModal, setShowPlanModal] = useState(false);
  const [loadingPlan, setLoadingPlan] = useState(false);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // ✅ Load student data with detailed section analysis
  useEffect(() => {
    const initializeWithStudentData = async () => {
      const diagnosticReport = JSON.parse(localStorage.getItem('diagnosticReport') || '{}');
      
      let studentInfo = {
        weakAreas: [],
        strongAreas: [],
        criticalAreas: [],
        moderateAreas: [],
        overallAccuracy: 0,
        totalQuestions: 0,
        attempted: 0,
        learningStyle: 'visual',
        learningSpeed: 'medium',
        sectionDetails: {}
      };

      if (diagnosticReport.total && diagnosticReport.sections) {
        const weakAreas = [];
        const strongAreas = [];
        const criticalAreas = [];
        const moderateAreas = [];
        
        Object.entries(diagnosticReport.sections || {}).forEach(([section, data]) => {
          if (data.accuracy < 40) {
            criticalAreas.push({ name: section, accuracy: data.accuracy, ...data });
          } else if (data.accuracy < 60) {
            weakAreas.push({ name: section, accuracy: data.accuracy, ...data });
          } else if (data.accuracy < 75) {
            moderateAreas.push({ name: section, accuracy: data.accuracy, ...data });
          } else {
            strongAreas.push({ name: section, accuracy: data.accuracy, ...data });
          }
        });

        studentInfo = {
          weakAreas: weakAreas,
          strongAreas: strongAreas,
          criticalAreas: criticalAreas,
          moderateAreas: moderateAreas,
          overallAccuracy: diagnosticReport.total?.accuracy || 0,
          totalQuestions: diagnosticReport.total?.total || 0,
          attempted: diagnosticReport.total?.attempted || 0,
          learningStyle: 'visual',
          learningSpeed: 'medium',
          sectionDetails: diagnosticReport.sections || {}
        };
      }

      setStudentData(studentInfo);

      const welcomeMessage = "👋 Hi! I'm your AI Tutor.\n\nI'm here to help you with any questions about your studies. Ask me anything about:\n\n• Concepts you're struggling with\n• Problem-solving strategies\n• Study tips and techniques\n• Any topic from your diagnostic test\n\n💬 How can I help you today?";
      
      setMessages([{
        role: 'assistant',
        content: welcomeMessage,
        timestamp: new Date().toISOString()
      }]);

      setIsInitialized(true);
    };

    initializeWithStudentData();
  }, []);

  // [KEEP ALL EXISTING PLAN GENERATION FUNCTIONS - generateDynamicLearningPlan, etc.]
  const generateDynamicLearningPlan = () => {
    if (!studentData) return null;

    const { criticalAreas, weakAreas, moderateAreas, strongAreas, overallAccuracy, sectionDetails } = studentData;

    const priorityAreas = [
      ...criticalAreas.map(area => ({ ...area, priority: 'CRITICAL' })),
      ...weakAreas.map(area => ({ ...area, priority: 'HIGH' })),
      ...moderateAreas.map(area => ({ ...area, priority: 'MEDIUM' }))
    ];

    if (priorityAreas.length === 0) {
      return generateMaintenancePlan(strongAreas, overallAccuracy);
    }

    const weeks = [];
    const areasToFocus = priorityAreas.slice(0, 4);

    areasToFocus.forEach((area, index) => {
      const weekNumber = index + 1;
      const weekPlan = generateWeekPlan(area, weekNumber, sectionDetails);
      weeks.push(weekPlan);
    });

    while (weeks.length < 4) {
      weeks.push(generateReviewWeek(weeks.length + 1, priorityAreas));
    }

    return {
      plan_summary: generatePlanSummary(priorityAreas, overallAccuracy),
      weeks: weeks,
      motivation_tips: generateMotivationTips(overallAccuracy),
      learning_resources: generateResources(priorityAreas),
      performance_analysis: {
        critical_count: criticalAreas.length,
        weak_count: weakAreas.length,
        moderate_count: moderateAreas.length,
        strong_count: strongAreas.length,
        overall_accuracy: overallAccuracy
      }
    };
  };

  const generatePlanSummary = (priorityAreas, accuracy) => {
    if (accuracy < 50) {
      return `Based on your diagnostic test (${accuracy.toFixed(1)}% accuracy), this intensive 4-week plan focuses on building strong fundamentals. We'll start with ${priorityAreas[0]?.name || 'core concepts'} and progressively tackle each challenge area with structured practice and clear milestones.`;
    } else if (accuracy < 70) {
      return `Your test showed ${accuracy.toFixed(1)}% accuracy with room for targeted improvement. This plan addresses your specific weak points in ${priorityAreas.slice(0, 2).map(a => a.name).join(' and ')}, using proven learning techniques to boost your understanding and confidence.`;
    } else {
      return `Great foundation with ${accuracy.toFixed(1)}% accuracy! This refinement plan will help you master the remaining challenges in ${priorityAreas.slice(0, 2).map(a => a.name).join(' and ')}, pushing you toward excellence with advanced practice and optimization strategies.`;
    }
  };

  const generateWeekPlan = (area, weekNumber) => {
    const accuracy = area.accuracy || 0;
    const difficulty = accuracy < 40 ? 'Foundation Building' : accuracy < 60 ? 'Core Mastery' : 'Advanced Practice';
    const dailyProblems = accuracy < 40 ? 8 : accuracy < 60 ? 10 : 12;
    const studyHours = accuracy < 40 ? 2.5 : accuracy < 60 ? 3 : 3.5;
    const objectives = generateLearningObjectives(area.name, accuracy);

    const dailyBreakdown = [
      {
        day: 'Monday', theme: 'Concept Foundation',
        tasks: [`📖 Review ${area.name} fundamentals`, `📝 Study 2-3 examples`, `💻 Solve ${Math.floor(dailyProblems * 0.6)} problems`, `✍️ Document key concepts`],
        estimated_time: `${studyHours - 0.5} hours`, practice_problems: Math.floor(dailyProblems * 0.6), focus: 'Understanding core principles'
      },
      {
        day: 'Tuesday', theme: 'Guided Practice',
        tasks: [`🎯 Complete ${dailyProblems} problems`, `📊 Review solutions`, `🔍 Identify mistakes`, `💡 Practice strategies`],
        estimated_time: `${studyHours} hours`, practice_problems: dailyProblems, focus: 'Building problem-solving skills'
      },
      {
        day: 'Wednesday', theme: 'Concept Deep Dive',
        tasks: [`🧠 Study advanced techniques`, `📹 Watch tutorials`, `💻 Solve ${Math.floor(dailyProblems * 0.8)} problems`, `📝 Create summary notes`],
        estimated_time: `${studyHours} hours`, practice_problems: Math.floor(dailyProblems * 0.8), focus: 'Deepening understanding'
      },
      {
        day: 'Thursday', theme: 'Application Practice',
        tasks: [`⚡ Complete ${dailyProblems + 2} problems`, `🎯 Focus on speed`, `🔄 Redo mistakes`, `📈 Track improvement`],
        estimated_time: `${studyHours + 0.5} hours`, practice_problems: dailyProblems + 2, focus: 'Speed and accuracy'
      },
      {
        day: 'Friday', theme: 'Challenge Day',
        tasks: [`🔥 Tackle ${Math.floor(dailyProblems * 0.7)} hard problems`, `💪 Focus on difficult types`, `🧩 Mixed problem sets`, `📊 Analyze performance`],
        estimated_time: `${studyHours} hours`, practice_problems: Math.floor(dailyProblems * 0.7), focus: 'Pushing boundaries'
      },
      {
        day: 'Saturday', theme: 'Comprehensive Practice',
        tasks: [`📚 Full practice session`, `⏱️ Timed set (${dailyProblems + 3} problems)`, `🎯 Exam-style questions`, `✅ Review solutions`],
        estimated_time: `${studyHours + 0.5} hours`, practice_problems: dailyProblems + 3, focus: 'Exam simulation'
      },
      {
        day: 'Sunday', theme: 'Review & Assessment',
        tasks: [`📝 Weekly quiz`, `🔍 Review all problems`, `📊 Analyze progress`, `📚 Update notes`, `🎯 Plan next week`],
        estimated_time: `${studyHours - 0.5} hours`, practice_problems: 12, focus: 'Consolidation'
      }
    ];

    return {
      week: weekNumber, focus_topic: area.name, current_accuracy: accuracy, priority_level: area.priority,
      difficulty_level: difficulty, target_accuracy: Math.min(accuracy + 15, 85), learning_objectives: objectives,
      daily_breakdown: dailyBreakdown, success_criteria: `Complete all tasks, achieve ${Math.min(accuracy + 15, 85)}%+ on assessment`,
      assessment: `Week ${weekNumber} Assessment: ${area.name} quiz`, resources_needed: generateWeekResources(area.name)
    };
  };

  const generateLearningObjectives = (topic, accuracy) => {
    const base = {
      'DSA': ['Understand complexity analysis', 'Master data structures', 'Learn solving patterns', 'Practice implementation'],
      'OOP': ['Grasp OOP principles', 'Understand class design', 'Master interfaces', 'Learn design patterns'],
      'DBMS': ['Master SQL queries', 'Understand normalization', 'Learn transactions', 'Practice optimization'],
      'Operating Systems': ['Understand process management', 'Master memory concepts', 'Learn deadlock handling', 'Grasp file systems'],
      'Computer Networks': ['Master OSI/TCP model', 'Understand routing', 'Learn protocols', 'Practice troubleshooting']
    };
    const objectives = base[topic] || [`Master ${topic} concepts`, `Practice ${topic} problems`, `Build ${topic} understanding`, `Develop ${topic} speed`];
    if (accuracy < 40) {
      objectives.push(`Build confidence`, `Focus on basics`);
    } else if (accuracy < 60) {
      objectives.push(`Improve to 75%+`, `Master intermediate problems`);
    } else {
      objectives.push(`Achieve 85%+`, `Optimize speed`);
    }
    return objectives;
  };

  const generateWeekResources = (topic) => {
    const res = {
      'DSA': ['GeeksforGeeks DSA', 'LeetCode Patterns', 'Abdul Bari', 'Striver Sheet'],
      'OOP': ['OOP Design Principles', 'Design Patterns Book', 'OOP Tutorials'],
      'DBMS': ['W3Schools SQL', 'Database Concepts', 'MySQL Practice'],
      'Operating Systems': ['OS by Galvin', 'Gate Smashers', 'OS Concepts'],
      'Computer Networks': ['Tanenbaum Networks', 'Kurose-Ross', 'Cisco Basics']
    };
    return res[topic] || [`${topic} Tutorial`, `${topic} Practice`, `${topic} Videos`];
  };

  const generateReviewWeek = (weekNumber) => ({
    week: weekNumber, focus_topic: 'Comprehensive Review', current_accuracy: 0, priority_level: 'REVIEW',
    difficulty_level: 'Mixed Practice', target_accuracy: 80,
    learning_objectives: ['Consolidate learning', 'Fix weak areas', 'Practice mixed sets', 'Build confidence'],
    daily_breakdown: [
      { day: 'Monday', theme: 'Review', tasks: ['📚 Review all topics', '📝 Mixed set (15 q)', '🔍 Identify gaps', '📊 Create priority list'], estimated_time: '3 hours', practice_problems: 15, focus: 'Assessment' },
      { day: 'Tue-Thu', theme: 'Practice', tasks: ['🎯 Focus on gaps', '💻 Solve 20+ daily', '⏱️ Timed practice', '📈 Track improvement'], estimated_time: '3.5 hours', practice_problems: 20, focus: 'Intensive' },
      { day: 'Fri-Sat', theme: 'Mock Tests', tasks: ['📝 Full mock test', '🔍 Review answers', '📊 Analyze metrics', '✅ Document learnings'], estimated_time: '4 hours', practice_problems: 25, focus: 'Simulation' },
      { day: 'Sunday', theme: 'Final Review', tasks: ['📚 Review notes', '🎯 Practice difficult topics', '💪 Build confidence', '📋 Plan ahead'], estimated_time: '3 hours', practice_problems: 15, focus: 'Consolidation' }
    ],
    success_criteria: 'Achieve 80%+ on mocks', assessment: `Week ${weekNumber}: Comprehensive test`, resources_needed: ['Mixed sets', 'Previous years', 'Mock platform']
  });

  const generateMaintenancePlan = (strongAreas, accuracy) => ({
    plan_summary: `Excellent ${accuracy.toFixed(1)}% accuracy! Advanced plan for mastery through challenging problems.`,
    weeks: Array.from({ length: 4 }, (_, i) => ({
      week: i + 1, focus_topic: strongAreas[i % strongAreas.length]?.name || 'Advanced Practice',
      current_accuracy: accuracy, priority_level: 'MAINTENANCE', difficulty_level: 'Advanced Mastery', target_accuracy: 95,
      learning_objectives: ['Master advanced techniques', 'Optimize efficiency', 'Practice complex problems', 'Mentor others'],
      daily_breakdown: [{ day: 'Daily', theme: 'Mastery', tasks: ['🔥 10-15 advanced problems', '⚡ Optimal solutions', '🎯 Competitive challenges', '📚 Advanced topics'], estimated_time: '2-3 hours', practice_problems: 12, focus: 'Excellence' }],
      success_criteria: 'Maintain 90%+ accuracy', assessment: `Week ${i + 1}: Advanced set`, resources_needed: ['LeetCode Hard', 'CodeForces', 'Advanced courses']
    })),
    motivation_tips: ['Consistency maintains excellence', 'Challenge yourself', 'Teach to deepen understanding'],
    learning_resources: { visual: ['Advanced Visualizations', 'System Design'], interactive: ['LeetCode Premium', 'CodeForces', 'HackerRank'] }
  });

  const generateMotivationTips = (accuracy) => {
    if (accuracy < 50) return ['🎯 Focus one topic at a time', '💪 Celebrate small wins', '📈 Study daily', '🤝 Ask for help', '✨ Stay committed'];
    if (accuracy < 70) return ['🚀 Maintain momentum', '🎯 Target weak areas', '💡 Learn from mistakes', '📊 Track progress', '🏆 Push comfort zone'];
    return ['⭐ Excellence within reach', '🎯 Fine-tune skills', '🚀 Strong foundation', '💪 Push boundaries', '🏆 Teach others'];
  };

  const generateResources = () => ({
    visual: ['YouTube - Abdul Bari', 'Visualgo', 'GeeksforGeeks Videos'],
    interactive: ['LeetCode', 'HackerRank', 'CodeChef', 'Codeforces'],
    reading: ['CLRS Book', 'GeeksforGeeks', 'TutorialsPoint'],
    practice: ['InterviewBit', 'PrepInsta', 'Coding Ninjas']
  });

  const generateLearningPlan = () => {
    setLoadingPlan(true);
    setShowPlanModal(true);
    setTimeout(() => {
      setLearningPlan(generateDynamicLearningPlan());
      setLoadingPlan(false);
    }, 1500);
  };

  // ✅ SMART AI RESPONSES WITH FALLBACK
  const generateFallbackResponse = (input, data) => {
    const lowerInput = input.toLowerCase();
    
    // Topic-specific responses
    if (lowerInput.includes('dsa') || lowerInput.includes('data structure')) {
      return "📚 **Data Structures & Algorithms:**\n\n" +
        "Key topics to master:\n" +
        "• **Arrays & Strings** - Practice sliding window, two pointers\n" +
        "• **LinkedLists** - Master reversal, cycle detection\n" +
        "• **Trees** - Focus on BFS, DFS, BST operations\n" +
        "• **Graphs** - Learn DFS, BFS, shortest path algorithms\n\n" +
        "💡 **Pro tip:** Start with easy problems on LeetCode, then gradually increase difficulty. Aim for 2-3 problems daily.";
    }
    
    if (lowerInput.includes('dbms') || lowerInput.includes('database')) {
      return "🗄️ **Database Management Systems:**\n\n" +
        "Essential concepts:\n" +
        "• **Normalization** - Understand 1NF, 2NF, 3NF, BCNF\n" +
        "• **SQL Queries** - Practice JOINs, subqueries, aggregations\n" +
        "• **Transactions** - Learn ACID properties\n" +
        "• **Indexing** - Understand B-trees, hash indexes\n\n" +
        "📖 Resources: W3Schools SQL, GeeksforGeeks DBMS";
    }
    
    if (lowerInput.includes('os') || lowerInput.includes('operating system')) {
      return "⚙️ **Operating Systems:**\n\n" +
        "Core topics:\n" +
        "• **Process Management** - Scheduling algorithms, deadlock\n" +
        "• **Memory Management** - Paging, segmentation, virtual memory\n" +
        "• **File Systems** - Understand inode structure\n" +
        "• **Concurrency** - Semaphores, mutex, monitors\n\n" +
        "📚 Recommended: Operating System Concepts by Galvin";
    }
    
    if (lowerInput.includes('aptitude') || lowerInput.includes('quant')) {
      return "🎯 **Quantitative Aptitude:**\n\n" +
        "Focus areas:\n" +
        "• **Time & Work** - Practice shortcut formulas\n" +
        "• **Percentages** - Master quick calculation techniques\n" +
        "• **Probability** - Understand basic probability rules\n" +
        "• **Number Systems** - Learn divisibility rules\n\n" +
        "⚡ Practice daily on IndiaBix or PrepInsta for best results.";
    }
    
    if (lowerInput.includes('interview') || lowerInput.includes('prepare')) {
      return "🎓 **Interview Preparation Strategy:**\n\n" +
        "**Week 1-2:** Focus on your weakest topics\n" +
        "**Week 3-4:** Practice mixed problems daily\n" +
        "**Week 5-6:** Mock interviews & system design\n\n" +
        "💡 **Key tips:**\n" +
        "• Explain your thought process clearly\n" +
        "• Ask clarifying questions\n" +
        "• Practice on whiteboard/paper\n" +
        "• Review company-specific patterns\n\n" +
        "You got this! 💪";
    }
    
    if (lowerInput.includes('study plan') || lowerInput.includes('schedule')) {
      if (data && data.weakAreas && data.weakAreas.length > 0) {
        return `📅 **Personalized Study Plan:**\n\n` +
          `Based on your diagnostic test (${data.overallAccuracy.toFixed(1)}% accuracy):\n\n` +
          `**Priority Topics:**\n` +
          data.weakAreas.slice(0, 3).map((area, i) => `${i + 1}. ${area.name} (Critical)`).join('\n') +
          `\n\n**Recommended Schedule:**\n` +
          `• Daily: 2-3 hours of focused study\n` +
          `• Week 1-2: Master ${data.weakAreas[0].name}\n` +
          `• Week 3-4: Cover remaining weak areas\n\n` +
          `Click "Study Plan" above for detailed day-by-day breakdown! 📚`;
      }
      return "📅 Complete the diagnostic test first to get a personalized study plan tailored to your needs!";
    }
    
    if (lowerInput.includes('help') || lowerInput.includes('guide')) {
      return "👋 **I can help you with:**\n\n" +
        "• 📚 Explaining DSA, DBMS, OS, CN concepts\n" +
        "• 🎯 Study strategies and tips\n" +
        "• 📊 Analyzing your weak areas\n" +
        "• 💡 Practice recommendations\n" +
        "• 🎓 Interview preparation guidance\n\n" +
        "Just ask me anything! For example:\n" +
        "- 'Explain binary trees'\n" +
        "- 'How to prepare for DBMS?'\n" +
        "- 'What should I study first?'";
    }
    
    // Performance-based responses
    if (data && data.overallAccuracy > 0) {
      if (data.criticalAreas && data.criticalAreas.length > 0) {
        return `🎯 **Based on your performance (${data.overallAccuracy.toFixed(1)}%):**\n\n` +
          `You need immediate focus on:\n` +
          data.criticalAreas.map(area => `• ${area.name} (${area.accuracy.toFixed(1)}%)`).join('\n') +
          `\n\n💡 **Quick tips:**\n` +
          `• Start with ${data.criticalAreas[0].name} fundamentals\n` +
          `• Practice 10-15 basic problems daily\n` +
          `• Review concepts before solving\n` +
          `• Track your improvement weekly\n\n` +
          `Ask me specific questions about any topic! 🚀`;
      }
    }
    
    // Generic helpful response
    return "I'm your AI learning assistant! 🤖\n\n" +
      "I can help you with:\n" +
      "• Concept explanations (DSA, DBMS, OS, CN, Aptitude)\n" +
      "• Study strategies and planning\n" +
      "• Practice recommendations\n" +
      "• Interview preparation tips\n\n" +
      "What would you like to learn about? Feel free to ask specific questions!";
  };

  const handleSendMessage = async () => {
    if (!input.trim()) return;

    const userMessage = { role: 'user', content: input, timestamp: new Date().toISOString() };
    setMessages(prev => [...prev, userMessage]);
    const currentInput = input.toLowerCase();
    setInput('');
    setLoading(true);

    // Simulate AI thinking time
    await new Promise(resolve => setTimeout(resolve, 800));

    try {
      // Try to connect to backend first
      const response = await fetch('http://localhost:8000/ai-tutor/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          student_id: "S001",
          message: currentInput,
          conversation_history: messages
        })
      });

      if (!response.ok) throw new Error('Backend unavailable');

      const data = await response.json();
      
      const aiMessage = {
        role: 'assistant',
        content: data.response || generateFallbackResponse(currentInput, studentData),
        timestamp: new Date().toISOString()
      };

      setMessages(prev => [...prev, aiMessage]);
    } catch (error) {
      // Use intelligent fallback responses
      const aiMessage = {
        role: 'assistant',
        content: generateFallbackResponse(currentInput, studentData),
        timestamp: new Date().toISOString()
      };
      setMessages(prev => [...prev, aiMessage]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleQuickAction = async (actionType) => {
    let question = '';
    switch(actionType) {
      case 'explain':
        question = studentData?.criticalAreas[0]?.name || studentData?.weakAreas[0]?.name 
          ? `Can you explain ${studentData.criticalAreas[0]?.name || studentData.weakAreas[0]?.name} concepts?`
          : "Can you explain problem-solving effectively?";
        break;
      case 'practice':
        question = studentData?.criticalAreas[0]?.name || studentData?.weakAreas[0]?.name
          ? `What should I practice for ${studentData.criticalAreas[0]?.name || studentData.weakAreas[0]?.name}?`
          : "What topics should I practice?";
        break;
      case 'tips':
        question = "Can you give me study tips?";
        break;
      case 'plan':
        await generateLearningPlan();
        return;
    }
    setInput(question);
  };

  // [KEEP ALL REMAINING COMPONENTS - QuickActions, LearningPlanModal, etc.]
  const QuickActions = () => (
    <div className="quick-actions-grid">
      <button onClick={() => handleQuickAction('explain')} className="quick-action-button brain-action">
        <Brain className="quick-action-icon" />
        <div className="quick-action-title">Explain Concept</div>
        <div className="quick-action-subtitle">Get detailed explanations</div>
      </button>
      <button onClick={() => handleQuickAction('plan')} className="quick-action-button calendar-action">
        <Calendar className="quick-action-icon" />
        <div className="quick-action-title">Study Plan</div>
        <div className="quick-action-subtitle">Personalized 4-week plan</div>
      </button>
      <button onClick={() => handleQuickAction('practice')} className="quick-action-button target-action">
        <Target className="quick-action-icon" />
        <div className="quick-action-title">Practice Guide</div>
        <div className="quick-action-subtitle">Get recommendations</div>
      </button>
      <button onClick={() => handleQuickAction('tips')} className="quick-action-button lightbulb-action">
        <Lightbulb className="quick-action-icon" />
        <div className="quick-action-title">Study Tips</div>
        <div className="quick-action-subtitle">Personalized advice</div>
      </button>
    </div>
  );

  const LearningPlanModal = () => {
    if (!showPlanModal) return null;

    const getPriorityBadge = (priority) => {
      const badges = {
        'CRITICAL': { color: '#ef4444', icon: '🔥', text: 'URGENT' },
        'HIGH': { color: '#f59e0b', icon: '⚠️', text: 'HIGH PRIORITY' },
        'MEDIUM': { color: '#3b82f6', icon: '📌', text: 'MODERATE' },
        'REVIEW': { color: '#10b981', icon: '✓', text: 'REVIEW' },
        'MAINTENANCE': { color: '#8b5cf6', icon: '⭐', text: 'MASTERY' }
      };
      const badge = badges[priority] || badges['MEDIUM'];
      return (
        <span style={{background: badge.color + '20', color: badge.color, padding: '0.25rem 0.75rem', borderRadius: '12px', fontSize: '0.75rem', fontWeight: '700', border: `1px solid ${badge.color}40` }}>
          {badge.icon} {badge.text}
        </span>
      );
    };

    return (
      <div className="modal-overlay" onClick={() => setShowPlanModal(false)}>
        <div className="modal-content professional-modal" onClick={(e) => e.stopPropagation()}>
          <div className="modal-header professional-header">
            <div>
              <h2 className="modal-title">📚 Your Personalized Learning Roadmap</h2>
              {learningPlan?.performance_analysis && (
                <div className="performance-summary">
                  <span className="performance-badge critical">{learningPlan.performance_analysis.critical_count} Critical</span>
                  <span className="performance-badge weak">{learningPlan.performance_analysis.weak_count} Weak</span>
                  <span className="performance-badge moderate">{learningPlan.performance_analysis.moderate_count} Moderate</span>
                  <span className="performance-badge strong">{learningPlan.performance_analysis.strong_count} Strong</span>
                  <span className="performance-badge overall">{learningPlan.performance_analysis.overall_accuracy.toFixed(1)}% Overall</span>
                </div>
              )}
            </div>
            <button onClick={() => setShowPlanModal(false)} className="modal-close-button"><X size={24} /></button>
          </div>
          
          <div className="modal-body professional-body">
            {loadingPlan ? (
              <div className="plan-loading">
                <div className="loading-spinner-large"></div>
                <p className="loading-text-large">Analyzing your performance...</p>
                <p className="loading-subtext">Creating personalized study plan</p>
              </div>
            ) : learningPlan ? (
              <>
                <div className="plan-summary professional-summary">
                  <div className="summary-icon">💡</div>
                  <div>
                    <h3 style={{ margin: '0 0 0.5rem 0', color: 'white', fontSize: '1.1rem' }}>Plan Overview</h3>
                    <p style={{ margin: 0, lineHeight: '1.6' }}>{learningPlan.plan_summary}</p>
                  </div>
                </div>

                {learningPlan.weeks?.map((week, idx) => (
                  <div key={idx} className="week-card professional-week-card">
                    <div className="week-header professional-week-header">
                      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flex: 1 }}>
                        <div className="week-number">W{week.week}</div>
                        <div style={{ flex: 1 }}>
                          <h3 className="week-title" style={{ margin: '0 0 0.25rem 0' }}>{week.focus_topic}</h3>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
                            {getPriorityBadge(week.priority_level)}
                            {week.current_accuracy > 0 && (
                              <span className="accuracy-badge">Current: {week.current_accuracy.toFixed(1)}% → Target: {week.target_accuracy}%</span>
                            )}
                            <span className="difficulty-badge">{week.difficulty_level}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <div className="objectives-section professional-objectives">
                      <h4 className="section-title"><Target size={18} style={{ color: '#8b5cf6' }} />Learning Objectives</h4>
                      <ul className="objectives-list professional-objectives-list">
                        {week.learning_objectives?.map((obj, i) => (
                          <li key={i}><CheckCircle size={16} className="objective-icon" />{obj}</li>
                        ))}
                      </ul>
                    </div>

                    <div className="daily-schedule professional-schedule">
                      <h4 className="section-title"><Calendar size={18} style={{ color: '#8b5cf6' }} />Daily Schedule</h4>
                      <div className="schedule-grid">
                        {week.daily_breakdown?.map((day, i) => (
                          <div key={i} className="day-card professional-day-card">
                            <div className="day-header">
                              <span className="day-name">{day.day}</span>
                              <span className="day-theme">{day.theme}</span>
                            </div>
                            <ul className="day-tasks professional-tasks">
                              {day.tasks?.map((task, j) => <li key={j}>{task}</li>)}
                            </ul>
                            <div className="day-footer">
                              <div className="day-stat"><Clock size={14} /><span>{day.estimated_time}</span></div>
                              <div className="day-stat"><Brain size={14} /><span>{day.practice_problems} problems</span></div>
                            </div>
                            <div className="day-focus">🎯 {day.focus}</div>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="week-footer professional-footer">
                      <div className="success-criteria professional-success">
                        <Award className="success-icon" />
                        <div><strong>Success Criteria:</strong> {week.success_criteria}</div>
                      </div>
                      {week.resources_needed && (
                        <div className="week-resources">
                          <BookOpen size={16} />
                          <span>Resources: {week.resources_needed.join(', ')}</span>
                        </div>
                      )}
                    </div>
                  </div>
                ))}

                {learningPlan.motivation_tips && (
                  <div className="motivation-section professional-motivation">
                    <h4 className="section-title"><Sparkles size={18} style={{ color: '#f59e0b' }} />Motivation & Tips</h4>
                    <ul className="motivation-list professional-motivation-list">
                      {learningPlan.motivation_tips.map((tip, i) => <li key={i}>{tip}</li>)}
                    </ul>
                  </div>
                )}

                {learningPlan.learning_resources && (
                  <div className="resources-section professional-resources">
                    <h4 className="section-title"><BookOpen size={18} style={{ color: '#3b82f6' }} />Recommended Resources</h4>
                    <div className="resources-grid">
                      {Object.entries(learningPlan.learning_resources).map(([type, resources]) => (
                        <div key={type} className="resource-category-card">
                          <div className="resource-type">{type.charAt(0).toUpperCase() + type.slice(1)}</div>
                          <ul className="resource-list">
                            {resources.map((resource, i) => <li key={i}>{resource}</li>)}
                          </ul>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </>
            ) : (
              <div className="plan-loading">
                <AlertCircle size={48} style={{ color: '#ef4444', marginBottom: '1rem' }} />
                <p className="loading-text-large">Unable to generate plan</p>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  if (!isInitialized) {
    return (
      <div className="ai-tutor-container">
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
          <div className="loading-state">
            <div className="loading-spinner"></div>
            <p className="loading-text">Initializing AI Tutor...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="ai-tutor-container">
      <div className="ai-tutor-wrapper">
        <div className="ai-tutor-header">
          <div className="ai-tutor-header-content">
            <button onClick={() => navigate('/dashboard')} className="back-button"><ArrowLeft size={20} /></button>
            <div className="ai-tutor-icon-wrapper"><Brain className="ai-tutor-icon" /></div>
            <div style={{ flex: 1 }}>
              <h1 className="ai-tutor-title">AI Tutor</h1>
              <p className="ai-tutor-subtitle">Your personal learning assistant</p>
            </div>
            <div className="ai-tutor-status">
              <div className="status-badge online"><span className="status-indicator"></span>AI Active</div>
            </div>
          </div>
        </div>

        <div className="ai-tutor-grid">
          <div className="chat-container">
            <div className="chat-messages">
              {messages.map((msg, idx) => (
                <div key={idx} className={`message-wrapper ${msg.role}`}>
                  <div className={`message-bubble ${msg.role}`}>
                    <div style={{ whiteSpace: 'pre-wrap' }}>{msg.content}</div>
                  </div>
                </div>
              ))}
              {loading && (
                <div className="message-wrapper assistant">
                  <div className="message-bubble assistant">
                    <div className="loading-indicator">
                      <div className="loading-dot"></div>
                      <div className="loading-dot"></div>
                      <div className="loading-dot"></div>
                    </div>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            <div className="chat-input-container">
              <div className="chat-input-wrapper">
                <input type="text" value={input} onChange={(e) => setInput(e.target.value)} onKeyPress={handleKeyPress}
                  placeholder="Ask me anything..." className="chat-input" disabled={loading} />
                <button onClick={handleSendMessage} disabled={loading || !input.trim()} className="send-button">
                  <Send style={{ width: '1rem', height: '1rem' }} />Send
                </button>
              </div>
            </div>
          </div>

          <div className="sidebar-container">
            <div className="sidebar-card">
              <h3 className="sidebar-card-title">Quick Actions</h3>
              <QuickActions />
            </div>

            {studentData && studentData.overallAccuracy > 0 && (
              <div className="sidebar-card">
                <h3 className="sidebar-card-title">Your Performance</h3>
                <div className="stats-list">
                  <div className="stat-item"><span className="stat-label">Overall Accuracy</span><span className="stat-value blue">{studentData.overallAccuracy.toFixed(1)}%</span></div>
                  <div className="stat-item"><span className="stat-label">Questions Attempted</span><span className="stat-value green">{studentData.attempted}</span></div>
                  <div className="stat-item"><span className="stat-label">Critical Areas</span><span className="stat-value red">{studentData.criticalAreas.length}</span></div>
                  <div className="stat-item"><span className="stat-label">Strong Areas</span><span className="stat-value green">{studentData.strongAreas.length}</span></div>
                </div>
              </div>
            )}

            <div className="tip-card">
              <div className="tip-header"><Sparkles className="tip-icon" /><h3 className="tip-title">Pro Tip</h3></div>
              <p className="tip-content">Click "Study Plan" to get a personalized 4-week roadmap based on your diagnostic test performance!</p>
            </div>
          </div>
        </div>
      </div>

      <LearningPlanModal />
    </div>
  );
};

export default AITutor;
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Clock, CheckCircle2, AlertCircle, Code, Database, Brain, Zap, ChevronRight, ChevronLeft } from "lucide-react";
import questions from "../data/fulldiagnosticQuestions";
import { analyzeTest } from "../utils/analyzeTest";
import './test.css';

export default function DiagnosticTest() {
  const navigate = useNavigate();
  const [answers, setAnswers] = useState({});
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [timeLeft, setTimeLeft] = useState(7200); // 120 minutes for 104 questions
  const [showSubmitModal, setShowSubmitModal] = useState(false);

  // Check if questions are loaded
  useEffect(() => {
    console.log("Questions loaded:", questions);
    console.log("Total questions:", questions?.length);
  }, []);

  // Timer
  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          handleSubmit();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const formatTime = (seconds) => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return hrs > 0 
      ? `${hrs}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
      : `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleMCQChange = (id, option) => {
    setAnswers(prev => ({ ...prev, [id]: option }));
  };

  const handleTextChange = (id, value) => {
    setAnswers(prev => ({ ...prev, [id]: value }));
  };

  const getAnsweredCount = () => {
    return Object.keys(answers).filter(key => answers[key]?.toString().trim()).length;
  };

  const isQuestionAnswered = (id) => {
    return answers[id] && answers[id].toString().trim() !== "";
  };

  const getProgressPercentage = () => {
    return (getAnsweredCount() / questions.length) * 100;
  };

  const goToQuestion = (index) => {
    setCurrentQuestion(index);
  };

  const handleNext = () => {
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(prev => prev + 1);
    }
  };

  const handlePrevious = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(prev => prev - 1);
    }
  };

  // ✅ FIXED: Complete submit handler with proper data saving
  const handleSubmit = () => {
    console.log("📝 Submitting test with answers:", answers);
    
    // ✅ Calculate report using analyzeTest utility
    const report = analyzeTest(questions, answers);
    console.log("📊 Generated report:", report);
    
    // ✅ Save to localStorage with COMPLETE structure
    const diagnosticReport = {
      total: {
        correct: report.total.correct,
        attempted: report.total.attempted,
        accuracy: report.total.accuracy,
        total: questions.length
      },
      sections: report.sections, // This contains per-section breakdown
      timestamp: new Date().toISOString(),
      answers: answers, // Save user answers
      questions: questions.map(q => ({ 
        id: q.id, 
        section: q.section, 
        answer: q.answer,
        question: q.question
      }))
    };
    
    console.log("💾 Saving diagnostic report to localStorage:", diagnosticReport);
    localStorage.setItem('diagnosticReport', JSON.stringify(diagnosticReport));
    
    // ✅ Also save dashboard data format for compatibility
    const dashboardData = {
      overall_accuracy: report.total.accuracy,
      total_questions: questions.length,
      correct_answers: report.total.correct,
      attempted: report.total.attempted,
      sections: report.sections,
      timestamp: new Date().toISOString()
    };
    localStorage.setItem('dashboardData', JSON.stringify(dashboardData));
    
    // ✅ Navigate with complete data
    navigate("/test-complete", {
      state: { 
        report: diagnosticReport,
        questions,
        answers 
      }
    });
    
    setShowSubmitModal(false);
  };

  const getSectionIcon = (section) => {
    switch(section) {
      case "SQL": return <Database className="w-4 h-4" />;
      case "Coding": return <Code className="w-4 h-4" />;
      case "DSA": return <Zap className="w-4 h-4" />;
      default: return <Brain className="w-4 h-4" />;
    }
  };

  // Add error handling for questions
  if (!questions || questions.length === 0) {
    return (
      <div style={{ padding: '40px', textAlign: 'center' }}>
        <h2>Error: Questions not loaded</h2>
        <p>Please check that fulldiagnosticQuestions.js exists and exports questions correctly.</p>
      </div>
    );
  }

  const q = questions[currentQuestion];
  const progressPercent = getProgressPercentage();

  return (
    <div className="diagnostic-wrapper">
      <div className="diagnostic-container">
        {/* Header Card */}
        <div className="header-card">
          <div className="header-top">
            <div className="header-title">
              <h1>Diagnostic Assessment</h1>
              <p>Question {currentQuestion + 1} of {questions.length}</p>
            </div>
            
            <div className={`timer-box ${timeLeft < 600 ? 'warning' : 'safe'}`}>
              <Clock className={`timer-icon ${timeLeft < 600 ? 'warning' : 'safe'}`} />
              <span className={`timer-text ${timeLeft < 600 ? 'warning' : 'safe'}`}>
                {formatTime(timeLeft)}
              </span>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="progress-container">
            <div className="progress-bar">
              <div className="progress-fill" style={{ width: `${progressPercent}%` }} />
            </div>
          </div>

          <div className="progress-info">
            <span>
              <strong className="answered">{getAnsweredCount()}</strong> answered, 
              <strong className="remaining">{questions.length - getAnsweredCount()}</strong> remaining
            </span>
            <span className="progress-percentage">{progressPercent.toFixed(1)}% Complete</span>
          </div>
        </div>

        <div className="main-grid">
          {/* Question Navigator */}
          <div className="question-navigator">
            <h3>Question Map</h3>
            <div className="question-grid">
              {questions.map((question, index) => (
                <button
                  key={question.id}
                  onClick={() => goToQuestion(index)}
                  className={`question-nav-btn ${
                    currentQuestion === index
                      ? 'current'
                      : isQuestionAnswered(question.id)
                      ? 'answered'
                      : 'unanswered'
                  }`}
                >
                  {index + 1}
                </button>
              ))}
            </div>

            {/* Legend */}
            <div className="navigator-legend">
              <div className="legend-item">
                <div className="legend-box answered"></div>
                <span className="legend-text">Answered</span>
              </div>
              <div className="legend-item">
                <div className="legend-box unanswered"></div>
                <span className="legend-text">Not Answered</span>
              </div>
              <div className="legend-item">
                <div className="legend-box current"></div>
                <span className="legend-text">Current</span>
              </div>
            </div>
          </div>

          {/* Question Card */}
          <div className="question-card">
            {/* Question Header */}
            <div className="question-header">
              {getSectionIcon(q.section)}
              <div className="header-info">
                <div className="section-name">Section: {q.section}</div>
                <div className="question-number">Question {currentQuestion + 1}</div>
              </div>
            </div>

            {/* Question Content */}
            <div className="question-content">
              <h2 className="question-text">{q.question}</h2>

              {/* MCQ Options */}
              {!q.type && q.options && (
                <div className="mcq-options">
                  {q.options.map((opt, idx) => (
                    <label
                      key={opt}
                      className={`option-label ${answers[q.id] === opt ? 'selected' : ''}`}
                    >
                      <input
                        type="radio"
                        name={`q-${q.id}`}
                        value={opt}
                        checked={answers[q.id] === opt}
                        onChange={() => handleMCQChange(q.id, opt)}
                        className="option-radio"
                      />
                      <span className="option-badge">
                        {String.fromCharCode(65 + idx)}
                      </span>
                      <span className="option-text">{opt}</span>
                    </label>
                  ))}
                </div>
              )}

              {/* SQL Textarea */}
              {q.type === "sql" && (
                <div>
                  <div className="hint-box sql">
                    <AlertCircle className="hint-icon" />
                    <span>Write your SQL query with proper syntax and formatting</span>
                  </div>
                  <textarea
                    value={answers[q.id] || ""}
                    onChange={(e) => handleTextChange(q.id, e.target.value)}
                    rows={10}
                    placeholder="-- Write your SQL query here&#10;SELECT * FROM table_name WHERE condition;"
                    className="code-textarea sql-input"
                  />
                </div>
              )}

              {/* Code Textarea */}
              {q.type === "code" && (
                <div>
                  <div className="hint-box code">
                    <AlertCircle className="hint-icon" />
                    <span>Include time and space complexity as comments</span>
                  </div>
                  <textarea
                    value={answers[q.id] || ""}
                    onChange={(e) => handleTextChange(q.id, e.target.value)}
                    rows={14}
                    placeholder="# Write your code here&#10;def solution():&#10;    pass&#10;&#10;# Time Complexity: O(?)&#10;# Space Complexity: O(?)"
                    className="code-textarea code-input"
                  />
                </div>
              )}
            </div>

            {/* Navigation Footer */}
            <div className="navigation-footer">
              <button
                onClick={handlePrevious}
                disabled={currentQuestion === 0}
                className="nav-button previous"
              >
                <ChevronLeft className="nav-icon" />
                Previous
              </button>

              {currentQuestion === questions.length - 1 ? (
                <button
                  onClick={() => setShowSubmitModal(true)}
                  className="nav-button submit"
                >
                  Submit Test
                </button>
              ) : (
                <button
                  onClick={handleNext}
                  className="nav-button next"
                >
                  Next
                  <ChevronRight className="nav-icon" />
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Submit Modal */}
      {showSubmitModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-icon-wrapper">
              <AlertCircle className="modal-icon" />
            </div>
            
            <h3 className="modal-title">Submit Test?</h3>
            
            <p className="modal-text">
              You have answered <span className="highlight-answered">{getAnsweredCount()}</span> out of{" "}
              <span className="highlight-total">{questions.length}</span> questions.
            </p>
            
            {getAnsweredCount() < questions.length && (
              <div className="modal-warning">
                <p>
                  <strong>Warning:</strong> {questions.length - getAnsweredCount()} question(s) remain unanswered.
                </p>
              </div>
            )}
            
            <div className="modal-actions">
              <button
                onClick={() => setShowSubmitModal(false)}
                className="modal-button cancel"
              >
                Cancel
              </button>
              <button
                onClick={handleSubmit}
                className="modal-button confirm"
              >
                Submit Now
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
// Welcome.jsx - Replace your entire file with this
import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import "./welcome.css";

export default function Welcome() {
  const navigate = useNavigate();
  const [mounted, setMounted] = useState(false);
  const [activeFeature, setActiveFeature] = useState(0);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [scrollY, setScrollY] = useState(0);
  const canvasRef = useRef(null);

  // Parallax effect
  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Mount animation
  useEffect(() => {
    setMounted(true);
    const interval = setInterval(() => {
      setActiveFeature(prev => (prev + 1) % 4);
    }, 3500);
    return () => clearInterval(interval);
  }, []);

  // Advanced mouse tracking
  useEffect(() => {
    const handleMouseMove = (e) => {
      setMousePos({ x: e.clientX, y: e.clientY });
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  // Animated background particles
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const particles = [];
    for (let i = 0; i < 50; i++) {
      particles.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        radius: Math.random() * 2 + 1,
        vx: (Math.random() - 0.5) * 0.5,
        vy: (Math.random() - 0.5) * 0.5,
        opacity: Math.random() * 0.5 + 0.2
      });
    }

    function animate() {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      particles.forEach(p => {
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(168, 85, 247, ${p.opacity})`;
        ctx.fill();
        
        p.x += p.vx;
        p.y += p.vy;
        
        if (p.x < 0 || p.x > canvas.width) p.vx *= -1;
        if (p.y < 0 || p.y > canvas.height) p.vy *= -1;
      });
      
      requestAnimationFrame(animate);
    }
    animate();

    const handleResize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const features = [
    { 
      icon: "🧠", 
      title: "AI-Powered Learning", 
      desc: "Advanced algorithms adapt to your learning style",
      stat: "98% accuracy",
      gradient: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)"
    },
    { 
      icon: "🎯", 
      title: "Targeted Practice", 
      desc: "Focus on weak areas with precision analytics",
      stat: "3x faster learning",
      gradient: "linear-gradient(135deg, #f093fb 0%, #f5576c 100%)"
    },
    { 
      icon: "📊", 
      title: "Real-Time Analytics", 
      desc: "Track every metric that matters for success",
      stat: "Live insights",
      gradient: "linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)"
    },
    { 
      icon: "🏆", 
      title: "Placement Ready", 
      desc: "Interview prep from top tech companies",
      stat: "500+ companies",
      gradient: "linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)"
    }
  ];

  const companies = ["Google", "Microsoft", "Amazon", "Meta", "Apple", "Netflix"];
  
  const testimonials = [
    { name: "Rahul Kumar", role: "SDE @ Google", text: "Got placed in 3 months!", rating: 5 },
    { name: "Priya Sharma", role: "SDE @ Microsoft", text: "Best platform for preparation", rating: 5 },
    { name: "Amit Patel", role: "SDE @ Amazon", text: "Adaptive learning changed everything", rating: 5 }
  ];

  return (
    <div className="welcome-wrapper">
      <canvas ref={canvasRef} className="particle-canvas" />
      
      {/* Animated gradient background */}
      <div className="gradient-bg">
        <div 
          className="gradient-orb orb-1"
          style={{
            transform: `translate(${mousePos.x * 0.02}px, ${mousePos.y * 0.02}px)`
          }}
        />
        <div 
          className="gradient-orb orb-2"
          style={{
            transform: `translate(${-mousePos.x * 0.015}px, ${-mousePos.y * 0.015}px)`
          }}
        />
        <div className="gradient-orb orb-3" />
        <div className="noise-overlay" />
      </div>

      {/* Floating geometric shapes */}
      <div className="geometric-shapes">
        <div className="shape shape-1" />
        <div className="shape shape-2" />
        <div className="shape shape-3" />
      </div>

      <div className="content-container">
        {/* Enhanced Header */}
        <header className="header-nav">
          <div className="logo-section">
            <div className="logo-icon">
              <span className="logo-emoji">🚀</span>
              <div className="logo-glow" />
            </div>
            <div className="logo-text">
              <span className="brand-name">AdaptPath</span>
              <span className="brand-tagline">AI Learning Platform</span>
            </div>
          </div>
          
          <nav className="nav-links">
            <a href="#features" className="nav-link">Features</a>
            <a href="#how-it-works" className="nav-link">How It Works</a>
          
            <button onClick={() => navigate("/login")} className="nav-signin-btn">
              <span>Sign In</span>
              <div className="btn-shine" />
            </button>
          </nav>
        </header>

        {/* Hero Section */}
        <section className={`hero-section ${mounted ? 'mounted' : ''}`}>
          <div className="hero-badge">
            <span className="badge-icon">✨</span>
            <span className="badge-text">AI-Powered Placement Preparation Platform</span>
            <div className="badge-glow" />
          </div>

          <h1 className="hero-title">
            <span className="title-line">Transform Your</span>
            <span className="title-gradient">Career Journey</span>
            <span className="title-line">with AI-Powered Learning</span>
          </h1>

          <p className="hero-description">
            Master Data Structures, Algorithms, and System Design with personalized learning paths. 
            Join 10,000+ students who landed their dream jobs at top tech companies.
          </p>

          {/* Enhanced CTA */}
          <div className="cta-section">
            <button onClick={() => navigate("/register")} className="cta-primary">
              <span className="btn-content">
                <span className="btn-text">Start Free Trial</span>
                <span className="btn-arrow">→</span>
              </span>
              <div className="btn-bg-shine" />
              <div className="btn-particles">
                {[...Array(8)].map((_, i) => (
                  <span key={i} className="particle" style={{ '--i': i }} />
                ))}
              </div>
            </button>
            
            <button onClick={() => navigate("/login")} className="cta-secondary">
              <span className="btn-icon">📚</span>
              <span>Explore Platform</span>
              <div className="btn-border-animation" />
            </button>
          </div>

          {/* Live Stats Counter */}
          <div className="stats-row">
            <div className="stat-item">
              <div className="stat-icon">👥</div>
              <div className="stat-value counter" data-target="10000">10,000+</div>
              <div className="stat-label">Active Students</div>
            </div>
            <div className="stat-item">
              <div className="stat-icon">📈</div>
              <div className="stat-value">95%</div>
              <div className="stat-label">Success Rate</div>
            </div>
            <div className="stat-item">
              <div className="stat-icon">🏢</div>
              <div className="stat-value">500+</div>
              <div className="stat-label">Partner Companies</div>
            </div>
          </div>

          
        </section>

        {/* Features Grid */}
        <section id="features" className="features-section">
          <div className="section-header">
            <h2 className="section-title">Powerful Features</h2>
            <p className="section-subtitle">Everything you need to ace your placement interviews</p>
          </div>

          <div className="features-grid">
            {features.map((feature, idx) => (
              <div
                key={idx}
                className={`feature-card ${activeFeature === idx ? 'active' : ''}`}
                style={{ '--delay': `${idx * 0.1}s` }}
              >
                <div className="feature-glow" style={{ background: feature.gradient }} />
                <div className="feature-icon" style={{ background: feature.gradient }}>
                  <span>{feature.icon}</span>
                </div>
                <h3 className="feature-title">{feature.title}</h3>
                <p className="feature-desc">{feature.desc}</p>
                <div className="feature-stat">{feature.stat}</div>
                <div className="feature-hover-effect" />
              </div>
            ))}
          </div>
        </section>

        {/* How It Works */}
        <section id="how-it-works" className="how-it-works-section">
          <div className="section-header">
            <h2 className="section-title">How AdaptPath Works</h2>
            <p className="section-subtitle">Your journey to success in 3 simple steps</p>
          </div>

          <div className="steps-container">
            <div className="step-item">
              <div className="step-number">
                <span>01</span>
                <div className="step-glow" />
              </div>
              <div className="step-content">
                <h3>Take Diagnostic Test</h3>
                <p>Complete our comprehensive assessment to identify your strengths and weaknesses across all topics</p>
                <div className="step-features">
                  <span className="step-tag">100+ Questions</span>
                  <span className="step-tag">AI Analysis</span>
                  <span className="step-tag">Instant Results</span>
                </div>
              </div>
              <div className="step-animation step-anim-1" />
            </div>

            <div className="step-connector" />

            <div className="step-item">
              <div className="step-number">
                <span>02</span>
                <div className="step-glow" />
              </div>
              <div className="step-content">
                <h3>Get Personalized Path</h3>
                <p>AI creates a custom learning roadmap based on your performance, learning style, and career goals</p>
                <div className="step-features">
                  <span className="step-tag">Smart Routing</span>
                  <span className="step-tag">Adaptive</span>
                  <span className="step-tag">Goal-Oriented</span>
                </div>
              </div>
              <div className="step-animation step-anim-2" />
            </div>

            <div className="step-connector" />

            <div className="step-item">
              <div className="step-number">
                <span>03</span>
                <div className="step-glow" />
              </div>
              <div className="step-content">
                <h3>Practice & Excel</h3>
                <p>Master concepts with targeted practice, real-time feedback, and mock interviews from industry experts</p>
                <div className="step-features">
                  <span className="step-tag">Daily Practice</span>
                  <span className="step-tag">Mock Interviews</span>
                  <span className="step-tag">Expert Tips</span>
                </div>
              </div>
              <div className="step-animation step-anim-3" />
            </div>
          </div>
        </section>

   

        {/* Final CTA */}
        <section className="final-cta-section">
          <div className="final-cta-content">
            <h2 className="final-cta-title">Ready to Start Your Journey?</h2>
            <p className="final-cta-text">Join thousands of students who are already on their way to success</p>
            <button onClick={() => navigate("/register")} className="final-cta-btn">
              Get Started for Free
              <span className="btn-sparkle">✨</span>
            </button>
          </div>
        </section>

        {/* Footer */}
        <footer className="footer">
          <div className="footer-content">
            <div className="footer-brand">
              <span className="footer-logo">🚀 AdaptPath</span>
              <p className="footer-tagline">Empowering students to achieve their dreams</p>
            </div>
            <div className="footer-links">
              <a href="#features">Features</a>
              <a href="#how-it-works">How It Works</a>
              
            </div>
          </div>
          <div className="footer-bottom">
            <p>© 2025 AdaptPath. All rights reserved.</p>
          </div>
        </footer>
      </div>
    </div>
  );
}
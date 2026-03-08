import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import "./auth.css";

export default function Login() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: "", password: "" });
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [mounted, setMounted] = useState(false);
  const canvasRef = useRef(null);

  useEffect(() => {
    setMounted(true);

    // Animated particles
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const particles = [];
    for (let i = 0; i < 30; i++) {
      particles.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        radius: Math.random() * 2 + 1,
        vx: (Math.random() - 0.5) * 0.3,
        vy: (Math.random() - 0.5) * 0.3,
        opacity: Math.random() * 0.3 + 0.2,
      });
    }

    function animate() {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      particles.forEach((p) => {
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
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.email || !form.password) {
      alert("Please fill in all fields");
      return;
    }

    setIsLoading(true);

    // Simulate API call
    setTimeout(() => {
      setIsLoading(false);
      navigate("/diagnostic");
    }, 1500);
  };

  const updateField = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  return (
    <div className="auth-wrapper">
      <canvas ref={canvasRef} className="auth-canvas" />

      <div className="auth-bg">
        <div className="auth-orb auth-orb-1" />
        <div className="auth-orb auth-orb-2" />
        <div className="auth-orb auth-orb-3" />
      </div>

      <button onClick={() => navigate("/")} className="auth-back-btn">
        <span>←</span>
        <span>Back to Home</span>
      </button>

      <div className={`auth-container ${mounted ? "mounted" : ""}`}>
        <div className="auth-card">
          {/* Left side - Branding */}
          <div className="auth-brand-side">
            <div className="auth-brand-content">
              <div className="auth-logo">
                <span className="auth-logo-icon">🚀</span>
                <span className="auth-logo-text">AdaptPath</span>
              </div>

              <h2 className="auth-brand-title">Welcome Back!</h2>
              <p className="auth-brand-subtitle">
                Continue your learning journey and achieve your career goals
              </p>

              <div className="auth-features">
                <div className="auth-feature-item">
                  <span className="feature-icon">✨</span>
                  <span className="feature-text">AI-Powered Learning</span>
                </div>
                <div className="auth-feature-item">
                  <span className="feature-icon">📊</span>
                  <span className="feature-text">Track Your Progress</span>
                </div>
                <div className="auth-feature-item">
                  <span className="feature-icon">🎯</span>
                  <span className="feature-text">Personalized Path</span>
                </div>
              </div>

              <div className="auth-stats">
                <div className="auth-stat">
                  <span className="stat-value">10K+</span>
                  <span className="stat-label">Students</span>
                </div>
                <div className="auth-stat">
                  <span className="stat-value">95%</span>
                  <span className="stat-label">Success Rate</span>
                </div>
                <div className="auth-stat">
                  <span className="stat-value">500+</span>
                  <span className="stat-label">Companies</span>
                </div>
              </div>
            </div>
          </div>

          {/* Right side - Form */}
          <div className="auth-form-side">
            <div className="auth-form-container">
              <div className="auth-form-header">
                <h1 className="auth-form-title">Sign In</h1>
                <p className="auth-form-subtitle">
                  Enter your credentials to access your account
                </p>
              </div>

              <div className="auth-form">
                <div className="form-group">
                  <label className="form-label">Email Address</label>
                  <div className="input-wrapper">
                    <span className="input-icon">📧</span>
                    <input
                      type="email"
                      name="email"
                      placeholder="you@example.com"
                      value={form.email}
                      onChange={updateField}
                      className="form-input"
                      required
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Password</label>
                  <div className="input-wrapper">
                    <span className="input-icon">🔒</span>
                    <input
                      type={showPassword ? "text" : "password"}
                      name="password"
                      placeholder="Enter your password"
                      value={form.password}
                      onChange={updateField}
                      className="form-input"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="password-toggle"
                    >
                      {showPassword ? "👁️" : "👁️‍🗨️"}
                    </button>
                  </div>
                </div>

                <div className="form-options">
                  <label className="checkbox-label">
                    <input type="checkbox" />
                    <span>Remember me</span>
                  </label>
                  <a href="#" className="forgot-link">
                    Forgot password?
                  </a>
                </div>

                <button
                  onClick={handleSubmit}
                  className="auth-submit-btn"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <span className="btn-loading">
                      <span className="spinner" />
                      <span>Signing in...</span>
                    </span>
                  ) : (
                    <span className="btn-content">
                      <span>Sign In</span>
                      <span className="btn-arrow">→</span>
                    </span>
                  )}
                </button>

                <div className="divider">
                  <span>OR</span>
                </div>

                <button type="button" className="social-btn google-btn">
                  <span>🔍</span>
                  <span>Continue with Google</span>
                </button>

                <button type="button" className="social-btn github-btn">
                  <span>⚫</span>
                  <span>Continue with GitHub</span>
                </button>

                <p className="auth-switch">
                  Don't have an account?{" "}
                  <button
                    type="button"
                    onClick={() => navigate("/register")}
                    className="switch-link"
                  >
                    Sign up for free
                  </button>
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
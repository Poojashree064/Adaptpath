import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import "./auth.css";

export default function Register() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    confirm: "",
    college: "",
  });
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState(0);
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
        ctx.fillStyle = `rgba(236, 72, 153, ${p.opacity})`;
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

  // Calculate password strength
  useEffect(() => {
    const pw = form.password;
    let strength = 0;
    if (pw.length >= 8) strength++;
    if (pw.match(/[a-z]/) && pw.match(/[A-Z]/)) strength++;
    if (pw.match(/[0-9]/)) strength++;
    if (pw.match(/[^a-zA-Z0-9]/)) strength++;
    setPasswordStrength(strength);
  }, [form.password]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.name || !form.email || !form.password || !form.college) {
      alert("Please fill in all fields");
      return;
    }

    if (form.password !== form.confirm) {
      alert("Passwords do not match!");
      return;
    }

    if (form.password.length < 8) {
      alert("Password must be at least 8 characters");
      return;
    }

    setIsLoading(true);

    // Simulate API call
    setTimeout(() => {
      setIsLoading(false);
      alert("Account created successfully!");
      navigate("/login");
    }, 1500);
  };

  const updateField = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const getStrengthColor = () => {
    if (passwordStrength === 0) return "#ef4444";
    if (passwordStrength === 1) return "#f59e0b";
    if (passwordStrength === 2) return "#eab308";
    if (passwordStrength === 3) return "#84cc16";
    return "#22c55e";
  };

  const getStrengthText = () => {
    if (passwordStrength === 0) return "Weak";
    if (passwordStrength === 1) return "Fair";
    if (passwordStrength === 2) return "Good";
    if (passwordStrength === 3) return "Strong";
    return "Very Strong";
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

              <h2 className="auth-brand-title">Start Your Journey!</h2>
              <p className="auth-brand-subtitle">
                Join thousands of students preparing for their dream career
              </p>

              <div className="auth-features">
                <div className="auth-feature-item">
                  <span className="feature-icon">🎓</span>
                  <span className="feature-text">Personalized Learning</span>
                </div>
                <div className="auth-feature-item">
                  <span className="feature-icon">🏆</span>
                  <span className="feature-text">Placement Success</span>
                </div>
                <div className="auth-feature-item">
                  <span className="feature-icon">💼</span>
                  <span className="feature-text">Career Ready</span>
                </div>
              </div>

              <div className="benefits-list">
                <h3 className="benefits-title">What you'll get:</h3>
                <div className="benefit-item">
                  <span className="check-icon">✓</span>
                  <span>100+ Diagnostic Questions</span>
                </div>
                <div className="benefit-item">
                  <span className="check-icon">✓</span>
                  <span>AI-Powered Recommendations</span>
                </div>
                <div className="benefit-item">
                  <span className="check-icon">✓</span>
                  <span>Real-time Progress Tracking</span>
                </div>
                <div className="benefit-item">
                  <span className="check-icon">✓</span>
                  <span>Interview Preparation</span>
                </div>
              </div>
            </div>
          </div>

          {/* Right side - Form */}
          <div className="auth-form-side">
            <div className="auth-form-container">
              <div className="auth-form-header">
                <h1 className="auth-form-title">Create Account</h1>
                <p className="auth-form-subtitle">
                  Fill in your details to get started
                </p>
              </div>

              <div className="auth-form">
                <div className="form-group">
                  <label className="form-label">Full Name</label>
                  <div className="input-wrapper">
                    <span className="input-icon">👤</span>
                    <input
                      type="text"
                      name="name"
                      placeholder="John Doe"
                      value={form.name}
                      onChange={updateField}
                      className="form-input"
                      required
                    />
                  </div>
                </div>

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
                  <label className="form-label">College / University</label>
                  <div className="input-wrapper">
                    <span className="input-icon">🎓</span>
                    <input
                      type="text"
                      name="college"
                      placeholder="Your institution name"
                      value={form.college}
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
                      placeholder="Create a strong password"
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
                  {form.password && (
                    <div className="password-strength">
                      <div className="strength-bar">
                        <div
                          className="strength-fill"
                          style={{
                            width: `${(passwordStrength / 4) * 100}%`,
                            background: getStrengthColor(),
                          }}
                        />
                      </div>
                      <span
                        className="strength-text"
                        style={{ color: getStrengthColor() }}
                      >
                        {getStrengthText()}
                      </span>
                    </div>
                  )}
                </div>

                <div className="form-group">
                  <label className="form-label">Confirm Password</label>
                  <div className="input-wrapper">
                    <span className="input-icon">🔐</span>
                    <input
                      type={showConfirm ? "text" : "password"}
                      name="confirm"
                      placeholder="Re-enter your password"
                      value={form.confirm}
                      onChange={updateField}
                      className="form-input"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirm(!showConfirm)}
                      className="password-toggle"
                    >
                      {showConfirm ? "👁️" : "👁️‍🗨️"}
                    </button>
                  </div>
                  {form.confirm && form.password !== form.confirm && (
                    <span className="error-text">Passwords don't match</span>
                  )}
                </div>

                <label className="checkbox-label terms-label">
                  <input type="checkbox" required />
                  <span>
                    I agree to the{" "}
                    <a href="#" className="link-text">
                      Terms of Service
                    </a>{" "}
                    and{" "}
                    <a href="#" className="link-text">
                      Privacy Policy
                    </a>
                  </span>
                </label>

                <button
                  onClick={handleSubmit}
                  className="auth-submit-btn"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <span className="btn-loading">
                      <span className="spinner" />
                      <span>Creating account...</span>
                    </span>
                  ) : (
                    <span className="btn-content">
                      <span>Create Account</span>
                      <span className="btn-arrow">→</span>
                    </span>
                  )}
                </button>

                <div className="divider">
                  <span>OR</span>
                </div>

                <button type="button" className="social-btn google-btn">
                  <span>🔍</span>
                  <span>Sign up with Google</span>
                </button>

                <button type="button" className="social-btn github-btn">
                  <span>⚫</span>
                  <span>Sign up with GitHub</span>
                </button>

                <p className="auth-switch">
                  Already have an account?{" "}
                  <button
                    type="button"
                    onClick={() => navigate("/login")}
                    className="switch-link"
                  >
                    Sign in
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
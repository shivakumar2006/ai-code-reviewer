import { useState, useEffect } from "react";
import { useLoginMutation, useRegisterMutation } from "../store/api/authApi";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";

// ─────────────────────────────────────────
// SHARED STYLES
// ─────────────────────────────────────────
const GlobalStyles = () => (
    <style>{`
    @import url('https://fonts.googleapis.com/css2?family=DM+Mono:wght@300;400;500&family=Syne:wght@400;600;700;800&display=swap');

    * { box-sizing: border-box; margin: 0; padding: 0; }

    ::-webkit-scrollbar { width: 4px; }
    ::-webkit-scrollbar-track { background: #080808; }
    ::-webkit-scrollbar-thumb { background: #ff6b35; }

    .auth-input {
      width: 100%;
      background: #0d0d0d;
      border: 1px solid #1e1e1e;
      color: #f0ece4;
      padding: 14px 16px;
      font-family: 'DM Mono', monospace;
      font-size: 13px;
      outline: none;
      transition: all 0.2s;
      border-left: 3px solid transparent;
    }
    .auth-input::placeholder { color: #333; }
    .auth-input:focus {
      border-color: #2a2a2a;
      border-left-color: #ff6b35;
      background: #0f0f0f;
    }
    .auth-input:focus + .input-label { color: #ff6b35; }

    .auth-input.error {
      border-left-color: #ff3b3b;
    }

    .btn-submit {
      width: 100%;
      background: #ff6b35;
      color: #080808;
      border: none;
      padding: 16px;
      font-family: 'DM Mono', monospace;
      font-size: 12px;
      letter-spacing: 0.2em;
      text-transform: uppercase;
      cursor: pointer;
      font-weight: 500;
      transition: all 0.2s;
      clip-path: polygon(8px 0%, 100% 0%, calc(100% - 8px) 100%, 0% 100%);
      position: relative;
      overflow: hidden;
    }
    .btn-submit:hover:not(:disabled) {
      background: #ff8c5a;
      transform: translateY(-1px);
    }
    .btn-submit:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }
    .btn-submit::after {
      content: '';
      position: absolute;
      inset: 0;
      background: linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.1) 50%, transparent 100%);
      transform: translateX(-100%);
      transition: transform 0.5s;
    }
    .btn-submit:hover::after { transform: translateX(100%); }

    .switch-link {
      color: #ff6b35;
      cursor: pointer;
      text-decoration: none;
      transition: opacity 0.2s;
      font-family: 'DM Mono', monospace;
    }
    .switch-link:hover { opacity: 0.7; }

    .fade-in {
      animation: fadeIn 0.5s ease forwards;
    }
    @keyframes fadeIn {
      from { opacity: 0; transform: translateY(16px); }
      to   { opacity: 1; transform: translateY(0); }
    }

    .slide-in {
      animation: slideIn 0.4s ease forwards;
    }
    @keyframes slideIn {
      from { opacity: 0; transform: translateX(20px); }
      to   { opacity: 1; transform: translateX(0); }
    }

    .error-msg {
      font-size: 11px;
      color: #ff3b3b;
      letter-spacing: 0.05em;
      display: flex;
      align-items: center;
      gap: 6px;
      animation: fadeIn 0.2s ease;
    }

    .strength-bar {
      height: 2px;
      transition: all 0.3s;
      border-radius: 0;
    }

    .divider-line {
      display: flex;
      align-items: center;
      gap: 16px;
      color: #2a2a2a;
      font-size: 11px;
      letter-spacing: 0.1em;
    }
    .divider-line::before,
    .divider-line::after {
      content: '';
      flex: 1;
      height: 1px;
      background: #1a1a1a;
    }

    .noise-overlay {
      position: fixed;
      inset: 0;
      pointer-events: none;
      opacity: 0.025;
      z-index: 0;
      background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E");
      background-size: 128px;
    }

    .blink { animation: blink 1s step-end infinite; }
    @keyframes blink { 50% { opacity: 0; } }

    .tag {
      font-size: 9px;
      letter-spacing: 0.2em;
      color: #ff6b35;
      border: 1px solid #ff6b3530;
      padding: 3px 8px;
      font-family: 'DM Mono', monospace;
    }

    .check-item {
      display: flex;
      align-items: center;
      gap: 10px;
      font-size: 12px;
      color: #555;
      font-family: 'DM Mono', monospace;
      padding: 6px 0;
      transition: color 0.2s;
    }
    .check-item.active { color: #f0ece4; }
    .check-item.active .check-dot { background: #47A248; }
    .check-dot {
      width: 6px;
      height: 6px;
      border-radius: 50%;
      background: #2a2a2a;
      flex-shrink: 0;
      transition: background 0.2s;
    }
  `}</style>
);

// ─────────────────────────────────────────
// SHARED COMPONENTS
// ─────────────────────────────────────────

function GridBg() {
    return (
        <div style={{
            position: "fixed", inset: 0, zIndex: 0, pointerEvents: "none",
            backgroundImage: `
        linear-gradient(rgba(255,107,53,0.03) 1px, transparent 1px),
        linear-gradient(90deg, rgba(255,107,53,0.03) 1px, transparent 1px)
      `,
            backgroundSize: "60px 60px",
        }} />
    );
}

function Logo({ onClick }) {
    return (
        <div
            onClick={onClick}
            style={{
                display: "flex", alignItems: "center", gap: "10px",
                cursor: "pointer", userSelect: "none",
            }}
        >
            <div style={{
                width: "28px", height: "28px", background: "#ff6b35",
                clipPath: "polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)",
            }} />
            <span style={{
                fontFamily: "'Syne', sans-serif", fontWeight: 700,
                fontSize: "15px", letterSpacing: "0.05em", color: "#f0ece4",
            }}>
                CODEX<span style={{ color: "#ff6b35" }}>AI</span>
            </span>
        </div>
    );
}

function InputField({ label, name, type = "text", value, onChange, error, placeholder, suffix }) {
    const [show, setShow] = useState(false);
    const isPassword = type === "password";

    return (
        <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <label style={{
                    fontSize: "10px", letterSpacing: "0.2em", color: "#444",
                    textTransform: "uppercase", fontFamily: "'DM Mono', monospace",
                }}>{label}</label>
                {suffix}
            </div>
            <div style={{ position: "relative" }}>
                <input
                    name={name}
                    type={isPassword ? (show ? "text" : "password") : type}
                    value={value}
                    onChange={onChange}
                    placeholder={placeholder}
                    className={`auth-input ${error ? "error" : ""}`}
                />
                {isPassword && (
                    <button
                        type="button"
                        onClick={() => setShow(!show)}
                        style={{
                            position: "absolute", right: "14px", top: "50%",
                            transform: "translateY(-50%)", background: "none",
                            border: "none", cursor: "pointer", color: "#444",
                            fontSize: "11px", letterSpacing: "0.1em",
                            fontFamily: "'DM Mono', monospace",
                            transition: "color 0.2s",
                        }}
                        onMouseEnter={(e) => e.target.style.color = "#ff6b35"}
                        onMouseLeave={(e) => e.target.style.color = "#444"}
                    >
                        {show ? "HIDE" : "SHOW"}
                    </button>
                )}
            </div>
            {error && (
                <div className="error-msg">
                    <span style={{ color: "#ff3b3b" }}>✕</span>
                    {error}
                </div>
            )}
        </div>
    );
}

function PasswordStrength({ password }) {
    const checks = [
        { label: "8+ characters", pass: password.length >= 8 },
        { label: "Uppercase letter", pass: /[A-Z]/.test(password) },
        { label: "Number", pass: /[0-9]/.test(password) },
        { label: "Special character", pass: /[^A-Za-z0-9]/.test(password) },
    ];

    const score = checks.filter((c) => c.pass).length;
    const colors = ["#ff3b3b", "#ff8c35", "#ffd700", "#47A248"];
    const labels = ["WEAK", "FAIR", "GOOD", "STRONG"];

    if (!password) return null;

    return (
        <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
            <div style={{ display: "flex", gap: "4px", alignItems: "center" }}>
                {[0, 1, 2, 3].map((i) => (
                    <div
                        key={i}
                        className="strength-bar"
                        style={{
                            flex: 1,
                            background: i < score ? colors[score - 1] : "#1a1a1a",
                        }}
                    />
                ))}
                <span style={{
                    fontSize: "9px", letterSpacing: "0.2em",
                    color: score > 0 ? colors[score - 1] : "#333",
                    marginLeft: "8px", fontFamily: "'DM Mono', monospace",
                    minWidth: "50px",
                }}>
                    {score > 0 ? labels[score - 1] : ""}
                </span>
            </div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: "4px 16px" }}>
                {checks.map((c) => (
                    <div key={c.label} className={`check-item ${c.pass ? "active" : ""}`}>
                        <div className="check-dot" />
                        {c.label}
                    </div>
                ))}
            </div>
        </div>
    );
}

// ─────────────────────────────────────────
// LEFT PANEL — same for both pages
// ─────────────────────────────────────────
function LeftPanel({ mode }) {
    const isLogin = mode === "login";

    return (
        <div style={{
            flex: "0 0 480px", background: "#0a0a0a",
            borderRight: "1px solid #111",
            padding: "64px 56px",
            display: "flex", flexDirection: "column",
            justifyContent: "space-between",
            position: "relative", overflow: "hidden",
            minHeight: "100vh",
        }}>
            {/* top accent line */}
            <div style={{
                position: "absolute", top: 0, left: 0, right: 0,
                height: "2px",
                background: "linear-gradient(90deg, #ff6b35, transparent)",
            }} />

            {/* bg glow */}
            <div style={{
                position: "absolute", bottom: "-100px", left: "-100px",
                width: "400px", height: "400px", borderRadius: "50%",
                background: "radial-gradient(circle, rgba(255,107,53,0.05) 0%, transparent 70%)",
                pointerEvents: "none",
            }} />

            <div>
                <Logo />
                <div style={{ marginTop: "64px" }}>
                    <span style={{
                        fontSize: "10px", letterSpacing: "0.3em", color: "#ff6b35",
                        fontFamily: "'DM Mono', monospace", display: "flex",
                        alignItems: "center", gap: "12px",
                    }}>
                        <span style={{ width: "32px", height: "1px", background: "#ff6b35", display: "inline-block" }} />
                        {isLogin ? "Welcome Back" : "Get Started"}
                    </span>

                    <h1 style={{
                        fontFamily: "'Syne', sans-serif",
                        fontSize: "clamp(36px, 4vw, 52px)",
                        fontWeight: 800, lineHeight: 1.05,
                        marginTop: "20px", color: "#f0ece4",
                    }}>
                        {isLogin ? (
                            <>Your code<br />review<br /><span style={{ color: "#ff6b35" }}>awaits.</span></>
                        ) : (
                            <>Stop shipping<br /><span style={{ color: "#ff6b35" }}>broken</span><br />code.</>
                        )}
                    </h1>

                    <p style={{
                        marginTop: "24px", color: "#444", fontSize: "13px",
                        lineHeight: 1.8, fontFamily: "'DM Mono', monospace",
                        maxWidth: "320px",
                    }}>
                        {isLogin
                            ? "Sign in to access your review history, track your code quality score, and keep shipping better software."
                            : "Join and get AI-powered code reviews running locally on your machine. No cloud. No leaks. Just honest feedback."}
                    </p>
                </div>
            </div>

            {/* mock stats */}
            <div style={{ display: "flex", flexDirection: "column", gap: "0" }}>
                <div style={{
                    fontSize: "10px", letterSpacing: "0.2em", color: "#333",
                    fontFamily: "'DM Mono', monospace", marginBottom: "16px",
                }}>PLATFORM STATS</div>
                {[
                    { label: "Reviews Run", value: "12,847" },
                    { label: "Bugs Caught", value: "94,301" },
                    { label: "Avg Score Δ", value: "+2.4" },
                ].map((s, i) => (
                    <div key={s.label} style={{
                        display: "flex", justifyContent: "space-between",
                        alignItems: "center",
                        padding: "14px 0",
                        borderTop: "1px solid #111",
                    }}>
                        <span style={{
                            fontSize: "11px", color: "#444",
                            fontFamily: "'DM Mono', monospace", letterSpacing: "0.1em",
                        }}>{s.label}</span>
                        <span style={{
                            fontFamily: "'Syne', sans-serif", fontSize: "18px",
                            fontWeight: 700, color: i === 2 ? "#47A248" : "#f0ece4",
                        }}>{s.value}</span>
                    </div>
                ))}
            </div>

            {/* bottom tag */}
            <div style={{
                fontSize: "10px", color: "#222", letterSpacing: "0.15em",
                fontFamily: "'DM Mono', monospace",
            }}>
                POWERED BY LLAMA 3 + OLLAMA — LOCAL AI
            </div>
        </div>
    );
}

// ─────────────────────────────────────────
// LOGIN PAGE
// ─────────────────────────────────────────
export function LoginPage() {
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const [login, { isLoading }] = useLoginMutation();

    const [form, setForm] = useState({ email: "", password: "" });
    const [errors, setErrors] = useState({});
    const [serverError, setServerError] = useState("");
    const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

    useEffect(() => {
        const onMove = (e) => setMousePos({ x: e.clientX, y: e.clientY });
        window.addEventListener("mousemove", onMove);
        return () => window.removeEventListener("mousemove", onMove);
    }, []);

    const validate = () => {
        const e = {};
        if (!form.email) e.email = "Email is required";
        else if (!/\S+@\S+\.\S+/.test(form.email)) e.email = "Invalid email format";
        if (!form.password) e.password = "Password is required";
        return e;
    };

    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value });
        if (errors[e.target.name]) setErrors({ ...errors, [e.target.name]: "" });
        if (serverError) setServerError("");
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const errs = validate();
        if (Object.keys(errs).length) { setErrors(errs); return; }

        try {
            await login({ email: form.email, password: form.password }).unwrap();
            navigate("/dashboard");
        } catch (err) {
            setServerError(err?.data?.error || "Invalid email or password");
        }
    };

    return (
        <div style={{
            minHeight: "100vh", background: "#080808", color: "#f0ece4",
            fontFamily: "'DM Mono', monospace", display: "flex",
            position: "relative", overflow: "hidden",
        }}>
            <GlobalStyles />
            <GridBg />
            <div className="noise-overlay" />

            {/* cursor glow */}
            <div style={{
                position: "fixed", pointerEvents: "none", zIndex: 9999,
                width: "300px", height: "300px", borderRadius: "50%",
                background: "radial-gradient(circle, rgba(255,107,53,0.05) 0%, transparent 70%)",
                transform: "translate(-50%, -50%)",
                left: mousePos.x, top: mousePos.y,
                transition: "opacity 0.3s",
            }} />

            <LeftPanel mode="login" />

            {/* RIGHT PANEL */}
            <div style={{
                flex: 1, display: "flex", alignItems: "center",
                justifyContent: "center", padding: "64px 48px",
                position: "relative", zIndex: 1,
            }}>
                <div className="fade-in" style={{ width: "100%", maxWidth: "420px" }}>

                    {/* header */}
                    <div style={{ marginBottom: "48px" }}>
                        <span className="tag">AUTH / LOGIN</span>
                        <h2 style={{
                            fontFamily: "'Syne', sans-serif", fontSize: "28px",
                            fontWeight: 800, marginTop: "16px", lineHeight: 1.2,
                        }}>
                            Sign in to<br />your account
                        </h2>
                        <p style={{ marginTop: "10px", color: "#444", fontSize: "12px", lineHeight: 1.7 }}>
                            Access token issued on login. Valid for 15 minutes.
                        </p>
                    </div>

                    {/* server error */}
                    {serverError && (
                        <div className="slide-in" style={{
                            background: "#1a0808", border: "1px solid #ff3b3b30",
                            borderLeft: "3px solid #ff3b3b",
                            padding: "14px 16px", marginBottom: "24px",
                            display: "flex", alignItems: "center", gap: "10px",
                        }}>
                            <span style={{ color: "#ff3b3b", fontSize: "14px" }}>✕</span>
                            <span style={{ fontSize: "12px", color: "#ff6b6b" }}>{serverError}</span>
                        </div>
                    )}

                    <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
                        <InputField
                            label="Email Address"
                            name="email"
                            type="email"
                            value={form.email}
                            onChange={handleChange}
                            error={errors.email}
                            placeholder="you@example.com"
                        />

                        <InputField
                            label="Password"
                            name="password"
                            type="password"
                            value={form.password}
                            onChange={handleChange}
                            error={errors.password}
                            placeholder="Enter your password"
                            suffix={
                                <a href="#" className="switch-link" style={{ fontSize: "10px", letterSpacing: "0.1em" }}>
                                    FORGOT?
                                </a>
                            }
                        />

                        <button
                            type="submit"
                            className="btn-submit"
                            disabled={isLoading}
                            style={{ marginTop: "8px" }}
                        >
                            {isLoading ? (
                                <span style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "8px" }}>
                                    <span style={{
                                        width: "12px", height: "12px", border: "2px solid #080808",
                                        borderTopColor: "transparent", borderRadius: "50%",
                                        display: "inline-block",
                                        animation: "spin 0.6s linear infinite",
                                    }} />
                                    AUTHENTICATING
                                </span>
                            ) : "Sign In →"}
                        </button>
                    </form>

                    <div className="divider-line" style={{ margin: "32px 0" }}>OR</div>

                    {/* switch to register */}
                    <p style={{
                        textAlign: "center", fontSize: "12px", color: "#444",
                        lineHeight: 1.8,
                    }}>
                        No account yet?{" "}
                        <a href="/register" className="switch-link">
                            Create one →
                        </a>
                    </p>

                    {/* bottom info */}
                    <div style={{
                        marginTop: "48px", padding: "20px",
                        border: "1px solid #111", background: "#0a0a0a",
                        display: "flex", flexDirection: "column", gap: "8px",
                    }}>
                        <div style={{ fontSize: "9px", letterSpacing: "0.2em", color: "#333", marginBottom: "4px" }}>
                            JWT TOKEN INFO
                        </div>
                        {[
                            ["Access Token", "15 min"],
                            ["Refresh Token", "7 days"],
                            ["Storage", "Redux / Memory"],
                        ].map(([k, v]) => (
                            <div key={k} style={{
                                display: "flex", justifyContent: "space-between",
                                fontSize: "11px",
                            }}>
                                <span style={{ color: "#444" }}>{k}</span>
                                <span style={{ color: "#f0ece4" }}>{v}</span>
                            </div>
                        ))}
                    </div>

                    <style>{`
            @keyframes spin { to { transform: rotate(360deg); } }
          `}</style>
                </div>
            </div>
        </div>
    );
}

// ─────────────────────────────────────────
// REGISTER PAGE
// ─────────────────────────────────────────
export function RegisterPage() {
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const [register, { isLoading }] = useRegisterMutation();

    const [form, setForm] = useState({ name: "", email: "", password: "", confirm: "" });
    const [errors, setErrors] = useState({});
    const [serverError, setServerError] = useState("");
    const [step, setStep] = useState(1); // 1 = credentials, 2 = success
    const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

    useEffect(() => {
        const onMove = (e) => setMousePos({ x: e.clientX, y: e.clientY });
        window.addEventListener("mousemove", onMove);
        return () => window.removeEventListener("mousemove", onMove);
    }, []);

    const validate = () => {
        const e = {};
        if (!form.name.trim()) e.name = "Name is required";
        else if (form.name.trim().length < 2) e.name = "Name must be at least 2 characters";
        if (!form.email) e.email = "Email is required";
        else if (!/\S+@\S+\.\S+/.test(form.email)) e.email = "Invalid email format";
        if (!form.password) e.password = "Password is required";
        else if (form.password.length < 8) e.password = "Password must be at least 8 characters";
        if (!form.confirm) e.confirm = "Please confirm your password";
        else if (form.password !== form.confirm) e.confirm = "Passwords do not match";
        return e;
    };

    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value });
        if (errors[e.target.name]) setErrors({ ...errors, [e.target.name]: "" });
        if (serverError) setServerError("");
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const errs = validate();
        if (Object.keys(errs).length) { setErrors(errs); return; }

        try {
            await register({
                name: form.name,
                email: form.email,
                password: form.password,
            }).unwrap();
            setStep(2);
            setTimeout(() => navigate("/dashboard"), 2000);
        } catch (err) {
            setServerError(err?.data?.error || "Registration failed. Please try again.");
        }
    };

    return (
        <div style={{
            minHeight: "100vh", background: "#080808", color: "#f0ece4",
            fontFamily: "'DM Mono', monospace", display: "flex",
            position: "relative", overflow: "hidden",
        }}>
            <GlobalStyles />
            <GridBg />
            <div className="noise-overlay" />

            {/* cursor glow */}
            <div style={{
                position: "fixed", pointerEvents: "none", zIndex: 9999,
                width: "300px", height: "300px", borderRadius: "50%",
                background: "radial-gradient(circle, rgba(255,107,53,0.05) 0%, transparent 70%)",
                transform: "translate(-50%, -50%)",
                left: mousePos.x, top: mousePos.y,
            }} />

            <LeftPanel mode="register" />

            {/* RIGHT PANEL */}
            <div style={{
                flex: 1, display: "flex", alignItems: "center",
                justifyContent: "center", padding: "64px 48px",
                position: "relative", zIndex: 1,
            }}>

                {/* SUCCESS STATE */}
                {step === 2 ? (
                    <div className="fade-in" style={{
                        textAlign: "center", display: "flex",
                        flexDirection: "column", alignItems: "center", gap: "24px",
                    }}>
                        <div style={{
                            width: "80px", height: "80px",
                            border: "2px solid #47A248",
                            borderRadius: "50%",
                            display: "flex", alignItems: "center", justifyContent: "center",
                            fontSize: "32px",
                            animation: "fadeIn 0.5s ease",
                        }}>✓</div>
                        <div>
                            <h2 style={{
                                fontFamily: "'Syne', sans-serif", fontSize: "28px",
                                fontWeight: 800, color: "#47A248",
                            }}>Account Created</h2>
                            <p style={{ color: "#444", fontSize: "12px", marginTop: "12px", lineHeight: 1.7 }}>
                                Welcome aboard, {form.name}.<br />
                                Redirecting to your dashboard<span className="blink">_</span>
                            </p>
                        </div>
                    </div>
                ) : (
                    <div className="fade-in" style={{ width: "100%", maxWidth: "440px" }}>

                        {/* header */}
                        <div style={{ marginBottom: "48px" }}>
                            <span className="tag">AUTH / REGISTER</span>
                            <h2 style={{
                                fontFamily: "'Syne', sans-serif", fontSize: "28px",
                                fontWeight: 800, marginTop: "16px", lineHeight: 1.2,
                            }}>
                                Create your<br />account
                            </h2>
                            <p style={{ marginTop: "10px", color: "#444", fontSize: "12px", lineHeight: 1.7 }}>
                                Free forever. Runs locally. No credit card.
                            </p>
                        </div>

                        {/* server error */}
                        {serverError && (
                            <div className="slide-in" style={{
                                background: "#1a0808", border: "1px solid #ff3b3b30",
                                borderLeft: "3px solid #ff3b3b",
                                padding: "14px 16px", marginBottom: "24px",
                                display: "flex", alignItems: "center", gap: "10px",
                            }}>
                                <span style={{ color: "#ff3b3b", fontSize: "14px" }}>✕</span>
                                <span style={{ fontSize: "12px", color: "#ff6b6b" }}>{serverError}</span>
                            </div>
                        )}

                        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
                            <InputField
                                label="Full Name"
                                name="name"
                                value={form.name}
                                onChange={handleChange}
                                error={errors.name}
                                placeholder="Shiva Kumar"
                            />

                            <InputField
                                label="Email Address"
                                name="email"
                                type="email"
                                value={form.email}
                                onChange={handleChange}
                                error={errors.email}
                                placeholder="you@example.com"
                            />

                            <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                                <InputField
                                    label="Password"
                                    name="password"
                                    type="password"
                                    value={form.password}
                                    onChange={handleChange}
                                    error={errors.password}
                                    placeholder="Create a strong password"
                                />
                                <PasswordStrength password={form.password} />
                            </div>

                            <InputField
                                label="Confirm Password"
                                name="confirm"
                                type="password"
                                value={form.confirm}
                                onChange={handleChange}
                                error={errors.confirm}
                                placeholder="Repeat your password"
                            />

                            <button
                                type="submit"
                                className="btn-submit"
                                disabled={isLoading}
                                style={{ marginTop: "8px" }}
                            >
                                {isLoading ? (
                                    <span style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "8px" }}>
                                        <span style={{
                                            width: "12px", height: "12px", border: "2px solid #080808",
                                            borderTopColor: "transparent", borderRadius: "50%",
                                            display: "inline-block",
                                            animation: "spin 0.6s linear infinite",
                                        }} />
                                        CREATING ACCOUNT
                                    </span>
                                ) : "Create Account →"}
                            </button>
                        </form>

                        <div className="divider-line" style={{ margin: "32px 0" }}>OR</div>

                        <p style={{
                            textAlign: "center", fontSize: "12px", color: "#444", lineHeight: 1.8,
                        }}>
                            Already have an account?{" "}
                            <a href="/login" className="switch-link">Sign in →</a>
                        </p>

                        {/* terms */}
                        <p style={{
                            textAlign: "center", fontSize: "10px", color: "#2a2a2a",
                            marginTop: "24px", lineHeight: 1.8, letterSpacing: "0.05em",
                        }}>
                            BY CONTINUING YOU AGREE TO OUR{" "}
                            <span style={{ color: "#333", cursor: "pointer" }}>TERMS</span> AND{" "}
                            <span style={{ color: "#333", cursor: "pointer" }}>PRIVACY POLICY</span>
                        </p>

                        <style>{`
              @keyframes spin { to { transform: rotate(360deg); } }
            `}</style>
                    </div>
                )}
            </div>
        </div>
    );
}
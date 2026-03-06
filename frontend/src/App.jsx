import { useState, useEffect, useRef } from "react";

const NAV_LINKS = ["Features", "How It Works", "Stack", "Get Started"];

const FEATURES = [
    {
        icon: "⬡",
        title: "Instant AI Review",
        desc: "Paste your code and get a detailed review in seconds. Bugs, security issues, and optimizations — all surfaced instantly.",
        tag: "CORE",
    },
    {
        icon: "⬡",
        title: "Review History",
        desc: "Every review is stored and tracked. Watch your code quality score improve over time with trend analytics.",
        tag: "INSIGHTS",
    },
    {
        icon: "⬡",
        title: "Multi-Language",
        desc: "Go, Python, JavaScript, TypeScript, Java — Llama 3 understands them all with deep contextual awareness.",
        tag: "UNIVERSAL",
    },
    {
        icon: "⬡",
        title: "Privacy First",
        desc: "Runs entirely on your infrastructure via Ollama. Your code never leaves your server. Zero cloud exposure.",
        tag: "SECURE",
    },
    {
        icon: "⬡",
        title: "Circuit Protected",
        desc: "Built-in circuit breaker and rate limiting. The system stays resilient even when services are under pressure.",
        tag: "RESILIENT",
    },
    {
        icon: "⬡",
        title: "Team Ready",
        desc: "Multi-user auth with JWT. Shared review dashboards. Built from the ground up for collaborative development.",
        tag: "TEAMS",
    },
];

const STEPS = [
    { num: "01", title: "Authenticate", desc: "Sign up and get your access token via our JWT auth system." },
    { num: "02", title: "Submit Code", desc: "Paste your code snippet through the dashboard or API." },
    { num: "03", title: "LLM Analysis", desc: "Llama 3 via Ollama analyses your code locally on your machine." },
    { num: "04", title: "Get Review", desc: "Receive structured feedback — bugs, security, style, and score." },
];

const STACK = [
    { label: "Go", color: "#00ACD7", role: "Microservices" },
    { label: "React", color: "#61DAFB", role: "Frontend" },
    { label: "MongoDB", color: "#47A248", role: "Database" },
    { label: "Python", color: "#FFD43B", role: "LLM Service" },
    { label: "Ollama", color: "#FF6B35", role: "Local AI" },
    { label: "Docker", color: "#2496ED", role: "Containers" },
    { label: "K8s", color: "#326CE5", role: "Orchestration" },
    { label: "Chi", color: "#E040FB", role: "HTTP Router" },
];

function useTypewriter(texts, speed = 60, pause = 2000) {
    const [displayed, setDisplayed] = useState("");
    const [textIndex, setTextIndex] = useState(0);
    const [charIndex, setCharIndex] = useState(0);
    const [deleting, setDeleting] = useState(false);

    useEffect(() => {
        const current = texts[textIndex];
        if (!deleting && charIndex < current.length) {
            const t = setTimeout(() => setCharIndex((c) => c + 1), speed);
            return () => clearTimeout(t);
        }
        if (!deleting && charIndex === current.length) {
            const t = setTimeout(() => setDeleting(true), pause);
            return () => clearTimeout(t);
        }
        if (deleting && charIndex > 0) {
            const t = setTimeout(() => setCharIndex((c) => c - 1), speed / 2);
            return () => clearTimeout(t);
        }
        if (deleting && charIndex === 0) {
            setDeleting(false);
            setTextIndex((i) => (i + 1) % texts.length);
        }
    }, [charIndex, deleting, textIndex, texts, speed, pause]);

    useEffect(() => {
        setDisplayed(texts[textIndex].slice(0, charIndex));
    }, [charIndex, textIndex, texts]);

    return displayed;
}

function GridBackground() {
    return (
        <div style={{
            position: "fixed", inset: 0, zIndex: 0, pointerEvents: "none",
            backgroundImage: `
        linear-gradient(rgba(255,107,53,0.04) 1px, transparent 1px),
        linear-gradient(90deg, rgba(255,107,53,0.04) 1px, transparent 1px)
      `,
            backgroundSize: "60px 60px",
        }} />
    );
}

function NoiseBg() {
    return (
        <div style={{
            position: "fixed", inset: 0, zIndex: 0, pointerEvents: "none", opacity: 0.025,
            backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='1'/%3E%3C/svg%3E")`,
            backgroundRepeat: "repeat", backgroundSize: "128px 128px",
        }} />
    );
}

export default function HomePage() {
    const [scrolled, setScrolled] = useState(false);
    const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
    const [activeFeature, setActiveFeature] = useState(null);
    const heroRef = useRef(null);

    const typewriter = useTypewriter([
        "Buggy Code.",
        "Security Holes.",
        "Bad Patterns.",
        "Spaghetti Logic.",
        "Tech Debt.",
    ]);

    useEffect(() => {
        const onScroll = () => setScrolled(window.scrollY > 40);
        window.addEventListener("scroll", onScroll);
        return () => window.removeEventListener("scroll", onScroll);
    }, []);

    useEffect(() => {
        const onMove = (e) => setMousePos({ x: e.clientX, y: e.clientY });
        window.addEventListener("mousemove", onMove);
        return () => window.removeEventListener("mousemove", onMove);
    }, []);

    return (
        <div style={{
            minHeight: "100vh", background: "#080808", color: "#f0ece4",
            fontFamily: "'DM Mono', 'Courier New', monospace", position: "relative", overflowX: "hidden",
        }}>
            <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Mono:wght@300;400;500&family=Syne:wght@400;600;700;800&display=swap');

        * { box-sizing: border-box; margin: 0; padding: 0; }

        ::-webkit-scrollbar { width: 4px; }
        ::-webkit-scrollbar-track { background: #080808; }
        ::-webkit-scrollbar-thumb { background: #ff6b35; }

        .nav-link {
          color: #888; text-decoration: none; font-size: 12px;
          letter-spacing: 0.15em; text-transform: uppercase;
          transition: color 0.2s; font-family: 'DM Mono', monospace;
        }
        .nav-link:hover { color: #ff6b35; }

        .btn-primary {
          background: #ff6b35; color: #080808; border: none;
          padding: 14px 32px; font-family: 'DM Mono', monospace;
          font-size: 12px; letter-spacing: 0.15em; text-transform: uppercase;
          cursor: pointer; font-weight: 500;
          transition: all 0.2s; position: relative; overflow: hidden;
          clip-path: polygon(8px 0%, 100% 0%, calc(100% - 8px) 100%, 0% 100%);
        }
        .btn-primary:hover { background: #ff8c5a; transform: translateY(-1px); }

        .btn-ghost {
          background: transparent; color: #f0ece4; border: 1px solid #2a2a2a;
          padding: 14px 32px; font-family: 'DM Mono', monospace;
          font-size: 12px; letter-spacing: 0.15em; text-transform: uppercase;
          cursor: pointer; transition: all 0.2s;
          clip-path: polygon(8px 0%, 100% 0%, calc(100% - 8px) 100%, 0% 100%);
        }
        .btn-ghost:hover { border-color: #ff6b35; color: #ff6b35; }

        .feature-card {
          border: 1px solid #1a1a1a; padding: 32px;
          transition: all 0.3s; position: relative; cursor: default;
          background: #0c0c0c;
        }
        .feature-card:hover {
          border-color: #ff6b35; background: #0f0f0f;
          transform: translateY(-2px);
        }
        .feature-card::before {
          content: ''; position: absolute; top: 0; left: 0;
          right: 0; height: 1px; background: transparent;
          transition: background 0.3s;
        }
        .feature-card:hover::before { background: #ff6b35; }

        .step-num {
          font-family: 'Syne', sans-serif; font-size: 72px;
          font-weight: 800; color: #1a1a1a; line-height: 1;
          transition: color 0.3s;
        }
        .step-item:hover .step-num { color: #2a1a10; }

        .stack-pill {
          display: inline-flex; align-items: center; gap: 10px;
          border: 1px solid #1e1e1e; padding: 12px 20px;
          background: #0c0c0c; transition: all 0.25s;
        }
        .stack-pill:hover { border-color: #333; background: #111; transform: translateY(-2px); }

        .cursor-glow {
          position: fixed; pointer-events: none; z-index: 9999;
          width: 300px; height: 300px; border-radius: 50%;
          background: radial-gradient(circle, rgba(255,107,53,0.06) 0%, transparent 70%);
          transform: translate(-50%, -50%); transition: opacity 0.3s;
        }

        .tag {
          font-size: 9px; letter-spacing: 0.2em; color: #ff6b35;
          border: 1px solid #ff6b3530; padding: 3px 8px;
          font-family: 'DM Mono', monospace;
        }

        .section-label {
          font-size: 10px; letter-spacing: 0.3em; color: #ff6b35;
          text-transform: uppercase; font-family: 'DM Mono', monospace;
          display: flex; align-items: center; gap: 12px;
        }
        .section-label::before {
          content: ''; width: 32px; height: 1px; background: #ff6b35;
        }

        .hero-title {
          font-family: 'Syne', sans-serif;
          font-size: clamp(48px, 7vw, 100px);
          font-weight: 800; line-height: 0.95;
          letter-spacing: -0.02em;
        }

        .code-block {
          background: #0d0d0d; border: 1px solid #1e1e1e;
          padding: 24px; font-size: 12px; line-height: 1.8;
          position: relative; overflow: hidden;
        }
        .code-block::before {
          content: ''; position: absolute; top: 0; left: 0;
          width: 3px; height: 100%; background: #ff6b35;
        }

        .blink { animation: blink 1s step-end infinite; }
        @keyframes blink { 50% { opacity: 0; } }

        .fade-up {
          animation: fadeUp 0.8s ease forwards;
          opacity: 0;
        }
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(24px); }
          to { opacity: 1; transform: translateY(0); }
        }

        .stagger-1 { animation-delay: 0.1s; }
        .stagger-2 { animation-delay: 0.25s; }
        .stagger-3 { animation-delay: 0.4s; }
        .stagger-4 { animation-delay: 0.55s; }

        .divider {
          width: 100%; height: 1px;
          background: linear-gradient(90deg, transparent, #1e1e1e 20%, #1e1e1e 80%, transparent);
        }

        .marquee-track {
          display: flex; gap: 48px; animation: marquee 20s linear infinite;
          white-space: nowrap;
        }
        @keyframes marquee {
          from { transform: translateX(0); }
          to { transform: translateX(-50%); }
        }

        .score-ring {
          width: 80px; height: 80px; border-radius: 50%;
          border: 2px solid #ff6b35; display: flex; align-items: center;
          justify-content: center; font-family: 'Syne', sans-serif;
          font-size: 22px; font-weight: 800; color: #ff6b35;
          position: relative;
        }
        .score-ring::after {
          content: 'SCORE'; position: absolute; bottom: -20px;
          font-size: 8px; letter-spacing: 0.2em; color: #444;
          font-family: 'DM Mono', monospace;
        }
      `}</style>

            {/* cursor glow */}
            <div className="cursor-glow" style={{ left: mousePos.x, top: mousePos.y }} />

            <GridBackground />
            <NoiseBg />

            {/* NAV */}
            <nav style={{
                position: "fixed", top: 0, left: 0, right: 0, zIndex: 100,
                padding: "0 48px", height: "64px",
                display: "flex", alignItems: "center", justifyContent: "space-between",
                background: scrolled ? "rgba(8,8,8,0.95)" : "transparent",
                borderBottom: scrolled ? "1px solid #1a1a1a" : "1px solid transparent",
                backdropFilter: scrolled ? "blur(12px)" : "none",
                transition: "all 0.3s",
            }}>
                <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                    <div style={{
                        width: "28px", height: "28px", background: "#ff6b35",
                        clipPath: "polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)",
                        display: "flex", alignItems: "center", justifyContent: "center",
                    }} />
                    <span style={{
                        fontFamily: "'Syne', sans-serif", fontWeight: 700,
                        fontSize: "15px", letterSpacing: "0.05em",
                    }}>
                        CODEX<span style={{ color: "#ff6b35" }}>AI</span>
                    </span>
                </div>

                <div style={{ display: "flex", gap: "36px", alignItems: "center" }}>
                    {NAV_LINKS.map((l) => (
                        <a key={l} href={`#${l.toLowerCase().replace(" ", "-")}`} className="nav-link">{l}</a>
                    ))}
                </div>

                <button className="btn-primary" style={{ padding: "10px 24px", fontSize: "11px" }}>
                    Launch App →
                </button>
            </nav>

            {/* HERO */}
            <section ref={heroRef} style={{
                minHeight: "100vh", display: "flex", alignItems: "center",
                padding: "120px 48px 80px", position: "relative", zIndex: 1,
                maxWidth: "1400px", margin: "0 auto",
            }}>
                {/* left content */}
                <div style={{ flex: 1, maxWidth: "700px" }}>
                    <div className="section-label fade-up stagger-1" style={{ marginBottom: "32px" }}>
                        AI-Powered Code Review
                    </div>

                    <h1 className="hero-title fade-up stagger-2">
                        <span style={{ color: "#f0ece4" }}>Stop Shipping</span>
                        <br />
                        <span style={{
                            color: "#ff6b35", display: "inline-block",
                            minWidth: "520px",
                        }}>
                            {typewriter}<span className="blink" style={{ color: "#ff6b35" }}>|</span>
                        </span>
                    </h1>

                    <p className="fade-up stagger-3" style={{
                        marginTop: "32px", fontSize: "15px", lineHeight: 1.8,
                        color: "#666", maxWidth: "480px", fontFamily: "'DM Mono', monospace",
                    }}>
                        CodexAI runs locally on your machine via Ollama + Llama 3.
                        No cloud. No data leaks. Just brutally honest code feedback
                        delivered in milliseconds.
                    </p>

                    <div className="fade-up stagger-4" style={{
                        display: "flex", gap: "16px", marginTop: "48px", alignItems: "center",
                    }}>
                        <button className="btn-primary">Start Reviewing →</button>
                        <button className="btn-ghost">View on GitHub</button>
                    </div>

                    <div className="fade-up stagger-4" style={{
                        display: "flex", gap: "40px", marginTop: "56px",
                        borderTop: "1px solid #1a1a1a", paddingTop: "32px",
                    }}>
                        {[["100%", "Private"], ["< 3s", "Response"], ["∞", "History"]].map(([val, label]) => (
                            <div key={label}>
                                <div style={{
                                    fontFamily: "'Syne', sans-serif", fontSize: "28px",
                                    fontWeight: 800, color: "#ff6b35",
                                }}>{val}</div>
                                <div style={{ fontSize: "11px", color: "#444", letterSpacing: "0.15em", marginTop: "4px" }}>{label}</div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* right — mock review card */}
                <div className="fade-up stagger-3" style={{
                    flex: 1, display: "flex", justifyContent: "flex-end",
                    paddingLeft: "80px",
                }}>
                    <div style={{
                        width: "420px", border: "1px solid #1e1e1e",
                        background: "#0a0a0a", position: "relative",
                    }}>
                        {/* card header */}
                        <div style={{
                            borderBottom: "1px solid #1a1a1a", padding: "16px 24px",
                            display: "flex", alignItems: "center", justifyContent: "space-between",
                        }}>
                            <div style={{ display: "flex", gap: "8px" }}>
                                {["#ff5f57", "#ffbd2e", "#28ca41"].map((c) => (
                                    <div key={c} style={{ width: "10px", height: "10px", borderRadius: "50%", background: c }} />
                                ))}
                            </div>
                            <span style={{ fontSize: "10px", color: "#444", letterSpacing: "0.1em" }}>review.go</span>
                            <div className="score-ring">8.4</div>
                        </div>

                        {/* code */}
                        <div className="code-block" style={{ margin: "24px", marginBottom: "0" }}>
                            <div style={{ color: "#555", fontSize: "10px", marginBottom: "12px", letterSpacing: "0.1em" }}>// submitted code</div>
                            {[
                                { t: "func", c: "#ff6b35" },
                                { t: " handleRequest(w http.ResponseWriter,", c: "#f0ece4" },
                                { t: "\n  r *http.Request) {", c: "#f0ece4" },
                                { t: "\n  data, _ := ioutil.ReadAll(r.Body)", c: "#888" },
                                { t: "\n  // process data...", c: "#444" },
                                { t: "\n}", c: "#f0ece4" },
                            ].map((s, i) => (
                                <span key={i} style={{ color: s.c, whiteSpace: "pre" }}>{s.t}</span>
                            ))}
                        </div>

                        {/* issues */}
                        <div style={{ padding: "24px", display: "flex", flexDirection: "column", gap: "12px" }}>
                            {[
                                { type: "🔴 BUG", text: "Error from ReadAll ignored", detail: "line 3" },
                                { type: "🟡 WARN", text: "ioutil deprecated in Go 1.16+", detail: "line 3" },
                                { type: "🟢 OK", text: "Handler signature correct", detail: "line 1" },
                            ].map((issue) => (
                                <div key={issue.type} style={{
                                    display: "flex", alignItems: "center", justifyContent: "space-between",
                                    padding: "10px 14px", background: "#0d0d0d",
                                    border: "1px solid #161616", fontSize: "11px",
                                }}>
                                    <span style={{ color: "#888" }}>{issue.type}</span>
                                    <span style={{ color: "#f0ece4", flex: 1, margin: "0 12px" }}>{issue.text}</span>
                                    <span style={{ color: "#444" }}>{issue.detail}</span>
                                </div>
                            ))}
                        </div>

                        {/* decorative corner */}
                        <div style={{
                            position: "absolute", bottom: 0, right: 0,
                            width: "40px", height: "40px",
                            borderTop: "1px solid #ff6b35", borderLeft: "1px solid #ff6b35",
                            transform: "translate(1px, 1px)",
                        }} />
                    </div>
                </div>
            </section>

            <div className="divider" />

            {/* MARQUEE */}
            <div style={{ overflow: "hidden", padding: "24px 0", borderBottom: "1px solid #111" }}>
                <div style={{ display: "flex" }}>
                    <div className="marquee-track">
                        {[...Array(2)].map((_, i) =>
                            ["GO MICROSERVICES", "CIRCUIT BREAKER", "RATE LIMITING", "LLAMA 3", "OLLAMA", "JWT AUTH", "KUBERNETES", "MONGODB", "REACT", "CHI ROUTER", "DOCKER"].map((t) => (
                                <span key={`${i}-${t}`} style={{
                                    fontSize: "11px", letterSpacing: "0.25em", color: "#2a2a2a",
                                    fontWeight: 500,
                                }}>
                                    {t} <span style={{ color: "#ff6b35", margin: "0 24px" }}>✦</span>
                                </span>
                            ))
                        )}
                    </div>
                </div>
            </div>

            {/* FEATURES */}
            <section id="features" style={{
                padding: "120px 48px", maxWidth: "1400px", margin: "0 auto", position: "relative", zIndex: 1,
            }}>
                <div style={{ marginBottom: "64px" }}>
                    <div className="section-label" style={{ marginBottom: "20px" }}>What It Does</div>
                    <h2 style={{
                        fontFamily: "'Syne', sans-serif", fontSize: "clamp(32px, 4vw, 52px)",
                        fontWeight: 800, lineHeight: 1.1, maxWidth: "500px",
                    }}>
                        Everything a senior dev would catch.
                    </h2>
                </div>

                <div style={{
                    display: "grid", gridTemplateColumns: "repeat(3, 1fr)",
                    gap: "1px", background: "#111",
                }}>
                    {FEATURES.map((f, i) => (
                        <div
                            key={f.title}
                            className="feature-card"
                            onMouseEnter={() => setActiveFeature(i)}
                            onMouseLeave={() => setActiveFeature(null)}
                        >
                            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "24px" }}>
                                <span style={{ fontSize: "24px", color: "#ff6b35" }}>{f.icon}</span>
                                <span className="tag">{f.tag}</span>
                            </div>
                            <h3 style={{
                                fontFamily: "'Syne', sans-serif", fontSize: "18px",
                                fontWeight: 700, marginBottom: "12px",
                                color: activeFeature === i ? "#ff6b35" : "#f0ece4",
                                transition: "color 0.3s",
                            }}>{f.title}</h3>
                            <p style={{ fontSize: "13px", color: "#555", lineHeight: 1.7 }}>{f.desc}</p>
                        </div>
                    ))}
                </div>
            </section>

            <div className="divider" />

            {/* HOW IT WORKS */}
            <section id="how-it-works" style={{
                padding: "120px 48px", maxWidth: "1400px", margin: "0 auto", position: "relative", zIndex: 1,
            }}>
                <div style={{ display: "flex", gap: "120px", alignItems: "flex-start" }}>
                    <div style={{ flex: "0 0 320px" }}>
                        <div className="section-label" style={{ marginBottom: "20px" }}>The Process</div>
                        <h2 style={{
                            fontFamily: "'Syne', sans-serif", fontSize: "clamp(32px, 4vw, 48px)",
                            fontWeight: 800, lineHeight: 1.1,
                        }}>
                            Four steps to better code.
                        </h2>
                        <p style={{ marginTop: "24px", color: "#555", fontSize: "13px", lineHeight: 1.8 }}>
                            From submission to review in under 3 seconds. Everything runs locally — no external API calls, no rate limits, no subscription fees.
                        </p>
                    </div>

                    <div style={{ flex: 1, display: "flex", flexDirection: "column" }}>
                        {STEPS.map((step, i) => (
                            <div key={step.num} className="step-item" style={{
                                display: "flex", gap: "40px", alignItems: "flex-start",
                                padding: "32px 0",
                                borderBottom: i < STEPS.length - 1 ? "1px solid #111" : "none",
                            }}>
                                <span className="step-num">{step.num}</span>
                                <div style={{ paddingTop: "16px" }}>
                                    <h3 style={{
                                        fontFamily: "'Syne', sans-serif", fontSize: "20px",
                                        fontWeight: 700, marginBottom: "8px",
                                    }}>{step.title}</h3>
                                    <p style={{ color: "#555", fontSize: "13px", lineHeight: 1.7 }}>{step.desc}</p>
                                </div>
                                <div style={{
                                    marginLeft: "auto", paddingTop: "16px",
                                    width: "32px", height: "32px", border: "1px solid #1e1e1e",
                                    display: "flex", alignItems: "center", justifyContent: "center",
                                    fontSize: "12px", color: "#ff6b35", flexShrink: 0,
                                }}>→</div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            <div className="divider" />

            {/* STACK */}
            <section id="stack" style={{
                padding: "120px 48px", maxWidth: "1400px", margin: "0 auto", position: "relative", zIndex: 1,
            }}>
                <div style={{ marginBottom: "64px" }}>
                    <div className="section-label" style={{ marginBottom: "20px" }}>Built With</div>
                    <h2 style={{
                        fontFamily: "'Syne', sans-serif", fontSize: "clamp(32px, 4vw, 48px)",
                        fontWeight: 800, lineHeight: 1.1,
                    }}>
                        Production-grade stack.<br />No compromises.
                    </h2>
                </div>

                <div style={{ display: "flex", flexWrap: "wrap", gap: "12px" }}>
                    {STACK.map((s) => (
                        <div key={s.label} className="stack-pill">
                            <div style={{ width: "8px", height: "8px", borderRadius: "50%", background: s.color }} />
                            <span style={{
                                fontFamily: "'Syne', sans-serif", fontWeight: 700,
                                fontSize: "14px", color: "#f0ece4",
                            }}>{s.label}</span>
                            <span style={{ fontSize: "11px", color: "#444", letterSpacing: "0.1em" }}>{s.role}</span>
                        </div>
                    ))}
                </div>

                {/* architecture diagram */}
                <div style={{
                    marginTop: "64px", border: "1px solid #1a1a1a", padding: "40px",
                    background: "#0a0a0a", position: "relative",
                }}>
                    <div style={{
                        position: "absolute", top: "16px", left: "24px",
                        fontSize: "10px", color: "#333", letterSpacing: "0.2em",
                    }}>ARCHITECTURE</div>

                    <div style={{
                        display: "flex", alignItems: "center", justifyContent: "center",
                        gap: "0", marginTop: "16px", flexWrap: "wrap",
                    }}>
                        {[
                            { label: "React", sub: ":5173", color: "#61DAFB" },
                            null,
                            { label: "API Gateway", sub: ":8000", color: "#ff6b35" },
                            null,
                            { label: "Auth Service", sub: ":8080", color: "#00ACD7" },
                        ].map((item, i) =>
                            item === null ? (
                                <div key={i} style={{
                                    display: "flex", alignItems: "center", color: "#2a2a2a",
                                    fontSize: "18px", padding: "0 12px",
                                }}>──→</div>
                            ) : (
                                <div key={item.label} style={{
                                    border: `1px solid ${item.color}30`,
                                    padding: "16px 24px", background: "#0d0d0d",
                                    textAlign: "center", minWidth: "140px",
                                }}>
                                    <div style={{
                                        fontFamily: "'Syne', sans-serif", fontWeight: 700,
                                        fontSize: "13px", color: item.color,
                                    }}>{item.label}</div>
                                    <div style={{ fontSize: "10px", color: "#333", marginTop: "4px" }}>{item.sub}</div>
                                </div>
                            )
                        )}
                    </div>

                    <div style={{
                        display: "flex", justifyContent: "center", marginTop: "0",
                        position: "relative",
                    }}>
                        <div style={{
                            width: "1px", height: "32px", background: "#1e1e1e",
                            margin: "0 auto",
                        }} />
                    </div>

                    <div style={{ display: "flex", justifyContent: "center", gap: "12px" }}>
                        {[
                            { label: "Review Service", sub: ":8081", color: "#47A248" },
                            { label: "LLM Service", sub: ":8082", color: "#FFD43B" },
                            { label: "MongoDB", sub: ":27017", color: "#47A248" },
                        ].map((item) => (
                            <div key={item.label} style={{
                                border: `1px solid ${item.color}30`,
                                padding: "16px 24px", background: "#0d0d0d",
                                textAlign: "center", minWidth: "140px",
                            }}>
                                <div style={{
                                    fontFamily: "'Syne', sans-serif", fontWeight: 700,
                                    fontSize: "13px", color: item.color,
                                }}>{item.label}</div>
                                <div style={{ fontSize: "10px", color: "#333", marginTop: "4px" }}>{item.sub}</div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            <div className="divider" />

            {/* CTA */}
            <section id="get-started" style={{
                padding: "120px 48px", maxWidth: "1400px", margin: "0 auto",
                position: "relative", zIndex: 1, textAlign: "center",
            }}>
                <div style={{
                    border: "1px solid #1a1a1a", padding: "80px 48px",
                    background: "#0a0a0a", position: "relative", overflow: "hidden",
                }}>
                    {/* bg accent */}
                    <div style={{
                        position: "absolute", top: "50%", left: "50%",
                        transform: "translate(-50%, -50%)",
                        width: "600px", height: "600px", borderRadius: "50%",
                        background: "radial-gradient(circle, rgba(255,107,53,0.04) 0%, transparent 70%)",
                        pointerEvents: "none",
                    }} />

                    <div className="section-label" style={{ justifyContent: "center", marginBottom: "24px" }}>
                        Get Started
                    </div>
                    <h2 style={{
                        fontFamily: "'Syne', sans-serif",
                        fontSize: "clamp(36px, 5vw, 64px)",
                        fontWeight: 800, lineHeight: 1.05, maxWidth: "600px", margin: "0 auto",
                    }}>
                        Your codebase deserves an honest review.
                    </h2>
                    <p style={{
                        marginTop: "24px", color: "#555", fontSize: "14px",
                        lineHeight: 1.8, maxWidth: "400px", margin: "24px auto 0",
                    }}>
                        No sign-up friction. No API keys. Just clone, run with Docker, and start reviewing.
                    </p>

                    <div style={{
                        display: "flex", gap: "16px", justifyContent: "center",
                        marginTop: "48px", flexWrap: "wrap",
                    }}>
                        <button className="btn-primary" style={{ fontSize: "13px", padding: "16px 40px" }}>
                            Launch App →
                        </button>
                        <button className="btn-ghost" style={{ fontSize: "13px", padding: "16px 40px" }}>
                            Read the Docs
                        </button>
                    </div>

                    <div className="code-block" style={{
                        maxWidth: "480px", margin: "48px auto 0", textAlign: "left",
                    }}>
                        <span style={{ color: "#444" }}>$ </span>
                        <span style={{ color: "#ff6b35" }}>git clone</span>
                        <span style={{ color: "#f0ece4" }}> ai-code-reviewer</span>
                        <br />
                        <span style={{ color: "#444" }}>$ </span>
                        <span style={{ color: "#ff6b35" }}>docker compose up</span>
                        <br />
                        <span style={{ color: "#444" }}>$ </span>
                        <span style={{ color: "#47A248" }}>✓ ready on localhost:8000</span>
                    </div>
                </div>
            </section>

            {/* FOOTER */}
            <footer style={{
                borderTop: "1px solid #111", padding: "32px 48px",
                display: "flex", justifyContent: "space-between", alignItems: "center",
                position: "relative", zIndex: 1,
            }}>
                <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                    <div style={{
                        width: "20px", height: "20px", background: "#ff6b35",
                        clipPath: "polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)",
                    }} />
                    <span style={{
                        fontFamily: "'Syne', sans-serif", fontWeight: 700,
                        fontSize: "13px",
                    }}>CODEX<span style={{ color: "#ff6b35" }}>AI</span></span>
                </div>
                <span style={{ fontSize: "11px", color: "#333", letterSpacing: "0.1em" }}>
                    BUILT BY SHIVA KUMAR — 2026
                </span>
                <div style={{ display: "flex", gap: "24px" }}>
                    {["GitHub", "Docs", "API"].map((l) => (
                        <a key={l} href="#" className="nav-link" style={{ fontSize: "11px" }}>{l}</a>
                    ))}
                </div>
            </footer>
        </div>
    );
}
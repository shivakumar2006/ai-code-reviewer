import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";

// ─────────────────────────────────────────
// SHARED BG
// ─────────────────────────────────────────

function GridBackground() {
    return (
        <div style={{
            position: "fixed", inset: 0, zIndex: 0, pointerEvents: "none",
            backgroundImage: `linear-gradient(rgba(255,107,53,0.04) 1px, transparent 1px),
                              linear-gradient(90deg, rgba(255,107,53,0.04) 1px, transparent 1px)`,
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

// ─────────────────────────────────────────
// EDITABLE FIELD
// ─────────────────────────────────────────

function EditableField({ label, value, onChange, type = "text", placeholder, disabled = false, hint }) {
    const [focused, setFocused] = useState(false);
    return (
        <div style={{ display: "flex", flexDirection: "column", gap: "7px" }}>
            <label style={{
                fontSize: "9px", letterSpacing: "0.25em", color: "#333",
                textTransform: "uppercase", fontFamily: "'DM Mono', monospace",
            }}>{label}</label>
            <input
                type={type}
                value={value}
                onChange={(e) => onChange(e.target.value)}
                onFocus={() => setFocused(true)}
                onBlur={() => setFocused(false)}
                placeholder={placeholder}
                disabled={disabled}
                style={{
                    background: disabled ? "#070707" : focused ? "#0f0f0f" : "#0a0a0a",
                    border: "1px solid #1a1a1a",
                    borderLeft: `3px solid ${disabled ? "#111" : focused ? "#ff6b35" : "#1a1a1a"}`,
                    color: disabled ? "#2a2a2a" : "#f0ece4",
                    padding: "12px 14px",
                    fontFamily: "'DM Mono', monospace", fontSize: "13px",
                    outline: "none", transition: "all 0.2s",
                    width: "100%", cursor: disabled ? "not-allowed" : "text",
                }}
            />
            {hint && (
                <div style={{ fontSize: "9px", color: "#1e1e1e", fontFamily: "'DM Mono', monospace" }}>
                    ↳ {hint}
                </div>
            )}
        </div>
    );
}

// ─────────────────────────────────────────
// STAT CARD
// ─────────────────────────────────────────

function StatCard({ label, value, accent, sub }) {
    return (
        <div style={{
            background: "#0a0a0a", border: "1px solid #141414",
            padding: "20px 22px", position: "relative", overflow: "hidden",
        }}>
            {accent && (
                <div style={{
                    position: "absolute", top: 0, left: 0, right: 0,
                    height: "2px",
                    background: "linear-gradient(90deg, #ff6b35, transparent)",
                }} />
            )}
            <div style={{
                fontSize: "9px", letterSpacing: "0.2em", color: "#2a2a2a",
                fontFamily: "'DM Mono', monospace", marginBottom: "10px",
            }}>{label}</div>
            <div style={{
                fontFamily: "'Syne', sans-serif",
                fontSize: "30px", fontWeight: 800,
                color: accent ? "#ff6b35" : "#f0ece4", lineHeight: 1,
            }}>{value}</div>
            {sub && (
                <div style={{ fontSize: "10px", color: "#222", marginTop: "6px" }}>{sub}</div>
            )}
        </div>
    );
}

// ─────────────────────────────────────────
// AVATAR COMPONENT
// ─────────────────────────────────────────

function Avatar({ name, size = 80 }) {
    const initials = name
        ? name.split(" ").map(w => w[0]).join("").toUpperCase().slice(0, 2)
        : "??";

    // generate consistent color from name
    const hue = name
        ? name.split("").reduce((acc, c) => acc + c.charCodeAt(0), 0) % 360
        : 20;

    return (
        <div style={{
            width: size, height: size, flexShrink: 0,
            background: `hsl(${hue}, 60%, 8%)`,
            border: `1px solid hsl(${hue}, 60%, 18%)`,
            display: "flex", alignItems: "center", justifyContent: "center",
            fontFamily: "'Syne', sans-serif", fontWeight: 800,
            fontSize: size * 0.3, color: `hsl(${hue}, 70%, 60%)`,
            position: "relative", userSelect: "none",
        }}>
            {initials}
            {/* online dot */}
            <div style={{
                position: "absolute", bottom: 3, right: 3,
                width: 10, height: 10, borderRadius: "50%",
                background: "#47A248", border: "2px solid #080808",
            }} />
        </div>
    );
}

// ─────────────────────────────────────────
// SAVE STATUS BANNER
// ─────────────────────────────────────────

function SaveBanner({ status, message }) {
    if (!status) return null;
    const ok = status === "success";
    return (
        <div style={{
            display: "flex", alignItems: "center", gap: "12px",
            padding: "12px 16px",
            background: ok ? "#061209" : "#120606",
            border: `1px solid ${ok ? "#47A24825" : "#ff3b3b25"}`,
            borderLeft: `3px solid ${ok ? "#47A248" : "#ff4444"}`,
            color: ok ? "#47A248" : "#ff7070",
            fontSize: "12px", fontFamily: "'DM Mono', monospace",
            animation: "slideIn 0.25s ease",
        }}>
            <span style={{
                width: "18px", height: "18px", borderRadius: "50%",
                background: ok ? "#47A24818" : "#ff444418",
                border: `1px solid ${ok ? "#47A248" : "#ff4444"}`,
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: "10px", flexShrink: 0,
            }}>{ok ? "✓" : "✕"}</span>
            {message}
        </div>
    );
}

// ─────────────────────────────────────────
// ACTIVITY BAR (last 12 weeks mock)
// ─────────────────────────────────────────

function ActivityGrid({ reviews = [] }) {
    // generate 84 days of mock data
    const days = Array.from({ length: 84 }, (_, i) => {
        const count = Math.random() > 0.65 ? Math.floor(Math.random() * 4) + 1 : 0;
        return count;
    });

    const getColor = (count) => {
        if (count === 0) return "#0f0f0f";
        if (count === 1) return "#ff6b3530";
        if (count === 2) return "#ff6b3560";
        if (count >= 3) return "#ff6b35";
        return "#0f0f0f";
    };

    return (
        <div>
            <div style={{
                fontSize: "9px", letterSpacing: "0.2em", color: "#2a2a2a",
                fontFamily: "'DM Mono', monospace", marginBottom: "12px",
            }}>REVIEW ACTIVITY — LAST 12 WEEKS</div>
            <div style={{
                display: "grid",
                gridTemplateColumns: "repeat(12, 1fr)",
                gap: "3px",
            }}>
                {Array.from({ length: 12 }, (_, week) => (
                    <div key={week} style={{ display: "flex", flexDirection: "column", gap: "3px" }}>
                        {Array.from({ length: 7 }, (_, day) => {
                            const count = days[week * 7 + day];
                            return (
                                <div
                                    key={day}
                                    title={`${count} review${count !== 1 ? "s" : ""}`}
                                    style={{
                                        width: "100%", aspectRatio: "1",
                                        background: getColor(count),
                                        border: `1px solid ${count > 0 ? "#ff6b3520" : "#0d0d0d"}`,
                                        transition: "transform 0.15s",
                                        cursor: "default",
                                    }}
                                    onMouseEnter={(e) => e.currentTarget.style.transform = "scale(1.4)"}
                                    onMouseLeave={(e) => e.currentTarget.style.transform = "scale(1)"}
                                />
                            );
                        })}
                    </div>
                ))}
            </div>
            <div style={{
                display: "flex", justifyContent: "flex-end",
                gap: "6px", marginTop: "8px", alignItems: "center",
            }}>
                <span style={{ fontSize: "9px", color: "#222", fontFamily: "'DM Mono', monospace" }}>LESS</span>
                {[0, 1, 2, 3].map(n => (
                    <div key={n} style={{
                        width: "10px", height: "10px",
                        background: getColor(n),
                        border: `1px solid ${n > 0 ? "#ff6b3520" : "#111"}`,
                    }} />
                ))}
                <span style={{ fontSize: "9px", color: "#222", fontFamily: "'DM Mono', monospace" }}>MORE</span>
            </div>
        </div>
    );
}

// ─────────────────────────────────────────
// SCORE HISTORY SPARKLINE
// ─────────────────────────────────────────

function ScoreSparkline({ scores = [5.2, 6.4, 6.1, 7.8, 7.2, 8.4, 9.2, 8.8, 9.1, 9.4] }) {
    const max = 10, min = 0;
    const h = 48, w = 100;
    const pts = scores.map((s, i) => {
        const x = (i / (scores.length - 1)) * w;
        const y = h - ((s - min) / (max - min)) * h;
        return `${x},${y}`;
    }).join(" ");

    const lastScore = scores[scores.length - 1];
    const prevScore = scores[scores.length - 2];
    const delta = lastScore - prevScore;

    return (
        <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
            <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`} style={{ overflow: "visible" }}>
                <defs>
                    <linearGradient id="sparkGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#ff6b35" stopOpacity="0.3" />
                        <stop offset="100%" stopColor="#ff6b35" stopOpacity="0" />
                    </linearGradient>
                </defs>
                <polyline
                    points={pts}
                    fill="none"
                    stroke="#ff6b35"
                    strokeWidth="1.5"
                    strokeLinejoin="round"
                    strokeLinecap="round"
                />
                {/* last dot */}
                <circle
                    cx={(scores.length - 1) / (scores.length - 1) * w}
                    cy={h - ((lastScore - min) / (max - min)) * h}
                    r="3" fill="#ff6b35"
                />
            </svg>
            <div>
                <div style={{
                    fontFamily: "'Syne', sans-serif", fontSize: "24px",
                    fontWeight: 800, color: "#f0ece4", lineHeight: 1,
                }}>{lastScore.toFixed(1)}</div>
                <div style={{
                    fontSize: "10px", color: delta >= 0 ? "#47A248" : "#ff4444",
                    fontFamily: "'DM Mono', monospace", marginTop: "3px",
                }}>
                    {delta >= 0 ? "↑" : "↓"} {Math.abs(delta).toFixed(1)} vs prev
                </div>
            </div>
        </div>
    );
}

// ─────────────────────────────────────────
// MAIN PAGE
// ─────────────────────────────────────────

export default function UserProfilePage() {
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const user = useSelector(s => s.auth.user);

    const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
    const [activeTab, setActiveTab] = useState("profile");
    const [saving, setSaving] = useState(false);
    const [saveStatus, setSaveStatus] = useState(null);
    const [saveMsg, setSaveMsg] = useState("");
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const [deleteInput, setDeleteInput] = useState("");

    // form fields — pre-filled from Redux auth state
    const [name, setName] = useState(user?.name || "");
    const [email, setEmail] = useState(user?.email || "");
    const [username, setUsername] = useState(user?.username || user?.name?.toLowerCase().replace(/\s/g, "_") || "");
    const [bio, setBio] = useState(user?.bio || "");
    const [website, setWebsite] = useState(user?.website || "");
    const [location, setLocation] = useState(user?.location || "");
    const [company, setCompany] = useState(user?.company || "");

    // password change
    const [currentPwd, setCurrentPwd] = useState("");
    const [newPwd, setNewPwd] = useState("");
    const [confirmPwd, setConfirmPwd] = useState("");
    const [showPwd, setShowPwd] = useState(false);
    const [pwdError, setPwdError] = useState("");

    // mock stats
    const joinDate = user?.created_at
        ? new Date(user.created_at).toLocaleDateString("en-US", { month: "long", year: "numeric" })
        : "March 2026";

    const STATS = [
        { label: "TOTAL REVIEWS", value: "24", accent: true, sub: "all time" },
        { label: "AVG SCORE", value: "7.8", sub: "last 30 days" },
        { label: "ISSUES CAUGHT", value: "137", sub: "across all reviews" },
        { label: "STREAK", value: "6d", sub: "current streak" },
    ];

    const TABS = [
        { id: "profile", label: "Profile" },
        { id: "security", label: "Security" },
        { id: "activity", label: "Activity" },
        { id: "danger", label: "Danger Zone" },
    ];

    useEffect(() => {
        const fn = (e) => setMousePos({ x: e.clientX, y: e.clientY });
        window.addEventListener("mousemove", fn);
        return () => window.removeEventListener("mousemove", fn);
    }, []);

    const isDirty = name !== (user?.name || "") ||
        bio !== (user?.bio || "") ||
        website !== (user?.website || "") ||
        location !== (user?.location || "") ||
        company !== (user?.company || "");

    const handleSaveProfile = async () => {
        setSaving(true);
        setSaveStatus(null);
        // TODO: dispatch updateProfile thunk
        await new Promise(r => setTimeout(r, 700));
        setSaving(false);
        setSaveStatus("success");
        setSaveMsg("Profile updated successfully");
        setTimeout(() => setSaveStatus(null), 3000);
    };

    const handleChangePassword = async () => {
        setPwdError("");
        if (!currentPwd) { setPwdError("Enter your current password"); return; }
        if (newPwd.length < 8) { setPwdError("New password must be at least 8 characters"); return; }
        if (newPwd !== confirmPwd) { setPwdError("Passwords don't match"); return; }

        setSaving(true);
        // TODO: dispatch changePassword thunk
        await new Promise(r => setTimeout(r, 700));
        setSaving(false);
        setSaveStatus("success");
        setSaveMsg("Password changed successfully");
        setCurrentPwd(""); setNewPwd(""); setConfirmPwd("");
        setTimeout(() => setSaveStatus(null), 3000);
    };

    // ─────────────────────────────────────
    return (
        <div style={{
            minHeight: "100vh", background: "#080808", color: "#f0ece4",
            fontFamily: "'DM Mono', 'Courier New', monospace",
            position: "relative", overflowX: "hidden",
        }}>
            <style>{`
                @import url('https://fonts.googleapis.com/css2?family=DM+Mono:wght@300;400;500&family=Syne:wght@400;600;700;800&display=swap');
                * { box-sizing: border-box; margin: 0; padding: 0; }
                ::-webkit-scrollbar { width: 4px; }
                ::-webkit-scrollbar-track { background: #080808; }
                ::-webkit-scrollbar-thumb { background: #ff6b35; }
                ::placeholder { color: #222; }

                .nav-link {
                    color: #444; font-size: 11px; letter-spacing: 0.15em;
                    text-transform: uppercase; transition: color 0.2s;
                    font-family: 'DM Mono', monospace; cursor: pointer;
                }
                .nav-link:hover { color: #ff6b35; }

                .tab-btn {
                    background: none; border: none;
                    border-bottom: 2px solid transparent;
                    color: #333; padding: 13px 0; cursor: pointer;
                    font-family: 'DM Mono', monospace; font-size: 11px;
                    letter-spacing: 0.15em; text-transform: uppercase;
                    transition: all 0.2s; white-space: nowrap;
                }
                .tab-btn:hover { color: #666; }
                .tab-btn.active { color: #ff6b35; border-bottom-color: #ff6b35; }
                .tab-btn.danger { color: #3a1010; }
                .tab-btn.danger:hover { color: #ff4444; }
                .tab-btn.danger.active { color: #ff4444; border-bottom-color: #ff4444; }

                .btn-primary {
                    background: #ff6b35; border: none;
                    color: #080808; padding: 11px 26px;
                    cursor: pointer; font-family: 'DM Mono', monospace;
                    font-size: 10px; letter-spacing: 0.15em; font-weight: 500;
                    transition: all 0.2s;
                    clip-path: polygon(7px 0%, 100% 0%, calc(100% - 7px) 100%, 0% 100%);
                }
                .btn-primary:hover { background: #ff8c5a; }
                .btn-primary:disabled { background: #1a1a1a; color: #333; cursor: not-allowed; }

                .btn-ghost {
                    background: none; border: 1px solid #222;
                    color: #555; padding: 11px 22px;
                    cursor: pointer; font-family: 'DM Mono', monospace;
                    font-size: 10px; letter-spacing: 0.15em; transition: all 0.2s;
                }
                .btn-ghost:hover { border-color: #ff6b35; color: #ff6b35; }

                @keyframes fadeUp {
                    from { opacity: 0; transform: translateY(12px); }
                    to   { opacity: 1; transform: translateY(0); }
                }
                @keyframes slideIn {
                    from { opacity: 0; transform: translateX(-8px); }
                    to   { opacity: 1; transform: translateX(0); }
                }
                @keyframes pulse { 0%,100% { opacity: 1; } 50% { opacity: 0.4; } }

                .fu { animation: fadeUp 0.4s ease forwards; }
                .s1 { animation-delay: 0.04s; opacity: 0; }
                .s2 { animation-delay: 0.12s; opacity: 0; }
                .s3 { animation-delay: 0.22s; opacity: 0; }
            `}</style>

            {/* cursor glow */}
            <div style={{
                position: "fixed", pointerEvents: "none", zIndex: 9999,
                width: "280px", height: "280px", borderRadius: "50%",
                background: "radial-gradient(circle, rgba(255,107,53,0.05) 0%, transparent 70%)",
                transform: "translate(-50%, -50%)",
                left: mousePos.x, top: mousePos.y,
                transition: "left 0.06s, top 0.06s",
            }} />

            <GridBackground />
            <NoiseBg />

            {/* ── NAV ── */}
            <nav style={{
                position: "fixed", top: 0, left: 0, right: 0, zIndex: 100,
                padding: "0 48px", height: "64px",
                display: "flex", alignItems: "center", justifyContent: "space-between",
                background: "rgba(8,8,8,0.96)", borderBottom: "1px solid #111",
                backdropFilter: "blur(14px)",
            }}>
                <div onClick={() => navigate("/")} style={{
                    display: "flex", alignItems: "center", gap: "10px", cursor: "pointer",
                }}>
                    <div style={{
                        width: "24px", height: "24px", background: "#ff6b35",
                        clipPath: "polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)",
                    }} />
                    <span style={{
                        fontFamily: "'Syne', sans-serif", fontWeight: 700,
                        fontSize: "14px", letterSpacing: "0.05em",
                    }}>CODEX<span style={{ color: "#ff6b35" }}>AI</span></span>
                </div>

                <div style={{ display: "flex", gap: "32px" }}>
                    <span className="nav-link" onClick={() => navigate("/dashboard")}>Dashboard</span>
                    <span className="nav-link" onClick={() => navigate("/settings")}>Settings</span>
                    <span style={{ color: "#ff6b35", fontSize: "11px", letterSpacing: "0.15em" }}>Profile</span>
                </div>

                <button
                    onClick={() => navigate("/dashboard")}
                    className="btn-ghost"
                    style={{ padding: "8px 18px", fontSize: "10px" }}
                >← BACK</button>
            </nav>

            {/* ── MAIN ── */}
            <main style={{
                maxWidth: "1100px", margin: "0 auto",
                padding: "96px 48px 80px",
                position: "relative", zIndex: 1,
            }}>

                {/* ── HERO CARD ── */}
                <div className="fu s1" style={{
                    border: "1px solid #161616", background: "#0a0a0a",
                    padding: "36px 40px", marginBottom: "32px",
                    position: "relative", overflow: "hidden",
                    display: "flex", alignItems: "center", gap: "32px",
                }}>
                    {/* bg accent glow */}
                    <div style={{
                        position: "absolute", top: "-60px", right: "-60px",
                        width: "300px", height: "300px", borderRadius: "50%",
                        background: "radial-gradient(circle, rgba(255,107,53,0.04) 0%, transparent 70%)",
                        pointerEvents: "none",
                    }} />

                    {/* top-left accent line */}
                    <div style={{
                        position: "absolute", top: 0, left: 0, right: 0,
                        height: "2px",
                        background: "linear-gradient(90deg, #ff6b35, #ff6b3540, transparent)",
                    }} />

                    {/* avatar */}
                    <Avatar name={name || user?.name} size={88} />

                    {/* info */}
                    <div style={{ flex: 1 }}>
                        <div style={{
                            fontFamily: "'Syne', sans-serif", fontWeight: 800,
                            fontSize: "clamp(20px, 3vw, 30px)", lineHeight: 1.1,
                            marginBottom: "6px",
                        }}>
                            {name || user?.name || "Anonymous"}
                        </div>

                        <div style={{
                            fontSize: "12px", color: "#444",
                            fontFamily: "'DM Mono', monospace", marginBottom: "12px",
                        }}>
                            {email || user?.email}
                        </div>

                        <div style={{ display: "flex", flexWrap: "wrap", gap: "10px" }}>
                            {username && (
                                <div style={{
                                    display: "flex", alignItems: "center", gap: "6px",
                                    fontSize: "10px", color: "#333",
                                    fontFamily: "'DM Mono', monospace",
                                }}>
                                    <span style={{ color: "#1e1e1e" }}>@</span>{username}
                                </div>
                            )}
                            {location && (
                                <div style={{
                                    display: "flex", alignItems: "center", gap: "6px",
                                    fontSize: "10px", color: "#333",
                                }}>
                                    <span>◎</span> {location}
                                </div>
                            )}
                            {company && (
                                <div style={{
                                    display: "flex", alignItems: "center", gap: "6px",
                                    fontSize: "10px", color: "#333",
                                }}>
                                    <span>◈</span> {company}
                                </div>
                            )}
                            {website && (
                                <a
                                    href={website.startsWith("http") ? website : `https://${website}`}
                                    target="_blank" rel="noopener noreferrer"
                                    style={{
                                        display: "flex", alignItems: "center", gap: "6px",
                                        fontSize: "10px", color: "#ff6b35",
                                        textDecoration: "none",
                                    }}
                                >
                                    <span>⬡</span> {website}
                                </a>
                            )}
                        </div>

                        {bio && (
                            <div style={{
                                marginTop: "12px", fontSize: "12px", color: "#3a3a3a",
                                lineHeight: 1.7, maxWidth: "520px",
                                fontFamily: "'DM Mono', monospace",
                            }}>{bio}</div>
                        )}
                    </div>

                    {/* right: join date + score sparkline */}
                    <div style={{
                        display: "flex", flexDirection: "column", gap: "20px",
                        alignItems: "flex-end", flexShrink: 0,
                    }}>
                        <div>
                            <div style={{
                                fontSize: "9px", letterSpacing: "0.2em", color: "#2a2a2a",
                                fontFamily: "'DM Mono', monospace", marginBottom: "6px",
                                textAlign: "right",
                            }}>LATEST SCORE</div>
                            <ScoreSparkline />
                        </div>
                        <div style={{
                            fontSize: "9px", letterSpacing: "0.15em", color: "#1e1e1e",
                            fontFamily: "'DM Mono', monospace", textAlign: "right",
                        }}>
                            MEMBER SINCE {joinDate.toUpperCase()}
                        </div>
                        <div style={{
                            fontSize: "9px", letterSpacing: "0.15em",
                            color: "#47A248", border: "1px solid #47A24828",
                            padding: "4px 10px", fontFamily: "'DM Mono', monospace",
                        }}>● ACTIVE</div>
                    </div>
                </div>

                {/* ── STATS ROW ── */}
                <div className="fu s2" style={{
                    display: "grid", gridTemplateColumns: "repeat(4, 1fr)",
                    gap: "1px", background: "#111", marginBottom: "32px",
                }}>
                    {STATS.map(s => (
                        <StatCard key={s.label} {...s} />
                    ))}
                </div>

                {/* ── TABS ── */}
                <div className="fu s2" style={{
                    display: "flex", gap: "28px",
                    borderBottom: "1px solid #111", marginBottom: "32px",
                }}>
                    {TABS.map(t => (
                        <button
                            key={t.id}
                            className={`tab-btn ${activeTab === t.id ? "active" : ""} ${t.id === "danger" ? "danger" : ""}`}
                            onClick={() => setActiveTab(t.id)}
                        >{t.label}</button>
                    ))}
                </div>

                {/* ── SAVE BANNER (floats above content) ── */}
                {saveStatus && (
                    <div style={{ marginBottom: "20px" }}>
                        <SaveBanner status={saveStatus} message={saveMsg} />
                    </div>
                )}

                {/* ── TAB: PROFILE ── */}
                {activeTab === "profile" && (
                    <div className="fu s3" style={{
                        display: "grid", gridTemplateColumns: "1fr 1fr",
                        gap: "24px",
                    }}>
                        {/* LEFT col */}
                        <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                            <div style={{
                                fontSize: "9px", letterSpacing: "0.25em", color: "#ff6b35",
                                fontFamily: "'DM Mono', monospace",
                                display: "flex", alignItems: "center", gap: "10px",
                                marginBottom: "4px",
                            }}>
                                <span style={{ width: "18px", height: "1px", background: "#ff6b35", display: "inline-block" }} />
                                PERSONAL INFO
                            </div>

                            <EditableField
                                label="Full Name"
                                value={name}
                                onChange={setName}
                                placeholder="Your full name"
                            />
                            <EditableField
                                label="Email Address"
                                value={email}
                                onChange={() => { }}
                                type="email"
                                disabled
                                hint="Email cannot be changed here — contact support"
                            />
                            <EditableField
                                label="Username"
                                value={username}
                                onChange={setUsername}
                                placeholder="your_username"
                                hint="Used for public review links"
                            />
                            <EditableField
                                label="Location"
                                value={location}
                                onChange={setLocation}
                                placeholder="Mumbai, India"
                            />
                        </div>

                        {/* RIGHT col */}
                        <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                            <div style={{
                                fontSize: "9px", letterSpacing: "0.25em", color: "#ff6b35",
                                fontFamily: "'DM Mono', monospace",
                                display: "flex", alignItems: "center", gap: "10px",
                                marginBottom: "4px",
                            }}>
                                <span style={{ width: "18px", height: "1px", background: "#ff6b35", display: "inline-block" }} />
                                PUBLIC PROFILE
                            </div>

                            <EditableField
                                label="Company / Organization"
                                value={company}
                                onChange={setCompany}
                                placeholder="Acme Corp / Self-employed"
                            />
                            <EditableField
                                label="Website"
                                value={website}
                                onChange={setWebsite}
                                placeholder="https://yoursite.dev"
                            />

                            {/* bio */}
                            <div style={{ display: "flex", flexDirection: "column", gap: "7px" }}>
                                <div style={{ display: "flex", justifyContent: "space-between" }}>
                                    <label style={{
                                        fontSize: "9px", letterSpacing: "0.25em", color: "#333",
                                        textTransform: "uppercase", fontFamily: "'DM Mono', monospace",
                                    }}>Bio</label>
                                    <span style={{ fontSize: "9px", color: "#1e1e1e" }}>{bio.length}/160</span>
                                </div>
                                <textarea
                                    value={bio}
                                    onChange={(e) => setBio(e.target.value.slice(0, 160))}
                                    placeholder="A short description about yourself..."
                                    rows={4}
                                    style={{
                                        background: "#0a0a0a",
                                        border: "1px solid #1a1a1a",
                                        borderLeft: "3px solid #1a1a1a",
                                        color: "#888", padding: "12px 14px",
                                        fontFamily: "'DM Mono', monospace",
                                        fontSize: "12px", lineHeight: 1.7,
                                        resize: "vertical", outline: "none",
                                        transition: "all 0.2s", width: "100%",
                                    }}
                                    onFocus={(e) => {
                                        e.target.style.borderLeftColor = "#ff6b35";
                                        e.target.style.background = "#0f0f0f";
                                    }}
                                    onBlur={(e) => {
                                        e.target.style.borderLeftColor = "#1a1a1a";
                                        e.target.style.background = "#0a0a0a";
                                    }}
                                />
                            </div>
                        </div>

                        {/* SAVE ROW — full width */}
                        <div style={{
                            gridColumn: "1 / -1",
                            display: "flex", justifyContent: "space-between",
                            alignItems: "center",
                            paddingTop: "20px", borderTop: "1px solid #111",
                        }}>
                            <div style={{
                                fontSize: "9px", color: isDirty ? "#ff6b3560" : "#1a1a1a",
                                fontFamily: "'DM Mono', monospace", letterSpacing: "0.1em",
                                transition: "color 0.3s",
                            }}>
                                {isDirty ? "● UNSAVED CHANGES" : "○ NO CHANGES"}
                            </div>
                            <div style={{ display: "flex", gap: "10px" }}>
                                <button
                                    className="btn-ghost"
                                    onClick={() => {
                                        setName(user?.name || "");
                                        setBio(user?.bio || "");
                                        setWebsite(user?.website || "");
                                        setLocation(user?.location || "");
                                        setCompany(user?.company || "");
                                    }}
                                    disabled={!isDirty}
                                    style={{ opacity: isDirty ? 1 : 0.3 }}
                                >DISCARD</button>
                                <button
                                    className="btn-primary"
                                    onClick={handleSaveProfile}
                                    disabled={saving || !isDirty}
                                    style={{ opacity: isDirty ? 1 : 0.3 }}
                                >
                                    {saving ? "SAVING..." : "SAVE PROFILE →"}
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* ── TAB: SECURITY ── */}
                {activeTab === "security" && (
                    <div className="fu s3" style={{
                        display: "grid", gridTemplateColumns: "1fr 1fr",
                        gap: "24px",
                    }}>
                        {/* change password */}
                        <div style={{
                            border: "1px solid #161616", background: "#0a0a0a",
                            padding: "28px", display: "flex", flexDirection: "column", gap: "16px",
                        }}>
                            <div>
                                <div style={{
                                    fontSize: "9px", letterSpacing: "0.25em", color: "#ff6b35",
                                    fontFamily: "'DM Mono', monospace",
                                    display: "flex", alignItems: "center", gap: "10px",
                                    marginBottom: "10px",
                                }}>
                                    <span style={{ width: "18px", height: "1px", background: "#ff6b35", display: "inline-block" }} />
                                    CHANGE PASSWORD
                                </div>
                                <p style={{ fontSize: "11px", color: "#2e2e2e", lineHeight: 1.7 }}>
                                    Choose a strong password with at least 8 characters.
                                </p>
                            </div>

                            {/* password fields */}
                            {[
                                { label: "Current Password", val: currentPwd, set: setCurrentPwd, ph: "Enter current password" },
                                { label: "New Password", val: newPwd, set: setNewPwd, ph: "Minimum 8 characters" },
                                { label: "Confirm Password", val: confirmPwd, set: setConfirmPwd, ph: "Repeat new password" },
                            ].map(({ label, val, set, ph }) => (
                                <div key={label} style={{ display: "flex", flexDirection: "column", gap: "7px" }}>
                                    <label style={{
                                        fontSize: "9px", letterSpacing: "0.25em", color: "#333",
                                        textTransform: "uppercase", fontFamily: "'DM Mono', monospace",
                                    }}>{label}</label>
                                    <div style={{ position: "relative" }}>
                                        <input
                                            type={showPwd ? "text" : "password"}
                                            value={val}
                                            onChange={(e) => { set(e.target.value); setPwdError(""); }}
                                            placeholder={ph}
                                            style={{
                                                width: "100%", background: "#0d0d0d",
                                                border: "1px solid #1a1a1a",
                                                borderLeft: "3px solid #1a1a1a",
                                                color: "#f0ece4", padding: "12px 44px 12px 14px",
                                                fontFamily: "'DM Mono', monospace", fontSize: "13px",
                                                outline: "none", transition: "all 0.2s",
                                            }}
                                            onFocus={(e) => e.target.style.borderLeftColor = "#ff6b35"}
                                            onBlur={(e) => e.target.style.borderLeftColor = "#1a1a1a"}
                                        />
                                    </div>
                                </div>
                            ))}

                            {/* show/hide toggle */}
                            <button
                                type="button"
                                onClick={() => setShowPwd(s => !s)}
                                style={{
                                    background: "none", border: "none",
                                    color: "#2a2a2a", cursor: "pointer",
                                    fontSize: "10px", letterSpacing: "0.1em",
                                    fontFamily: "'DM Mono', monospace",
                                    textAlign: "left", transition: "color 0.2s",
                                }}
                                onMouseEnter={(e) => e.target.style.color = "#ff6b35"}
                                onMouseLeave={(e) => e.target.style.color = "#2a2a2a"}
                            >
                                {showPwd ? "HIDE PASSWORDS" : "SHOW PASSWORDS"}
                            </button>

                            {/* password strength indicator */}
                            {newPwd && (
                                <div>
                                    <div style={{
                                        fontSize: "9px", color: "#2a2a2a",
                                        fontFamily: "'DM Mono', monospace", marginBottom: "6px",
                                        letterSpacing: "0.1em",
                                    }}>PASSWORD STRENGTH</div>
                                    <div style={{ display: "flex", gap: "3px" }}>
                                        {[8, 12, 16, 20].map((threshold, i) => {
                                            const score = [
                                                newPwd.length >= 8,
                                                /[A-Z]/.test(newPwd),
                                                /[0-9]/.test(newPwd),
                                                /[^A-Za-z0-9]/.test(newPwd),
                                            ].filter(Boolean).length;
                                            const active = i < score;
                                            const colors = ["#ff4444", "#ff6b35", "#ffd700", "#47A248"];
                                            return (
                                                <div key={i} style={{
                                                    flex: 1, height: "3px",
                                                    background: active ? colors[score - 1] : "#111",
                                                    transition: "background 0.3s",
                                                }} />
                                            );
                                        })}
                                    </div>
                                    <div style={{
                                        fontSize: "9px", color: "#333",
                                        fontFamily: "'DM Mono', monospace", marginTop: "4px",
                                    }}>
                                        {[
                                            newPwd.length >= 8,
                                            /[A-Z]/.test(newPwd),
                                            /[0-9]/.test(newPwd),
                                            /[^A-Za-z0-9]/.test(newPwd),
                                        ].filter(Boolean).length < 2
                                            ? "Weak — add uppercase, numbers, symbols"
                                            : [newPwd.length >= 8, /[A-Z]/.test(newPwd), /[0-9]/.test(newPwd), /[^A-Za-z0-9]/.test(newPwd)].filter(Boolean).length < 4
                                                ? "Good — almost there"
                                                : "Strong ✓"
                                        }
                                    </div>
                                </div>
                            )}

                            {pwdError && (
                                <div style={{
                                    padding: "10px 14px", background: "#120606",
                                    border: "1px solid #ff3b3b25", borderLeft: "3px solid #ff4444",
                                    color: "#ff7070", fontSize: "11px",
                                    fontFamily: "'DM Mono', monospace",
                                }}>✕ {pwdError}</div>
                            )}

                            <button
                                className="btn-primary"
                                onClick={handleChangePassword}
                                disabled={saving || !currentPwd || !newPwd || !confirmPwd}
                                style={{ marginTop: "4px" }}
                            >
                                {saving ? "UPDATING..." : "UPDATE PASSWORD →"}
                            </button>
                        </div>

                        {/* sessions / account info */}
                        <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                            <div style={{
                                border: "1px solid #161616", background: "#0a0a0a",
                                padding: "28px", display: "flex", flexDirection: "column", gap: "16px",
                            }}>
                                <div style={{
                                    fontSize: "9px", letterSpacing: "0.25em", color: "#ff6b35",
                                    fontFamily: "'DM Mono', monospace",
                                    display: "flex", alignItems: "center", gap: "10px",
                                }}>
                                    <span style={{ width: "18px", height: "1px", background: "#ff6b35", display: "inline-block" }} />
                                    ACCOUNT SECURITY
                                </div>

                                <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                                    {[
                                        { label: "Account Status", value: "Active", color: "#47A248" },
                                        { label: "Email Verified", value: "Yes", color: "#47A248" },
                                        { label: "Last Login", value: "Just now", color: "#888" },
                                        { label: "2FA", value: "Not configured", color: "#ff6b35" },
                                    ].map(row => (
                                        <div key={row.label} style={{
                                            display: "flex", justifyContent: "space-between",
                                            alignItems: "center", padding: "10px 0",
                                            borderBottom: "1px solid #0d0d0d",
                                        }}>
                                            <span style={{ fontSize: "11px", color: "#333", fontFamily: "'DM Mono', monospace" }}>
                                                {row.label}
                                            </span>
                                            <span style={{
                                                fontSize: "11px", color: row.color,
                                                fontFamily: "'DM Mono', monospace",
                                            }}>{row.value}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* active sessions */}
                            <div style={{
                                border: "1px solid #161616", background: "#0a0a0a",
                                padding: "24px",
                            }}>
                                <div style={{
                                    fontSize: "9px", letterSpacing: "0.25em", color: "#ff6b35",
                                    fontFamily: "'DM Mono', monospace", marginBottom: "14px",
                                    display: "flex", alignItems: "center", gap: "10px",
                                }}>
                                    <span style={{ width: "18px", height: "1px", background: "#ff6b35", display: "inline-block" }} />
                                    ACTIVE SESSIONS
                                </div>

                                {[
                                    { device: "Chrome — Windows", ip: "Current session", time: "Now", current: true },
                                ].map((s, i) => (
                                    <div key={i} style={{
                                        display: "flex", alignItems: "center", gap: "12px",
                                        padding: "12px 0",
                                    }}>
                                        <div style={{
                                            width: "8px", height: "8px", borderRadius: "50%",
                                            background: s.current ? "#47A248" : "#333",
                                            animation: s.current ? "pulse 2s ease infinite" : "none",
                                            flexShrink: 0,
                                        }} />
                                        <div style={{ flex: 1 }}>
                                            <div style={{ fontSize: "12px", color: "#888", fontFamily: "'DM Mono', monospace" }}>
                                                {s.device}
                                            </div>
                                            <div style={{ fontSize: "10px", color: "#2a2a2a", marginTop: "2px" }}>
                                                {s.ip}
                                            </div>
                                        </div>
                                        {s.current && (
                                            <span style={{
                                                fontSize: "9px", color: "#47A248",
                                                fontFamily: "'DM Mono', monospace", letterSpacing: "0.1em",
                                            }}>YOU</span>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                )}

                {/* ── TAB: ACTIVITY ── */}
                {activeTab === "activity" && (
                    <div className="fu s3" style={{ display: "flex", flexDirection: "column", gap: "24px" }}>

                        {/* activity grid */}
                        <div style={{
                            border: "1px solid #161616", background: "#0a0a0a",
                            padding: "28px",
                        }}>
                            <ActivityGrid />
                        </div>

                        {/* recent reviews table */}
                        <div style={{
                            border: "1px solid #161616", background: "#0a0a0a",
                            padding: "28px",
                        }}>
                            <div style={{
                                fontSize: "9px", letterSpacing: "0.25em", color: "#ff6b35",
                                fontFamily: "'DM Mono', monospace",
                                display: "flex", alignItems: "center", gap: "10px",
                                marginBottom: "20px",
                            }}>
                                <span style={{ width: "18px", height: "1px", background: "#ff6b35", display: "inline-block" }} />
                                RECENT REVIEWS
                            </div>

                            <div style={{ display: "flex", flexDirection: "column", gap: "1px", background: "#111" }}>
                                {[
                                    { title: "Auth Handler", lang: "Go", score: 8.4, date: "Today", status: "completed" },
                                    { title: "Payment Service", lang: "Python", score: 6.1, date: "Yesterday", status: "completed" },
                                    { title: "User Repository", lang: "Go", score: 9.2, date: "2 days ago", status: "completed" },
                                    { title: "Webhook Handler", lang: "TypeScript", score: 7.7, date: "3 days ago", status: "completed" },
                                    { title: "Dashboard Component", lang: "JavaScript", score: 0, date: "3 days ago", status: "failed" },
                                ].map((r, i) => {
                                    const scoreColor = r.score >= 8 ? "#47A248" : r.score >= 6 ? "#ffd700" : "#ff4444";
                                    return (
                                        <div
                                            key={i}
                                            onClick={() => navigate(`/review/${i + 1}`)}
                                            style={{
                                                display: "flex", alignItems: "center", gap: "16px",
                                                padding: "14px 16px", background: "#0a0a0a",
                                                cursor: "pointer", transition: "background 0.15s",
                                            }}
                                            onMouseEnter={(e) => e.currentTarget.style.background = "#0e0e0e"}
                                            onMouseLeave={(e) => e.currentTarget.style.background = "#0a0a0a"}
                                        >
                                            {/* score */}
                                            <div style={{
                                                width: "36px", height: "36px", borderRadius: "50%",
                                                border: `1.5px solid ${r.score > 0 ? scoreColor : "#222"}`,
                                                display: "flex", alignItems: "center", justifyContent: "center",
                                                fontFamily: "'Syne', sans-serif", fontWeight: 800,
                                                fontSize: "12px", color: r.score > 0 ? scoreColor : "#333",
                                                flexShrink: 0,
                                            }}>{r.score > 0 ? r.score : "—"}</div>

                                            <div style={{ flex: 1, minWidth: 0 }}>
                                                <div style={{
                                                    fontFamily: "'Syne', sans-serif", fontWeight: 700,
                                                    fontSize: "13px", color: "#f0ece4",
                                                    whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis",
                                                }}>{r.title}</div>
                                                <div style={{ fontSize: "10px", color: "#333", marginTop: "3px" }}>
                                                    {r.lang}
                                                </div>
                                            </div>

                                            <div style={{ fontSize: "10px", color: "#2a2a2a" }}>{r.date}</div>
                                            <div style={{
                                                fontSize: "9px", letterSpacing: "0.1em",
                                                color: r.status === "completed" ? "#47A248" : "#ff4444",
                                                fontFamily: "'DM Mono', monospace",
                                            }}>{r.status.toUpperCase()}</div>
                                            <span style={{ color: "#2a2a2a", fontSize: "14px" }}>→</span>
                                        </div>
                                    );
                                })}
                            </div>

                            <div style={{ marginTop: "16px", textAlign: "center" }}>
                                <button
                                    onClick={() => navigate("/dashboard")}
                                    style={{
                                        background: "none", border: "none",
                                        color: "#ff6b35", cursor: "pointer",
                                        fontSize: "10px", letterSpacing: "0.15em",
                                        fontFamily: "'DM Mono', monospace",
                                    }}
                                >VIEW ALL ON DASHBOARD →</button>
                            </div>
                        </div>
                    </div>
                )}

                {/* ── TAB: DANGER ZONE ── */}
                {activeTab === "danger" && (
                    <div className="fu s3" style={{ display: "flex", flexDirection: "column", gap: "16px" }}>

                        {/* sign out all */}
                        <div style={{
                            border: "1px solid #1a1010", background: "#0a0808",
                            padding: "24px 28px",
                            display: "flex", justifyContent: "space-between", alignItems: "center",
                        }}>
                            <div>
                                <div style={{
                                    fontFamily: "'Syne', sans-serif", fontWeight: 700,
                                    fontSize: "14px", marginBottom: "6px",
                                }}>Sign out of all devices</div>
                                <div style={{ fontSize: "11px", color: "#3a2a2a", lineHeight: 1.6 }}>
                                    Invalidates all active sessions and JWT tokens immediately.
                                </div>
                            </div>
                            <button
                                onClick={() => navigate("/login")}
                                style={{
                                    background: "none", border: "1px solid #ff3b3b30",
                                    color: "#ff6060", padding: "11px 22px",
                                    cursor: "pointer", fontFamily: "'DM Mono', monospace",
                                    fontSize: "10px", letterSpacing: "0.15em",
                                    transition: "all 0.2s", flexShrink: 0,
                                }}
                                onMouseEnter={(e) => { e.target.style.background = "#1a0808"; e.target.style.borderColor = "#ff3b3b60"; }}
                                onMouseLeave={(e) => { e.target.style.background = "none"; e.target.style.borderColor = "#ff3b3b30"; }}
                            >SIGN OUT ALL</button>
                        </div>

                        {/* export data */}
                        <div style={{
                            border: "1px solid #161616", background: "#0a0a0a",
                            padding: "24px 28px",
                            display: "flex", justifyContent: "space-between", alignItems: "center",
                        }}>
                            <div>
                                <div style={{
                                    fontFamily: "'Syne', sans-serif", fontWeight: 700,
                                    fontSize: "14px", marginBottom: "6px",
                                }}>Export your data</div>
                                <div style={{ fontSize: "11px", color: "#2e2e2e", lineHeight: 1.6 }}>
                                    Download all your reviews, scores and settings as JSON.
                                </div>
                            </div>
                            <button
                                style={{
                                    background: "none", border: "1px solid #222",
                                    color: "#666", padding: "11px 22px",
                                    cursor: "pointer", fontFamily: "'DM Mono', monospace",
                                    fontSize: "10px", letterSpacing: "0.15em",
                                    transition: "all 0.2s", flexShrink: 0,
                                }}
                                onMouseEnter={(e) => { e.target.style.borderColor = "#ff6b35"; e.target.style.color = "#ff6b35"; }}
                                onMouseLeave={(e) => { e.target.style.borderColor = "#222"; e.target.style.color = "#666"; }}
                            >EXPORT DATA</button>
                        </div>

                        {/* delete account */}
                        <div style={{
                            border: "1px solid #2a0a0a", background: "#090606",
                            padding: "28px",
                        }}>
                            <div style={{
                                fontSize: "9px", letterSpacing: "0.25em", color: "#ff3b3b",
                                fontFamily: "'DM Mono', monospace", marginBottom: "14px",
                                display: "flex", alignItems: "center", gap: "10px",
                            }}>
                                <span style={{ width: "18px", height: "1px", background: "#ff3b3b", display: "inline-block" }} />
                                DELETE ACCOUNT
                            </div>

                            <p style={{ fontSize: "12px", color: "#4a2020", lineHeight: 1.7, marginBottom: "20px" }}>
                                Permanently deletes your account, all reviews, and associated data.
                                This action <span style={{ color: "#ff6060" }}>cannot be undone.</span>
                            </p>

                            {!showDeleteConfirm ? (
                                <button
                                    onClick={() => setShowDeleteConfirm(true)}
                                    style={{
                                        background: "none", border: "1px solid #ff3b3b40",
                                        color: "#ff4444", padding: "11px 22px",
                                        cursor: "pointer", fontFamily: "'DM Mono', monospace",
                                        fontSize: "10px", letterSpacing: "0.15em",
                                        transition: "all 0.2s",
                                    }}
                                    onMouseEnter={(e) => { e.target.style.background = "#1a0808"; e.target.style.borderColor = "#ff3b3b80"; }}
                                    onMouseLeave={(e) => { e.target.style.background = "none"; e.target.style.borderColor = "#ff3b3b40"; }}
                                >I WANT TO DELETE MY ACCOUNT</button>
                            ) : (
                                <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
                                    <div style={{
                                        padding: "14px 16px", background: "#120606",
                                        border: "1px solid #ff3b3b20",
                                        fontSize: "11px", color: "#664444",
                                        fontFamily: "'DM Mono', monospace", lineHeight: 1.6,
                                    }}>
                                        Type <span style={{ color: "#ff6060" }}>DELETE</span> to confirm
                                    </div>
                                    <input
                                        value={deleteInput}
                                        onChange={(e) => setDeleteInput(e.target.value)}
                                        placeholder="Type DELETE to confirm"
                                        style={{
                                            background: "#0d0606", border: "1px solid #2a1010",
                                            borderLeft: "3px solid #ff3b3b40",
                                            color: "#ff8080", padding: "12px 14px",
                                            fontFamily: "'DM Mono', monospace", fontSize: "13px",
                                            outline: "none", width: "100%",
                                        }}
                                        onFocus={(e) => e.target.style.borderLeftColor = "#ff3b3b"}
                                        onBlur={(e) => e.target.style.borderLeftColor = "#ff3b3b40"}
                                    />
                                    <div style={{ display: "flex", gap: "10px" }}>
                                        <button
                                            onClick={() => { setShowDeleteConfirm(false); setDeleteInput(""); }}
                                            className="btn-ghost"
                                        >CANCEL</button>
                                        <button
                                            disabled={deleteInput !== "DELETE"}
                                            style={{
                                                background: deleteInput === "DELETE" ? "#ff3b3b" : "#1a0808",
                                                border: "none",
                                                color: deleteInput === "DELETE" ? "#fff" : "#3a1010",
                                                padding: "11px 22px",
                                                cursor: deleteInput === "DELETE" ? "pointer" : "not-allowed",
                                                fontFamily: "'DM Mono', monospace", fontSize: "10px",
                                                letterSpacing: "0.15em", fontWeight: 500,
                                                transition: "all 0.2s",
                                                clipPath: "polygon(7px 0%, 100% 0%, calc(100% - 7px) 100%, 0% 100%)",
                                            }}
                                        >PERMANENTLY DELETE</button>
                                    </div>
                                    <button
                                        disabled={deleteInput !== "DELETE"}
                                        style={{
                                            background: deleteInput === "DELETE" ? "#ff3b3b" : "#1a0808",
                                            border: "none",
                                            color: deleteInput === "DELETE" ? "#fff" : "#3a1010",
                                            padding: "11px 22px",
                                            cursor: deleteInput === "DELETE" ? "pointer" : "not-allowed",
                                            fontFamily: "'DM Mono', monospace", fontSize: "10px",
                                            letterSpacing: "0.15em", fontWeight: 500,
                                            transition: "all 0.2s",
                                            clipPath: "polygon(7px 0%, 100% 0%, calc(100% - 7px) 100%, 0% 100%)",
                                        }}
                                    >PERMANENTLY DELETE</button>
                                </div>
                            )}
                        </div>
                    </div>
                )}

            </main>
        </div>
    );
}
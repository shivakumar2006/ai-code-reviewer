import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { useGetAllReviewsQuery, useDeleteReviewMutation } from "../store/api/reviewApi";

// ─────────────────────────────────────────
// SHARED COMPONENTS (same as HomePage)
// ─────────────────────────────────────────

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

// ─────────────────────────────────────────
// CONSTANTS
// ─────────────────────────────────────────

const SEVERITY_COLORS = {
    bug: { bg: "#1a0808", border: "#ff3b3b30", dot: "#ff3b3b", label: "BUG" },
    security: { bg: "#1a0a08", border: "#ff6b3530", dot: "#ff6b35", label: "SEC" },
    warning: { bg: "#1a1508", border: "#ffd70030", dot: "#ffd700", label: "WARN" },
    info: { bg: "#081a0d", border: "#47A24830", dot: "#47A248", label: "INFO" },
};

const LANG_COLORS = {
    go: "#00ACD7",
    python: "#FFD43B",
    javascript: "#F7DF1E",
    typescript: "#3178C6",
    java: "#ED8B00",
    rust: "#CE412B",
    cpp: "#659AD2",
    unknown: "#555",
};

const STATUS_CONFIG = {
    completed: { color: "#47A248", label: "DONE", bg: "#081a0d" },
    pending: { color: "#ffd700", label: "PENDING", bg: "#1a1508" },
    processing: { color: "#ff6b35", label: "PROCESSING", bg: "#1a0d08" },
    failed: { color: "#ff3b3b", label: "FAILED", bg: "#1a0808" },
};

// ─────────────────────────────────────────
// MOCK DATA (replace with real API data)
// ─────────────────────────────────────────

const MOCK_REVIEWS = [
    {
        id: "1", title: "Auth Handler", language: "go",
        status: "completed", score: 8.4, issue_count: 2,
        created_at: "2026-03-08T14:32:00Z",
    },
    {
        id: "2", title: "Payment Service", language: "python",
        status: "completed", score: 6.1, issue_count: 5,
        created_at: "2026-03-07T10:15:00Z",
    },
    {
        id: "3", title: "API Gateway Router", language: "go",
        status: "failed", score: 0, issue_count: 0,
        created_at: "2026-03-07T08:00:00Z",
    },
    {
        id: "4", title: "User Repository", language: "go",
        status: "completed", score: 9.2, issue_count: 1,
        created_at: "2026-03-06T16:45:00Z",
    },
    {
        id: "5", title: "Dashboard Component", language: "javascript",
        status: "processing", score: 0, issue_count: 0,
        created_at: "2026-03-08T15:00:00Z",
    },
    {
        id: "6", title: "Webhook Handler", language: "typescript",
        status: "completed", score: 7.7, issue_count: 3,
        created_at: "2026-03-05T12:30:00Z",
    },
];

// ─────────────────────────────────────────
// SUB COMPONENTS
// ─────────────────────────────────────────

function ScoreBadge({ score, size = "sm" }) {
    const color = score >= 8 ? "#47A248" : score >= 6 ? "#ffd700" : score >= 4 ? "#ff6b35" : "#ff3b3b";
    const fontSize = size === "lg" ? "28px" : "15px";
    const dim = size === "lg" ? "64px" : "40px";
    return (
        <div style={{
            width: dim, height: dim, borderRadius: "50%",
            border: `1.5px solid ${color}`,
            display: "flex", alignItems: "center", justifyContent: "center",
            fontFamily: "'Syne', sans-serif", fontWeight: 800,
            fontSize, color, flexShrink: 0,
        }}>
            {score > 0 ? score.toFixed(1) : "—"}
        </div>
    );
}

function StatusPill({ status }) {
    const cfg = STATUS_CONFIG[status] || STATUS_CONFIG.pending;
    return (
        <div style={{
            display: "inline-flex", alignItems: "center", gap: "6px",
            background: cfg.bg, border: `1px solid ${cfg.color}30`,
            padding: "3px 10px", fontSize: "9px",
            letterSpacing: "0.2em", color: cfg.color,
            fontFamily: "'DM Mono', monospace",
        }}>
            <div style={{
                width: "5px", height: "5px", borderRadius: "50%",
                background: cfg.color,
                animation: status === "processing" ? "pulse 1.5s ease infinite" : "none",
            }} />
            {cfg.label}
        </div>
    );
}

function ReviewCard({ review, onDelete, onClick }) {
    const [hovered, setHovered] = useState(false);
    const [deleting, setDeleting] = useState(false);
    const langColor = LANG_COLORS[review.language] || "#555";
    const date = new Date(review.created_at).toLocaleDateString("en-US", {
        month: "short", day: "numeric",
    });

    const handleDelete = async (e) => {
        e.stopPropagation();
        setDeleting(true);
        await onDelete(review.id);
        setDeleting(false);
    };

    return (
        <div
            onClick={() => onClick(review.id)}
            onMouseEnter={() => setHovered(true)}
            onMouseLeave={() => setHovered(false)}
            style={{
                border: `1px solid ${hovered ? "#2a2a2a" : "#161616"}`,
                borderLeft: `3px solid ${hovered ? "#ff6b35" : "#1a1a1a"}`,
                background: hovered ? "#0d0d0d" : "#0a0a0a",
                padding: "20px 24px",
                cursor: "pointer",
                transition: "all 0.2s",
                display: "flex", alignItems: "center", gap: "20px",
                position: "relative",
            }}
        >
            {/* score */}
            <ScoreBadge score={review.score} />

            {/* main info */}
            <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "6px" }}>
                    <h3 style={{
                        fontFamily: "'Syne', sans-serif", fontWeight: 700,
                        fontSize: "14px", color: "#f0ece4",
                        whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis",
                    }}>{review.title}</h3>
                    <StatusPill status={review.status} />
                </div>

                <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                        <div style={{ width: "6px", height: "6px", borderRadius: "50%", background: langColor }} />
                        <span style={{ fontSize: "11px", color: "#444", letterSpacing: "0.1em" }}>
                            {review.language.toUpperCase()}
                        </span>
                    </div>
                    {review.issue_count > 0 && (
                        <span style={{ fontSize: "11px", color: "#444" }}>
                            {review.issue_count} issue{review.issue_count !== 1 ? "s" : ""}
                        </span>
                    )}
                    <span style={{ fontSize: "11px", color: "#333" }}>{date}</span>
                </div>
            </div>

            {/* actions */}
            <div style={{ display: "flex", gap: "8px", alignItems: "center", opacity: hovered ? 1 : 0, transition: "opacity 0.2s" }}>
                <button
                    onClick={handleDelete}
                    disabled={deleting}
                    style={{
                        background: "none", border: "1px solid #2a2a2a",
                        color: "#666", padding: "6px 12px", cursor: "pointer",
                        fontSize: "10px", letterSpacing: "0.1em",
                        fontFamily: "'DM Mono', monospace",
                        transition: "all 0.2s",
                    }}
                    onMouseEnter={(e) => { e.stopPropagation(); e.target.style.borderColor = "#ff3b3b"; e.target.style.color = "#ff3b3b"; }}
                    onMouseLeave={(e) => { e.stopPropagation(); e.target.style.borderColor = "#2a2a2a"; e.target.style.color = "#666"; }}
                >
                    {deleting ? "..." : "DELETE"}
                </button>
                <div style={{
                    width: "28px", height: "28px", border: "1px solid #2a2a2a",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    color: "#ff6b35", fontSize: "14px",
                }}>→</div>
            </div>
        </div>
    );
}

function StatCard({ label, value, sub, accent = false }) {
    return (
        <div style={{
            border: "1px solid #161616", background: "#0a0a0a",
            padding: "24px 28px", position: "relative", overflow: "hidden",
        }}>
            {accent && (
                <div style={{
                    position: "absolute", top: 0, left: 0, right: 0,
                    height: "2px", background: "linear-gradient(90deg, #ff6b35, transparent)",
                }} />
            )}
            <div style={{
                fontSize: "10px", letterSpacing: "0.2em", color: "#444",
                fontFamily: "'DM Mono', monospace", marginBottom: "12px",
            }}>{label}</div>
            <div style={{
                fontFamily: "'Syne', sans-serif", fontSize: "36px",
                fontWeight: 800, color: accent ? "#ff6b35" : "#f0ece4", lineHeight: 1,
            }}>{value}</div>
            {sub && (
                <div style={{ fontSize: "11px", color: "#333", marginTop: "8px" }}>{sub}</div>
            )}
        </div>
    );
}

// ─────────────────────────────────────────
// MAIN DASHBOARD PAGE
// ─────────────────────────────────────────

export default function DashboardPage() {
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const user = useSelector((state) => state.auth.user);

    const [page, setPage] = useState(1);
    const [filter, setFilter] = useState("all");
    const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
    const [deleteReview] = useDeleteReviewMutation();

    // use real data — fallback to mock for now
    // const { data, isLoading } = useGetAllReviewsQuery({ page, limit: 10 });
    const reviews = MOCK_REVIEWS;
    const isLoading = false;

    useEffect(() => {
        const onMove = (e) => setMousePos({ x: e.clientX, y: e.clientY });
        window.addEventListener("mousemove", onMove);
        return () => window.removeEventListener("mousemove", onMove);
    }, []);

    const filtered = filter === "all"
        ? reviews
        : reviews.filter((r) => r.status === filter);

    const avgScore = reviews
        .filter((r) => r.score > 0)
        .reduce((sum, r, _, arr) => sum + r.score / arr.length, 0);

    const completedCount = reviews.filter((r) => r.status === "completed").length;

    const handleDelete = async (id) => {
        // await deleteReview(id);
        console.log("delete", id);
    };

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

                .nav-link {
                    color: #555; text-decoration: none; font-size: 11px;
                    letter-spacing: 0.15em; text-transform: uppercase;
                    transition: color 0.2s; font-family: 'DM Mono', monospace;
                    cursor: pointer;
                }
                .nav-link:hover { color: #ff6b35; }
                .nav-link.active { color: #ff6b35; }

                .btn-primary {
                    background: #ff6b35; color: #080808; border: none;
                    padding: 12px 28px; font-family: 'DM Mono', monospace;
                    font-size: 11px; letter-spacing: 0.15em; text-transform: uppercase;
                    cursor: pointer; font-weight: 500; transition: all 0.2s;
                    clip-path: polygon(8px 0%, 100% 0%, calc(100% - 8px) 100%, 0% 100%);
                }
                .btn-primary:hover { background: #ff8c5a; transform: translateY(-1px); }

                .filter-btn {
                    background: none; border: 1px solid #1a1a1a;
                    color: #444; padding: 6px 16px; cursor: pointer;
                    font-family: 'DM Mono', monospace; font-size: 10px;
                    letter-spacing: 0.15em; text-transform: uppercase;
                    transition: all 0.2s;
                }
                .filter-btn:hover { border-color: #2a2a2a; color: #888; }
                .filter-btn.active { border-color: #ff6b35; color: #ff6b35; background: #ff6b3510; }

                .tag {
                    font-size: 9px; letter-spacing: 0.2em; color: #ff6b35;
                    border: 1px solid #ff6b3530; padding: 3px 8px;
                    font-family: 'DM Mono', monospace;
                }

                @keyframes pulse {
                    0%, 100% { opacity: 1; }
                    50% { opacity: 0.3; }
                }

                @keyframes fadeUp {
                    from { opacity: 0; transform: translateY(16px); }
                    to { opacity: 1; transform: translateY(0); }
                }
                .fade-up { animation: fadeUp 0.5s ease forwards; }
                .stagger-1 { animation-delay: 0.05s; opacity: 0; }
                .stagger-2 { animation-delay: 0.15s; opacity: 0; }
                .stagger-3 { animation-delay: 0.25s; opacity: 0; }

                .section-label {
                    font-size: 10px; letter-spacing: 0.3em; color: #ff6b35;
                    text-transform: uppercase; font-family: 'DM Mono', monospace;
                    display: flex; align-items: center; gap: 12px;
                }
                .section-label::before {
                    content: ''; width: 24px; height: 1px; background: #ff6b35;
                }
            `}</style>

            {/* cursor glow */}
            <div style={{
                position: "fixed", pointerEvents: "none", zIndex: 9999,
                width: "300px", height: "300px", borderRadius: "50%",
                background: "radial-gradient(circle, rgba(255,107,53,0.05) 0%, transparent 70%)",
                transform: "translate(-50%, -50%)",
                left: mousePos.x, top: mousePos.y,
            }} />

            <GridBackground />
            <NoiseBg />

            {/* ── NAV ── */}
            <nav style={{
                position: "fixed", top: 0, left: 0, right: 0, zIndex: 100,
                padding: "0 48px", height: "64px",
                display: "flex", alignItems: "center", justifyContent: "space-between",
                background: "rgba(8,8,8,0.95)",
                borderBottom: "1px solid #111",
                backdropFilter: "blur(12px)",
            }}>
                {/* logo */}
                <div
                    onClick={() => navigate("/")}
                    style={{ display: "flex", alignItems: "center", gap: "10px", cursor: "pointer" }}
                >
                    <div style={{
                        width: "24px", height: "24px", background: "#ff6b35",
                        clipPath: "polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)",
                    }} />
                    <span style={{
                        fontFamily: "'Syne', sans-serif", fontWeight: 700,
                        fontSize: "14px", letterSpacing: "0.05em",
                    }}>
                        CODEX<span style={{ color: "#ff6b35" }}>AI</span>
                    </span>
                </div>

                {/* nav links */}
                <div style={{ display: "flex", gap: "32px", alignItems: "center" }}>
                    <span className="nav-link active">Dashboard</span>
                    <span className="nav-link" onClick={() => navigate("/settings")}>Settings</span>
                    <span className="nav-link" onClick={() => navigate("/")}>Profile</span>
                </div>

                {/* right */}
                <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
                    <div style={{
                        fontSize: "11px", color: "#444", letterSpacing: "0.1em",
                        fontFamily: "'DM Mono', monospace",
                    }}>
                        {user?.name || "SHIVA KUMAR"}
                    </div>
                    <button
                        onClick={() => navigate("/review/new")}
                        className="btn-primary"
                        style={{ padding: "9px 20px", fontSize: "10px" }}
                    >
                        + New Review
                    </button>
                </div>
            </nav>

            {/* ── MAIN ── */}
            <main style={{
                paddingTop: "64px", minHeight: "100vh",
                maxWidth: "1400px", margin: "0 auto",
                padding: "88px 48px 64px",
                position: "relative", zIndex: 1,
            }}>

                {/* ── HEADER ── */}
                <div className="fade-up stagger-1" style={{
                    display: "flex", justifyContent: "space-between",
                    alignItems: "flex-end", marginBottom: "48px",
                }}>
                    <div>
                        <div className="section-label" style={{ marginBottom: "12px" }}>
                            Overview
                        </div>
                        <h1 style={{
                            fontFamily: "'Syne', sans-serif", fontSize: "clamp(28px, 4vw, 42px)",
                            fontWeight: 800, lineHeight: 1.1,
                        }}>
                            Your Review<br />
                            <span style={{ color: "#ff6b35" }}>Dashboard</span>
                        </h1>
                    </div>

                    <button
                        onClick={() => navigate("/review/new")}
                        className="btn-primary"
                        style={{ fontSize: "12px" }}
                    >
                        + New Review →
                    </button>
                </div>

                {/* ── STATS ROW ── */}
                <div className="fade-up stagger-2" style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(4, 1fr)",
                    gap: "1px", background: "#111",
                    marginBottom: "48px",
                }}>
                    <StatCard
                        label="TOTAL REVIEWS"
                        value={reviews.length}
                        sub="all time"
                        accent
                    />
                    <StatCard
                        label="AVG SCORE"
                        value={avgScore.toFixed(1)}
                        sub="across completed"
                    />
                    <StatCard
                        label="COMPLETED"
                        value={completedCount}
                        sub={`${Math.round((completedCount / reviews.length) * 100)}% success rate`}
                    />
                    <StatCard
                        label="ISSUES CAUGHT"
                        value={reviews.reduce((sum, r) => sum + r.issue_count, 0)}
                        sub="total fixed"
                    />
                </div>

                {/* ── SCORE TREND (mini) ── */}
                <div className="fade-up stagger-2" style={{
                    border: "1px solid #161616", background: "#0a0a0a",
                    padding: "24px 28px", marginBottom: "48px",
                    display: "flex", alignItems: "center", gap: "32px",
                }}>
                    <div>
                        <div style={{
                            fontSize: "10px", letterSpacing: "0.2em",
                            color: "#444", marginBottom: "8px",
                        }}>SCORE TREND</div>
                        <div style={{
                            fontFamily: "'Syne', sans-serif", fontSize: "22px",
                            fontWeight: 800, color: "#47A248",
                        }}>↑ +1.2</div>
                        <div style={{ fontSize: "11px", color: "#333", marginTop: "4px" }}>
                            vs last 7 days
                        </div>
                    </div>

                    {/* mini bar chart */}
                    <div style={{ flex: 1, display: "flex", alignItems: "flex-end", gap: "6px", height: "48px" }}>
                        {[5.2, 6.4, 6.1, 7.8, 7.2, 8.4, 9.2].map((score, i) => {
                            const color = score >= 8 ? "#47A248" : score >= 6 ? "#ffd700" : "#ff6b35";
                            return (
                                <div
                                    key={i}
                                    style={{
                                        flex: 1, background: i === 6 ? color : `${color}40`,
                                        height: `${(score / 10) * 100}%`,
                                        transition: "all 0.3s",
                                        minHeight: "4px",
                                    }}
                                />
                            );
                        })}
                    </div>

                    <div style={{
                        fontSize: "10px", color: "#333", letterSpacing: "0.1em",
                        textAlign: "right",
                    }}>
                        <div style={{ color: "#47A248", marginBottom: "4px" }}>LATEST: 9.2</div>
                        <div>7 DAY AVG: 7.2</div>
                    </div>
                </div>

                {/* ── REVIEWS LIST ── */}
                <div className="fade-up stagger-3">

                    {/* list header */}
                    <div style={{
                        display: "flex", justifyContent: "space-between",
                        alignItems: "center", marginBottom: "20px",
                    }}>
                        <div style={{
                            fontSize: "10px", letterSpacing: "0.2em",
                            color: "#444", fontFamily: "'DM Mono', monospace",
                        }}>
                            REVIEWS — {filtered.length} RESULTS
                        </div>

                        {/* filters */}
                        <div style={{ display: "flex", gap: "6px" }}>
                            {["all", "completed", "failed", "processing"].map((f) => (
                                <button
                                    key={f}
                                    className={`filter-btn ${filter === f ? "active" : ""}`}
                                    onClick={() => setFilter(f)}
                                >
                                    {f}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* list */}
                    {isLoading ? (
                        <div style={{
                            border: "1px solid #161616", padding: "80px",
                            textAlign: "center", color: "#333",
                            fontSize: "12px", letterSpacing: "0.1em",
                        }}>
                            LOADING REVIEWS...
                        </div>
                    ) : filtered.length === 0 ? (
                        <div style={{
                            border: "1px solid #161616", background: "#0a0a0a",
                            padding: "80px", textAlign: "center",
                        }}>
                            <div style={{
                                fontFamily: "'Syne', sans-serif", fontSize: "18px",
                                fontWeight: 700, color: "#2a2a2a", marginBottom: "12px",
                            }}>NO REVIEWS YET</div>
                            <div style={{ fontSize: "12px", color: "#333", marginBottom: "24px" }}>
                                Submit your first code review to get started
                            </div>
                            <button
                                onClick={() => navigate("/review/new")}
                                className="btn-primary"
                            >
                                Start First Review →
                            </button>
                        </div>
                    ) : (
                        <div style={{
                            display: "flex", flexDirection: "column",
                            gap: "1px", background: "#111",
                        }}>
                            {filtered.map((review) => (
                                <ReviewCard
                                    key={review.id}
                                    review={review}
                                    onDelete={handleDelete}
                                    onClick={(id) => navigate(`/review/${id}`)}
                                />
                            ))}
                        </div>
                    )}

                    {/* pagination */}
                    {filtered.length > 0 && (
                        <div style={{
                            display: "flex", justifyContent: "space-between",
                            alignItems: "center", marginTop: "24px",
                            paddingTop: "24px", borderTop: "1px solid #111",
                        }}>
                            <span style={{ fontSize: "11px", color: "#333", letterSpacing: "0.1em" }}>
                                PAGE {page} OF 1
                            </span>
                            <div style={{ display: "flex", gap: "6px" }}>
                                <button
                                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                                    disabled={page === 1}
                                    className="filter-btn"
                                    style={{ opacity: page === 1 ? 0.3 : 1 }}
                                >← PREV</button>
                                <button
                                    onClick={() => setPage((p) => p + 1)}
                                    className="filter-btn"
                                >NEXT →</button>
                            </div>
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
}
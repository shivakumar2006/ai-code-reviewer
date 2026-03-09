import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { useCreateReviewMutation } from "../store/api/reviewApi";
import { useReviewCodeMutation, useReviewGithubMutation, useListGithubFilesQuery } from "../store/api/llmApi";

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
// LANGUAGE CONFIG
// ─────────────────────────────────────────

const LANGUAGES = [
    { id: "go", label: "Go", color: "#00ACD7", ext: ".go" },
    { id: "python", label: "Python", color: "#FFD43B", ext: ".py" },
    { id: "javascript", label: "JavaScript", color: "#F7DF1E", ext: ".js" },
    { id: "typescript", label: "TypeScript", color: "#3178C6", ext: ".ts" },
    { id: "java", label: "Java", color: "#ED8B00", ext: ".java" },
    { id: "rust", label: "Rust", color: "#CE412B", ext: ".rs" },
    { id: "cpp", label: "C++", color: "#659AD2", ext: ".cpp" },
    { id: "other", label: "Other", color: "#666", ext: "" },
];

// ─────────────────────────────────────────
// LINE NUMBERS TEXTAREA
// ─────────────────────────────────────────

function CodeEditor({ value, onChange, language, placeholder }) {
    const textareaRef = useRef(null);
    const linesRef = useRef(null);
    const [lineCount, setLineCount] = useState(1);
    const lang = LANGUAGES.find(l => l.id === language) || LANGUAGES[0];

    useEffect(() => {
        const lines = value ? value.split("\n").length : 1;
        setLineCount(Math.max(lines, 20));
    }, [value]);

    const syncScroll = () => {
        if (linesRef.current && textareaRef.current) {
            linesRef.current.scrollTop = textareaRef.current.scrollTop;
        }
    };

    return (
        <div style={{
            position: "relative", background: "#080808",
            border: "1px solid #1a1a1a",
            borderLeft: `3px solid ${lang.color}40`,
            fontFamily: "'DM Mono', monospace",
            overflow: "hidden",
        }}>
            {/* top bar */}
            <div style={{
                display: "flex", alignItems: "center", justifyContent: "space-between",
                padding: "10px 16px",
                background: "#0a0a0a",
                borderBottom: "1px solid #141414",
            }}>
                <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                    <div style={{ display: "flex", gap: "6px" }}>
                        {["#ff5f57", "#ffbd2e", "#28ca41"].map(c => (
                            <div key={c} style={{ width: "9px", height: "9px", borderRadius: "50%", background: c, opacity: 0.7 }} />
                        ))}
                    </div>
                    <span style={{ fontSize: "10px", color: "#2a2a2a", letterSpacing: "0.1em" }}>
                        code{lang.ext || ".txt"}
                    </span>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                    <div style={{ width: "6px", height: "6px", borderRadius: "50%", background: lang.color }} />
                    <span style={{ fontSize: "9px", color: "#333", letterSpacing: "0.15em" }}>
                        {lang.label.toUpperCase()}
                    </span>
                    <span style={{ fontSize: "9px", color: "#222", letterSpacing: "0.1em" }}>
                        {value ? `${value.split("\n").length} LINES` : "0 LINES"}
                    </span>
                </div>
            </div>

            {/* editor area */}
            <div style={{ display: "flex", maxHeight: "520px", overflow: "hidden" }}>
                {/* line numbers */}
                <div
                    ref={linesRef}
                    style={{
                        minWidth: "52px",
                        background: "#070707",
                        borderRight: "1px solid #111",
                        padding: "16px 0",
                        overflowY: "hidden",
                        userSelect: "none",
                        flexShrink: 0,
                    }}
                >
                    {Array.from({ length: lineCount }, (_, i) => (
                        <div key={i} style={{
                            height: "22px", lineHeight: "22px",
                            paddingRight: "12px", paddingLeft: "12px",
                            fontSize: "11px", color: "#222",
                            textAlign: "right", fontFamily: "'DM Mono', monospace",
                        }}>
                            {i + 1}
                        </div>
                    ))}
                </div>

                {/* textarea */}
                <textarea
                    ref={textareaRef}
                    value={value}
                    onChange={(e) => onChange(e.target.value)}
                    onScroll={syncScroll}
                    placeholder={placeholder}
                    spellCheck={false}
                    style={{
                        flex: 1, background: "transparent",
                        border: "none", outline: "none",
                        color: "#c8c0b8", padding: "16px",
                        fontFamily: "'DM Mono', monospace",
                        fontSize: "13px", lineHeight: "22px",
                        resize: "none",
                        minHeight: "440px",
                        overflowY: "auto",
                        caretColor: "#ff6b35",
                    }}
                />
            </div>

            {/* bottom hint */}
            {!value && (
                <div style={{
                    position: "absolute", bottom: "16px", right: "20px",
                    fontSize: "9px", color: "#1a1a1a", letterSpacing: "0.15em",
                    fontFamily: "'DM Mono', monospace", pointerEvents: "none",
                }}>PASTE CODE HERE</div>
            )}
        </div>
    );
}

// ─────────────────────────────────────────
// GITHUB FILE PICKER
// ─────────────────────────────────────────

function GitHubFilePicker({ token, repo, branch, onSelect }) {
    const [path, setPath] = useState("");
    const [manualPath, setManualPath] = useState("");

    const { data, isFetching, isError } = useListGithubFilesQuery(
        { token, repo, branch, path },
        { skip: !token || !repo }
    );

    const files = data?.files || [];
    const dirs = data?.dirs || [];

    if (!token || !repo) {
        return (
            <div style={{
                padding: "28px", textAlign: "center",
                border: "1px dashed #1e1e1e",
            }}>
                <div style={{ fontSize: "12px", color: "#2a2a2a", marginBottom: "10px" }}>
                    No GitHub connected
                </div>
                <div style={{ fontSize: "10px", color: "#1e1e1e" }}>
                    Go to Settings → GitHub to connect your repo
                </div>
            </div>
        );
    }

    return (
        <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
            {/* breadcrumb */}
            <div style={{
                display: "flex", alignItems: "center", gap: "6px",
                fontSize: "10px", color: "#333", fontFamily: "'DM Mono', monospace",
                flexWrap: "wrap",
            }}>
                <span
                    onClick={() => setPath("")}
                    style={{ color: "#ff6b35", cursor: "pointer" }}
                >{repo}</span>
                {path.split("/").filter(Boolean).map((seg, i, arr) => (
                    <span key={i} style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                        <span style={{ color: "#222" }}>/</span>
                        <span
                            onClick={() => setPath(arr.slice(0, i + 1).join("/"))}
                            style={{
                                color: i === arr.length - 1 ? "#888" : "#ff6b35",
                                cursor: "pointer",
                            }}
                        >{seg}</span>
                    </span>
                ))}
                {isFetching && <span style={{ color: "#2a2a2a", animation: "pulse 1s ease infinite" }}>loading...</span>}
            </div>

            {/* file tree */}
            <div style={{
                border: "1px solid #141414", background: "#090909",
                maxHeight: "260px", overflowY: "auto",
            }}>
                {path && (
                    <div
                        onClick={() => setPath(path.split("/").slice(0, -1).join("/"))}
                        style={{
                            display: "flex", alignItems: "center", gap: "10px",
                            padding: "10px 14px", cursor: "pointer",
                            borderBottom: "1px solid #0f0f0f",
                            color: "#444", fontSize: "12px",
                            fontFamily: "'DM Mono', monospace",
                            transition: "background 0.15s",
                        }}
                        onMouseEnter={(e) => e.currentTarget.style.background = "#0d0d0d"}
                        onMouseLeave={(e) => e.currentTarget.style.background = "transparent"}
                    >
                        <span style={{ fontSize: "14px" }}>←</span>
                        <span>..</span>
                    </div>
                )}

                {dirs.map(d => (
                    <div
                        key={d}
                        onClick={() => setPath(path ? `${path}/${d}` : d)}
                        style={{
                            display: "flex", alignItems: "center", gap: "10px",
                            padding: "10px 14px", cursor: "pointer",
                            borderBottom: "1px solid #0a0a0a",
                            fontSize: "12px", fontFamily: "'DM Mono', monospace",
                            transition: "background 0.15s",
                        }}
                        onMouseEnter={(e) => e.currentTarget.style.background = "#0d0d0d"}
                        onMouseLeave={(e) => e.currentTarget.style.background = "transparent"}
                    >
                        <span style={{ color: "#ffd700", fontSize: "13px" }}>◈</span>
                        <span style={{ color: "#666" }}>{d}/</span>
                    </div>
                ))}

                {files.map(f => (
                    <div
                        key={f}
                        onClick={() => onSelect(path ? `${path}/${f}` : f)}
                        style={{
                            display: "flex", alignItems: "center", gap: "10px",
                            padding: "10px 14px", cursor: "pointer",
                            borderBottom: "1px solid #0a0a0a",
                            fontSize: "12px", fontFamily: "'DM Mono', monospace",
                            transition: "all 0.15s",
                        }}
                        onMouseEnter={(e) => {
                            e.currentTarget.style.background = "#0f0f0f";
                            e.currentTarget.style.borderLeftColor = "#ff6b35";
                        }}
                        onMouseLeave={(e) => {
                            e.currentTarget.style.background = "transparent";
                            e.currentTarget.style.borderLeftColor = "transparent";
                        }}
                    >
                        <span style={{ color: "#2a2a2a", fontSize: "13px" }}>◇</span>
                        <span style={{ color: "#888", flex: 1 }}>{f}</span>
                        <span style={{ color: "#ff6b35", fontSize: "10px", letterSpacing: "0.1em" }}>SELECT →</span>
                    </div>
                ))}

                {!isFetching && files.length === 0 && dirs.length === 0 && (
                    <div style={{ padding: "24px", textAlign: "center", fontSize: "11px", color: "#222" }}>
                        Empty directory
                    </div>
                )}
            </div>

            {/* manual path input */}
            <div style={{ display: "flex", gap: "8px" }}>
                <input
                    value={manualPath}
                    onChange={(e) => setManualPath(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && manualPath && onSelect(manualPath)}
                    placeholder="Or type a path directly: src/main.go"
                    style={{
                        flex: 1, background: "#090909",
                        border: "1px solid #161616", borderLeft: "3px solid #1a1a1a",
                        color: "#888", padding: "10px 14px",
                        fontFamily: "'DM Mono', monospace", fontSize: "11px",
                        outline: "none", transition: "all 0.2s",
                    }}
                    onFocus={(e) => e.target.style.borderLeftColor = "#ff6b35"}
                    onBlur={(e) => e.target.style.borderLeftColor = "#1a1a1a"}
                />
                <button
                    onClick={() => manualPath && onSelect(manualPath)}
                    style={{
                        background: "#ff6b3515", border: "1px solid #ff6b3530",
                        color: "#ff6b35", padding: "0 16px",
                        cursor: "pointer", fontFamily: "'DM Mono', monospace",
                        fontSize: "10px", letterSpacing: "0.15em",
                        transition: "all 0.2s",
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.background = "#ff6b3525"}
                    onMouseLeave={(e) => e.currentTarget.style.background = "#ff6b3515"}
                >
                    USE PATH →
                </button>
            </div>
        </div>
    );
}

// ─────────────────────────────────────────
// LOADING / PROCESSING OVERLAY
// ─────────────────────────────────────────

function ProcessingOverlay({ stage }) {
    const stages = [
        { id: "sending", label: "Sending to LLM service" },
        { id: "analyzing", label: "Analyzing code structure" },
        { id: "reviewing", label: "Generating review" },
        { id: "saving", label: "Saving results" },
    ];

    return (
        <div style={{
            position: "fixed", inset: 0, zIndex: 200,
            background: "rgba(8,8,8,0.92)",
            display: "flex", alignItems: "center", justifyContent: "center",
            backdropFilter: "blur(4px)",
        }}>
            <div style={{
                border: "1px solid #1a1a1a", background: "#0a0a0a",
                padding: "48px 56px", minWidth: "360px",
                display: "flex", flexDirection: "column", gap: "32px",
                alignItems: "center", position: "relative",
                animation: "fadeUp 0.3s ease",
            }}>
                {/* corner accents */}
                {[
                    { top: 0, left: 0, borderBottom: "none", borderRight: "none" },
                    { top: 0, right: 0, borderBottom: "none", borderLeft: "none" },
                    { bottom: 0, left: 0, borderTop: "none", borderRight: "none" },
                    { bottom: 0, right: 0, borderTop: "none", borderLeft: "none" },
                ].map((s, i) => (
                    <div key={i} style={{
                        position: "absolute", width: "16px", height: "16px",
                        border: "1px solid #ff6b35", ...s,
                    }} />
                ))}

                {/* spinner */}
                <div style={{ position: "relative", width: "64px", height: "64px" }}>
                    <div style={{
                        position: "absolute", inset: 0,
                        border: "2px solid #1a1a1a",
                        borderTopColor: "#ff6b35",
                        borderRadius: "50%",
                        animation: "spin 0.8s linear infinite",
                    }} />
                    <div style={{
                        position: "absolute", inset: "12px",
                        border: "1.5px solid #1a1a1a",
                        borderTopColor: "#ff6b3560",
                        borderRadius: "50%",
                        animation: "spinR 1.2s linear infinite",
                    }} />
                    <div style={{
                        position: "absolute", inset: 0,
                        display: "flex", alignItems: "center", justifyContent: "center",
                        fontFamily: "'Syne', sans-serif", fontSize: "18px",
                        fontWeight: 800, color: "#ff6b35",
                    }}>AI</div>
                </div>

                <div style={{ textAlign: "center" }}>
                    <div style={{
                        fontFamily: "'Syne', sans-serif", fontWeight: 800,
                        fontSize: "16px", marginBottom: "8px",
                    }}>Reviewing Your Code</div>
                    <div style={{
                        fontSize: "11px", color: "#444",
                        fontFamily: "'DM Mono', monospace",
                        letterSpacing: "0.1em",
                    }}>{stage || "Processing..."}</div>
                </div>

                {/* stage list */}
                <div style={{ display: "flex", flexDirection: "column", gap: "8px", width: "100%" }}>
                    {stages.map((s, i) => {
                        const currentIdx = stages.findIndex(st => st.id === stage?.toLowerCase().replace(/\s/g, ""));
                        const isDone = i < currentIdx;
                        const isActive = i === currentIdx;
                        return (
                            <div key={s.id} style={{
                                display: "flex", alignItems: "center", gap: "10px",
                                opacity: isDone ? 0.4 : isActive ? 1 : 0.2,
                                transition: "opacity 0.3s",
                            }}>
                                <div style={{
                                    width: "16px", height: "16px", borderRadius: "50%",
                                    border: `1px solid ${isDone ? "#47A248" : isActive ? "#ff6b35" : "#1e1e1e"}`,
                                    background: isDone ? "#47A24815" : "transparent",
                                    display: "flex", alignItems: "center", justifyContent: "center",
                                    flexShrink: 0, fontSize: "9px",
                                    color: isDone ? "#47A248" : isActive ? "#ff6b35" : "#1e1e1e",
                                }}>
                                    {isDone ? "✓" : isActive ? "●" : "○"}
                                </div>
                                <span style={{
                                    fontSize: "11px", color: isDone ? "#47A248" : isActive ? "#f0ece4" : "#2a2a2a",
                                    fontFamily: "'DM Mono', monospace", letterSpacing: "0.05em",
                                }}>{s.label}</span>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}

// ─────────────────────────────────────────
// MAIN PAGE
// ─────────────────────────────────────────

export default function NewReviewPage() {
    const navigate = useNavigate();
    const user = useSelector(s => s.auth.user);

    // form state
    const [mode, setMode] = useState("paste"); // "paste" | "github"
    const [code, setCode] = useState("");
    const [title, setTitle] = useState("");
    const [language, setLanguage] = useState("go");
    const [description, setDescription] = useState("");

    // github mode state
    const [githubPath, setGithubPath] = useState("");
    const [commitBack, setCommitBack] = useState(false);

    // ui state
    const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
    const [processing, setProcessing] = useState(false);
    const [processStage, setProcessStage] = useState("");
    const [error, setError] = useState("");

    // focus indicators
    const [titleFocused, setTitleFocused] = useState(false);
    const [descFocused, setDescFocused] = useState(false);

    // TODO: pull from user settings in real app
    const githubToken = user?.github_token || "";
    const githubRepo = user?.github_repo || "";
    const githubBranch = user?.github_branch || "main";

    const [createReview] = useCreateReviewMutation();
    const [reviewCode] = useReviewCodeMutation();
    const [reviewGithub] = useReviewGithubMutation();

    useEffect(() => {
        const fn = (e) => setMousePos({ x: e.clientX, y: e.clientY });
        window.addEventListener("mousemove", fn);
        return () => window.removeEventListener("mousemove", fn);
    }, []);

    const activeLang = LANGUAGES.find(l => l.id === language);

    // ── SUBMIT ──────────────────────────────
    const handleSubmit = async () => {
        if (mode === "paste" && !code.trim()) { setError("Paste some code first!"); return; }
        if (mode === "github" && !githubPath) { setError("Select a file from GitHub first!"); return; }
        if (!title.trim()) { setError("Give this review a title!"); return; }
        setError("");
        setProcessing(true);

        try {
            // 1. create review record
            setProcessStage("Sending to LLM service");
            const reviewRecord = await createReview({
                title: title.trim(),
                code: mode === "paste" ? code : "",
                language,
                description: description.trim(),
                github_path: mode === "github" ? githubPath : undefined,
            }).unwrap();

            // 2. call LLM
            setProcessStage("Analyzing code structure");
            await new Promise(r => setTimeout(r, 600)); // slight UX delay

            setProcessStage("Generating review");
            if (mode === "paste") {
                await reviewCode({
                    review_id: reviewRecord._id || reviewRecord.id,
                    code,
                    language,
                    description,
                }).unwrap();
            } else {
                await reviewGithub({
                    review_id: reviewRecord._id || reviewRecord.id,
                    github_token: githubToken,
                    repo: githubRepo,
                    branch: githubBranch,
                    file_path: githubPath,
                    commit_back: commitBack,
                }).unwrap();
            }

            setProcessStage("Saving results");
            await new Promise(r => setTimeout(r, 400));

            // redirect to review detail
            navigate(`/review/${reviewRecord._id || reviewRecord.id}`);

        } catch (err) {
            setProcessing(false);
            setProcessStage("");
            setError(err?.data?.detail || err?.data?.message || "Something went wrong — check your LLM settings.");
        }
    };

    const charCount = code.length;
    const lineCount = code ? code.split("\n").length : 0;
    const canSubmit = title.trim() && (mode === "paste" ? code.trim() : githubPath);

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
                .mode-btn {
                    flex: 1; padding: 14px; background: #090909;
                    border: 1px solid #141414; cursor: pointer;
                    font-family: 'DM Mono', monospace; font-size: 10px;
                    letter-spacing: 0.18em; text-transform: uppercase;
                    transition: all 0.2s; color: #333;
                    display: flex; flex-direction: column; align-items: center; gap: 6px;
                }
                .mode-btn:hover { border-color: #2a2a2a; color: #666; }
                .mode-btn.active {
                    background: #0d0d0d; border-color: #ff6b3550;
                    border-bottom: 2px solid #ff6b35; color: #ff6b35;
                }
                .lang-pill {
                    padding: 7px 14px; background: transparent;
                    border: 1px solid #161616; cursor: pointer;
                    font-family: 'DM Mono', monospace; font-size: 10px;
                    transition: all 0.18s; color: #333;
                    display: flex; align-items: center; gap: 7px;
                }
                .lang-pill:hover { border-color: #2a2a2a; color: #666; }
                .lang-pill.active { color: #f0ece4; }
                @keyframes fadeUp {
                    from { opacity: 0; transform: translateY(12px); }
                    to   { opacity: 1; transform: translateY(0); }
                }
                @keyframes spin  { to { transform: rotate(360deg); } }
                @keyframes spinR { to { transform: rotate(-360deg); } }
                @keyframes pulse { 0%,100% { opacity: 1; } 50% { opacity: 0.3; } }
                @keyframes shake {
                    0%,100% { transform: translateX(0); }
                    20%,60% { transform: translateX(-4px); }
                    40%,80% { transform: translateX(4px); }
                }
                .fu { animation: fadeUp 0.4s ease forwards; }
                .s1 { animation-delay: 0.04s; opacity: 0; }
                .s2 { animation-delay: 0.12s; opacity: 0; }
                .s3 { animation-delay: 0.22s; opacity: 0; }
                .s4 { animation-delay: 0.32s; opacity: 0; }
                .shake { animation: shake 0.4s ease; }
            `}</style>

            {/* cursor glow */}
            <div style={{
                position: "fixed", pointerEvents: "none", zIndex: 9999,
                width: "280px", height: "280px", borderRadius: "50%",
                background: "radial-gradient(circle, rgba(255,107,53,0.055) 0%, transparent 70%)",
                transform: "translate(-50%, -50%)",
                left: mousePos.x, top: mousePos.y,
                transition: "left 0.06s, top 0.06s",
            }} />

            <GridBackground />
            <NoiseBg />

            {processing && <ProcessingOverlay stage={processStage} />}

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

                {/* breadcrumb */}
                <div style={{
                    display: "flex", alignItems: "center", gap: "10px",
                    fontSize: "11px", color: "#2a2a2a",
                    fontFamily: "'DM Mono', monospace",
                }}>
                    <span
                        className="nav-link"
                        onClick={() => navigate("/dashboard")}
                        style={{ color: "#444" }}
                    >Dashboard</span>
                    <span>→</span>
                    <span style={{ color: "#ff6b35" }}>New Review</span>
                </div>

                <button
                    onClick={() => navigate("/dashboard")}
                    style={{
                        background: "none", border: "1px solid #1e1e1e",
                        color: "#444", padding: "8px 18px", cursor: "pointer",
                        fontFamily: "'DM Mono', monospace", fontSize: "10px",
                        letterSpacing: "0.15em", transition: "all 0.2s",
                    }}
                    onMouseEnter={(e) => { e.currentTarget.style.borderColor = "#2a2a2a"; e.currentTarget.style.color = "#888"; }}
                    onMouseLeave={(e) => { e.currentTarget.style.borderColor = "#1e1e1e"; e.currentTarget.style.color = "#444"; }}
                >← BACK</button>
            </nav>

            {/* ── MAIN ── */}
            <main style={{
                maxWidth: "1200px", margin: "0 auto",
                padding: "96px 48px 80px",
                position: "relative", zIndex: 1,
            }}>

                {/* ── PAGE HEADER ── */}
                <div className="fu s1" style={{
                    display: "flex", justifyContent: "space-between",
                    alignItems: "flex-end", marginBottom: "44px",
                }}>
                    <div>
                        <div style={{
                            fontSize: "9px", letterSpacing: "0.3em", color: "#ff6b35",
                            fontFamily: "'DM Mono', monospace", marginBottom: "10px",
                            display: "flex", alignItems: "center", gap: "10px",
                        }}>
                            <span style={{ width: "22px", height: "1px", background: "#ff6b35", display: "inline-block" }} />
                            NEW REVIEW
                        </div>
                        <h1 style={{
                            fontFamily: "'Syne', sans-serif",
                            fontSize: "clamp(26px, 4vw, 42px)",
                            fontWeight: 800, lineHeight: 1.05,
                        }}>
                            Submit Code<br />
                            <span style={{ color: "#ff6b35" }}>for Review</span>
                        </h1>
                    </div>

                    {/* live stats */}
                    {mode === "paste" && code && (
                        <div style={{
                            display: "flex", gap: "24px", alignItems: "flex-end",
                        }}>
                            {[
                                { label: "LINES", value: lineCount },
                                { label: "CHARS", value: charCount.toLocaleString() },
                                { label: "LANG", value: activeLang?.label?.toUpperCase() },
                            ].map(s => (
                                <div key={s.label} style={{ textAlign: "right" }}>
                                    <div style={{
                                        fontFamily: "'Syne', sans-serif",
                                        fontSize: "20px", fontWeight: 800,
                                        color: "#ff6b35",
                                    }}>{s.value}</div>
                                    <div style={{
                                        fontSize: "9px", color: "#2a2a2a",
                                        letterSpacing: "0.2em", marginTop: "2px",
                                    }}>{s.label}</div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* ── TWO-COLUMN LAYOUT ── */}
                <div style={{ display: "grid", gridTemplateColumns: "1fr 340px", gap: "24px" }}>

                    {/* ── LEFT: CODE INPUT ── */}
                    <div className="fu s2" style={{ display: "flex", flexDirection: "column", gap: "16px" }}>

                        {/* mode toggle */}
                        <div style={{ display: "flex", gap: "6px" }}>
                            <button
                                className={`mode-btn ${mode === "paste" ? "active" : ""}`}
                                onClick={() => setMode("paste")}
                            >
                                <span style={{ fontSize: "16px" }}>⌨</span>
                                <span>Paste Code</span>
                            </button>
                            <button
                                className={`mode-btn ${mode === "github" ? "active" : ""}`}
                                onClick={() => setMode("github")}
                            >
                                <span style={{ fontSize: "16px" }}>⬡</span>
                                <span>From GitHub</span>
                            </button>
                        </div>

                        {/* paste mode */}
                        {mode === "paste" && (
                            <div style={{ display: "flex", flexDirection: "column", gap: "0" }}>
                                <CodeEditor
                                    value={code}
                                    onChange={setCode}
                                    language={language}
                                    placeholder={`// Paste your ${activeLang?.label || "code"} here...`}
                                />

                                {/* code actions */}
                                {code && (
                                    <div style={{
                                        display: "flex", justifyContent: "flex-end",
                                        padding: "8px 12px",
                                        background: "#090909",
                                        border: "1px solid #1a1a1a",
                                        borderTop: "none",
                                        gap: "8px",
                                    }}>
                                        <button
                                            onClick={() => setCode("")}
                                            style={{
                                                background: "none", border: "none",
                                                color: "#2a2a2a", cursor: "pointer",
                                                fontSize: "10px", letterSpacing: "0.1em",
                                                fontFamily: "'DM Mono', monospace",
                                                transition: "color 0.2s",
                                            }}
                                            onMouseEnter={(e) => e.target.style.color = "#ff3b3b"}
                                            onMouseLeave={(e) => e.target.style.color = "#2a2a2a"}
                                        >CLEAR</button>
                                    </div>
                                )}
                            </div>
                        )}

                        {/* github mode */}
                        {mode === "github" && (
                            <div style={{
                                border: "1px solid #1a1a1a", background: "#090909",
                                padding: "20px",
                            }}>
                                <div style={{
                                    fontSize: "10px", letterSpacing: "0.2em", color: "#333",
                                    fontFamily: "'DM Mono', monospace", marginBottom: "16px",
                                }}>SELECT FILE FROM REPO</div>

                                <GitHubFilePicker
                                    token={githubToken}
                                    repo={githubRepo}
                                    branch={githubBranch}
                                    onSelect={(path) => {
                                        setGithubPath(path);
                                        // auto-detect language from extension
                                        const ext = path.split(".").pop()?.toLowerCase();
                                        const match = LANGUAGES.find(l => l.ext === `.${ext}`);
                                        if (match) setLanguage(match.id);
                                        if (!title) setTitle(path.split("/").pop() || path);
                                    }}
                                />

                                {/* selected file display */}
                                {githubPath && (
                                    <div style={{
                                        marginTop: "16px", padding: "12px 16px",
                                        background: "#0a0a0a",
                                        border: "1px solid #ff6b3530",
                                        borderLeft: "3px solid #ff6b35",
                                        display: "flex", justifyContent: "space-between",
                                        alignItems: "center",
                                    }}>
                                        <div>
                                            <div style={{
                                                fontSize: "9px", color: "#ff6b35",
                                                letterSpacing: "0.15em", marginBottom: "4px",
                                            }}>SELECTED FILE</div>
                                            <div style={{
                                                fontSize: "12px", color: "#f0ece4",
                                                fontFamily: "'DM Mono', monospace",
                                            }}>{githubPath}</div>
                                        </div>
                                        <button
                                            onClick={() => setGithubPath("")}
                                            style={{
                                                background: "none", border: "none",
                                                color: "#444", cursor: "pointer",
                                                fontSize: "16px",
                                            }}
                                        >✕</button>
                                    </div>
                                )}

                                {/* commit-back option */}
                                {githubPath && (
                                    <div
                                        onClick={() => setCommitBack(!commitBack)}
                                        style={{
                                            marginTop: "12px",
                                            display: "flex", alignItems: "center", gap: "12px",
                                            padding: "12px 16px",
                                            background: commitBack ? "#0a100a" : "#090909",
                                            border: `1px solid ${commitBack ? "#47A24830" : "#141414"}`,
                                            cursor: "pointer", transition: "all 0.2s",
                                        }}
                                    >
                                        <div style={{
                                            width: "16px", height: "16px",
                                            border: `2px solid ${commitBack ? "#47A248" : "#2a2a2a"}`,
                                            background: commitBack ? "#47A24820" : "transparent",
                                            display: "flex", alignItems: "center", justifyContent: "center",
                                            flexShrink: 0, transition: "all 0.2s",
                                        }}>
                                            {commitBack && <span style={{ color: "#47A248", fontSize: "11px" }}>✓</span>}
                                        </div>
                                        <div>
                                            <div style={{
                                                fontSize: "11px", color: commitBack ? "#47A248" : "#444",
                                                fontFamily: "'DM Mono', monospace", transition: "color 0.2s",
                                            }}>Auto-commit reviewed code</div>
                                            <div style={{ fontSize: "10px", color: "#2a2a2a", marginTop: "2px" }}>
                                                Push the fixed code back to {githubBranch || "main"}
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>

                    {/* ── RIGHT: METADATA + SUBMIT ── */}
                    <div className="fu s3" style={{ display: "flex", flexDirection: "column", gap: "16px" }}>

                        {/* title */}
                        <div style={{ display: "flex", flexDirection: "column", gap: "7px" }}>
                            <label style={{
                                fontSize: "9px", letterSpacing: "0.25em", color: "#333",
                                textTransform: "uppercase", fontFamily: "'DM Mono', monospace",
                            }}>Review Title</label>
                            <input
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                                onFocus={() => setTitleFocused(true)}
                                onBlur={() => setTitleFocused(false)}
                                placeholder="e.g. Auth Handler, Payment Service..."
                                maxLength={80}
                                style={{
                                    background: titleFocused ? "#0f0f0f" : "#0a0a0a",
                                    border: "1px solid #1a1a1a",
                                    borderLeft: `3px solid ${titleFocused ? "#ff6b35" : "#1a1a1a"}`,
                                    color: "#f0ece4", padding: "12px 14px",
                                    fontFamily: "'DM Mono', monospace", fontSize: "13px",
                                    outline: "none", transition: "all 0.2s",
                                    width: "100%",
                                }}
                            />
                            {title && (
                                <div style={{
                                    fontSize: "9px", color: "#222",
                                    textAlign: "right", letterSpacing: "0.1em",
                                }}>{title.length}/80</div>
                            )}
                        </div>

                        {/* language */}
                        <div style={{ display: "flex", flexDirection: "column", gap: "7px" }}>
                            <label style={{
                                fontSize: "9px", letterSpacing: "0.25em", color: "#333",
                                textTransform: "uppercase", fontFamily: "'DM Mono', monospace",
                            }}>Language</label>
                            <div style={{
                                display: "grid", gridTemplateColumns: "repeat(2, 1fr)",
                                gap: "4px",
                            }}>
                                {LANGUAGES.map(l => (
                                    <button
                                        key={l.id}
                                        className={`lang-pill ${language === l.id ? "active" : ""}`}
                                        onClick={() => setLanguage(l.id)}
                                        style={{
                                            borderColor: language === l.id ? `${l.color}50` : "#161616",
                                            background: language === l.id ? `${l.color}08` : "transparent",
                                        }}
                                    >
                                        <div style={{
                                            width: "6px", height: "6px",
                                            borderRadius: "50%", background: l.color,
                                            flexShrink: 0,
                                            opacity: language === l.id ? 1 : 0.3,
                                        }} />
                                        <span style={{
                                            color: language === l.id ? "#f0ece4" : "#333",
                                            transition: "color 0.18s",
                                        }}>{l.label}</span>
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* description (optional) */}
                        <div style={{ display: "flex", flexDirection: "column", gap: "7px" }}>
                            <div style={{ display: "flex", justifyContent: "space-between" }}>
                                <label style={{
                                    fontSize: "9px", letterSpacing: "0.25em", color: "#333",
                                    textTransform: "uppercase", fontFamily: "'DM Mono', monospace",
                                }}>Context</label>
                                <span style={{ fontSize: "9px", color: "#1e1e1e", letterSpacing: "0.1em" }}>
                                    OPTIONAL
                                </span>
                            </div>
                            <textarea
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                onFocus={() => setDescFocused(true)}
                                onBlur={() => setDescFocused(false)}
                                placeholder="What should the AI focus on? Any specific concerns?"
                                rows={3}
                                style={{
                                    background: descFocused ? "#0f0f0f" : "#0a0a0a",
                                    border: "1px solid #1a1a1a",
                                    borderLeft: `3px solid ${descFocused ? "#ff6b35" : "#1a1a1a"}`,
                                    color: "#888", padding: "12px 14px",
                                    fontFamily: "'DM Mono', monospace", fontSize: "12px",
                                    lineHeight: 1.7, resize: "vertical",
                                    outline: "none", transition: "all 0.2s",
                                    width: "100%",
                                }}
                            />
                        </div>

                        {/* review checklist — what will be checked */}
                        <div style={{
                            border: "1px solid #141414", background: "#090909",
                            padding: "16px",
                        }}>
                            <div style={{
                                fontSize: "9px", letterSpacing: "0.2em", color: "#2a2a2a",
                                fontFamily: "'DM Mono', monospace", marginBottom: "12px",
                            }}>WHAT GETS REVIEWED</div>
                            <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                                {[
                                    { icon: "🔴", label: "Bugs & runtime errors" },
                                    { icon: "🟡", label: "Security vulnerabilities" },
                                    { icon: "🟠", label: "Performance issues" },
                                    { icon: "🔵", label: "Code style & patterns" },
                                    { icon: "🟢", label: "Best practices" },
                                    { icon: "⚡", label: "Fixed code suggestion" },
                                ].map(item => (
                                    <div key={item.label} style={{
                                        display: "flex", alignItems: "center", gap: "10px",
                                    }}>
                                        <span style={{ fontSize: "12px" }}>{item.icon}</span>
                                        <span style={{
                                            fontSize: "11px", color: "#2e2e2e",
                                            fontFamily: "'DM Mono', monospace",
                                        }}>{item.label}</span>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* error */}
                        {error && (
                            <div style={{
                                padding: "10px 14px",
                                background: "#120606",
                                border: "1px solid #ff3b3b25",
                                borderLeft: "3px solid #ff4444",
                                color: "#ff7070", fontSize: "11px",
                                fontFamily: "'DM Mono', monospace",
                                animation: "shake 0.4s ease",
                            }}>
                                ✕ {error}
                            </div>
                        )}

                        {/* SUBMIT BUTTON */}
                        <button
                            onClick={handleSubmit}
                            disabled={!canSubmit || processing}
                            style={{
                                background: canSubmit ? "#ff6b35" : "#111",
                                border: "none",
                                color: canSubmit ? "#080808" : "#2a2a2a",
                                padding: "16px",
                                cursor: canSubmit ? "pointer" : "not-allowed",
                                fontFamily: "'DM Mono', monospace",
                                fontSize: "11px", letterSpacing: "0.2em",
                                fontWeight: 500, transition: "all 0.25s",
                                clipPath: "polygon(10px 0%, 100% 0%, calc(100% - 10px) 100%, 0% 100%)",
                                width: "100%",
                                display: "flex", alignItems: "center", justifyContent: "center",
                                gap: "10px",
                            }}
                            onMouseEnter={(e) => { if (canSubmit) e.currentTarget.style.background = "#ff8c5a"; }}
                            onMouseLeave={(e) => { if (canSubmit) e.currentTarget.style.background = "#ff6b35"; }}
                        >
                            {canSubmit && (
                                <div style={{
                                    width: "24px", height: "24px", background: "#08080820",
                                    clipPath: "polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)",
                                }} />
                            )}
                            {processing ? "REVIEWING..." : "RUN AI REVIEW →"}
                        </button>

                        {/* footer note */}
                        <div style={{
                            fontSize: "9px", color: "#1a1a1a", letterSpacing: "0.1em",
                            textAlign: "center", lineHeight: 1.6,
                            fontFamily: "'DM Mono', monospace",
                        }}>
                            Uses your configured LLM provider from Settings.<br />
                            Results saved to your dashboard.
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}
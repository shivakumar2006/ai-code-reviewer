import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import {
    useTestProviderMutation,
    useTestGithubMutation,
    useGetOllamaModelsQuery,
} from "../store/api/llmApi";

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
// INLINE SVG LOGOS — no external deps
// ─────────────────────────────────────────

function ProviderLogo({ id, size = 28, dimmed = false }) {
    const opacity = dimmed ? 0.3 : 1;
    const s = { width: size, height: size, display: "block", opacity, transition: "opacity 0.25s" };

    if (id === "anthropic") return (
        <svg style={s} viewBox="0 0 41 24" fill="none">
            <path d="M23.685 0h-6.099l7.573 24h6.098L23.685 0ZM0 24h6.214l1.638-5.283H16.7L18.338 24h6.214L16.3 0h-8.05L0 24Zm9.4-9.894 2.952-9.509 2.952 9.51H9.4Z" fill="#cc785c" />
        </svg>
    );

    if (id === "openai") return (
        <svg style={s} viewBox="0 0 24 24" fill="none">
            <path d="M22.282 9.821a5.985 5.985 0 0 0-.516-4.91 6.046 6.046 0 0 0-6.51-2.9A6.065 6.065 0 0 0 4.981 4.18a5.985 5.985 0 0 0-3.998 2.9 6.046 6.046 0 0 0 .743 7.097 5.98 5.98 0 0 0 .51 4.911 6.051 6.051 0 0 0 6.515 2.9A5.985 5.985 0 0 0 13.26 24a6.056 6.056 0 0 0 5.772-4.206 5.99 5.99 0 0 0 3.997-2.9 6.056 6.056 0 0 0-.747-7.073zM13.26 22.43a4.476 4.476 0 0 1-2.876-1.04l.141-.081 4.779-2.758a.795.795 0 0 0 .392-.681v-6.737l2.02 1.168a.071.071 0 0 1 .038.052v5.583a4.504 4.504 0 0 1-4.494 4.494zM3.6 18.304a4.47 4.47 0 0 1-.535-3.014l.142.085 4.783 2.759a.771.771 0 0 0 .78 0l5.843-3.369v2.332a.08.08 0 0 1-.033.062L9.74 19.95a4.5 4.5 0 0 1-6.14-1.646zM2.34 7.896a4.485 4.485 0 0 1 2.366-1.973V11.6a.766.766 0 0 0 .388.677l5.815 3.355-2.02 1.168a.076.076 0 0 1-.071 0L4.049 14.2A4.503 4.503 0 0 1 2.34 7.896zm16.597 3.855l-5.843-3.369 2.02-1.168a.076.076 0 0 1 .071 0l4.77 2.754a4.5 4.5 0 0 1-.689 8.117v-5.678a.79.79 0 0 0-.329-.656zm2.01-3.023l-.141-.085-4.774-2.782a.776.776 0 0 0-.785 0L9.409 9.23V6.897a.066.066 0 0 1 .028-.061l4.774-2.752a4.5 4.5 0 0 1 6.676 4.66zm-12.64 4.135l-2.02-1.164a.08.08 0 0 1-.038-.057V6.075a4.5 4.5 0 0 1 7.375-3.453l-.142.08L8.704 5.46a.795.795 0 0 0-.393.681zm1.097-2.365l2.602-1.5 2.607 1.497v2.994l-2.597 1.5-2.607-1.497z" fill="#74aa9c" />
        </svg>
    );

    if (id === "groq") return (
        <svg style={s} viewBox="0 0 24 24" fill="none">
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm0-14c-3.31 0-6 2.69-6 6s2.69 6 6 6 6-2.69 6-6-2.69-6-6-6zm0 10c-2.21 0-4-1.79-4-4s1.79-4 4-4 4 1.79 4 4-1.79 4-4 4zm0-6c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z" fill="#f55036" />
        </svg>
    );

    if (id === "gemini") return (
        <svg style={s} viewBox="0 0 24 24" fill="none">
            <path d="M12 24A14.304 14.304 0 0 0 0 12 14.304 14.304 0 0 0 12 0a14.305 14.305 0 0 0 12 12 14.305 14.305 0 0 0-12 12" fill="url(#gemGrad)" />
            <defs>
                <linearGradient id="gemGrad" x1="0" y1="0" x2="24" y2="24" gradientUnits="userSpaceOnUse">
                    <stop offset="0%" stopColor="#4285f4" />
                    <stop offset="100%" stopColor="#a8c7fa" />
                </linearGradient>
            </defs>
        </svg>
    );

    if (id === "ollama") return (
        <svg style={s} viewBox="0 0 32 32" fill="none">
            {/* head */}
            <circle cx="16" cy="11" r="7" stroke="#ff6b35" strokeWidth="1.8" fill="none" />
            {/* eyes */}
            <circle cx="13" cy="10" r="1.4" fill="#ff6b35" />
            <circle cx="19" cy="10" r="1.4" fill="#ff6b35" />
            {/* smile */}
            <path d="M13 13.5 Q16 16 19 13.5" stroke="#ff6b35" strokeWidth="1.4" fill="none" strokeLinecap="round" />
            {/* body */}
            <path d="M7 19.5 Q5 22 6 26 Q8 29 11 28 Q13 30 16 30 Q19 30 21 28 Q24 29 26 26 Q27 22 25 19.5 Q22 17 16 17 Q10 17 7 19.5Z" stroke="#ff6b35" strokeWidth="1.8" fill="none" />
            {/* belly dots */}
            <circle cx="12" cy="23" r="1" fill="#ff6b35" />
            <circle cx="20" cy="23" r="1" fill="#ff6b35" />
        </svg>
    );

    return null;
}

// ─────────────────────────────────────────
// PROVIDER CONFIG
// ─────────────────────────────────────────

const PROVIDERS = [
    {
        id: "anthropic",
        name: "Anthropic",
        tagline: "Best code comprehension",
        color: "#cc785c",
        defaultModel: "claude-haiku-4-5",
        models: [
            { id: "claude-haiku-4-5", label: "Haiku 4.5", note: "Fastest · Cheapest" },
            { id: "claude-sonnet-4-5", label: "Sonnet 4.5", note: "Best balance" },
            { id: "claude-opus-4-5", label: "Opus 4.5", note: "Most capable" },
        ],
        needsKey: true,
        badge: "BEST QUALITY",
        badgeColor: "#cc785c",
        keyPlaceholder: "sk-ant-api03-...",
        keyHint: "console.anthropic.com → API Keys",
    },
    {
        id: "openai",
        name: "OpenAI",
        tagline: "Industry standard GPT",
        color: "#74aa9c",
        defaultModel: "gpt-4o-mini",
        models: [
            { id: "gpt-4o-mini", label: "GPT-4o Mini", note: "Fast · Affordable" },
            { id: "gpt-4o", label: "GPT-4o", note: "Balanced" },
            { id: "gpt-4-turbo", label: "GPT-4 Turbo", note: "128k context" },
        ],
        needsKey: true,
        badge: "POPULAR",
        badgeColor: "#74aa9c",
        keyPlaceholder: "sk-proj-...",
        keyHint: "platform.openai.com → API Keys",
    },
    {
        id: "groq",
        name: "Groq",
        tagline: "Ultra-fast Llama inference",
        color: "#f55036",
        defaultModel: "llama-3.1-70b-versatile",
        models: [
            { id: "llama-3.1-70b-versatile", label: "Llama 3.1 70B", note: "Best free model" },
            { id: "llama-3.1-8b-instant", label: "Llama 3.1 8B", note: "Instant speed" },
            { id: "mixtral-8x7b-32768", label: "Mixtral 8x7B", note: "32k ctx" },
        ],
        needsKey: true,
        badge: "FREE TIER",
        badgeColor: "#47A248",
        keyPlaceholder: "gsk_...",
        keyHint: "console.groq.com → Free to sign up",
    },
    {
        id: "gemini",
        name: "Gemini",
        tagline: "Google's 1M context model",
        color: "#4285f4",
        defaultModel: "gemini-1.5-flash",
        models: [
            { id: "gemini-1.5-flash", label: "1.5 Flash", note: "Fast · Free tier" },
            { id: "gemini-1.5-pro", label: "1.5 Pro", note: "1M context" },
            { id: "gemini-2.0-flash", label: "2.0 Flash", note: "Latest" },
        ],
        needsKey: true,
        badge: "1M CONTEXT",
        badgeColor: "#4285f4",
        keyPlaceholder: "AIza...",
        keyHint: "aistudio.google.com → Get API key",
    },
    {
        id: "ollama",
        name: "Ollama",
        tagline: "Runs 100% on your machine",
        color: "#ff6b35",
        defaultModel: null,
        models: [],
        needsKey: false,
        badge: "100% OFFLINE",
        badgeColor: "#ff6b35",
        keyPlaceholder: null,
        keyHint: null,
    },
];

// ─────────────────────────────────────────
// REUSABLE INPUT
// ─────────────────────────────────────────

function SettingsInput({ label, value, onChange, type = "text", placeholder, hint, suffix }) {
    const [show, setShow] = useState(false);
    const [focused, setFocused] = useState(false);
    const isPassword = type === "password";

    return (
        <div style={{ display: "flex", flexDirection: "column", gap: "7px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <label style={{
                    fontSize: "10px", letterSpacing: "0.2em", color: "#444",
                    textTransform: "uppercase", fontFamily: "'DM Mono', monospace",
                }}>{label}</label>
                {suffix}
            </div>
            <div style={{ position: "relative" }}>
                <input
                    type={isPassword && !show ? "password" : "text"}
                    value={value}
                    onChange={(e) => onChange(e.target.value)}
                    onFocus={() => setFocused(true)}
                    onBlur={() => setFocused(false)}
                    placeholder={placeholder}
                    style={{
                        width: "100%",
                        background: focused ? "#0f0f0f" : "#0a0a0a",
                        border: "1px solid #1e1e1e",
                        borderLeft: `3px solid ${focused ? "#ff6b35" : "#1e1e1e"}`,
                        color: "#f0ece4", padding: "12px 48px 12px 14px",
                        fontFamily: "'DM Mono', monospace", fontSize: "12px",
                        outline: "none", transition: "all 0.2s",
                    }}
                />
                {isPassword && (
                    <button
                        type="button"
                        onClick={() => setShow(s => !s)}
                        style={{
                            position: "absolute", right: "12px", top: "50%",
                            transform: "translateY(-50%)",
                            background: "none", border: "none", cursor: "pointer",
                            color: "#3a3a3a", fontSize: "10px", letterSpacing: "0.1em",
                            fontFamily: "'DM Mono', monospace", transition: "color 0.2s",
                        }}
                        onMouseEnter={(e) => e.target.style.color = "#ff6b35"}
                        onMouseLeave={(e) => e.target.style.color = "#3a3a3a"}
                    >{show ? "HIDE" : "SHOW"}</button>
                )}
            </div>
            {hint && (
                <div style={{ fontSize: "10px", color: "#2a2a2a", fontFamily: "'DM Mono', monospace" }}>
                    ↳ {hint}
                </div>
            )}
        </div>
    );
}

// ─────────────────────────────────────────
// CONNECTION STATUS BANNER
// ─────────────────────────────────────────

function StatusBanner({ status, message }) {
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
            animation: "bannerIn 0.25s ease",
        }}>
            <span style={{
                width: "18px", height: "18px", borderRadius: "50%",
                background: ok ? "#47A24820" : "#ff444420",
                border: `1px solid ${ok ? "#47A248" : "#ff4444"}`,
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: "10px", flexShrink: 0,
            }}>{ok ? "✓" : "✕"}</span>
            {message}
        </div>
    );
}

// ─────────────────────────────────────────
// OLLAMA DEDICATED PANEL
// ─────────────────────────────────────────

function OllamaPanel({ ollamaUrl, setOllamaUrl, ollamaModel, setOllamaModel }) {
    const [localUrl, setLocalUrl] = useState(ollamaUrl);
    const [triggered, setTriggered] = useState(false);

    const { data, refetch, isFetching } = useGetOllamaModelsQuery(
        localUrl, { skip: !triggered }
    );

    const doFetch = () => {
        setOllamaUrl(localUrl);
        if (triggered) refetch();
        else setTriggered(true);
    };

    const models = data?.models || [];
    const isUp = data?.available;

    return (
        <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>

            {/* ── QUICK SETUP STEPS ── */}
            <div style={{
                border: "1px solid #161616",
                borderLeft: "3px solid #ff6b3540",
                background: "#0a0a0a",
                padding: "20px 24px",
            }}>
                <div style={{
                    fontSize: "9px", letterSpacing: "0.25em", color: "#ff6b35",
                    fontFamily: "'DM Mono', monospace", marginBottom: "16px",
                }}>QUICK SETUP</div>

                <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                    {[
                        { n: "01", code: "curl -fsSL https://ollama.com/install.sh | sh", desc: "Install Ollama" },
                        { n: "02", code: "ollama serve", desc: "Start the server" },
                        { n: "03", code: "ollama pull llama3.2", desc: "Pull any model" },
                    ].map(({ n, code, desc }) => (
                        <div key={n} style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                            <span style={{
                                fontSize: "9px", color: "#ff6b3580",
                                fontFamily: "'DM Mono', monospace", minWidth: "18px",
                            }}>{n}</span>
                            <code style={{
                                flex: 1, background: "#111", border: "1px solid #1a1a1a",
                                padding: "6px 12px", fontSize: "11px", color: "#888",
                                fontFamily: "'DM Mono', monospace",
                                whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis",
                            }}>{code}</code>
                            <span style={{
                                fontSize: "10px", color: "#333",
                                fontFamily: "'DM Mono', monospace",
                                minWidth: "100px", textAlign: "right",
                            }}>{desc}</span>
                        </div>
                    ))}
                </div>
            </div>

            {/* ── SERVER URL + FETCH ── */}
            <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                <label style={{
                    fontSize: "10px", letterSpacing: "0.2em", color: "#444",
                    textTransform: "uppercase", fontFamily: "'DM Mono', monospace",
                }}>Server URL</label>

                <div style={{ display: "flex", gap: "8px" }}>
                    <input
                        value={localUrl}
                        onChange={(e) => setLocalUrl(e.target.value)}
                        onKeyDown={(e) => e.key === "Enter" && doFetch()}
                        placeholder="http://localhost:11434"
                        style={{
                            flex: 1, background: "#0a0a0a",
                            border: "1px solid #1e1e1e",
                            borderLeft: "3px solid #1e1e1e",
                            color: "#f0ece4", padding: "12px 14px",
                            fontFamily: "'DM Mono', monospace", fontSize: "12px",
                            outline: "none", transition: "all 0.2s",
                        }}
                        onFocus={(e) => e.target.style.borderLeftColor = "#ff6b35"}
                        onBlur={(e) => e.target.style.borderLeftColor = "#1e1e1e"}
                    />
                    <button
                        onClick={doFetch}
                        disabled={isFetching}
                        style={{
                            padding: "0 20px",
                            background: isFetching ? "transparent" : "#ff6b3515",
                            border: "1px solid #ff6b3535",
                            color: "#ff6b35",
                            cursor: isFetching ? "default" : "pointer",
                            fontFamily: "'DM Mono', monospace",
                            fontSize: "10px", letterSpacing: "0.15em",
                            transition: "all 0.2s",
                            display: "flex", alignItems: "center", gap: "8px",
                            whiteSpace: "nowrap",
                        }}
                        onMouseEnter={(e) => { if (!isFetching) e.currentTarget.style.background = "#ff6b3525"; }}
                        onMouseLeave={(e) => { if (!isFetching) e.currentTarget.style.background = "#ff6b3515"; }}
                    >
                        {isFetching
                            ? <><span style={{ display: "inline-block", animation: "spin 0.7s linear infinite" }}>↻</span> SCANNING</>
                            : <>↻ SCAN MODELS</>
                        }
                    </button>
                </div>

                <div style={{ fontSize: "10px", color: "#252525", fontFamily: "'DM Mono', monospace" }}>
                    ↳ Default: http://localhost:11434 — press Enter or click Scan
                </div>
            </div>

            {/* ── STATUS INDICATOR ── */}
            {triggered && !isFetching && (
                <div style={{
                    display: "flex", alignItems: "center", gap: "10px",
                    padding: "10px 16px",
                    background: isUp ? "#061209" : "#120606",
                    border: `1px solid ${isUp ? "#47A24820" : "#ff444420"}`,
                    borderLeft: `3px solid ${isUp ? "#47A248" : "#ff4444"}`,
                    fontSize: "11px", fontFamily: "'DM Mono', monospace",
                    color: isUp ? "#47A248" : "#ff7070",
                }}>
                    <div style={{
                        width: "7px", height: "7px", borderRadius: "50%",
                        background: isUp ? "#47A248" : "#ff4444",
                        animation: isUp ? "pulse 2s ease infinite" : "none",
                    }} />
                    {isUp
                        ? `Ollama running — ${models.length} model${models.length !== 1 ? "s" : ""} available`
                        : (data?.error || `Couldn't reach ${localUrl}`)
                    }
                </div>
            )}

            {/* ── MODEL LIST ── */}
            {models.length > 0 && (
                <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                    <div style={{
                        display: "flex", justifyContent: "space-between", alignItems: "center",
                    }}>
                        <label style={{
                            fontSize: "10px", letterSpacing: "0.2em", color: "#444",
                            textTransform: "uppercase", fontFamily: "'DM Mono', monospace",
                        }}>Select Model</label>
                        {ollamaModel && (
                            <span style={{
                                fontSize: "9px", color: "#47A248",
                                fontFamily: "'DM Mono', monospace", letterSpacing: "0.1em",
                            }}>✓ active: {ollamaModel}</span>
                        )}
                    </div>

                    <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                        {models.map((m) => {
                            const active = ollamaModel === m.full_name;
                            const sizeGb = parseFloat(m.size_gb);
                            const sizeColor = sizeGb < 3 ? "#47A248" : sizeGb < 7 ? "#ffd700" : "#ff6b35";

                            return (
                                <div
                                    key={m.name}
                                    onClick={() => setOllamaModel(m.full_name)}
                                    style={{
                                        display: "flex", alignItems: "center",
                                        justifyContent: "space-between",
                                        padding: "13px 16px",
                                        background: active ? "#100c0a" : "#0a0a0a",
                                        border: `1px solid ${active ? "#ff6b3550" : "#161616"}`,
                                        borderLeft: `3px solid ${active ? "#ff6b35" : "transparent"}`,
                                        cursor: "pointer", transition: "all 0.15s",
                                    }}
                                    onMouseEnter={(e) => {
                                        if (!active) {
                                            e.currentTarget.style.borderColor = "#222";
                                            e.currentTarget.style.background = "#0c0c0c";
                                        }
                                    }}
                                    onMouseLeave={(e) => {
                                        if (!active) {
                                            e.currentTarget.style.borderColor = "#161616";
                                            e.currentTarget.style.background = "#0a0a0a";
                                        }
                                    }}
                                >
                                    {/* radio + name */}
                                    <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                                        <div style={{
                                            width: "15px", height: "15px", borderRadius: "50%",
                                            border: `2px solid ${active ? "#ff6b35" : "#2a2a2a"}`,
                                            display: "flex", alignItems: "center", justifyContent: "center",
                                            flexShrink: 0, transition: "border-color 0.15s",
                                        }}>
                                            {active && <div style={{
                                                width: "7px", height: "7px",
                                                borderRadius: "50%", background: "#ff6b35",
                                            }} />}
                                        </div>
                                        <div>
                                            <div style={{
                                                fontFamily: "'DM Mono', monospace",
                                                fontSize: "13px",
                                                color: active ? "#f0ece4" : "#666",
                                                transition: "color 0.15s",
                                            }}>{m.name}</div>
                                            {m.full_name !== m.name && (
                                                <div style={{ fontSize: "9px", color: "#2a2a2a", marginTop: "2px" }}>
                                                    {m.full_name}
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    {/* size badge */}
                                    <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                                        <div style={{
                                            background: `${sizeColor}12`,
                                            border: `1px solid ${sizeColor}30`,
                                            padding: "3px 10px",
                                            display: "flex", alignItems: "center", gap: "5px",
                                        }}>
                                            <div style={{
                                                width: "4px", height: "4px",
                                                borderRadius: "50%", background: sizeColor,
                                            }} />
                                            <span style={{
                                                fontSize: "10px", color: sizeColor,
                                                fontFamily: "'DM Mono', monospace",
                                            }}>{m.size_gb} GB</span>
                                        </div>
                                        {active && (
                                            <span style={{
                                                fontSize: "9px", color: "#ff6b35",
                                                fontFamily: "'DM Mono', monospace",
                                                letterSpacing: "0.15em",
                                            }}>ACTIVE</span>
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}

            {/* ── EMPTY STATE ── */}
            {triggered && !isFetching && isUp && models.length === 0 && (
                <div style={{
                    border: "1px dashed #1e1e1e", padding: "32px",
                    textAlign: "center",
                }}>
                    <div style={{
                        fontSize: "12px", color: "#333",
                        fontFamily: "'DM Mono', monospace", marginBottom: "14px",
                    }}>No models installed yet</div>
                    <code style={{
                        background: "#0d0d0d", border: "1px solid #1a1a1a",
                        padding: "8px 18px", fontSize: "12px", color: "#777",
                        display: "inline-block", fontFamily: "'DM Mono', monospace",
                    }}>ollama pull llama3.2</code>
                </div>
            )}
        </div>
    );
}

// ─────────────────────────────────────────
// LLM PANEL
// ─────────────────────────────────────────

function LLMSettings() {
    const [selected, setSelected] = useState("anthropic");
    const [keys, setKeys] = useState({});
    const [chosenModels, setChosenModels] = useState({});
    const [ollamaUrl, setOllamaUrl] = useState("http://localhost:11434");
    const [ollamaModel, setOllamaModel] = useState("");
    const [connStatus, setConnStatus] = useState(null);
    const [connMsg, setConnMsg] = useState("");
    const [testing, setTesting] = useState(false);
    const [saving, setSaving] = useState(false);
    const [saved, setSaved] = useState(false);

    const [testProvider] = useTestProviderMutation();
    const provider = PROVIDERS.find(p => p.id === selected);

    const switchProvider = (id) => {
        setSelected(id);
        setConnStatus(null);
        setSaved(false);
    };

    const handleTest = async () => {
        setTesting(true);
        setConnStatus(null);
        try {
            const cfg = {
                provider: selected,
                api_key: keys[selected] || null,
                model: chosenModels[selected] || provider.defaultModel,
                ollama_url: ollamaUrl,
                ollama_model: ollamaModel || null,
            };
            const res = await testProvider({ llm_config: cfg }).unwrap();
            setConnStatus(res.success ? "success" : "error");
            setConnMsg(res.message);
        } catch (err) {
            setConnStatus("error");
            setConnMsg(err?.data?.detail || "Connection failed");
        } finally {
            setTesting(false);
        }
    };

    const handleSave = async () => {
        setSaving(true);
        // TODO: POST to /users/settings
        setTimeout(() => {
            setSaving(false);
            setSaved(true);
            setConnStatus("success");
            setConnMsg(`${provider.name} settings saved — ready to review`);
        }, 700);
    };

    const activeModel = chosenModels[selected] || provider.defaultModel;

    return (
        <div>
            {/* ── PROVIDER SELECTOR ── */}
            <div style={{
                display: "grid", gridTemplateColumns: "repeat(5, 1fr)",
                gap: "6px", marginBottom: "24px",
            }}>
                {PROVIDERS.map((p) => {
                    const isSelected = selected === p.id;
                    return (
                        <div
                            key={p.id}
                            onClick={() => switchProvider(p.id)}
                            style={{
                                padding: "18px 10px 14px",
                                background: isSelected ? "#0e0e0e" : "#090909",
                                border: `1px solid ${isSelected ? p.color + "45" : "#141414"}`,
                                borderTop: `2px solid ${isSelected ? p.color : "transparent"}`,
                                cursor: "pointer", transition: "all 0.2s",
                                display: "flex", flexDirection: "column",
                                alignItems: "center", gap: "8px",
                                position: "relative",
                            }}
                            onMouseEnter={(e) => {
                                if (!isSelected) e.currentTarget.style.borderColor = "#202020";
                            }}
                            onMouseLeave={(e) => {
                                if (!isSelected) e.currentTarget.style.borderColor = "#141414";
                            }}
                        >
                            <ProviderLogo id={p.id} size={26} dimmed={!isSelected} />

                            <div style={{
                                fontFamily: "'Syne', sans-serif", fontWeight: 700,
                                fontSize: "11px",
                                color: isSelected ? p.color : "#383838",
                                transition: "color 0.2s", letterSpacing: "0.03em",
                            }}>{p.name}</div>

                            <div style={{
                                fontSize: "8px", letterSpacing: "0.12em",
                                color: isSelected ? p.badgeColor + "cc" : "#1e1e1e",
                                fontFamily: "'DM Mono', monospace",
                                transition: "color 0.2s",
                            }}>{p.badge}</div>

                            {isSelected && (
                                <div style={{
                                    position: "absolute", bottom: 0, left: "50%",
                                    transform: "translateX(-50%)",
                                    width: "20px", height: "2px",
                                    background: p.color,
                                }} />
                            )}
                        </div>
                    );
                })}
            </div>

            {/* ── CONFIG PANEL ── */}
            <div style={{
                border: "1px solid #161616", background: "#0a0a0a",
                padding: "28px", display: "flex", flexDirection: "column", gap: "22px",
            }}>

                {/* provider header row */}
                <div style={{
                    display: "flex", alignItems: "center", gap: "16px",
                    paddingBottom: "20px", borderBottom: "1px solid #0f0f0f",
                }}>
                    <div style={{
                        width: "50px", height: "50px", flexShrink: 0,
                        background: `${provider.color}0e`,
                        border: `1px solid ${provider.color}25`,
                        display: "flex", alignItems: "center", justifyContent: "center",
                    }}>
                        <ProviderLogo id={provider.id} size={28} />
                    </div>
                    <div style={{ flex: 1 }}>
                        <div style={{
                            fontFamily: "'Syne', sans-serif", fontWeight: 800,
                            fontSize: "16px", color: "#f0ece4",
                        }}>{provider.name}</div>
                        <div style={{ fontSize: "11px", color: "#3a3a3a", marginTop: "3px" }}>
                            {provider.tagline}
                        </div>
                    </div>
                    <div style={{
                        fontSize: "8px", letterSpacing: "0.2em",
                        color: provider.badgeColor,
                        border: `1px solid ${provider.badgeColor}30`,
                        padding: "5px 12px", fontFamily: "'DM Mono', monospace",
                    }}>{provider.badge}</div>
                </div>

                {/* OLLAMA specific panel */}
                {selected === "ollama" ? (
                    <OllamaPanel
                        ollamaUrl={ollamaUrl}
                        setOllamaUrl={setOllamaUrl}
                        ollamaModel={ollamaModel}
                        setOllamaModel={setOllamaModel}
                    />
                ) : (
                    <>
                        {/* api key */}
                        <SettingsInput
                            label="API Key"
                            type="password"
                            value={keys[selected] || ""}
                            onChange={(v) => setKeys({ ...keys, [selected]: v })}
                            placeholder={provider.keyPlaceholder}
                            hint={provider.keyHint}
                        />

                        {/* model pills */}
                        <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                            <label style={{
                                fontSize: "10px", letterSpacing: "0.2em", color: "#444",
                                textTransform: "uppercase", fontFamily: "'DM Mono', monospace",
                            }}>Model</label>
                            <div style={{ display: "flex", gap: "6px", flexWrap: "wrap" }}>
                                {provider.models.map((m) => {
                                    const isActive = activeModel === m.id;
                                    return (
                                        <button
                                            key={m.id}
                                            onClick={() => setChosenModels({ ...chosenModels, [selected]: m.id })}
                                            style={{
                                                background: isActive ? `${provider.color}12` : "transparent",
                                                border: `1px solid ${isActive ? provider.color : "#1e1e1e"}`,
                                                color: isActive ? provider.color : "#3a3a3a",
                                                padding: "10px 16px",
                                                cursor: "pointer",
                                                fontFamily: "'DM Mono', monospace",
                                                fontSize: "11px",
                                                transition: "all 0.18s",
                                                textAlign: "left",
                                                display: "flex", flexDirection: "column", gap: "3px",
                                            }}
                                            onMouseEnter={(e) => {
                                                if (!isActive) {
                                                    e.currentTarget.style.borderColor = "#2a2a2a";
                                                    e.currentTarget.style.color = "#666";
                                                }
                                            }}
                                            onMouseLeave={(e) => {
                                                if (!isActive) {
                                                    e.currentTarget.style.borderColor = "#1e1e1e";
                                                    e.currentTarget.style.color = "#3a3a3a";
                                                }
                                            }}
                                        >
                                            <span style={{ fontWeight: 500 }}>{m.label}</span>
                                            <span style={{
                                                fontSize: "9px", letterSpacing: "0.08em",
                                                color: isActive ? `${provider.color}80` : "#2a2a2a",
                                            }}>{m.note}</span>
                                        </button>
                                    );
                                })}
                            </div>
                        </div>
                    </>
                )}

                {/* status */}
                <StatusBanner status={connStatus} message={connMsg} />

                {/* actions */}
                <div style={{
                    display: "flex", gap: "10px", alignItems: "center",
                    paddingTop: "8px", borderTop: "1px solid #0f0f0f",
                }}>
                    <button
                        onClick={handleTest}
                        disabled={testing}
                        style={{
                            background: "none", border: "1px solid #222",
                            color: "#555", padding: "11px 20px",
                            cursor: testing ? "default" : "pointer",
                            fontFamily: "'DM Mono', monospace", fontSize: "10px",
                            letterSpacing: "0.15em", transition: "all 0.2s",
                            opacity: testing ? 0.5 : 1,
                            display: "flex", alignItems: "center", gap: "8px",
                        }}
                        onMouseEnter={(e) => {
                            if (!testing) {
                                e.currentTarget.style.borderColor = "#ff6b35";
                                e.currentTarget.style.color = "#ff6b35";
                            }
                        }}
                        onMouseLeave={(e) => {
                            if (!testing) {
                                e.currentTarget.style.borderColor = "#222";
                                e.currentTarget.style.color = "#555";
                            }
                        }}
                    >
                        {testing && (
                            <span style={{
                                width: "10px", height: "10px",
                                border: "1.5px solid currentColor",
                                borderTopColor: "transparent",
                                borderRadius: "50%",
                                display: "inline-block",
                                animation: "spin 0.6s linear infinite",
                                flexShrink: 0,
                            }} />
                        )}
                        {testing ? "TESTING..." : "TEST CONNECTION"}
                    </button>

                    <button
                        onClick={handleSave}
                        disabled={saving}
                        style={{
                            background: saved ? "#47A24820" : "#ff6b35",
                            border: saved ? "1px solid #47A24840" : "none",
                            color: saved ? "#47A248" : "#080808",
                            padding: "11px 26px",
                            cursor: saving ? "default" : "pointer",
                            fontFamily: "'DM Mono', monospace", fontSize: "10px",
                            letterSpacing: "0.15em", fontWeight: 500,
                            transition: "all 0.25s", opacity: saving ? 0.7 : 1,
                            clipPath: "polygon(7px 0%, 100% 0%, calc(100% - 7px) 100%, 0% 100%)",
                        }}
                        onMouseEnter={(e) => {
                            if (!saving && !saved) e.currentTarget.style.background = "#ff8c5a";
                        }}
                        onMouseLeave={(e) => {
                            if (!saving && !saved) e.currentTarget.style.background = "#ff6b35";
                        }}
                    >
                        {saving ? "SAVING..." : saved ? "✓ SAVED" : "SAVE PROVIDER →"}
                    </button>

                    <div style={{
                        marginLeft: "auto", fontSize: "9px", color: "#1e1e1e",
                        fontFamily: "'DM Mono', monospace", letterSpacing: "0.1em",
                    }}>
                        AES-256 encrypted
                    </div>
                </div>
            </div>
        </div>
    );
}

// ─────────────────────────────────────────
// GITHUB PANEL
// ─────────────────────────────────────────

function GitHubSettings() {
    const [token, setToken] = useState("");
    const [repo, setRepo] = useState("");
    const [branch, setBranch] = useState("main");
    const [connStatus, setConnStatus] = useState(null);
    const [connMsg, setConnMsg] = useState("");
    const [testing, setTesting] = useState(false);
    const [saving, setSaving] = useState(false);
    const [saved, setSaved] = useState(false);

    const [testGithub] = useTestGithubMutation();
    const ready = !!(token && repo);

    const handleTest = async () => {
        if (!ready) { setConnStatus("error"); setConnMsg("Token and repo are required"); return; }
        setTesting(true); setConnStatus(null);
        try {
            const res = await testGithub({ token, repo, branch }).unwrap();
            setConnStatus(res.success ? "success" : "error");
            setConnMsg(res.message);
        } catch (err) {
            setConnStatus("error");
            setConnMsg(err?.data?.detail || "GitHub connection failed");
        } finally { setTesting(false); }
    };

    const handleSave = async () => {
        setSaving(true);
        setTimeout(() => {
            setSaving(false); setSaved(true);
            setConnStatus("success");
            setConnMsg("GitHub connected — browse files & auto-commit enabled");
        }, 700);
    };

    return (
        <div style={{
            border: "1px solid #161616", background: "#0a0a0a",
            padding: "28px", display: "flex", flexDirection: "column", gap: "22px",
        }}>
            {/* header */}
            <div style={{
                display: "flex", alignItems: "center", gap: "16px",
                paddingBottom: "20px", borderBottom: "1px solid #0f0f0f",
            }}>
                <div style={{
                    width: "50px", height: "50px", flexShrink: 0,
                    background: "#161616", border: "1px solid #222",
                    display: "flex", alignItems: "center", justifyContent: "center",
                }}>
                    <svg width="26" height="26" viewBox="0 0 24 24" fill="#888">
                        <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
                    </svg>
                </div>
                <div style={{ flex: 1 }}>
                    <div style={{ fontFamily: "'Syne', sans-serif", fontWeight: 800, fontSize: "16px" }}>
                        GitHub Integration
                    </div>
                    <div style={{ fontSize: "11px", color: "#3a3a3a", marginTop: "3px" }}>
                        Browse files, run AI review, commit fixes back
                    </div>
                </div>
                <div style={{
                    fontSize: "8px", letterSpacing: "0.2em",
                    color: "#47A248", border: "1px solid #47A24830",
                    padding: "5px 12px", fontFamily: "'DM Mono', monospace",
                }}>OPTIONAL</div>
            </div>

            {/* what this unlocks */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "6px" }}>
                {[
                    { icon: "◈", label: "Browse files" },
                    { icon: "◈", label: "AI-review any file" },
                    { icon: "◈", label: "Auto-commit fixes", hot: true },
                ].map((f) => (
                    <div key={f.label} style={{
                        padding: "12px", background: "#0d0d0d",
                        border: `1px solid ${f.hot ? "#ff6b3520" : "#161616"}`,
                        textAlign: "center",
                    }}>
                        <div style={{ color: f.hot ? "#ff6b35" : "#2a2a2a", fontSize: "16px", marginBottom: "6px" }}>
                            {f.icon}
                        </div>
                        <div style={{ fontSize: "10px", color: "#3a3a3a", letterSpacing: "0.05em" }}>
                            {f.label}
                        </div>
                    </div>
                ))}
            </div>

            <SettingsInput
                label="Personal Access Token"
                type="password"
                value={token}
                onChange={(v) => { setToken(v); setSaved(false); setConnStatus(null); }}
                placeholder="ghp_xxxxxxxxxxxxxxxxxxxx"
                hint="Needs repo scope — classic token recommended"
                suffix={
                    <a
                        href="https://github.com/settings/tokens/new?scopes=repo"
                        target="_blank" rel="noopener noreferrer"
                        style={{
                            fontSize: "10px", color: "#ff6b35",
                            textDecoration: "none", fontFamily: "'DM Mono', monospace",
                        }}
                    >Generate →</a>
                }
            />

            <div style={{ display: "grid", gridTemplateColumns: "1fr 140px", gap: "12px" }}>
                <SettingsInput
                    label="Repository"
                    value={repo}
                    onChange={(v) => { setRepo(v); setSaved(false); }}
                    placeholder="username/repo-name"
                />
                <SettingsInput
                    label="Branch"
                    value={branch}
                    onChange={setBranch}
                    placeholder="main"
                />
            </div>

            {/* scopes */}
            <div style={{
                display: "flex", alignItems: "center", gap: "14px",
                padding: "12px 16px", background: "#0d0d0d",
                border: "1px solid #161616", borderLeft: "3px solid #ff6b3525",
            }}>
                <span style={{
                    fontSize: "9px", letterSpacing: "0.15em",
                    color: "#2e2e2e", fontFamily: "'DM Mono', monospace", flexShrink: 0,
                }}>REQUIRED SCOPES</span>
                <div style={{ display: "flex", gap: "6px" }}>
                    {["repo", "read:user"].map(s => (
                        <span key={s} style={{
                            fontSize: "10px", color: "#ff6b35",
                            border: "1px solid #ff6b3530", padding: "2px 8px",
                            fontFamily: "'DM Mono', monospace",
                        }}>{s}</span>
                    ))}
                </div>
            </div>

            <StatusBanner status={connStatus} message={connMsg} />

            {/* actions */}
            <div style={{
                display: "flex", gap: "10px", alignItems: "center",
                paddingTop: "8px", borderTop: "1px solid #0f0f0f",
            }}>
                <button
                    onClick={handleTest}
                    disabled={testing || !ready}
                    style={{
                        background: "none", border: "1px solid #222",
                        color: "#555", padding: "11px 20px",
                        cursor: ready && !testing ? "pointer" : "not-allowed",
                        fontFamily: "'DM Mono', monospace", fontSize: "10px",
                        letterSpacing: "0.15em", transition: "all 0.2s",
                        opacity: !ready || testing ? 0.35 : 1,
                    }}
                    onMouseEnter={(e) => {
                        if (ready && !testing) {
                            e.currentTarget.style.borderColor = "#ff6b35";
                            e.currentTarget.style.color = "#ff6b35";
                        }
                    }}
                    onMouseLeave={(e) => {
                        if (ready && !testing) {
                            e.currentTarget.style.borderColor = "#222";
                            e.currentTarget.style.color = "#555";
                        }
                    }}
                >
                    {testing ? "TESTING..." : "TEST CONNECTION"}
                </button>

                <button
                    onClick={handleSave}
                    disabled={saving || !ready}
                    style={{
                        background: !ready ? "#141414" : saved ? "#47A24820" : "#ff6b35",
                        border: saved ? "1px solid #47A24840" : "none",
                        color: !ready ? "#2a2a2a" : saved ? "#47A248" : "#080808",
                        padding: "11px 26px",
                        cursor: ready && !saving ? "pointer" : "not-allowed",
                        fontFamily: "'DM Mono', monospace", fontSize: "10px",
                        letterSpacing: "0.15em", fontWeight: 500,
                        transition: "all 0.25s",
                        clipPath: "polygon(7px 0%, 100% 0%, calc(100% - 7px) 100%, 0% 100%)",
                    }}
                    onMouseEnter={(e) => {
                        if (ready && !saving && !saved) e.currentTarget.style.background = "#ff8c5a";
                    }}
                    onMouseLeave={(e) => {
                        if (ready && !saving && !saved) e.currentTarget.style.background = "#ff6b35";
                    }}
                >
                    {saving ? "CONNECTING..." : saved ? "✓ CONNECTED" : "CONNECT GITHUB →"}
                </button>
            </div>
        </div>
    );
}

// ─────────────────────────────────────────
// MAIN PAGE
// ─────────────────────────────────────────

export default function SettingsPage() {
    const navigate = useNavigate();
    const user = useSelector(s => s.auth.user);
    const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
    const [activeTab, setActiveTab] = useState("llm");

    useEffect(() => {
        const fn = (e) => setMousePos({ x: e.clientX, y: e.clientY });
        window.addEventListener("mousemove", fn);
        return () => window.removeEventListener("mousemove", fn);
    }, []);

    const TABS = [
        { id: "llm", label: "LLM Provider" },
        { id: "github", label: "GitHub" },
        { id: "account", label: "Account" },
    ];

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
                    color: #444; font-size: 11px; letter-spacing: 0.15em;
                    text-transform: uppercase; transition: color 0.2s;
                    font-family: 'DM Mono', monospace; cursor: pointer;
                }
                .nav-link:hover { color: #ff6b35; }
                .tab-btn {
                    background: none; border: none;
                    border-bottom: 2px solid transparent;
                    color: #333; padding: 14px 0; cursor: pointer;
                    font-family: 'DM Mono', monospace; font-size: 11px;
                    letter-spacing: 0.15em; text-transform: uppercase;
                    transition: all 0.2s; white-space: nowrap;
                }
                .tab-btn:hover { color: #666; }
                .tab-btn.active { color: #ff6b35; border-bottom-color: #ff6b35; }
                @keyframes fadeUp {
                    from { opacity: 0; transform: translateY(12px); }
                    to   { opacity: 1; transform: translateY(0); }
                }
                @keyframes bannerIn {
                    from { opacity: 0; transform: translateX(-6px); }
                    to   { opacity: 1; transform: translateX(0); }
                }
                @keyframes spin { to { transform: rotate(360deg); } }
                @keyframes pulse {
                    0%, 100% { opacity: 1; transform: scale(1); }
                    50%      { opacity: 0.5; transform: scale(0.85); }
                }
                .fu { animation: fadeUp 0.4s ease forwards; }
                .s1 { animation-delay: 0.04s; opacity: 0; }
                .s2 { animation-delay: 0.12s; opacity: 0; }
                .s3 { animation-delay: 0.22s; opacity: 0; }
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

            {/* ── NAV ── */}
            <nav style={{
                position: "fixed", top: 0, left: 0, right: 0, zIndex: 100,
                padding: "0 48px", height: "64px",
                display: "flex", alignItems: "center", justifyContent: "space-between",
                background: "rgba(8,8,8,0.96)",
                borderBottom: "1px solid #111",
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
                    <span style={{ color: "#ff6b35", fontSize: "11px", letterSpacing: "0.15em" }}>Settings</span>
                    <span className="nav-link" onClick={() => navigate("/")}>Home</span>
                </div>

                <div style={{ fontSize: "11px", color: "#2a2a2a", letterSpacing: "0.1em" }}>
                    {user?.name || "SHIVA KUMAR"}
                </div>
            </nav>

            {/* ── CONTENT ── */}
            <main style={{
                maxWidth: "960px", margin: "0 auto",
                padding: "96px 48px 80px",
                position: "relative", zIndex: 1,
            }}>

                {/* header */}
                <div className="fu s1" style={{ marginBottom: "44px" }}>
                    <div style={{
                        fontSize: "9px", letterSpacing: "0.3em", color: "#ff6b35",
                        fontFamily: "'DM Mono', monospace", marginBottom: "12px",
                        display: "flex", alignItems: "center", gap: "12px",
                    }}>
                        <span style={{ width: "22px", height: "1px", background: "#ff6b35", display: "inline-block" }} />
                        CONFIGURATION
                    </div>
                    <h1 style={{
                        fontFamily: "'Syne', sans-serif",
                        fontSize: "clamp(28px, 4vw, 44px)",
                        fontWeight: 800, lineHeight: 1.05,
                    }}>
                        Settings &<br />
                        <span style={{ color: "#ff6b35" }}>Integrations</span>
                    </h1>
                    <p style={{
                        marginTop: "14px", color: "#2e2e2e", fontSize: "12px",
                        lineHeight: 1.9, maxWidth: "440px",
                        fontFamily: "'DM Mono', monospace",
                    }}>
                        Connect your AI provider and GitHub. Keys are encrypted end-to-end before storage.
                    </p>
                </div>

                {/* tabs */}
                <div className="fu s2" style={{
                    display: "flex", gap: "28px",
                    borderBottom: "1px solid #111", marginBottom: "36px",
                }}>
                    {TABS.map(t => (
                        <button
                            key={t.id}
                            className={`tab-btn ${activeTab === t.id ? "active" : ""}`}
                            onClick={() => setActiveTab(t.id)}
                        >{t.label}</button>
                    ))}
                </div>

                {/* tab content */}
                <div className="fu s3">

                    {activeTab === "llm" && (
                        <div>
                            <div style={{ marginBottom: "24px" }}>
                                <div style={{
                                    fontSize: "9px", letterSpacing: "0.25em", color: "#ff6b35",
                                    fontFamily: "'DM Mono', monospace", marginBottom: "8px",
                                    display: "flex", alignItems: "center", gap: "10px",
                                }}>
                                    <span style={{ width: "18px", height: "1px", background: "#ff6b35", display: "inline-block" }} />
                                    LLM PROVIDER
                                </div>
                                <h2 style={{ fontFamily: "'Syne', sans-serif", fontSize: "20px", fontWeight: 800 }}>
                                    Choose your AI model
                                </h2>
                                <p style={{ marginTop: "6px", fontSize: "11px", color: "#2e2e2e", lineHeight: 1.7 }}>
                                    Stored per-user, encrypted. Switch providers anytime without losing your keys.
                                </p>
                            </div>
                            <LLMSettings />
                        </div>
                    )}

                    {activeTab === "github" && (
                        <div>
                            <div style={{ marginBottom: "24px" }}>
                                <div style={{
                                    fontSize: "9px", letterSpacing: "0.25em", color: "#ff6b35",
                                    fontFamily: "'DM Mono', monospace", marginBottom: "8px",
                                    display: "flex", alignItems: "center", gap: "10px",
                                }}>
                                    <span style={{ width: "18px", height: "1px", background: "#ff6b35", display: "inline-block" }} />
                                    GITHUB INTEGRATION
                                </div>
                                <h2 style={{ fontFamily: "'Syne', sans-serif", fontSize: "20px", fontWeight: 800 }}>
                                    Connect your repository
                                </h2>
                                <p style={{ marginTop: "6px", fontSize: "11px", color: "#2e2e2e", lineHeight: 1.7 }}>
                                    Browse files from any repo, review with AI, and push fixes directly.
                                </p>
                            </div>
                            <GitHubSettings />
                        </div>
                    )}

                    {activeTab === "account" && (
                        <div>
                            <div style={{ marginBottom: "24px" }}>
                                <div style={{
                                    fontSize: "9px", letterSpacing: "0.25em", color: "#ff6b35",
                                    fontFamily: "'DM Mono', monospace", marginBottom: "8px",
                                    display: "flex", alignItems: "center", gap: "10px",
                                }}>
                                    <span style={{ width: "18px", height: "1px", background: "#ff6b35", display: "inline-block" }} />
                                    ACCOUNT
                                </div>
                                <h2 style={{ fontFamily: "'Syne', sans-serif", fontSize: "20px", fontWeight: 800 }}>
                                    Your profile
                                </h2>
                            </div>

                            <div style={{
                                border: "1px solid #161616", background: "#0a0a0a",
                                padding: "28px", display: "flex", flexDirection: "column", gap: "24px",
                            }}>
                                {/* profile row */}
                                <div style={{
                                    display: "flex", alignItems: "center", gap: "18px",
                                    paddingBottom: "22px", borderBottom: "1px solid #0f0f0f",
                                }}>
                                    <div style={{
                                        width: "58px", height: "58px", flexShrink: 0,
                                        background: "#ff6b3512",
                                        border: "1px solid #ff6b3530",
                                        display: "flex", alignItems: "center", justifyContent: "center",
                                        fontFamily: "'Syne', sans-serif", fontWeight: 800,
                                        fontSize: "22px", color: "#ff6b35",
                                        position: "relative",
                                    }}>
                                        {(user?.name || "S")[0].toUpperCase()}
                                        <div style={{
                                            position: "absolute", bottom: "-3px", right: "-3px",
                                            width: "10px", height: "10px",
                                            borderRadius: "50%", background: "#47A248",
                                            border: "2px solid #080808",
                                        }} />
                                    </div>
                                    <div style={{ flex: 1 }}>
                                        <div style={{ fontFamily: "'Syne', sans-serif", fontWeight: 700, fontSize: "16px" }}>
                                            {user?.name || "Shiva Kumar"}
                                        </div>
                                        <div style={{ fontSize: "11px", color: "#3a3a3a", marginTop: "4px" }}>
                                            {user?.email || "shiva@example.com"}
                                        </div>
                                    </div>
                                    <div style={{
                                        fontSize: "9px", letterSpacing: "0.15em",
                                        color: "#47A248", border: "1px solid #47A24828",
                                        padding: "5px 10px", fontFamily: "'DM Mono', monospace",
                                    }}>ACTIVE</div>
                                </div>

                                {/* quick stats */}
                                <div style={{
                                    display: "grid", gridTemplateColumns: "repeat(3, 1fr)",
                                    gap: "1px", background: "#111",
                                }}>
                                    {[
                                        { label: "TOTAL REVIEWS", value: "24" },
                                        { label: "AVG SCORE", value: "7.8" },
                                        { label: "JOINED", value: "2026" },
                                    ].map(s => (
                                        <div key={s.label} style={{ background: "#0a0a0a", padding: "16px 20px" }}>
                                            <div style={{
                                                fontSize: "9px", letterSpacing: "0.2em",
                                                color: "#2a2a2a", marginBottom: "8px",
                                                fontFamily: "'DM Mono', monospace",
                                            }}>{s.label}</div>
                                            <div style={{
                                                fontFamily: "'Syne', sans-serif",
                                                fontSize: "24px", fontWeight: 800,
                                            }}>{s.value}</div>
                                        </div>
                                    ))}
                                </div>

                                {/* danger zone */}
                                <div style={{ paddingTop: "4px" }}>
                                    <div style={{
                                        fontSize: "9px", letterSpacing: "0.25em",
                                        color: "#ff3b3b", marginBottom: "14px",
                                        fontFamily: "'DM Mono', monospace",
                                        display: "flex", alignItems: "center", gap: "8px",
                                    }}>
                                        <span style={{ width: "14px", height: "1px", background: "#ff3b3b", display: "inline-block" }} />
                                        DANGER ZONE
                                    </div>
                                    <button
                                        onClick={() => navigate("/login")}
                                        style={{
                                            background: "none", border: "1px solid #ff3b3b25",
                                            color: "#ff3b3b", padding: "10px 22px",
                                            cursor: "pointer", fontFamily: "'DM Mono', monospace",
                                            fontSize: "10px", letterSpacing: "0.15em",
                                            transition: "all 0.2s",
                                        }}
                                        onMouseEnter={(e) => {
                                            e.target.style.background = "#1a0808";
                                            e.target.style.borderColor = "#ff3b3b50";
                                        }}
                                        onMouseLeave={(e) => {
                                            e.target.style.background = "none";
                                            e.target.style.borderColor = "#ff3b3b25";
                                        }}
                                    >SIGN OUT</button>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
}
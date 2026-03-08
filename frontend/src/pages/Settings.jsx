import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import {
    useTestProviderMutation,
    useTestGithubMutation,
    useGetOllamaModelsQuery,
} from "../store/api/llmApi";

// ─────────────────────────────────────────
// SHARED COMPONENTS
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
// PROVIDER CONFIG
// ─────────────────────────────────────────

const PROVIDERS = [
    {
        id: "anthropic",
        name: "Anthropic",
        model: "Claude",
        color: "#cc785c",
        defaultModel: "claude-haiku-4-5",
        models: ["claude-haiku-4-5", "claude-sonnet-4-5", "claude-opus-4-5"],
        needsKey: true,
        badge: "BEST QUALITY",
        badgeColor: "#cc785c",
    },
    {
        id: "openai",
        name: "OpenAI",
        model: "GPT",
        color: "#74aa9c",
        defaultModel: "gpt-4o-mini",
        models: ["gpt-4o-mini", "gpt-4o", "gpt-4-turbo"],
        needsKey: true,
        badge: "POPULAR",
        badgeColor: "#74aa9c",
    },
    {
        id: "groq",
        name: "Groq",
        model: "Llama",
        color: "#f55036",
        defaultModel: "llama-3.1-70b-versatile",
        models: ["llama-3.1-70b-versatile", "llama-3.1-8b-instant", "mixtral-8x7b-32768"],
        needsKey: true,
        badge: "FREE TIER",
        badgeColor: "#47A248",
    },
    {
        id: "gemini",
        name: "Gemini",
        model: "Gemini",
        color: "#4285f4",
        defaultModel: "gemini-1.5-flash",
        models: ["gemini-1.5-flash", "gemini-1.5-pro", "gemini-2.0-flash"],
        needsKey: true,
        badge: "1M CONTEXT",
        badgeColor: "#4285f4",
    },
    {
        id: "ollama",
        name: "Ollama",
        model: "Local",
        color: "#ff6b35",
        defaultModel: null,
        models: [],
        needsKey: false,
        badge: "OFFLINE",
        badgeColor: "#ff6b35",
    },
];

// ─────────────────────────────────────────
// SUB COMPONENTS
// ─────────────────────────────────────────

function SectionHeader({ tag, title }) {
    return (
        <div style={{ marginBottom: "32px" }}>
            <div style={{
                fontSize: "9px", letterSpacing: "0.3em", color: "#ff6b35",
                fontFamily: "'DM Mono', monospace", marginBottom: "12px",
                display: "flex", alignItems: "center", gap: "12px",
            }}>
                <span style={{ width: "24px", height: "1px", background: "#ff6b35", display: "inline-block" }} />
                {tag}
            </div>
            <h2 style={{
                fontFamily: "'Syne', sans-serif", fontSize: "22px",
                fontWeight: 800, color: "#f0ece4",
            }}>{title}</h2>
        </div>
    );
}

function ConnectionStatus({ status, message }) {
    if (!status) return null;
    const isOk = status === "success";
    return (
        <div style={{
            display: "flex", alignItems: "center", gap: "8px",
            padding: "10px 14px",
            background: isOk ? "#081a0d" : "#1a0808",
            border: `1px solid ${isOk ? "#47A24830" : "#ff3b3b30"}`,
            borderLeft: `3px solid ${isOk ? "#47A248" : "#ff3b3b"}`,
            fontSize: "11px",
            color: isOk ? "#47A248" : "#ff6b6b",
            fontFamily: "'DM Mono', monospace",
            animation: "fadeIn 0.3s ease",
        }}>
            <span>{isOk ? "✓" : "✕"}</span>
            {message}
        </div>
    );
}

function SettingsInput({ label, value, onChange, type = "text", placeholder, suffix }) {
    const [show, setShow] = useState(false);
    const isPassword = type === "password";
    return (
        <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
            <div style={{ display: "flex", justifyContent: "space-between" }}>
                <label style={{
                    fontSize: "10px", letterSpacing: "0.2em", color: "#444",
                    textTransform: "uppercase", fontFamily: "'DM Mono', monospace",
                }}>{label}</label>
                {suffix}
            </div>
            <div style={{ position: "relative" }}>
                <input
                    type={isPassword ? (show ? "text" : "password") : type}
                    value={value}
                    onChange={(e) => onChange(e.target.value)}
                    placeholder={placeholder}
                    style={{
                        width: "100%", background: "#0d0d0d",
                        border: "1px solid #1e1e1e", borderLeft: "3px solid #1e1e1e",
                        color: "#f0ece4", padding: "12px 16px",
                        fontFamily: "'DM Mono', monospace", fontSize: "12px",
                        outline: "none", transition: "all 0.2s",
                    }}
                    onFocus={(e) => { e.target.style.borderLeftColor = "#ff6b35"; e.target.style.background = "#0f0f0f"; }}
                    onBlur={(e) => { e.target.style.borderLeftColor = "#1e1e1e"; e.target.style.background = "#0d0d0d"; }}
                />
                {isPassword && (
                    <button
                        type="button"
                        onClick={() => setShow(!show)}
                        style={{
                            position: "absolute", right: "12px", top: "50%",
                            transform: "translateY(-50%)", background: "none",
                            border: "none", cursor: "pointer", color: "#444",
                            fontSize: "10px", letterSpacing: "0.1em",
                            fontFamily: "'DM Mono', monospace",
                        }}
                        onMouseEnter={(e) => e.target.style.color = "#ff6b35"}
                        onMouseLeave={(e) => e.target.style.color = "#444"}
                    >
                        {show ? "HIDE" : "SHOW"}
                    </button>
                )}
            </div>
        </div>
    );
}

// ─────────────────────────────────────────
// LLM SETTINGS PANEL
// ─────────────────────────────────────────

function LLMSettings() {
    const [selected, setSelected] = useState("anthropic");
    const [keys, setKeys] = useState({});
    const [models, setModels] = useState({});
    const [ollamaUrl, setOllamaUrl] = useState("http://localhost:11434");
    const [ollamaModel, setOllamaModel] = useState("");
    const [connStatus, setConnStatus] = useState(null);
    const [connMsg, setConnMsg] = useState("");
    const [testing, setTesting] = useState(false);
    const [saving, setSaving] = useState(false);

    const [testProvider] = useTestProviderMutation();

    // fetch ollama models when ollama is selected
    const { data: ollamaData, refetch: refetchOllama } = useGetOllamaModelsQuery(
        ollamaUrl,
        { skip: selected !== "ollama" }
    );

    const provider = PROVIDERS.find((p) => p.id === selected);

    const handleTest = async () => {
        setTesting(true);
        setConnStatus(null);

        try {
            const config = {
                provider: selected,
                api_key: keys[selected] || null,
                model: models[selected] || provider.defaultModel,
                ollama_url: ollamaUrl,
                ollama_model: ollamaModel || null,
            };
            const result = await testProvider({ llm_config: config }).unwrap();
            setConnStatus(result.success ? "success" : "error");
            setConnMsg(result.message);
        } catch (err) {
            setConnStatus("error");
            setConnMsg(err?.data?.detail || "Connection failed");
        } finally {
            setTesting(false);
        }
    };

    const handleSave = async () => {
        setSaving(true);
        // TODO: save to review-service user settings
        setTimeout(() => {
            setSaving(false);
            setConnStatus("success");
            setConnMsg("Settings saved successfully");
        }, 800);
    };

    return (
        <div>
            {/* provider selector */}
            <div style={{
                display: "grid", gridTemplateColumns: "repeat(5, 1fr)",
                gap: "1px", background: "#111", marginBottom: "32px",
            }}>
                {PROVIDERS.map((p) => (
                    <div
                        key={p.id}
                        onClick={() => { setSelected(p.id); setConnStatus(null); }}
                        style={{
                            padding: "20px 16px", background: selected === p.id ? "#0f0f0f" : "#0a0a0a",
                            cursor: "pointer", transition: "all 0.2s",
                            borderTop: `2px solid ${selected === p.id ? p.color : "transparent"}`,
                            textAlign: "center", position: "relative",
                        }}
                    >
                        <div style={{
                            fontFamily: "'Syne', sans-serif", fontWeight: 700,
                            fontSize: "13px",
                            color: selected === p.id ? p.color : "#444",
                            marginBottom: "4px", transition: "color 0.2s",
                        }}>{p.name}</div>
                        <div style={{
                            fontSize: "9px", letterSpacing: "0.15em",
                            color: selected === p.id ? p.badgeColor : "#2a2a2a",
                            transition: "color 0.2s",
                        }}>{p.badge}</div>
                    </div>
                ))}
            </div>

            {/* config panel */}
            <div style={{
                border: "1px solid #161616", background: "#0a0a0a",
                padding: "28px", display: "flex", flexDirection: "column", gap: "20px",
            }}>
                {/* header */}
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <div>
                        <div style={{
                            fontFamily: "'Syne', sans-serif", fontWeight: 700,
                            fontSize: "16px", color: provider.color,
                        }}>{provider.name}</div>
                        <div style={{ fontSize: "11px", color: "#444", marginTop: "4px" }}>
                            {provider.needsKey ? "API key required" : "No API key needed — runs locally"}
                        </div>
                    </div>
                    <div style={{
                        fontSize: "9px", letterSpacing: "0.2em",
                        color: provider.badgeColor, border: `1px solid ${provider.badgeColor}30`,
                        padding: "4px 10px", fontFamily: "'DM Mono', monospace",
                    }}>{provider.badge}</div>
                </div>

                {/* api key */}
                {provider.needsKey && (
                    <SettingsInput
                        label="API Key"
                        type="password"
                        value={keys[selected] || ""}
                        onChange={(v) => setKeys({ ...keys, [selected]: v })}
                        placeholder={`Enter your ${provider.name} API key`}
                    />
                )}

                {/* model selector */}
                {selected !== "ollama" && provider.models.length > 0 && (
                    <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                        <label style={{
                            fontSize: "10px", letterSpacing: "0.2em", color: "#444",
                            textTransform: "uppercase", fontFamily: "'DM Mono', monospace",
                        }}>Model</label>
                        <div style={{ display: "flex", gap: "6px", flexWrap: "wrap" }}>
                            {provider.models.map((m) => (
                                <button
                                    key={m}
                                    onClick={() => setModels({ ...models, [selected]: m })}
                                    style={{
                                        background: (models[selected] || provider.defaultModel) === m
                                            ? "#ff6b3510" : "transparent",
                                        border: `1px solid ${(models[selected] || provider.defaultModel) === m
                                            ? "#ff6b35" : "#1e1e1e"}`,
                                        color: (models[selected] || provider.defaultModel) === m
                                            ? "#ff6b35" : "#444",
                                        padding: "6px 14px", cursor: "pointer",
                                        fontFamily: "'DM Mono', monospace",
                                        fontSize: "10px", letterSpacing: "0.05em",
                                        transition: "all 0.2s",
                                    }}
                                >
                                    {m}
                                </button>
                            ))}
                        </div>
                    </div>
                )}

                {/* ollama specific */}
                {selected === "ollama" && (
                    <>
                        <SettingsInput
                            label="Ollama URL"
                            value={ollamaUrl}
                            onChange={setOllamaUrl}
                            placeholder="http://localhost:11434"
                            suffix={
                                <button
                                    onClick={() => refetchOllama()}
                                    style={{
                                        background: "none", border: "none",
                                        color: "#ff6b35", cursor: "pointer",
                                        fontSize: "10px", letterSpacing: "0.1em",
                                        fontFamily: "'DM Mono', monospace",
                                    }}
                                >
                                    FETCH MODELS ↻
                                </button>
                            }
                        />

                        {/* ollama models list */}
                        {ollamaData?.available && ollamaData.models?.length > 0 ? (
                            <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                                <label style={{
                                    fontSize: "10px", letterSpacing: "0.2em", color: "#444",
                                    textTransform: "uppercase", fontFamily: "'DM Mono', monospace",
                                }}>Select Model</label>
                                <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                                    {ollamaData.models.map((m) => (
                                        <div
                                            key={m.name}
                                            onClick={() => setOllamaModel(m.full_name)}
                                            style={{
                                                display: "flex", justifyContent: "space-between",
                                                alignItems: "center",
                                                padding: "12px 16px",
                                                background: ollamaModel === m.full_name ? "#ff6b3510" : "#0d0d0d",
                                                border: `1px solid ${ollamaModel === m.full_name ? "#ff6b35" : "#161616"}`,
                                                cursor: "pointer", transition: "all 0.2s",
                                            }}
                                        >
                                            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                                                <div style={{
                                                    width: "6px", height: "6px", borderRadius: "50%",
                                                    background: ollamaModel === m.full_name ? "#ff6b35" : "#2a2a2a",
                                                }} />
                                                <span style={{
                                                    fontFamily: "'DM Mono', monospace",
                                                    fontSize: "12px",
                                                    color: ollamaModel === m.full_name ? "#f0ece4" : "#666",
                                                }}>{m.name}</span>
                                            </div>
                                            <span style={{ fontSize: "10px", color: "#444" }}>
                                                {m.size_gb} GB
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ) : selected === "ollama" && (
                            <div style={{
                                padding: "20px", border: "1px solid #161616",
                                textAlign: "center", fontSize: "11px", color: "#444",
                            }}>
                                {ollamaData?.error || "Click FETCH MODELS to see installed models"}
                            </div>
                        )}
                    </>
                )}

                {/* connection status */}
                <ConnectionStatus status={connStatus} message={connMsg} />

                {/* actions */}
                <div style={{ display: "flex", gap: "10px", paddingTop: "4px" }}>
                    <button
                        onClick={handleTest}
                        disabled={testing}
                        style={{
                            background: "none", border: "1px solid #2a2a2a",
                            color: "#888", padding: "10px 20px", cursor: "pointer",
                            fontFamily: "'DM Mono', monospace", fontSize: "10px",
                            letterSpacing: "0.1em", transition: "all 0.2s",
                            opacity: testing ? 0.5 : 1,
                        }}
                        onMouseEnter={(e) => { e.target.style.borderColor = "#ff6b35"; e.target.style.color = "#ff6b35"; }}
                        onMouseLeave={(e) => { e.target.style.borderColor = "#2a2a2a"; e.target.style.color = "#888"; }}
                    >
                        {testing ? "TESTING..." : "TEST CONNECTION"}
                    </button>

                    <button
                        onClick={handleSave}
                        disabled={saving}
                        style={{
                            background: "#ff6b35", border: "none",
                            color: "#080808", padding: "10px 24px", cursor: "pointer",
                            fontFamily: "'DM Mono', monospace", fontSize: "10px",
                            letterSpacing: "0.1em", fontWeight: 500,
                            transition: "all 0.2s", opacity: saving ? 0.7 : 1,
                            clipPath: "polygon(6px 0%, 100% 0%, calc(100% - 6px) 100%, 0% 100%)",
                        }}
                    >
                        {saving ? "SAVING..." : "SAVE SETTINGS"}
                    </button>
                </div>
            </div>
        </div>
    );
}

// ─────────────────────────────────────────
// GITHUB SETTINGS PANEL
// ─────────────────────────────────────────

function GitHubSettings() {
    const [token, setToken] = useState("");
    const [repo, setRepo] = useState("");
    const [branch, setBranch] = useState("main");
    const [connStatus, setConnStatus] = useState(null);
    const [connMsg, setConnMsg] = useState("");
    const [testing, setTesting] = useState(false);
    const [saving, setSaving] = useState(false);

    const [testGithub] = useTestGithubMutation();

    const handleTest = async () => {
        if (!token || !repo) {
            setConnStatus("error");
            setConnMsg("Token and repo are required");
            return;
        }
        setTesting(true);
        setConnStatus(null);

        try {
            const result = await testGithub({ token, repo, branch }).unwrap();
            setConnStatus(result.success ? "success" : "error");
            setConnMsg(result.message);
        } catch (err) {
            setConnStatus("error");
            setConnMsg(err?.data?.detail || "GitHub connection failed");
        } finally {
            setTesting(false);
        }
    };

    const handleSave = async () => {
        setSaving(true);
        setTimeout(() => {
            setSaving(false);
            setConnStatus("success");
            setConnMsg("GitHub settings saved");
        }, 800);
    };

    return (
        <div style={{
            border: "1px solid #161616", background: "#0a0a0a",
            padding: "28px", display: "flex", flexDirection: "column", gap: "20px",
        }}>
            {/* header */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div>
                    <div style={{
                        fontFamily: "'Syne', sans-serif", fontWeight: 700,
                        fontSize: "16px", color: "#f0ece4",
                    }}>GitHub Integration</div>
                    <div style={{ fontSize: "11px", color: "#444", marginTop: "4px" }}>
                        Connect to fetch files and auto-commit reviewed code
                    </div>
                </div>
                <div style={{
                    fontSize: "9px", letterSpacing: "0.2em",
                    color: "#47A248", border: "1px solid #47A24830",
                    padding: "4px 10px", fontFamily: "'DM Mono', monospace",
                }}>OPTIONAL</div>
            </div>

            <SettingsInput
                label="Personal Access Token"
                type="password"
                value={token}
                onChange={setToken}
                placeholder="ghp_xxxxxxxxxxxxxxxxxxxx"
                suffix={
                    <a
                        href="https://github.com/settings/tokens/new?scopes=repo"
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{
                            fontSize: "10px", color: "#ff6b35",
                            textDecoration: "none", letterSpacing: "0.05em",
                            fontFamily: "'DM Mono', monospace",
                        }}
                    >
                        Generate →
                    </a>
                }
            />

            <SettingsInput
                label="Repository"
                value={repo}
                onChange={setRepo}
                placeholder="username/repository-name"
            />

            <SettingsInput
                label="Default Branch"
                value={branch}
                onChange={setBranch}
                placeholder="main"
            />

            {/* permissions note */}
            <div style={{
                padding: "14px 16px", background: "#0d0d0d",
                border: "1px solid #161616", borderLeft: "3px solid #ff6b3530",
            }}>
                <div style={{
                    fontSize: "10px", letterSpacing: "0.1em", color: "#444",
                    fontFamily: "'DM Mono', monospace", marginBottom: "8px",
                }}>REQUIRED TOKEN SCOPES</div>
                <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
                    {["repo", "read:user"].map((scope) => (
                        <div key={scope} style={{
                            fontSize: "10px", color: "#ff6b35",
                            border: "1px solid #ff6b3530", padding: "2px 8px",
                            fontFamily: "'DM Mono', monospace",
                        }}>{scope}</div>
                    ))}
                </div>
            </div>

            {/* connection status */}
            <ConnectionStatus status={connStatus} message={connMsg} />

            {/* actions */}
            <div style={{ display: "flex", gap: "10px" }}>
                <button
                    onClick={handleTest}
                    disabled={testing}
                    style={{
                        background: "none", border: "1px solid #2a2a2a",
                        color: "#888", padding: "10px 20px", cursor: "pointer",
                        fontFamily: "'DM Mono', monospace", fontSize: "10px",
                        letterSpacing: "0.1em", transition: "all 0.2s",
                        opacity: testing ? 0.5 : 1,
                    }}
                    onMouseEnter={(e) => { e.target.style.borderColor = "#ff6b35"; e.target.style.color = "#ff6b35"; }}
                    onMouseLeave={(e) => { e.target.style.borderColor = "#2a2a2a"; e.target.style.color = "#888"; }}
                >
                    {testing ? "TESTING..." : "TEST CONNECTION"}
                </button>

                <button
                    onClick={handleSave}
                    disabled={saving || !token || !repo}
                    style={{
                        background: token && repo ? "#ff6b35" : "#1a1a1a",
                        border: "none",
                        color: token && repo ? "#080808" : "#333",
                        padding: "10px 24px", cursor: token && repo ? "pointer" : "not-allowed",
                        fontFamily: "'DM Mono', monospace", fontSize: "10px",
                        letterSpacing: "0.1em", fontWeight: 500,
                        transition: "all 0.2s",
                        clipPath: "polygon(6px 0%, 100% 0%, calc(100% - 6px) 100%, 0% 100%)",
                    }}
                >
                    {saving ? "SAVING..." : "SAVE GITHUB"}
                </button>
            </div>
        </div>
    );
}

// ─────────────────────────────────────────
// MAIN SETTINGS PAGE
// ─────────────────────────────────────────

export default function SettingsPage() {
    const navigate = useNavigate();
    const user = useSelector((state) => state.auth.user);
    const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
    const [activeTab, setActiveTab] = useState("llm");

    useEffect(() => {
        const onMove = (e) => setMousePos({ x: e.clientX, y: e.clientY });
        window.addEventListener("mousemove", onMove);
        return () => window.removeEventListener("mousemove", onMove);
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
                    color: #555; text-decoration: none; font-size: 11px;
                    letter-spacing: 0.15em; text-transform: uppercase;
                    transition: color 0.2s; font-family: 'DM Mono', monospace;
                    cursor: pointer;
                }
                .nav-link:hover { color: #ff6b35; }

                .tab-btn {
                    background: none; border: none; border-bottom: 2px solid transparent;
                    color: #444; padding: 12px 0; cursor: pointer;
                    font-family: 'DM Mono', monospace; font-size: 11px;
                    letter-spacing: 0.15em; text-transform: uppercase;
                    transition: all 0.2s; white-space: nowrap;
                }
                .tab-btn:hover { color: #888; }
                .tab-btn.active { color: #ff6b35; border-bottom-color: #ff6b35; }

                @keyframes fadeIn {
                    from { opacity: 0; transform: translateY(8px); }
                    to { opacity: 1; transform: translateY(0); }
                }
                .fade-up { animation: fadeIn 0.4s ease forwards; }
                .stagger-1 { animation-delay: 0.05s; opacity: 0; }
                .stagger-2 { animation-delay: 0.15s; opacity: 0; }
                .stagger-3 { animation-delay: 0.25s; opacity: 0; }
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

                <div style={{ display: "flex", gap: "32px" }}>
                    <span className="nav-link" onClick={() => navigate("/dashboard")}>Dashboard</span>
                    <span className="nav-link" style={{ color: "#ff6b35" }}>Settings</span>
                    <span className="nav-link" onClick={() => navigate("/")}>Home</span>
                </div>

                <div style={{ fontSize: "11px", color: "#333", letterSpacing: "0.1em" }}>
                    {user?.name || "SHIVA KUMAR"}
                </div>
            </nav>

            {/* ── MAIN ── */}
            <main style={{
                paddingTop: "64px", maxWidth: "960px",
                margin: "0 auto", padding: "88px 48px 80px",
                position: "relative", zIndex: 1,
            }}>

                {/* ── PAGE HEADER ── */}
                <div className="fade-up stagger-1" style={{ marginBottom: "48px" }}>
                    <div style={{
                        fontSize: "10px", letterSpacing: "0.3em", color: "#ff6b35",
                        fontFamily: "'DM Mono', monospace", marginBottom: "12px",
                        display: "flex", alignItems: "center", gap: "12px",
                    }}>
                        <span style={{ width: "24px", height: "1px", background: "#ff6b35", display: "inline-block" }} />
                        Configuration
                    </div>
                    <h1 style={{
                        fontFamily: "'Syne', sans-serif",
                        fontSize: "clamp(28px, 4vw, 42px)",
                        fontWeight: 800, lineHeight: 1.1,
                    }}>
                        Settings &<br />
                        <span style={{ color: "#ff6b35" }}>Integrations</span>
                    </h1>
                    <p style={{
                        marginTop: "16px", color: "#444", fontSize: "12px",
                        lineHeight: 1.8, maxWidth: "480px",
                    }}>
                        Connect your LLM provider and GitHub account. Your API keys are encrypted before storage.
                    </p>
                </div>

                {/* ── TABS ── */}
                <div className="fade-up stagger-2" style={{
                    display: "flex", gap: "32px",
                    borderBottom: "1px solid #161616", marginBottom: "40px",
                }}>
                    {TABS.map((tab) => (
                        <button
                            key={tab.id}
                            className={`tab-btn ${activeTab === tab.id ? "active" : ""}`}
                            onClick={() => setActiveTab(tab.id)}
                        >
                            {tab.label}
                        </button>
                    ))}
                </div>

                {/* ── TAB CONTENT ── */}
                <div className="fade-up stagger-3">

                    {activeTab === "llm" && (
                        <div>
                            <SectionHeader
                                tag="LLM Provider"
                                title="Choose your AI model"
                            />
                            <LLMSettings />
                        </div>
                    )}

                    {activeTab === "github" && (
                        <div>
                            <SectionHeader
                                tag="GitHub Integration"
                                title="Connect your repository"
                            />
                            <GitHubSettings />
                        </div>
                    )}

                    {activeTab === "account" && (
                        <div>
                            <SectionHeader
                                tag="Account"
                                title="Your profile"
                            />
                            <div style={{
                                border: "1px solid #161616", background: "#0a0a0a",
                                padding: "28px", display: "flex", flexDirection: "column", gap: "20px",
                            }}>
                                <div style={{
                                    display: "flex", alignItems: "center", gap: "20px",
                                    paddingBottom: "20px", borderBottom: "1px solid #111",
                                }}>
                                    <div style={{
                                        width: "56px", height: "56px",
                                        background: "#ff6b3520", border: "1px solid #ff6b3540",
                                        display: "flex", alignItems: "center", justifyContent: "center",
                                        fontFamily: "'Syne', sans-serif", fontWeight: 800,
                                        fontSize: "20px", color: "#ff6b35",
                                    }}>
                                        {(user?.name || "S")[0].toUpperCase()}
                                    </div>
                                    <div>
                                        <div style={{
                                            fontFamily: "'Syne', sans-serif", fontWeight: 700,
                                            fontSize: "16px",
                                        }}>{user?.name || "Shiva Kumar"}</div>
                                        <div style={{ fontSize: "11px", color: "#444", marginTop: "4px" }}>
                                            {user?.email || "shiva@example.com"}
                                        </div>
                                    </div>
                                </div>

                                {/* danger zone */}
                                <div>
                                    <div style={{
                                        fontSize: "10px", letterSpacing: "0.2em",
                                        color: "#ff3b3b", marginBottom: "16px",
                                        fontFamily: "'DM Mono', monospace",
                                    }}>DANGER ZONE</div>
                                    <button
                                        onClick={() => navigate("/login")}
                                        style={{
                                            background: "none", border: "1px solid #ff3b3b30",
                                            color: "#ff3b3b", padding: "10px 20px",
                                            cursor: "pointer", fontFamily: "'DM Mono', monospace",
                                            fontSize: "10px", letterSpacing: "0.1em",
                                            transition: "all 0.2s",
                                        }}
                                        onMouseEnter={(e) => e.target.style.background = "#1a0808"}
                                        onMouseLeave={(e) => e.target.style.background = "none"}
                                    >
                                        SIGN OUT
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
}
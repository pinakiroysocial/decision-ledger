/**
 * Decision Ledger - Cloud-Native Decision Repository
 * Architect & Developer: Pinaki Roy
 * LinkedIn: https://www.linkedin.com/in/pinakiroysocial/
 * © 2026 Pinaki Roy. All Rights Reserved.
 */
import { useEffect, useState, useMemo } from "react";
import { auth, loginWithGoogle, loginAnonymously, logout, watchAuthState } from "../lib/firebaseClient";

const QUICK_TEMPLATES = [
  {
    key: "db",
    label: "Database",
    title: "Database Selection",
    text: "We chose PostgreSQL over MongoDB for our user transaction ledger because we require strict ACID compliance, relational foreign keys across multiple tables, and our team has deep SQL expertise.",
    tags: "database, sql, acid, storage",
  },
  {
    key: "hosting",
    label: "Hosting",
    title: "Hosting Platform",
    text: "We chose Google Cloud Run over Google Compute Engine VMs because Cloud Run provides automated scaling to zero, rapid container deployment from source, zero server maintenance, and built-in HTTPS endpoints.",
    tags: "cloud-run, gcp, serverless, hosting",
  },
  {
    key: "auth",
    label: "Auth",
    title: "Auth Provider",
    text: "We selected Firebase Authentication with Google Sign-In instead of building custom JWT authentication because it drastically reduces implementation time, eliminates credential storage security risks, and integrates natively with Cloud Firestore rules.",
    tags: "firebase, auth, oauth, security",
  },
  {
    key: "ai",
    label: "AI Model",
    title: "AI Model Selection",
    text: "We chose Gemini 3.5 Flash via Google Generative AI SDK over self-hosted LLMs because it provides ultra-low latency, native structured JSON output capability, and low inference cost for extracting decision metadata.",
    tags: "gemini, ai, llm, google-cloud",
  },
];

const OTHER_TEMPLATES = [
  {
    title: "API Architecture",
    text: "We chose REST APIs over GraphQL for our internal microservices because our access patterns are predictable, HTTP caching is trivial to implement on Cloud CDN, and tooling across our stack already supports OpenAPI specs.",
    tags: "api, rest, microservices, openapi",
  },
  {
    title: "CI/CD Pipeline",
    text: "We adopted Google Cloud Build over GitHub Actions self-hosted runners because it integrates natively with Artifact Registry and Cloud Run without exporting long-lived GCP service account keys.",
    tags: "cicd, cloud-build, devops, gcp",
  },
  {
    title: "State Management",
    text: "We selected React Context and Local Storage over Redux for client state because our UI state complexity is moderate and avoiding boilerplate speeds up delivery.",
    tags: "react, frontend, state-management",
  },
  {
    title: "Logging & Telemetry",
    text: "We opted for Google Cloud Logging with structured JSON stdout over a third-party APM because Cloud Run ingests stdout automatically with zero agent overhead.",
    tags: "logging, observability, cloud-run, gcp",
  },
];

// Helper to render Gemini markdown response cleanly without raw asterisks
function FormattedAnswer({ text }) {
  if (!text) return null;

  const paragraphs = text.split(/\n\s*\n/);

  return (
    <div className="ai-answer-content">
      {paragraphs.map((para, pIdx) => {
        const lines = para.split("\n");
        const isList = lines.every((l) => l.trim().startsWith("* ") || l.trim().startsWith("- "));

        if (isList) {
          return (
            <ul key={pIdx}>
              {lines.map((l, lIdx) => {
                const item = l.trim().replace(/^[\*\-]\s+/, "");
                return <li key={lIdx} dangerouslySetInnerHTML={{ __html: formatInline(item) }} />;
              })}
            </ul>
          );
        }

        return (
          <p key={pIdx}>
            {lines.map((l, lIdx) => (
              <span key={lIdx}>
                <span dangerouslySetInnerHTML={{ __html: formatInline(l) }} />
                {lIdx < lines.length - 1 && <br />}
              </span>
            ))}
          </p>
        );
      })}
    </div>
  );
}

function formatInline(str) {
  if (!str) return "";
  let res = str;
  res = res.replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>");
  res = res.replace(/(?<!\*)\*(?!\*)(.*?)(?<!\*)\*(?!\*)/g, "<em>$1</em>");
  res = res.replace(/`([^`]+)`/g, "<code style='background:#eaeaea;padding:1px 4px;border:1px solid #ccc;'>$1</code>");
  return res;
}

export default function Home() {
  const [user, setUser] = useState(null);
  const [activeTab, setActiveTab] = useState("log"); // 'log' | 'ask' | 'history' | 'about'

  // Panel Collapsed States (Default expanded to ensure content is always visible)
  const [logPanelOpen, setLogPanelOpen] = useState(true);
  const [askPanelOpen, setAskPanelOpen] = useState(true);
  const [statsWidgetOpen, setStatsWidgetOpen] = useState(true);
  const [recentWidgetOpen, setRecentWidgetOpen] = useState(true);
  const [helpWidgetOpen, setHelpWidgetOpen] = useState(true);

  // Dropdown states
  const [otherDropdownOpen, setOtherDropdownOpen] = useState(false);
  const [activeMenuDropdown, setActiveMenuDropdown] = useState(null);

  // Modals
  const [helpModalOpen, setHelpModalOpen] = useState(false);
  const [helpInitialTopic, setHelpInitialTopic] = useState("how-it-works");
  const [recycleBinOpen, setRecycleBinOpen] = useState(false);
  const [templatesModalOpen, setTemplatesModalOpen] = useState(false);
  const [settingsModalOpen, setSettingsModalOpen] = useState(false);
  const [historyModalOpen, setHistoryModalOpen] = useState(false);

  // Live clock & date in status bar
  const [currentTime, setCurrentTime] = useState("");
  const [currentDate, setCurrentDate] = useState("");

  // Log decision state
  const [rawText, setRawText] = useState("");
  const [manualTags, setManualTags] = useState("");
  const [logResult, setLogResult] = useState(null);
  const [logLoading, setLogLoading] = useState(false);
  const [logError, setLogError] = useState(null);

  // Ask why state
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState(null);
  const [askLoading, setAskLoading] = useState(false);
  const [askError, setAskError] = useState(null);

  // History & explorer state
  const [decisions, setDecisions] = useState([]);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [historySearch, setHistorySearch] = useState("");
  const [selectedDecision, setSelectedDecision] = useState(null);
  const [editingDecision, setEditingDecision] = useState(null);
  const [editLoading, setEditLoading] = useState(false);

  // Interactive session counters
  const [aiInquiriesCount, setAiInquiriesCount] = useState(0);
  const [exploredCount, setExploredCount] = useState(0);
  const [lastActivityTime, setLastActivityTime] = useState(null);

  // Recycle bin state (stored in localStorage)
  const [recycledDecisions, setRecycledDecisions] = useState([]);

  // Auth state
  const [loginLoading, setLoginLoading] = useState(false);
  const [loginError, setLoginError] = useState(null);
  const [copyStatus, setCopyStatus] = useState(null);
  const [starterLoading, setStarterLoading] = useState(false);

  // Author & System Watermark in Console
  useEffect(() => {
    console.log(
      "%c=======================================================\\n DECISION LEDGER - Cloud-Native Decision Repository\\n Architect & Developer: Pinaki Roy\\n Connect on LinkedIn: https://www.linkedin.com/in/pinakiroysocial/\\n=======================================================",
      "color: #008080; font-weight: bold; font-family: monospace; font-size: 12px;"
    );
  }, []);

  // Live ticking clock & date
  useEffect(() => {
    function updateClock() {
      const now = new Date();
      setCurrentTime(
        now.toLocaleTimeString([], { hour: "numeric", minute: "2-digit", hour12: true })
      );
      setCurrentDate(
        now.toLocaleDateString([], { month: "numeric", day: "numeric", year: "numeric" })
      );
    }
    updateClock();
    const timer = setInterval(updateClock, 1000);
    return () => clearInterval(timer);
  }, []);

  // Load recycled decisions from localStorage and reset stale counters
  useEffect(() => {
    try {
      const stored = localStorage.getItem("decision_ledger_recycle_bin");
      if (stored) {
        setRecycledDecisions(JSON.parse(stored));
      }
      // Reset any legacy/test counters so fresh session starts clean at 0 and --:--
      localStorage.removeItem("dl_exp_count");
      localStorage.removeItem("dl_ai_count");
      localStorage.removeItem("dl_last_act");
    } catch (e) {
      console.warn("Could not read from localStorage", e);
    }
  }, []);

  function recordActivity() {
    const now = new Date();
    const timeStr = now.toLocaleTimeString([], { hour: "numeric", minute: "2-digit", hour12: true });
    setLastActivityTime(timeStr);
  }

  function incAiCount() {
    setAiInquiriesCount((c) => c + 1);
    recordActivity();
  }

  function incExploredCount() {
    setExploredCount((c) => c + 1);
    recordActivity();
  }

  function updateRecycleBin(items) {
    setRecycledDecisions(items);
    try {
      localStorage.setItem("decision_ledger_recycle_bin", JSON.stringify(items));
    } catch (e) {
      console.warn("Could not save recycle bin to localStorage", e);
    }
  }

  // Listen to auth state
  useEffect(() => {
    const unsubscribe = watchAuthState((u) => {
      setUser(u);
      if (u) {
        fetchDecisions();
      } else {
        setDecisions([]);
      }
    });
    return unsubscribe;
  }, []);

  async function callApi(path, method = "POST", body = null) {
    const token = await auth.currentUser.getIdToken();
    const options = {
      method,
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    };
    if (body) {
      options.body = JSON.stringify(body);
    }
    const res = await fetch(path, options);
    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.error || "Request failed");
    }
    return data;
  }

  async function handleLogin() {
    setLoginLoading(true);
    setLoginError(null);
    try {
      await loginWithGoogle();
      recordActivity();
    } catch (err) {
      console.error(err);
      setLoginError(err.message || "Failed to sign in with Google");
    } finally {
      setLoginLoading(false);
    }
  }

  async function handleGuestLogin() {
    setLoginLoading(true);
    setLoginError(null);
    try {
      await loginAnonymously();
      recordActivity();
    } catch (err) {
      console.error("Guest login error:", err);
      setLoginError(err.message || "Failed to initiate guest evaluation session. Please use Google Sign-In.");
    } finally {
      setLoginLoading(false);
    }
  }

  async function handleLoadStarterDecisions() {
    setStarterLoading(true);
    try {
      const seed1 = QUICK_TEMPLATES[0];
      const seed2 = QUICK_TEMPLATES[1];
      await callApi("/api/log-decision", "POST", { rawText: seed1.text, manualTags: seed1.tags });
      await callApi("/api/log-decision", "POST", { rawText: seed2.text, manualTags: seed2.tags });
      await fetchDecisions();
      recordActivity();
    } catch (err) {
      console.error("Failed to seed starter decisions:", err);
      alert("Failed to seed decisions: " + err.message);
    } finally {
      setStarterLoading(false);
    }
  }

  async function fetchDecisions() {
    setHistoryLoading(true);
    try {
      const data = await callApi("/api/list-decisions", "GET");
      setDecisions(data.decisions || []);
    } catch (err) {
      console.error("Failed to load decisions:", err);
    } finally {
      setHistoryLoading(false);
    }
  }

  async function handleLogDecision(e) {
    if (e) e.preventDefault();
    if (!rawText.trim()) return;

    setLogLoading(true);
    setLogError(null);
    setLogResult(null);

    try {
      const res = await callApi("/api/log-decision", "POST", {
        rawText,
        manualTags: manualTags.trim() || undefined,
      });
      setLogResult(res);
      setRawText("");
      setManualTags("");
      recordActivity();
      await fetchDecisions();
    } catch (err) {
      setLogError(err.message);
    } finally {
      setLogLoading(false);
    }
  }

  async function handleAskWhy(e) {
    if (e) e.preventDefault();
    if (!question.trim()) return;

    setAskLoading(true);
    setAskError(null);
    setAnswer(null);

    try {
      const res = await callApi("/api/ask-why", "POST", { question });
      setAnswer(res.answer);
      incAiCount();
    } catch (err) {
      setAskError(err.message);
    } finally {
      setAskLoading(false);
    }
  }

  async function handleDeleteDecision(decision) {
    if (!decision || !decision.id) return;
    const confirmDelete = window.confirm(
      `Move decision "${decision.title || "Untitled"}" to the Recycle Bin?`
    );
    if (!confirmDelete) return;

    try {
      await callApi("/api/delete-decision", "POST", { id: decision.id });
      updateRecycleBin([decision, ...recycledDecisions]);
      setDecisions(decisions.filter((d) => d.id !== decision.id));
      if (selectedDecision && selectedDecision.id === decision.id) {
        setSelectedDecision(null);
      }
      recordActivity();
    } catch (err) {
      alert("Failed to delete decision: " + err.message);
    }
  }

  async function handleRestoreDecision(decision) {
    if (!decision) return;
    try {
      await callApi("/api/log-decision", "POST", {
        rawText: decision.rawText || `${decision.title}: ${decision.reasoning}`,
        manualTags: decision.tags ? decision.tags.join(", ") : undefined,
      });
      const updated = recycledDecisions.filter((d) => d.id !== decision.id);
      updateRecycleBin(updated);
      await fetchDecisions();
      recordActivity();
      alert(`Restored "${decision.title || "Decision"}" to the active ledger!`);
    } catch (err) {
      alert("Failed to restore decision: " + err.message);
    }
  }

  function handleEmptyRecycleBin() {
    if (recycledDecisions.length === 0) return;
    const confirmEmpty = window.confirm(
      "Are you sure you want to permanently delete all items from the Recycle Bin? This action cannot be undone."
    );
    if (!confirmEmpty) return;
    updateRecycleBin([]);
  }

  async function handleSaveEdit(e) {
    if (e) e.preventDefault();
    if (!editingDecision) return;

    setEditLoading(true);
    try {
      await callApi("/api/update-decision", "POST", {
        id: editingDecision.id,
        title: editingDecision.title,
        chosen_option: editingDecision.chosen_option,
        reasoning: editingDecision.reasoning,
        tags: Array.isArray(editingDecision.tags)
          ? editingDecision.tags
          : (editingDecision.tags || "").split(",").map((t) => t.trim()).filter(Boolean),
      });
      await fetchDecisions();
      setEditingDecision(null);
      recordActivity();
    } catch (err) {
      alert("Failed to update decision: " + err.message);
    } finally {
      setEditLoading(false);
    }
  }

  function copyJson(data) {
    try {
      navigator.clipboard.writeText(JSON.stringify(data, null, 2));
      setCopyStatus("Copied JSON!");
      setTimeout(() => setCopyStatus(null), 2000);
    } catch (e) {
      alert("Could not copy JSON to clipboard.");
    }
  }

  function downloadJson(data, filename = "decisions-export.json") {
    try {
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = filename;
      a.click();
      URL.revokeObjectURL(url);
    } catch (e) {
      alert("Could not download JSON export.");
    }
  }

  function openHelpTopic(topic) {
    setHelpInitialTopic(topic);
    setHelpModalOpen(true);
  }

  const filteredDecisions = useMemo(() => {
    if (!historySearch.trim()) return decisions;
    const term = historySearch.toLowerCase();
    return decisions.filter((d) => {
      return (
        (d.title && d.title.toLowerCase().includes(term)) ||
        (d.chosen_option && d.chosen_option.toLowerCase().includes(term)) ||
        (d.reasoning && d.reasoning.toLowerCase().includes(term)) ||
        (d.tags && d.tags.some((t) => t.toLowerCase().includes(term)))
      );
    });
  }, [decisions, historySearch]);

  // If user is not logged in: Win95 logon dialog
  if (!user) {
    return (
      <div className="w95-fullscreen-app d-flex align-items-center justify-content-center p-3">
        <div className="w95-modal-window" style={{ maxWidth: 500 }}>
          <div className="w95-title-bar">
            <div className="w95-title-text">
              <img src="/icons/app-d.png" alt="Logo" style={{ width: 20, height: 20, imageRendering: "pixelated" }} />
              <span>Welcome to Decision Ledger</span>
            </div>
          </div>

          <div className="p-4">
            <div className="d-flex align-items-center mb-4">
              <img
                src="/icons/banner-logo.png"
                alt="Logo"
                style={{
                  width: 58,
                  height: 58,
                  border: "2px solid #808080",
                  boxShadow: "inset -1px -1px #fff, inset 1px 1px #000",
                  marginRight: 16,
                  imageRendering: "pixelated",
                  flexShrink: 0,
                }}
              />
              <div>
                <h4 className="font-weight-bold mb-1">Decision Ledger for Workgroups</h4>
                <p className="small text-muted mb-0">
                  Cloud-Native Architectural Record & Rationale Engine
                </p>
                <div className="small mt-1">
                  Built by{" "}
                  <a
                    href="https://www.linkedin.com/in/pinakiroysocial/"
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{ color: "#000080", textDecoration: "underline", fontWeight: "bold" }}
                  >
                    Pinaki Roy (LinkedIn ↗)
                  </a>
                </div>
              </div>
            </div>

            <div className="w95-inset mb-4 p-3" style={{ fontSize: 13, lineHeight: 1.5 }}>
              <p className="mb-2">
                Welcome to <strong>Decision Ledger</strong>! Sign in with your Google account or continue as Guest to access your personal cloud ledger, record architecture decisions, and query rationales with Gemini AI.
              </p>
              <div className="text-muted small">
                <strong>Engine:</strong> Google Gemini 3.5 Flash | <strong>Cloud Host:</strong> Vercel / Cloud Run (us-central1)
              </div>
            </div>

            {loginError && (
              <div className="alert alert-danger p-2 mb-3 small" style={{ border: "1px solid red" }}>
                <strong>Authentication Notice:</strong> {loginError}
              </div>
            )}

            <div className="d-flex justify-content-end gap-2">
              <button
                className="w95-btn"
                onClick={handleGuestLogin}
                disabled={loginLoading}
                title="Instant evaluation as a public guest"
              >
                <img src="/icons/explorer.png" alt="Guest" style={{ width: 16, height: 16 }} />
                <span>{loginLoading ? "Connecting..." : "Explore as Guest"}</span>
              </button>
              <button
                className="w95-btn w95-btn-primary"
                onClick={handleLogin}
                disabled={loginLoading}
                title="Sign in with your Google Account"
              >
                <img src="/icons/user-avatar.png" alt="User" style={{ width: 16, height: 16 }} />
                <span>{loginLoading ? "Authenticating..." : "Sign in with Google"}</span>
              </button>
            </div>
          </div>

          <div className="w95-statusbar">
            <div className="w95-status-pane flex-grow-1">Ready for logon</div>
            <div className="w95-status-pane">Cloud Run: us-central1</div>
          </div>
        </div>
      </div>
    );
  }

  // Signed in: Full-Screen 3-Column Dashboard
  return (
    <div className="w95-fullscreen-app" onClick={() => { if (activeMenuDropdown) setActiveMenuDropdown(null); if (otherDropdownOpen) setOtherDropdownOpen(false); }}>
      
      {/* 1. Main Title Bar */}
      <div className="w95-title-bar">
        <div className="w95-title-text">
          <img src="/icons/app-d.png" alt="App" style={{ width: 20, height: 20, imageRendering: "pixelated" }} />
          <span>Decision Ledger – Cloud-Native Decision Repository</span>
        </div>
      </div>

      {/* 2. Menu Bar Row */}
      <div className="w95-menu-bar" onClick={(e) => e.stopPropagation()}>
        {/* File Menu */}
        <div
          className={`w95-menu-item ${activeMenuDropdown === "file" ? "active" : ""}`}
          onClick={() => setActiveMenuDropdown(activeMenuDropdown === "file" ? null : "file")}
        >
          <u>F</u>ile
          {activeMenuDropdown === "file" && (
            <div className="w95-dropdown-menu">
              <div className="w95-dropdown-item" onClick={() => { setActiveTab("log"); setRawText(""); setManualTags(""); setActiveMenuDropdown(null); }}>
                <img src="/icons/new-log.png" alt="" style={{ width: 16, height: 16 }} />
                <span>New Decision Entry</span>
              </div>
              <div className="w95-dropdown-divider" />
              <div className="w95-dropdown-item" onClick={() => { downloadJson(decisions); setActiveMenuDropdown(null); }}>
                <img src="/icons/save.png" alt="" style={{ width: 16, height: 16 }} />
                <span>Export Ledger (JSON)</span>
              </div>
              <div className="w95-dropdown-divider" />
              <div className="w95-dropdown-item" onClick={() => { logout(); setActiveMenuDropdown(null); }}>
                <span>Log Off User</span>
              </div>
            </div>
          )}
        </div>

        {/* Edit Menu */}
        <div
          className={`w95-menu-item ${activeMenuDropdown === "edit" ? "active" : ""}`}
          onClick={() => setActiveMenuDropdown(activeMenuDropdown === "edit" ? null : "edit")}
        >
          <u>E</u>dit
          {activeMenuDropdown === "edit" && (
            <div className="w95-dropdown-menu">
              <div className="w95-dropdown-item" onClick={() => { setRawText(""); setManualTags(""); setActiveMenuDropdown(null); }}>
                <span>Clear Inputs</span>
              </div>
              <div className="w95-dropdown-item" onClick={() => { copyJson(decisions); setActiveMenuDropdown(null); }}>
                <img src="/icons/clipboard.png" alt="" style={{ width: 16, height: 16 }} />
                <span>Copy Ledger JSON</span>
              </div>
            </div>
          )}
        </div>

        {/* View Menu */}
        <div
          className={`w95-menu-item ${activeMenuDropdown === "view" ? "active" : ""}`}
          onClick={() => setActiveMenuDropdown(activeMenuDropdown === "view" ? null : "view")}
        >
          <u>V</u>iew
          {activeMenuDropdown === "view" && (
            <div className="w95-dropdown-menu">
              <div className="w95-dropdown-item" onClick={() => { setActiveTab("log"); setActiveMenuDropdown(null); }}>
                <img src="/icons/new-log.png" alt="" style={{ width: 16, height: 16 }} />
                <span>Log Decision</span>
              </div>
              <div className="w95-dropdown-item" onClick={() => { setActiveTab("ask"); setActiveMenuDropdown(null); }}>
                <img src="/icons/ask-ai.png" alt="" style={{ width: 16, height: 16 }} />
                <span>Ask Why (Gemini AI)</span>
              </div>
              <div className="w95-dropdown-item" onClick={() => { setActiveTab("history"); setActiveMenuDropdown(null); }}>
                <img src="/icons/explorer.png" alt="" style={{ width: 16, height: 16 }} />
                <span>Ledger Explorer</span>
              </div>
              <div className="w95-dropdown-item" onClick={() => { setActiveTab("about"); setActiveMenuDropdown(null); }}>
                <img src="/icons/info.png" alt="" style={{ width: 16, height: 16 }} />
                <span>System Info</span>
              </div>
              <div className="w95-dropdown-divider" />
              <div className="w95-dropdown-item" onClick={() => { fetchDecisions(); setActiveMenuDropdown(null); }}>
                <span>Refresh Data</span>
              </div>
            </div>
          )}
        </div>

        {/* Tools Menu */}
        <div
          className={`w95-menu-item ${activeMenuDropdown === "tools" ? "active" : ""}`}
          onClick={() => setActiveMenuDropdown(activeMenuDropdown === "tools" ? null : "tools")}
        >
          <u>T</u>ools
          {activeMenuDropdown === "tools" && (
            <div className="w95-dropdown-menu">
              <div className="w95-dropdown-item" onClick={() => { setTemplatesModalOpen(true); setActiveMenuDropdown(null); }}>
                <img src="/icons/template.png" alt="" style={{ width: 16, height: 16 }} />
                <span>Architectural Templates</span>
              </div>
              <div className="w95-dropdown-item" onClick={() => { setRecycleBinOpen(true); setActiveMenuDropdown(null); }}>
                <img src="/icons/recycle-bin.png" alt="" style={{ width: 16, height: 16 }} />
                <span>Recycle Bin ({recycledDecisions.length})</span>
              </div>
            </div>
          )}
        </div>

        {/* Cloud Menu */}
        <div
          className={`w95-menu-item ${activeMenuDropdown === "cloud" ? "active" : ""}`}
          onClick={() => setActiveMenuDropdown(activeMenuDropdown === "cloud" ? null : "cloud")}
        >
          <u>C</u>loud
          {activeMenuDropdown === "cloud" && (
            <div className="w95-dropdown-menu">
              <div className="w95-dropdown-item" onClick={() => { setSettingsModalOpen(true); setActiveMenuDropdown(null); }}>
                <img src="/icons/dot-green.png" alt="" style={{ width: 10, height: 10 }} />
                <span>Cloud Status & Region</span>
              </div>
              <div className="w95-dropdown-item" onClick={() => { window.open("https://console.cloud.google.com/run?project=decision-ledger-5931d", "_blank"); setActiveMenuDropdown(null); }}>
                <img src="/icons/cloud.png" alt="" style={{ width: 16, height: 16 }} />
                <span>Google Cloud Console ↗</span>
              </div>
            </div>
          )}
        </div>

        {/* Help Menu */}
        <div
          className={`w95-menu-item ${activeMenuDropdown === "help" ? "active" : ""}`}
          onClick={() => setActiveMenuDropdown(activeMenuDropdown === "help" ? null : "help")}
        >
          <u>H</u>elp
          {activeMenuDropdown === "help" && (
            <div className="w95-dropdown-menu">
              <div className="w95-dropdown-item" onClick={() => { openHelpTopic("how-it-works"); setActiveMenuDropdown(null); }}>
                <img src="/icons/help.png" alt="" style={{ width: 16, height: 16 }} />
                <span>Help Topics</span>
              </div>
              <div className="w95-dropdown-divider" />
              <div className="w95-dropdown-item" onClick={() => { setActiveTab("about"); setActiveMenuDropdown(null); }}>
                <span>About Decision Ledger</span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* 3. Icon Toolbar Row */}
      <div className="w95-toolbar">
        <div className="w95-toolbar-left">
          <button
            className={`w95-toolbar-btn ${activeTab === "log" ? "active" : ""}`}
            onClick={() => { setActiveTab("log"); setLogPanelOpen(true); }}
            title="Log a new architectural decision"
          >
            <img src="/icons/new-log.png" alt="" style={{ width: 18, height: 18 }} />
            <span>New Log</span>
          </button>

          <button
            className={`w95-toolbar-btn ${activeTab === "ask" ? "active" : ""}`}
            onClick={() => { setActiveTab("ask"); setAskPanelOpen(true); }}
            title="Query decisions using Gemini AI"
          >
            <img src="/icons/ask-ai.png" alt="" style={{ width: 18, height: 18 }} />
            <span>Ask AI</span>
          </button>

          <button
            className={`w95-toolbar-btn ${activeTab === "history" ? "active" : ""}`}
            onClick={() => { setActiveTab("history"); fetchDecisions(); }}
            title="Browse all logged decisions in the ledger"
          >
            <img src="/icons/explorer.png" alt="" style={{ width: 18, height: 18 }} />
            <span>Explorer</span>
          </button>

          <button
            className="w95-toolbar-btn"
            onClick={() => setHistoryModalOpen(true)}
            title="View session activity and decision timeline"
          >
            <img src="/icons/history.png" alt="" style={{ width: 18, height: 18 }} />
            <span>History</span>
          </button>

          <button
            className="w95-toolbar-btn"
            onClick={() => setSettingsModalOpen(true)}
            title="View system configuration"
          >
            <img src="/icons/settings.png" alt="" style={{ width: 18, height: 18 }} />
            <span>Settings</span>
          </button>

          <button
            className="w95-toolbar-btn"
            onClick={() => openHelpTopic("how-it-works")}
            title="Open Decision Ledger Help & FAQ"
          >
            <img src="/icons/help.png" alt="" style={{ width: 18, height: 18 }} />
            <span>Help</span>
          </button>
        </div>

        <div className="w95-toolbar-right">
          <div className="w95-toolbar-divider" />
          <div className="w95-toolbar-user" title={`Authenticated as ${user?.email || "Guest Evaluator"}`}>
            <img src="/icons/user-avatar.png" alt="" style={{ width: 22, height: 22 }} />
            <span>{user?.email || "Guest Evaluator"}</span>
          </div>
        </div>
      </div>

      {/* 4. Three-Column Dashboard Body */}
      <div className="w95-dashboard-body">

        {/* --- LEFT SIDEBAR: Navigation, Quick Access, Cloud Status --- */}
        <div className="w95-sidebar-left">
          {/* Navigation Panel */}
          <div className="w95-panel">
            <div className="w95-panel-title w95-panel-title-teal">
              <span>Navigation</span>
            </div>
            <div className="w95-panel-body p-2">
              <div className="w95-nav-list">
                <div
                  className={`w95-nav-item ${activeTab === "log" ? "active" : ""}`}
                  onClick={() => setActiveTab("log")}
                >
                  <img src="/icons/new-log.png" alt="" style={{ width: 16, height: 16 }} />
                  <span>Log Decision</span>
                </div>
                <div
                  className={`w95-nav-item ${activeTab === "ask" ? "active" : ""}`}
                  onClick={() => setActiveTab("ask")}
                >
                  <img src="/icons/star-gold.png" alt="" style={{ width: 16, height: 16 }} />
                  <span>Ask Why (Gemini AI)</span>
                </div>
                <div
                  className={`w95-nav-item ${activeTab === "history" ? "active" : ""}`}
                  onClick={() => { setActiveTab("history"); fetchDecisions(); }}
                >
                  <img src="/icons/explorer.png" alt="" style={{ width: 16, height: 16 }} />
                  <span>Ledger Explorer ({decisions.length})</span>
                </div>
                <div
                  className={`w95-nav-item ${activeTab === "about" ? "active" : ""}`}
                  onClick={() => setActiveTab("about")}
                >
                  <img src="/icons/info.png" alt="" style={{ width: 16, height: 16 }} />
                  <span>System Info</span>
                </div>
              </div>

              {/* Quick Access Section */}
              <div className="w95-nav-divider">– QUICK ACCESS –</div>
              <div className="w95-nav-list">
                <div
                  className="w95-nav-item"
                  onClick={() => {
                    setActiveTab("history");
                    setHistorySearch("database");
                  }}
                  title="Filter ledger explorer to tagged entries"
                >
                  <img src="/icons/tag.png" alt="" style={{ width: 16, height: 16 }} />
                  <span>Favorite Tags</span>
                </div>
                <div
                  className="w95-nav-item"
                  onClick={() => setTemplatesModalOpen(true)}
                >
                  <img src="/icons/template.png" alt="" style={{ width: 16, height: 16 }} />
                  <span>Templates</span>
                </div>
                <div
                  className="w95-nav-item"
                  onClick={() => setRecycleBinOpen(true)}
                >
                  <img src="/icons/recycle-bin.png" alt="" style={{ width: 16, height: 16 }} />
                  <span>Recycle Bin ({recycledDecisions.length})</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* --- CENTER COLUMN: Teal Banner + Tabs + Stacked Collapsible Panels --- */}
        <div className="w95-center-col">
          
          {/* Teal Header Banner */}
          <div className="w95-teal-banner">
            <div className="w95-banner-left">
              <img
                src="/icons/banner-logo.png"
                alt="Logo"
                style={{ width: 48, height: 48, imageRendering: "pixelated" }}
              />
              <div className="w95-banner-titles">
                <h1 className="w95-banner-title">Decision<br />Ledger</h1>
                <div className="w95-banner-tagline">
                  Your decisions.<br />
                  Structured. Justified. Saved.
                </div>
              </div>
            </div>

            <div className="w95-banner-usercard">
              <img
                src="/icons/user-avatar.png"
                alt="Avatar"
                style={{ width: 34, height: 34, imageRendering: "pixelated" }}
              />
              <div style={{ fontSize: 12 }}>
                <div className="text-muted" style={{ fontSize: 11 }}>Signed in as</div>
                <div className="font-weight-bold">{user?.email || "Guest Evaluator"}</div>
              </div>
              <button className="w95-btn w95-btn-sm ml-2" onClick={logout}>
                Log Out
              </button>
            </div>
          </div>

          {/* Tab Strip */}
          <div className="w95-tabs-container">
            <ul className="w95-tabs">
              <li
                className={`w95-tab-item ${activeTab === "log" ? "active" : ""}`}
                onClick={() => setActiveTab("log")}
              >
                <img src="/icons/new-log.png" alt="" style={{ width: 16, height: 16 }} />
                <span>Log Decision</span>
              </li>
              <li
                className={`w95-tab-item ${activeTab === "ask" ? "active" : ""}`}
                onClick={() => setActiveTab("ask")}
              >
                <span>Ask Why (Gemini AI)</span>
              </li>
              <li
                className={`w95-tab-item ${activeTab === "history" ? "active" : ""}`}
                onClick={() => { setActiveTab("history"); fetchDecisions(); }}
              >
                <span>Ledger Explorer ({decisions.length})</span>
              </li>
              <li
                className={`w95-tab-item ${activeTab === "about" ? "active" : ""}`}
                onClick={() => setActiveTab("about")}
              >
                <span>System Info</span>
              </li>
            </ul>
          </div>

          {/* TAB 1: Log Decision (Stacked Panels: Log a Decision + Ask Why) */}
          {activeTab === "log" && (
            <div className="d-flex flex-column gap-2">
              
              {/* Stacked Panel 1: Log a Decision */}
              <div className="w95-panel">
                <div className="w95-panel-title w95-panel-title-blue">
                  <div className="d-flex align-items-center gap-2">
                    <img src="/icons/new-log.png" alt="" style={{ width: 16, height: 16 }} />
                    <span>Log a Decision</span>
                  </div>
                  <button
                    className="w95-panel-chevron"
                    onClick={() => setLogPanelOpen(!logPanelOpen)}
                    title={logPanelOpen ? "Collapse panel" : "Expand panel"}
                  >
                    {logPanelOpen ? "▲" : "▼"}
                  </button>
                </div>

                {logPanelOpen && (
                  <div className="w95-panel-body p-3">
                    {/* Quick Templates Row */}
                    <div className="d-flex align-items-center flex-wrap gap-2 mb-2" style={{ fontSize: 13 }}>
                      <span className="font-weight-bold mr-1">Quick Templates:</span>
                      {QUICK_TEMPLATES.map((tpl) => (
                        <button
                          key={tpl.key}
                          type="button"
                          className="w95-btn w95-btn-sm"
                          onClick={() => {
                            setRawText(tpl.text);
                            setManualTags(tpl.tags);
                            setLogError(null);
                          }}
                        >
                          {tpl.label}
                        </button>
                      ))}

                      {/* 5th "Other ▼" dropdown */}
                      <div className="position-relative" onClick={(e) => e.stopPropagation()}>
                        <button
                          type="button"
                          className="w95-btn w95-btn-sm"
                          onClick={() => setOtherDropdownOpen(!otherDropdownOpen)}
                        >
                          <span>Other</span>
                          <span style={{ fontSize: 9 }}>▼</span>
                        </button>
                        {otherDropdownOpen && (
                          <div className="w95-dropdown-menu" style={{ right: 0, left: "auto", minWidth: 220 }}>
                            {OTHER_TEMPLATES.map((ot, idx) => (
                              <div
                                key={idx}
                                className="w95-dropdown-item"
                                onClick={() => {
                                  setRawText(ot.text);
                                  setManualTags(ot.tags);
                                  setOtherDropdownOpen(false);
                                  setLogError(null);
                                }}
                              >
                                <span>{ot.title}</span>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>

                    <form onSubmit={handleLogDecision}>
                      <div className="form-group mb-2">
                        <label className="font-weight-bold mb-1" style={{ fontSize: 13 }}>
                          Decision Context & Rationale (Freeform Text):
                        </label>
                        <textarea
                          className="w95-textarea"
                          rows={6}
                          placeholder="Describe what decision was made, what options were considered, and why..."
                          value={rawText}
                          onChange={(e) => setRawText(e.target.value)}
                        />
                      </div>

                      {/* Optional Manual Tags Input */}
                      <div className="form-group mb-3">
                        <label className="font-weight-bold mb-1" style={{ fontSize: 13 }}>
                          Tags (comma separated):
                        </label>
                        <input
                          type="text"
                          className="w95-input"
                          placeholder="e.g. database, gcp, architecture, security"
                          value={manualTags}
                          onChange={(e) => setManualTags(e.target.value)}
                        />
                      </div>

                      {logError && (
                        <div className="alert alert-danger p-2 mb-2 small" style={{ border: "1px solid red" }}>
                          <strong>Error:</strong> {logError}
                        </div>
                      )}

                      {/* Action Buttons */}
                      <div className="d-flex justify-content-end gap-2">
                        <button
                          type="submit"
                          className="w95-btn w95-btn-primary"
                          disabled={logLoading || !rawText.trim()}
                        >
                          <img src="/icons/save.png" alt="" style={{ width: 16, height: 16 }} />
                          <span>{logLoading ? "Analyzing with Gemini..." : "Log Decision"}</span>
                        </button>
                        <button
                          type="button"
                          className="w95-btn w95-btn-dialog"
                          disabled={logLoading || (!rawText && !manualTags)}
                          onClick={() => {
                            setRawText("");
                            setManualTags("");
                            setLogError(null);
                            setLogResult(null);
                          }}
                        >
                          Clear
                        </button>
                      </div>
                    </form>

                    {/* Result Card when Decision Logged */}
                    {logResult && (
                      <div className="w95-inset mt-3 p-3">
                        <div className="d-flex align-items-center gap-1 text-success font-weight-bold small mb-2">
                          <span>✓</span>
                          <span>Decision successfully recorded to Firestore!</span>
                        </div>
                        <table className="table table-sm table-borderless small mb-0" style={{ fontSize: 13 }}>
                          <tbody>
                            <tr>
                              <th style={{ width: 140 }}>Title:</th>
                              <td className="font-weight-bold">{logResult.title}</td>
                            </tr>
                            <tr>
                              <th>Chosen Option:</th>
                              <td>{logResult.chosen_option}</td>
                            </tr>
                            <tr>
                              <th>Options Considered:</th>
                              <td>{logResult.options_considered ? logResult.options_considered.join(", ") : "N/A"}</td>
                            </tr>
                            <tr>
                              <th>Reasoning:</th>
                              <td>{logResult.reasoning}</td>
                            </tr>
                            <tr>
                              <th>Tags:</th>
                              <td>
                                {logResult.tags && logResult.tags.map((t, idx) => (
                                  <span key={idx} className="w95-tag mr-1">#{t}</span>
                                ))}
                              </td>
                            </tr>
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Stacked Panel 2: Ask Why (Gemini AI) */}
              <div className="w95-panel">
                <div className="w95-panel-title w95-panel-title-blue">
                  <div className="d-flex align-items-center gap-2">
                    <img src="/icons/ask-ai.png" alt="" style={{ width: 16, height: 16 }} />
                    <span>Ask Why (Gemini AI Rationale Engine)</span>
                  </div>
                  <button
                    className="w95-panel-chevron"
                    onClick={() => setAskPanelOpen(!askPanelOpen)}
                    title={askPanelOpen ? "Collapse panel" : "Expand panel"}
                  >
                    {askPanelOpen ? "▲" : "▼"}
                  </button>
                </div>

                {askPanelOpen && (
                  <div className="w95-panel-body p-3">
                    <p className="text-muted small mb-3">
                      Ask questions about past architectural decisions. Gemini 3.5 Flash queries the decision ledger to synthesize structured rationale.
                    </p>

                    <form onSubmit={handleAskWhy}>
                      <div className="form-group mb-3">
                        <input
                          type="text"
                          className="w95-input"
                          style={{ padding: "8px 10px", fontSize: 13 }}
                          placeholder="e.g. Why did we choose Postgres over MongoDB?"
                          value={question}
                          onChange={(e) => setQuestion(e.target.value)}
                        />
                      </div>
                      <div className="d-flex justify-content-end">
                        <button
                          type="submit"
                          className="w95-btn w95-btn-primary"
                          disabled={askLoading || !question.trim()}
                        >
                          <img src="/icons/search.png" alt="" style={{ width: 16, height: 16 }} />
                          <span>{askLoading ? "Synthesizing..." : "Ask Why"}</span>
                        </button>
                      </div>
                    </form>

                    {askError && (
                      <div className="alert alert-danger p-2 mt-2 small" style={{ border: "1px solid red" }}>
                        <strong>Error:</strong> {askError}
                      </div>
                    )}

                    {answer && (
                      <div className="w95-inset mt-3 p-3">
                        <div className="d-flex align-items-center gap-2 mb-2 pb-1 border-bottom">
                          <img src="/icons/ask-ai.png" alt="" style={{ width: 18, height: 18 }} />
                          <span className="font-weight-bold small text-dark">
                            Synthesized Rationale (Gemini 3.5 Flash)
                          </span>
                        </div>
                        <FormattedAnswer text={answer} />
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 2: Ask Why Full View */}
          {activeTab === "ask" && (
            <div className="w95-panel">
              <div className="w95-panel-title w95-panel-title-blue">
                <div className="d-flex align-items-center gap-2">
                  <img src="/icons/star-gold.png" alt="" style={{ width: 16, height: 16 }} />
                  <span>Ask Why — Architectural Intelligence Engine</span>
                </div>
              </div>
              <div className="w95-panel-body p-3">
                <p className="small text-muted mb-3" style={{ fontSize: 13 }}>
                  Ask any question regarding your team's architectural decisions. Gemini AI synthesizes answers strictly grounded in the decisions stored in your Cloud Firestore repository.
                </p>

                {decisions.length > 0 && (
                  <div className="mb-3 d-flex flex-wrap align-items-center gap-2">
                    <span className="small font-weight-bold mr-1">Suggested Questions:</span>
                    <button
                      type="button"
                      className="w95-btn w95-btn-sm"
                      onClick={() => setQuestion(`Why did we choose ${decisions[0].chosen_option}?`)}
                    >
                      Why {decisions[0].chosen_option}?
                    </button>
                    {decisions.length > 1 && (
                      <button
                        type="button"
                        className="w95-btn w95-btn-sm"
                        onClick={() => setQuestion(`What alternatives were considered for ${decisions[1].title}?`)}
                      >
                        Options for {decisions[1].title}
                      </button>
                    )}
                  </div>
                )}

                <form onSubmit={handleAskWhy}>
                  <div className="mb-3">
                    <input
                      type="text"
                      className="w95-input"
                      style={{ padding: "8px 10px", fontSize: 13 }}
                      placeholder="e.g. Why did we choose Google Cloud Run over GCE VMs?"
                      value={question}
                      onChange={(e) => setQuestion(e.target.value)}
                    />
                  </div>
                  <div className="d-flex justify-content-end gap-2">
                    <button
                      type="submit"
                      className="w95-btn w95-btn-primary"
                      disabled={askLoading || !question.trim()}
                      style={{ padding: "6px 22px" }}
                    >
                      <img src="/icons/search.png" alt="" style={{ width: 16, height: 16 }} />
                      <span>{askLoading ? "Synthesizing Rationale..." : "Ask Gemini AI"}</span>
                    </button>
                  </div>
                </form>

                {askError && (
                  <div className="alert alert-danger p-2 mt-2 small" style={{ border: "1px solid red" }}>
                    <strong>Error:</strong> {askError}
                  </div>
                )}

                {answer && (
                  <div className="w95-inset mt-3 p-3">
                    <div className="d-flex align-items-center gap-2 mb-2 pb-1 border-bottom">
                      <img src="/icons/ask-ai.png" alt="" style={{ width: 18, height: 18 }} />
                      <span className="font-weight-bold small text-dark">
                        Synthesized Rationale (Gemini 3.5 Flash)
                      </span>
                    </div>
                    <FormattedAnswer text={answer} />
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 3: Ledger Explorer Full View */}
          {activeTab === "history" && (
            <div className="w95-panel">
              <div className="w95-panel-title w95-panel-title-blue">
                <div className="d-flex align-items-center gap-2">
                  <img src="/icons/explorer.png" alt="" style={{ width: 16, height: 16 }} />
                  <span>Ledger Explorer — Central Decision Repository ({decisions.length})</span>
                </div>
              </div>
              <div className="w95-panel-body p-3">
                {/* Search & Actions Bar */}
                <div className="d-flex flex-wrap justify-content-between align-items-center gap-2 mb-3">
                  <div className="d-flex align-items-center gap-2 flex-grow-1" style={{ maxWidth: 380 }}>
                    <span className="small font-weight-bold">Filter:</span>
                    <input
                      type="text"
                      className="w95-input"
                      placeholder="Filter by title, chosen option, tag..."
                      value={historySearch}
                      onChange={(e) => setHistorySearch(e.target.value)}
                    />
                  </div>
                  <div className="d-flex gap-2">
                    <button
                      type="button"
                      className="w95-btn w95-btn-sm"
                      onClick={fetchDecisions}
                      disabled={historyLoading}
                    >
                      <img src="/icons/refresh.png" alt="" style={{ width: 14, height: 14 }} />
                      <span>{historyLoading ? "Refreshing..." : "Refresh Ledger"}</span>
                    </button>
                    <button
                      type="button"
                      className="w95-btn w95-btn-sm"
                      onClick={() => copyJson(decisions)}
                      disabled={decisions.length === 0}
                    >
                      <img src="/icons/clipboard.png" alt="" style={{ width: 14, height: 14 }} />
                      <span>{copyStatus || "Copy JSON"}</span>
                    </button>
                    <button
                      type="button"
                      className="w95-btn w95-btn-sm"
                      onClick={() => downloadJson(decisions)}
                      disabled={decisions.length === 0}
                    >
                      <img src="/icons/save.png" alt="" style={{ width: 14, height: 14 }} />
                      <span>Export</span>
                    </button>
                  </div>
                </div>

                {/* Explorer Table */}
                <div className="w95-inset p-0" style={{ maxHeight: 380, overflowY: "auto" }}>
                  {filteredDecisions.length === 0 ? (
                    <div className="text-center py-5 text-muted small">
                      {historyLoading ? (
                        "Loading decisions from Firestore..."
                      ) : decisions.length === 0 ? (
                        <div className="p-3">
                          <p className="font-weight-bold mb-1" style={{ color: "#000", fontSize: 14 }}>
                            Your decision ledger is currently empty.
                          </p>
                          <p className="text-muted mb-3" style={{ fontSize: 13 }}>
                            Start by logging an architectural decision above, or click below to seed starter decisions to test search and AI inquiries immediately!
                          </p>
                          <button
                            type="button"
                            className="w95-btn w95-btn-sm mx-auto"
                            onClick={handleLoadStarterDecisions}
                            disabled={starterLoading}
                            style={{ display: "inline-flex" }}
                          >
                            <img src="/icons/template.png" alt="" style={{ width: 14, height: 14 }} />
                            <span>{starterLoading ? "Seeding decisions..." : "Load Starter Decisions"}</span>
                          </button>
                        </div>
                      ) : (
                        "No decisions found matching your filter."
                      )}
                    </div>
                  ) : (
                    <table className="table table-sm table-striped table-hover mb-0" style={{ fontSize: 13 }}>
                      <thead style={{ background: "var(--w95-gray)", position: "sticky", top: 0, zIndex: 2 }}>
                        <tr>
                          <th style={{ width: 150 }}>Title</th>
                          <th style={{ width: 130 }}>Chosen Option</th>
                          <th>Reasoning</th>
                          <th style={{ width: 140 }}>Tags</th>
                          <th className="text-right" style={{ width: 100 }}>Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredDecisions.map((d) => (
                          <tr
                            key={d.id}
                            style={{ cursor: "pointer" }}
                            onClick={() => {
                              setSelectedDecision(d);
                              incExploredCount();
                            }}
                          >
                            <td className="font-weight-bold text-truncate" style={{ maxWidth: 150 }}>
                              {d.title}
                            </td>
                            <td>
                              <span style={{ background: "#e8f0fe", color: "#1a73e8", padding: "2px 6px", borderRadius: 2 }}>
                                {d.chosen_option}
                              </span>
                            </td>
                            <td className="text-truncate" style={{ maxWidth: 220 }} title={d.reasoning}>
                              {d.reasoning}
                            </td>
                            <td>
                              {d.tags && d.tags.slice(0, 2).map((t, idx) => (
                                <span key={idx} className="w95-tag" style={{ fontSize: 11, padding: "2px 6px", marginRight: 3 }}>
                                  #{t}
                                </span>
                              ))}
                              {d.tags && d.tags.length > 2 && <span className="small text-muted">+{d.tags.length - 2}</span>}
                            </td>
                            <td className="text-right" onClick={(e) => e.stopPropagation()}>
                              <button
                                type="button"
                                className="w95-btn w95-btn-icon mr-1"
                                title="Edit Decision"
                                onClick={() => {
                                  setEditingDecision(d);
                                  incExploredCount();
                                }}
                              >
                                <img src="/icons/edit.png" alt="Edit" style={{ width: 14, height: 14 }} />
                              </button>
                              <button
                                type="button"
                                className="w95-btn w95-btn-icon w95-btn-danger"
                                title="Move to Recycle Bin"
                                onClick={() => handleDeleteDecision(d)}
                              >
                                <img src="/icons/trash.png" alt="Delete" style={{ width: 14, height: 14 }} />
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  )}
                </div>

                {/* Selected Decision Detail Inspection */}
                {selectedDecision && (
                  <div className="w95-fieldset mt-3">
                    <legend className="w95-legend">Decision Details: {selectedDecision.title}</legend>
                    <div className="d-flex justify-content-between mb-2">
                      <span className="small text-muted">Document ID: <code>{selectedDecision.id}</code></span>
                      <button className="w95-btn w95-btn-sm" onClick={() => setSelectedDecision(null)}>Close Preview</button>
                    </div>
                    <table className="table table-sm table-borderless small mb-0" style={{ fontSize: 13 }}>
                      <tbody>
                        <tr>
                          <th style={{ width: 140 }}>Chosen Option:</th>
                          <td className="font-weight-bold">{selectedDecision.chosen_option}</td>
                        </tr>
                        <tr>
                          <th>Considered:</th>
                          <td>{selectedDecision.options_considered ? selectedDecision.options_considered.join(", ") : "N/A"}</td>
                        </tr>
                        <tr>
                          <th>Reasoning:</th>
                          <td>{selectedDecision.reasoning}</td>
                        </tr>
                        <tr>
                          <th>Tags:</th>
                          <td>
                            {selectedDecision.tags && selectedDecision.tags.map((t, idx) => (
                              <span key={idx} className="w95-tag mr-1">#{t}</span>
                            ))}
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 4: System Info */}
          {activeTab === "about" && (
            <div className="w95-panel">
              <div className="w95-panel-title w95-panel-title-blue">
                <div className="d-flex align-items-center gap-2">
                  <img src="/icons/info.png" alt="" style={{ width: 16, height: 16 }} />
                  <span>System Information & Workstation Architecture</span>
                </div>
              </div>
              <div className="w95-panel-body p-3">
                <div className="row">
                  <div className="col-md-5 mb-3">
                    <div className="w95-inset text-center p-4 h-100 d-flex flex-column align-items-center justify-content-center">
                      <img
                        src="/img/logo.jpg"
                        alt="Logo"
                        style={{
                          width: 80,
                          height: 80,
                          border: "2px solid #808080",
                          boxShadow: "inset -1px -1px #fff, inset 1px 1px #000",
                          marginBottom: 12,
                          objectFit: "cover",
                        }}
                      />
                      <h5 className="font-weight-bold mb-1">Decision Ledger</h5>
                      <div className="small text-muted mb-2">v2.0 Workstation Edition</div>
                      <div className="small mt-1">
                        Built by{" "}
                        <a
                          href="https://www.linkedin.com/in/pinakiroysocial/"
                          target="_blank"
                          rel="noopener noreferrer"
                          style={{ color: "#000080", textDecoration: "underline", fontWeight: "bold" }}
                        >
                          Pinaki Roy (LinkedIn ↗)
                        </a>
                      </div>
                    </div>
                  </div>

                  <div className="col-md-7 mb-3">
                    <fieldset className="w95-fieldset h-100 p-3">
                      <legend className="w95-legend">System Specifications</legend>
                      <table className="table table-sm table-borderless small mb-0" style={{ width: "100%", fontSize: 13 }}>
                        <tbody>
                          <tr>
                            <th style={{ whiteSpace: "nowrap", width: "130px", verticalAlign: "top", paddingRight: "10px" }}>
                              Project ID:
                            </th>
                            <td style={{ wordBreak: "break-word" }}>
                              decision-ledger-5931d
                            </td>
                          </tr>
                          <tr>
                            <th style={{ whiteSpace: "nowrap", verticalAlign: "top", paddingRight: "10px" }}>
                              Framework:
                            </th>
                            <td>Next.js 14 (Standalone Docker)</td>
                          </tr>
                          <tr>
                            <th style={{ whiteSpace: "nowrap", verticalAlign: "top", paddingRight: "10px" }}>
                              Theme:
                            </th>
                            <td>Windows 95 3-Column Retro Dashboard</td>
                          </tr>
                          <tr>
                            <th style={{ whiteSpace: "nowrap", verticalAlign: "top", paddingRight: "10px" }}>
                              AI Model:
                            </th>
                            <td>Gemini 3.5 Flash (Google Generative AI)</td>
                          </tr>
                          <tr>
                            <th style={{ whiteSpace: "nowrap", verticalAlign: "top", paddingRight: "10px" }}>
                              Authentication:
                            </th>
                            <td>Firebase Auth (Google Sign-In)</td>
                          </tr>
                          <tr>
                            <th style={{ whiteSpace: "nowrap", verticalAlign: "top", paddingRight: "10px" }}>
                              Database:
                            </th>
                            <td>Google Cloud Firestore (Native)</td>
                          </tr>
                          <tr>
                            <th style={{ whiteSpace: "nowrap", verticalAlign: "top", paddingRight: "10px" }}>
                              Cloud Host:
                            </th>
                            <td>Google Cloud Run (us-central1)</td>
                          </tr>
                          <tr>
                            <th style={{ whiteSpace: "nowrap", verticalAlign: "top", paddingRight: "10px" }}>
                              Lead Architect:
                            </th>
                            <td>
                              <strong>Pinaki Roy</strong> (
                              <a
                                href="https://www.linkedin.com/in/pinakiroysocial/"
                                target="_blank"
                                rel="noopener noreferrer"
                                style={{ color: "#000080", textDecoration: "underline", fontWeight: "bold" }}
                              >
                                LinkedIn Profile ↗
                              </a>
                              )
                            </td>
                          </tr>
                          <tr>
                            <th style={{ whiteSpace: "nowrap", verticalAlign: "top", paddingRight: "10px" }}>
                              Status:
                            </th>
                            <td className="text-success font-weight-bold">
                              ● Active & Operational
                            </td>
                          </tr>
                        </tbody>
                      </table>
                    </fieldset>
                  </div>
                </div>
              </div>
            </div>
          )}

        </div>

        {/* --- RIGHT SIDEBAR: Today at a Glance, Recent Decisions, Need Help? --- */}
        <div className="w95-sidebar-right">
          
          {/* Widget 1: Today at a glance */}
          <div className="w95-panel">
            <div className="w95-panel-title w95-panel-title-blue">
              <div className="d-flex align-items-center gap-1">
                <span style={{ color: "#ffd700", fontSize: 13 }}>✦</span>
                <span>Today at a glance</span>
              </div>
              <button
                className="w95-panel-chevron"
                onClick={() => setStatsWidgetOpen(!statsWidgetOpen)}
                title={statsWidgetOpen ? "Collapse" : "Expand"}
              >
                {statsWidgetOpen ? "▲" : "▼"}
              </button>
            </div>

            {statsWidgetOpen && (
              <div className="w95-panel-body p-2">
                <div className="w95-inset p-1">
                  <div className="w95-stat-row">
                    <div className="w95-stat-label">
                      <img src="/icons/new-log.png" alt="" style={{ width: 16, height: 16 }} />
                      <span>Decisions Logged</span>
                    </div>
                    <div className="w95-stat-val">{decisions.length}</div>
                  </div>
                  <div className="w95-stat-row">
                    <div className="w95-stat-label">
                      <img src="/icons/star-gold.png" alt="" style={{ width: 16, height: 16 }} />
                      <span>AI Inquiries Made</span>
                    </div>
                    <div className="w95-stat-val">{aiInquiriesCount}</div>
                  </div>
                  <div className="w95-stat-row">
                    <div className="w95-stat-label">
                      <img src="/icons/explorer.png" alt="" style={{ width: 16, height: 16 }} />
                      <span>Documents Explored</span>
                    </div>
                    <div className="w95-stat-val">{exploredCount}</div>
                  </div>
                  <div className="w95-stat-row">
                    <div className="w95-stat-label">
                      <img src="/icons/history.png" alt="" style={{ width: 16, height: 16 }} />
                      <span>Last Activity</span>
                    </div>
                    <div className="w95-stat-val" style={{ fontSize: 12 }}>
                      {lastActivityTime || "--:--"}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Widget 2: Recent Decisions */}
          <div className="w95-panel">
            <div className="w95-panel-title w95-panel-title-blue">
              <span>Recent Decisions</span>
              <button
                className="w95-panel-chevron"
                onClick={() => setRecentWidgetOpen(!recentWidgetOpen)}
                title={recentWidgetOpen ? "Collapse" : "Expand"}
              >
                {recentWidgetOpen ? "▲" : "▼"}
              </button>
            </div>

            {recentWidgetOpen && (
              <div className="w95-panel-body p-2">
                <div className="w95-inset p-3">
                  {decisions.length === 0 ? (
                    <div className="text-center py-4">
                      <p className="text-muted small mb-3" style={{ fontStyle: "italic", fontSize: 12, lineHeight: 1.5 }}>
                        No recent decisions yet.<br />Start logging to see them here.
                      </p>
                      <img
                        src="/icons/clipboard.png"
                        alt="Clipboard"
                        style={{ width: 36, height: 36, imageRendering: "pixelated" }}
                      />
                    </div>
                  ) : (
                    <div className="d-flex flex-column gap-2">
                      {decisions.slice(0, 4).map((d) => (
                        <div
                          key={d.id}
                          className="p-2 border-bottom"
                          style={{ cursor: "pointer", fontSize: 12 }}
                          onClick={() => {
                            setActiveTab("history");
                            setSelectedDecision(d);
                            incExploredCount();
                          }}
                        >
                          <div className="font-weight-bold text-truncate" style={{ color: "#000080" }}>
                            {d.title}
                          </div>
                          <div className="text-muted small">
                            Picked: {d.chosen_option}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Widget 3: Need Help? FAQ List */}
          <div className="w95-panel">
            <div className="w95-panel-title w95-panel-title-blue">
              <span>Need Help?</span>
              <button
                className="w95-panel-chevron"
                onClick={() => setHelpWidgetOpen(!helpWidgetOpen)}
                title={helpWidgetOpen ? "Collapse" : "Expand"}
              >
                {helpWidgetOpen ? "▲" : "▼"}
              </button>
            </div>

            {helpWidgetOpen && (
              <div className="w95-panel-body p-2">
                <div className="w95-inset p-2">
                  <div
                    className="w95-faq-item"
                    onClick={() => openHelpTopic("how-it-works")}
                  >
                    <img src="/icons/help-question.png" alt="" style={{ width: 16, height: 16 }} />
                    <span>How does Decision Ledger work?</span>
                  </div>
                  <div
                    className="w95-faq-item"
                    onClick={() => openHelpTopic("why-gemini")}
                  >
                    <img src="/icons/help-question.png" alt="" style={{ width: 16, height: 16 }} />
                    <span>Why use Gemini for rationale?</span>
                  </div>
                  <div
                    className="w95-faq-item"
                    onClick={() => openHelpTopic("security")}
                  >
                    <img src="/icons/help-question.png" alt="" style={{ width: 16, height: 16 }} />
                    <span>How is data stored securely?</span>
                  </div>
                </div>
              </div>
            )}
          </div>

        </div>

      </div>

      {/* 5. Status Bar Pinned to Viewport Bottom */}
      <div className="w95-statusbar">
        <div className="w95-status-pane flex-grow-1">
          {logLoading
            ? "⏳ Analyzing with Gemini AI..."
            : askLoading
            ? "⏳ Querying decision history..."
            : historyLoading
            ? "⏳ Refreshing ledger records..."
            : "Ready"}
        </div>
        <div className="w95-status-pane">
          <span>Workspace: Default</span>
        </div>
        <div className="w95-status-pane d-none d-sm-flex">
          <img src="/icons/dot-green.png" alt="" style={{ width: 10, height: 10 }} />
          <span>Cloud: Connected (us-central1)</span>
        </div>
        <div className="w95-status-pane d-none d-md-flex">
          <span>{currentDate}</span>
        </div>
        <div className="w95-status-pane" style={{ fontWeight: 600 }}>
          <span>Dev: </span>
          <a
            href="https://www.linkedin.com/in/pinakiroysocial/"
            target="_blank"
            rel="noopener noreferrer"
            style={{ color: "#000080", textDecoration: "underline", marginLeft: 4 }}
          >
            Pinaki Roy ↗
          </a>
        </div>
        <div className="w95-status-pane">
          <span className="font-weight-bold">{currentTime}</span>
        </div>
      </div>

      {/* --- MODAL: Help Topics Dialog --- */}
      {helpModalOpen && (
        <div className="w95-modal-overlay" onClick={() => setHelpModalOpen(false)}>
          <div className="w95-modal-window" style={{ maxWidth: 600 }} onClick={(e) => e.stopPropagation()}>
            <div className="w95-title-bar">
              <div className="w95-title-text">
                <img src="/icons/help.png" alt="" style={{ width: 16, height: 16 }} />
                <span>Help Topics: Decision Ledger</span>
              </div>
              <div className="w95-title-controls">
                <button className="w95-title-btn" onClick={() => setHelpModalOpen(false)}>✕</button>
              </div>
            </div>

            <div className="p-3">
              <div className="d-flex gap-2 mb-2">
                <button
                  className={`w95-btn w95-btn-sm ${helpInitialTopic === "how-it-works" ? "w95-btn-primary" : ""}`}
                  onClick={() => setHelpInitialTopic("how-it-works")}
                >
                  How It Works
                </button>
                <button
                  className={`w95-btn w95-btn-sm ${helpInitialTopic === "why-gemini" ? "w95-btn-primary" : ""}`}
                  onClick={() => setHelpInitialTopic("why-gemini")}
                >
                  Why Gemini AI
                </button>
                <button
                  className={`w95-btn w95-btn-sm ${helpInitialTopic === "security" ? "w95-btn-primary" : ""}`}
                  onClick={() => setHelpInitialTopic("security")}
                >
                  Security & Storage
                </button>
                <button
                  className={`w95-btn w95-btn-sm ${helpInitialTopic === "credits" ? "w95-btn-primary" : ""}`}
                  onClick={() => setHelpInitialTopic("credits")}
                >
                  Credits
                </button>
              </div>

              <div className="w95-inset p-3" style={{ minHeight: 220, maxHeight: 340, overflowY: "auto", fontSize: 13, lineHeight: 1.6 }}>
                {helpInitialTopic === "how-it-works" && (
                  <div>
                    <h6 className="font-weight-bold text-primary mb-2">How Decision Ledger Works</h6>
                    <p>
                      <strong>1. Freeform Logging:</strong> Engineers log decisions in natural language. You don't have to fill out cumbersome multi-field forms; simply type what was decided and why.
                    </p>
                    <p>
                      <strong>2. AI Extraction:</strong> Gemini 3.5 Flash automatically parses your text into structured attributes: Title, Options Considered, Chosen Option, Reasoning, and Tags.
                    </p>
                    <p>
                      <strong>3. Centralized Knowledge Base:</strong> Decisions are indexed in Cloud Firestore. New teammates can instantly query past architectural tradeoffs using the <em>Ask Why</em> tool.
                    </p>
                  </div>
                )}

                {helpInitialTopic === "why-gemini" && (
                  <div>
                    <h6 className="font-weight-bold text-primary mb-2">Why Use Gemini for Rationale?</h6>
                    <p>
                      Traditional search engines only match exact keywords. Gemini 3.5 Flash understands semantic engineering context and synthesizes natural, multi-document explanations citing specific decisions.
                    </p>
                    <p>
                      The rationale engine runs with strict grounding instructions: it only draws conclusions from verified decisions in your ledger, preventing hallucinations.
                    </p>
                  </div>
                )}

                {helpInitialTopic === "security" && (
                  <div>
                    <h6 className="font-weight-bold text-primary mb-2">Security & Data Isolation</h6>
                    <p>
                      <strong>Authentication:</strong> All client queries are authenticated via Firebase Google OAuth. Cloud Run endpoints verify ID tokens via Firebase Admin SDK.
                    </p>
                    <p>
                      <strong>Storage:</strong> Decision records reside in Google Cloud Firestore with security rules protecting documents per workgroup.
                    </p>
                  </div>
                )}

                {helpInitialTopic === "credits" && (
                  <div>
                    <h6 className="font-weight-bold text-primary mb-2">Architectural Credits</h6>
                    <p>
                      <strong>Developer:</strong> Pinaki Roy (<a href="https://www.linkedin.com/in/pinakiroysocial/" target="_blank" rel="noopener noreferrer">LinkedIn ↗</a>)
                    </p>
                    <p>
                      <strong>Stack:</strong> Next.js 14, Docker, Google Cloud Run, Google Generative AI (Gemini 3.5 Flash), Firebase Authentication, Cloud Firestore, Windows 95 UI Kit.
                    </p>
                  </div>
                )}
              </div>

              <div className="d-flex justify-content-end mt-3">
                <button className="w95-btn w95-btn-dialog" onClick={() => setHelpModalOpen(false)}>
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* --- MODAL: Templates Dialog --- */}
      {templatesModalOpen && (
        <div className="w95-modal-overlay" onClick={() => setTemplatesModalOpen(false)}>
          <div className="w95-modal-window" style={{ maxWidth: 560 }} onClick={(e) => e.stopPropagation()}>
            <div className="w95-title-bar">
              <div className="w95-title-text">
                <img src="/icons/template.png" alt="" style={{ width: 16, height: 16 }} />
                <span>Architectural Decision Templates</span>
              </div>
              <div className="w95-title-controls">
                <button className="w95-title-btn" onClick={() => setTemplatesModalOpen(false)}>✕</button>
              </div>
            </div>

            <div className="p-3">
              <p className="small text-muted mb-2">
                Select a template below to load real-world architectural tradeoffs into the decision logger:
              </p>

              <div className="w95-inset p-2 mb-3" style={{ maxHeight: 280, overflowY: "auto" }}>
                {[...QUICK_TEMPLATES, ...OTHER_TEMPLATES].map((tpl, i) => (
                  <div
                    key={i}
                    className="p-2 border-bottom mb-1"
                    style={{ cursor: "pointer", background: "#fdfdfd" }}
                    onClick={() => {
                      setRawText(tpl.text);
                      setManualTags(tpl.tags || "");
                      setTemplatesModalOpen(false);
                      setActiveTab("log");
                      setLogError(null);
                    }}
                  >
                    <div className="font-weight-bold small text-primary">{tpl.title || tpl.label}</div>
                    <div className="small text-muted text-truncate">{tpl.text}</div>
                  </div>
                ))}
              </div>

              <div className="d-flex justify-content-end">
                <button className="w95-btn w95-btn-dialog" onClick={() => setTemplatesModalOpen(false)}>
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* --- MODAL: Recycle Bin Dialog --- */}
      {recycleBinOpen && (
        <div className="w95-modal-overlay" onClick={() => setRecycleBinOpen(false)}>
          <div className="w95-modal-window" onClick={(e) => e.stopPropagation()}>
            <div className="w95-title-bar">
              <div className="w95-title-text">
                <img src="/icons/recycle-bin.png" alt="" style={{ width: 16, height: 16 }} />
                <span>Recycle Bin ({recycledDecisions.length} items)</span>
              </div>
              <div className="w95-title-controls">
                <button className="w95-title-btn" onClick={() => setRecycleBinOpen(false)}>✕</button>
              </div>
            </div>

            <div className="p-3">
              <div className="d-flex justify-content-between align-items-center mb-2">
                <span className="small text-muted">
                  Deleted decisions can be restored to Firestore or permanently deleted.
                </span>
                <button
                  type="button"
                  className="w95-btn w95-btn-sm"
                  disabled={recycledDecisions.length === 0}
                  onClick={handleEmptyRecycleBin}
                >
                  <img src="/icons/cross-red.png" alt="" style={{ width: 14, height: 14 }} />
                  <span>Empty Recycle Bin</span>
                </button>
              </div>

              <div className="w95-inset p-0 mb-3" style={{ maxHeight: 240, overflowY: "auto" }}>
                {recycledDecisions.length === 0 ? (
                  <div className="text-center py-4 text-muted small">
                    The Recycle Bin is empty.
                  </div>
                ) : (
                  <table className="table table-sm table-striped mb-0" style={{ fontSize: 13 }}>
                    <thead>
                      <tr>
                        <th>Title</th>
                        <th>Chosen</th>
                        <th className="text-right">Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {recycledDecisions.map((item, idx) => (
                        <tr key={item.id || idx}>
                          <td className="font-weight-bold">{item.title}</td>
                          <td>{item.chosen_option}</td>
                          <td className="text-right">
                            <button
                              type="button"
                              className="w95-btn w95-btn-sm"
                              onClick={() => handleRestoreDecision(item)}
                            >
                              <img src="/icons/restore.png" alt="" style={{ width: 14, height: 14 }} />
                              <span>Restore</span>
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>

              <div className="d-flex justify-content-end">
                <button className="w95-btn w95-btn-dialog" onClick={() => setRecycleBinOpen(false)}>
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* --- MODAL: Edit Decision Dialog --- */}
      {editingDecision && (
        <div className="w95-modal-overlay" onClick={() => setEditingDecision(null)}>
          <div className="w95-modal-window" style={{ maxWidth: 520 }} onClick={(e) => e.stopPropagation()}>
            <div className="w95-title-bar">
              <div className="w95-title-text">
                <img src="/icons/edit.png" alt="" style={{ width: 16, height: 16 }} />
                <span>Edit Architectural Decision</span>
              </div>
              <div className="w95-title-controls">
                <button className="w95-title-btn" onClick={() => setEditingDecision(null)}>✕</button>
              </div>
            </div>

            <form onSubmit={handleSaveEdit} className="p-3">
              <div className="form-group mb-2">
                <label className="small font-weight-bold mb-1">Title:</label>
                <input
                  type="text"
                  className="w95-input"
                  value={editingDecision.title || ""}
                  onChange={(e) => setEditingDecision({ ...editingDecision, title: e.target.value })}
                  required
                />
              </div>

              <div className="form-group mb-2">
                <label className="small font-weight-bold mb-1">Chosen Option:</label>
                <input
                  type="text"
                  className="w95-input"
                  value={editingDecision.chosen_option || ""}
                  onChange={(e) => setEditingDecision({ ...editingDecision, chosen_option: e.target.value })}
                  required
                />
              </div>

              <div className="form-group mb-2">
                <label className="small font-weight-bold mb-1">Reasoning:</label>
                <textarea
                  className="w95-textarea"
                  rows={4}
                  value={editingDecision.reasoning || ""}
                  onChange={(e) => setEditingDecision({ ...editingDecision, reasoning: e.target.value })}
                  required
                />
              </div>

              <div className="form-group mb-3">
                <label className="small font-weight-bold mb-1">Tags (comma separated):</label>
                <input
                  type="text"
                  className="w95-input"
                  value={Array.isArray(editingDecision.tags) ? editingDecision.tags.join(", ") : editingDecision.tags || ""}
                  onChange={(e) => setEditingDecision({ ...editingDecision, tags: e.target.value })}
                />
              </div>

              <div className="d-flex justify-content-end gap-2">
                <button
                  type="submit"
                  className="w95-btn w95-btn-primary w95-btn-dialog"
                  disabled={editLoading}
                >
                  <img src="/icons/save.png" alt="" style={{ width: 16, height: 16 }} />
                  <span>{editLoading ? "Saving..." : "Save Changes"}</span>
                </button>
                <button
                  type="button"
                  className="w95-btn w95-btn-dialog"
                  onClick={() => setEditingDecision(null)}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* --- MODAL: Settings Dialog --- */}
      {settingsModalOpen && (
        <div className="w95-modal-overlay" onClick={() => setSettingsModalOpen(false)}>
          <div className="w95-modal-window" style={{ maxWidth: 500 }} onClick={(e) => e.stopPropagation()}>
            <div className="w95-title-bar">
              <div className="w95-title-text">
                <img src="/icons/settings.png" alt="" style={{ width: 16, height: 16 }} />
                <span>System Configuration & Cloud Settings</span>
              </div>
              <div className="w95-title-controls">
                <button className="w95-title-btn" onClick={() => setSettingsModalOpen(false)}>✕</button>
              </div>
            </div>

            <div className="p-3">
              <div className="w95-inset mb-3 p-3">
                <table className="table table-sm table-borderless small mb-0" style={{ fontSize: 13 }}>
                  <tbody>
                    <tr>
                      <th style={{ width: 130 }}>GCP Project:</th>
                      <td>decision-ledger-5931d</td>
                    </tr>
                    <tr>
                      <th>Region:</th>
                      <td>us-central1</td>
                    </tr>
                    <tr>
                      <th>AI Model:</th>
                      <td>Gemini 3.5 Flash</td>
                    </tr>
                    <tr>
                      <th>Signed-in User:</th>
                      <td>{user?.email || "Guest Evaluator"}</td>
                    </tr>
                    <tr>
                      <th>Decisions Count:</th>
                      <td>{decisions.length} stored records</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <div className="d-flex justify-content-end">
                <button className="w95-btn w95-btn-dialog" onClick={() => setSettingsModalOpen(false)}>
                  OK
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* --- MODAL: Session Activity & History Dialog --- */}
      {historyModalOpen && (
        <div className="w95-modal-overlay" onClick={() => setHistoryModalOpen(false)}>
          <div className="w95-modal-window" style={{ maxWidth: 540 }} onClick={(e) => e.stopPropagation()}>
            <div className="w95-title-bar">
              <div className="w95-title-text">
                <img src="/icons/history.png" alt="" style={{ width: 16, height: 16 }} />
                <span>Session Activity & Decision History</span>
              </div>
              <div className="w95-title-controls">
                <button className="w95-title-btn" onClick={() => setHistoryModalOpen(false)}>✕</button>
              </div>
            </div>

            <div className="p-3">
              <div className="w95-inset mb-3 p-3">
                <div className="font-weight-bold small mb-2 text-primary">Session Metrics:</div>
                <div className="d-flex justify-content-between small mb-1">
                  <span>Last Activity Recorded:</span>
                  <span className="font-weight-bold">{lastActivityTime || "--:--"}</span>
                </div>
                <div className="d-flex justify-content-between small mb-1">
                  <span>AI Inquiries Performed:</span>
                  <span className="font-weight-bold">{aiInquiriesCount} queries</span>
                </div>
                <div className="d-flex justify-content-between small mb-1">
                  <span>Documents Explored:</span>
                  <span className="font-weight-bold">{exploredCount} views</span>
                </div>
                <div className="d-flex justify-content-between small">
                  <span>Total Decisions in Firestore:</span>
                  <span className="font-weight-bold">{decisions.length} entries</span>
                </div>
              </div>

              <div className="font-weight-bold small mb-1">Recent Decisions Logged:</div>
              <div className="w95-inset p-2 mb-3" style={{ maxHeight: 200, overflowY: "auto" }}>
                {decisions.length === 0 ? (
                  <div className="text-center py-3 text-muted small">No decisions logged yet.</div>
                ) : (
                  decisions.slice(0, 10).map((d, idx) => (
                    <div key={d.id || idx} className="p-1 border-bottom small d-flex justify-content-between align-items-center">
                      <div className="text-truncate mr-2" style={{ maxWidth: 320 }}>
                        <strong>{d.title}</strong>
                        <span className="text-muted ml-2">({d.chosen_option})</span>
                      </div>
                      <span className="text-muted" style={{ fontSize: 11 }}>
                        {d.createdAt ? new Date(d.createdAt).toLocaleDateString() : "Saved"}
                      </span>
                    </div>
                  ))
                )}
              </div>

              <div className="d-flex justify-content-end">
                <button className="w95-btn w95-btn-dialog" onClick={() => setHistoryModalOpen(false)}>
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}

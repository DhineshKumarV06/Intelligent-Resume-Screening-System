import { useState, useRef } from "react";
import axios from "axios";

export default function App() {
  const [resumeText, setResumeText] = useState("");
  const [jobDesc, setJobDesc] = useState("");
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [tab, setTab] = useState("ats");
  const [fileName, setFileName] = useState("");
  const [dragging, setDragging] = useState(false);
  const fileRef = useRef();

  const handleFile = (file) => {
    if (!file) return;
    setFileName(file.name);
    const reader = new FileReader();
    reader.onload = (e) => setResumeText(e.target.result);
    reader.readAsText(file);
  };

  const analyze = async () => {
    if (!resumeText.trim()) return alert("Please upload a file or paste resume text!");
    setLoading(true);
    try {
      const form = new FormData();
      form.append("resume_text", resumeText);
      form.append("job_description", jobDesc);
      const { data } = await axios.post("http://localhost:8000/analyze", form);
      setResult(data);
      setTab("ats");
    } catch (e) {
      alert("Error: " + e.message);
    }
    setLoading(false);
  };

  if (!result) return (
    <div style={styles.wrap}>
      <h1 style={styles.logo}>Resume<span style={{ color: "#a78bfa" }}>AI</span></h1>
      <p style={styles.sub}>Upload your resume and get instant ATS score + interview prep</p>

      {/* File Upload Zone */}
      <div
        style={{ ...styles.dropZone, ...(dragging ? styles.dropZoneActive : {}) }}
        onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
        onDragLeave={() => setDragging(false)}
        onDrop={(e) => { e.preventDefault(); setDragging(false); handleFile(e.dataTransfer.files[0]); }}
        onClick={() => fileRef.current.click()}
      >
        <input
          ref={fileRef}
          type="file"
          accept=".pdf,.txt,.doc,.docx"
          style={{ display: "none" }}
          onChange={(e) => handleFile(e.target.files[0])}
        />
        <div style={{ fontSize: "2.5rem", marginBottom: "0.5rem" }}>📄</div>
        {fileName ? (
          <>
            <div style={{ color: "#34d399", fontWeight: "600", fontSize: "0.9rem" }}>✅ {fileName}</div>
            <div style={{ color: "#6060a0", fontSize: "0.78rem", marginTop: "0.3rem" }}>Click to change file</div>
          </>
        ) : (
          <>
            <div style={{ fontWeight: "600", fontSize: "0.95rem", marginBottom: "0.3rem" }}>
              Drop your resume here or click to browse
            </div>
            <div style={{ color: "#6060a0", fontSize: "0.8rem" }}>Supports PDF, DOCX, TXT</div>
          </>
        )}
      </div>

      {/* Divider */}
      <div style={styles.divider}>
        <div style={styles.dividerLine} />
        <span style={styles.dividerText}>or paste text</span>
        <div style={styles.dividerLine} />
      </div>

      {/* Text area */}
      <textarea
        style={styles.ta}
        rows={7}
        placeholder="Paste resume text here..."
        value={resumeText}
        onChange={(e) => setResumeText(e.target.value)}
      />

      <textarea
        style={{ ...styles.ta, marginTop: "1rem" }}
        rows={4}
        placeholder="Job description (optional) — paste for targeted skill gap analysis..."
        value={jobDesc}
        onChange={(e) => setJobDesc(e.target.value)}
      />

      <button style={{ ...styles.btn, opacity: loading ? 0.7 : 1 }} onClick={analyze} disabled={loading}>
        {loading ? "⏳ Analyzing..." : "✨ Analyze Resume"}
      </button>
    </div>
  );

  const tabs = ["ats", "skills", "improvements", "questions", "roles"];
  return (
    <div style={styles.wrap}>
      <h1 style={styles.logo}>Resume<span style={{ color: "#a78bfa" }}>AI</span></h1>
      <div style={styles.tabBar}>
        {tabs.map((t) => (
          <button key={t} style={{ ...styles.tab, ...(tab === t ? styles.tabActive : {}) }}
            onClick={() => setTab(t)}>{t.toUpperCase()}</button>
        ))}
      </div>

      {tab === "ats" && (
        <div style={styles.card}>
          <h2 style={styles.score}>{result.ats_score}<span style={{ fontSize: "1.2rem", color: "#6060a0" }}>/100</span></h2>
          <p style={{ color: "#a0a0c0", marginBottom: "1.5rem", lineHeight: "1.55" }}>{result.summary}</p>
          {Object.entries(result.ats_breakdown || {}).map(([k, v]) => (
            <div key={k} style={{ marginBottom: "0.8rem" }}>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.82rem", marginBottom: "4px" }}>
                <span style={{ color: "#a0a0c0", textTransform: "capitalize" }}>{k.replace("_", " ")}</span>
                <span style={{ fontWeight: "600" }}>{v}</span>
              </div>
              <div style={{ height: "6px", background: "#22223a", borderRadius: "10px" }}>
                <div style={{ height: "100%", width: `${(v / 25) * 100}%`, background: "#7c6ff7", borderRadius: "10px", transition: "width 1s ease" }} />
              </div>
            </div>
          ))}
          {(result.strengths || []).length > 0 && (
            <div style={{ marginTop: "1.25rem" }}>
              <div style={{ fontSize: "0.75rem", color: "#6060a0", textTransform: "uppercase", letterSpacing: "0.07em", marginBottom: "0.5rem" }}>Strengths</div>
              {result.strengths.map((s, i) => (
                <div key={i} style={{ color: "#34d399", fontSize: "0.85rem", marginBottom: "0.3rem" }}>✓ <span style={{ color: "#a0a0c0" }}>{s}</span></div>
              ))}
            </div>
          )}
        </div>
      )}

      {tab === "skills" && (
        <div style={styles.card}>
          <h3 style={{ color: "#34d399", marginBottom: "0.75rem" }}>✅ Found Skills ({(result.found_skills || []).length})</h3>
          <div style={{ marginBottom: "1.5rem" }}>
            {(result.found_skills || []).map((s) => <span key={s} style={styles.tagGreen}>{s}</span>)}
          </div>
          <h3 style={{ color: "#f87171", marginBottom: "0.75rem" }}>❌ Missing / Suggested ({(result.missing_skills || []).length})</h3>
          <div>
            {(result.missing_skills || []).map((s) => <span key={s} style={styles.tagRed}>{s}</span>)}
          </div>
        </div>
      )}

      {tab === "improvements" && (
        <div style={styles.card}>
          <div style={{ fontSize: "0.75rem", color: "#6060a0", textTransform: "uppercase", letterSpacing: "0.07em", marginBottom: "1rem" }}>Suggested Improvements</div>
          {(result.improvements || []).map((imp, i) => (
            <div key={i} style={styles.impItem}><strong style={{ color: "#a78bfa" }}>{i + 1}.</strong> {imp}</div>
          ))}
        </div>
      )}

      {tab === "questions" && (
        <div style={styles.card}>
          <div style={{ fontSize: "0.75rem", color: "#6060a0", textTransform: "uppercase", letterSpacing: "0.07em", marginBottom: "1rem" }}>Interview Questions</div>
          {(result.interview_questions || []).map((q, i) => (
            <div key={i} style={styles.qItem}>
              <div style={{ fontSize: "0.72rem", color: "#a78bfa", marginBottom: "0.3rem", fontWeight: "600" }}>Q{i + 1} · {q.category}</div>
              <div style={{ fontSize: "0.88rem", lineHeight: "1.55" }}>{q.q}</div>
            </div>
          ))}
        </div>
      )}

      {tab === "roles" && (
        <div style={styles.card}>
          <div style={{ fontSize: "0.75rem", color: "#6060a0", textTransform: "uppercase", letterSpacing: "0.07em", marginBottom: "1rem" }}>Role Recommendations</div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.75rem" }}>
            {(result.role_recommendations || []).map((r, i) => (
              <div key={i} style={styles.roleCard}>
                <strong style={{ fontSize: "0.92rem" }}>{r.title}</strong>
                <span style={{ marginLeft: "0.5rem", fontSize: "0.7rem", color: "#34d399", background: "rgba(52,211,153,0.1)", padding: "0.15rem 0.45rem", borderRadius: "5px" }}>{r.match}</span>
                <p style={{ color: "#a0a0c0", fontSize: "0.8rem", marginTop: "0.4rem", lineHeight: "1.45" }}>{r.reason}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      <button style={{ ...styles.btn, background: "transparent", border: "1px solid #3a3a5a", marginTop: "1rem", color: "#a0a0c0" }}
        onClick={() => { setResult(null); setFileName(""); setResumeText(""); }}>← Analyze Another</button>
    </div>
  );
}

const styles = {
  wrap: { maxWidth: "760px", margin: "0 auto", padding: "2rem 1.5rem", fontFamily: "'DM Sans', sans-serif", background: "#0a0a0f", minHeight: "100vh", color: "#f4f4f8" },
  logo: { fontFamily: "Georgia, serif", fontSize: "1.8rem", fontWeight: "800", marginBottom: "0.25rem" },
  sub: { color: "#6060a0", fontSize: "0.85rem", marginBottom: "1.5rem" },
  dropZone: { border: "2px dashed #2a2a44", borderRadius: "14px", padding: "2.5rem 2rem", textAlign: "center", cursor: "pointer", transition: "all 0.2s", marginBottom: "0.5rem" },
  dropZoneActive: { borderColor: "#7c6ff7", background: "rgba(124,111,247,0.07)" },
  divider: { display: "flex", alignItems: "center", gap: "0.75rem", margin: "1.25rem 0" },
  dividerLine: { flex: 1, height: "1px", background: "#2a2a44" },
  dividerText: { color: "#6060a0", fontSize: "0.78rem", whiteSpace: "nowrap" },
  ta: { width: "100%", background: "#12121a", border: "1px solid #2a2a44", borderRadius: "10px", padding: "0.85rem 1rem", color: "#f4f4f8", fontSize: "0.88rem", resize: "vertical", outline: "none", boxSizing: "border-box" },
  btn: { marginTop: "1rem", width: "100%", padding: "0.85rem", background: "#7c6ff7", color: "#fff", border: "none", borderRadius: "10px", fontSize: "0.95rem", fontWeight: "500", cursor: "pointer" },
  tabBar: { display: "flex", gap: "0.4rem", marginBottom: "1.25rem", flexWrap: "wrap" },
  tab: { padding: "0.5rem 1rem", background: "#12121a", border: "1px solid #2a2a44", borderRadius: "8px", color: "#6060a0", cursor: "pointer", fontSize: "0.78rem", fontWeight: "600", letterSpacing: "0.05em" },
  tabActive: { borderColor: "#a78bfa", color: "#a78bfa", background: "rgba(167,139,250,0.1)" },
  card: { background: "#12121a", border: "1px solid #2a2a44", borderRadius: "14px", padding: "1.5rem" },
  score: { fontFamily: "Georgia, serif", fontSize: "3rem", fontWeight: "800", color: "#a78bfa", margin: "0 0 0.5rem" },
  tagGreen: { display: "inline-block", padding: "0.3rem 0.7rem", background: "rgba(52,211,153,0.1)", border: "1px solid rgba(52,211,153,0.3)", borderRadius: "7px", color: "#34d399", fontSize: "0.8rem", margin: "0.2rem" },
  tagRed: { display: "inline-block", padding: "0.3rem 0.7rem", background: "rgba(248,113,113,0.08)", border: "1px solid rgba(248,113,113,0.3)", borderRadius: "7px", color: "#f87171", fontSize: "0.8rem", margin: "0.2rem" },
  impItem: { padding: "0.75rem 1rem", borderLeft: "3px solid #7c6ff7", background: "#1a1a26", borderRadius: "0 8px 8px 0", marginBottom: "0.6rem", fontSize: "0.86rem", lineHeight: "1.55", color: "#a0a0c0" },
  qItem: { padding: "0.85rem 1rem", background: "#1a1a26", border: "1px solid #2a2a44", borderRadius: "10px", marginBottom: "0.6rem" },
  roleCard: { padding: "0.85rem 1rem", background: "#1a1a26", border: "1px solid #2a2a44", borderRadius: "10px" },
};
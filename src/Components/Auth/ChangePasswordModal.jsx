// src/Components/Auth/ChangePasswordModal.jsx
//
// 3-step modal: Send OTP → Verify OTP → Set New Password
//
// Props:
//   email              {string}    – user's email address
//   apiBase            {string}    – VITE_API_BASE_URL
//   onChangePassword   {function}  – async (newPassword: string) => Response
//                                    Parent provides the role-specific PUT call.
//   onClose            {function}  – called when the user closes the modal
//   onSuccess          {function}  – called after password is changed successfully

import { useState } from "react";
import OtpStep from "./OtpStep";

const STEP = { SEND: 1, VERIFY: 2, PASSWORD: 3 };

export default function ChangePasswordModal({ email, apiBase, onChangePassword, onClose, onSuccess }) {
  const [step,            setStep]            = useState(STEP.SEND);
  const [sending,         setSending]         = useState(false);
  const [newPassword,     setNewPassword]     = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPwd,         setShowPwd]         = useState(false);
  const [saving,          setSaving]          = useState(false);
  const [err,             setErr]             = useState("");
  const [msg,             setMsg]             = useState("");

  // ── Step 1: send OTP ──────────────────────────────────────────────────────
  const sendOtp = async () => {
    setSending(true); setErr("");
    try {
      const res = await fetch(
        `${apiBase}/otp/send?email=${encodeURIComponent(email)}`,
        { method: "POST" }
      );
      if (res.ok) {
        setStep(STEP.VERIFY);
      } else {
        setErr("Failed to send OTP. Please try again.");
      }
    } catch {
      setErr("Network error. Please check your connection.");
    } finally {
      setSending(false);
    }
  };

  // ── Step 3: change password ───────────────────────────────────────────────
  const handleSave = async () => {
    setErr("");
    if (!newPassword)                         { setErr("Please enter a new password.");        return; }
    if (newPassword.length < 6)               { setErr("Password must be at least 6 characters."); return; }
    if (newPassword !== confirmPassword)      { setErr("Passwords do not match.");              return; }
    setSaving(true);
    try {
      const res = await onChangePassword(newPassword);
      if (res.ok) {
        setMsg("Password changed successfully!");
        setTimeout(() => onSuccess?.(), 1400);
      } else {
        const text = await res.text().catch(() => "");
        setErr(text || "Failed to change password.");
      }
    } catch {
      setErr("Network error. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  // ── render ────────────────────────────────────────────────────────────────
  return (
    <Overlay onClose={onClose}>
      <div style={box}>
        {/* header */}
        <div style={header}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <span style={{ fontSize: 22 }}>🔑</span>
            <h3 style={{ margin: 0, fontSize: 17, fontWeight: 700, color: "#111827" }}>Change Password</h3>
          </div>
          <button onClick={onClose} style={closeBtn} aria-label="Close">✕</button>
        </div>

        <div style={{ padding: "24px 24px 22px" }}>
          <StepBar steps={["Send OTP", "Verify OTP", "New Password"]} current={step} />

          {/* ── Step 1 ── */}
          {step === STEP.SEND && (
            <div style={{ textAlign: "center" }}>
              <div style={infoBubble}>
                <p style={{ margin: "0 0 4px", color: "#374151", fontSize: 13 }}>
                  A 6-digit OTP will be sent to:
                </p>
                <p style={{ margin: 0, fontWeight: 700, color: "#1d4ed8", fontSize: 15 }}>{email}</p>
              </div>
              {err && <ErrBanner msg={err} />}
              <Btn onClick={sendOtp} disabled={sending} style={{ marginTop: 4 }}>
                {sending ? <><Spinner /> Sending…</> : "📨 Send OTP"}
              </Btn>
            </div>
          )}

          {/* ── Step 2 ── */}
          {step === STEP.VERIFY && (
            <>
              <p style={{ textAlign: "center", color: "#6b7280", fontSize: 13, marginBottom: 20 }}>
                Enter the 6-digit code sent to{" "}
                <strong style={{ color: "#111827" }}>{email}</strong>
              </p>
              <OtpStep
                email={email}
                apiBase={apiBase}
                onVerified={() => { setErr(""); setStep(STEP.PASSWORD); }}
              />
            </>
          )}

          {/* ── Step 3 ── */}
          {step === STEP.PASSWORD && (
            <>
              <div style={{ ...infoBubble, background: "#f0fdf4", borderColor: "#86efac", marginBottom: 18 }}>
                <p style={{ margin: 0, color: "#15803d", fontSize: 13, fontWeight: 600 }}>
                  ✓ Identity verified — set your new password below.
                </p>
              </div>

              <Label>New Password</Label>
              <div style={{ position: "relative", marginBottom: 12 }}>
                <input
                  type={showPwd ? "text" : "password"}
                  placeholder="At least 6 characters"
                  value={newPassword}
                  onChange={e => setNewPassword(e.target.value)}
                  style={{ ...field, paddingRight: 42 }}
                  autoFocus
                />
                <EyeToggle  show={showPwd} onToggle={() => setShowPwd(s => !s)} />
              </div>

              <Label>Confirm Password</Label>
              <div style={{ position: "relative", marginBottom: 4 }}>
                <input
                  type={showPwd ? "text" : "password"}
                  placeholder="Re-enter new password"
                  value={confirmPassword}
                  onChange={e => setConfirmPassword(e.target.value)}
                  style={{ ...field, paddingRight: 42 }}
                  onKeyDown={e => e.key === "Enter" && handleSave()}
                />
              </div>

              {/* strength bar */}
              <StrengthBar password={newPassword} />

              {err && <ErrBanner msg={err} />}
              {msg && <MsgBanner msg={msg} />}

              <Btn onClick={handleSave} disabled={saving || !!msg} style={{ marginTop: 10 }}>
                {saving ? <><Spinner /> Saving…</> : "Save New Password"}
              </Btn>
            </>
          )}
        </div>
      </div>
    </Overlay>
  );
}

// ─── Sub-components ──────────────────────────────────────────────────────────

function StepBar({ steps, current }) {
  return (
    <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "center", marginBottom: 28, gap: 0 }}>
      {steps.map((label, i) => {
        const num    = i + 1;
        const done   = num < current;
        const active = num === current;
        return (
          <div key={i} style={{ display: "flex", alignItems: "flex-start" }}>
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", minWidth: 64 }}>
              <div style={{
                width: 34, height: 34, borderRadius: "50%",
                display: "flex", alignItems: "center", justifyContent: "center",
                fontWeight: 700, fontSize: 14,
                background: done ? "#16a34a" : active ? "#2563eb" : "#f3f4f6",
                color:      done || active ? "#fff" : "#9ca3af",
                boxShadow:  active ? "0 0 0 3px rgba(37,99,235,0.2)" : "none",
                transition: "all 0.3s",
              }}>
                {done ? "✓" : num}
              </div>
              <span style={{
                fontSize: 10, marginTop: 6, fontWeight: active ? 700 : 400,
                color: active ? "#2563eb" : done ? "#16a34a" : "#9ca3af",
                whiteSpace: "nowrap",
              }}>
                {label}
              </span>
            </div>
            {i < steps.length - 1 && (
              <div style={{
                height: 2, width: 36, marginTop: 16,
                background: done ? "#16a34a" : "#e5e7eb",
                transition: "background 0.4s",
              }} />
            )}
          </div>
        );
      })}
    </div>
  );
}

function StrengthBar({ password }) {
  if (!password) return null;
  const score =
    (password.length >= 6  ? 1 : 0) +
    (password.length >= 10 ? 1 : 0) +
    (/[A-Z]/.test(password) ? 1 : 0) +
    (/[0-9]/.test(password) ? 1 : 0) +
    (/[^A-Za-z0-9]/.test(password) ? 1 : 0);
  const levels  = ["", "Weak", "Fair", "Good", "Strong", "Very Strong"];
  const colors  = ["", "#ef4444", "#f97316", "#eab308", "#22c55e", "#16a34a"];
  const widths  = ["0%", "20%", "40%", "60%", "80%", "100%"];
  return (
    <div style={{ marginBottom: 10 }}>
      <div style={{ height: 4, background: "#f3f4f6", borderRadius: 4, overflow: "hidden" }}>
        <div style={{ height: "100%", width: widths[score], background: colors[score], borderRadius: 4, transition: "all 0.3s" }} />
      </div>
      <p style={{ fontSize: 11, margin: "3px 0 0", color: colors[score], fontWeight: 600 }}>
        {levels[score]}
      </p>
    </div>
  );
}

function Overlay({ children, onClose }) {
  return (
    <div
      style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.55)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000 }}
      onClick={e => { if (e.target === e.currentTarget) onClose?.(); }}
    >
      {children}
    </div>
  );
}

function Btn({ children, onClick, disabled, style = {} }) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      style={{
        display: "flex", alignItems: "center", justifyContent: "center", gap: 6,
        width: "100%", padding: "11px", borderRadius: 8, border: "none",
        background: disabled ? "#93c5fd" : "#2563eb",
        color: "#fff", fontWeight: 700, fontSize: 15,
        cursor: disabled ? "not-allowed" : "pointer",
        transition: "background 0.2s",
        ...style,
      }}
    >
      {children}
    </button>
  );
}

function EyeToggle({ show, onToggle }) {
  return (
    <span
      onClick={onToggle} type="button"
      style={{ position: "absolute", right: 10, top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", fontSize: 30, color: "#6b7280"  }}
    >
      {show ? "🙈" : "👁"}
    </span>
  );
}

const ErrBanner = ({ msg }) => (
  <div style={{ background: "#fef2f2", border: "1px solid #fca5a5", borderRadius: 8, padding: "9px 14px", marginBottom: 12, textAlign: "left" }}>
    <p style={{ color: "#dc2626", fontSize: 13, margin: 0 }}>⚠ {msg}</p>
  </div>
);

const MsgBanner = ({ msg }) => (
  <div style={{ background: "#f0fdf4", border: "1px solid #86efac", borderRadius: 8, padding: "9px 14px", marginBottom: 12 }}>
    <p style={{ color: "#15803d", fontSize: 13, margin: 0, fontWeight: 600 }}>✓ {msg}</p>
  </div>
);

const Label = ({ children }) => (
  <label style={{ fontSize: 12, color: "#374151", fontWeight: 600, display: "block", marginBottom: 4 }}>{children}</label>
);

const Spinner = () => (
  <span style={{ display: "inline-block", width: 13, height: 13, borderRadius: "50%", border: "2px solid rgba(255,255,255,0.4)", borderTopColor: "#fff", animation: "spin 0.7s linear infinite" }} />
);

// ─── Shared styles ────────────────────────────────────────────────────────────
const box        = { background: "#fff", borderRadius: 14, width: "min(440px, 95vw)", maxHeight: "92vh", overflowY: "auto", boxShadow: "0 20px 60px rgba(0,0,0,0.2)" };
const header     = { display: "flex", justifyContent: "space-between", alignItems: "center", padding: "16px 20px", borderBottom: "1px solid #f3f4f6" };
const closeBtn   = { background: "none", border: "none", fontSize: 18, cursor: "pointer", color: "#9ca3af", lineHeight: 1, padding: 4, borderRadius: 6 };
const infoBubble = { background: "#eff6ff", border: "1px solid #bfdbfe", borderRadius: 10, padding: "14px 16px", marginBottom: 20 };
const field      = { width: "100%", padding: "9px 12px", borderRadius: 8, border: "1px solid #d1d5db", fontSize: 14, boxSizing: "border-box", outline: "none" };
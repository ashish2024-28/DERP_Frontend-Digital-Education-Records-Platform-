// src/Components/Auth/DeleteAccountModal.jsx
//
// 3-step modal: Danger Warning + Send OTP → Verify OTP → Final Confirm & Delete
//
// Props:
//   name              {string}    – user's display name
//   email             {string}    – user's email
//   apiBase           {string}    – VITE_API_BASE_URL
//   onDeleteAccount   {function}  – async () => void
//                                   Parent provides the role-specific DELETE call.
//                                   Should also clear localStorage & navigate away.
//   onClose           {function}  – called when the user dismisses the modal

import { useState } from "react";
import OtpStep from "./OtpStep";

const STEP = { WARN: 1, VERIFY: 2, CONFIRM: 3 };

export default function DeleteAccountModal({ name, email, apiBase, onDeleteAccount, onClose }) {
  const [step,    setStep]    = useState(STEP.WARN);
  const [sending, setSending] = useState(false);
  const [deleting,setDeleting]= useState(false);
  const [err,     setErr]     = useState("");

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

  // ── Step 3: delete ────────────────────────────────────────────────────────
  const handleDelete = async () => {
    setDeleting(true); setErr("");
    try {
      await onDeleteAccount();
      // parent handles navigation — no need to close modal
    } catch {
      setErr("Deletion failed. Please try again.");
      setDeleting(false);
    }
  };

  return (
    <Overlay onClose={!deleting ? onClose : undefined}>
      <div style={box}>

        {/* header */}
        <div style={header}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <span style={{ fontSize: 22 }}>🗑</span>
            <h3 style={{ margin: 0, fontSize: 17, fontWeight: 700, color: "#111827" }}>Delete Account</h3>
          </div>
          {!deleting && (
            <button onClick={onClose} style={closeBtn} aria-label="Close">✕</button>
          )}
        </div>

        <div style={{ padding: "24px 24px 22px" }}>
          <StepBar steps={["Confirm Risk", "Verify OTP", "Delete"]} current={step} danger />

          {/* ── Step 1 – warning ── */}
          {step === STEP.WARN && (
            <>
              {/* danger banner */}
              <div style={dangerBanner}>
                <p style={{ margin: "0 0 6px", fontWeight: 700, color: "#b91c1c", fontSize: 14 }}>
                  ⚠️ This action is permanent and cannot be undone.
                </p>
                <p style={{ margin: 0, color: "#7f1d1d", fontSize: 13, lineHeight: 1.5 }}>
                  All your data — profile, records, and settings — will be permanently erased.
                </p>
              </div>

              {/* account info card */}
              <div style={accountCard}>
                <div style={{ width: 40, height: 40, borderRadius: "50%", background: "#fee2e2", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18, flexShrink: 0 }}>
                  👤
                </div>
                <div>
                  <p style={{ margin: 0, fontWeight: 700, color: "#111827", fontSize: 15 }}>{name}</p>
                  <p style={{ margin: "2px 0 0", color: "#6b7280", fontSize: 13 }}>{email}</p>
                </div>
              </div>

              <p style={{ fontSize: 13, color: "#374151", marginBottom: 18, lineHeight: 1.6 }}>
                To proceed, we'll send a one-time OTP to your registered email address to confirm it's you.
              </p>

              {err && <ErrBanner msg={err} />}

              <DangerBtn onClick={sendOtp} disabled={sending}>
                {sending ? <><Spinner /> Sending OTP…</> : "Send OTP to Confirm"}
              </DangerBtn>

              <button
                onClick={onClose}
                style={{ width: "100%", marginTop: 10, padding: "10px", borderRadius: 8, border: "1px solid #d1d5db", background: "transparent", color: "#374151", fontWeight: 600, cursor: "pointer", fontSize: 14 }}
              >
                Cancel — Keep My Account
              </button>
            </>
          )}

          {/* ── Step 2 – OTP ── */}
          {step === STEP.VERIFY && (
            <>
              <p style={{ textAlign: "center", color: "#6b7280", fontSize: 13, marginBottom: 20 }}>
                Enter the 6-digit code sent to{" "}
                <strong style={{ color: "#111827" }}>{email}</strong>
              </p>
              <OtpStep
                email={email}
                apiBase={apiBase}
                onVerified={() => { setErr(""); setStep(STEP.CONFIRM); }}
              />
            </>
          )}

          {/* ── Step 3 – final confirm ── */}
          {step === STEP.CONFIRM && (
            <>
              <div style={{ ...dangerBanner, background: "#fff7ed", borderColor: "#fed7aa" }}>
                <p style={{ margin: 0, color: "#c2410c", fontWeight: 700, fontSize: 14 }}>
                  ✓ Identity verified — this is your last chance to cancel.
                </p>
              </div>

              <div style={{ ...accountCard, marginBottom: 20 }}>
                <div style={{ width: 40, height: 40, borderRadius: "50%", background: "#fee2e2", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18, flexShrink: 0 }}>
                  👤
                </div>
                <div>
                  <p style={{ margin: 0, fontWeight: 700, color: "#111827", fontSize: 15 }}>{name}</p>
                  <p style={{ margin: "2px 0 0", color: "#6b7280", fontSize: 13 }}>{email}</p>
                </div>
              </div>

              {err && <ErrBanner msg={err} />}

              {deleting ? (
                <div style={{ textAlign: "center", padding: "16px 0" }}>
                  <Spinner color="#dc2626" size={20} />
                  <p style={{ color: "#dc2626", fontWeight: 600, marginTop: 10 }}>Deleting account…</p>
                </div>
              ) : (
                <>
                  <DangerBtn onClick={handleDelete}>
                    🗑 Yes, Permanently Delete My Account
                  </DangerBtn>
                  <button
                    onClick={onClose}
                    style={{ width: "100%", marginTop: 10, padding: "10px", borderRadius: 8, border: "1px solid #d1d5db", background: "transparent", color: "#374151", fontWeight: 600, cursor: "pointer", fontSize: 14 }}
                  >
                    No, Keep My Account
                  </button>
                </>
              )}
            </>
          )}
        </div>
      </div>
    </Overlay>
  );
}

// ─── Sub-components ──────────────────────────────────────────────────────────

function StepBar({ steps, current, danger }) {
  const activeColor = danger ? "#dc2626" : "#2563eb";
  const doneColor   = "#16a34a";
  return (
    <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "center", marginBottom: 24, gap: 0 }}>
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
                background: done ? doneColor : active ? activeColor : "#f3f4f6",
                color:      done || active ? "#fff" : "#9ca3af",
                boxShadow:  active ? `0 0 0 3px ${activeColor}30` : "none",
                transition: "all 0.3s",
              }}>
                {done ? "✓" : num}
              </div>
              <span style={{
                fontSize: 10, marginTop: 6, fontWeight: active ? 700 : 400,
                color: active ? activeColor : done ? doneColor : "#9ca3af",
                whiteSpace: "nowrap",
              }}>
                {label}
              </span>
            </div>
            {i < steps.length - 1 && (
              <div style={{ height: 2, width: 36, marginTop: 16, background: done ? doneColor : "#e5e7eb", transition: "background 0.4s" }} />
            )}
          </div>
        );
      })}
    </div>
  );
}

function Overlay({ children, onClose }) {
  return (
    <div
      style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.6)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000 }}
      onClick={e => { if (e.target === e.currentTarget) onClose?.(); }}
    >
      {children}
    </div>
  );
}

function DangerBtn({ children, onClick, disabled }) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      style={{
        display: "flex", alignItems: "center", justifyContent: "center", gap: 6,
        width: "100%", padding: "11px", borderRadius: 8, border: "none",
        background: disabled ? "#fca5a5" : "#dc2626",
        color: "#fff", fontWeight: 700, fontSize: 15,
        cursor: disabled ? "not-allowed" : "pointer",
        transition: "background 0.2s",
      }}
    >
      {children}
    </button>
  );
}

const ErrBanner = ({ msg }) => (
  <div style={{ background: "#fef2f2", border: "1px solid #fca5a5", borderRadius: 8, padding: "9px 14px", marginBottom: 12 }}>
    <p style={{ color: "#dc2626", fontSize: 13, margin: 0 }}>⚠ {msg}</p>
  </div>
);

const Spinner = ({ color = "#fff", size = 13 }) => (
  <span style={{ display: "inline-block", width: size, height: size, borderRadius: "50%", border: `2px solid ${color}50`, borderTopColor: color, animation: "spin 0.7s linear infinite" }} />
);

// ─── Styles ───────────────────────────────────────────────────────────────────
const box         = { background: "#fff", borderRadius: 14, width: "min(440px, 95vw)", maxHeight: "92vh", overflowY: "auto", boxShadow: "0 20px 60px rgba(0,0,0,0.25)" };
const header      = { display: "flex", justifyContent: "space-between", alignItems: "center", padding: "16px 20px", borderBottom: "1px solid #fee2e2", background: "#fff5f5" };
const closeBtn    = { background: "none", border: "none", fontSize: 18, cursor: "pointer", color: "#9ca3af", lineHeight: 1, padding: 4, borderRadius: 6 };
const dangerBanner= { background: "#fef2f2", border: "1px solid #fca5a5", borderRadius: 10, padding: "14px 16px", marginBottom: 16 };
const accountCard = { display: "flex", alignItems: "center", gap: 12, background: "#f9fafb", border: "1px solid #e5e7eb", borderRadius: 10, padding: "12px 16px", marginBottom: 16 };
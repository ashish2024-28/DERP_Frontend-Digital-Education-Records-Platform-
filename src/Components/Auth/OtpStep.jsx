// src/Components/Auth/OtpStep.jsx
//
// Reusable 6-box OTP input used inside ChangePasswordModal & DeleteAccountModal.
// Auto-submits when all boxes are filled. Handles paste, backspace, and resend.
//
// Props:
//   email     {string}    – address the OTP was sent to
//   apiBase   {string}    – VITE_API_BASE_URL
//   onVerified {function} – called after backend confirms the OTP

import { useState, useEffect, useRef, useCallback } from "react";

const OTP_LEN    = 6;
const RESEND_SEC = 60;

export default function OtpStep({ email, apiBase, onVerified }) {
  const [otp,       setOtp]       = useState(Array(OTP_LEN).fill(""));
  const [error,     setError]     = useState("");
  const [verifying, setVerifying] = useState(false);
  const [countdown, setCountdown] = useState(RESEND_SEC);
  const [canResend, setCanResend] = useState(false);
  const [resending, setResending] = useState(false);
  const inputRefs = useRef([]);

  // auto-focus first box on mount
  useEffect(() => { setTimeout(() => inputRefs.current[0]?.focus(), 80); }, []);

  // countdown timer
  useEffect(() => {
    if (countdown <= 0) { setCanResend(true); return; }
    const t = setTimeout(() => setCountdown(c => c - 1), 1000);
    return () => clearTimeout(t);
  }, [countdown]);

  // ── verify ────────────────────────────────────────────────────────────────
  const verifyOtp = useCallback(async (digits) => {
    const code = digits.join("");
    if (code.length < OTP_LEN) return;
    setVerifying(true);
    setError("");
    try {
      const res = await fetch(
        `${apiBase}/otp/verify?email=${encodeURIComponent(email)}&otp=${encodeURIComponent(code)}`,
        { method: "POST" }
      );
      const ct   = res.headers.get("content-type") ?? "";
      const data = ct.includes("application/json") ? await res.json() : {};
      if (!res.ok || data.success === false) {
        setError(data.message || "Invalid or expired OTP. Please try again.");
        setOtp(Array(OTP_LEN).fill(""));
        setTimeout(() => inputRefs.current[0]?.focus(), 60);
        return;
      }
      onVerified?.();
    } catch {
      setError("Could not reach the server. Please check your connection.");
    } finally {
      setVerifying(false);
    }
  }, [apiBase, email, onVerified]);

  // auto-submit when full
  useEffect(() => {
    if (otp.every(d => d !== "") && !verifying) verifyOtp(otp);
  }, [otp, verifying, verifyOtp]);

  // ── handlers ──────────────────────────────────────────────────────────────
  const handleChange = (i, e) => {
    const val  = e.target.value.replace(/\D/g, "").slice(-1);
    const next = [...otp]; next[i] = val;
    setOtp(next); setError("");
    if (val && i < OTP_LEN - 1) inputRefs.current[i + 1]?.focus();
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const raw    = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, OTP_LEN);
    if (!raw) return;
    const next   = Array(OTP_LEN).fill("");
    raw.split("").forEach((ch, i) => { next[i] = ch; });
    setOtp(next); setError("");
    inputRefs.current[Math.min(raw.length - 1, OTP_LEN - 1)]?.focus();
  };

  const handleKeyDown = (i, e) => {
    if (e.key === "Backspace" && !otp[i] && i > 0) inputRefs.current[i - 1]?.focus();
  };

  const handleResend = async () => {
    if (!canResend || resending) return;
    setResending(true); setError("");
    try {
      await fetch(`${apiBase}/otp/send?email=${encodeURIComponent(email)}`, { method: "POST" });
      setOtp(Array(OTP_LEN).fill(""));
      setCountdown(RESEND_SEC); setCanResend(false);
      setTimeout(() => inputRefs.current[0]?.focus(), 60);
    } catch {
      setError("Failed to resend OTP. Please try again.");
    } finally {
      setResending(false);
    }
  };

  // ── render ────────────────────────────────────────────────────────────────
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 14 }}>

      {/* boxes */}
      <div style={{ display: "flex", gap: 10 }} onPaste={handlePaste}>
        {otp.map((digit, i) => (
          <input
            key={i}
            ref={el => (inputRefs.current[i] = el)}
            type="text"
            inputMode="numeric"
            maxLength={1}
            value={digit}
            onChange={e => handleChange(i, e)}
            onKeyDown={e => handleKeyDown(i, e)}
            disabled={verifying}
            style={{
              width: 46, height: 52, textAlign: "center", fontSize: 22, fontWeight: 700,
              borderRadius: 10, outline: "none",
              border: `2.5px solid ${error ? "#f87171" : digit ? "#3b82f6" : "#d1d5db"}`,
              background:           error ? "#fef2f2" : digit ? "#eff6ff" : "#fafafa",
              color: "#1e293b",
              boxShadow: digit ? "0 0 0 3px rgba(59,130,246,0.12)" : "0 1px 3px rgba(0,0,0,0.07)",
              transition: "all 0.15s",
              opacity: verifying ? 0.6 : 1,
            }}
          />
        ))}
      </div>

      {/* verifying */}
      {verifying && (
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <span style={spinnerStyle} />
          <span style={{ color: "#2563eb", fontSize: 13, fontWeight: 600 }}>Verifying…</span>
        </div>
      )}

      {/* error */}
      {error && !verifying && (
        <div style={{ background: "#fef2f2", border: "1px solid #fca5a5", borderRadius: 8, padding: "8px 14px" }}>
          <p style={{ color: "#dc2626", fontSize: 13, margin: 0 }}>⚠ {error}</p>
        </div>
      )}

      {/* resend */}
      <p style={{ fontSize: 13, color: "#6b7280", margin: 0 }}>
        {canResend ? (
          <button
            onClick={handleResend}
            disabled={resending}
            style={{ background: "none", border: "none", color: "#2563eb", cursor: "pointer", fontWeight: 600, fontSize: 13, padding: 0 }}
          >
            {resending ? "Resending…" : "↺ Resend OTP"}
          </button>
        ) : (
          <>Resend in <strong style={{ color: "#dc2626" }}>{countdown}s</strong></>
        )}
      </p>
    </div>
  );
}

const spinnerStyle = {
  display: "inline-block", width: 14, height: 14, borderRadius: "50%",
  border: "2px solid #bfdbfe", borderTopColor: "#2563eb",
  animation: "spin 0.7s linear infinite",
};
// src/Service/OtpVerification.jsx
//
// PURPOSE:
//   Renders a 6-box OTP input UI for a given email address.
//   Once all 6 digits are filled (typed OR pasted), it auto-submits to the
//   backend without requiring the user to press "Verify OTP".
//   A 60-second countdown controls when the user can request a resend.
//
// PROPS:
//   email      {string}    – The email address this OTP was sent to.
//   onVerified {function}  – Callback fired after the backend confirms the OTP.
//   onResend   {function}  – Async function (provided by parent) that calls
//                            POST /otp/send to issue a fresh OTP.

import { useState, useEffect, useRef, useCallback } from "react";

const OTP_LENGTH  = 6;   // number of digit boxes
const RESEND_SECS = 60;  // seconds before "Resend OTP" becomes available

export default function OtpVerification({ email, onVerified, onResend }) {
  const API_BASE = import.meta.env.VITE_API_BASE_URL;

  // ── State ──────────────────────────────────────────────────────────────────

  // otp: array of single-character strings, one per box e.g. ["1","2","3","","",""]
  const [otp, setOtp]             = useState(Array(OTP_LENGTH).fill(""));

  const [error, setError]         = useState("");      // inline error message
  const [success, setSuccess]     = useState("");      // inline success message
  const [verifying, setVerifying] = useState(false);   // true while awaiting backend response
  const [resending, setResending] = useState(false);   // true while resend request in-flight
  const [countdown, setCountdown] = useState(RESEND_SECS); // seconds left before resend allowed
  const [canResend, setCanResend] = useState(false);   // unlocks the Resend button

  // inputRefs: holds a ref to each <input> DOM node so we can programmatically
  // move focus between boxes (advance on digit entry, go back on Backspace)
  const inputRefs = useRef([]);

  // ── Countdown timer ────────────────────────────────────────────────────────
  // Fires every second. When it reaches 0 it enables the Resend button and stops.
  useEffect(() => {
    if (countdown <= 0) { setCanResend(true); return; }
    const t = setTimeout(() => setCountdown((c) => c - 1), 1000);
    return () => clearTimeout(t); // cleanup prevents memory leaks on unmount
  }, [countdown]);

  // ── verifyOtp ──────────────────────────────────────────────────────────────
  // Core verification logic, extracted into useCallback so it can be called
  // both by the auto-submit effect AND by the manual "Verify OTP" button.
  //
  // Flow:
  //   1. Join the 6 digits into a string.
  //   2. POST to /otp/verify?email=...&otp=...
  //   3. On success  → show tick, wait 600 ms, call onVerified() so the parent
  //                    marks this email as verified.
  //   4. On failure  → show error, clear all boxes, refocus box 0 for re-entry.
  const verifyOtp = useCallback(async (digits) => {
    const code = digits.join("");

    // Guard: should never be called with an incomplete code, but stay safe
    if (code.length < OTP_LENGTH) return;

    setVerifying(true);
    setError("");
    setSuccess("");

    try {
      const res = await fetch(
        `${API_BASE}/otp/verify?email=${encodeURIComponent(email)}&otp=${encodeURIComponent(code)}`,
        { method: "POST" }
      );

      // Only attempt .json() if the server actually sent JSON.
      // This prevents a parse crash when Spring returns an HTML error page (e.g. 500).
      const contentType = res.headers.get("content-type") ?? "";
      const data = contentType.includes("application/json") ? await res.json() : {};

      if (!res.ok || data.success === false) {
        // Wrong / expired OTP — clear all boxes and return focus to box 0
        setError(data.message || "Invalid OTP. Please try again.");
        setOtp(Array(OTP_LENGTH).fill(""));
        inputRefs.current[0]?.focus();
        return;
      }

      // Verified! Show tick briefly before notifying parent
      setSuccess("✓ Email verified successfully!");
      setTimeout(() => onVerified?.(), 600);

    } catch {
      setError("Could not reach the server. Please try again.");
    } finally {
      setVerifying(false);
    }
  }, [API_BASE, email, onVerified]);

  // ── Auto-submit effect ─────────────────────────────────────────────────────
  // Watches the `otp` array. As soon as every box has a digit AND we are not
  // already verifying / already succeeded, it fires verifyOtp automatically.
  // This means the user never has to press any button — typing/pasting is enough.
  //
  // Why useEffect instead of calling verifyOtp inside handleChange?
  //   React state updates are async — if we called verifyOtp() right after
  //   setOtp() in handleChange, the `otp` value we pass would still be the
  //   OLD array (stale closure). The effect runs AFTER the state has actually
  //   been committed, so `otp` is guaranteed to be the latest value here.
  useEffect(() => {
    const allFilled = otp.every((d) => d !== "");
    if (allFilled && !verifying && !success) {
      verifyOtp(otp);
    }
  // verifyOtp is stable (useCallback with correct deps) so this effect
  // does not re-run on every render — only when otp / verifying / success change.
  }, [otp, verifying, success, verifyOtp]);

  // ── handleChange ──────────────────────────────────────────────────────────
  // Called on every keystroke inside a box.
  //   - Strips non-digits and keeps only the last character typed.
  //   - Updates the otp array (triggers auto-submit effect if now fully filled).
  //   - Auto-advances focus to the next box.
  const handleChange = (index, e) => {
    const val = e.target.value.replace(/\D/g, "").slice(-1);
    const next = [...otp];
    next[index] = val;
    setOtp(next);
    setError("");

    // Move focus forward only when a digit was actually entered
    if (val && index < OTP_LENGTH - 1) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  // ── handlePaste ───────────────────────────────────────────────────────────
  // Handles pasting a full OTP (e.g. from SMS / email).
  //   - Strips non-digits, takes the first OTP_LENGTH characters.
  //   - Fills all boxes at once, then focuses the last filled box.
  //   - The otp state update triggers the auto-submit effect immediately.
  const handlePaste = (e) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, OTP_LENGTH);
    if (!pasted) return;

    const next = Array(OTP_LENGTH).fill("");
    pasted.split("").forEach((ch, i) => { next[i] = ch; });
    setOtp(next);
    setError("");

    // Focus the box right after the last pasted digit (or the last box)
    inputRefs.current[Math.min(pasted.length, OTP_LENGTH - 1)]?.focus();
  };

  // ── handleKeyDown ─────────────────────────────────────────────────────────
  // Only intercepts Backspace on an empty box to move focus back to the
  // previous box — standard UX for OTP inputs.
  const handleKeyDown = (index, e) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  // ── handleResend ──────────────────────────────────────────────────────────
  // Calls the parent-supplied onResend() to issue a new OTP, then:
  //   - Clears all boxes and error/success messages.
  //   - Resets the countdown so the button locks again for 60 seconds.
  //   - Returns focus to box 0.
  const handleResend = async () => {
    if (!canResend || resending) return;
    setResending(true);
    setError("");
    setSuccess("");

    try {
      await onResend?.();
      setOtp(Array(OTP_LENGTH).fill(""));
      setCountdown(RESEND_SECS);
      setCanResend(false);
      inputRefs.current[0]?.focus();
    } catch {
      setError("Failed to resend OTP. Please try again.");
    } finally {
      setResending(false);
    }
  };

  // ── Render ─────────────────────────────────────────────────────────────────
  // Box border colors communicate state at a glance:
  //   error   → red border + red tint
  //   success → green border + green tint
  //   filled  → blue border + blue tint
  //   empty   → gray border, blue on focus
  return (
    <div className="flex flex-col items-center gap-4 w-full">

      {/* ── OTP digit boxes ──
          onPaste sits on the wrapper <div> so pasting anywhere in the group works,
          not just when a specific box is focused.                                  */}
      <div className="flex gap-3 justify-center" onPaste={handlePaste}>
        {otp.map((digit, i) => (
          <input
            key={i}
            ref={(el) => (inputRefs.current[i] = el)}
            type="text"
            inputMode="numeric"   // shows number keyboard on mobile
            maxLength={1}
            value={digit}
            onChange={(e) => handleChange(i, e)}
            onKeyDown={(e) => handleKeyDown(i, e)}
            // Lock boxes while a verify request is in-flight or after success
            disabled={verifying || !!success}
            className={`
              w-11 h-12 text-center text-xl font-bold rounded-lg border-2 outline-none
              transition-colors duration-150
              disabled:bg-gray-100 disabled:cursor-not-allowed
              ${error   ? "border-red-400   bg-red-50   focus:border-red-500"
              : success ? "border-green-400 bg-green-50"
              : digit   ? "border-blue-500  bg-blue-50"
                        : "border-gray-300  focus:border-blue-500"}
            `}
          />
        ))}
      </div>

      {/* ── Verifying indicator ── shown while the API call is in-flight ── */}
      {verifying && (
        <p className="text-sm text-blue-600 font-medium animate-pulse">Verifying…</p>
      )}

      {/* ── Error message ── only shown when not currently verifying ── */}
      {error && !verifying && (
        <p className="text-sm text-red-500 flex items-center gap-1">
          <span>⚠</span> {error}
        </p>
      )}

      {/* ── Success message ── briefly visible before parent unmounts this component ── */}
      {success && (
        <p className="text-sm text-green-600 font-medium">{success}</p>
      )}

      {/* ── Manual verify button ──
          Acts as a fallback — normally auto-submit handles it.
          Kept visible while boxes are partially filled so the user
          can see what action will happen. Hidden once verifying or verified. ── */}
      {!success && !verifying && (
        <button
          type="button"
          onClick={() => verifyOtp(otp)}
          disabled={otp.some((d) => !d)}
          className={`
            px-8 py-2.5 rounded-lg font-semibold text-white text-sm transition-colors
            ${!otp.some((d) => !d)
              ? "bg-blue-600 hover:bg-blue-700"
              : "bg-gray-400 cursor-not-allowed"}
          `}
        >
          Verify OTP
        </button>
      )}

      {/* ── Resend row ──
          Hidden after success. Shows countdown until canResend flips true,
          then shows the Resend button.                                        ── */}
      {!success && (
        <p className="text-sm text-gray-900 dark:text-gray-200">
          {canResend ? (
            <button
              type="button"
              onClick={handleResend}
              disabled={resending}
              className="  font-medium disabled:opacity-50 hover:bg-gray-400 hover:text-black transition"
            >
              {resending ? "Resending…" : "Resend OTP"}
            </button>
          ) : (
            // Countdown ticks down every second via the useEffect timer above
            <>Resend OTP in <span className="font-semibold text-red-600 ">{countdown}s</span></>
          )}
        </p>
      )}

    </div>
  );
}
// OtpVerification.jsx
import { useState, useRef, useEffect } from "react";

export default function OtpVerification({
  email,
  onVerified,           // called when OTP is successfully verified
  onResend,             // optional: parent can provide custom resend logic
  autoSendOnMount = false, // if true, calls onResend() when component mounts
}) {
  const API_BASE = import.meta.env.VITE_API_BASE_URL;

  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [timer, setTimer] = useState(30);
  const [verifying, setVerifying] = useState(false);
  const inputs = useRef([]);

  // Auto-focus first input
  useEffect(() => {
    inputs.current[0]?.focus();
  }, []);

  // Timer countdown
  useEffect(() => {
    if (timer <= 0) return;
    const interval = setInterval(() => {
      setTimer((prev) => prev - 1);
    }, 1000);
    return () => clearInterval(interval);
  }, [timer]);

  // Auto-trigger resend when mounted (optional)
  useEffect(() => {
    if (autoSendOnMount && onResend) {
      onResend();
    }
  }, [autoSendOnMount, onResend]);

  const handleChange = (value, index) => {
    const char = value.slice(-1);
    if (!/^[0-9]?$/.test(char)) return;

    const newOtp = [...otp];
    newOtp[index] = char;
    setOtp(newOtp);

    if (char && index < 5) {
      inputs.current[index + 1]?.focus();
    }

    // Auto verify when 6 digits
    if (newOtp.join("").length === 6) {
      verifyOtp(newOtp.join(""));
    }
  };

  const handleKeyDown = (e, index) => {
    if (e.key === "Backspace") {
      if (!otp[index] && index > 0) {
        inputs.current[index - 1]?.focus();
      }
    } else if (e.key === "Enter") {
      e.preventDefault();
      if (index < 5 && otp[index]) {
        inputs.current[index + 1]?.focus();
      } else if (index === 5 && otp.every(Boolean)) {
        verifyOtp(otp.join(""));
      }
    } else if (e.key === "ArrowLeft" && index > 0) {
      e.preventDefault();
      inputs.current[index - 1]?.focus();
    } else if (e.key === "ArrowRight" && index < 5) {
      e.preventDefault();
      inputs.current[index + 1]?.focus();
    }
  };

  const verifyOtp = async (code) => {
    try {
      setVerifying(true);
      const res = await fetch(
        `${API_BASE}/otp/verify?email=${email}&otp=${code}`,
        { method: "POST" }
      );
      const data = await res.json();

      if (!data.success) {
        throw new Error(data.message || "Invalid OTP");
      }

      alert("OTP Verified ✅");
      onVerified?.();
    } catch (err) {
      alert(err.message || "Verification failed");
    } finally {
      setVerifying(false);
    }
  };

  const handleResend = async () => {
    if (timer > 0) return;

    if (onResend) {
      await onResend();
    } else {
      // Default resend if parent doesn't provide
      try {
        await fetch(`${API_BASE}/otp/send?email=${email}`, { method: "POST" });
      } catch {}
    }

    setOtp(["", "", "", "", "", ""]);
    inputs.current[0]?.focus();
    setTimer(30);
  };

  return (
    <div className="flex flex-col items-center w-full max-w-md mx-auto p-4">
      <h3 className="mb-6 text-xl font-semibold underline text-green-500 text-center">
        Enter OTP
      </h3>

      <div className="flex justify-center gap-2 sm:gap-4 mb-6">
        {otp.map((digit, index) => (
          <input
            key={index}
            ref={(el) => (inputs.current[index] = el)}
            type="text"
            inputMode="numeric"
            maxLength={1}
            value={digit}
            onChange={(e) => handleChange(e.target.value, index)}
            onKeyDown={(e) => handleKeyDown(e, index)}
            className="w-10 h-12 sm:w-12 sm:h-14 text-center text-xl font-bold border-2 border-gray-300 rounded-lg focus:border-green-500 focus:outline-none transition-all"
            disabled={verifying}
          />
        ))}
      </div>

      {verifying && <p className="text-blue-500 animate-pulse mb-4">Verifying...</p>}

      <button
        onClick={handleResend}
        disabled={timer > 0 || verifying}
        className={`px-6 py-2 rounded-full font-medium transition-colors ${
          timer > 0 || verifying
            ? "bg-gray-300 text-gray-500 cursor-not-allowed"
            : "bg-green-600 text-white hover:bg-green-700"
        }`}
      >
        {timer > 0 ? `Resend in ${timer}s` : "Resend OTP"}
      </button>
    </div>
  );
}
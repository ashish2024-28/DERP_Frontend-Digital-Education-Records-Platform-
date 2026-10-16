
import { useState } from "react";
import { useParams } from "react-router-dom";
import "./ForgotPassword.css";

const API_BASE = (import.meta.env.VITE_API_BASE_URL || "").replace(/\/+$/, "");
const API_OTP = (import.meta.env.VITE_API_OTP_URL || "").replace(/\/+$/, "");



const INITIAL_FORM = {
  email: "",
  otp: "",
  password: "",
  confirmPassword: "",
};


async function apiRequest(baseUrl, path, method = "POST") {
  let response;

  try {
    response = await fetch(`${baseUrl}${path}`, {
      method,
      headers: {
        Accept: "application/json",
      },
    });
  } catch {
    throw new Error(
      "Unable to connect to the server. Please try again."
    );
  }

  const data = await response.json().catch(() => null);

  if (!response.ok || data?.success === false) {
    throw new Error(
      data?.message || `Request failed (${response.status}).`
    );
  }

  return data;
}


export default function ForgotPassword() {
  const { domain } = useParams();

  const [form, setForm] = useState(INITIAL_FORM);
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [verified, setVerified] = useState(false);
  const [completed, setCompleted] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const updateField = (event) => {
    const { name, value } = event.target;

    setForm((current) => ({
      ...current,
      [name]: value,
    }));

    setError("");
    setMessage("");
  };

  const runRequest = async (callback) => {
    setLoading(true);
    setError("");
    setMessage("");

    try {
      await callback();
    } catch (err) {
      setError(err.message || "Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  const validateDomain = () => {
    if (!domain?.trim()) {
      throw new Error("University domain is missing.");
    }
  };

  // POST /otp/send?email=...
  
const requestOtp = async (event) => {
  event.preventDefault();

  if (!form.email.trim()) {
    setError("Please enter your registered email.");
    return;
  }

  await runRequest(async () => {
    validateDomain();

    const email = form.email.trim().toLowerCase();

    // Step 1: Verify email against the university domain.
    const verifyQuery = new URLSearchParams({ email });

    const emailExists = await apiRequest(
      API_BASE,
      `/${encodeURIComponent(domain)}/forgot_password/verify?${verifyQuery}`,
      "POST"
    );

    // Controller returns ResponseEntity<Boolean>.
    if (emailExists !== true) {
      throw new Error(
        "This email is not registered with this university. Please check your email and try again."
      );
    }

    // Step 2: Send OTP only after email verification.
    const otpQuery = new URLSearchParams({ email });

    await apiRequest(
      API_OTP,
      `/otp/send?${otpQuery}`
    );

    setForm((current) => ({
      ...current,
      email,
      otp: "",
      password: "",
      confirmPassword: "",
    }));

    setVerified(false);
    setStep(2);

    setMessage(
      "Email verified successfully. A verification code has been sent to your email."
    );
  });
};


  // POST /otp/verify?email=...&otp=...

const verifyOtp = async (event) => {
  event.preventDefault();

  if (!/^\d{6}$/.test(form.otp)) {
    setError("Enter the six-digit verification code.");
    return;
  }

  await runRequest(async () => {
    const query = new URLSearchParams({
      email: form.email.trim(),
      otp: form.otp,
    });

    const result = await apiRequest(
      API_OTP,
      `/otp/verify?${query.toString()}`
    );

    // Your ApiResponse<Boolean> returns data: true on success.
    if (result.data !== true) {
      throw new Error(
        result.message || "Invalid or expired verification code."
      );
    }

    setVerified(true);
    setStep(3);
    setMessage(
      "Email verified. You can now choose a new password."
    );
  });
};


  // PUT /{domain}/forgot_password?email=...&newPassword=...
  const resetPassword = async (event) => {
    event.preventDefault();

    if (!verified) {
      setError("Please verify your email before changing your password.");
      return;
    }

    if (form.password.length < 8) {
      setError("Password must contain at least 8 characters.");
      return;
    }

    if (form.password.length > 128) {
      setError("Password cannot exceed 128 characters.");
      return;
    }

    if (form.password !== form.confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    await runRequest(async () => {
      validateDomain();

      const query = new URLSearchParams({
        email: form.email.trim(),
        newPassword: form.password,
      });

      await apiRequest(API_BASE,
        `/${encodeURIComponent(domain)}/forgot_password?${query.toString()}`,
        "PUT"
      );

      setCompleted(true);
      setVerified(false);
      setForm(INITIAL_FORM);
      setMessage("Password updated successfully.");
    });
  };

  const restart = () => {
    setForm(INITIAL_FORM);
    setStep(1);
    setVerified(false);
    setCompleted(false);
    setError("");
    setMessage("");
  };

  return (
    <main className="forgot-password-page">
      <section className="forgot-password-card">
        <div className="forgot-password-icon" aria-hidden="true">
          {completed ? "✓" : "🔐"}
        </div>

        <h1>
          {completed
            ? "Password updated"
            : "Reset your password"}
        </h1>

        <p className="forgot-password-description">
          {completed
            ? "Your password has been updated."
            : "Verify your registered email to reset your DERP password."}
        </p>

        {!completed && (
          <div
            className="reset-progress"
            aria-label={`Step ${step} of 3`}
          >
            {["Email", "Verify", "Password"].map((label, index) => {
              const number = index + 1;

              return (
                <div
                  key={label}
                  className={
                    number <= step
                      ? "reset-progress-step active"
                      : "reset-progress-step"
                  }
                >
                  <span>{number}</span>
                  <small>{label}</small>
                </div>
              );
            })}
          </div>
        )}

        {error && (
          <div className="reset-error" role="alert">
            {error}
          </div>
        )}

        {message && (
          <div className="reset-message" role="status">
            {message}
          </div>
        )}

        {!completed && step === 1 && (
          <form onSubmit={requestOtp}>
            <label htmlFor="reset-email">Registered email</label>

            <input
              id="reset-email"
              name="email"
              type="email"
              value={form.email}
              onChange={updateField}
              placeholder="you@example.com"
              autoComplete="email"
              maxLength={254}
              required
            />

            <button type="submit" disabled={loading}>
              {loading ? "Sending..." : "Send verification code"}
            </button>
          </form>
        )}

        {!completed && step === 2 && (
          <form onSubmit={verifyOtp}>
            <label htmlFor="reset-otp">
              Six-digit verification code
            </label>

            <input
              id="reset-otp"
              name="otp"
              type="text"
              inputMode="numeric"
              pattern="[0-9]{6}"
              maxLength={6}
              value={form.otp}
              onChange={updateField}
              placeholder="000000"
              autoComplete="one-time-code"
              required
            />

            <button type="submit" disabled={loading}>
              {loading ? "Verifying..." : "Verify code"}
            </button>

            <button
              type="button"
              className="reset-secondary"
              disabled={loading}
              onClick={requestOtp}
            >
              Resend code
            </button>

            <button
              type="button"
              className="reset-link"
              disabled={loading}
              onClick={() => {
                setStep(1);
                setForm((current) => ({
                  ...current,
                  otp: "",
                }));
                setError("");
                setMessage("");
              }}
            >
              Change email
            </button>
          </form>
        )}

        {!completed && step === 3 && (
          <form onSubmit={resetPassword}>
            <label htmlFor="new-password">New password</label>

            <input
              id="new-password"
              name="password"
              type="password"
              value={form.password}
              onChange={updateField}
              placeholder="At least 8 characters"
              autoComplete="new-password"
              minLength={8}
              maxLength={128}
              required
            />

            <label htmlFor="confirm-password">
              Confirm new password
            </label>

            <input
              id="confirm-password"
              name="confirmPassword"
              type="password"
              value={form.confirmPassword}
              onChange={updateField}
              placeholder="Re-enter password"
              autoComplete="new-password"
              minLength={8}
              maxLength={128}
              required
            />

            <button
              type="submit"
              disabled={loading || !verified}
            >
              {loading ? "Updating..." : "Update password"}
            </button>
          </form>
        )}

        {completed && (
          <button type="button" onClick={restart}>
            Reset another password
          </button>
        )}

        <p className="reset-security-note">
          Your verification code is time-limited. Never share it with anyone.
        </p>
      </section>
    </main>
  );
}

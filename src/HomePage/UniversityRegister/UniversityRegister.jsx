// UniversityRegister.jsx
import { useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import OtpVerification from "../../Service/Otpverification";

// ─── Validation Rules ─────────────────────────────────────────────────────────

const RULES = {
  // University
  permanentId: (v) =>
    !v.trim()             ? "Permanent ID is required."
    : v.trim().length < 3  ? "Permanent ID must be at least 3 characters."
    : v.trim().length > 50 ? "Permanent ID must be under 50 characters."
    : null,

  institutionName: (v) =>
    !v.trim()               ? "Institution Name is required."
    : v.trim().length < 3   ? "Must be at least 3 characters."
    : v.trim().length > 100 ? "Must be under 100 characters."
    : null,

  universityName: (v) =>
    !v.trim()               ? "University Name is required."
    : v.trim().length < 3   ? "Must be at least 3 characters."
    : v.trim().length > 100 ? "Must be under 100 characters."
    : null,

  institutionType: (v) =>
    !v.trim() ? "Institution Type is required." : null,

  establishmentYear: (v) => {
    if (!v.trim()) return "Establishment Year is required.";
    const y = Number(v);
    if (!Number.isInteger(y) || String(v).includes(".")) return "Enter a valid 4-digit year.";
    if (y < 1800 || y > new Date().getFullYear())
      return `Year must be between 1800 and ${new Date().getFullYear()}.`;
    return null;
  },

  state: (v) =>
    !v.trim()                          ? "State is required."
    : !/^[a-zA-Z\s]+$/.test(v.trim()) ? "State must contain only letters."
    : null,

  address: (v) =>
    !v.trim()              ? "Address is required."
    : v.trim().length < 10  ? "Address must be at least 10 characters."
    : v.trim().length > 255 ? "Address must be under 255 characters."
    : null,

  uniEmail: (v) =>
    !v.trim()                                  ? "University Email is required."
    : !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v)   ? "Enter a valid email address."
    : null,

  uniMobile: (v) =>
    !v.trim()             ? "Mobile Number is required."
    : !/^\d{10}$/.test(v) ? "Must be exactly 10 digits."
    : null,

  domain: (v) =>
    !v.trim()                   ? "Domain is required."
    : /\s/.test(v)              ? "Domain must not contain spaces."
    : !/^[a-z0-9_-]+$/.test(v) ? "Lowercase letters, numbers, - or _ only."
    : v.trim().length > 30      ? "Domain must be under 30 characters."
    : null,

  domainEmailId: (v) =>
    !v.trim()                                      ? "Domain Email ID is required."
    : !/^@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(v) ? "Must start with @ (e.g. @iitd.ac.in)."
    : null,

  // Domain Admin
  adminName: (v) =>
    !v.trim()                              ? "Full Name is required."
    : v.trim().length < 2                  ? "Name must be at least 2 characters."
    : !/^[a-zA-Z\s.'-]+$/.test(v.trim())  ? "Name contains invalid characters."
    : null,

  adminMobile: (v) =>
    !v.trim()             ? "Mobile Number is required."
    : !/^\d{10}$/.test(v) ? "Must be exactly 10 digits."
    : null,

  adminEmail: (v) =>
    !v.trim()                                ? "Admin Email is required."
    : !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v) ? "Enter a valid email address."
    : null,

  password: (v) =>
    !v                         ? "Password is required."
    : v.length < 8             ? "Password must be at least 8 characters."
    : !/[A-Z]/.test(v)         ? "Must contain at least one uppercase letter."
    : !/[0-9]/.test(v)         ? "Must contain at least one number."
    : !/[^a-zA-Z0-9]/.test(v) ? "Must contain at least one special character."
    : null,

  confirmPassword: (v, pwd) =>
    !v          ? "Please confirm your password."
    : v !== pwd ? "Passwords do not match."
    : null,
};

// ─── Password Strength ────────────────────────────────────────────────────────

function getPasswordStrength(pwd) {
  if (!pwd) return { score: 0, label: "", color: "" };
  let score = 0;
  if (pwd.length >= 8)           score++;
  if (pwd.length >= 12)          score++;
  if (/[A-Z]/.test(pwd))         score++;
  if (/[0-9]/.test(pwd))         score++;
  if (/[^a-zA-Z0-9]/.test(pwd)) score++;
  if (score <= 1) return { score, label: "Weak",        color: "bg-red-500"    };
  if (score <= 2) return { score, label: "Fair",        color: "bg-orange-400" };
  if (score <= 3) return { score, label: "Good",        color: "bg-yellow-400" };
  if (score <= 4) return { score, label: "Strong",      color: "bg-green-500"  };
  return            { score, label: "Very Strong",      color: "bg-green-600"  };
}

// ─── FloatInput ───────────────────────────────────────────────────────────────

function FloatInput({
  label, type = "text", name, value, onChange, onKeyDown,
  required, disabled, autoComplete, maxLength, minLength, className = "", error,
}) {
  const [focused, setFocused] = useState(false);
  const lifted = focused || (value !== "" && value !== undefined && value !== null);

  return (
    <div className={`relative ${className}`}>
      <input
        type={type} name={name} value={value ?? ""}
        onChange={onChange} onKeyDown={onKeyDown}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        required={required} disabled={disabled}
        autoComplete={autoComplete} maxLength={maxLength} minLength={minLength}
        placeholder=""
        className={`
          w-full border rounded-lg px-4 pt-5 pb-2 text-sm bg-white
          focus:outline-none focus:ring-2 transition-colors
          disabled:bg-gray-100 disabled:cursor-not-allowed
          ${error
            ? "border-red-400 focus:ring-red-300"
            : focused ? "border-blue-500 focus:ring-blue-500" : "border-gray-300"}
        `}
      />
      <label className={`
        absolute left-4 pointer-events-none select-none transition-all duration-150
        ${lifted ? "top-1.5 text-[10px] font-semibold" : "top-3.5 text-sm text-gray-400"}
        ${error ? "text-red-500" : lifted ? "text-blue-500" : ""}
        ${disabled ? "!text-gray-400" : ""}
      `}>
        {label}{required && <span className="text-red-400 ml-0.5">*</span>}
      </label>
      {error && (
        <p className="mt-1 text-xs text-red-500 flex items-center gap-1">
          <span>⚠</span> {error}
        </p>
      )}
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function UniversityRegister() {
  const API_BASE     = import.meta.env.VITE_API_BASE_URL;
  const platformLogo = "/Logo.png";
  const navigate     = useNavigate();

  const [university, setUniversity] = useState({
    permanentId: "", institutionName: "", universityName: "",
    institutionType: "", establishmentYear: "", address: "",
    state: "", email: "", mobileNumber: "", domain: "", domainEmailId: "",
  });

  const [domainAdmin, setDomainAdmin] = useState({
    name: "", mobileNumber: "", email: "", password: "",
  });

  const [logo, setLogo]                         = useState(null);
  const [logoError, setLogoError]               = useState("");
  const [confirmPassword, setConfirmPassword]   = useState("");
  const [fieldErrors, setFieldErrors]           = useState({});   // only populated on submit
  const [globalError, setGlobalError]           = useState("");
  const [validating, setValidating]             = useState(false);
  const [otpSending, setOtpSending]             = useState(false);
  const [otpSent, setOtpSent]                   = useState(false);
  const [loading, setLoading]                   = useState(false);
  const [otpVerifiedUniversity, setOtpVerifiedUniversity] = useState(false);
  const [otpVerifiedAdmin, setOtpVerifiedAdmin]           = useState(false);

  const bothVerified = otpVerifiedUniversity && otpVerifiedAdmin;
  const pwdStrength  = getPasswordStrength(domainAdmin.password);

  // ── Helpers ────────────────────────────────────────────────────────────────

  // Clear a single field's error as soon as the user starts correcting it
  const clearFE = (key) =>
    setFieldErrors((p) => { const n = { ...p }; delete n[key]; return n; });

  const handleKeyDownMoveNext = (e) => {
    if (e.key !== "Enter") return;
    const form = e.target.form;
    if (!form) return;
    const els = Array.from(form.querySelectorAll(
      'input:not([type="submit"]):not([type="file"]):not([disabled]):not([readonly])'
    ));
    const idx = els.indexOf(e.target);
    if (idx === -1 || idx >= els.length - 1) return;
    e.preventDefault();
    els[idx + 1].focus();
  };

  const handleUniversityChange = (e) => {
    setUniversity((p) => ({ ...p, [e.target.name]: e.target.value }));
    // clear mapped error key so the red border disappears while user fixes the field
    const keyMap = { email: "uniEmail", mobileNumber: "uniMobile" };
    clearFE(keyMap[e.target.name] ?? e.target.name);
  };

  const handleDomainAdminChange = (e) => {
    setDomainAdmin((p) => ({ ...p, [e.target.name]: e.target.value }));
    const keyMap = { email: "adminEmail", mobileNumber: "adminMobile", name: "adminName" };
    clearFE(keyMap[e.target.name] ?? e.target.name);
    if (e.target.name === "password") clearFE("confirmPassword");
  };

  // ── Full validation (runs ONLY on button click) ────────────────────────────
  const validateAll = () => {
    const errs = {};
    const add  = (key, val, extra) => { const e = RULES[key]?.(val, extra); if (e) errs[key] = e; };

    add("permanentId",       university.permanentId);
    add("institutionName",   university.institutionName);
    add("universityName",    university.universityName);
    add("institutionType",   university.institutionType);
    add("establishmentYear", university.establishmentYear);
    add("state",             university.state);
    add("address",           university.address);
    add("uniEmail",          university.email);
    add("uniMobile",         university.mobileNumber);
    add("domain",            university.domain);
    add("domainEmailId",     university.domainEmailId);
    add("adminName",         domainAdmin.name);
    add("adminMobile",       domainAdmin.mobileNumber);
    add("adminEmail",        domainAdmin.email);
    add("password",          domainAdmin.password);
    add("confirmPassword",   confirmPassword, domainAdmin.password);

    if (university.email && domainAdmin.email && university.email === domainAdmin.email)
      errs.adminEmail = "Admin email must differ from the university email.";

    const noLogo = !logo;
    setLogoError(noLogo ? "University logo is required." : "");
    setFieldErrors(errs);
    return Object.keys(errs).length === 0 && !noLogo;
  };

  // ── Validate → Send OTPs ───────────────────────────────────────────────────
  const validateThenSendOtp = async () => {
    setGlobalError("");

    if (!validateAll()) {
      setGlobalError("Please fix the errors highlighted below before continuing.");
      setTimeout(() =>
        document.querySelector("[data-error='true']")
          ?.scrollIntoView({ behavior: "smooth", block: "center" })
      , 80);
      return;
    }

    // Step 1 — DB uniqueness check
    setValidating(true);
    try {
      const fd = new FormData();
      fd.append("university",  new Blob([JSON.stringify(university)],  { type: "application/json" }));
      fd.append("domainAdmin", new Blob([JSON.stringify(domainAdmin)], { type: "application/json" }));
      const res  = await fetch(`${API_BASE}/home_page/validate_before_otp`, { method: "POST", body: fd });
      const data = await res.json();
      if (!res.ok || !data.success) { setGlobalError(data.message || "Validation failed."); return; }
    } catch { setGlobalError("Could not reach the server. Please try again."); return; }
    finally  { setValidating(false); }

    // Step 2 — Send OTPs
    setOtpSending(true);
    try {
      const [r1, r2] = await Promise.all([
        fetch(`${API_BASE}/otp/send?email=${university.email}`,  { method: "POST" }),
        fetch(`${API_BASE}/otp/send?email=${domainAdmin.email}`, { method: "POST" }),
      ]);
      const [d1, d2] = await Promise.all([r1.json(), r2.json()]);
      if (!d1.success || !d2.success) throw new Error("Failed to send OTP to one or both emails.");
      setOtpSent(true);
    } catch (err) { setGlobalError(err.message || "Could not send OTPs. Please try again."); }
    finally       { setOtpSending(false); }
  };

  // ── Final submit ───────────────────────────────────────────────────────────
  const handleFinalSubmit = async (e) => {
    e.preventDefault();
    if (!bothVerified) return;
    setLoading(true); setGlobalError("");
    const fd = new FormData();
    fd.append("university",  new Blob([JSON.stringify(university)],  { type: "application/json" }));
    fd.append("domainAdmin", new Blob([JSON.stringify(domainAdmin)], { type: "application/json" }));
    if (logo) fd.append("logo", logo);
    try {
      const response = await fetch(`${API_BASE}/home_page/register_university`, { method: "POST", body: fd });
      let data; try { data = await response.json(); } catch { data = {}; }
      if (!response.ok || !data.success) throw new Error(data.message || "Registration failed.");
      alert(`${data.message || "University registered successfully"} 🎉\nPlease login as Domain Admin.`);
      navigate("/");
    } catch (err) { setGlobalError(err.message || "Registration failed. Please try again."); }
    finally       { setLoading(false); }
  };

  const isBusy = validating || otpSending || loading;
  const fe     = fieldErrors;

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <div className="container mx-auto px-4 py-8 max-w-3xl">
      <div className="flex justify-center">
        <img src={platformLogo} alt="Platform Logo" className="w-72" />
      </div>
      <h1 className="text-3xl font-bold text-center mb-8 underline text-green-500 dark:text-green-700">
        University Registration
      </h1>

      <form onSubmit={handleFinalSubmit} noValidate className="shadow-lg rounded-xl p-8 space-y-6">

        {/* Global error banner */}
        {globalError && (
          <div className="bg-red-50 border-l-4 border-red-500 p-4 text-red-700 rounded text-sm">
            {globalError}
          </div>
        )}

        {/* ── University Details ── */}
        <div>
          <h2 className="text-xl font-semibold mb-4">University Details</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">

            <FloatInput label="Permanent ID" name="permanentId" value={university.permanentId}
              onChange={handleUniversityChange} onKeyDown={handleKeyDownMoveNext}
              required disabled={otpSent} error={fe.permanentId}
            />
            <FloatInput label="Institution Name" name="institutionName" value={university.institutionName}
              onChange={handleUniversityChange} onKeyDown={handleKeyDownMoveNext}
              required disabled={otpSent} error={fe.institutionName}
            />
            <FloatInput label="University Name" name="universityName" value={university.universityName}
              onChange={handleUniversityChange} onKeyDown={handleKeyDownMoveNext}
              required disabled={otpSent} error={fe.universityName}
            />
            <FloatInput label="Institution Type" name="institutionType" value={university.institutionType}
              onChange={handleUniversityChange} onKeyDown={handleKeyDownMoveNext}
              required disabled={otpSent} error={fe.institutionType}
            />
            <FloatInput label="Establishment Year" name="establishmentYear" value={university.establishmentYear}
              onChange={handleUniversityChange} onKeyDown={handleKeyDownMoveNext}
              required disabled={otpSent} maxLength={4} error={fe.establishmentYear}
            />
            <FloatInput label="State" name="state" value={university.state}
              onChange={handleUniversityChange} onKeyDown={handleKeyDownMoveNext}
              required disabled={otpSent} error={fe.state}
            />
            <FloatInput label="Full Address" name="address" value={university.address}
              onChange={handleUniversityChange} onKeyDown={handleKeyDownMoveNext}
              required disabled={otpSent} className="md:col-span-2" error={fe.address}
            />
            <FloatInput label="Official University Email" type="email" name="email" value={university.email}
              onChange={handleUniversityChange} onKeyDown={handleKeyDownMoveNext}
              required disabled={otpSent} autoComplete="email" error={fe.uniEmail}
            />
            <FloatInput label="Mobile Number" name="mobileNumber" value={university.mobileNumber}
              onChange={handleUniversityChange} onKeyDown={handleKeyDownMoveNext}
              required disabled={otpSent} autoComplete="tel" maxLength={10} error={fe.uniMobile}
            />
            <FloatInput label="Unique Domain (e.g. iitd)" name="domain" value={university.domain}
              onChange={handleUniversityChange} onKeyDown={handleKeyDownMoveNext}
              required disabled={otpSent} maxLength={30} error={fe.domain}
            />
            <FloatInput label="Domain Email (e.g. @iitd.ac.in)" name="domainEmailId" value={university.domainEmailId}
              onChange={handleUniversityChange} onKeyDown={handleKeyDownMoveNext}
              required disabled={otpSent} error={fe.domainEmailId}
            />

          </div>
        </div>

        {/* ── Logo ── */}
        <div>
          <h2 className="text-xl font-semibold mb-4 mt-8">Upload University Logo</h2>
          <input
            type="file"
            accept="image/png, image/jpeg, image/webp, image/svg+xml"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (!file) { setLogo(null); return; }
              if (file.size > 2 * 1024 * 1024) {
                setLogoError("Logo must be under 2 MB.");
                setLogo(null);
              } else {
                setLogo(file);
                setLogoError("");
              }
            }}
            disabled={otpSent}
            className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 disabled:opacity-60"
          />
          {logoError && (
            <p data-error="true" className="mt-1 text-xs text-red-500 flex items-center gap-1">
              <span>⚠</span> {logoError}
            </p>
          )}
          {logo && !logoError && (
            <p className="mt-1 text-xs text-green-600">✓ {logo.name}</p>
          )}
        </div>

        {/* ── Domain Admin Details ── */}
        <div>
          <h2 className="text-xl font-semibold mb-4 mt-10">Domain Admin Details</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">

            <FloatInput label="Full Name" name="name" value={domainAdmin.name}
              onChange={handleDomainAdminChange} onKeyDown={handleKeyDownMoveNext}
              required disabled={otpSent} error={fe.adminName}
            />
            <FloatInput label="Mobile Number" name="mobileNumber" value={domainAdmin.mobileNumber}
              onChange={handleDomainAdminChange} onKeyDown={handleKeyDownMoveNext}
              required disabled={otpSent} autoComplete="tel" maxLength={10} error={fe.adminMobile}
            />
            <FloatInput label="Admin Email" type="email" name="email" value={domainAdmin.email}
              onChange={handleDomainAdminChange} onKeyDown={handleKeyDownMoveNext}
              required disabled={otpSent} autoComplete="email" error={fe.adminEmail}
            />

            {/* Password + strength bar */}
            <div>
              <FloatInput label="Password (min 8 chars)" type="password" name="password" value={domainAdmin.password}
                onChange={handleDomainAdminChange} onKeyDown={handleKeyDownMoveNext}
                required disabled={otpSent} minLength={8} error={fe.password}
              />
              {/* Strength bar — always visible once user starts typing, regardless of submit */}
              {domainAdmin.password && !otpSent && (
                <div className="mt-2 px-1">
                  <div className="flex gap-1 h-1.5">
                    {[1, 2, 3, 4, 5].map((i) => (
                      <div key={i} className={`flex-1 rounded-full transition-colors duration-300 ${
                        i <= pwdStrength.score ? pwdStrength.color : "bg-gray-200"
                      }`} />
                    ))}
                  </div>
                  <p className={`text-xs mt-1 font-medium ${
                    pwdStrength.score <= 2 ? "text-red-500"
                    : pwdStrength.score === 3 ? "text-yellow-600"
                    : "text-green-600"
                  }`}>
                    {pwdStrength.label}
                  </p>
                </div>
              )}
            </div>

            <FloatInput
              label="Confirm Password" type="password" name="confirmPassword" value={confirmPassword}
              onChange={(e) => { setConfirmPassword(e.target.value); clearFE("confirmPassword"); }}
              onKeyDown={handleKeyDownMoveNext}
              required disabled={otpSent} minLength={8} className="md:col-span-2"
              error={fe.confirmPassword}
            />

          </div>
        </div>

        {/* ── Send OTP / OTP Verify ── */}
        {!otpSent ? (
          <div className="pt-6">
            <button
              type="button" onClick={validateThenSendOtp} disabled={isBusy}
              className={`w-full py-3 px-6 rounded-lg font-semibold text-white transition-colors ${
                isBusy ? "bg-gray-400 cursor-not-allowed" : "bg-blue-600 hover:bg-blue-700"
              }`}
            >
              {validating ? "Checking availability…" : otpSending ? "Sending OTPs…" : "Verify & Send OTPs"}
            </button>
          </div>
        ) : (
          <div className="pt-8">
            <h3 className="text-xl font-semibold text-center mb-8">Verify Email Addresses</h3>
            <div className="space-y-12">

              <div>
                <p className="text-center mb-4 text-gray-700">
                  OTP sent to <strong>{university.email}</strong>
                </p>
                {otpVerifiedUniversity ? (
                  <div className="text-center text-green-600 font-medium text-lg">✓ University email verified</div>
                ) : (
                  <OtpVerification
                    email={university.email}
                    onVerified={() => setOtpVerifiedUniversity(true)}
                    onResend={() => fetch(`${API_BASE}/otp/send?email=${university.email}`, { method: "POST" })}
                  />
                )}
              </div>

              <div>
                <p className="text-center mb-4 text-gray-700">
                  OTP sent to <strong>{domainAdmin.email}</strong>
                </p>
                {otpVerifiedAdmin ? (
                  <div className="text-center text-green-600 font-medium text-lg">✓ Admin email verified</div>
                ) : (
                  <OtpVerification
                    email={domainAdmin.email}
                    onVerified={() => setOtpVerifiedAdmin(true)}
                    onResend={() => fetch(`${API_BASE}/otp/send?email=${domainAdmin.email}`, { method: "POST" })}
                  />
                )}
              </div>

            </div>

            {bothVerified && (
              <div className="mt-8 text-center text-green-700 font-bold text-xl">
                Both emails verified successfully!
              </div>
            )}

            <button
              type="submit" disabled={loading || !bothVerified}
              className={`mt-10 w-full py-3 px-6 rounded-lg font-semibold text-white transition-colors ${
                bothVerified && !loading ? "bg-green-600 hover:bg-green-700" : "bg-gray-400 cursor-not-allowed"
              }`}
            >
              {loading ? "Creating University…" : "Complete Registration"}
            </button>
          </div>
        )}

      </form>
    </div>
  );
}
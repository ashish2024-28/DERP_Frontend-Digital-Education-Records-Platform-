// Signup.jsx  — Step 1 & 2 of the signup wizard
import { useEffect, useState } from "react";
import { useParams, Link, useNavigate, useLocation } from "react-router-dom";

const API_BASE      = import.meta.env.VITE_API_BASE_URL;
const UNI_CACHE_KEY = "universities_cache";
const platformLogo  = "/Logo.png";
const defaultUnivLogo = "/defaultUnivLogo.png";

// ─── Helpers ──────────────────────────────────────────────────────────────────

/**
 * Validate a batch string: must be "YYYY-YYYY" where
 *  - both parts are 4-digit years
 *  - start year is 1990–2100
 *  - end year = start + 1 … start + 7  (covers 1-yr certs up to 7-yr med degrees)
 */
function validateBatch(v) {
  if (!v || !v.trim()) return "Batch is required (e.g. 2022-2026).";
  const match = v.trim().match(/^(\d{4})-(\d{4})$/);
  if (!match) return "Use format YYYY-YYYY  (e.g. 2022-2026).";
  const start = parseInt(match[1], 10);
  const end   = parseInt(match[2], 10);
  const currentYear = new Date().getFullYear();

  if (start < 1990 || start > currentYear + 10){
    return `Start year must be between 1990 and ${currentYear + 10}.`;
  } 
  const diff = end - start;
  if (diff < 1 || diff > 7)
    return `End year must be ${start + 1}–${start + 7} for a valid batch.`;
  return null;
}

/**
 * Auto-format a batch input as the user types.
 * Strips non-digits, keeps max 8 digits, inserts hyphen after digit 4.
 * Returns the formatted string.
 */
function formatBatchInput(raw) {
  const digits = raw.replace(/\D/g, "").slice(0, 8);
  if (digits.length <= 4) return digits;
  return `${digits.slice(0, 4)}-${digits.slice(4)}`;
}

// ─── Validation rules ─────────────────────────────────────────────────────────
const RULES = {
  name: (v) =>
    !v.trim()                             ? "Full name is required."
    : v.trim().length < 2                 ? "Name must be at least 2 characters."
    : !/^[a-zA-Z\s.'-]+$/.test(v.trim()) ? "Name contains invalid characters."
    : null,

  email: (v) =>
    !v.trim()                                  ? "Email is required."
    : !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v)   ? "Enter a valid email address."
    : null,

  mobileNumber: (v) =>
    !v.trim()             ? "Mobile number is required."
    : !/^\d{10}$/.test(v) ? "Must be exactly 10 digits."
    : null,

  password: (v) =>
    !v                         ? "Password is required."
    : v.length < 8             ? "Must be at least 8 characters."
    : !/[A-Z]/.test(v)         ? "Must contain at least one uppercase letter."
    : !/[0-9]/.test(v)         ? "Must contain at least one number."
    : !/[^a-zA-Z0-9]/.test(v) ? "Must contain at least one special character."
    : null,

  confirmPassword: (v, pwd) =>
    !v          ? "Please confirm your password."
    : v !== pwd ? "Passwords do not match."
    : null,

  role:          (v) => !v                   ? "Please select a role."           : null,
  rollNumber:    (v) => !v.trim()            ? "Roll number is required."         : null,
  course:        (v) => !v.trim()            ? "Course / Department is required." : null,

  // ── batch uses the dedicated validator ──
  batch:         (v) => validateBatch(v),

  fatherName:    (v) => !v.trim()            ? "Father's name is required."       : null,
  fatherMobNo:   (v) =>
    !v.trim()             ? "Father's mobile is required."
    : !/^\d{10}$/.test(v) ? "Must be exactly 10 digits."
    : null,

  facultyId:     (v) => !v.trim()            ? "Faculty ID is required."          : null,
  teachingBatch: (v) => validateBatch(v),   // faculty also uses YYYY-YYYY format
  subAdminId:    (v) => !v.trim()            ? "Sub Admin ID is required."        : null,
};

// ─── Password strength ────────────────────────────────────────────────────────
function getStrength(pwd) {
  if (!pwd) return { score: 0, label: "", color: "" };
  let s = 0;
  if (pwd.length >= 8)            s++;
  if (pwd.length >= 12)           s++;
  if (/[A-Z]/.test(pwd))          s++;
  if (/[0-9]/.test(pwd))          s++;
  if (/[^a-zA-Z0-9]/.test(pwd))  s++;
  if (s <= 1) return { score: s, label: "Weak",        color: "bg-red-500"    };
  if (s <= 2) return { score: s, label: "Fair",        color: "bg-orange-400" };
  if (s <= 3) return { score: s, label: "Good",        color: "bg-yellow-400" };
  if (s <= 4) return { score: s, label: "Strong",      color: "bg-green-500"  };
  return        { score: s, label: "Very Strong",      color: "bg-green-600"  };
}

// ─── FloatInput ───────────────────────────────────────────────────────────────
function FloatInput({
  label, type = "text", name, value, onChange,
  required, disabled, autoComplete, maxLength, className = "", error,
  suffix, hint,
}) {
  const [focused, setFocused] = useState(false);
  const lifted = focused || (value !== "" && value !== undefined && value !== null);

  return (
    <div className={`relative ${className}`}>
      <input
        type={type} name={name} value={value ?? ""}
        onChange={onChange}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        required={required} disabled={disabled}
        autoComplete={autoComplete} maxLength={maxLength}
        placeholder=""
        className={`
          w-full border rounded-lg px-4 pt-5 pb-2 text-sm bg-white pr-10
          focus:outline-none focus:ring-2 transition-colors
          disabled:bg-gray-100 disabled:cursor-not-allowed
          ${error
            ? "border-red-400 focus:ring-red-300"
            : focused ? "border-blue-500 focus:ring-blue-200" : "border-gray-300"}
        `}
      />
      <label className={`
        absolute left-4 pointer-events-none select-none transition-all duration-150
        ${lifted ? "top-1.5 text-[10px] font-semibold tracking-wide uppercase" : "top-3.5 text-sm text-gray-400"}
        ${error ? "text-red-500" : lifted ? "text-blue-500" : ""}
        ${disabled ? "!text-gray-400" : ""}
      `}>
        {label}{required && <span className="text-red-400 ml-0.5">*</span>}
      </label>
      {suffix && (
        <div className="absolute right-3 top-1/2 -translate-y-1/2">{suffix}</div>
      )}
      {hint && !error && (
        <p className="mt-1 text-xs text-gray-400">{hint}</p>
      )}
      {error && (
        <p data-error="true" className="mt-1 text-xs text-red-500 flex items-center gap-1">
          <span>⚠</span>{error}
        </p>
      )}
    </div>
  );
}

// ─── BatchInput — smart batch field ──────────────────────────────────────────
/**
 * Dedicated batch input that:
 *   • Auto-inserts "-" after the 4th digit  (2024 → 2024-)
 *   • Limits total to 9 chars (YYYY-YYYY)
 *   • Shows a live preview / hint of expected format
 *   • Validates on blur
 */
function BatchInput({ label, name, value, onChange, onBlur, error, required }) {
  const [focused, setFocused] = useState(false);
  const lifted = focused || !!value;

  const handleChange = (e) => {
    const formatted = formatBatchInput(e.target.value);
    onChange({ target: { name, value: formatted } });
  };

  // Compute a helper hint showing the expected end year range
  let hint = "Format: YYYY-YYYY  (e.g. 2022-2026)";
  const startMatch = value?.match(/^(\d{4})/);
  if (startMatch) {
    const sy = parseInt(startMatch[1], 10);
    if (sy >= 1990 && sy <= 2100) {
      hint = `End year should be between ${sy + 1} and ${sy + 7}`;
    }
  }

  return (
    <div className="relative">
      <input
        type="text"
        name={name}
        value={value ?? ""}
        onChange={handleChange}
        onFocus={() => setFocused(true)}
        onBlur={() => { setFocused(false); onBlur?.(); }}
        maxLength={9}
        placeholder=""
        className={`
          w-full border rounded-lg px-4 pt-5 pb-2 text-sm bg-white font-mono
          focus:outline-none focus:ring-2 transition-colors
          ${error
            ? "border-red-400 focus:ring-red-300"
            : focused ? "border-blue-500 focus:ring-blue-200" : "border-gray-300"}
        `}
      />
      <label className={`
        absolute left-4 pointer-events-none select-none transition-all duration-150 font-sans
        ${lifted ? "top-1.5 text-[10px] font-semibold tracking-wide uppercase" : "top-3.5 text-sm text-gray-400"}
        ${error ? "text-red-500" : lifted ? "text-blue-500" : ""}
      `}>
        {label}{required && <span className="text-red-400 ml-0.5">*</span>}
      </label>

      {/* Live hint */}
      {!error && (
        <p className="mt-1 text-xs text-gray-400">{hint}</p>
      )}

      {/* Error */}
      {error && (
        <p data-error="true" className="mt-1 text-xs text-red-500 flex items-center gap-1">
          <span>⚠</span>{error}
        </p>
      )}
    </div>
  );
}

// ─── Top step bar ─────────────────────────────────────────────────────────────
const STEPS = ["Account Info", "Role & Details", "Review & Submit"];

function StepBar({ current }) {
  return (
    <div className="mb-8">
      <div className="flex items-center justify-between relative">
        <div className="absolute top-4 left-0 right-0 h-0.5 bg-gray-200 z-0" />
        <div
          className="absolute top-4 left-0 h-0.5 bg-blue-500 z-0 transition-all duration-500"
          style={{ width: `${((current - 1) / (STEPS.length - 1)) * 100}%` }}
        />
        {STEPS.map((label, i) => {
          const n      = i + 1;
          const done   = current > n;
          const active = current === n;
          return (
            <div key={n} className="relative z-10 flex flex-col items-center gap-1.5" style={{ flex: 1 }}>
              <div className={`
                w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold
                transition-all duration-300 ring-4
                ${done   ? "bg-blue-500 text-white ring-blue-100"
                : active ? "bg-white text-blue-600 border-2 border-blue-500 ring-blue-100"
                         : "bg-white text-gray-400 border-2 border-gray-300 ring-transparent"}
              `}>
                {done ? "✓" : n}
              </div>
              <span className={`text-xs font-semibold text-center leading-tight
                ${active ? "text-blue-600" : done ? "text-blue-400" : "text-gray-400"}
              `} style={{ maxWidth: 80 }}>
                {label}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
export default function Signup() {
  const { domain } = useParams();
  const navigate   = useNavigate();
  const location   = useLocation();

  const [step,            setStep]            = useState(1);
  const [universityName,  setUniversityName]  = useState("");
  const [universityLogo,  setUniversityLogo]  = useState("");
  const [role,            setRole]            = useState("");
  const [confirmPwd,      setConfirmPwd]      = useState("");
  const [showPwd,         setShowPwd]         = useState(false);
  const [showCPwd,        setShowCPwd]        = useState(false);
  const [fieldErrors,     setFieldErrors]     = useState({});
  const [globalError,     setGlobalError]     = useState("");

  const [userData, setUserData] = useState({
    name: "", email: "", password: "", mobileNumber: "",
    rollNumber: "", course: "", branch: "", batch: "",
    fatherName: "", fatherMobNo: "",
    facultyId: "", teachingBatch: "",
    subAdminId: "",
  });

  const pwdStrength = getStrength(userData.password);

  // ── Load university ────────────────────────────────────────────────────────
  useEffect(() => {
    if (!domain) return;
    try {
      const cached = JSON.parse(localStorage.getItem(UNI_CACHE_KEY) || "[]");
      const uni    = cached.find(u => u.domain === domain);
      if (uni) {
        setUniversityName(uni.universityName || "");
        setUniversityLogo(uni.universityLogoPath || "");
        return;
      }
    } catch {}
    fetch(`${API_BASE}/${domain}/signup`)
      .then(r => { if (!r.ok) throw new Error(); return r.json(); })
      .then(d => { setUniversityName(d.universityName || ""); setUniversityLogo(d.universityLogoPath || ""); })
      .catch(() => navigate("/"));
  }, [domain, navigate]);

  // ── Restore on back-nav ────────────────────────────────────────────────────
  useEffect(() => {
    if (location.state?.userData) {
      setUserData(location.state.userData);
      setRole(location.state.role || "");
      setStep(2);
    }
  }, [location.state]);

  const set = (e) => {
    setUserData(p => ({ ...p, [e.target.name]: e.target.value }));
    setFieldErrors(p => { const n = { ...p }; delete n[e.target.name]; return n; });
  };

  const clearFE = (k) => setFieldErrors(p => { const n = { ...p }; delete n[k]; return n; });

  // ── Step 1 validate ────────────────────────────────────────────────────────
  const validateStep1 = () => {
    const e = {};
    const add = (k, v, extra) => { const err = RULES[k]?.(v, extra); if (err) e[k] = err; };
    add("name",            userData.name);
    add("email",           userData.email);
    add("mobileNumber",    userData.mobileNumber);
    add("password",        userData.password);
    add("confirmPassword", confirmPwd, userData.password);
    setFieldErrors(e);
    if (Object.keys(e).length) {
      setGlobalError("Please fix the errors below.");
      setTimeout(() => document.querySelector("[data-error='true']")?.scrollIntoView({ behavior: "smooth", block: "center" }), 80);
      return false;
    }
    setGlobalError("");
    return true;
  };

  // ── Step 2 validate ────────────────────────────────────────────────────────
  const validateStep2 = () => {
    const e = {};
    const add = (k, v) => { const err = RULES[k]?.(v); if (err) e[k] = err; };
    if (!role) { e.role = "Please select a role."; }
    if (role === "STUDENT") {
      add("rollNumber",  userData.rollNumber);
      add("course",      userData.course);
      add("batch",       userData.batch);      // uses validateBatch()
      add("fatherName",  userData.fatherName);
      add("fatherMobNo", userData.fatherMobNo);
    }
    if (role === "FACULTY") {
      add("facultyId",     userData.facultyId);
      add("course",        userData.course);
      add("teachingBatch", userData.teachingBatch); // uses validateBatch()
    }
    if (role === "SUB_ADMIN") {
      add("subAdminId", userData.subAdminId);
      add("course",     userData.course);
    }
    setFieldErrors(e);
    if (Object.keys(e).length) {
      setGlobalError("Please fix the errors below.");
      setTimeout(() => document.querySelector("[data-error='true']")?.scrollIntoView({ behavior: "smooth", block: "center" }), 80);
      return false;
    }
    setGlobalError("");
    return true;
  };

  const goNext = () => {
    if (step === 1 && validateStep1()) {
      setStep(2);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
    if (step === 2 && validateStep2()) {
      navigate(`/${domain}/signup/confirm`, { state: { userData, role } });
    }
  };

  const goBack = () => {
    setFieldErrors({});
    setGlobalError("");
    setStep(1);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const fe = fieldErrors;

  const EyeBtn = ({ show, toggle }) => (
    <button type="button" onClick={toggle}
      className="text-gray-400 hover:text-gray-600 transition text-base leading-none"
      tabIndex={-1}>
      {show ? "🙈" : "👁️"}
    </button>
  );

  return (
    <div className="min-h-screen flex flex-col items-center justify-start px-4 py-10">

      {/* Logos */}
      <div className="flex items-center mb-3">
        <img src={platformLogo} alt="Platform" className="h-48 object-contain" />
        <span className="text-gray-300 text-2xl">↔</span>
        <img
          src={universityLogo ? `${API_BASE}/${universityLogo}` : defaultUnivLogo}
          alt="University"
          className="h-32 object-contain rounded-full border border-gray-200 shadow-sm"
        />
      </div>
      <h1 className="text-lg font-bold text-gray-700 text-center mb-1">
        Digital Education Records
        {universityName && <> ↔ <span className="text-blue-600">{universityName}</span></>}
      </h1>
      <p className="text-sm text-gray-400 mb-8">Create your account — it takes under 2 minutes.</p>

      {/* Card */}
      <div className="w-full max-w-xl rounded-2xl shadow-lg p-8">
        <StepBar current={step} />

        <h2 className="text-xl font-bold text-gray-800 mb-6 dark:text-gray-300">
          {step === 1 ? "Account Information" : "Role & Details"}
        </h2>

        {globalError && (
          <div className="mb-5 bg-red-50 border-l-4 border-red-500 text-red-700 text-sm px-4 py-3 rounded">
            {globalError}
          </div>
        )}

        {/* ── STEP 1 ── */}
        {step === 1 && (
          <div className="space-y-4">
            <FloatInput label="Full Name"     name="name"         value={userData.name}         onChange={set} required autoComplete="name"  error={fe.name} />
            <FloatInput label="Email Address" name="email"        value={userData.email}        onChange={set} required autoComplete="email" type="email" error={fe.email} />
            <FloatInput label="Mobile Number" name="mobileNumber" value={userData.mobileNumber} onChange={set} required autoComplete="tel"  maxLength={10} error={fe.mobileNumber} />

            <div>
              <FloatInput
                label="Password" type={showPwd ? "text" : "password"} name="password"
                value={userData.password}
                onChange={e => { set(e); clearFE("confirmPassword"); }}
                required autoComplete="new-password" error={fe.password}
                suffix={<EyeBtn show={showPwd} toggle={() => setShowPwd(v => !v)} />}
              />
              {userData.password && (
                <div className="mt-2 px-1">
                  <div className="flex gap-1 h-1.5">
                    {[1,2,3,4,5].map(i => (
                      <div key={i} className={`flex-1 rounded-full transition-colors duration-300 ${i <= pwdStrength.score ? pwdStrength.color : "bg-gray-200"}`} />
                    ))}
                  </div>
                  <p className={`text-xs mt-1 font-semibold ${pwdStrength.score <= 2 ? "text-red-500" : pwdStrength.score === 3 ? "text-yellow-600" : "text-green-600"}`}>
                    {pwdStrength.label}
                  </p>
                </div>
              )}
            </div>

            <FloatInput
              label="Confirm Password" type={showCPwd ? "text" : "password"} name="confirmPassword"
              value={confirmPwd}
              onChange={e => { setConfirmPwd(e.target.value); clearFE("confirmPassword"); }}
              required autoComplete="new-password" error={fe.confirmPassword}
              suffix={<EyeBtn show={showCPwd} toggle={() => setShowCPwd(v => !v)} />}
            />

            <button onClick={goNext}
              className="w-full mt-2 py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm transition">
              Continue →
            </button>
          </div>
        )}

        {/* ── STEP 2 ── */}
        {step === 2 && (
          <div className="space-y-5">
            {/* Role selector */}
            <div>
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Select Your Role *</p>
              <div className="grid grid-cols-3 gap-3">
                {[
                  { value: "STUDENT",   icon: "🎓", label: "Student"   },
                  { value: "FACULTY",   icon: "📚", label: "Faculty"   },
                  { value: "SUB_ADMIN", icon: "🛡️", label: "Sub Admin" },
                ].map(r => (
                  <button
                    key={r.value} type="button"
                    onClick={() => { setRole(r.value); clearFE("role"); }}
                    className={`flex flex-col items-center gap-1.5 py-4 rounded-xl border-2 text-sm font-semibold transition
                      ${role === r.value
                        ? "border-blue-500 bg-blue-200 text-blue-700"
                        : "border-gray-200 bg-white text-gray-600 hover:border-blue-300"}
                    `}
                  >
                    <span className="text-2xl">{r.icon}</span>
                    {r.label}
                  </button>
                ))}
              </div>
              {fe.role && <p data-error="true" className="mt-1.5 text-xs text-red-500 flex items-center gap-1"><span>⚠</span>{fe.role}</p>}
            </div>

            {/* ── STUDENT fields ── */}
            {role === "STUDENT" && (
              <div className="space-y-4 p-4 bg-blue-50 border border-blue-100 rounded-xl">
                <p className="text-xs font-bold text-blue-600 uppercase tracking-wide">Student Details</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <FloatInput label="Roll Number"            name="rollNumber"  value={userData.rollNumber}  onChange={set} required error={fe.rollNumber} />
                  <FloatInput label="Course (B.Tech, BCA…)"  name="course"      value={userData.course}      onChange={set} required error={fe.course}     />
                  <FloatInput label="Branch"                 name="branch"      value={userData.branch}      onChange={set}          error={fe.branch}     />

                  {/* ── Batch with smart auto-format ── */}
                  <BatchInput
                    label="Batch"
                    name="batch"
                    value={userData.batch}
                    onChange={set}
                    onBlur={() => {
                      const err = validateBatch(userData.batch);
                      setFieldErrors(p => err ? { ...p, batch: err } : (() => { const n = { ...p }; delete n.batch; return n; })());
                    }}
                    error={fe.batch}
                    required
                  />

                  <FloatInput label="Father's Name"   name="fatherName"  value={userData.fatherName}  onChange={set} required error={fe.fatherName}  />
                  <FloatInput label="Father's Mobile" name="fatherMobNo" value={userData.fatherMobNo} onChange={set} required maxLength={10} type="tel" error={fe.fatherMobNo} />
                </div>
              </div>
            )}

            {/* ── FACULTY fields ── */}
            {role === "FACULTY" && (
              <div className="space-y-4 p-4 bg-green-50 border border-green-100 rounded-xl">
                <p className="text-xs font-bold text-green-700 uppercase tracking-wide">Faculty Details</p>
                <FloatInput label="Faculty ID"      name="facultyId" value={userData.facultyId} onChange={set} required error={fe.facultyId} />
                <FloatInput label="Teaching Course" name="course"    value={userData.course}    onChange={set} required error={fe.course}    />

                {/* ── Teaching Batch with smart auto-format ── */}
                <BatchInput
                  label="Teaching Batch"
                  name="teachingBatch"
                  value={userData.teachingBatch}
                  onChange={set}
                  onBlur={() => {
                    const err = validateBatch(userData.teachingBatch);
                    setFieldErrors(p => err ? { ...p, teachingBatch: err } : (() => { const n = { ...p }; delete n.teachingBatch; return n; })());
                  }}
                  error={fe.teachingBatch}
                  required
                />
              </div>
            )}

            {/* ── SUB_ADMIN fields ── */}
            {role === "SUB_ADMIN" && (
              <div className="space-y-4 p-4 bg-orange-50 border border-orange-100 rounded-xl">
                <p className="text-xs font-bold text-orange-700 uppercase tracking-wide">Sub Admin Details</p>
                <FloatInput label="Sub Admin ID" name="subAdminId" value={userData.subAdminId} onChange={set} required error={fe.subAdminId} />
                <FloatInput label="Department"   name="course"     value={userData.course}     onChange={set} required error={fe.course}     />
              </div>
            )}

            <div className="flex gap-3 pt-1">
              <button onClick={goBack}
                className="flex-1 py-3 rounded-xl border border-gray-300 text-gray-100 font-semibold text-sm hover:bg-gray-50 transition">
                ← Back
              </button>
              <button onClick={goNext}
                className="flex-[2] py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm transition">
                Review & Confirm →
              </button>
            </div>
          </div>
        )}

        <p className="mt-6 text-sm text-center text-gray-500">
          Already have an account?{" "}
          <Link to={`/${domain}/login`} className="text-blue-600 hover:underline font-semibold">Login</Link>
        </p>
      </div>
    </div>
  );
}
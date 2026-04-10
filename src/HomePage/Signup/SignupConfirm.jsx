// SignupConfirm.jsx  — Step 3: Review → Email OTP → Create Account
//
// FLOW:
//   "review"    → user reads their data, clicks "Create Account"
//   "checking"  → POST /{domain}/signup/check_email  (is email free?)
//   "otp_sent"  → OTP emailed; user enters 6-digit code
//   "verified"  → OTP confirmed; POST create_student / create_faculty / create_subAdmin
//   "success"   → account created; redirects to login
//
import { useState } from "react";
import { useLocation, useNavigate, useParams, Link } from "react-router-dom";
import OtpVerification from "../../Service/Otpverification";
const platformLogo =  "/Logo.png"
const defaultUnivLogo =  "/defaultUnivLogo.png"
const API_BASE = import.meta.env.VITE_API_BASE_URL;
const API_OTP = import.meta.env.VITE_API_OTP_URL;

// ─── Field labels ─────────────────────────────────────────────────────────────
const LABELS = {
  name:          "Full Name",
  email:         "Email Address",
  mobileNumber:  "Mobile Number",
  password:      "Password",
  rollNumber:    "Roll Number",
  course:        "Course / Dept.",
  branch:        "Branch",
  batch:         "Batch",
  fatherName:    "Father's Name",
  fatherMobNo:   "Father's Mobile",
  facultyId:     "Faculty ID",
  teachingBatch: "Teaching Batch",
  subAdminId:    "Sub Admin ID",
};

// ─── Role section config ──────────────────────────────────────────────────────
const ROLE_SECTIONS = {
  STUDENT: {
    label: "Student Details", icon: "🎓",
    fields: ["rollNumber","course","branch","batch","fatherName","fatherMobNo"],
    style: "bg-blue-50 border-blue-100", headStyle: "text-blue-600",
  },
  FACULTY: {
    label: "Faculty Details", icon: "📚",
    fields: ["facultyId","course","teachingBatch"],
    style: "bg-green-50 border-green-100", headStyle: "text-green-700",
  },
  SUB_ADMIN: {
    label: "Sub Admin Details", icon: "🛡️",
    fields: ["subAdminId","course"],
    style: "bg-orange-50 border-orange-100", headStyle: "text-orange-700",
  },
};

// ─── Step bar ─────────────────────────────────────────────────────────────────
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
          const n = i + 1; const done = current > n; const active = current === n;
          return (
            <div key={n} className="relative z-10 flex flex-col items-center gap-1.5" style={{ flex: 1 }}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all duration-300 ring-4
                ${done   ? "bg-blue-500 text-white ring-blue-100"
                : active ? "bg-white text-blue-600 border-2 border-blue-500 ring-blue-100"
                         : "bg-white text-gray-400 border-2 border-gray-300 ring-transparent"}`}>
                {done ? "✓" : n}
              </div>
              <span className={`text-xs font-semibold text-center leading-tight
                ${active ? "text-blue-600" : done ? "text-blue-400" : "text-gray-400"}`}
                style={{ maxWidth: 80 }}>
                {label}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─── Info row ─────────────────────────────────────────────────────────────────
function InfoRow({ label, value, isPassword }) {
  const [show, setShow] = useState(false);
  return (
    <div className="flex items-center py-2.5 border-b border-gray-100 last:border-0 gap-3">
      <span className="w-36 shrink-0 text-xs text-gray-400 font-semibold uppercase tracking-wide">{label}</span>
      <span className="text-sm text-gray-800 dark:text-gray-600 font-medium ">
        {isPassword ? (show ? value : "••••••••") : value}
      </span>
      {isPassword && (
        <button type="button" onClick={() => setShow(v => !v)}
          className="w-12 text-gray-400 hover:text-gray-600 text-sm shrink-0" tabIndex={-1}>
          {show ? "🙈" : "👁️"}
        </button>
      )}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
export default function SignupConfirm() {
  const { domain }  = useParams();
  const navigate    = useNavigate();
  const location    = useLocation();

  const { userData, role } = location.state || {};

  // phase: "review" | "checking" | "otp_sent" | "creating" | "success"
  const [phase,   setPhase]   = useState("review");
  const [checked, setChecked] = useState(false);
  const [error,   setError]   = useState("");

  // ── University branding from cache ────────────────────────────────────────
  let universityName = "", universityLogo = "";
  try {
    const cached = JSON.parse(localStorage.getItem("universities_cache") || "[]");
    const uni = cached.find(u => u.domain === domain);
    if (uni) { universityName = uni.universityName || ""; universityLogo = uni.universityLogoPath || ""; }
  } catch {}

  // ── Guard ─────────────────────────────────────────────────────────────────
  if (!userData || !role) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className=" rounded-2xl shadow-lg p-10 text-center max-w-sm w-full">
          <p className="text-5xl mb-4">⚠️</p>
          <h2 className="text-xl font-bold text-gray-800 mb-2">No signup data found</h2>
          <p className="text-sm text-gray-500 mb-6">Please complete the signup form first.</p>
          <Link to={`/${domain}/signup`}
            className="inline-block px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-semibold transition">
            Go to Signup
          </Link>
        </div>
      </div>
    );
  }

  const roleSection  = ROLE_SECTIONS[role];
  const roleColor    = role === "STUDENT" ? "text-blue-600" : role === "FACULTY" ? "text-green-700" : "text-orange-600";

  const endpointMap = {
    STUDENT:   `/${domain}/signup/create_student`,
    FACULTY:   `/${domain}/signup/create_faculty`,
    SUB_ADMIN: `/${domain}/signup/create_subAdmin`,
  };

  // ── STEP 1 of flow: check email → send OTP ────────────────────────────────
  // Called when user clicks "Create Account" on the review screen.
  const handleCreateClick = async () => {
    if (!checked) { setError("Please confirm that all information is correct."); return; }
    setError("");
    setPhase("checking");

    try {
      // 1️⃣ Check if email is already registered
      const checkRes = await fetch(
        `${API_OTP}/${domain}/signup/check_email?email=${encodeURIComponent(userData.email)}`,
        { method: "GET" }
      );
      const checkCt   = checkRes.headers.get("content-type") ?? "";
      const checkData = checkCt.includes("application/json") ? await checkRes.json() : {};

      if (!checkRes.ok || checkData.exists) {
        // Email already taken — show error, stay on review
        setError(checkData.message || "This email is already registered. Please use a different email.");
        setPhase("review");
        return;
      }

      // 2️⃣ Email is free — send OTP
      const otpRes = await fetch(
        `${API_OTP}/otp/send?email=${encodeURIComponent(userData.email)}`,
        { method: "POST" }
      );
      const otpCt   = otpRes.headers.get("content-type") ?? "";
      const otpData = otpCt.includes("application/json") ? await otpRes.json() : {};

      if (!otpRes.ok || otpData.success === false) {
        throw new Error(otpData.message || "Failed to send OTP. Please try again.");
      }

      setPhase("otp_sent");

    } catch (err) {
      setError(err.message || "Could not reach the server. Please try again.");
      setPhase("review");
    }
  };

  // ── STEP 2 of flow: OTP verified → create account ────────────────────────
  // Called by OtpVerification.onVerified after backend confirms the code.
  const handleOtpVerified = async () => {
    setPhase("creating");
    setError("");

    try {
      const res  = await fetch(`${API_BASE}${endpointMap[role]}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...userData, role }),
      });
      const ct   = res.headers.get("content-type") ?? "";
      const data = ct.includes("application/json") ? await res.json() : {};

      if (!res.ok || data.success === false) {
        throw new Error(data.message || "Account creation failed.");
      }

      setPhase("success");
      setTimeout(() => navigate(`/${domain}/login`, {
        replace: true,  // ✅ replaces history entry — back button skips confirm page
        state:   null,  // ✅ clears signup data so browser back never restores stale state
      }), 2200);

    } catch (err) {
      setError(err.message || "Server error. Please try again.");
      setPhase("otp_sent"); // let user retry OTP phase
    }
  };

  // ── Success screen ────────────────────────────────────────────────────────
  if (phase === "success") {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className=" rounded-2xl shadow-lg p-12 text-center max-w-sm w-full">
          <div className="text-6xl mb-4" style={{ animation:"pop .4s ease" }}>🎉</div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Account Created!</h2>
          <p className="text-sm text-gray-500 mb-6">Redirecting you to login…</p>
          <div className="h-1.5 w-full bg-gray-100 rounded-full overflow-hidden">
            <div className="h-full bg-blue-500 rounded-full" style={{ animation:"grow 2.2s linear forwards" }} />
          </div>
          <style>{`
            @keyframes pop  { 0%{transform:scale(.5);opacity:0} 70%{transform:scale(1.15)} 100%{transform:scale(1);opacity:1} }
            @keyframes grow { from{width:0} to{width:100%} }
          `}</style>
        </div>
      </div>
    );
  }

  // ── Shared page shell ─────────────────────────────────────────────────────
  return (
    <div className="min-h-screen  flex flex-col items-center justify-start px-4 py-10">

       {/* Logos + title */}
      <div className="flex items-center gap-4 ">
        <img src={platformLogo} alt="Platform Logo" className="h-48 object-contain" />
        <span className="text-gray-300 text-2xl">↔</span>
        <img
          src={universityLogo ? `${API_BASE}/${universityLogo}` : {defaultUnivLogo}}
          alt="University"
          className="h-32 object-contain rounded-full border border-gray-200 shadow-sm"
        />
      </div>
      <h1 className="text-lg font-bold text-gray-700 text-center mb-1">
        Digital Education Records
        {universityName && <> ↔ <span className="text-blue-600">{universityName}</span></>}
      </h1>
      <p className="text-sm text-gray-400 mb-8">
        {phase === "otp_sent" || phase === "creating"
          ? "Enter the OTP sent to your email to verify your identity."
          : "Almost done — review your information below."}
      </p>

      {/* Card */}
      <div className="w-full max-w-xl  rounded-2xl shadow-lg p-8">

        <StepBar current={3} />

        {/* ── OTP phase ── */}
        {(phase === "otp_sent" || phase === "creating") && (
          <div>
            <h2 className="text-xl font-bold text-gray-800 mb-1 dark:text-gray-200">Verify Your Email</h2>
            <p className="text-sm text-gray-400 mb-6">
              We sent a 6-digit code to{" "}
              <span className="font-semibold text-gray-700 dark:text-gray-200">{userData.email}</span>.
              Enter it below to create your account.
            </p>

            {error && (
              <div className="mb-5 bg-red-50 border-l-4 border-red-500 text-red-700 text-sm px-4 py-3 rounded">
                {error}
              </div>
            )}

            {/* OTP boxes */}
            <OtpVerification
              email={userData.email}
              onVerified={handleOtpVerified}
              onResend={() =>
                fetch(`${API_OTP}/otp/send?email=${encodeURIComponent(userData.email)}`, { method: "POST" })
              }
            />

            {/* Creating spinner overlay message */}
            {phase === "creating" && (
              <div className="mt-6 flex items-center justify-center gap-2 text-blue-600 text-sm font-medium">
                <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
                </svg>
                Creating your account…
              </div>
            )}

            {/* Back to review */}
            {phase === "otp_sent" && (
              <button
                onClick={() => { setPhase("review"); setError(""); }}
                className="mt-6 w-full py-2.5 rounded-xl border border-gray-300 text-gray-100 font-semibold text-sm hover:bg-gray-50 hover:text-black transition"
              >
                ← Back to Review
              </button>
            )}
          </div>
        )}

        {/* ── Review phase ── */}
        {(phase === "review" || phase === "checking") && (
          <div>
            <h2 className="text-xl font-bold text-gray-800 mb-1 dark:text-gray-100">Review Your Information</h2>
            <p className="text-sm text-gray-400 mb-6">
              Registering as{" "}
              <span className={`font-bold ${roleColor}`}>
                {roleSection?.icon} {role.replace("_", " ")}
              </span>
            </p>

            {/* Error banner */}
            {error && (
              <div className="mb-5 bg-red-50 border-l-4 border-red-500 text-red-700 text-sm px-4 py-3 rounded">
                {error}
              </div>
            )}

            {/* Account Info */}
            <div className=" border border-gray-200  rounded-xl px-5 py-1 mb-4 ">
              <p className="text-xs font-bold text-gray-500 uppercase tracking-wide pt-3 pb-1 dark:text-gray-100">👤 Account Info</p>
              {["name","email","mobileNumber","password"].map(k => userData[k] ? (
                <InfoRow key={k} label={LABELS[k]} value={userData[k]} isPassword={k === "password"} />
              ) : null)}
            </div>

            {/* Role-specific */}
            {roleSection && (
              <div className={`border rounded-xl px-5 py-1 mb-6 ${roleSection.style}`}>
                <p className={`text-xs font-bold uppercase tracking-wide pt-3 pb-1 ${roleSection.headStyle}`}>
                  {roleSection.icon} {roleSection.label}
                </p>
                {roleSection.fields.map(k => userData[k] ? (
                  <InfoRow key={k} label={LABELS[k]} value={userData[k]} />
                ) : null)}
              </div>
            )}

            {/* Confirm checkbox */}
            <label className={`flex items-center gap-3 cursor-pointer p-4 rounded-xl border-2 transition mb-6 select-none
              ${checked ? "border-blue-500 bg-blue-50" : "border-gray-200 hover:border-blue-300"}`}>
              <div className={`w-5 h-5 rounded flex items-center justify-center flex-shrink-0 border-2 transition
                ${checked ? "bg-blue-600 border-blue-600" : "border-gray-300 "}`}>
                {checked && (
                  <svg width="11" height="11" viewBox="0 0 11 11" fill="none">
                    <path d="M1.5 5.5l2.5 2.5 5-5" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                )}
              </div>
              <input type="checkbox" className="sr-only" checked={checked}
                onChange={() => { setChecked(v => !v); setError(""); }} />
              <div>
                <p className={`text-sm font-semibold ${checked ? "text-blue-700" : "text-gray-700"}`}>
                  I confirm all information is correct
                </p>
                <p className="text-xs text-gray-400 mt-0.5">
                  We'll send an OTP to <span className="font-medium text-gray-600">{userData.email}</span> to verify your identity
                </p>
              </div>
            </label>

            {/* Buttons */}
            <div className="flex gap-3">
              <button
                onClick={() => navigate(`/${domain}/signup`, { state: { userData, role } })}
                disabled={phase === "checking"}
                className="flex-1 py-3 rounded-xl border border-gray-300 text-gray-200 font-semibold text-sm transition disabled:opacity-50"
              >
                ← Back
              </button>
              <button
                onClick={handleCreateClick}
                disabled={!checked || phase === "checking"}
                className={`flex-[2] py-3 rounded-xl font-semibold text-sm text-white transition flex items-center justify-center gap-2
                  ${checked && phase !== "checking" ? "bg-blue-600 hover:bg-blue-700" : "bg-gray-400 cursor-not-allowed"}`}
              >
                {phase === "checking" ? (
                  <>
                    <svg className="animate-spin h-4 w-4 text-white" viewBox="0 0 24 24" fill="none">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
                    </svg>
                    Checking…
                  </>
                ) : "Send OTP & Verify →"}
              </button>
            </div>

          </div>
        )}

      </div>
    </div>
  );
}


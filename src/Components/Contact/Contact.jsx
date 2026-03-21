// Contact.jsx — Digital Education Records Platform
// Owner: Ashish Kumar
import { useState } from "react";
import { Link } from "react-router-dom";

const API_BASE = import.meta.env.VITE_API_BASE_URL;

// ─── Contact links ────────────────────────────────────────────────────────────
const CONTACT_LINKS = [
  {
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
        <rect x="2" y="4" width="20" height="16" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/>
      </svg>
    ),
    label:   "Email",
    value:   "ashish224444q@gmail.com",
    href:    "mailto:ashish224444q@gmail.com",
    color:   "blue",
    hint:    "Best for project inquiries & collaboration",
  },
  {
    icon: (
      <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
        <path d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0 1 12 6.844a9.59 9.59 0 0 1 2.504.337c1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.02 10.02 0 0 0 22 12.017C22 6.484 17.522 2 12 2z"/>
      </svg>
    ),
    label:   "GitHub",
    value:   "ashish2024-28",
    href:    "https://github.com/ashish2024-28",
    color:   "gray",
    hint:    "View source code & project repositories",
  },
  {
    icon: (
      <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
        <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 0 1-2.063-2.065 2.064 2.064 0 1 1 2.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
      </svg>
    ),
    label:   "LinkedIn",
    value:   "Ashish Kumar",
    href:    "https://www.linkedin.com/in/ashish-kumar-2191b5324/",
    color:   "indigo",
    hint:    "Connect professionally & follow my journey",
  },
];

// ─── Color maps ───────────────────────────────────────────────────────────────
const CARD_BG   = { blue:"bg-blue-50",   gray:"bg-gray-50",   indigo:"bg-indigo-50"   };
const CARD_BORD = { blue:"border-blue-200", gray:"border-gray-200", indigo:"border-indigo-200" };
const ICON_BG   = { blue:"bg-blue-600",  gray:"bg-gray-800",  indigo:"bg-indigo-600"  };
const LINK_COL  = { blue:"text-blue-600 hover:text-blue-800", gray:"text-gray-700 hover:text-gray-900", indigo:"text-indigo-600 hover:text-indigo-800" };

// ─── Star Rating ──────────────────────────────────────────────────────────────
function StarRating({ value, onChange }) {
  const [hovered, setHovered] = useState(0);
  const labels = ["", "Poor", "Fair", "Good", "Very Good", "Excellent"];
  return (
    <div>
      <div className="flex items-center gap-1 mb-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            onMouseEnter={() => setHovered(star)}
            onMouseLeave={() => setHovered(0)}
            onClick={() => onChange(star)}
            className="text-3xl transition-transform hover:scale-110 focus:outline-none"
          >
            <span className={`transition-colors duration-150 ${
              star <= (hovered || value) ? "text-yellow-400" : "text-gray-300"
            }`}>★</span>
          </button>
        ))}
        {(hovered || value) > 0 && (
          <span className="ml-2 text-sm font-semibold text-gray-600">
            {labels[hovered || value]}
          </span>
        )}
      </div>
    </div>
  );
}

// ─── Feedback categories ──────────────────────────────────────────────────────
const CATEGORIES = ["General Feedback", "Bug Report", "Feature Request", "Collaboration", "Other"];

// ═══════════════════════════════════════════════════════════════════════════════
export default function Contact() {
  const [form, setForm] = useState({
    name: "", email: "", category: "", message: "",
  });
  const [rating,   setRating]   = useState(0);
  const [errors,   setErrors]   = useState({});
  const [status,   setStatus]   = useState("idle"); // idle | submitting | success | error
  const [serverMsg,setServerMsg]= useState("");

  const set = (e) => {
    setForm(p => ({ ...p, [e.target.name]: e.target.value }));
    setErrors(p => { const n = { ...p }; delete n[e.target.name]; return n; });
  };

  // ── Validate ────────────────────────────────────────────────────────────────
  const validate = () => {
    const e = {};
    if (!form.name.trim())                                    e.name     = "Your name is required.";
    if (!form.email.trim())                                   e.email    = "Email address is required.";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) e.email    = "Enter a valid email address.";
    if (!form.category)                                       e.category = "Please select a category.";
    if (!form.message.trim())                                 e.message  = "Message cannot be empty.";
    else if (form.message.trim().length < 10)                 e.message  = "Message must be at least 10 characters.";
    if (rating === 0)                                         e.rating   = "Please rate your experience.";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  // ── Submit ──────────────────────────────────────────────────────────────────
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    setStatus("submitting");

    try {
      // If you have a feedback endpoint, replace this URL.
      // For now we simulate a 1-second delay and show success.
      await new Promise(r => setTimeout(r, 1000));

      // Uncomment when backend endpoint is ready:
      // const res  = await fetch(`${API_BASE}/feedback`, {
      //   method: "POST",
      //   headers: { "Content-Type": "application/json" },
      //   body: JSON.stringify({ ...form, rating }),
      // });
      // const data = await res.json();
      // if (!res.ok) throw new Error(data.message || "Submission failed.");

      setStatus("success");
      setForm({ name: "", email: "", category: "", message: "" });
      setRating(0);
    } catch (err) {
      setServerMsg(err.message || "Something went wrong. Please try again.");
      setStatus("error");
    }
  };

  // ─── Shared input class ────────────────────────────────────────────────────
  const inp = (hasErr) => `w-full border rounded-lg px-4 py-3 text-sm bg-white
    focus:outline-none focus:ring-2 transition-colors
    ${hasErr
      ? "border-red-400 focus:ring-red-200"
      : "border-gray-300 focus:border-blue-500 focus:ring-blue-100"}`;

  return (
    <div className="min-h-screen bg-gray-50">

      {/* ── HERO ──────────────────────────────────────────────────────────── */}
      <div className="bg-gradient-to-br from-gray-900 via-blue-950 to-gray-900 text-white px-4 py-16 text-center relative overflow-hidden">
        <div className="absolute inset-0 opacity-5"
          style={{ backgroundImage:"linear-gradient(#fff 1px,transparent 1px),linear-gradient(90deg,#fff 1px,transparent 1px)", backgroundSize:"40px 40px" }} />
        <div className="relative max-w-2xl mx-auto">
          <span className="inline-block px-3 py-1 rounded-full bg-blue-500/20 border border-blue-400/30 text-blue-300 text-xs font-bold uppercase tracking-widest mb-5">
            Contact & Feedback
          </span>
          <h1 className="text-4xl sm:text-5xl font-extrabold mb-4 leading-tight">
            Get in <span className="text-blue-400">Touch</span>
          </h1>
          <p className="text-blue-200 text-sm sm:text-base max-w-lg mx-auto leading-relaxed">
            Have a question, found a bug, or want to collaborate?
            I'd love to hear from you.
          </p>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 py-14 space-y-14">

        {/* ── OWNER CARD ──────────────────────────────────────────────────── */}
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 sm:p-8 flex flex-col sm:flex-row items-center sm:items-start gap-6">
          {/* Avatar */}
          <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-700 flex items-center justify-center text-white text-3xl font-extrabold shadow-lg shrink-0">
            AK
          </div>
          <div className="flex-1 text-center sm:text-left">
            <div className="flex flex-wrap items-center gap-2 justify-center sm:justify-start mb-1">
              <h2 className="text-xl font-extrabold text-gray-900">Ashish Kumar</h2>
              <span className="px-2.5 py-0.5 rounded-full bg-blue-100 text-blue-700 text-xs font-bold border border-blue-200">
                Project Owner & Creator
              </span>
            </div>
            <p className="text-sm text-gray-500 leading-relaxed max-w-xl mt-1">
              Full-stack developer and sole creator of the Digital Education Records Platform —
              a multi-tenant university management system built from the ground up with
              React, Spring Boot, and JWT-based security.
            </p>
            <div className="flex flex-wrap gap-2 mt-4 justify-center sm:justify-start">
              {["React + Vite", "Spring Boot 3", "JWT Auth", "Multi-tenant", "OTP Verification"].map(tag => (
                <span key={tag} className="px-2.5 py-1 bg-gray-100 text-gray-600 rounded-full text-xs font-medium border border-gray-200">
                  {tag}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* ── CONTACT LINKS ───────────────────────────────────────────────── */}
        <div>
          <h2 className="text-xl font-extrabold text-gray-900 mb-5">Contact Information</h2>
          <div className="grid sm:grid-cols-3 gap-4">
            {CONTACT_LINKS.map(c => (
              <a
                key={c.label}
                href={c.href}
                target="_blank"
                rel="noreferrer"
                className={`group flex flex-col gap-3 p-5 rounded-2xl border transition-all duration-200
                  hover:shadow-md hover:-translate-y-0.5
                  ${CARD_BG[c.color]} ${CARD_BORD[c.color]}`}
              >
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-white shadow-sm ${ICON_BG[c.color]}`}>
                  {c.icon}
                </div>
                <div>
                  <p className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-0.5">{c.label}</p>
                  <p className={`text-sm font-semibold transition-colors ${LINK_COL[c.color]} break-all`}>
                    {c.value}
                  </p>
                  <p className="text-xs text-gray-400 mt-1">{c.hint}</p>
                </div>
                <span className={`text-xs font-semibold flex items-center gap-1 mt-auto transition-colors ${LINK_COL[c.color]}`}>
                  Open ↗
                </span>
              </a>
            ))}
          </div>
        </div>

        {/* ── FEEDBACK FORM ───────────────────────────────────────────────── */}
        <div>
          <h2 className="text-xl font-extrabold text-gray-900 mb-1">Send Feedback</h2>
          <p className="text-sm text-gray-500 mb-6">
            Your feedback helps improve the platform. All submissions are reviewed personally.
          </p>

          {/* Success state */}
          {status === "success" ? (
            <div className="bg-white rounded-2xl border border-green-200 shadow-sm p-10 text-center">
              <div className="text-5xl mb-4">🎉</div>
              <h3 className="text-xl font-extrabold text-gray-800 mb-2">Thank you for your feedback!</h3>
              <p className="text-sm text-gray-500 mb-6 max-w-sm mx-auto">
                Your message has been received. I'll review it and get back to you if a response is needed.
              </p>
              <button
                onClick={() => setStatus("idle")}
                className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-semibold transition"
              >
                Send Another Message
              </button>
            </div>
          ) : (
            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 sm:p-8">

              {/* Server error */}
              {status === "error" && (
                <div className="mb-6 bg-red-50 border-l-4 border-red-500 text-red-700 text-sm px-4 py-3 rounded">
                  ⚠ {serverMsg}
                </div>
              )}

              <form onSubmit={handleSubmit} noValidate className="space-y-5">

                {/* Name + Email */}
                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-gray-600 uppercase tracking-wide mb-1.5">
                      Full Name <span className="text-red-400">*</span>
                    </label>
                    <input
                      type="text" name="name" value={form.name} onChange={set}
                      placeholder="Your full name"
                      className={inp(!!errors.name)}
                    />
                    {errors.name && <p className="mt-1 text-xs text-red-500 flex items-center gap-1"><span>⚠</span>{errors.name}</p>}
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-600 uppercase tracking-wide mb-1.5">
                      Email Address <span className="text-red-400">*</span>
                    </label>
                    <input
                      type="email" name="email" value={form.email} onChange={set}
                      placeholder="your@email.com"
                      className={inp(!!errors.email)}
                    />
                    {errors.email && <p className="mt-1 text-xs text-red-500 flex items-center gap-1"><span>⚠</span>{errors.email}</p>}
                  </div>
                </div>

                {/* Category */}
                <div>
                  <label className="block text-xs font-bold text-gray-600 uppercase tracking-wide mb-1.5">
                    Category <span className="text-red-400">*</span>
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {CATEGORIES.map(cat => (
                      <button
                        key={cat} type="button"
                        onClick={() => { setForm(p => ({...p, category: cat})); setErrors(p => ({...p, category: undefined})); }}
                        className={`px-3.5 py-1.5 rounded-full text-xs font-semibold border transition-all
                          ${form.category === cat
                            ? "bg-blue-600 text-white border-blue-600 shadow-sm"
                            : "bg-white text-gray-600 border-gray-300 hover:border-blue-400 hover:text-blue-600"}`}
                      >
                        {cat}
                      </button>
                    ))}
                  </div>
                  {errors.category && <p className="mt-1.5 text-xs text-red-500 flex items-center gap-1"><span>⚠</span>{errors.category}</p>}
                </div>

                {/* Star rating */}
                <div>
                  <label className="block text-xs font-bold text-gray-600 uppercase tracking-wide mb-2">
                    Overall Experience <span className="text-red-400">*</span>
                  </label>
                  <StarRating value={rating} onChange={setRating} />
                  {errors.rating && <p className="mt-1 text-xs text-red-500 flex items-center gap-1"><span>⚠</span>{errors.rating}</p>}
                </div>

                {/* Message */}
                <div>
                  <label className="block text-xs font-bold text-gray-600 uppercase tracking-wide mb-1.5">
                    Message <span className="text-red-400">*</span>
                  </label>
                  <textarea
                    name="message" value={form.message} onChange={set}
                    rows={5}
                    placeholder="Write your message, suggestion, or report here…"
                    className={`${inp(!!errors.message)} resize-none leading-relaxed`}
                  />
                  <div className="flex items-center justify-between mt-1">
                    {errors.message
                      ? <p className="text-xs text-red-500 flex items-center gap-1"><span>⚠</span>{errors.message}</p>
                      : <span />
                    }
                    <span className={`text-xs ${form.message.length > 800 ? "text-red-400" : "text-gray-400"}`}>
                      {form.message.length}/1000
                    </span>
                  </div>
                </div>

                {/* Submit */}
                <button
                  type="submit"
                  disabled={status === "submitting"}
                  className={`w-full py-3.5 rounded-xl font-bold text-sm text-white transition flex items-center justify-center gap-2
                    ${status === "submitting" ? "bg-gray-400 cursor-not-allowed" : "bg-blue-600 hover:bg-blue-700 shadow-sm"}`}
                >
                  {status === "submitting" ? (
                    <>
                      <svg className="animate-spin h-4 w-4 text-white" viewBox="0 0 24 24" fill="none">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
                      </svg>
                      Submitting…
                    </>
                  ) : (
                    <> 📨 Submit Feedback </>
                  )}
                </button>

                <p className="text-xs text-center text-gray-400">
                  Your information is used only to respond to your message and is never shared with third parties.
                </p>

              </form>
            </div>
          )}
        </div>

        {/* ── FOOTER NAV ──────────────────────────────────────────────────── */}
        <div className="flex flex-wrap justify-center gap-4 pt-4 border-t border-gray-200">
          <Link to="/"       className="text-sm text-blue-600 hover:underline font-medium">← Home</Link>
          <Link to="/about"  className="text-sm text-blue-600 hover:underline font-medium">About</Link>
          <Link to="/homePage/university-register" className="text-sm text-blue-600 hover:underline font-medium">Register University</Link>
        </div>

      </div>
    </div>
  );
}
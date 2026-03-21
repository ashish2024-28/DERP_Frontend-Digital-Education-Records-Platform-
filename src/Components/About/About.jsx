// About.jsx — Digital Education Records Platform
import { useState } from "react";
import { Link } from "react-router-dom";

// ─── Data ─────────────────────────────────────────────────────────────────────

const TECH_STACK = [
  { category: "Frontend",  color: "blue",   items: ["React 18 (Vite)", "React Router v6", "Tailwind CSS", "Lucide React"] },
  { category: "Backend",   color: "green",  items: ["Spring Boot 3", "Spring Security", "JWT Auth", "Spring Data JPA"] },
  { category: "Database",  color: "purple", items: ["MySQL / PostgreSQL", "Hibernate ORM", "ModelMapper", "BCrypt Encoding"] },
  { category: "Infra",     color: "orange", items: ["REST APIs", "Email OTP Service", "Multipart File Upload", "CORS Config"] },
];

const ROLES = [
  { icon: "🏛️", role: "Domain Admin",  color: "indigo", desc: "One per university. Registers the institution, manages Sub Admins and overall settings." },
  { icon: "🛡️", role: "Sub Admin",     color: "orange", desc: "Department-level admin. Manages faculty and students within their assigned course/department." },
  { icon: "📚", role: "Faculty",       color: "green",  desc: "Teaching staff. Views students in their assigned course and batch, manages academic records." },
  { icon: "🎓", role: "Student",       color: "blue",   desc: "Enrolled student. Accesses personal academic records, grades, and institution information." },
];

const OLD_ARCH = [
  { label: "API calls per page load", old: "2–3 (university data fetched on every page)", now: "0 (served from localStorage cache)" },
  { label: "Signup flow",             old: "Single form → submit → account created",       now: "3-step wizard → email check → OTP → create" },
  { label: "Email verification",      old: "None — account created without verification",  now: "OTP verified before any account is persisted" },
  { label: "Duplicate email check",   old: "Runtime error returned after DB write attempt",now: "GET /check_email before OTP is ever sent" },
  { label: "Error handling",          old: "Spring HTML 500 page → frontend JSON parse crash", now: "try-catch in all controllers → JSON ApiResponse" },
  { label: "Role navigation",         old: "data.data.role.toLowerCase() — crashes (data.data is object)", now: "loginResponse.role extracted correctly" },
  { label: "University registration", old: "No OTP — form submitted directly",             now: "Dual OTP (university email + admin email) verified first" },
  { label: "Password storage",        old: "Plain text risk if encoder not wired",         now: "BCrypt @Qualifier('bcryptEncoder') enforced" },
  { label: "History on success",      old: "navigate() — back button returns to confirm",  now: "navigate(replace:true, state:null) — data wiped" },
  { label: "import Link from",        old: "import { Link } from 'useState' — instant crash", now: "import { Link } from 'react-router-dom'" },
];

const FLOW_STEPS = [
  { n:"01", title:"University Registers",    desc:"Platform admin fills university details + domain admin info. Dual OTP verifies both emails before anything is saved." },
  { n:"02", title:"Home Page Loads",         desc:"GET /home_page fetches all universities once. Full objects (name, domain, logo) cached in localStorage." },
  { n:"03", title:"User Selects University", desc:"Dropdown searches cached list — zero API calls. Login and Signup pages read branding from cache." },
  { n:"04", title:"Signup — 3 Steps",        desc:"Step 1: account info + password strength. Step 2: role picker + role-specific fields. Step 3: review." },
  { n:"05", title:"Email Check → OTP",       desc:"Before OTP is sent, GET /check_email verifies the address is free. On pass, POST /otp/send fires." },
  { n:"06", title:"OTP Verified → Account",  desc:"6-box OTP input auto-submits on fill. On verify success, POST /create_* persists the account with BCrypt password." },
  { n:"07", title:"Login → JWT",             desc:"POST /user_login returns LoginResponseDTO with JWT token + role. Token stored; role drives dashboard routing." },
  { n:"08", title:"Dashboard by Role",       desc:"Route /{domain}/{role}/dashboard — each role sees only their permitted data and actions." },
];

// ─── Color maps ───────────────────────────────────────────────────────────────
const BG   = { blue:"bg-blue-50",   green:"bg-green-50",   purple:"bg-purple-50",   orange:"bg-orange-50",   indigo:"bg-indigo-50"   };
const BORD = { blue:"border-blue-200", green:"border-green-200", purple:"border-purple-200", orange:"border-orange-200", indigo:"border-indigo-200" };
const TEXT = { blue:"text-blue-700", green:"text-green-700", purple:"text-purple-700", orange:"text-orange-700", indigo:"text-indigo-700" };
const DOT  = { blue:"bg-blue-500",  green:"bg-green-500",  purple:"bg-purple-500",  orange:"bg-orange-500",  indigo:"bg-indigo-500"  };

// ─── Small reusable components ────────────────────────────────────────────────
function SectionTitle({ tag, title, sub }) {
  return (
    <div className="text-center mb-10">
      <span className="inline-block px-3 py-1 rounded-full bg-blue-100 text-blue-700 text-xs font-bold uppercase tracking-widest mb-3">
        {tag}
      </span>
      <h2 className="text-2xl sm:text-3xl font-extrabold text-gray-900">{title}</h2>
      {sub && <p className="mt-2 text-sm text-gray-500 max-w-xl mx-auto">{sub}</p>}
    </div>
  );
}

function Badge({ color, children }) {
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border ${BG[color]} ${BORD[color]} ${TEXT[color]}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${DOT[color]}`} />
      {children}
    </span>
  );
}

// ─── Architecture comparison tab ──────────────────────────────────────────────
function ArchTable() {
  const [hovRow, setHovRow] = useState(null);
  return (
    <div className="overflow-x-auto rounded-2xl border border-gray-200 shadow-sm">
      <table className="w-full text-sm">
        <thead>
          <tr className="bg-gray-900 text-white">
            <th className="text-left px-5 py-3.5 font-semibold text-xs uppercase tracking-wide w-52">Aspect</th>
            <th className="text-left px-5 py-3.5 font-semibold text-xs uppercase tracking-wide">
              <span className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-red-400 inline-block" />Old Architecture
              </span>
            </th>
            <th className="text-left px-5 py-3.5 font-semibold text-xs uppercase tracking-wide">
              <span className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-green-400 inline-block" />New Architecture
              </span>
            </th>
          </tr>
        </thead>
        <tbody>
          {OLD_ARCH.map((row, i) => (
            <tr
              key={i}
              onMouseEnter={() => setHovRow(i)}
              onMouseLeave={() => setHovRow(null)}
              className={`border-t border-gray-100 transition-colors ${hovRow === i ? "bg-blue-50" : i % 2 === 0 ? "bg-white" : "bg-gray-50"}`}
            >
              <td className="px-5 py-3.5 font-semibold text-gray-700 text-xs align-top">{row.label}</td>
              <td className="px-5 py-3.5 text-red-700 align-top">
                <span className="flex items-start gap-2">
                  <span className="mt-0.5 text-red-400 shrink-0">✗</span>{row.old}
                </span>
              </td>
              <td className="px-5 py-3.5 text-green-700 align-top">
                <span className="flex items-start gap-2">
                  <span className="mt-0.5 text-green-500 shrink-0">✓</span>{row.now}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// ─── API endpoint map ─────────────────────────────────────────────────────────
const ENDPOINTS = [
  { method:"GET",  path:"/home_page",                      desc:"All universities (name, domain, logo) for the home dropdown" },
  { method:"POST", path:"/home_page/validate_before_otp",  desc:"Uniqueness check for university + domain admin before OTPs are sent" },
  { method:"POST", path:"/home_page/register_university",  desc:"Persist university + domain admin (called after dual OTP verified)" },
  { method:"GET",  path:"/{domain}/signup",                desc:"University branding for signup page (fallback when cache empty)" },
  { method:"GET",  path:"/{domain}/signup/check_email",    desc:"Verify email is not already registered before sending OTP" },
  { method:"POST", path:"/{domain}/signup/create_student", desc:"Create student account (called after OTP verified)" },
  { method:"POST", path:"/{domain}/signup/create_faculty", desc:"Create faculty account (called after OTP verified)" },
  { method:"POST", path:"/{domain}/signup/create_subAdmin",desc:"Create sub admin account (called after OTP verified)" },
  { method:"POST", path:"/otp/send",                       desc:"Send a 6-digit OTP to the given email address" },
  { method:"POST", path:"/otp/verify",                     desc:"Verify the OTP submitted by the user" },
  { method:"GET",  path:"/{domain}/login_profile",         desc:"University branding for login page (fallback when cache empty)" },
  { method:"POST", path:"/{domain}/login_profile/user_login", desc:"Authenticate any role — returns JWT + LoginResponseDTO" },
];

const METHOD_STYLE = {
  GET:  "bg-green-100 text-green-700 border border-green-200",
  POST: "bg-blue-100 text-blue-700 border border-blue-200",
};

// ═══════════════════════════════════════════════════════════════════════════════
export default function About() {
  return (
    <div className="min-h-screen bg-gray-50 font-sans">

      {/* ── HERO ──────────────────────────────────────────────────────────────── */}
      <div className="bg-gradient-to-br from-gray-900 via-blue-950 to-gray-900 text-white px-4 py-20 text-center relative overflow-hidden">
        {/* subtle grid bg */}
        <div className="absolute inset-0 opacity-5"
          style={{ backgroundImage:"linear-gradient(#fff 1px,transparent 1px),linear-gradient(90deg,#fff 1px,transparent 1px)", backgroundSize:"40px 40px" }} />

        <div className="relative max-w-3xl mx-auto">
          <div className="flex justify-center mb-6">
            <img src="/Logo.png" alt="Logo" className="h-16 object-contain drop-shadow-lg" />
          </div>
          <h1 className="text-4xl sm:text-5xl font-extrabold mb-4 leading-tight">
            Digital Education<br />
            <span className="text-blue-400">Records Platform</span>
          </h1>
          <p className="text-blue-200 text-base sm:text-lg max-w-xl mx-auto leading-relaxed">
            A multi-tenant university management system — one platform, unlimited institutions,
            four roles, zero paper records.
          </p>
          <div className="flex flex-wrap justify-center gap-3 mt-8">
            <Badge color="blue">React + Vite</Badge>
            <Badge color="green">Spring Boot 3</Badge>
            <Badge color="purple">JWT Auth</Badge>
            <Badge color="orange">OTP Verification</Badge>
            <Badge color="indigo">Multi-tenant</Badge>
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 py-16 space-y-24">

        {/* ── WHAT IS THIS PROJECT ────────────────────────────────────────────── */}
        <section>
          <SectionTitle tag="Overview" title="What is this platform?" />
          <div className="grid sm:grid-cols-3 gap-5">
            {[
              { icon:"🏫", title:"Multi-University",   desc:"Any number of universities can register on the same platform, each isolated by a unique domain slug (e.g. /iitd, /bits)." },
              { icon:"🔐", title:"Secure by Design",   desc:"BCrypt passwords, JWT tokens, Spring Security filters, email OTP verification, and role-based access control on every endpoint." },
              { icon:"⚡", title:"Zero Redundant Calls",desc:"University branding is fetched once on the Home page and stored in localStorage. Login, Signup, and Confirm pages read from cache with zero extra API calls." },
            ].map(c => (
              <div key={c.title} className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
                <div className="text-4xl mb-4">{c.icon}</div>
                <h3 className="font-bold text-gray-800 mb-2">{c.title}</h3>
                <p className="text-sm text-gray-500 leading-relaxed">{c.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* ── USER ROLES ──────────────────────────────────────────────────────── */}
        <section>
          <SectionTitle tag="Roles" title="Four user roles" sub="Each role has a scoped login, dedicated dashboard, and a different set of permissions." />
          <div className="grid sm:grid-cols-2 gap-4">
            {ROLES.map(r => (
              <div key={r.role} className={`rounded-2xl border p-5 ${BG[r.color]} ${BORD[r.color]}`}>
                <div className="flex items-center gap-3 mb-2">
                  <span className="text-3xl">{r.icon}</span>
                  <span className={`font-extrabold text-base ${TEXT[r.color]}`}>{r.role}</span>
                </div>
                <p className="text-sm text-gray-600 leading-relaxed">{r.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* ── TECH STACK ──────────────────────────────────────────────────────── */}
        <section>
          <SectionTitle tag="Tech Stack" title="Built with" />
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {TECH_STACK.map(t => (
              <div key={t.category} className={`rounded-2xl border p-5 ${BG[t.color]} ${BORD[t.color]}`}>
                <p className={`text-xs font-bold uppercase tracking-widest mb-3 ${TEXT[t.color]}`}>{t.category}</p>
                <ul className="space-y-1.5">
                  {t.items.map(item => (
                    <li key={item} className="flex items-center gap-2 text-sm text-gray-700">
                      <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${DOT[t.color]}`} />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </section>

        {/* ── REQUEST FLOW ────────────────────────────────────────────────────── */}
        <section>
          <SectionTitle tag="User Journey" title="End-to-end flow" sub="From university registration to a student logging in — every step explained." />
          <div className="relative">
            {/* vertical line */}
            <div className="absolute left-8 top-0 bottom-0 w-0.5 bg-gray-200 hidden sm:block" />
            <div className="space-y-4">
              {FLOW_STEPS.map((s, i) => (
                <div key={s.n} className="flex gap-5 items-start">
                  <div className="relative z-10 w-16 h-16 shrink-0 rounded-2xl bg-blue-600 text-white flex flex-col items-center justify-center shadow-md">
                    <span className="text-[10px] font-bold text-blue-200 leading-none">{s.n}</span>
                    <span className="text-lg leading-none mt-0.5">{["🏛️","🏠","🔍","📝","📧","✅","🔑","📊"][i]}</span>
                  </div>
                  <div className="flex-1 bg-white rounded-2xl border border-gray-200 shadow-sm px-5 py-4">
                    <h4 className="font-bold text-gray-800 text-sm mb-1">{s.title}</h4>
                    <p className="text-xs text-gray-500 leading-relaxed">{s.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── OLD vs NEW ARCHITECTURE ─────────────────────────────────────────── */}
        <section>
          <SectionTitle
            tag="Architecture Evolution"
            title="Old vs New — what changed and why"
            sub="Every breaking bug, security gap, and performance issue we found and fixed during development."
          />

          {/* summary cards */}
          <div className="grid sm:grid-cols-2 gap-5 mb-8">
            <div className="bg-red-50 border border-red-200 rounded-2xl p-6">
              <div className="flex items-center gap-2 mb-4">
                <span className="w-3 h-3 rounded-full bg-red-500" />
                <h3 className="font-extrabold text-red-700 text-sm uppercase tracking-wide">Old Architecture</h3>
              </div>
              <ul className="space-y-2 text-sm text-red-800">
                {[
                  "Single-page form → direct account creation, no verification",
                  "University logo/name fetched on every page mount (3× API calls)",
                  "RuntimeException from service = HTML 500 page sent to frontend",
                  "Link imported from React instead of react-router-dom → instant crash",
                  "data.data.role on a string → TypeError crash on login",
                  "localStorage.setItem('role', object) → stored '[object Object]'",
                  "useEffect deps written as [domain], API_BASE → deps silently ignored",
                  "No email check before OTP — wasted quota on duplicate emails",
                  "Back button after signup returned to form with old data still loaded",
                ].map(t => (
                  <li key={t} className="flex items-start gap-2">
                    <span className="text-red-400 mt-0.5 shrink-0">✗</span>{t}
                  </li>
                ))}
              </ul>
            </div>

            <div className="bg-green-50 border border-green-200 rounded-2xl p-6">
              <div className="flex items-center gap-2 mb-4">
                <span className="w-3 h-3 rounded-full bg-green-500" />
                <h3 className="font-extrabold text-green-700 text-sm uppercase tracking-wide">New Architecture</h3>
              </div>
              <ul className="space-y-2 text-sm text-green-800">
                {[
                  "3-step wizard: account info → role & details → review",
                  "Email check (GET /check_email) gating OTP send — no wasted quota",
                  "OTP verified in-browser before any account is persisted",
                  "Home page caches full university objects in localStorage once",
                  "Login/Signup read from cache; fetch only on cold cache miss",
                  "All controller create methods wrapped in try-catch → JSON 409",
                  "navigate(replace:true, state:null) wipes history + data on success",
                  "Dual OTP for university registration (university + admin emails)",
                  "Correct role extraction: loginResponse.role (string, not object)",
                ].map(t => (
                  <li key={t} className="flex items-start gap-2">
                    <span className="text-green-500 mt-0.5 shrink-0">✓</span>{t}
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <ArchTable />
        </section>

        {/* ── BACKEND ARCHITECTURE ────────────────────────────────────────────── */}
        <section>
          <SectionTitle tag="Backend" title="Spring Boot layer architecture" />
          <div className="grid sm:grid-cols-3 gap-4 mb-8">
            {[
              { layer:"Controller", color:"blue", icon:"🌐",
                items:["Home (university register)", "SignUp (/{domain}/signup)", "Login (/{domain}/login_profile)", "OTP Controller"] },
              { layer:"Service",    color:"green", icon:"⚙️",
                items:["UniversityService", "StudentService", "FacultyService", "SubAdminService", "BaseUserService"] },
              { layer:"Repository", color:"purple", icon:"🗄️",
                items:["UniversityRepo", "StudentRepository", "FacultyRepository", "SubAdminRepository", "DomainAdminRepository"] },
            ].map(l => (
              <div key={l.layer} className={`rounded-2xl border p-5 ${BG[l.color]} ${BORD[l.color]}`}>
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-2xl">{l.icon}</span>
                  <span className={`font-extrabold text-sm ${TEXT[l.color]}`}>{l.layer} Layer</span>
                </div>
                <ul className="space-y-1.5">
                  {l.items.map(i => (
                    <li key={i} className={`text-xs font-medium px-2.5 py-1.5 rounded-lg border ${BG[l.color]} ${BORD[l.color]} ${TEXT[l.color]}`}>
                      {i}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          {/* Entity map */}
          <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
            <h3 className="font-extrabold text-gray-800 mb-4 text-sm uppercase tracking-wide">📦 Entity Relationships</h3>
            <div className="flex flex-wrap gap-3 items-center text-sm">
              {[
                { name:"University",  note:"1 per domain", color:"indigo" },
                { name:"DomainAdmin", note:"1 per university", color:"purple" },
                { name:"SubAdmin",    note:"N per university", color:"orange" },
                { name:"Faculty",     note:"N per university", color:"green" },
                { name:"Student",     note:"N per university", color:"blue" },
              ].map((e, i, arr) => (
                <span key={e.name} className="flex items-center gap-2">
                  <span className={`px-3 py-2 rounded-xl border font-semibold ${BG[e.color]} ${BORD[e.color]} ${TEXT[e.color]}`}>
                    {e.name}
                    <span className="block text-xs font-normal opacity-70">{e.note}</span>
                  </span>
                  {i < arr.length - 1 && <span className="text-gray-400 font-bold">→</span>}
                </span>
              ))}
            </div>
            <p className="mt-4 text-xs text-gray-400">
              All entities share <strong>domain</strong> as a discriminator column — every query is scoped by domain, ensuring complete data isolation between universities.
            </p>
          </div>
        </section>

        {/* ── API ENDPOINTS ───────────────────────────────────────────────────── */}
        <section>
          <SectionTitle tag="API Reference" title="REST endpoints" sub="Public endpoints available before authentication. All others require a valid JWT." />
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
            {ENDPOINTS.map((ep, i) => (
              <div key={ep.path}
                className={`flex items-start gap-4 px-5 py-3.5 ${i !== ENDPOINTS.length - 1 ? "border-b border-gray-100" : ""} hover:bg-gray-50 transition-colors`}>
                <span className={`shrink-0 mt-0.5 px-2 py-0.5 rounded text-xs font-bold font-mono ${METHOD_STYLE[ep.method]}`}>
                  {ep.method}
                </span>
                <code className="text-xs text-gray-600 font-mono shrink-0 pt-0.5 min-w-[260px]">{ep.path}</code>
                <span className="text-xs text-gray-500 leading-relaxed">{ep.desc}</span>
              </div>
            ))}
          </div>
        </section>

        {/* ── SECURITY FLOW ───────────────────────────────────────────────────── */}
        <section>
          <SectionTitle tag="Security" title="Authentication & security layers" />
          <div className="grid sm:grid-cols-2 gap-4">
            {[
              { icon:"🔒", title:"Password Security",      color:"blue",
                points:["BCrypt hashing via @Qualifier('bcryptEncoder')","Never stored or logged in plain text","Password field masked in Review UI with eye toggle"] },
              { icon:"📧", title:"OTP Flow",               color:"green",
                points:["Email availability checked BEFORE OTP is sent","60-second resend cooldown prevents abuse","Auto-submits on fill (paste or type) — no button needed"] },
              { icon:"🪙", title:"JWT Authentication",     color:"purple",
                points:["Token returned in LoginResponseDTO on successful login","credentials: 'include' on all authenticated requests","Role extracted from token for dashboard routing"] },
              { icon:"🏰", title:"Domain Isolation",       color:"orange",
                points:["Every entity has a domain field","All queries scoped by domain — no cross-university data leaks","Domain Admin owns their university; Sub Admin scoped to department"] },
            ].map(s => (
              <div key={s.title} className={`rounded-2xl border p-5 ${BG[s.color]} ${BORD[s.color]}`}>
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-2xl">{s.icon}</span>
                  <span className={`font-extrabold text-sm ${TEXT[s.color]}`}>{s.title}</span>
                </div>
                <ul className="space-y-1.5">
                  {s.points.map(p => (
                    <li key={p} className="text-xs text-gray-700 flex items-start gap-2">
                      <span className={`mt-0.5 shrink-0 ${TEXT[s.color]}`}>•</span>{p}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </section>

        {/* ── FRONTEND ARCHITECTURE ───────────────────────────────────────────── */}
        <section>
          <SectionTitle tag="Frontend" title="React page architecture" />
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
            {[
              { page:"Home.jsx",          route:"/",                          desc:"Fetches + caches all universities. Search dropdown. Routes to login or signup." },
              { page:"Login.jsx",         route:"/{domain}/login",            desc:"Reads branding from cache. Authenticates user. Extracts role from LoginResponseDTO." },
              { page:"Signup.jsx",        route:"/{domain}/signup",           desc:"Step 1 (account info) + Step 2 (role & details). Navigates to confirm with state." },
              { page:"SignupConfirm.jsx", route:"/{domain}/signup/confirm",   desc:"Step 3. Review → check_email → send OTP → verify → create account." },
              { page:"OtpVerification",   route:"Service component",          desc:"Reusable 6-box OTP input. Auto-submits on fill. Paste support. 60s resend timer." },
              { page:"UniversityRegister",route:"/homePage/university-register", desc:"Full wizard: 11-field university form + domain admin + logo upload + dual OTP." },
            ].map((p, i) => (
              <div key={p.page}
                className={`flex flex-wrap sm:flex-nowrap items-start gap-4 px-5 py-3.5 ${i !== 5 ? "border-b border-gray-100" : ""} hover:bg-gray-50 transition-colors`}>
                <code className="text-xs font-bold text-blue-700 bg-blue-50 px-2 py-1 rounded shrink-0">{p.page}</code>
                <code className="text-xs text-gray-500 font-mono shrink-0 min-w-[220px]">{p.route}</code>
                <span className="text-xs text-gray-500 leading-relaxed">{p.desc}</span>
              </div>
            ))}
          </div>

          {/* localStorage strategy */}
          <div className="mt-5 bg-indigo-50 border border-indigo-200 rounded-2xl p-5">
            <h4 className="font-extrabold text-indigo-700 text-sm mb-3">💾 localStorage Cache Strategy</h4>
            <div className="grid sm:grid-cols-3 gap-4 text-xs text-indigo-900">
              <div>
                <p className="font-bold mb-1">Key: <code>universities_cache</code></p>
                <p className="text-indigo-700">Written by Home.jsx after GET /home_page. Contains full objects with name, domain, logo, domainEmailId.</p>
              </div>
              <div>
                <p className="font-bold mb-1">Read by</p>
                <p className="text-indigo-700">Login.jsx and Signup.jsx on mount. Finds university by domain slug — zero API calls for branding.</p>
              </div>
              <div>
                <p className="font-bold mb-1">Fallback</p>
                <p className="text-indigo-700">If key missing (direct URL / hard refresh), each page falls back to its own API call before proceeding.</p>
              </div>
            </div>
          </div>
        </section>

        {/* ── FOOTER CTA ──────────────────────────────────────────────────────── */}
        <section className="text-center pb-4">
          <div className="bg-gradient-to-br from-gray-900 to-blue-950 rounded-3xl p-12 text-white">
            <h2 className="text-2xl sm:text-3xl font-extrabold mb-3">Ready to get started?</h2>
            <p className="text-blue-300 text-sm mb-8 max-w-md mx-auto">
              Register your university and start managing students, faculty, and academic records digitally.
            </p>
            <div className="flex flex-wrap gap-4 justify-center">
              <Link to="/homePage/university-register"
                className="px-6 py-3 bg-blue-500 hover:bg-blue-400 text-white rounded-xl font-semibold text-sm transition shadow-lg">
                + Register University
              </Link>
              <Link to="/"
                className="px-6 py-3 bg-white/10 hover:bg-white/20 text-white rounded-xl font-semibold text-sm transition border border-white/20">
                ← Back to Home
              </Link>
            </div>
          </div>
        </section>

      </div>
    </div>
  );
}
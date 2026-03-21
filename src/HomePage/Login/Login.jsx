import { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { Eye, EyeOff } from "lucide-react";
import '../SignupLogin.css'

const API_BASE = import.meta.env.VITE_API_BASE_URL;
const UNI_CACHE_KEY = "universities_cache"; // same key written by Home.jsx

const platformLogo = "/Logo.png";
const univLogo = "/defaultUniversity.png";

export default function Login() {

    const { domain } = useParams();
    const navigate = useNavigate();

    // ── University branding ────────────────────────────────────────────────────
    const [universityName, setUniversityName] = useState("");
    const [universityLogoPath, setUniversityLogoPath] = useState("");

  // ── Form state ─────────────────────────────────────────────────────────────
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    // ✅ FIX 1: No API call needed — read from the cache Home.jsx already wrote.
    //    Falls back to a fetch only when the cache is missing (direct URL / hard refresh).
    useEffect(() => {
        if (!domain) return;

        const loadFromCache = () => {
            try {
                const cached = JSON.parse(localStorage.getItem(UNI_CACHE_KEY) || "[]");
                const uni = cached.find((u) => u.domain === domain);
                if (uni) {
                    setUniversityName(uni.universityName || "");
                    setUniversityLogoPath(uni.universityLogoPath || "");
                    return true;
                }
            } catch { }
            return false;
        };

        if (!loadFromCache()) {
            // Cache miss — fetch just this university's profile
            fetch(`${API_BASE}/${domain}/login_profile`)
                .then((res) => { if (!res.ok) throw new Error(); return res.json(); })
                .then((data) => {
                    setUniversityName(data.universityName || "");
                    setUniversityLogoPath(data.universityLogoPath || "");
                })
                .catch(() => navigate("/"));
        }
    }, [domain, navigate]);

  // ── Submit ─────────────────────────────────────────────────────────────────
    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!email || !password) { setError("All fields are required"); return; }
        if (!email.includes("@")) { setError("Enter a valid email"); return; }
        if (password.length < 8) { setError("Password must be at least 8 characters"); return; }

        setError("");
        setLoading(true);

        try {
            const response = await fetch(`${API_BASE}/${domain}/login_profile/user_login`, {
                method: "POST", 
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email, password }),
            });

// const contentType = res.headers.get("content-type") ?? "";
// const data = contentType.includes("application/json") ? await res.json() : {};
const data = await response.json();
            if (!response.ok || !data.success) {
                throw new Error(data.message || "Login failed");
            }

  // ✅ FIX 2: data.data is LoginResponseDTO object; extract the role string from it.
      //    Original code did localStorage.setItem("role", object) → "[object Object]"
      //    and then crashed on data.data.role (was treating data.data as a string).

            const { token, role } = data.data;
            // Save session
            localStorage.setItem("token", token);
            localStorage.setItem("role", role);

            alert("Login successful 🎉 " + "role : " + localStorage.getItem("role"));

            // Redirect based on role
            const rolePath = data.data.role.toLowerCase().replace('_', '');
            navigate(`/${domain}/${rolePath}/dashboard`);

        } catch (err) {
            alert(`User Not Found. ${err.message}` || "Server error. Try again later.")
            setError(err.message || "Server error. Try again later.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="container">
 {/* Logos + title */}
      <div className="flex items-center gap-4 ">
        <img src="/Logo.png" alt="Platform" className="h-48 object-contain" />
        <span className="text-gray-300 text-2xl">↔</span>
        <img
          src={universityLogoPath ? `${API_BASE}/${universityLogoPath}` : "/defaultUniversity.png"}
          alt=""
          className="h-32 object-contain rounded-full border border-gray-200 shadow-sm"
        />
      </div>
      <h1 className="text-lg font-bold text-gray-700 text-center mb-1">
        Digital Education Records
        {universityName && <> ↔ <span className="text-blue-600">{universityName}</span></>}
      </h1>

            <h2>Login</h2>
            <form onSubmit={handleSubmit} className="card">
                {error && <p className="error">{error}</p>}
                <input type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} autoComplete="username" required />

                <div className="password-wrapper">
                    <input type={showPassword ? "text" : "password"} placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} autoComplete="current-password" required />
                    <span
                        onClick={() => setShowPassword(!showPassword)}>
                        {showPassword ? <EyeOff size={30} /> : <Eye size={30} />}
                    </span>
                </div>
                <button className="btn" type="submit" disabled={loading}>
                    {loading ? "Processing..." : "Login"}
                </button>
                <p>Don't have an account? <Link to={`/${domain}/signup`}>Signup</Link></p>
            </form>
        </div>
    );
}













// import { useEffect, useState } from "react";
// import { useParams, useNavigate, Link } from "react-router-dom";
// import { Eye, EyeOff } from "lucide-react";
// import '../SignupLogin.css'


// export default function Login() {
//     const API_BASE = import.meta.env.VITE_API_BASE_URL;

//     const platformLogo = "/Logo.png";
//     const univLogo = "/defaultUniversity.png";


//     const { domain } = useParams();
//     const navigate = useNavigate();

//     const [universityName, setUniversityName] = useState("");
//     const [universityLogoPath, setUniversityLogoPath] = useState("");


//     const [email, setEmail] = useState("");
//     const [password, setPassword] = useState("");
//     const [showPassword, setShowPassword] = useState(false);
//     const [error, setError] = useState("");
//     const [loading, setLoading] = useState(false);

//     useEffect(() => {
//         if (!domain) return;

//         const fetchUniversity = async () => {
//             try {
//                 const res = await fetch(`${API_BASE}/${domain}/login_profile`);

//                 if (!res.ok) {
//                     throw new Error("University not found");
//                 }

//                 const data = await res.json();
//                 setUniversityName(data.universityName || "");
//                 setUniversityLogoPath(data.universityLogoPath || "");

//             } catch (err) {
//                 alert(`Error fetching university: ${err.message}`);
//                 navigate("/");
//             }
//         };

//         fetchUniversity();

//     }, [domain]);



//     const handleSubmit = async (e) => {
//         e.preventDefault();
//         if (!email || !password) { setError("All fields are required"); return; }
//         if (!email.includes("@")) { setError("Enter a valid email"); return; }
//         if (password.length < 8) { setError("Password must be at least 8 characters"); return; }

//         setError("");
//         setLoading(true);

//         try {
//             const response = await fetch(`${API_BASE}/${domain}/login_profile/user_login`, {
//                 method: "POST",
//                 headers: { "Content-Type": "application/json" },
//                 body: JSON.stringify({ email, password }),
//             });
            
//             const data = await response.json();

//             if (!response.ok || !data.success) {
//                 throw new Error(data.message || "Login failed");
//             }

//             const { token, role } = data.data;
//             // Save session
//             localStorage.setItem("token", token);
//             localStorage.setItem("role", role);

//             alert("Login successful 🎉 " +"role : " + localStorage.getItem("role"));

//             // Redirect based on role
//             const rolePath = data.data.role.toLowerCase().replace('_', '');
//             navigate(`/${domain}/${rolePath}/dashboard`);

//         } catch (err) {
//             alert(`User Not Found. ${err.message}` || "Server error. Try again later.")
//             setError(err.message || "Server error. Try again later.");
//         } finally {
//             setLoading(false);
//         }
//     };

//     return (
//         <div className="container">
//             <h1 className="title">Digital Education Records ↔️ {universityName} </h1>

//             <div className="login_Signup_Logo-container">
//                 <img src={platformLogo} alt="Platform Logo" />
//                 ↔️
//                 <img  src={(universityLogoPath) ? universityLogoPath : `${univLogo}`} alt="University Logo" />
//             </div>

//             <h2>Login</h2>
//             <form onSubmit={handleSubmit} className="card">
//                 {error && <p className="error">{error}</p>}
//                 <input type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} autoComplete="username" required />

//                 <div className="password-wrapper">
//                     <input type={showPassword ? "text" : "password"} placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)}  autoComplete="current-password" required />
//                     <span
//                         onClick={() => setShowPassword(!showPassword)}>
//                         {showPassword ? <EyeOff size={30} /> : <Eye size={30} />}
//                     </span>
//                 </div>
//                 <button className="btn" type="submit" disabled={loading}>
//                     {loading ? "Processing..." : "Login"}
//                 </button>
//                 <p>Don't have an account? <Link to={`/${domain}/signup`}>Signup</Link></p>
//             </form>
//         </div>
//     );
// }






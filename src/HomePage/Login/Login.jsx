import { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { Eye, EyeOff } from "lucide-react";
import '../SignupLogin.css'


export default function Login() {
    const API_BASE = import.meta.env.VITE_API_BASE_URL;

    const platformLogo = "/Logo.png";
    const univLogo = "/defaultUniversity.png";


    const { domain } = useParams();
    const navigate = useNavigate();
    const university = JSON.parse(localStorage.getItem("universityNameDomainLogo") || "{}");
    console.log(university)


    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (university.domain !== domain) {
            alert(`Error fetching university. Please select a university from dropdown `);
            navigate("/");
            return;
        }
    }, [domain, navigate]);

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

            const data = await response.json();

            if (!response.ok || !data.success) {
                throw new Error(data.message || "Login failed");
            }

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
            <h1 className="title">DERP ↔️ {university.name} </h1>

            <div className="login_Signup_Logo-container">
                <img src={platformLogo} alt="Platform Logo" />
                ↔️
                <img src={`${API_BASE}/${university.logo}`} alt={`${university.name}'s Logo`} />
            </div>

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






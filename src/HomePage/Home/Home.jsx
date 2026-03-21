import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../../Components/Navbar/Navbar";
import Footer from "../../Components/Footer/footer";
import "./Home.css";

const API_BASE = import.meta.env.VITE_API_BASE_URL;

// ── localStorage key used by Login.jsx and Signup.jsx too ─────────────────────
export const UNI_CACHE_KEY = "universities_cache";

const Home = () => {

    const [universities, setUniversities] = useState([]);
    const [search, setSearch] = useState("");
    const navigate = useNavigate();
    const [showDropdown, setShowDropdown] = useState(false);
    const [loading, setLoading] = useState(true);
    const wrapperRef = useRef(null);


    // ✅ Seed from cache immediately, then refresh in background ─────────────────
    useEffect(() => {
        const cached = localStorage.getItem(UNI_CACHE_KEY);
        if (cached) {
            setUniversities(JSON.parse(cached));
        }

        fetch(`${API_BASE}/home_page`)
            .then((res) => {
                if (!res.ok) throw new Error("Failed to load universities");
                return res.json();
            })
            .then((data) => {
                const sorted = [...data].sort((a, b) =>
                    (a.universityName || "").localeCompare(b.universityName || "")
                );
                setUniversities(sorted);
                // ✅ FIX: store FULL objects (universityName, domain, universityLogoPath,
                //         domainEmailId) so Login & Signup can skip their own API calls.
                localStorage.setItem(UNI_CACHE_KEY, JSON.stringify(sorted));
            })
            .catch((err) => {
                console.error(err);
                if (!localStorage.getItem(UNI_CACHE_KEY)) {
                    alert("Error loading universities. Please refresh.");
                }
            })
            .finally(() => setLoading(false));
    }, []);

    // ── Close dropdown on outside click ─────────────────────────────────────────
    useEffect(() => {
        const handler = (e) => {
            if (wrapperRef.current && !wrapperRef.current.contains(e.target)) {
                setShowDropdown(false);
            }
        };
        document.addEventListener("mousedown", handler);
        return () => document.removeEventListener("mousedown", handler);
    }, []);

    // ✅ Filter dropdown
    const filteredUniversities = universities.filter((uni) =>
        uni.universityName.toLowerCase().includes(search.toLowerCase())
    );

    // ✅ Find selected university from search text
    const selectedUni = universities.find(
        (uni) => uni.universityName === search
    );
    const handleSelect = (uni) => {
        setSearch(uni.universityName);
        setShowDropdown(false);
    };

    const handleLogin = () => {
        if (!selectedUni) {
            alert("Please select a university from dropdown");
            return;
        }
        navigate(`/${selectedUni.domain}/login`);
    };

    const handleSignup = () => {
        if (!selectedUni) {
            alert("Please select a university from dropdown");
            return;
        }
        navigate(`/${selectedUni.domain}/signup`);
    };


    return (
        // <>
        <div className="min-h-screen flex flex-col ">

            <Navbar />

            {/* ── Hero ────────────────────────────────────────────────────────────── */}
            <div className="home-container ">
                {/* Background Logo */}
                <div className="background-logo"></div>

                <div className="logoTitle">
                    {/* Top Logo */}
                    <img src="/Logo.png" alt="Platform Logo" className="top-logo" />

                    <h1 className="home-title">
                        <span className="blue">Digital</span>{" "}
                        <span className="red">Education</span>{" "}
                        <span className="yellow">Records</span>{" "}
                        <span className="green">Platform</span>
                    </h1>
                </div>

                {loading && (
                    <div className="loading-overlay">
                        <div className="spinner"></div>
                        <p className="loading-text">
                            Loading Universities... Please wait...
                        </p>
                    </div>
                )}

                {/* ── Search + dropdown ──────────────────────────────────────────────── */}
                <div ref={wrapperRef} >
                    <input
                        type="text"
                        placeholder="Search University / Institute / College"
                        className="search-input"
                        value={search}
                        disabled={loading}
                        onFocus={() => setShowDropdown(true)}
                        onChange={(e) => {
                            setSearch(e.target.value);
                            setShowDropdown(true);
                        }}
                    />

                    {showDropdown && (
                        <div className="dropdown">
                            {(search ? filteredUniversities : universities).map((uni) => (
                                <div
                                    key={uni.domain}
                                    className="dropdown-item"
                                    onClick={() => handleSelect(uni)}
                                >
                                    {uni.universityName}

                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* ── Login / Signup buttons ─────────────────────────────────────────── */}
                <div >
                    <button className="primary-btn" onClick={handleLogin}
                        disabled={loading || !selectedUni}>
                        Login
                    </button>
                    <button className="primary-btn" onClick={handleSignup}
                        disabled={loading || !selectedUni}>
                        Signup
                    </button>
                </div>

                <button
                    className="create-btn"
                    onClick={() => navigate("/homePage/university-register")}
                >
                    + Create University
                </button>
            </div>




            {/* ── Stats Strip ── */}
            <div className="grid grid-cols-3 gap-4  w-full max-w-lg fade-up fade-up-5 m-auto">
                {[
                    { num: universities.length || "—", label: "Universities", color: "#4285F4" },
                    { num: "24 / 7", label: "Availability", color: "#34A853" },
                    { num: "100%", label: "Secure", color: "#EA4335" },
                ].map(({ num, label, color }) => (
                    <div key={label}
                        className="stat-card flex flex-col items-center justify-center py-5 px-3
                              rounded-2xl bg-white dark:bg-[#181818]
                              border border-gray-100 dark:border-gray-800
                              shadow-sm cursor-default select-none">
                        <span className="text-2xl sm:text-3xl font-extrabold leading-none mb-1"
                            style={{ color }}>
                            {num}
                        </span>
                        <span className="text-[10px] font-bold tracking-widest uppercase
                                 text-gray-400 dark:text-gray-500">
                            {label}
                        </span>
                    </div>
                ))}
            </div>

            {/* /* {Trust badges} */}
            <div className="flex flex-wrap justify-center gap-3 mt-8 fade-up fade-up-5 m-auto">
                {["ISO Certified", "256-bit Encryption", "GDPR Ready"].map((badge) => (
                    <span key={badge}
                        className="flex items-center gap-1.5 text-xs font-medium px-3 py-1.5
                               rounded-full bg-gray-50 dark:bg-gray-800
                               text-gray-500 dark:text-gray-400
                               border border-gray-200 dark:border-gray-700">
                        <svg className="w-3 h-3 text-[#34A853]" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd"
                                d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                                clipRule="evenodd" />
                        </svg>
                        {badge}
                    </span>
                ))}
            </div>



            <Footer />
        </div>
    );
};


export default Home;
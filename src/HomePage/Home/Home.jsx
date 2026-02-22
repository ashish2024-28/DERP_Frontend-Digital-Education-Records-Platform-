import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../../Components/Navbar/Navbar";
import Footer from "../../Components/Footer/footer";
import "./Home.css";

const API_BASE = import.meta.env.VITE_API_BASE_URL;
const Logo = "/Logo.png"

const Home = () => {
    const [universities, setUniversities] = useState([]);
    const [search, setSearch] = useState("");
    const navigate = useNavigate();
    const [showDropdown, setShowDropdown] = useState(false);
    const [loading, setLoading] = useState(true);

    // ✅ Fetch all universities when home loads
    useEffect(() => {
        const cached = localStorage.getItem("universities");
        if (cached) {
            setUniversities(JSON.parse(cached));
        }

        fetch(`${API_BASE}/home_page`)
            .then(res => res.json())
            .then(data => {
                const sorted = data.sort((a, b) =>
                    a.universityName.localeCompare(b.universityName)
                );
                setUniversities(sorted);
                setLoading(false);
            })
            .catch(err => {
                alert("Error fetching universities. Try again.");
                console.error(err);
                setLoading(false);
            });
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
        <>
            <Navbar />

            <div className="home-container">
                {/* Background Logo */}
                <div className="background-logo"></div>

                <div className="logoTitle">
                    {/* Top Logo */}
                    <img src={Logo} alt="Platform Logo" className="top-logo" />

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

                <div className="search-wrapper">
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

                <div className="button-group">
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

            <Footer />
        </>
    );
};

const styles = {
    container: {
        textAlign: "center",
        marginTop: "120px",
    },
    title: {
        fontSize: "48px",
        fontWeight: "bold",
    },
    search: {
        width: "100%",
        padding: "15px",
        borderRadius: "30px",
        border: "1px solid #ccc",
        fontSize: "16px",
    },
    dropdown: {
        position: "absolute",
        width: "100%",
        background: "white",
        border: "1px solid #ddd",
        borderRadius: "10px",
        marginTop: "5px",
        maxHeight: "200px",
        overflowY: "auto",
        zIndex: 1000,
    },
    dropdownItem: {
        padding: "10px",
        cursor: "pointer",
        display: "flex",
        alignItems: "center",
    },
    btn: {
        margin: "15px",
        padding: "10px 25px",
        borderRadius: "20px",
        border: "none",
        background: "#4285F4",
        color: "white",
        cursor: "pointer",
    },
    createBtn: {
        marginTop: "40px",
        padding: "12px 30px",
        background: "#34A853",
        border: "none",
        borderRadius: "25px",
        color: "white",
        cursor: "pointer",
    },
};

export default Home;
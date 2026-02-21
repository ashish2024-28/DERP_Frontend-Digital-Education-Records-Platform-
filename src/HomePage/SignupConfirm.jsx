import { useLocation, useNavigate, useParams } from "react-router-dom";
import { useState, Link } from "react";
import "./Signup.css";


export default function SignupConfirm() {

    const API_BASE = import.meta.env.VITE_API_BASE_URL;


    const { domain } = useParams();
    const navigate = useNavigate();
    const location = useLocation();

    const { userData, role } = location.state || {};
    const [checked, setChecked] = useState(false);
    const [loading, setLoading] = useState(false);

    if (!userData) {
        return (
        <>
        <h2>No Data Found! </h2>;
        <h3>Go to <Link to={`/${domain}/signup`}>Signup</Link></h3>
        </>

        );
    }

    const handleFinalSubmit = async () => {

        if (!checked) {
            return alert("Please confirm information");
        }

        setLoading(true);

        let apiEndpoint = "";
        if (role === "STUDENT") apiEndpoint = `/${domain}/signup/create_student`;
        else if (role === "FACULTY") apiEndpoint = `/${domain}/signup/create_faculty`;
        else if (role === "SUB_ADMIN") apiEndpoint = `/${domain}/signup/create_subAdmin`;

        try {
            const response = await fetch(`${API_BASE}${apiEndpoint}`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ ...userData, role })
            });

            const message = await response.text();

            if (!response.ok) {
                throw new Error(message);
            }

            alert("Signup successful 🎉 Please login");

            navigate(`/${domain}/login`);

        } catch (err) {
            alert(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="container">
            <h2>Confirm Your Information</h2>

            <div className="card">
                {Object.entries(userData).map(([key, value]) => (
                    value && (
                        <div key={key} style={{ display: "flex", marginBottom: "8px" }}>
                            <strong style={{ width: "160px" }}>{key} :</strong>
                            <span>
                                {key === "password" ? "********" : value}
                            </span>
                        </div>
                    )
                ))}

                <div style={{ marginTop: "15px", display:"flex" }}>
                    <input type="checkbox" id="checkConform" checked={checked} 
                        onChange={() => setChecked(!checked)} style={{width:"50px", height:"20px" }} />
                    <label htmlFor="checkConform" >&nbsp; I confirm all information is correct </label>
                </div>

                <button
                    onClick={handleFinalSubmit}
                    disabled={loading}
                    style={{ margin: "15px" }}
                >
                    {loading ? "Submitting..." : "Final Submit"}
                </button>

                <button
                    onClick={() =>
                        navigate(`/${domain}/signup`, {
                            state: { userData, role }
                        })
                    }
                    style={{ marginLeft: "15px" }}
                >
                    Back
                </button>

            </div>
        </div>
    );
}

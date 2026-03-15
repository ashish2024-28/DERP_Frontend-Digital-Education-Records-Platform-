import { useLocation, useNavigate, useParams } from "react-router-dom";
import { useState, Link } from "react";
import '../SignupLogin.css'



export default function SignupConfirm() {

    const API_BASE = import.meta.env.VITE_API_BASE_URL;


    const { domain } = useParams();
    const navigate = useNavigate();
    const location = useLocation();

    const { userData, role } = location.state || {};
    const [checked, setChecked] = useState(false);
    const [loading, setLoading] = useState(false);

    const [otpSent, setOtpSent] = useState(false);
    const [otp, setOtp] = useState("");

    const [sendingOtp, setSendingOtp] = useState(false);
    const [verifyingOtp, setVerifyingOtp] = useState(false);

    if (!userData) {
        return (
            <>
                <h2>No Data Found! </h2>;
                <h3>Go to <Link to={`/${domain}/signup`}>Signup</Link></h3>
            </>

        );
    }

    const createUser = async () => {

        let apiEndpoint = "";

        if (role === "STUDENT")
            apiEndpoint = `/${domain}/signup/create_student`;

        else if (role === "FACULTY")
            apiEndpoint = `/${domain}/signup/create_faculty`;

        else if (role === "SUB_ADMIN")
            apiEndpoint = `/${domain}/signup/create_subAdmin`;

        try {

            const response = await fetch(`${API_BASE}${apiEndpoint}`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ ...userData, role })
            });

            const data = await response.json();

            if (!response.ok || !data.success) {
                throw new Error(data.message);
            }

            alert("Signup successful 🎉");

            navigate(`/${domain}/login`);

        } catch (err) {
            alert(err.message);
        }
    };

    const handleFinalSubmit = () => {

        if (!checked) {
            return alert("Please confirm information");
        }

        sendOtp();
    };

    // send otp
    const sendOtp = async () => {

        try {

            setSendingOtp(true);

            const res = await fetch(`${API_BASE}/otp/send?email=${userData.email}`, {
                method: "POST"
            });

            const data = await res.json();

            if (!data.success) {
                throw new Error(data.message);
            }

            alert("OTP sent to your email");

            setOtpSent(true);

        } catch (err) {
            alert(err.message);
        } finally {
            setSendingOtp(false);
        }
    };

    // verify otp
    const verifyOtp = async () => {
        if (!otp) { return alert("Please enter OTP"); }

        try {

            setVerifyingOtp(true);

            const res = await fetch(`${API_BASE}/otp/verify?email=${userData.email}&otp=${otp}`, {
                method: "POST"
            });

            const data = await res.json();

            if (!data.success) {
                throw new Error(data.message);
            }

            alert("OTP Verified");

            await createUser();

        } catch (err) {
            alert(err.message);
        } finally {
            setVerifyingOtp(false);
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

                <div style={{ marginTop: "15px", display: "flex" }}>
                    <input
                        type="checkbox"
                        id="checkConform"
                        checked={checked}
                        onChange={() => setChecked(!checked)}
                        style={{ width: "50px", height: "20px" }}
                    />
                    <label htmlFor="checkConform">
                        &nbsp; I confirm all information is correct
                    </label>
                </div>

                {/* SEND OTP BUTTON */}
                {!otpSent && (
                    <button
                        onClick={handleFinalSubmit}
                        disabled={sendingOtp}
                        style={{ marginTop: "15px" }}
                    >
                        {sendingOtp ? "Sending OTP..." : "Send OTP"}
                    </button>
                )}

                {/* OTP INPUT + VERIFY */}
                {otpSent && (
                    <div style={{ marginTop: "15px" }}>

                        <input
                            type="text"
                            placeholder="Enter OTP"
                            value={otp} maxLength={6}
                            onChange={(e) => setOtp(e.target.value)}
                        />

                        <button
                            onClick={verifyOtp}
                            disabled={verifyingOtp}
                        >
                            {verifyingOtp ? "Verifying..." : "Verify OTP"}
                        </button>

                    </div>
                )}

                <button
                    onClick={() =>
                        navigate(`/${domain}/signup`, {
                            state: { userData, role }
                        })
                    }
                    style={{ marginTop: "15px" }}
                >
                    Back
                </button>

            </div>
        </div>
    );
}

import { useLocation, useNavigate, useParams } from "react-router-dom";
import { useState, Link } from "react";
import '../SignupLogin.css'
import OtpVerification from "../../Service/OtpVerification";


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
    const [otpVerified, setOtpVerified] = useState(false);

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

    const handleFinalSubmit = async () => {

        if (!checked) {
            return alert("Please confirm information");
        }

        if (!otpVerified) {
            return alert("Please verify OTP first");
        }

        await createUser();
    };

    // send otp
    const sendOtp = async () => {
        if (verifyingOtp) {
            return alert("OTP Verified");
        }
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

        if (!otp) return alert("Please enter OTP");

        try {

            setVerifyingOtp(true);

            const res = await fetch(`${API_BASE}/otp/verify?email=${userData.email}&otp=${otp}`, {
                method: "POST"
            });

            const data = await res.json();

            if (!data.success) {
                throw new Error(data.message);
            }

            alert("OTP Verified ✅");

            setOtpVerified(true);

        } catch (err) {
            alert(err.message);
        } finally {
            setVerifyingOtp(false);
        }
    };

    const resendOtp = async () => {
        setOtp("");
        setOtpVerified(false);
        await sendOtp();
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
                        onClick={sendOtp}
                        disabled={sendingOtp}
                    >
                        {sendingOtp ? "Sending OTP..." : "Send OTP"}
                    </button>
                )}

                {/* OTP INPUT + VERIFY */}
                <div className="mt-5">
                    {otpSent && !otpVerified && (
                        <OtpVerification
                            email={userData.email}
                            onVerified={() => setOtpVerified(true)}
                        />
                    )}
                </div>

                <button
                    onClick={handleFinalSubmit}
                    disabled={!otpVerified || loading}
                    style={{ marginTop: "15px" }}
                >
                    Submit Signup
                </button>

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



// Confirm Info
//    ↓
// Send OTP
//    ↓
// Enter OTP
//    ↓
// Verify OTP
//    ↓
// OTP Verified ✅
//    ↓
// Submit Signup
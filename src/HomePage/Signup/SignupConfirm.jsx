// SignupConfirm.jsx
import { useLocation, useNavigate, useParams, Link } from "react-router-dom";
import { useState } from "react";
import OtpVerification from "../../Service/OtpVerification";
import "../SignupLogin.css";

export default function SignupConfirm() {
  const API_BASE = import.meta.env.VITE_API_BASE_URL;
  const { domain } = useParams();
  const navigate = useNavigate();
  const location = useLocation();

  const { userData, role } = location.state || {};

  const [checked, setChecked] = useState(false);
  const [otpSent, setOtpSent] = useState(false);
  const [sendingOtp, setSendingOtp] = useState(false);
  const [otpVerified, setOtpVerified] = useState(false);
  const [loading, setLoading] = useState(false);

  if (!userData) {
    return (
      <div className="container">
        <h2>No Data Found!</h2>
        <h3>
          Go to <Link to={`/${domain}/signup`}>Signup</Link>
        </h3>
      </div>
    );
  }

  const sendOtp = async () => {
    if (sendingOtp) return;

    setSendingOtp(true);
    try {
      const res = await fetch(`${API_BASE}/otp/send?email=${userData.email}`, {
        method: "POST",
      });
      const data = await res.json();

      if (!data.success) {
        throw new Error(data.message || "Failed to send OTP");
      }

      alert("OTP sent to your email");
      setOtpSent(true);
    } catch (err) {
      alert(err.message || "Something went wrong");
    } finally {
      setSendingOtp(false);
    }
  };

  const createUser = async () => {
    let apiEndpoint = "";
    if (role === "STUDENT") apiEndpoint = `/${domain}/signup/create_student`;
    else if (role === "FACULTY") apiEndpoint = `/${domain}/signup/create_faculty`;
    else if (role === "SUB_ADMIN") apiEndpoint = `/${domain}/signup/create_subAdmin`;
    else return alert("Invalid role");

    setLoading(true);
    try {
      const response = await fetch(`${API_BASE}${apiEndpoint}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...userData, role }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.message || "Signup failed");
      }

      alert("Signup successful 🎉");
      navigate(`/${domain}/login`);
    } catch (err) {
      alert(err.message || "Error creating account");
    } finally {
      setLoading(false);
    }
  };

  const handleFinalSubmit = () => {
    if (!checked) return alert("Please confirm the information is correct");
    if (!otpVerified) return alert("Please verify OTP first");
    createUser();
  };

  return (
    <div className="container">
      <h2>Confirm Your Information</h2>

      <div className="card">
        {Object.entries(userData).map(([key, value]) =>
          value ? (
            <div key={key} style={{ display: "flex", marginBottom: "8px" }}>
              <strong style={{ width: "160px" }}>{key}:</strong>
              <span>{key === "password" ? "********" : value}</span>
            </div>
          ) : null
        )}

        <div style={{ marginTop: "15px", display: "flex", alignItems: "center" }}>
          <input
            type="checkbox"
            id="checkConform"
            checked={checked}
            onChange={() => setChecked((prev) => !prev)}
            style={{ width: "20px", height: "20px", marginRight: "8px" }}
          />
          <label htmlFor="checkConform">I confirm all information is correct</label>
        </div>

        {!otpSent ? (
          <button
            onClick={sendOtp}
            disabled={sendingOtp}
            style={{ marginTop: "20px", padding: "10px 20px" }}
          >
            {sendingOtp ? "Sending OTP..." : "Send OTP"}
          </button>
        ) : (
          <div className="mt-6">
            <OtpVerification
              email={userData.email}
              onVerified={() => setOtpVerified(true)}
              onResend={sendOtp}           // ← reusable resend
            />
          </div>
        )}

        <button
          onClick={handleFinalSubmit}
          disabled={loading || !otpVerified || !checked}
          style={{ marginTop: "20px", padding: "12px 24px" }}
        >
          {loading ? "Processing..." : "Submit Signup"}
        </button>

        <button
          onClick={() =>
            navigate(`/${domain}/signup`, {
              state: { userData, role },
            })
          }
          style={{ marginTop: "12px", padding: "10px 20px" }}
        >
          Back
        </button>
      </div>
    </div>
  );
}
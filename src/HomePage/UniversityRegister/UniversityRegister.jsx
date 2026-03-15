import { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function UniversityRegister() {
    const API_BASE = import.meta.env.VITE_API_BASE_URL;
    const platformLogo = "/Logo.png"

    const [otpUniversity, setOtpUniversity] = useState("");
    const [otpAdmin, setOtpAdmin] = useState("");

    const [otpSentUniversity, setOtpSentUniversity] = useState(false);
    const [otpSentAdmin, setOtpSentAdmin] = useState(false);

    const [otpSending, setOtpSending] = useState(false);
    const [otpVerified, setOtpVerified] = useState(false);

    const navigate = useNavigate();
    const [university, setUniversity] = useState({
        permanentId: "",
        institutionName: "",
        universityName: "",
        institutionType: "",
        establishmentYear: "",
        address: "",
        state: "",
        email: "",
        mobileNumber: "",
        domain: "",
        // universityLogoPath: ""
    });
    const [domainAdmin, setDomainAdmin] = useState({
        name: "",
        mobileNumber: "",
        email: "",
        password: ""
    });
    const [logo, setLogo] = useState(null);
    const [confirmPassword, setConfirmPassword] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    const handleUniversityChange = (e) => {
        setUniversity({ ...university, [e.target.name]: e.target.value });
    };
    const handleDomainAdminChange = (e) => {
        setDomainAdmin({ ...domainAdmin, [e.target.name]: e.target.value });
    };

    // form submit
    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!otpVerified) {
            setLoading(false);
            alert("Please verify OTP first");
            return setError("Please verify OTP first");
        }

        setLoading(true);
        setError("");

        if (domainAdmin.password.length < 8) {
            setLoading(false);
            return setError("Password must be at least 8 characters");
        }
        if (domainAdmin.password !== confirmPassword) {
            setLoading(false);
            return setError("Passwords do not match");
        }


        const formData = new FormData();
        formData.append(
            "university",
            new Blob([JSON.stringify(university)], {
                type: "application/json"
            })
        );
        formData.append(
            "domainAdmin",
            new Blob([JSON.stringify(domainAdmin)], {
                type: "application/json"
            })
        );
        formData.append("logo", logo);

        try {
            const response = await fetch(`${API_BASE}/home_page/register_university`, {
                method: "POST",
                body: formData //logo

                // headers: { "Content-Type": "application/json" },
                // body: JSON.stringify({
                //     university: university,
                //     domainAdmin: domainAdmin

                // })
            });

            let data = {};
            try {
                data = await response.json();
            } catch {
                data = {};
            }

            if (!response.ok || !data.success) {
                throw new Error(data.message);
            }

            alert(data.message + " 🎉 Please login as DomainAdmin");
            navigate(`/`);

        } catch (err) {
            const msg = err.message || "Something went wrong";
            setError(msg);
            alert(msg);
        } finally {
            setLoading(false);
        }
    };

    const sendOtp = async () => {

        if (!university.email || !domainAdmin.email) {
            return alert("Enter both emails first");
        }

        try {

            setOtpSending(true);

            const [res1, res2] = await Promise.all([
                fetch(`${API_BASE}/otp/send?email=${university.email}`, { method: "POST" }),
                fetch(`${API_BASE}/otp/send?email=${domainAdmin.email}`, { method: "POST" })
            ]);

            const data1 = await res1.json();
            const data2 = await res2.json();

            if (!data1.success || !data2.success) {
                throw new Error("Failed to send OTP");
            }

            alert("OTP sent to both emails");

            setOtpSentUniversity(true);
            setOtpSentAdmin(true);

        } catch (err) {
            alert(err.message);
        } finally {
            setOtpSending(false);
        }

    };

    const verifyOtp = async () => {

        if (!otpUniversity || !otpAdmin) {
            return alert("Enter both OTPs");
        }

        try {

            const [res1, res2] = await Promise.all([
                fetch(`${API_BASE}/otp/verify?email=${university.email}&otp=${otpUniversity}`, { method: "POST" }),
                fetch(`${API_BASE}/otp/verify?email=${domainAdmin.email}&otp=${otpAdmin}`, { method: "POST" })
            ]);

            const data1 = await res1.json();
            const data2 = await res2.json();

            if (!data1.success || !data2.success) {
                throw new Error("Invalid OTP");
            }

            alert("OTP Verified Successfully");

            setOtpVerified(true);

        } catch (err) {
            alert(err.message);
        }

    };

    return (<>
        {/* <div>
            <NavLink>Home</NavLink>
            <NavLink>Home</NavLink>
            <NavLink>Home</NavLink>
            <NavLink>Home</NavLink>
            </div> */}
        <div className="container">

            <div className="login_Signup_Logo-container">
                <img src={platformLogo} alt="Platform Logo" />
            </div>

            <h1>Register University Form </h1>
            <h2>University details</h2>

            <form onSubmit={handleSubmit} className="card">
                {error && <p className="error">{error}</p>}
                <input type="text" name="permanentId" placeholder="PermanentId" onChange={handleUniversityChange} required />
                <input type="text" name="institutionName" placeholder="InstitutionName" onChange={handleUniversityChange} required />
                <input type="text" name="universityName" placeholder="UniversityName" onChange={handleUniversityChange} required />
                <input type="text" name="institutionType" placeholder="InstitutionType" onChange={handleUniversityChange} required />
                <input type="text" name="establishmentYear" placeholder="EstablishmentYear" onChange={handleUniversityChange} required />
                <input type="text" name="address" placeholder="Address" onChange={handleUniversityChange} autoComplete="street-address" required />
                <input type="text" name="state" placeholder="State" onChange={handleUniversityChange} autoComplete="address-level2" required />
                <input type="email" name="email" placeholder="Email" onChange={handleUniversityChange} autoComplete="email" required />
                <input name="mobileNumber" placeholder="MobileNumber" onChange={handleUniversityChange} autoComplete="tel" required />
                <input type="text" name="domain" placeholder="Unique Domain" onChange={handleUniversityChange} required />
                <input type="file" onChange={(e) => setLogo(e.target.files[0])} required />

                {/* {/* DomainAdmin */}
                <h2>Universiyt's Admin(DomainAdmin) details </h2>
                <input type="text" name="name" placeholder="Name" onChange={handleDomainAdminChange} required />
                <input type="tel" name="mobileNumber" placeholder="MobileNumber" onChange={handleDomainAdminChange} autoComplete="tel" required />
                <input type="email" name="email" placeholder="Email" onChange={handleDomainAdminChange} autoComplete="email" required />
                <input type="password" name="password" onChange={handleDomainAdminChange} autoComplete="new-password" placeholder="Enter Password" required />
                <input type="password" onChange={(e) => { setConfirmPassword(e.target.value) }} autoComplete="new-password" placeholder="Confirm Password" required />

                <button type="button" onClick={sendOtp} disabled={otpSending}>
                    {otpSending ? "Sending..." : "Send OTP"}
                </button>

                {otpSentUniversity && (
                    <>
                        <p>Enter OTP sent to University Email</p>

                        <input
                            type="text"
                            maxLength="6"
                            placeholder="Enter 6-digit OTP"
                            value={otpUniversity}
                            onChange={(e) => setOtpUniversity(e.target.value)}
                        />
                    </>
                )}

                {otpSentAdmin && (
                    <>
                        <p>Enter OTP sent to Domain Admin Email</p>

                        <input
                            type="text"
                            maxLength="6"
                            placeholder="Enter 6-digit OTP"
                            value={otpAdmin}
                            onChange={(e) => setOtpAdmin(e.target.value)}
                        />
                    </>
                )}

                {otpSentUniversity && otpSentAdmin && (
                    <button type="button" onClick={verifyOtp}>
                        Verify OTP
                    </button>
                )}
                {otpVerified && (
                    <p style={{ color: "green" }}>
                        ✅ OTP Verified
                    </p>
                )}

                <button type="submit" disabled={loading}>{loading ? "Saving..." : "Signup"}</button>
            </form>
        </div>
    </>

    );
}




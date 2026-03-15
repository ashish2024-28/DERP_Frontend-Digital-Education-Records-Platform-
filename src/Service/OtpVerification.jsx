import { useState, useRef, useEffect } from "react";

export default function OtpVerification({ email, onVerified }) {

    const API_BASE = import.meta.env.VITE_API_BASE_URL;

    const [otp, setOtp] = useState(["", "", "", "", "", ""]);
    const [timer, setTimer] = useState(30);
    const [verifying, setVerifying] = useState(false);

    const inputs = useRef([]);

    // TIMER
    useEffect(() => {
        if (timer === 0) return;

        const interval = setInterval(() => {
            setTimer((prev) => prev - 1);
        }, 1000);

        return () => clearInterval(interval);
    }, [timer]);

    // HANDLE INPUT
    const handleChange = (value, index) => {

        if (!/^[0-9]?$/.test(value)) return;

        const newOtp = [...otp];
        newOtp[index] = value;
        setOtp(newOtp);

        if (value && index < 5) {
            inputs.current[index + 1].focus();
        }

        // AUTO SUBMIT
        if (newOtp.join("").length === 6) {
            verifyOtp(newOtp.join(""));
        }
    };

    // HANDLE BACKSPACE
    const handleKeyDown = (e, index) => {

        if (e.key === "Backspace" && !otp[index] && index > 0) {
            inputs.current[index - 1].focus();
        }
    };

    // VERIFY OTP
    const verifyOtp = async (code) => {

        try {

            setVerifying(true);

            const res = await fetch(
                `${API_BASE}/otp/verify?email=${email}&otp=${code}`,
                { method: "POST" }
            );

            const data = await res.json();

            if (!data.success) throw new Error(data.message);

            alert("OTP Verified ✅");

            onVerified();

        } catch (err) {
            alert(err.message);
        } finally {
            setVerifying(false);
        }
    };

    // RESEND OTP
    const resendOtp = async () => {

        if (timer > 0) return;

        await fetch(`${API_BASE}/otp/send?email=${email}`, {
            method: "POST"
        });

        setTimer(30);
    };

    return (
        <div>

            <h3>Enter OTP</h3>

            <div style={{ display: "flex", gap: "10px" }}>

                {otp.map((digit, index) => (
                    <input
                        key={index}
                        type="text"
                        maxLength="1"
                        value={digit}
                        ref={(el) => (inputs.current[index] = el)}
                        onChange={(e) => handleChange(e.target.value, index)}
                        onKeyDown={(e) => handleKeyDown(e, index)}
                        style={{
                            width: "45px",
                            height: "45px",
                            textAlign: "center",
                            fontSize: "20px"
                        }}
                    />
                ))}

            </div>

            <br />

            {verifying && <p>Verifying OTP...</p>}

            <button
                onClick={resendOtp}
                disabled={timer > 0}
            >
                {timer > 0 ? `Resend OTP in ${timer}s` : "Resend OTP"}
            </button>

        </div>
    );
}
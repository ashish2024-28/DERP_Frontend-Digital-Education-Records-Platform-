// UniversityRegister.jsx
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import OtpVerification from "../../Service/OtpVerification"; // adjust path as needed

export default function UniversityRegister() {
  const API_BASE = import.meta.env.VITE_API_BASE_URL;
  const platformLogo = "/Logo.png";

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
    domainEmailId: ""

  });

  const [domainAdmin, setDomainAdmin] = useState({
    name: "",
    mobileNumber: "",
    email: "",
    password: "",
  });

  const [logo, setLogo] = useState(null);
  const [confirmPassword, setConfirmPassword] = useState("");

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [otpSent, setOtpSent] = useState(false);
  const [otpSending, setOtpSending] = useState(false);

  const [otpVerifiedUniversity, setOtpVerifiedUniversity] = useState(false);
  const [otpVerifiedAdmin, setOtpVerifiedAdmin] = useState(false);

  const bothVerified = otpVerifiedUniversity && otpVerifiedAdmin;

  // ────────────────────────────────────────────────
  //  Enter key → move to next input (real website feel)
  // ────────────────────────────────────────────────
  const handleKeyDownMoveNext = (e) => {
    if (e.key !== "Enter") return;

    const form = e.target.form;
    if (!form) return;

    const focusable = Array.from(
      form.querySelectorAll(
        'input:not([type="submit"]):not([type="file"]):not([disabled]):not([readonly])'
      )
    );

    const currentIndex = focusable.indexOf(e.target);
    if (currentIndex === -1) return;

    e.preventDefault(); // prevent form submit

    if (currentIndex < focusable.length - 1) {
      focusable[currentIndex + 1].focus();
    }
    // last field → do nothing (user can click button)
  };

  const handleUniversityChange = (e) => {
    setUniversity({ ...university, [e.target.name]: e.target.value });
  };

  const handleDomainAdminChange = (e) => {
    setDomainAdmin({ ...domainAdmin, [e.target.name]: e.target.value });
  };

  const sendOtpToBoth = async () => {
    setError("");

    if (!university.email || !domainAdmin.email) {
      return setError("Both email addresses are required");
    }

    if (domainAdmin.password.length < 8) {
      return setError("Password must be at least 8 characters");
    }

    if (domainAdmin.password !== confirmPassword) {
      return setError("Passwords do not match");
    }

    setOtpSending(true);

    try {
      const [res1, res2] = await Promise.all([
        fetch(`${API_BASE}/otp/send?email=${university.email}`, { method: "POST" }),
        fetch(`${API_BASE}/otp/send?email=${domainAdmin.email}`, { method: "POST" }),
      ]);

      const [data1, data2] = await Promise.all([res1.json(), res2.json()]);

      if (!data1.success || !data2.success) {
        throw new Error("Failed to send OTP to one or both emails");
      }

      setOtpSent(true);
      // alert removed → modern sites usually show toast / inline message
      // You can add a toast library later (react-hot-toast, sonner, etc.)
    } catch (err) {
      setError(err.message || "Could not send OTPs. Please try again.");
    } finally {
      setOtpSending(false);
    }
  };

  const handleFinalSubmit = async (e) => {
    e.preventDefault();
    if (!bothVerified) return;

    setLoading(true);
    setError("");

    const formData = new FormData();
    formData.append("university", new Blob([JSON.stringify(university)], { type: "application/json" }));
    formData.append("domainAdmin", new Blob([JSON.stringify(domainAdmin)], { type: "application/json" }));
    if (logo) formData.append("logo", logo);

    try {
      const response = await fetch(`${API_BASE}/home_page/register_university`, {
        method: "POST",
        body: formData,
      });

      let data;
      try {
        data = await response.json();
      } catch {
        data = {};
      }

      if (!response.ok || !data.success) {
        throw new Error(data.message || "Registration failed");
      }

      alert(`${data.message || "University registered successfully"} 🎉 Please login as Domain Admin`);
      navigate("/");
    } catch (err) {
      setError(err.message || "Registration failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 m-0 max-w-3xl">
      <div className="flex justify-center m-0">
        <img src={platformLogo} alt="Platform Logo" className="w-72 m-0" />
      </div>

      <h1 className="text-3xl font-bold text-center mb-8 underline text-green-500 dark:text-green-700" >University Registration</h1>

      <form onSubmit={handleFinalSubmit} className="shadow-lg rounded-xl p-8 space-y-6">
        {error && (
          <div className="bg-red-50 border-l-4 border-red-500 p-4 text-red-700">
            {error}
          </div>
        )}

        <div>
          <h2 className="text-xl font-semibold mb-4">University Details</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <input
              name="permanentId"
              placeholder="Permanent ID"
              onChange={handleUniversityChange}
              onKeyDown={handleKeyDownMoveNext}
              required
              className="border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <input
              name="institutionName"
              placeholder="Institution Name"
              onChange={handleUniversityChange}
              onKeyDown={handleKeyDownMoveNext}
              required
              className="border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <input
              name="universityName"
              placeholder="University Name"
              onChange={handleUniversityChange}
              onKeyDown={handleKeyDownMoveNext}
              required
              className="border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <input
              name="institutionType"
              placeholder="Institution Type"
              onChange={handleUniversityChange}
              onKeyDown={handleKeyDownMoveNext}
              required
              className="border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <input
              name="establishmentYear"
              placeholder="Establishment Year"
              onChange={handleUniversityChange}
              onKeyDown={handleKeyDownMoveNext}
              required
              className="border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <input
              name="state"
              placeholder="State"
              onChange={handleUniversityChange}
              onKeyDown={handleKeyDownMoveNext}
              required autoComplete="email"
              className="border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <input
              name="address"
              placeholder="Full Address"
              onChange={handleUniversityChange}
              onKeyDown={handleKeyDownMoveNext}
              autoComplete="street-address"
              required
              className="md:col-span-2 border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <input
              type="email"
              name="email"
              placeholder="Official University Email"
              onChange={handleUniversityChange}
              onKeyDown={handleKeyDownMoveNext}
              required autoComplete="email"
              className="border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <input
              name="mobileNumber"
              placeholder="Mobile Number" maxLength={10} 
              onChange={handleUniversityChange}
              onKeyDown={handleKeyDownMoveNext}
              required autoComplete="tel"
              className="border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <input
              name="domain"
              placeholder="Unique Domain (e.g iitd-> iit delhi )"
              onChange={handleUniversityChange}
              onKeyDown={handleKeyDownMoveNext}
              required
              className="border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            <input
              name="domainEmailId"
              placeholder="Unique Domain (e.g. @iitd.ac.in)"
              onChange={handleUniversityChange}
              onKeyDown={handleKeyDownMoveNext}
              required
              className="border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        <div>
          <h2 className="text-xl font-semibold mb-4 mt-8">Upload University Logo</h2>
          <input
            type="file"
            accept="image/*"
            onChange={(e) => setLogo(e.target.files?.[0])}
            required
            className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
          />
        </div>

        <div>
          <h2 className="text-xl font-semibold mb-4 mt-10">Domain Admin Details</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <input
              name="name"
              placeholder="Full Name"
              onChange={handleDomainAdminChange}
              onKeyDown={handleKeyDownMoveNext}
              required
              className="border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <input
              name="mobileNumber"  maxLength={10} 
              placeholder="Mobile Number"
              onChange={handleDomainAdminChange}
              onKeyDown={handleKeyDownMoveNext}
              required autoComplete="tel"
              className="border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <input
              type="email"
              name="email"
              placeholder="Admin Email"
              onChange={handleDomainAdminChange}
              onKeyDown={handleKeyDownMoveNext}
              required autoComplete="email"
              className="border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <input
              type="password"
              name="password"  minLength={8} 
              placeholder="Password (min 8 characters)"
              onChange={handleDomainAdminChange}
              onKeyDown={handleKeyDownMoveNext}
              required
              className="border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <input
              type="password"
              placeholder="Confirm Password"
              value={confirmPassword} minLength={8}
              onChange={(e) => setConfirmPassword(e.target.value)}
              onKeyDown={handleKeyDownMoveNext}
              required
              className="md:col-span-2 border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        {/* OTP Section */}
        {!otpSent ? (
          <div className="pt-6">
            <button
              type="button"
              onClick={sendOtpToBoth}
              disabled={otpSending || loading}
              className={`w-full py-3 px-6 rounded-lg font-semibold text-white transition-colors ${
                otpSending || loading
                  ? "bg-gray-400 cursor-not-allowed"
                  : "bg-blue-600 hover:bg-blue-700"
              }`}
            >
              {otpSending ? "Sending OTPs..." : "Send Verification OTPs"}
            </button>
          </div>
        ) : (
          <div className="pt-8">
            <h3 className="text-xl font-semibold text-center mb-8">Verify Email Addresses</h3>

            <div className="space-y-12">
              {/* University Email Verification */}
              <div>
                <p className="text-center mb-4 text-gray-700">
                  OTP sent to <strong className="font-medium">{university.email}</strong>
                </p>
                {otpVerifiedUniversity ? (
                  <div className="text-center text-green-600 font-medium text-lg">
                    ✓ University email verified
                  </div>
                ) : (
                  <OtpVerification
                    email={university.email}
                    onVerified={() => setOtpVerifiedUniversity(true)}
                    onResend={() => fetch(`${API_BASE}/otp/send?email=${university.email}`, { method: "POST" })}
                  />
                )}
              </div>

              {/* Admin Email Verification */}
              <div>
                <p className="text-center mb-4 text-gray-700">
                  OTP sent to <strong className="font-medium">{domainAdmin.email}</strong>
                </p>
                {otpVerifiedAdmin ? (
                  <div className="text-center text-green-600 font-medium text-lg">
                    ✓ Admin email verified
                  </div>
                ) : (
                  <OtpVerification
                    email={domainAdmin.email}
                    onVerified={() => setOtpVerifiedAdmin(true)}
                    onResend={() => fetch(`${API_BASE}/otp/send?email=${domainAdmin.email}`, { method: "POST" })}
                  />
                )}
              </div>
            </div>

            {bothVerified && (
              <div className="mt-8 text-center text-green-700 font-bold text-xl">
                Both emails verified successfully!
              </div>
            )}

            <button
              type="submit"
              disabled={loading || !bothVerified}
              className={`mt-10 w-full py-3 px-6 rounded-lg font-semibold text-white transition-colors ${
                bothVerified && !loading
                  ? "bg-green-600 hover:bg-green-700"
                  : "bg-gray-400 cursor-not-allowed"
              }`}
            >
              {loading ? "Creating University..." : "Complete Registration"}
            </button>
          </div>
        )}
      </form>
    </div>
  );
}













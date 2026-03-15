import { useEffect, useState } from "react";
import { useParams, Link, useNavigate, useLocation } from "react-router-dom";
import '../SignupLogin.css'


export default function Signup() {

    const API_BASE = import.meta.env.VITE_API_BASE_URL;


    const platformLogo = "/Logo.png"
    const univLogo = "/defaultUniversity.png";

    const { domain } = useParams();
    const navigate = useNavigate();
    const location = useLocation();
    const university = JSON.parse(localStorage.getItem("universityNameDomainLogo"));


    const [error, setError] = useState("");
    const [role, setRole] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");

    const [userData, setUserData] = useState({
        name: "",
        email: "",
        password: "",
        mobileNumber: "",
        facultyId: "",  //faculty
        teachingBatch: "", //faculty
        subAdminId: "", //subAdmin
        course: "",
        //student
        rollNumber: "",
        branch: "",
        batch: "",
        fatherName: "",
        fatherMobNo: ""
    });


    useEffect(() => {
        if (university.domain !== domain) {
            alert(`Error fetching university. Please select a university from dropdown `);
            navigate("/");
            return;
        }
    }, [domain, navigate]);


    const handleChange = (e) => {
        setUserData({ ...userData, [e.target.name]: e.target.value });
    };

    const handleSubmit = (e) => {
        e.preventDefault();

        if (!userData.email || !userData.password || !confirmPassword) {
            return setError("All required fields must be filled");
        }

        if (!userData.email.includes("@")) {
            return setError("Invalid email format");
        }

        if (userData.password.length < 8) {
            return setError("Password must be at least 8 characters");
        }

        if (userData.password !== confirmPassword) {
            return setError("Passwords do not match");
        }

        if (!role) {
            return setError("Please select a role");
        }

        setError("");

        navigate(`/${domain}/signup/confirm`, {
            state: { userData, role }
        });
    };


    // "problem when click back then all data remove"
    // Now it will NOT reset.
    useEffect(() => {
        if (location.state?.userData) {
            setUserData(location.state.userData);
            setRole(location.state.role);
        }
    }, [location.state]);


    return (
        <div className="container">
            <h1>DERP ↔️ {university.name}</h1>
            <h2>Signup</h2>

            <div className="login_Signup_Logo-container">
                <img src={platformLogo} alt="Platform Logo" />
                ↔️
                <img src={`${API_BASE}/${university.logo}`} alt={`${university.name}'s Logo`} />


            </div>

            <form onSubmit={handleSubmit} className="card">
                {error && <p style={{ color: "red" }}>{error}</p>}

                <input type="text" name="name" placeholder="Name" onChange={handleChange} autoComplete="name" required />
                <input type="email" name="email" placeholder="Email" onChange={handleChange} autoComplete="email" required />
                <input type="tel" name="mobileNumber" placeholder="Mobile Number" onChange={handleChange} autoComplete="tel" required />
                <input type="password" name="password" placeholder="Password" onChange={handleChange} autoComplete="new-password" required />
                <input type="password" placeholder="Confirm Password" onChange={(e) => setConfirmPassword(e.target.value)} autoComplete="new-password" required />

                <select className="dark:bg-black" value={role} onChange={(e) => setRole(e.target.value)} required>
                    <option value="">Select Role</option>
                    <option value="STUDENT">Student</option>
                    <option value="FACULTY">Faculty</option>
                    <option value="SUB_ADMIN">Sub Admin</option>
                </select>

                {/* STUDENT FIELDS */}
                {role === "STUDENT" && (
                    <>
                        <input type="tel" name="rollNumber" placeholder="Roll Number" onChange={handleChange} autoComplete="tel" required />
                        <input type="text" name="course" placeholder="Course (B.Tech, BCA, MBA...)" onChange={handleChange} required />
                        <input type="text" name="branch" placeholder="Branch" onChange={handleChange} />
                        <input type="text" name="batch" placeholder="Batch (2021-25)" onChange={handleChange} required />
                        <input type="text" name="fatherName" placeholder="Father Name" onChange={handleChange} required />
                        <input type="tel" name="fatherMobNo" placeholder="Father Mobile No" onChange={handleChange} autoComplete="tel" required />
                    </>
                )}

                {/* FACULTY FIELDS */}
                {role === "FACULTY" && (
                    <>
                        <input name="facultyId" placeholder="Faculty ID" onChange={handleChange} required />
                        <input name="course" placeholder="Teaching Course" onChange={handleChange} required />
                        <input name="teachingBatch" placeholder="Teaching Batch" onChange={handleChange} required />
                    </>
                )}

                {/* SUB ADMIN FIELDS */}
                {role === "SUB_ADMIN" && (
                    <>
                        <input name="subAdminId" placeholder="Sub Admin ID" onChange={handleChange} required />
                        <input name="course" placeholder="Department" onChange={handleChange} required />
                    </>
                )}

                <button type="submit">Signup</button>

                <p>
                    Already have account? <Link to={`/${domain}/login`}>Login</Link>
                </p>
            </form>
        </div>
    );
}





import { useEffect, useState } from "react";
import { Link, useParams, Outlet, useNavigate, useLocation } from "react-router-dom";

import "../Common/css/common.css";
import FormatDate from "../../Components/DateTimeFunction/FormatDate"; "../../Components/DateTimeFunction/FormatDate";

export default function StudentDashboard() {

  const API_BASE = import.meta.env.VITE_API_BASE_URL;

  const { domain } = useParams();
  const location = useLocation();
  const navigate = useNavigate();

  // ===== Data Lists =====
  const [student, setStudent] = useState([]);

  const [showSidebar, setShowSidebar] = useState(true);
  const [input, setInput] = useState("");

  const navigateLogout = useNavigate(); // Initialize it

  // ================= FETCH DATA =================
  useEffect(() => {
    fetchAllData();
  }, [domain]);


  const fetchAllData = async () => {
    try {

      const studentRes = await fetch(`${API_BASE}/${domain}/student`, {
        headers: {
          "Authorization": `Bearer ${localStorage.getItem("token")}`,
          "Content-Type": "application/json"
        }
      });

      const studentData = await studentRes.json();
      setStudent(studentData);
      alert(localStorage.getItem("role") + " Login Successfully.");

    } catch (error) {
      console.error("Dashboard error:", error);
      alert(`Session expired. ${localStorage.getItem("role")} Please login again.`);
      localStorage.removeItem("token");
      localStorage.removeItem("role");

      navigate(`/${domain}/login`);
    }
  };


  // user Lougout
  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    // Redirect to the specific login page for that domain
    navigateLogout(`/${domain}/login`);
  };

  // Logic to check if we are on the base dashboard path
  // If the path ends with "/dashboard", show the grid. 
  // If it's "/dashboard/certification", hide the grid.
  const isParentRoute = location.pathname.endsWith("/dashboard");


  const handleProfileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append("profilePic", file);

    try {
      const res = await fetch(`${API_BASE}/${domain}/student/update_profile_pic`, {
        method: "PUT",
        headers: {
          "Authorization": `Bearer ${localStorage.getItem("token")}`
        },
        body: formData
      });

      const data = await res.json();

      if (!data.success) {
        throw new Error(data.message);
      }
      alert(data.message);

      fetchAllData();

    } catch (err) {
      alert(err.message);
    }
  };

  return (
    <div className="dashboard-container">

      {/* Toggle Button (OUTSIDE SIDEBAR) */}
      <button className="toggle-btn" onClick={() => setShowSidebar(!showSidebar)} > ☰ </button>

      {/* Sidebar */}
      {showSidebar && (
        <div className="sidebar">
          <div className="profile-section">
            <input
              type="file"
              id="profileUpload"
              style={{ display: "none" }}
              onChange={handleProfileUpload}
            />
            <img
              className="profile-pic-img"
              src={student.profilePic ? `${API_BASE}/${student.profilePic}` : "/default.png"}
              alt="Profile"
              onDoubleClick={() => document.getElementById("profileUpload").click()}
            />

            <p>Roll No : {student.rollNumber}</p>
            <p>Name : {student.name}</p>
            <p>Email : {student.email}</p>
            <p>Mobile: {student.mobileNumber}</p>
            <p>Father Name : {student.fatherName}</p>
            <p>Father Mobile : {student.fatherMobNo}</p>
            <p>Course : {student.course}</p>
            <p>Branch : {student.branch}</p>
            <p>Batch : {student.batch}</p>
            <p>Last Login : {FormatDate(student.lastLoginDateTime)}</p>
            <p>Account Created Date : {FormatDate(student.createdDateTime)}</p>

          </div>

          <button className="logout-btn" onClick={handleLogout}>Logout</button>
        </div>
      )}

      {/* Main Content */}
      <div className="main-content">
        {isParentRoute ? (
          /* ONLY SHOW GRID IF ON MAIN DASHBOARD */
          <div className="card-grid">
            <Link className="main-content-Link" to={"certification"}><div className="card">Certification</div> </Link>
            <Link className="main-content-Link" to={"notepad"}><div className="card">Notepad</div> </Link>
            <Link className="main-content-Link" to={"erp-attendence"}><div className="card">ERP / Attendance</div> </Link>
            <Link className="main-content-Link" to={"fees"}><div className="card">Fees</div> </Link>
            <Link className="main-content-Link" to={"assignment"}><div className="card">Assignments</div> </Link>
            <Link className="main-content-Link" to={"test-quize"}><div className="card">Tests / Quiz</div> </Link>
            <Link className="main-content-Link" to={"notes"}><div className="card">Notes</div> </Link>

          </div>
        ) : (
          /* SHOW SUB-PAGE AND BACK BUTTON */
          <div className="sub-page-container">
            <button className="back-btn" onClick={() => navigate(-1)}>
              ← Back to Dashboard
            </button>
            <Outlet />
          </div>
        )}




      </div>

    </div>
  );
}



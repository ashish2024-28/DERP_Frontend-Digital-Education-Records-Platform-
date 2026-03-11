// // export default StudentDashboard;
import { useEffect, useState } from "react";
import { Link, useParams, Outlet, useNavigate, useLocation } from "react-router-dom";

import "../Common/css/common.css";
import "./FacultyDashboard.css";
import FormatDate from "../../Components/DateTimeFunction/FormatDate";


export default function FacultyDashboard() {
  
  const API_BASE = import.meta.env.VITE_API_BASE_URL;

  const { domain } = useParams();
  const location = useLocation();
  const navigate = useNavigate();

  // ===== Data Lists =====
  const [faculty, setFaculty] = useState({});
  const [students, setStudents] = useState([]);

  const [showSidebar, setShowSidebar] = useState(true);
  const [targets, setTargets] = useState([]);
  const [input, setInput] = useState("");


  // ================= FETCH DATA =================
  useEffect(() => {
    fetchAllData();
  }, [domain]);

  const fetchAllData = async () => {
    try {
      const headers = {
        "Authorization": `Bearer ${localStorage.getItem("token")}`,
        "Content-Type": "application/json"
      }
      // 1️⃣ Faculty Details
      const facultyRes = await fetch(`${API_BASE}/${domain}/faculty`, { headers });
      const facultyData = await facultyRes.json();
      setFaculty(facultyData);

      // 2️⃣ All Students
      const studentRes = await fetch(`${API_BASE}/${domain}/faculty/all_student`, { headers });
      const studentData = await studentRes.json();
      setStudents(studentData.data);


    } catch (error) {
      console.error("Error:", error);
      alert(`Session expired. ${localStorage.getItem("role")} Please login again.`);
      localStorage.clear();
      navigate(`/${domain}/login`);
    }
  };

  const handleLogout = () => {
    localStorage.clear(); // Clear all data
    navigate(`/${domain}/login`);
  };

  const addTarget = () => {
    if (input.trim() !== "") {
      setTargets([...targets, input]);
      setInput("");
    }
  };

  const isParentRoute = location.pathname.endsWith("/dashboard");
  return (
    <div className="dashboard-container">

      {/* Toggle Button (OUTSIDE SIDEBAR) */}
      <button className="toggle-btn" onClick={() => setShowSidebar(!showSidebar)} > ☰ </button>

      {/* Sidebar */}
      {showSidebar && (
        <div className="sidebar">
          <div className="profile-pic">
            <img className="profile-pic-img" src={(faculty.profilePhotoPath)? faculty.profilePhotoPath : "/default.png"} alt="Profile" />
          </div>
            <p>img: {faculty.profilePhotoPath}</p>
          <p>Faculty Id: {faculty.facultyId}</p>
          <p>Name: {faculty.name}</p>
          <p>Email: {faculty.email}</p>
          <p>Mobile: {faculty.mobileNumber}</p>
          <p>Course: {faculty.course}</p>
          <p>Teaching Batch: {faculty.teachingBatch}</p>
          <p>Last Login : {FormatDate(faculty.lastLoginDateTime)}</p>
          <p>Account Created Date: {FormatDate(faculty.createdDateTime)}</p>

          <button className="logout-btn" onClick={handleLogout}>Logout</button>
        </div>
      )}

      {/* Main Content */}
      <div className="main-content">
        {isParentRoute ? (
          /* ONLY SHOW GRID IF ON MAIN DASHBOARD */
          <div className="card-grid">
            <Link className="main-content-Link" to={"all-students"} state={{ students }}><div className="card">All Students</div> </Link>
            <Link className="main-content-Link" to={"notepad"}><div className="card">Notepad</div> </Link>
            <Link className="main-content-Link" to={"erp-attendence"}><div className="card">ERP / Attendance</div> </Link>
            {/* common student and faculty */}
            <Link className="main-content-Link" to={"assignment"}><div className="card">Assignments</div> </Link>
            <Link className="main-content-Link" to={"test-quize"}><div className="card">Tests / Quiz</div> </Link>
            <Link className="main-content-Link" to={"notes"}><div className="card">Notes</div> </Link>

           
            <div className="target-section">

              <h3>🎯 My Goals</h3>
              <div className="target-input">
                <input type="text" placeholder="Write your aim..." value={input} onChange={(e) => setInput(e.target.value)} />
                <button onClick={addTarget}>+</button>
              </div>

              <ul>
                {targets.map((item, index) => (
                  <li key={index}>{item}</li>
                ))}
              </ul>
            </div>

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



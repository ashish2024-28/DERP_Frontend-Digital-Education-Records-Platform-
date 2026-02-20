// // export default StudentDashboard;
import { useEffect, useState } from "react";
import { Link, useParams, Outlet, useNavigate, useLocation } from "react-router-dom";
import "./FacultyDashboard.css";

export default function FacultyDashboard() {
  const API_BASE = import.meta.env.VITE_API_BASE_URL;
  const { domain } = useParams();
  const location = useLocation();
  const navigate = useNavigate();

  // ===== Data Lists =====
  const [students, setStudents] = useState([]);
  const [faculty, setFaculty] = useState([]);

  const [showSidebar, setShowSidebar] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [targets, setTargets] = useState([]);
  const [input, setInput] = useState("");


  // ================= FETCH DATA =================
  useEffect(() => {
    fetchAllData();
  }, [domain]);

  const fetchAllData = async () => {
    try {
      const headers = {
        "Authorization": `Bearer ${localStorage.getItem("token")
          }`,
        "Content-Type": "application/json"
      }
      // 1️⃣ Faculty Details
      const facultyRes = await fetch(`${API_BASE}/${domain}/faculty`, { headers });
      const facultyData = await facultyRes.json();
      setFaculty(facultyData);

      // 2️⃣ All Students
      const studentRes = await fetch(`${API_BASE}/${domain}/faculty/all_student`, { headers });
      const studentData = await studentRes.json();
      setStudents(studentData);


    } catch (error) {
      console.error("Error:", error);
      alert("Error:", error)
      localStorage.clear();
      navigate(`/${domain}/login`);
    }
  };

  const studentData = students.filter(item =>
    item.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.rollNumber?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.course?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.branch?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.batch?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.email?.toLowerCase().includes(searchQuery.toLowerCase())
  );

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
            <img className="profile-pic-img" src={(faculty.profilePhotoPath)? faculty.profilePhotoPath:"../../../public/default.png"} alt="Profile" />
          </div>
            <p>img: {faculty.profilePhotoPath}</p>
          <p>Faculty Id: {faculty.facultyId}</p>
          <p>Name: {faculty.name}</p>
          <p>Email: {faculty.email}</p>
          <p>Mobile: {faculty.mobileNumber}</p>
          <p>Course: {faculty.course}</p>
          <p>Teaching Batch: {faculty.teachingBatch}</p>
          <p>Last Login : {faculty.lastLoginDateTime}</p>
          <p>Account Created Date: {faculty.createdDateTime}</p>

          <button className="logout-btn" onClick={handleLogout}>Logout</button>
        </div>
      )}

      {/* Main Content */}
      <div className="main-content">
        {isParentRoute ? (
          /* ONLY SHOW GRID IF ON MAIN DASHBOARD */
          <div className="card-grid">
            <Link className="main-content-Link" to={"all-Students"}><div className="card">All Students</div> </Link>
            <Link className="main-content-Link" to={"notepad"}><div className="card">Notes</div> </Link>
            <Link className="main-content-Link" to={"erp-attendence"}><div className="card">ERP / Attendance</div> </Link>
            {/* common student and faculty */}
            <Link className="main-content-Link" to={"assignment"}><div className="card">Assignments</div> </Link>
            <Link className="main-content-Link" to={"test-quize"}><div className="card">Tests / Quiz</div> </Link>
            <Link className="main-content-Link" to={"notes"}><div className="card">Note Pad</div> </Link>

            <div className="target-section">
              Keep your goals section here if you want it on the main page
            </div>
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



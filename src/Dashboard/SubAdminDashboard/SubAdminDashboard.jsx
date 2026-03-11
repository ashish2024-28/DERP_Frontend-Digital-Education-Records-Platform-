import { useEffect, useState } from "react";
import { Link, useParams, Outlet, useNavigate, useLocation } from "react-router-dom";

import "../Common/css/common.css";
import "./SubAdminDashboard.css";
import FormatDate from "../../Components/DateTimeFunction/FormatDate";

export default function SubAdminDashboard() {

  const API_BASE = import.meta.env.VITE_API_BASE_URL;

  const { domain } = useParams();
  const location = useLocation();
  const navigate = useNavigate();

  // ===== Data Lists =====
  const [subAdmin, setSubAdmin] = useState([]);
  const [faculty, setFaculty] = useState([]);
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
      const subAdminRes = await fetch(`${API_BASE}/${domain}/subAdmin`, { headers });
      const subAdminData = await subAdminRes.json();
      setSubAdmin(subAdminData);

      // 2️⃣ All Students
      const studentRes = await fetch(`${API_BASE}/${domain}/subAdmin/all_student`, { headers });
      const studentData = await studentRes.json();
      setStudents(studentData.data);


    } catch (error) {
      console.error("Error:", error);
      alert(`Session expired. ${localStorage.getItem("role")} Please login again.`);
      localStorage.clear();
      navigate(`/${domain}/login`);
    }
  };
  // user Lougout
  const handleLogout = () => {
    localStorage.clear(); // Clear all data
    // Redirect to the specific login page for that domain
    navigateLogout(`/${domain}/login`);
  };


  const addTarget = () => {
    if (input.trim() !== "") {
      setTargets([...targets, input]);
      setInput("");
    }
  };

  // Logic to check if we are on the base dashboard path
  // If the path ends with "/dashboard", show the grid. 
  // If it's "/dashboard/certification", hide the grid.
  const isParentRoute = location.pathname.endsWith("/dashboard");
  return (
    <div className="dashboard-container">

      {/* Toggle Button (OUTSIDE SIDEBAR) */}
      <button className="toggle-btn" onClick={() => setShowSidebar(!showSidebar)} > ☰ </button>

      {/* Sidebar */}
      {showSidebar && (
        <div className="sidebar">
          <div className="profile-section">
            <div className="profile-pic">
              <img className="profile-pic-img" src={(subAdmin.profilePhotoPath ? subAdmin.profilePhotoPath : "/default.png")} alt="Profile" />
            </div>
            <p>img  : {subAdmin.profilePhotoPath}</p>
            <p>SubAdmin Id : {subAdmin.subAdminId}</p>
            <p>Name : {subAdmin.name}</p>
            <p>Email : {subAdmin.email}</p>
            <p>Mobile : {subAdmin.mobileNumber}</p>
            <p>Course : {subAdmin.course}</p>
            <p>Last Login : {FormatDate(subAdmin.lastLoginDateTime)}</p>
            <p>Account Created Date : {FormatDate(subAdmin.createdDateTime)}</p>
          </div>

          {/*not good , <a ... button../> <Link to={"/"}><button className="logout-btn" onClick={()=>{localStorage.clear()}} >Logout</button> </Link> */}
          <button className="logout-btn" onClick={handleLogout}>Logout</button>
        </div>
      )}

      {/* Main Content */}
      <div className="main-content">
        {isParentRoute ? (
          /* ONLY SHOW GRID IF ON MAIN DASHBOARD */
          <div className="card-grid">
            <Link className="main-content-Link" to={"all-students"} state={{ students }}><div className="card">All Students</div> </Link>
            <Link className="main-content-Link" to={"all-faculty"} state={{ faculty }}><div className="card">All Faculty</div> </Link>
            <Link className="main-content-Link" to={"notepad"}><div className="card">Notepad</div> </Link>

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



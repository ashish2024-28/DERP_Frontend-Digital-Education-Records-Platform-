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

  const [showSidebar, setShowSidebar] = useState(true);
  const [targets, setTargets] = useState([]);
  const [input, setInput] = useState("");

  const navigateLogout = useNavigate(); // Initialize it



  useEffect(() => {
    async function fetchData() {
      try {
        const response = await fetch(`${API_BASE}/${domain}/subAdmin`, {
          method: "GET", // This is the 'Security Check'
          headers: {
            "Authorization": `Bearer ${localStorage.getItem("token")}`,
            "Content-Type": "application/json"
          }
        });

        if (!response.ok) {
          throw new Error("Unauthorized or server error");
        }

        const data = await response.json();
        setSubAdmin(data);

        alert(localStorage.getItem("role") + "Login Successfully.");

      } catch (error) {
        console.error("Dashboard error:", error);
        alert(`Session expired. ${localStorage.getItem("role")} Please login again.`);
        localStorage.clear();
        navigate(`/${domain}/login`);
      }
    }
    fetchData();
  }, [domain, API_BASE]);

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
            <Link className="main-content-Link" to={"certification"}><div className="card">Certification</div> </Link>
            <Link className="main-content-Link" to={"notepad"}><div className="card">Notes</div> </Link>
            <Link className="main-content-Link" to={"erp-attendence"}><div className="card">ERP / Attendance</div> </Link>
            <Link className="main-content-Link" to={"fees"}><div className="card">Fees</div> </Link>
            <Link className="main-content-Link" to={"assignment"}><div className="card">Assignments</div> </Link>
            <Link className="main-content-Link" to={"test-quize"}><div className="card">Tests / Quiz</div> </Link>
            <Link className="main-content-Link" to={"notes"}><div className="card">Note Pad</div> </Link>

            
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



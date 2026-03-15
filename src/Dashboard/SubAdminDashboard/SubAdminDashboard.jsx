import { useEffect, useState } from "react";
import { Link, useParams, Outlet, useNavigate, useLocation } from "react-router-dom";

import "../Common/css/common.css";
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

      const subAdminRes = await fetch(`${API_BASE}/${domain}/subAdmin`, { headers });
      const subAdminData = await subAdminRes.json();
      setSubAdmin(subAdminData);

      // 1️⃣ Faculty Details
      const facultyRes = await fetch(`${API_BASE}/${domain}/subAdmin/all_faculty`, { headers });
      const facultyData = await facultyRes.json();
      setFaculty(facultyData);

      // 2️⃣ All Students
      const studentRes = await fetch(`${API_BASE}/${domain}/subAdmin/all_student`, { headers });
      const studentData = await studentRes.json();
      setStudents(studentData.data);


    } catch (error) {
      console.error("Error:", error);
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
    navigate(`/${domain}/login`);
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
      const res = await fetch(`${API_BASE}/${domain}/subAdmin/update_profile_pic`, {
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
              src={subAdmin.profilePic ? `${API_BASE}/${subAdmin.profilePic}` : "/default.png"}
              alt="Profile"
              onDoubleClick={() => document.getElementById("profileUpload").click()}
            />
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



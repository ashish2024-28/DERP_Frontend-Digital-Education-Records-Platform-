// // export default StudentDashboard;
import { useEffect, useState } from "react";
import { Link, useParams, Outlet, useNavigate, useLocation} from "react-router-dom";
import "./StudentDashboard.css";

export default function StudentDashboard() {
  const API_BASE = import.meta.env.VITE_API_BASE_URL;
  const { domain } = useParams();
  const location = useLocation();
  const navigate = useNavigate();

    // ===== Data Lists =====
  const [student, setStudent] = useState([]);

  const [showSidebar, setShowSidebar] = useState(true);
  const [targets, setTargets] = useState([]);
  const [input, setInput] = useState("");

  const navigateLogout = useNavigate(); // Initialize it

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

        // Student data
        const studentRes = await fetch(`${API_BASE}/${domain}/student`, { headers });
        const studentData = await studentRes.json();
        setStudent(studentData);

      } catch (error) {
      console.error("Error:", error);
      alert("Error:", error)
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
            <div className="profile-pic">
              <img className="profile-pic-img" src={(student.profilePic)?student.profilePic:"../../../public/default.png"} alt="Profile" />
            </div>
            <p>img : {student.profilePhotoPath}</p>
            <p>Roll No : {student.rollNumber}</p>
            <p>Name : {student.name}</p>
            <p>Email : {student.email}</p>
            <p>Mobile: {student.mobileNumber}</p>
            <p>Father Name : {student.fatherName}</p>
            <p>Father Mobile : {student.fatherMobNo}</p>
            <p>Course : {student.course}</p>
            <p>Branch : {student.branch}</p>
            <p>Batch : {student.batch}</p>
            <p>Account Created Date : {student.createdDateTime}</p>
            <p>Last Login : {student.lastLoginDateTime}</p>

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



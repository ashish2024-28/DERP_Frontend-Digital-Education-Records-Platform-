import { useEffect, useState } from "react";
import { Link, useParams, Outlet, useNavigate, useLocation} from "react-router-dom";
import "./SubAdminDashboard.css";

export default function SubAdminDashboard() {
  const API_BASE = import.meta.env.VITE_API_BASE_URL;
  const { domain } = useParams();
  const location = useLocation();
  const navigate = useNavigate();

  // user details
  const [name, setName] = useState("");
  const [rollNumber, setRollNumber] = useState("");
  const [email, setEmail] = useState("");
  const [mobileNumber, setMobileNumber] = useState("");
  const [fatherName, setFatherName] = useState("");
  const [fatherMobNumber, setFatherMobName] = useState("");
  const [course, setCourse] = useState("");
  const [branch, setBranch] = useState("");
  const [batch, setBatch] = useState("");
  const [createAccountDate, setCreateAccountDate] = useState("");
  const [lastLogin, setLastLogin] = useState("");
  const [profilePic, setProfilePic] = useState("/default.png");

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
          // If token is expired or invalid, send them back to login
          alert(localStorage.getItem("role") + " Login Fail.");
          localStorage.clear();
          navigate(`/${domain}/login_profile`);
          return;
        }

        const data = await response.json(); // This is the StudentResponseDTO from your backend

        // ✅ MAP THE DATA TO YOUR STATE
        setName(data.name);
        setRollNumber(data.rollNumber);
        setEmail(data.email);
        setMobileNumber(data.mobileNumber);
        setFatherName(data.fatherName);
        setFatherMobName(data.fatherMobNo);
        setCourse(data.course);
        setBranch(data.branch);
        setBatch(data.batch);
        setCreateAccountDate(data.createdDateTime);
        setLastLogin(data.lastLoginDateTime);
        // if (data.profileImage) {
        //   setProfilePic(`${API_BASE}/uploads/${data.profileImage}`);
        // }

        alert(localStorage.getItem("role") + "Login Successfully.");

      } catch (error) {
        console.error("Error fetching SubAdmin details:", error);
        alert("Error fetching SubAdmin details:", error);
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
              <img className="profile-pic-img" src={(profilePic? profilePic : "faculty.profilePhotoPath")} alt="Profile" />
            </div>
            <p>img  : {profilePic}</p>
            <p>Roll No : {rollNumber}</p>
            <p>Name : {name}</p>
            <p>Email : {email}</p>
            <p>Mobile : {mobileNumber}</p>
            <p>Father Name : {fatherName}</p>
            <p>Father Mobile : {fatherMobNumber}</p>
            <p>Course : {course}</p>
            <p>Branch : {branch}</p>
            <p>Batch : {batch}</p>
            <p>Account Created Date : {createAccountDate}</p>
            <p>Last Login : {lastLogin}</p>
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



import { useEffect, useState } from "react";
import { useParams, Outlet, useNavigate, useLocation } from "react-router-dom";
import { Search, Edit } from "lucide-react";
import "./DomainAdminDashboard.css";
import { Eye, EyeOff } from "lucide-react";

export default function DomainAdminDashboard() {

  const API_BASE = import.meta.env.VITE_API_BASE_URL;
  const { domain } = useParams();
  const navigate = useNavigate();
  const location = useLocation();

  // ===== Domain Admin Details =====
  const [admin, setAdmin] = useState({});

  // ===== Counts =====
  const [totalStudent, setTotalStudent] = useState(0);
  const [totalFaculty, setTotalFaculty] = useState(0);
  const [totalSubAdmin, setTotalSubAdmin] = useState(0);
  const [showPassword, setShowPassword] = useState(false);


  // ===== Data Lists =====
  const [students, setStudents] = useState([]);
  const [faculty, setFaculty] = useState([]);
  const [subAdmins, setSubAdmins] = useState([]);

  const [activeTab, setActiveTab] = useState("student");
  const [searchQuery, setSearchQuery] = useState("");
  const [showSidebar, setShowSidebar] = useState(true);

  // ================= FETCH DATA =================
  useEffect(() => {
    fetchAllData();
  }, [domain]);

  const fetchAllData = async () => {
    try {
      const headers = {
        "Authorization": `Bearer ${localStorage.getItem("token")}`,
        "Content-Type": "application/json"
      };

      // 1️⃣ DomainAdmin Details
      const adminRes = await fetch(`${API_BASE}/${domain}/domainAdmin`, { headers });
      const adminData = await adminRes.json();
      setAdmin(adminData);

      // 2️⃣ Dashboard Total Count of Student, Faculty, SubAdmin
      const dashboardRes = await fetch(`${API_BASE}/${domain}/domainAdmin/get_dashboard`, { headers });
      const dashboardData = await dashboardRes.json();
      setTotalStudent(dashboardData.students);
      setTotalFaculty(dashboardData.faculty);
      setTotalSubAdmin(dashboardData.subAdmin);

      // 3️⃣ All Students
      const studentRes = await fetch(`${API_BASE}/${domain}/domainAdmin/all_student`, { headers });
      const studentData = await studentRes.json();
      setStudents(studentData);

      // 4️⃣ All Faculty
      const facultyRes = await fetch(`${API_BASE}/${domain}/domainAdmin/all_faculty`, { headers });
      const facultyData = await facultyRes.json();
      setFaculty(facultyData);

      // 5️⃣ All SubAdmins
      const subRes = await fetch(`${API_BASE}/${domain}/domainAdmin/all_subadmin`, { headers });
      const subData = await subRes.json();
      setSubAdmins(subData);

// 
console.log(admin)
    } catch (error) {
      console.error("Error:", error);
      alert("Error:", error)
      localStorage.clear();
      navigate(`/${domain}/login`);
    }
  };

  const handleLogout = () => {
    localStorage.clear();
    navigate(`/${domain}/login`);
  };

  // ===== SELECT ACTIVE DATA =====
  const currentData =
    activeTab === "student"
      ? students
      : activeTab === "faculty"
        ? faculty
        : subAdmins;

  const filteredData = currentData.filter(item =>
    item.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.rollNumber?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.course?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.branch?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.batch?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.email?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const isParentRoute = location.pathname.endsWith("/dashboard");

  return (
    <div className="dashboard-container">
      {/* Toggle Button (OUTSIDE SIDEBAR) */}
      <button className="toggle-btn" onClick={() => setShowSidebar(!showSidebar)} > ☰ </button>

      {/* Sidebar */}
      {showSidebar && (
        <div className="sidebar">

           <div className="profile-pic">
              <img className="profile-pic-img" src={(admin.profilePic)?admin.profilePic:"../../../public/default.png"} alt="Profile" />
          </div>

          <p>ID : {admin.id}</p>
          <p>Name : {admin.name}</p>
          <p>Mobile Number : {admin.mobileNumber}</p>
          <p>Email : {admin.email}</p>
          <p>University Id : {admin.universityId}</p>
          <p>University Name : {admin.universityName}</p>
          <p>University Domain : {admin.domain}</p>
          <p>Last Login : {admin.lastLoginDateTime}</p>
          <p>Account Created Date Time : {admin.createdDateTime}</p>

          <button className="logout-btn" onClick={handleLogout}>Logout</button>
        </div>
      )}

      {/* Main Content */}
      <div className="main-content">

        {isParentRoute ? (
          <>
            {/* COUNT CARDS */}
            <div className="grid grid-cols-3 gap-6 mb-8">
              <button onClick={() => setActiveTab("student")}>
                Students ({totalStudent})
              </button>
              <button onClick={() => setActiveTab("faculty")}>
                Faculty ({totalFaculty})
              </button>
              <button onClick={() => setActiveTab("subAdmin")}>
                SubAdmin ({totalSubAdmin})
              </button>
            </div>

            {/* TABLE */}
            <div className="bg-white shadow rounded-xl p-6">

              <input
                type="text"
                placeholder="Search..."
                onChange={(e) => setSearchQuery(e.target.value)}
                className="border p-2 mb-4"
              />

              <table className="table-wrapper">
                <thead>
                  <tr>
                    <th>Name:</th>
                    <th>Email:</th>
                    <th>Mobile Number:</th>

                    {activeTab === "student" && (
                      <>
                        <th>Roll No:</th>
                        <th>Branch:</th>
                        <th>Batch:</th>
                        <th>Father Name</th>
                        <th>Father Mob No:</th>
                      </>
                    )}

                    {activeTab === "faculty" && (
                      <>
                        <th>Faculty ID:</th>
                        <th>Teaching Batch:</th>
                      </>
                    )}

                    {activeTab === "subAdmin" && (
                      <>
                        <th>SubAdmin ID:</th>
                      </>
                    )}

                    <th>Course:</th>
                    <th>Last Login:</th>
                    <th>Created Date:</th>
                    <th>
                      Password
                      <span style={{ marginLeft: "8px", cursor: "pointer" }} 
                        onClick={() => setShowPassword(!showPassword)}>
                        {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                      </span>
                    </th>
                  </tr>
                </thead>

                <tbody>
                  {filteredData.map((item, index) => (
                    <tr key={index}>
                      <td>{item.name}</td>
                      <td>{item.email}</td>
                      <td>{item.mobileNumber}</td>

                      {activeTab === "student" && (
                        <>
                          <td>{item.rollNumber}</td>
                          <td>{item.branch}</td>
                          <td>{item.batch}</td>
                          <td>{item.fatherName}</td>
                          <td>{item.fatherMobNo}</td>
                        </>
                      )}

                      {activeTab === "faculty" && (
                        <>
                          <td>{item.facultyId}</td>
                          <td>{item.teachingBatch}</td>
                        </>
                      )}

                      {activeTab === "subAdmin" && (
                        <>
                          <td>{item.subAdminId}</td>
                        </>
                      )}

                      <td>{item.course}</td>
                      <td>{item.lastLoginDateTime}</td>
                      <td>{item.createdDateTime}</td>
                      <td>
                        {showPassword
                          ? item.password
                          : "••••••••"}
                      </td>

                    </tr>
                  ))}
                </tbody>
              </table>


            </div>
          </>
        ) : (
          <Outlet />
        )}

      </div>
    </div>
  );
}

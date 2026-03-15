import { useEffect, useState } from "react";
import { useParams, Outlet, useNavigate, useLocation, Link } from "react-router-dom";
import { Search, Edit } from "lucide-react";
import { Eye, EyeOff } from "lucide-react";

import "../Common/css/common.css";
import "./DomainAdminDashboard.css";
import FormatDate from "../../Components/DateTimeFunction/FormatDate";


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

  // ===== Data Lists =====
  const [students, setStudents] = useState([]);
  const [faculty, setFaculty] = useState([]);
  const [subAdmins, setSubAdmins] = useState([]);

  const [activeTab, setActiveTab] = useState("student");
  const [searchQuery, setSearchQuery] = useState("");
  const [showSidebar, setShowSidebar] = useState(true);

  const [editData, setEditData] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const handleChange = (field, value) => {
    setEditData(prev => ({
      ...prev,
      [field]: value
    }));
  };
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
      setAdmin(adminData.data);

      // 2️⃣ Dashboard Total Count of Student, Faculty, SubAdmin
      const dashboardRes = await fetch(`${API_BASE}/${domain}/domainAdmin/get_dashboard`, { headers });
      const dashboardData = await dashboardRes.json();
      setTotalStudent(dashboardData.data.students);
      setTotalFaculty(dashboardData.data.faculty);
      setTotalSubAdmin(dashboardData.data.subAdmin);

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
      console.error("Error:" + error);
      alert("Error:" + error)
      localStorage.removeItem("token");
      localStorage.removeItem("role");

      navigate(`/${domain}/login`);
    }
  };

  const handleProfileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append("profilePic", file);

    try {
      const res = await fetch(`${API_BASE}/${domain}/domainAdmin/update_profile_pic`, {
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

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("role");

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


  const handleEdit = (item) => {
    setEditData({ ...item }); // clone object
    setShowEditModal(true);
  };

  // delete 
  const handleDelete = async (item) => {

    if (!window.confirm("Delete this user?")) return;

    try {

      let url = "";

      if (activeTab === "student")
        url = `${API_BASE}/${domain}/domainAdmin/delete_student_by_email?email=${item.email}`;

      if (activeTab === "faculty")
        url = `${API_BASE}/${domain}/domainAdmin/delete_faculty_by_facultyId?facultyId=${item.facultyId}`;

      if (activeTab === "subAdmin")
        url = `${API_BASE}/${domain}/domainAdmin/delete_subadmin_by_subadminId?subAdminId=${item.subAdminId}`;

      await fetch(url, {
        method: "DELETE",
        headers: {
          "Authorization": `Bearer ${localStorage.getItem("token")}`
        }
      });

      fetchAllData();

    } catch (err) {
      alert(err.message);
    }
  };

  const handleUpdate = async () => {

    try {

      let url = "";

      if (activeTab === "student")
        url = `${API_BASE}/${domain}/domainAdmin/update_student_by_email`;

      if (activeTab === "faculty")
        url = `${API_BASE}/${domain}/domainAdmin/update_faculty_by_facultyId`;

      if (activeTab === "subAdmin")
        url = `${API_BASE}/${domain}/domainAdmin/update_subadmin_by_subadminId`;

      const dataToSend = { ...editData };

      // remove protected fields
      delete dataToSend.email;
      delete dataToSend.password;
      delete dataToSend.lastLoginDateTime;
      delete dataToSend.createdDateTime;
      delete dataToSend.profilePic;

      const res = await fetch(url, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${localStorage.getItem("token")}`
        },
        body: JSON.stringify(dataToSend)
      });

      if (!res.ok) throw new Error("Update failed");

      alert("Updated Successfully");

      setShowEditModal(false);

      fetchAllData();

    } catch (err) {
      alert(err.message);
    }
  };

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-slate-50 dark:bg-slate-950 transition-colors duration-300">      {/* Toggle Button (OUTSIDE SIDEBAR) */}
      <aside>
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
                src={admin.profilePic ? `${API_BASE}/${admin.profilePic}` : "/default.png"}
                alt="Profile"
                onDoubleClick={() => document.getElementById("profileUpload").click()}
              />

              <p>ID : {admin.id}</p>
              <p>Name : {admin.name}</p>
              <p>Mobile Number : {admin.mobileNumber}</p>
              <p>Email : {admin.email}</p>
              <p>University Id : {admin.universityId}</p>
              <p>University Name : {admin.universityName}</p>
              <p>University Domain : {admin.domain}</p>
              <p>Last Login : {FormatDate(admin.lastLoginDateTime)}</p>
              <p>Account Created Date Time : {FormatDate(admin.createdDateTime)}</p>

            </div>
            <button className="logout-btn" onClick={handleLogout}>Logout</button>
          </div>
        )}
      </aside>


      {/* Main Content */}
      <div className="main-content">

        {isParentRoute ? (
          <>
            <div className="card-grid">
              <Link className="main-content-Link" to={"all-students"} ><div className="card">All Students : {totalStudent}</div> </Link>
              <Link className="main-content-Link" to={"all-faculty"} ><div className="card">All Faculty : {totalFaculty}</div> </Link>
              <Link className="main-content-Link" to={"all-subAdmin"} ><div className="card">All SubAdmin : {totalSubAdmin}</div> </Link>
              {/* common student and faculty */}
              <Link className="main-content-Link" to={"notepad"}><div className="card">Notepad</div> </Link>
            </div>

            {/* COUNT CARDS */}
            <div className="grid grid-cols-3 gap-6 mt-10">
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
            <div className="shadow rounded-xl p-6">

              <input
                type="text"
                placeholder="Search..."
                onChange={(e) => setSearchQuery(e.target.value)}
                className="border p-2 mb-4"
              />

              <table className="table-wrapper">
                <thead>
                  <tr>
                    <th>S.NO</th>
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
                    <th>Actions</th>

                  </tr>
                </thead>

                <tbody>
                  {filteredData.map((item, index) => (
                    <tr key={index}>

                      <td>{index + 1}</td>
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

                      <td>
                        <button className="mb-2" onClick={() => handleEdit(item)}>
                          <Edit size={20} />
                        </button>

                        <button onClick={() => handleDelete(item)}>
                          Delete
                        </button>
                      </td>

                    </tr>
                  ))}
                </tbody>
              </table>
              {showEditModal && (
                <div className="modal-overlay">

                  <div className="modal-box dark:bg-gray-700  bg-white">

                    <h2 className="underline text-red-700 mb-3 ">Edit {activeTab}</h2>

                    {/* COMMON FIELDS */}

                    <label>Name</label>
                    <input
                      value={editData.name || ""}
                      onChange={(e) => handleChange("name", e.target.value)}
                    />

                    <label>Mobile</label>
                    <input
                      value={editData.mobileNumber || ""}
                      onChange={(e) => handleChange("mobileNumber", e.target.value)}
                    />

                    <label>Course</label>
                    <input
                      value={editData.course || ""}
                      onChange={(e) => handleChange("course", e.target.value)}
                    />

                    {/* STUDENT FIELDS */}
                    {activeTab === "student" && (
                      <>
                        <label>Roll Number</label>
                        <input
                          value={editData.rollNumber || ""}
                          onChange={(e) => handleChange("rollNumber", e.target.value)}
                        />

                        <label>Branch</label>
                        <input
                          value={editData.branch || ""}
                          onChange={(e) => handleChange("branch", e.target.value)}
                        />

                        <label>Batch</label>
                        <input
                          value={editData.batch || ""}
                          onChange={(e) => handleChange("batch", e.target.value)}
                        />

                        <label>Father Name</label>
                        <input
                          value={editData.fatherName || ""}
                          onChange={(e) => handleChange("fatherName", e.target.value)}
                        />

                        <label>Father Mobile</label>
                        <input
                          value={editData.fatherMobNo || ""}
                          onChange={(e) => handleChange("fatherMobNo", e.target.value)}
                        />
                      </>
                    )}

                    {/* FACULTY FIELDS */}
                    {activeTab === "faculty" && (
                      <>
                        <label>Faculty ID</label>
                        <input
                          value={editData.facultyId || ""}
                          onChange={(e) => handleChange("facultyId", e.target.value)}
                        />

                        <label>Teaching Batch</label>
                        <input
                          value={editData.teachingBatch || ""}
                          onChange={(e) => handleChange("teachingBatch", e.target.value)}
                        />
                      </>
                    )}

                    {/* SUBADMIN FIELDS */}
                    {activeTab === "subAdmin" && (
                      <>
                        <label>SubAdmin ID</label>
                        <input
                          value={editData.subAdminId || ""}
                          onChange={(e) => handleChange("subAdminId", e.target.value)}
                        />
                      </>
                    )}

                    <div className="modal-actions">
                      <button onClick={handleUpdate}>Save</button>
                      <button onClick={() => setShowEditModal(false)}>Cancel</button>
                    </div>

                  </div>

                </div>
              )}
            </div>


          </>
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

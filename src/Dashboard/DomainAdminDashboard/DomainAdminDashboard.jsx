import { useEffect, useRef, useState } from "react";
import { useParams, Outlet, useNavigate, useLocation, Link } from "react-router-dom";
import { Eye, EyeOff, Building2 } from "lucide-react";
import "../Common/css/common.css";
import "./DomainAdminDashboard.css";
import FormatDate from "../../Components/DateTimeFunction/FormatDate";
import ChangePasswordModal from "../../Components/Auth/ChangePasswordModal";

// ─────────────────────────────────────────────
// Reusable Modal wrapper
// ─────────────────────────────────────────────
function Modal({ title, onClose, children }) {
  return (
    <div style={modalStyles.overlay}>
      <div style={modalStyles.box}>
        <div style={modalStyles.header}>
          <h3 style={{ margin: 0 }} className="dark:text-black">{title}</h3>
          <button onClick={onClose} style={modalStyles.closeBtn}>✕</button>
        </div>
        <div style={modalStyles.body}>{children}</div>
      </div>
    </div>
  );
}

const modalStyles = {
  overlay: { position: "fixed", inset: 0, background: "rgba(0,0,0,0.55)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000 },
  box: { background: "#fff", borderRadius: 12, width: "min(520px, 95vw)", maxHeight: "90vh", overflowY: "auto", boxShadow: "0 8px 32px rgba(0,0,0,.25)" },
  header: { display: "flex", justifyContent: "space-between", alignItems: "center", padding: "16px 20px", borderBottom: "1px solid #cf2e2e" },
  body: { padding: "20px" },
  closeBtn: { background: "none", border: "none", fontSize: 18, cursor: "pointer", color: "#6b7280" },
};

const fieldStyle = { width: "100%", padding: "8px 10px", marginBottom: 10, borderRadius: 6, border: "1px solid #d1d5db", fontSize: 14, boxSizing: "border-box" };
const labelStyle = { fontSize: 12, color: "#374151", fontWeight: 600, display: "block", marginBottom: 3 };
const submitBtnStyle = { width: "100%", padding: "10px", borderRadius: 6, border: "none", background: "#2563eb", color: "#fff", fontWeight: 700, fontSize: 15, cursor: "pointer", marginTop: 4 };
const dangerBtnStyle = { ...submitBtnStyle, background: "#dc2626" };

// ─────────────────────────────────────────────
// DomainAdmin Dashboard
// ─────────────────────────────────────────────
export default function DomainAdminDashboard() {
  const API_BASE = import.meta.env.VITE_API_BASE_URL;
  const { domain } = useParams();
  const navigate = useNavigate();
  const location = useLocation();

  const [admin, setAdmin] = useState({});
  const [totalStudent, setTotalStudent] = useState(0);
  const [totalFaculty, setTotalFaculty] = useState(0);
  const [totalSubAdmin, setTotalSubAdmin] = useState(0);
  const [students, setStudents] = useState([]);
  const [faculty, setFaculty] = useState([]);
  const [subAdmins, setSubAdmins] = useState([]);

  const [activeTab, setActiveTab] = useState("student");
  const [searchQuery, setSearchQuery] = useState("");
  const [showSidebar, setShowSidebar] = useState(true);
  const [showPassword, setShowPassword] = useState(false);

  // Modal visibility
  const [showProfilePicModal, setShowProfilePicModal] = useState(false);
  const [showUniversityLogo, setShowUniversityLogo] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [logoUploading, setLogoUploading] = useState(false);
  // ── NEW: OTP-guarded password modal ──
  const [showChangePasswordModal, setShowChangePasswordModal] = useState(false);

  // Form states
  const [profilePicFile, setProfilePicFile] = useState(null);
  const [profilePicPreview, setProfilePicPreview] = useState(null);
  const [universityLogo, setUniversityLogo] = useState(null);
  const [addForm, setAddForm] = useState({});
  const [editForm, setEditForm] = useState({});
  const [uploadFile, setUploadFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const uploadInputRef = useRef(null);

  // Feedback
  const [actionMsg, setActionMsg] = useState("");
  const [actionErr, setActionErr] = useState("");
  const clearFeedback = () => { setActionMsg(""); setActionErr(""); };

  useEffect(() => { fetchAllData(); }, [domain]);

  const fetchAllData = async () => {
    try {
      const headers = { "Authorization": `Bearer ${localStorage.getItem("token")}`, "Content-Type": "application/json" };
      const [adminRes, dashRes, studentRes, facultyRes, subRes] = await Promise.all([
        fetch(`${API_BASE}/${domain}/domainAdmin`, { headers }),
        fetch(`${API_BASE}/${domain}/domainAdmin/get_dashboard`, { headers }),
        fetch(`${API_BASE}/${domain}/domainAdmin/all_student`, { headers }),
        fetch(`${API_BASE}/${domain}/domainAdmin/all_faculty`, { headers }),
        fetch(`${API_BASE}/${domain}/domainAdmin/all_subadmin`, { headers }),
      ]);
      const adminData = await adminRes.json();
      const dashData = await dashRes.json();
      const studentData = await studentRes.json();
      const facultyData = await facultyRes.json();
      const subData = await subRes.json();

      setAdmin(adminData.data || {});
      setTotalStudent(dashData.data?.students || 0);
      setTotalFaculty(dashData.data?.faculty || 0);
      setTotalSubAdmin(dashData.data?.subAdmin || 0);
      setStudents(Array.isArray(studentData) ? studentData : []);
      setFaculty(Array.isArray(facultyData) ? facultyData : []);
      setSubAdmins(Array.isArray(subData) ? subData : []);
    } catch {
      localStorage.clear();
      navigate(`/${domain}/login`);
    }
  };

  const authHeaders = () => ({
    "Authorization": `Bearer ${localStorage.getItem("token")}`,
    "Content-Type": "application/json",
  });

  const handleLogout = () => { localStorage.clear(); navigate(`/${domain}/login`); };

  // ── Table data ────────────────────────────────────────────────────────────
  const currentData = activeTab === "student" ? students : activeTab === "faculty" ? faculty : subAdmins;
  const filteredData = currentData.filter(item =>
    item.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.rollNumber?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.course?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.branch?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.batch?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.email?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const isParentRoute = location.pathname.endsWith("/dashboard");
  const activeTabLabel = activeTab === "student" ? "Student" : activeTab === "faculty" ? "Faculty" : "SubAdmin";

  // ── Profile Picture ──────────────────────────────────────────────────────
  const handleProfilePicChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setProfilePicFile(file); setProfilePicPreview(URL.createObjectURL(file));
  };

  const handleUpdateProfilePic = async () => {
    clearFeedback();
    if (!profilePicFile) { setActionErr("Please select a file first."); return; }
    try {
      const formData = new FormData();
      formData.append("profilePic", profilePicFile);
      const res = await fetch(`${API_BASE}/${domain}/domainAdmin/update_profile_pic`, {
        method: "PUT", headers: { "Authorization": `Bearer ${localStorage.getItem("token")}` }, body: formData,
      });
      const data = await res.json();
      if (data.success) {
        setActionMsg("Profile picture updated successfully!");
        setAdmin(prev => ({ ...prev, profilePic: data.data }));
        setShowProfilePicModal(false); setProfilePicFile(null); setProfilePicPreview(null);
      } else {
        setActionErr(data.message || "Failed to update profile picture.");
      }
    } catch (err) { setActionErr("Network error: " + err.message); }
  };

  useEffect(() => {
    return () => {
      if (universityLogo) {
        URL.revokeObjectURL(universityLogo);
      }
    };
  }, [universityLogo]);
  // ── University logo ───────────────────────────────────────────────────────
  const handleUpdateLogo = async () => {
    clearFeedback();

    if (!universityLogo) {
      setActionErr("Please select a logo file first.");
      return;
    }

    // ✅ File validation
    if (!universityLogo.type.startsWith("image/")) {
      setActionErr("Only image files are allowed.");
      return;
    }

    if (universityLogo.size > 2 * 1024 * 1024) {
      setActionErr("File size must be less than 2MB.");
      return;
    }

    try {
      setLogoUploading(true);

      const formData = new FormData();
      formData.append("profilePic", universityLogo);

      const res = await fetch(
        `${API_BASE}/${domain}/domainAdmin/update_university_logo`,
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
          body: formData,
        }
      );

      const data = await res.json();

      if (data.success) {
        setActionMsg("University logo updated successfully!");
        setShowUniversityLogo(false);
        setUniversityLogo(null);

        fetchAllData(); // 🔥 refresh UI
      } else {
        setActionErr(data.message || "Failed to update logo.");
      }
    } catch (e) {
      setActionErr("Network error: " + e.message);
    } finally {
      setLogoUploading(false);
    }
  };

  // ── OTP modal callback ────────────────────────────────────────────────────
  // Backend: PUT /{domain}/domainAdmin/forgot_update_password?newPassword=
  const handleChangePassword = (newPassword) =>
    fetch(
      `${API_BASE}/${domain}/domainAdmin/forgot_update_password?newPassword=${encodeURIComponent(newPassword)}`,
      { method: "PUT", headers: authHeaders() }
    );

  // ── Add / Edit / Delete ───────────────────────────────────────────────────
  const handleAdd = async () => {
    clearFeedback();
    const endpointMap = { student: "add_student", faculty: "add_faculty", subAdmin: "add_subAdmin" };
    try {
      const res = await fetch(`${API_BASE}/${domain}/domainAdmin/${endpointMap[activeTab]}`, {
        method: "POST", headers: authHeaders(), body: JSON.stringify(addForm),
      });
      const text = await res.text();
      if (!res.ok) { setActionErr(text || "Failed to add."); return; }
      setActionMsg(text || "Added successfully!");
      setShowAddModal(false); setAddForm({}); fetchAllData();
    } catch (err) { setActionErr("Network error: " + err.message); }
  };

  const openEditModal = (item) => { setSelectedItem(item); setEditForm({ ...item }); clearFeedback(); setShowEditModal(true); };

  const handleEdit = async () => {
    clearFeedback();
    const endpointMap = { student: "update_student_profile", faculty: "update_faculty", subAdmin: "update_subadmin" };
    try {
      const res = await fetch(`${API_BASE}/${domain}/domainAdmin/${endpointMap[activeTab]}`, {
        method: "PUT", headers: authHeaders(), body: JSON.stringify(editForm),
      });
      if (res.ok) {
        setActionMsg("Updated successfully!"); setShowEditModal(false); setSelectedItem(null); fetchAllData();
      } else {
        setActionErr(await res.text() || "Update failed.");
      }
    } catch (err) { setActionErr("Network error: " + err.message); }
  };

  const openDeleteModal = (item) => { setSelectedItem(item); clearFeedback(); setShowDeleteModal(true); };

  const handleDelete = async () => {
    clearFeedback();
    const endpointMap = {
      student: `delete_student?email=${encodeURIComponent(selectedItem.email)}`,
      faculty: `delete_faculty?email=${encodeURIComponent(selectedItem.email)}`,
      subAdmin: `delete_subadmin?email=${encodeURIComponent(selectedItem.email)}`,
    };
    try {
      const res = await fetch(`${API_BASE}/${domain}/domainAdmin/${endpointMap[activeTab]}`, { method: "DELETE", headers: authHeaders() });
      const text = await res.text();
      if (res.ok) {
        setActionMsg(text || "Deleted successfully!"); setShowDeleteModal(false); setSelectedItem(null); fetchAllData();
      } else {
        setActionErr(text || "Delete failed.");
      }
    } catch (err) { setActionErr("Network error: " + err.message); }
  };

  const handleExcelUpload = async () => {
    clearFeedback();
    if (!uploadFile) { setActionErr("Please select an Excel file first."); return; }
    const endpointMap = { student: "upload_students", faculty: "upload_faculty", subAdmin: "upload_subAdmin" };
    try {
      setUploading(true);
      const formData = new FormData();
      formData.append("file", uploadFile);
      const res = await fetch(`${API_BASE}/${domain}/domainAdmin/${endpointMap[activeTab]}`, {
        method: "POST", headers: { "Authorization": `Bearer ${localStorage.getItem("token")}` }, body: formData,
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setActionMsg(data.message || "Uploaded successfully!");
        setShowUploadModal(false); setUploadFile(null);
        if (uploadInputRef.current) uploadInputRef.current.value = "";
        fetchAllData();
      } else {
        setActionErr(data.message || "Upload failed.");
      }
    } catch (err) { setActionErr("Network error: " + err.message); }
    finally { setUploading(false); }
  };

  // ── Field definitions ─────────────────────────────────────────────────────
  const studentFields = [
    { key: "name", label: "Full Name", type: "text" },
    { key: "email", label: "Email", type: "email" },
    { key: "mobileNumber", label: "Mobile Number", type: "text" },
    { key: "rollNumber", label: "Roll Number", type: "text" },
    { key: "course", label: "Course", type: "text" },
    { key: "branch", label: "Branch", type: "text" },
    { key: "batch", label: "Batch", type: "text" },
    { key: "fatherName", label: "Father Name", type: "text" },
    { key: "fatherMobNo", label: "Father Mobile Number", type: "text" },
  ];
  const facultyFields = [
    { key: "name", label: "Full Name", type: "text" },
    { key: "email", label: "Email", type: "email" },
    { key: "mobileNumber", label: "Mobile Number", type: "text" },
    { key: "facultyId", label: "Faculty ID", type: "text" },
    { key: "course", label: "Course", type: "text" },
    { key: "teachingBatch", label: "Teaching Batch", type: "text" },
  ];
  const subAdminFields = [
    { key: "name", label: "Full Name", type: "text" },
    { key: "email", label: "Email", type: "email" },
    { key: "mobileNumber", label: "Mobile Number", type: "text" },
    { key: "subAdminId", label: "SubAdmin ID", type: "text" },
    { key: "course", label: "Course", type: "text" },
  ];
  const activeFields = activeTab === "student" ? studentFields : activeTab === "faculty" ? facultyFields : subAdminFields;

  return (
    <div className="dashboard-container">
      <button className="toggle-btn" onClick={() => setShowSidebar(!showSidebar)}>☰</button>

      {/* ── Sidebar ── */}
      {showSidebar && (
        <div className="sidebar">
          <div className="profile-section">
            <div
              className="profile-pic"
              style={{ position: "relative", cursor: "pointer" }}
              onClick={() => { clearFeedback(); setShowProfilePicModal(true); }}
              title="Click to update profile picture"
            >
              <img className="profile-pic-img" src={admin.profilePic ? `${API_BASE}/${admin.profilePic}` : "/default.png"} alt="Profile" />
              <div style={{ position: "absolute", bottom: 0, right: 0, background: "#2563eb", borderRadius: "50%", width: 26, height: 26, display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontSize: 13, border: "2px solid #fff" }}>✎</div>
            </div>

            <p><strong>Admin ID:</strong>         {admin.id}</p>
            <p><strong>Name:</strong>             {admin.name}</p>
            <p><strong>Mobile:</strong>           {admin.mobileNumber}</p>
            <p><strong>Email:</strong>            {admin.email}</p>
            <p><strong>University ID:</strong>    {admin.universityId}</p>
            <p><strong>University Name:</strong>  {admin.universityName}</p>
            <p><strong>Domain:</strong>           {admin.domain}</p>
            <p><strong>Last Login:</strong>       {FormatDate(admin.lastLoginDateTime)}</p>
            <p><strong>Account Created:</strong>  {FormatDate(admin.createdDateTime)}</p>
          </div>

        {/*Change Password  */}
          <button
            style={{ width: "calc(100% - 32px)", margin: "0 16px 10px", padding: "9px", borderRadius: 6, border: "1px solid #2563eb", background: "transparent", color: "#2563eb", fontWeight: 600, cursor: "pointer" }}
            onClick={() => { clearFeedback(); setShowChangePasswordModal(true); }}
          >🔑 Change Password</button>

          {/* Update University Logo */}

          <button
            onClick={() => { clearFeedback(); setShowUniversityLogo(true); }}
            style={{ width: "calc(100% - 32px)", margin: "0 16px 10px", padding: "9px", borderRadius: 6, border: "1px solid #eb2f25", background: "transparent", color: "#eb2f25", fontWeight: 600, cursor: "pointer" }}
          > 🏢 Update University Logo</button>

          <button className="logout-btn" onClick={handleLogout}>Logout</button>
        </div>
      )}

      {/* ── Main Content ── */}
      <div className="main-content">
        {actionMsg && (
          <div style={{ background: "#d1fae5", border: "1px solid #6ee7b7", color: "#065f46", borderRadius: 8, padding: "10px 16px", marginBottom: 12, display: "flex", justifyContent: "space-between" }}>
            ✅ {actionMsg}<span style={{ cursor: "pointer", fontWeight: 700 }} onClick={() => setActionMsg("")}>✕</span>
          </div>
        )}
        {actionErr && (
          <div style={{ background: "#fee2e2", border: "1px solid #fca5a5", color: "#991b1b", borderRadius: 8, padding: "10px 16px", marginBottom: 12, display: "flex", justifyContent: "space-between" }}>
            ❌ {actionErr}<span style={{ cursor: "pointer", fontWeight: 700 }} onClick={() => setActionErr("")}>✕</span>
          </div>
        )}

        {isParentRoute ? (
          <>
            <div className="card-grid">
              <Link className="main-content-Link" to={"all-students"}><div className="card">All Students: {totalStudent}</div></Link>
              <Link className="main-content-Link" to={"all-faculty"}><div className="card">All Faculty: {totalFaculty}</div></Link>
              <Link className="main-content-Link" to={"all-subAdmin"}><div className="card">All SubAdmin: {totalSubAdmin}</div></Link>
              <Link className="main-content-Link" to={"notepad"}><div className="card">Notepad</div></Link>
            </div>

            <div className="grid grid-cols-3 gap-6 mt-8">
              {["student", "faculty", "subAdmin"].map(tab => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  style={{ fontWeight: activeTab === tab ? 700 : 400, borderBottom: activeTab === tab ? "2px solid #2563eb" : "none" }}
                >
                  {tab === "student" ? `Students (${totalStudent})` : tab === "faculty" ? `Faculty (${totalFaculty})` : `SubAdmin (${totalSubAdmin})`}
                </button>
              ))}
            </div>

            <div className="shadow rounded-xl p-6" >
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12, flexWrap: "wrap" }}>
                <input type="text" placeholder={`Search ${activeTabLabel}...`} onChange={e => setSearchQuery(e.target.value)} className="border p-2 mt-3" />
                <button onClick={() => { setAddForm({}); clearFeedback(); setShowAddModal(true); }} style={{ padding: "8px 16px", borderRadius: 6, border: "none", background: "#16a34a", color: "#fff", fontWeight: 700, cursor: "pointer" }}>
                  + Add {activeTabLabel}
                </button>
                <button onClick={() => { clearFeedback(); setUploadFile(null); setShowUploadModal(true); }} style={{ padding: "8px 16px", borderRadius: 6, border: "none", background: "#0891b2", color: "#fff", fontWeight: 700, cursor: "pointer" }}>
                  📥 Upload Excel
                </button>
              </div>

              <div style={{ overflowX: "auto", maxHeight: "500px", overflowY: "auto" }}>

                <table className="table-wrapper" >
                  <thead>
                    <tr>
                      <th>S.No</th>
                      {activeTab === "student" && <th>Roll No</th>}
                      {activeTab === "faculty" && <th>Faculty ID</th>}
                      {activeTab === "subAdmin" && <th>SubAdmin ID</th>}
                      
                      <th>Name</th><th>Course</th>
                      {activeTab === "student" && <><th>Branch</th><th>Batch</th></>}
                      {activeTab === "faculty" && <th>Teaching Batch</th>}
                      <th>Email</th><th>Mobile</th>
                      
                      {activeTab === "student" && <><th>Father Name</th><th>Father Mob</th></>}
                      <th>Created At</th><th>Last Login</th>
                      <th>
                        Password
                        <span style={{ marginLeft: 8, cursor: "pointer" }} onClick={() => setShowPassword(!showPassword)}>
                          {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                        </span>
                      </th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredData.map((item, index) => (
                      <tr key={index}>
                        <td>{index + 1}</td>
                        {activeTab === "student" && <td>{item.rollNumber}</td>}
                        {activeTab === "faculty" && <td>{item.facultyId}</td>}
                        {activeTab === "subAdmin" && <td>{item.subAdminId}</td>}
                        
                        <td>{item.name}</td><td>{item.course}</td>
                        {activeTab === "student" && <><td>{item.branch}</td><td>{item.batch}</td></>}
                        {activeTab === "faculty" && <td>{item.teachingBatch}</td>}
                        <td>{item.email}</td><td>{item.mobileNumber}</td>

                        {activeTab === "student" && <><td>{item.fatherName}</td><td>{item.fatherMobNo}</td></>}
                        <td>{FormatDate(item.createdDateTime)}</td>
                        <td>{FormatDate(item.lastLoginDateTime)}</td>
                        <td>{showPassword ? item.password : "••••••••"}</td>
                        <td>
                          <button onClick={() => openEditModal(item)} style={{ marginRight: 6, marginBottom: 4, padding: "4px 12px", borderRadius: 5, border: "none", background: "#2563eb", color: "#fff", cursor: "pointer", fontWeight: 600, fontSize: 13 }}>✎ Edit</button>
                          <button onClick={() => openDeleteModal(item)} style={{ padding: "4px 12px", borderRadius: 5, border: "none", background: "#dc2626", color: "#fff", cursor: "pointer", fontWeight: 600, fontSize: 13 }}>🗑 Delete</button>
                        </td>
                      </tr>
                    ))}
                    {filteredData.length === 0 && (
                      <tr><td colSpan={20} style={{ textAlign: "center", color: "#9ca3af", padding: 24 }}>No {activeTabLabel.toLowerCase()}s found.</td></tr>
                    )}
                  </tbody>
                </table>
              </div>

            </div>
          </>
        ) : (
          <div className="sub-page-container">
            <button className="back-btn" onClick={() => navigate(-1)}>← Back to Dashboard</button>
            <Outlet />
          </div>
        )}
      </div>

      {/* ════════════ MODALS ════════════ */}

      {showProfilePicModal && (
        <Modal title="Update Profile Picture" onClose={() => { setShowProfilePicModal(false); clearFeedback(); }}>
          <div style={{ textAlign: "center", marginBottom: 16 }}>
            <img src={profilePicPreview || (admin.profilePic ? `${API_BASE}/${admin.profilePic}` : "/default.png")} alt="Preview" style={{ width: 110, height: 110, borderRadius: "50%", objectFit: "cover", border: "3px solid #e5e7eb" }} />
          </div>
          <label style={labelStyle}>Choose New Profile Picture</label>
          <input type="file" accept="image/*" onChange={handleProfilePicChange} style={{ ...fieldStyle, padding: "6px" }} />
          {actionErr && <p style={{ color: "#dc2626", marginBottom: 8 }}>{actionErr}</p>}
          {actionMsg && <p style={{ color: "#16a34a", marginBottom: 8 }}>{actionMsg}</p>}
          <button style={submitBtnStyle} onClick={handleUpdateProfilePic}>Upload &amp; Save</button>
        </Modal>
      )}

      {/* University Logo */}
      {showUniversityLogo && (
        <Modal
          title="Update University Logo"
          onClose={() => {
            setShowUniversityLogo(false);
            clearFeedback();
          }}
        >
          {/* Preview */}
          {universityLogo && (
            <div style={{ textAlign: "center", marginBottom: 16 }}>
              <img
                src={URL.createObjectURL(universityLogo)}
                alt="Logo Preview"
                style={{
                  width: 120,
                  height: 120,
                  objectFit: "cover",
                  borderRadius: 8,
                  border: "2px solid #eb2f25",
                }}
              />
            </div>
          )}

          {/* Input */}
          <label style={labelStyle}>Select Logo</label>
          <input
            type="file"
            accept="image/*"
            onChange={(e) =>
              setUniversityLogo(e.target.files[0] || null)
            }
            style={{ ...fieldStyle, padding: "6px" }}
          />

          {/* Feedback */}
          {actionErr && (
            <p style={{ color: "#dc2626", marginBottom: 8 }}>
              {actionErr}
            </p>
          )}
          {actionMsg && (
            <p style={{ color: "#16a34a", marginBottom: 8 }}>
              {actionMsg}
            </p>
          )}

          {/* Button */}
          <button style={submitBtnStyle} onClick={handleUpdateLogo}>
            Upload Logo
          </button>
        </Modal>
      )}

      {showAddModal && (
        <Modal title={`Add ${activeTabLabel}`} onClose={() => { setShowAddModal(false); clearFeedback(); }}>
          {activeFields.map(f => (
            <div key={f.key}>
              <label style={labelStyle}>{f.label}</label>
              <input type={f.type} placeholder={f.label} value={addForm[f.key] || ""} onChange={e => setAddForm(prev => ({ ...prev, [f.key]: e.target.value }))} style={fieldStyle} />
            </div>
          ))}
          {actionErr && <p style={{ color: "#dc2626", marginBottom: 8 }}>{actionErr}</p>}
          {actionMsg && <p style={{ color: "#16a34a", marginBottom: 8 }}>{actionMsg}</p>}
          <button style={submitBtnStyle} onClick={handleAdd}>Add {activeTabLabel}</button>
        </Modal>
      )}

      {showEditModal && selectedItem && (
        <Modal title={`Edit ${activeTabLabel}`} onClose={() => { setShowEditModal(false); clearFeedback(); }}>
          {activeFields.map(f => (
            <div key={f.key}>
              <label style={labelStyle}>{f.label}</label>
              <input type={f.type === "password" ? "text" : f.type} placeholder={f.label} value={editForm[f.key] || ""} onChange={e => setEditForm(prev => ({ ...prev, [f.key]: e.target.value }))} style={fieldStyle} readOnly={f.key === "email"} />
            </div>
          ))}
          {actionErr && <p style={{ color: "#dc2626", marginBottom: 8 }}>{actionErr}</p>}
          {actionMsg && <p style={{ color: "#16a34a", marginBottom: 8 }}>{actionMsg}</p>}
          <button style={submitBtnStyle} onClick={handleEdit}>Save Changes</button>
        </Modal>
      )}

      {showDeleteModal && selectedItem && (
        <Modal title={`Delete ${activeTabLabel}`} onClose={() => { setShowDeleteModal(false); clearFeedback(); }}>
          <p style={{ fontSize: 15, color: "#374151", marginBottom: 6 }}>Are you sure you want to delete:</p>
          <div style={{ background: "#f3f4f6", borderRadius: 8, padding: "12px 14px", marginBottom: 16 }}>
            <p style={{ margin: "2px 0", fontWeight: 700 }}>{selectedItem.name}</p>
            <p style={{ margin: "2px 0", color: "#6b7280", fontSize: 13 }}>{selectedItem.email}</p>
          </div>
          <p style={{ color: "#dc2626", fontSize: 13, marginBottom: 14 }}>⚠️ This action cannot be undone.</p>
          {actionErr && <p style={{ color: "#dc2626", marginBottom: 8 }}>{actionErr}</p>}
          {actionMsg && <p style={{ color: "#16a34a", marginBottom: 8 }}>{actionMsg}</p>}
          <div style={{ display: "flex", gap: 10 }}>
            <button style={{ ...submitBtnStyle, background: "#6b7280" }} onClick={() => setShowDeleteModal(false)}>Cancel</button>
            <button style={dangerBtnStyle} onClick={handleDelete}>Yes, Delete</button>
          </div>
        </Modal>
      )}

      {showUploadModal && (
        <Modal title={`Bulk Upload ${activeTabLabel}s via Excel`} onClose={() => { setShowUploadModal(false); clearFeedback(); setUploadFile(null); }}>
          <div style={{ background: "#eff6ff", border: "1px solid #bfdbfe", borderRadius: 8, padding: "12px 14px", marginBottom: 16 }}>
            <p style={{ margin: 0, fontSize: 13, color: "#1d4ed8", fontWeight: 600 }}>📋 Excel Format Required</p>
            <p style={{ margin: "4px 0 0", fontSize: 12, color: "#1e40af" }}>
              {activeTab === "student" && "Columns: rollNumber, name, email, mobileNumber, course, branch, batch, fatherName, fatherMobNo, password"}
              {activeTab === "faculty" && "Columns: facultyId, name, email, mobileNumber,  course, teachingBatch,  password"}
              {activeTab === "subAdmin" && "Columns: subAdminId, name, email, mobileNumber, course,  password"}
            </p>
          </div>
          <label style={labelStyle}>Select Excel File (.xlsx / .xls)</label>
          <input ref={uploadInputRef} type="file" accept=".xlsx,.xls" onChange={e => setUploadFile(e.target.files[0] || null)} style={{ ...fieldStyle, padding: "6px" }} />
          {uploadFile && <p style={{ fontSize: 13, color: "#374151", marginBottom: 8 }}>Selected: <strong>{uploadFile.name}</strong></p>}
          {actionErr && <p style={{ color: "#dc2626", marginBottom: 8 }}>{actionErr}</p>}
          {actionMsg && <p style={{ color: "#16a34a", marginBottom: 8 }}>{actionMsg}</p>}
          <button style={{ ...submitBtnStyle, background: uploading ? "#9ca3af" : "#0891b2" }} onClick={handleExcelUpload} disabled={uploading}>
            {uploading ? "Uploading..." : `Upload ${activeTabLabel}s`}
          </button>
        </Modal>
      )}

      {/* ── NEW: OTP-guarded Change Password ── */}
      {showChangePasswordModal && (
        <ChangePasswordModal
          email={admin.email}
          apiBase={API_BASE}
          onChangePassword={handleChangePassword}
          onClose={() => setShowChangePasswordModal(false)}
          onSuccess={() => { setShowChangePasswordModal(false); setActionMsg("Password updated successfully!"); }}
        />
      )}
    </div>
  );
}





































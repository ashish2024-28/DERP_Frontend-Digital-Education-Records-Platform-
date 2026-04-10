
// import { useEffect, useState } from "react";
// import { Link, useParams, Outlet, useNavigate, useLocation } from "react-router-dom";
// import "../Common/css/common.css";
// import "./FacultyDashboard.css";
// import FormatDate from "../../Components/DateTimeFunction/FormatDate";

// // ─────────────────────────────────────────────
// // Shared Modal Component
// // ─────────────────────────────────────────────
// function Modal({ title, onClose, children }) {
//   return (
//     <div style={modalStyles.overlay}>
//       <div style={modalStyles.box}>
//         <div style={modalStyles.header}>
//           <h3 style={{ margin: 0, fontSize: 17 }}>{title}</h3>
//           <button onClick={onClose} style={modalStyles.closeBtn}>✕</button>
//         </div>
//         <div style={modalStyles.body}>{children}</div>
//       </div>
//     </div>
//   );
// }

// const modalStyles = {
//   overlay: {
//     position: "fixed", inset: 0, background: "rgba(0,0,0,0.55)",
//     display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000,
//   },
//   box: {
//     background: "#fff", borderRadius: 12, width: "min(500px, 95vw)",
//     maxHeight: "90vh", overflowY: "auto", boxShadow: "0 8px 32px rgba(0,0,0,.25)",
//   },
//   header: {
//     display: "flex", justifyContent: "space-between", alignItems: "center",
//     padding: "16px 20px", borderBottom: "1px solid #e5e7eb",
//   },
//   body: { padding: "20px" },
//   closeBtn: { background: "none", border: "none", fontSize: 18, cursor: "pointer", color: "#6b7280" },
// };

// const fieldStyle = {
//   width: "100%", padding: "8px 10px", marginBottom: 10, borderRadius: 6,
//   border: "1px solid #d1d5db", fontSize: 14, boxSizing: "border-box",
// };
// const labelStyle = { fontSize: 12, color: "#374151", fontWeight: 600, display: "block", marginBottom: 3 };
// const submitBtnStyle = {
//   width: "100%", padding: "10px", borderRadius: 6, border: "none",
//   background: "#2563eb", color: "#fff", fontWeight: 700, fontSize: 15, cursor: "pointer", marginTop: 4,
// };
// const dangerBtnStyle = { ...submitBtnStyle, background: "#dc2626" };
// const outlineBtnStyle = (color) => ({
//   width: "calc(100% - 32px)", margin: "0 16px 10px", padding: "9px", borderRadius: 6,
//   border: `1px solid ${color}`, background: "transparent", color, fontWeight: 600, cursor: "pointer",
// });

// // ─────────────────────────────────────────────
// // Faculty Dashboard
// // ─────────────────────────────────────────────
// export default function FacultyDashboard() {
//   const API_BASE = import.meta.env.VITE_API_BASE_URL;
//   const { domain } = useParams();
//   const location = useLocation();
//   const navigate = useNavigate();

//   // ── State ──
//   const [faculty, setFaculty] = useState({});
//   const [students, setStudents] = useState([]);
//   const [showSidebar, setShowSidebar] = useState(true);

//   // Modal visibility
//   const [showProfilePicModal, setShowProfilePicModal] = useState(false);
//   const [showPasswordModal, setShowPasswordModal] = useState(false);
//   const [showEditModal, setShowEditModal] = useState(false);
//   const [showDeleteModal, setShowDeleteModal] = useState(false);

//   // Form states
//   const [profilePicFile, setProfilePicFile] = useState(null);
//   const [profilePicPreview, setProfilePicPreview] = useState(null);
//   const [newPassword, setNewPassword] = useState("");
//   const [editForm, setEditForm] = useState({});

//   // Feedback
//   const [actionMsg, setActionMsg] = useState("");
//   const [actionErr, setActionErr] = useState("");
//   const clearFeedback = () => { setActionMsg(""); setActionErr(""); };

//   // ── Fetch ──
//   useEffect(() => { fetchAllData(); }, [domain]);

//   const fetchAllData = async () => {
//     try {
//       const headers = {
//         "Authorization": `Bearer ${localStorage.getItem("token")}`,
//         "Content-Type": "application/json",
//       };
//       const [facultyRes, studentRes] = await Promise.all([
//         fetch(`${API_BASE}/${domain}/faculty`, { headers }),
//         fetch(`${API_BASE}/${domain}/faculty/all_student`, { headers }),
//       ]);
//       const facultyData = await facultyRes.json();
//       const studentData = await studentRes.json();
//       setFaculty(facultyData || {});
//       setStudents(studentData?.data || []);
//     } catch (error) {
//       console.error("Error:", error);
//       alert("Session expired. Please login again.");
//       localStorage.clear();
//       navigate(`/${domain}/login`);
//     }
//   };

//   const authHeaders = () => ({
//     "Authorization": `Bearer ${localStorage.getItem("token")}`,
//     "Content-Type": "application/json",
//   });

//   // ── Update Profile Picture ──
//   const handleProfilePicChange = (e) => {
//     const file = e.target.files[0];
//     if (!file) return;
//     setProfilePicFile(file);
//     setProfilePicPreview(URL.createObjectURL(file));
//   };

//   const handleUpdateProfilePic = async () => {
//     clearFeedback();
//     if (!profilePicFile) { setActionErr("Please select a file first."); return; }
//     try {
//       const formData = new FormData();
//       formData.append("profilePic", profilePicFile);
//       const res = await fetch(`${API_BASE}/${domain}/faculty/update_profile_pic`, {
//         method: "PUT",
//         headers: { "Authorization": `Bearer ${localStorage.getItem("token")}` },
//         body: formData,
//       });
//       const data = await res.json();
//       if (data.success) {
//         setActionMsg("Profile picture updated successfully!");
//         setFaculty(prev => ({ ...prev, profilePic: data.data }));
//         setShowProfilePicModal(false);
//         setProfilePicFile(null);
//         setProfilePicPreview(null);
//       } else {
//         setActionErr(data.message || "Failed to update profile picture.");
//       }
//     } catch (err) {
//       setActionErr("Network error: " + err.message);
//     }
//   };

//   // ── Update Password ──
//   // Backend endpoint: PUT /{domain}/faculty/update_faculty_password?newpass=
//   const handleUpdatePassword = async () => {
//     clearFeedback();
//     if (!newPassword) { setActionErr("New password is required."); return; }
//     try {
//       const res = await fetch(
//         `${API_BASE}/${domain}/faculty/update_faculty_password?newpass=${encodeURIComponent(newPassword)}`,
//         { method: "PUT", headers: authHeaders() }
//       );
//       const text = await res.text();
//       if (res.ok) {
//         setActionMsg("Password updated successfully!");
//         setShowPasswordModal(false);
//         setNewPassword("");
//       } else {
//         setActionErr(text || "Failed to update password.");
//       }
//     } catch (err) {
//       setActionErr("Network error: " + err.message);
//     }
//   };

//   // ── Update Profile ──
//   // Backend endpoint: PUT /{domain}/faculty/update_profile (body: Faculty object)
//   const handleUpdateProfile = async () => {
//     clearFeedback();
//     try {
//       const res = await fetch(`${API_BASE}/${domain}/faculty/update_profile`, {
//         method: "PUT",
//         headers: authHeaders(),
//         body: JSON.stringify({ ...faculty, ...editForm }),
//       });
//       if (res.ok) {
//         setActionMsg("Profile updated successfully!");
//         setFaculty(prev => ({ ...prev, ...editForm }));
//         setShowEditModal(false);
//         fetchAllData();
//       } else {
//         const text = await res.text();
//         setActionErr(text || "Failed to update profile.");
//       }
//     } catch (err) {
//       setActionErr("Network error: " + err.message);
//     }
//   };

//   // ── Logout ──
//   const handleLogout = () => { localStorage.clear(); navigate(`/${domain}/login`); };

//   // ── Delete Account ──
//   // Backend endpoint: DELETE /{domain}/faculty/delete_account (email from JWT)
//   const handleDeleteAccount = async () => {
//     try {
//       const res = await fetch(`${API_BASE}/${domain}/faculty/delete_account`, {
//         method: "DELETE",
//         headers: { "Authorization": `Bearer ${localStorage.getItem("token")}` },
//       });
//       const msg = await res.text();
//       alert(msg);
//       localStorage.clear();
//       navigate(`/${domain}/login`);
//     } catch (err) {
//       console.error(err);
//       setActionErr("Network error: " + err.message);
//     }
//   };

//   const isParentRoute = location.pathname.endsWith("/dashboard");

//   return (
//     <div className="dashboard-container">

//       {/* Toggle Button */}
//       <button className="toggle-btn" onClick={() => setShowSidebar(!showSidebar)}>☰</button>

//       {/* ── Sidebar ── */}
//       {showSidebar && (
//         <div className="sidebar">
//           <div className="profile-section">

//             {/* Clickable Profile Picture */}
//             <div
//               className="profile-pic"
//               style={{ position: "relative", cursor: "pointer" }}
//               onClick={() => { clearFeedback(); setShowProfilePicModal(true); }}
//               title="Click to update profile picture"
//             >
//               <img
//                 className="profile-pic-img"
//                 src={faculty.profilePic ? `${API_BASE}/${faculty.profilePic}` : "/default.png"}
//                 alt="Profile"
//               />
//               <div style={{
//                 position: "absolute", bottom: 0, right: 0,
//                 background: "#2563eb", borderRadius: "50%",
//                 width: 26, height: 26, display: "flex",
//                 alignItems: "center", justifyContent: "center",
//                 color: "#fff", fontSize: 13, border: "2px solid #fff",
//               }}>✎</div>
//             </div>

//             <p><strong>Faculty ID:</strong> {faculty.facultyId}</p>
//             <p><strong>Name:</strong> {faculty.name}</p>
//             <p><strong>Email:</strong> {faculty.email}</p>
//             <p><strong>Mobile:</strong> {faculty.mobileNumber}</p>
//             <p><strong>Course:</strong> {faculty.course}</p>
//             <p><strong>Teaching Batch:</strong> {faculty.teachingBatch}</p>
//             <p><strong>Last Login:</strong> {FormatDate(faculty.lastLoginDateTime)}</p>
//             <p><strong>Account Created:</strong> {FormatDate(faculty.createdDateTime)}</p>
//           </div>

//           <button
//             style={outlineBtnStyle("#2563eb")}
//             onClick={() => {
//               clearFeedback();
//               setEditForm({
//                 name: faculty.name,
//                 mobileNumber: faculty.mobileNumber,
//                 course: faculty.course,
//                 teachingBatch: faculty.teachingBatch,
//               });
//               setShowEditModal(true);
//             }}
//           >
//             ✎ Edit Profile
//           </button>

//           <button
//             style={outlineBtnStyle("#7c3aed")}
//             onClick={() => { clearFeedback(); setShowPasswordModal(true); }}
//           >
//             🔑 Change Password
//           </button>

//           <button className="logout-btn" onClick={handleLogout}>Logout</button>

//           <button
//             className="delete-btn"
//             onClick={() => { clearFeedback(); setShowDeleteModal(true); }}
//           >
//             Delete Account
//           </button>
//         </div>
//       )}

//       {/* ── Main Content ── */}
//       <div className="main-content">

//         {/* Global Feedback Banners */}
//         {actionMsg && (
//           <div style={{ background: "#d1fae5", border: "1px solid #6ee7b7", color: "#065f46", borderRadius: 8, padding: "10px 16px", marginBottom: 12, display: "flex", justifyContent: "space-between" }}>
//             ✅ {actionMsg}
//             <span style={{ cursor: "pointer", fontWeight: 700 }} onClick={() => setActionMsg("")}>✕</span>
//           </div>
//         )}
//         {actionErr && (
//           <div style={{ background: "#fee2e2", border: "1px solid #fca5a5", color: "#991b1b", borderRadius: 8, padding: "10px 16px", marginBottom: 12, display: "flex", justifyContent: "space-between" }}>
//             ❌ {actionErr}
//             <span style={{ cursor: "pointer", fontWeight: 700 }} onClick={() => setActionErr("")}>✕</span>
//           </div>
//         )}

//         <h2 className="ml-16">Welcome, {faculty?.name || "Faculty"} 👋</h2>

//         {isParentRoute ? (
//           <div className="card-grid">
//             <Link className="main-content-Link" to={"all-students"} state={{ students }}>
//               <div className="card">All Students: {students.length}</div>
//             </Link>
//             <Link className="main-content-Link" to={"notepad"}>
//               <div className="card">Notepad</div>
//             </Link>
//             <Link className="main-content-Link" to={"erp-attendence"}>
//               <div className="card">ERP / Attendance</div>
//             </Link>
//             <Link className="main-content-Link" to={"assignment"}>
//               <div className="card">Assignments</div>
//             </Link>
//             <Link className="main-content-Link" to={"test-quize"}>
//               <div className="card">Tests / Quiz</div>
//             </Link>
//             <Link className="main-content-Link" to={"notes"}>
//               <div className="card">Notes</div>
//             </Link>
//           </div>
//         ) : (
//           <div className="sub-page-container">
//             <button className="back-btn" onClick={() => navigate(-1)}>← Back to Dashboard</button>
//             <Outlet />
//           </div>
//         )}
//       </div>

//       {/* ════════════════════════ MODALS ════════════════════════ */}

//       {/* Update Profile Picture Modal */}
//       {showProfilePicModal && (
//         <Modal title="Update Profile Picture" onClose={() => { setShowProfilePicModal(false); clearFeedback(); }}>
//           <div style={{ textAlign: "center", marginBottom: 16 }}>
//             <img
//               src={profilePicPreview || (faculty.profilePic ? `${API_BASE}/${faculty.profilePic}` : "/default.png")}
//               alt="Preview"
//               style={{ width: 110, height: 110, borderRadius: "50%", objectFit: "cover", border: "3px solid #e5e7eb" }}
//             />
//           </div>
//           <label style={labelStyle}>Choose New Profile Picture</label>
//           <input type="file" accept="image/*" onChange={handleProfilePicChange}
//             style={{ ...fieldStyle, padding: "6px" }} />
//           {actionErr && <p style={{ color: "#dc2626", marginBottom: 8 }}>{actionErr}</p>}
//           {actionMsg && <p style={{ color: "#16a34a", marginBottom: 8 }}>{actionMsg}</p>}
//           <button style={submitBtnStyle} onClick={handleUpdateProfilePic}>Upload &amp; Save</button>
//         </Modal>
//       )}

//       {/* Change Password Modal */}
//       {showPasswordModal && (
//         <Modal title="Change Password" onClose={() => { setShowPasswordModal(false); clearFeedback(); setNewPassword(""); }}>
//           <p style={{ fontSize: 13, color: "#6b7280", marginBottom: 12 }}>
//             Changing password for: <strong>{faculty.email}</strong>
//           </p>
//           <label style={labelStyle}>New Password</label>
//           <input
//             type="password"
//             placeholder="Enter new password"
//             value={newPassword}
//             onChange={e => setNewPassword(e.target.value)}
//             style={fieldStyle}
//           />
//           {actionErr && <p style={{ color: "#dc2626", marginBottom: 8 }}>{actionErr}</p>}
//           {actionMsg && <p style={{ color: "#16a34a", marginBottom: 8 }}>{actionMsg}</p>}
//           <button style={submitBtnStyle} onClick={handleUpdatePassword}>Update Password</button>
//         </Modal>
//       )}

//       {/* Edit Profile Modal */}
//       {showEditModal && (
//         <Modal title="Edit Profile" onClose={() => { setShowEditModal(false); clearFeedback(); }}>
//           {[
//             { key: "name",          label: "Full Name",      type: "text" },
//             { key: "mobileNumber",  label: "Mobile Number",  type: "text" },
//             { key: "course",        label: "Course",         type: "text" },
//             { key: "teachingBatch", label: "Teaching Batch", type: "text" },
//           ].map(f => (
//             <div key={f.key}>
//               <label style={labelStyle}>{f.label}</label>
//               <input
//                 type={f.type}
//                 placeholder={f.label}
//                 value={editForm[f.key] || ""}
//                 onChange={e => setEditForm(prev => ({ ...prev, [f.key]: e.target.value }))}
//                 style={fieldStyle}
//               />
//             </div>
//           ))}
//           {actionErr && <p style={{ color: "#dc2626", marginBottom: 8 }}>{actionErr}</p>}
//           {actionMsg && <p style={{ color: "#16a34a", marginBottom: 8 }}>{actionMsg}</p>}
//           <button style={submitBtnStyle} onClick={handleUpdateProfile}>Save Changes</button>
//         </Modal>
//       )}

//       {/* Delete Account Confirm Modal */}
//       {showDeleteModal && (
//         <Modal title="Delete Account" onClose={() => { setShowDeleteModal(false); clearFeedback(); }}>
//           <p style={{ fontSize: 15, color: "#374151", marginBottom: 6 }}>
//             Are you sure you want to permanently delete your account?
//           </p>
//           <div style={{ background: "#f3f4f6", borderRadius: 8, padding: "12px 14px", marginBottom: 16 }}>
//             <p style={{ margin: "2px 0", fontWeight: 700 }}>{faculty.name}</p>
//             <p style={{ margin: "2px 0", color: "#6b7280", fontSize: 13 }}>{faculty.email}</p>
//           </div>
//           <p style={{ color: "#dc2626", fontSize: 13, marginBottom: 14 }}>
//             ⚠️ This action cannot be undone.
//           </p>
//           {actionErr && <p style={{ color: "#dc2626", marginBottom: 8 }}>{actionErr}</p>}
//           <div style={{ display: "flex", gap: 10 }}>
//             <button style={{ ...submitBtnStyle, background: "#6b7280" }} onClick={() => setShowDeleteModal(false)}>
//               Cancel
//             </button>
//             <button style={dangerBtnStyle} onClick={handleDeleteAccount}>
//               Yes, Delete
//             </button>
//           </div>
//         </Modal>
//       )}

//     </div>
//   );
// }







// // use in feature 
// // // // export default StudentDashboard;
// // import { useEffect, useState } from "react";
// // import { Link, useParams, Outlet, useNavigate, useLocation } from "react-router-dom";

// // import "../Common/css/common.css";
// // import "./FacultyDashboard.css";
// // import FormatDate from "../../Components/DateTimeFunction/FormatDate";


// // export default function FacultyDashboard() {

// //   const API_BASE = import.meta.env.VITE_API_BASE_URL;

// //   const { domain } = useParams();
// //   const location = useLocation();
// //   const navigate = useNavigate();

// //   // ===== Data Lists =====
// //   const [faculty, setFaculty] = useState({});
// //   const [students, setStudents] = useState([]);

// //   const [showSidebar, setShowSidebar] = useState(true);
// //   // ─────────────────────────────────────────────
// //     // NEW: modal visibility state
// //     // ─────────────────────────────────────────────
// //     const [showProfilePicModal, setShowProfilePicModal] = useState(false);
// //     const [showPasswordModal, setShowPasswordModal] = useState(false);
// //     const [showAddModal, setShowAddModal] = useState(false);
// //     const [showEditModal, setShowEditModal] = useState(false);
// //     const [showDeleteModal, setShowDeleteModal] = useState(false);
// //     const [selectedItem, setSelectedItem] = useState(null);
  
// //     // NEW: form states
// //   const [profilePicFile, setProfilePicFile] = useState(null);
// //   const [profilePicPreview, setProfilePicPreview] = useState(null);
// //   // FIX: removed pwdEmail — backend now reads email from JWT token, not from request param
// //   const [newPassword, setNewPassword] = useState("");
// //   const [addForm, setAddForm] = useState({});
// //   const [editForm, setEditForm] = useState({});

// //   // NEW: loading / feedback
// //   const [actionMsg, setActionMsg] = useState("");
// //   const [actionErr, setActionErr] = useState("");

// //   const clearFeedback = () => { setActionMsg(""); setActionErr(""); };



// //   // ================= FETCH DATA =================
// //   useEffect(() => {
// //     fetchAllData();
// //   }, [domain]);

// //   const fetchAllData = async () => {
// //     try {
// //       const headers = {
// //         "Authorization": `Bearer ${localStorage.getItem("token")}`,
// //         "Content-Type": "application/json"
// //       }
// //       // 1️⃣ Faculty Details
// //       const facultyRes = await fetch(`${API_BASE}/${domain}/faculty`, { headers });
// //       const facultyData = await facultyRes.json();
// //       setFaculty(facultyData || {});

// //       // 2️⃣ All Students
// //       const studentRes = await fetch(`${API_BASE}/${domain}/faculty/all_student`, { headers });
// //       const studentData = await studentRes.json();
// //       setStudents(studentData?.data || []);


// //     } catch (error) {
// //       console.error("Error:", error);
// //       alert(`Session expired. ${localStorage.getItem("role")} Please login again.`);
// //       localStorage.clear();
// //       // navigate(`/${domain}/login`);
// //     }
// //   };

// //   // ─────────────────────────────────────────────
// //   // NEW: auth headers helper
// //   // ─────────────────────────────────────────────
// //   const authHeaders = () => ({
// //     "Authorization": `Bearer ${localStorage.getItem("token")}`,
// //     "Content-Type": "application/json",
// //   });


// //  // ─────────────────────────────────────────────
// //   // NEW: UPDATE PROFILE PIC
// //   // ─────────────────────────────────────────────
// //   const handleProfilePicChange = (e) => {
// //     const file = e.target.files[0];
// //     if (!file) return;
// //     setProfilePicFile(file);
// //     setProfilePicPreview(URL.createObjectURL(file));
// //   };

// //   const handleUpdateProfilePic = async () => {
// //     clearFeedback();
// //     if (!profilePicFile) { setActionErr("Please select a file first."); return; }
// //     try {
// //       const formData = new FormData();
// //       formData.append("profilePic", profilePicFile);
// //       const res = await fetch(`${API_BASE}/${domain}/faculty/update_profile_pic`, {
// //         method: "PUT",
// //         headers: { "Authorization": `Bearer ${localStorage.getItem("token")}` },
// //         body: formData,
// //       });
// //       const data = await res.json();
// //       if (data.success) {
// //         setActionMsg("Profile picture updated successfully!");
// //         setFaculty(prev => ({ ...prev, profilePic: data.data }));
// //         setShowProfilePicModal(false);
// //         setProfilePicFile(null);
// //         setProfilePicPreview(null);
// //       } else {
// //         setActionErr(data.message || "Failed to update profile picture.");
// //       }
// //     } catch (err) {
// //       setActionErr("Network error: " + err.message);
// //     }
// //   };

// // // ─────────────────────────────────────────────
// //   // FIX: FORGOT / UPDATE PASSWORD
// //   // Backend now reads email from JWT (Authentication authentication),
// //   // so we only send ?newPassword= — no email param needed anymore.
// //   // ─────────────────────────────────────────────
// //   const handleUpdatePassword = async () => {
// //     clearFeedback();
// //     if (!newPassword) { setActionErr("New password is required."); return; }
// //     try {
// //       const res = await fetch(
// //         `${API_BASE}/${domain}/faculty/forgot_update_password?newPassword=${encodeURIComponent(newPassword)}`,
// //         { method: "PUT", headers: authHeaders() }
// //       );
// //       const text = await res.text();
// //       if (res.ok) {
// //         setActionMsg("Password updated successfully!");
// //         setShowPasswordModal(false);
// //         setNewPassword("");
// //       } else {
// //         setActionErr(text || "Failed to update password.");
// //       }
// //     } catch (err) {
// //       setActionErr("Network error: " + err.message);
// //     }
// //   };

// //   // Logout
// //   const handleLogout = () => {
// //     localStorage.clear(); // Clear all data
// //     navigate(`/${domain}/login`);
// //   };


// //   // Delete Account
// //   const deleteAccount = async () => {
// //     const confirmDelete = window.confirm("Are you sure?");

// //     if (!confirmDelete) return;

// //     try {
// //       const res = await fetch(`${API_BASE}/${domain}/faculty/delete_account`, {
// //         method: "DELETE",
// //         headers: {
// //           "Authorization": `Bearer ${localStorage.getItem("token")}`
// //         }
// //       });

// //       const msg = await res.text();
// //       alert(msg);

// //       localStorage.clear();
// //       navigate(`/${domain}/login`);
// //     } catch (err) {
// //       console.error(err);
// //     }
// //   };

// //   const isParentRoute = location.pathname.endsWith("/dashboard");
// //   return (
// //     <div className="dashboard-container">

// //       {/* Toggle Button (OUTSIDE SIDEBAR) */}
// //       <button className="toggle-btn" onClick={() => setShowSidebar(!showSidebar)} > ☰ </button>

// //       {/* Sidebar */}
// //       {showSidebar && (
// //         <div className="sidebar">
// //           <div className="profile-section">

// //             {/* NEW: Clickable profile picture to open update modal */}
// //             <div className="profile-pic" style={{ position: "relative", cursor: "pointer" }}
// //               onClick={() => { clearFeedback(); setShowProfilePicModal(true); }}
// //               title="Click to update profile picture">
// //               <img className="profile-pic-img" src={(faculty.profilePic) ? `${API_BASE}/${faculty.profilePic}` : "/default.png"} alt="Profile" />

// //               <div style={{
// //                 position: "absolute", bottom: 0, right: 0,
// //                 background: "#2563eb", borderRadius: "50%",
// //                 width: 26, height: 26, display: "flex",
// //                 alignItems: "center", justifyContent: "center",
// //                 color: "#fff", fontSize: 13, border: "2px solid #fff",
// //               }}>✎</div>
// //             </div>

// //             <p>Faculty Id: {faculty.facultyId}</p>
// //             <p>Name: {faculty.name}</p>
// //             <p>Email: {faculty.email}</p>
// //             <p>Mobile: {faculty.mobileNumber}</p>
// //             <p>Course: {faculty.course}</p>
// //             <p>Teaching Batch: {faculty.teachingBatch}</p>
// //             <p>Last Login : {FormatDate(faculty.lastLoginDateTime)}</p>
// //             <p>Account Created Date: {FormatDate(faculty.createdDateTime)}</p>
// //           </div>
// //           <button onClick={updatePassword}>Change Password</button>

// //           <button className="logout-btn" onClick={handleLogout}>Logout</button>

// //           <button className="delete-btn" onClick={deleteAccount}>
// //             Delete Account
// //           </button>
// //         </div>
// //       )}

// //       {/* Main Content */}
// //       <div className="main-content">
// //         <h2 className="ml-16">Welcome, {faculty?.name || "Faculty"} 👋</h2>
// //         {isParentRoute ? (
// //           /* ONLY SHOW GRID IF ON MAIN DASHBOARD */
// //           <div className="card-grid">
// //             <Link className="main-content-Link" to={"all-students"} state={{ students }}><div className="card">All Student : {students.length}</div> </Link>
// //             <Link className="main-content-Link" to={"notepad"}><div className="card">Notepad</div> </Link>
// //             <Link className="main-content-Link" to={"erp-attendence"}><div className="card">ERP / Attendance</div> </Link>
// //             {/* common student and faculty */}
// //             <Link className="main-content-Link" to={"assignment"}><div className="card">Assignments</div> </Link>
// //             <Link className="main-content-Link" to={"test-quize"}><div className="card">Tests / Quiz</div> </Link>
// //             <Link className="main-content-Link" to={"notes"}><div className="card">Notes</div> </Link>

// //           </div>
// //         ) : (
// //           /* SHOW SUB-PAGE AND BACK BUTTON */
// //           <div className="sub-page-container">
// //             <button className="back-btn" onClick={() => navigate(-1)}>
// //               ← Back to Dashboard
// //             </button>
// //             <Outlet />
// //           </div>
// //         )}

// //         {/* ═══════════════════════════════════════════════
// //           NEW MODALS (all added below – no old code changed)
// //       ═══════════════════════════════════════════════ */}

// //         {/* ── Update Profile Picture Modal ── */}
// //         {showProfilePicModal && (
// //           <Modal title="Update Profile Picture" onClose={() => setShowProfilePicModal(false)}>
// //             <div style={{ textAlign: "center", marginBottom: 16 }}>
// //               <img
// //                 src={profilePicPreview || (faculty.profilePic) || "/default.png"}
// //                 alt="Preview"
// //                 style={{ width: 110, height: 110, borderRadius: "50%", objectFit: "cover", border: "3px solid #e5e7eb" }}
// //               />
// //             </div>
// //             <label style={labelStyle}>Choose New Profile Picture</label>
// //             <input type="file" accept="image/*" onChange={handleProfilePicChange}
// //               style={{ ...fieldStyle, padding: "6px" }} />
// //             {actionErr && <p style={{ color: "#dc2626", marginBottom: 8 }}>{actionErr}</p>}
// //             {actionMsg && <p style={{ color: "#16a34a", marginBottom: 8 }}>{actionMsg}</p>}
// //             <button style={submitBtnStyle} onClick={handleUpdateProfilePic}>
// //               Upload &amp; Save
// //             </button>
// //           </Modal>
// //         )}

// //         {/* ── Change Password Modal ── */}
// //         {/* FIX: Email field removed — backend reads email from JWT token automatically */}
// //         {showPasswordModal && (
// //           <Modal title="Change Password" onClose={() => setShowPasswordModal(false)}>
// //             <p style={{ fontSize: 13, color: "#6b7280", marginBottom: 12 }}>
// //               Changing password for: <strong>{admin.email}</strong>
// //             </p>
// //             <label style={labelStyle}>New Password</label>
// //             <input type="password" placeholder="Enter new password" value={newPassword}
// //               onChange={e => setNewPassword(e.target.value)} style={fieldStyle} />
// //             {actionErr && <p style={{ color: "#dc2626", marginBottom: 8 }}>{actionErr}</p>}
// //             {actionMsg && <p style={{ color: "#16a34a", marginBottom: 8 }}>{actionMsg}</p>}
// //             <button style={submitBtnStyle} onClick={handleUpdatePassword}>
// //               Update Password
// //             </button>
// //           </Modal>
// //         )}

// //         {/* ── Add Modal ── */}
// //         {showAddModal && (
// //           <Modal title={`Add ${activeTabLabel}`} onClose={() => setShowAddModal(false)}>
// //             {activeFields.map(f => (
// //               <div key={f.key}>
// //                 <label style={labelStyle}>{f.label}</label>
// //                 <input
// //                   type={f.type}
// //                   placeholder={f.label}
// //                   value={addForm[f.key] || ""}
// //                   onChange={e => setAddForm(prev => ({ ...prev, [f.key]: e.target.value }))}
// //                   style={fieldStyle}
// //                 />
// //               </div>
// //             ))}
// //             {actionErr && <p style={{ color: "#dc2626", marginBottom: 8 }}>{actionErr}</p>}
// //             {actionMsg && <p style={{ color: "#16a34a", marginBottom: 8 }}>{actionMsg}</p>}
// //             <button style={submitBtnStyle} onClick={handleAdd}>
// //               Add {activeTabLabel}
// //             </button>
// //           </Modal>
// //         )}

// //         {/* ── Edit Modal ── */}
// //         {showEditModal && selectedItem && (
// //           <Modal title={`Edit ${activeTabLabel}`} onClose={() => setShowEditModal(false)}>
// //             {activeFields.map(f => (
// //               <div key={f.key}>
// //                 <label style={labelStyle}>{f.label}</label>
// //                 <input
// //                   type={f.type === "password" ? "text" : f.type}
// //                   placeholder={f.label}
// //                   value={editForm[f.key] || ""}
// //                   onChange={e => setEditForm(prev => ({ ...prev, [f.key]: e.target.value }))}
// //                   style={fieldStyle}
// //                   readOnly={f.key === "email"}
// //                 />
// //               </div>
// //             ))}
// //             {actionErr && <p style={{ color: "#dc2626", marginBottom: 8 }}>{actionErr}</p>}
// //             {actionMsg && <p style={{ color: "#16a34a", marginBottom: 8 }}>{actionMsg}</p>}
// //             <button style={submitBtnStyle} onClick={handleEdit}>
// //               Save Changes
// //             </button>
// //           </Modal>
// //         )}

// //         {/* ── Delete Confirm Modal ── */}
// //         {showDeleteModal && selectedItem && (
// //           <Modal title={`Delete ${activeTabLabel}`} onClose={() => setShowDeleteModal(false)}>
// //             <p style={{ fontSize: 15, color: "#374151", marginBottom: 6 }}>
// //               Are you sure you want to delete:
// //             </p>
// //             <div style={{
// //               background: "#f3f4f6", borderRadius: 8, padding: "12px 14px", marginBottom: 16,
// //             }}>
// //               <p style={{ margin: "2px 0", fontWeight: 700 }}>{selectedItem.name}</p>
// //               <p style={{ margin: "2px 0", color: "#6b7280", fontSize: 13 }}>{selectedItem.email}</p>
// //             </div>
// //             <p style={{ color: "#dc2626", fontSize: 13, marginBottom: 14 }}>
// //               ⚠️ This action cannot be undone.
// //             </p>
// //             {actionErr && <p style={{ color: "#dc2626", marginBottom: 8 }}>{actionErr}</p>}
// //             {actionMsg && <p style={{ color: "#16a34a", marginBottom: 8 }}>{actionMsg}</p>}
// //             <div style={{ display: "flex", gap: 10 }}>
// //               <button
// //                 style={{ ...submitBtnStyle, background: "#6b7280" }}
// //                 onClick={() => setShowDeleteModal(false)}
// //               >
// //                 Cancel
// //               </button>
// //               <button style={dangerBtnStyle} onClick={handleDelete}>
// //                 Yes, Delete
// //               </button>
// //             </div>
// //           </Modal>
// //         )}




// //       </div>

// //     </div>
// //   );
// // }




















// new code here all are seprate otp verify then password change and account delete

import { useEffect, useState } from "react";
import { Link, useParams, Outlet, useNavigate, useLocation } from "react-router-dom";
import "../Common/css/common.css";
import "./FacultyDashboard.css";
import FormatDate from "../../Components/DateTimeFunction/FormatDate";
import ChangePasswordModal from "../../Components/Auth/ChangePasswordModal";
import DeleteAccountModal  from "../../Components/Auth/DeleteAccountModal";

// ─────────────────────────────────────────────
// Shared Modal Component
// ─────────────────────────────────────────────
function Modal({ title, onClose, children }) {
  return (
    <div style={modalStyles.overlay}>
      <div style={modalStyles.box}>
        <div style={modalStyles.header}>
          <h3 style={{ margin: 0, fontSize: 17 }}>{title}</h3>
          <button onClick={onClose} style={modalStyles.closeBtn}>✕</button>
        </div>
        <div style={modalStyles.body}>{children}</div>
      </div>
    </div>
  );
}

const modalStyles = {
  overlay: { position: "fixed", inset: 0, background: "rgba(0,0,0,0.55)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000 },
  box:     { background: "#fff", borderRadius: 12, width: "min(500px, 95vw)", maxHeight: "90vh", overflowY: "auto", boxShadow: "0 8px 32px rgba(0,0,0,.25)" },
  header:  { display: "flex", justifyContent: "space-between", alignItems: "center", padding: "16px 20px", borderBottom: "1px solid #e5e7eb" },
  body:    { padding: "20px" },
  closeBtn:{ background: "none", border: "none", fontSize: 18, cursor: "pointer", color: "#6b7280" },
};

const fieldStyle     = { width: "100%", padding: "8px 10px", marginBottom: 10, borderRadius: 6, border: "1px solid #d1d5db", fontSize: 14, boxSizing: "border-box" };
const labelStyle     = { fontSize: 12, color: "#374151", fontWeight: 600, display: "block", marginBottom: 3 };
const submitBtnStyle = { width: "100%", padding: "10px", borderRadius: 6, border: "none", background: "#2563eb", color: "#fff", fontWeight: 700, fontSize: 15, cursor: "pointer", marginTop: 4 };
const outlineBtnStyle = (color) => ({ width: "calc(100% - 32px)", margin: "0 16px 10px", padding: "9px", borderRadius: 6, border: `1px solid ${color}`, background: "transparent", color, fontWeight: 600, cursor: "pointer" });

// ─────────────────────────────────────────────
// Faculty Dashboard
// ─────────────────────────────────────────────
export default function FacultyDashboard() {
  const API_BASE = import.meta.env.VITE_API_BASE_URL;
  const { domain } = useParams();
  const location   = useLocation();
  const navigate   = useNavigate();

  const [faculty,   setFaculty]   = useState({});
  const [students,  setStudents]  = useState([]);
  const [showSidebar, setShowSidebar] = useState(true);

  // Modal visibility
  const [showProfilePicModal,     setShowProfilePicModal]     = useState(false);
  const [showEditModal,           setShowEditModal]           = useState(false);
  // ── NEW: OTP-guarded modals ──
  const [showChangePasswordModal, setShowChangePasswordModal] = useState(false);
  const [showDeleteAccountModal,  setShowDeleteAccountModal]  = useState(false);

  // Form states
  const [profilePicFile,    setProfilePicFile]    = useState(null);
  const [profilePicPreview, setProfilePicPreview] = useState(null);
  const [editForm,          setEditForm]          = useState({});

  // Feedback
  const [actionMsg, setActionMsg] = useState("");
  const [actionErr, setActionErr] = useState("");
  const clearFeedback = () => { setActionMsg(""); setActionErr(""); };

  useEffect(() => { fetchAllData(); }, [domain]);

  const fetchAllData = async () => {
    try {
      const headers = { "Authorization": `Bearer ${localStorage.getItem("token")}`, "Content-Type": "application/json" };
      const [facultyRes, studentRes] = await Promise.all([
        fetch(`${API_BASE}/${domain}/faculty`, { headers }),
        fetch(`${API_BASE}/${domain}/faculty/all_student`, { headers }),
      ]);
      setFaculty(await facultyRes.json() || {});
      setStudents((await studentRes.json())?.data || []);
    } catch {
      alert("Session expired. Please login again.");
      localStorage.clear();
      navigate(`/${domain}/login`);
    }
  };

  const authHeaders = () => ({
    "Authorization": `Bearer ${localStorage.getItem("token")}`,
    "Content-Type": "application/json",
  });

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
      const res  = await fetch(`${API_BASE}/${domain}/faculty/update_profile_pic`, {
        method: "PUT", headers: { "Authorization": `Bearer ${localStorage.getItem("token")}` }, body: formData,
      });
      const data = await res.json();
      if (data.success) {
        setActionMsg("Profile picture updated successfully!");
        setFaculty(prev => ({ ...prev, profilePic: data.data }));
        setShowProfilePicModal(false); setProfilePicFile(null); setProfilePicPreview(null);
      } else {
        setActionErr(data.message || "Failed to update profile picture.");
      }
    } catch (err) { setActionErr("Network error: " + err.message); }
  };

  // ── Edit Profile ─────────────────────────────────────────────────────────
  const handleUpdateProfile = async () => {
    clearFeedback();
    try {
      const res = await fetch(`${API_BASE}/${domain}/faculty/update_profile`, {
        method: "PUT", headers: authHeaders(), body: JSON.stringify({ ...faculty, ...editForm }),
      });
      if (res.ok) {
        setActionMsg("Profile updated successfully!");
        setFaculty(prev => ({ ...prev, ...editForm }));
        setShowEditModal(false); fetchAllData();
      } else {
        setActionErr(await res.text() || "Failed to update profile.");
      }
    } catch (err) { setActionErr("Network error: " + err.message); }
  };

  // ── Logout ───────────────────────────────────────────────────────────────
  const handleLogout = () => { localStorage.clear(); navigate(`/${domain}/login`); };

  // ── Callbacks for OTP modals ─────────────────────────────────────────────
  const handleChangePassword = (newPassword) =>
    fetch(
      `${API_BASE}/${domain}/faculty/update_faculty_password?newpass=${encodeURIComponent(newPassword)}`,
      { method: "PUT", headers: authHeaders() }
    );

  const handleDeleteAccount = async () => {
    const res = await fetch(`${API_BASE}/${domain}/faculty/delete_account`, {
      method: "DELETE", headers: { "Authorization": `Bearer ${localStorage.getItem("token")}` },
    });
    const msg = await res.text();
    alert(msg);
    localStorage.clear();
    navigate(`/${domain}/login`);
  };

  const isParentRoute = location.pathname.endsWith("/dashboard");

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
              <img
                className="profile-pic-img"
                src={faculty.profilePic ? `${API_BASE}/${faculty.profilePic}` : "/default.png"}
                alt="Profile"
              />
              <div style={{ position: "absolute", bottom: 0, right: 0, background: "#2563eb", borderRadius: "50%", width: 26, height: 26, display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontSize: 13, border: "2px solid #fff" }}>✎</div>
            </div>

            <p><strong>Faculty ID:</strong>     {faculty.facultyId}</p>
            <p><strong>Name:</strong>           {faculty.name}</p>
            <p><strong>Email:</strong>          {faculty.email}</p>
            <p><strong>Mobile:</strong>         {faculty.mobileNumber}</p>
            <p><strong>Course:</strong>         {faculty.course}</p>
            <p><strong>Teaching Batch:</strong> {faculty.teachingBatch}</p>
            <p><strong>Last Login:</strong>     {FormatDate(faculty.lastLoginDateTime)}</p>
            <p><strong>Account Created:</strong>{FormatDate(faculty.createdDateTime)}</p>
          </div>

          <button
            style={outlineBtnStyle("#2563eb")}
            onClick={() => {
              clearFeedback();
              setEditForm({ name: faculty.name, mobileNumber: faculty.mobileNumber, course: faculty.course, teachingBatch: faculty.teachingBatch });
              setShowEditModal(true);
            }}
          >✎ Edit Profile</button>

          <button style={outlineBtnStyle("#7c3aed")} onClick={() => { clearFeedback(); setShowChangePasswordModal(true); }}>
            🔑 Change Password
          </button>

          <button className="delete-btn mt-2 mb-5" onClick={() => { clearFeedback(); setShowDeleteAccountModal(true); }}>
            Delete Account
          </button>

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

        <h2 className="ml-16">Welcome, {faculty?.name || "Faculty"} 👋</h2>

        {isParentRoute ? (
          <div className="card-grid">
            <Link className="main-content-Link" to={"all-students"} state={{ students }}><div className="card">All Students: {students.length}</div></Link>
            <Link className="main-content-Link" to={"notepad"}><div className="card">Notepad</div></Link>
            <Link className="main-content-Link" to={"erp-attendence"}><div className="card">ERP / Attendance</div></Link>
            <Link className="main-content-Link" to={"assignment"}><div className="card">Assignments</div></Link>
            <Link className="main-content-Link" to={"test-quize"}><div className="card">Tests / Quiz</div></Link>
            <Link className="main-content-Link" to={"notes"}><div className="card">Notes</div></Link>
          </div>
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
            <img src={profilePicPreview || (faculty.profilePic ? `${API_BASE}/${faculty.profilePic}` : "/default.png")} alt="Preview" style={{ width: 110, height: 110, borderRadius: "50%", objectFit: "cover", border: "3px solid #e5e7eb" }} />
          </div>
          <label style={labelStyle}>Choose New Profile Picture</label>
          <input type="file" accept="image/*" onChange={handleProfilePicChange} style={{ ...fieldStyle, padding: "6px" }} />
          {actionErr && <p style={{ color: "#dc2626", marginBottom: 8 }}>{actionErr}</p>}
          {actionMsg && <p style={{ color: "#16a34a", marginBottom: 8 }}>{actionMsg}</p>}
          <button style={submitBtnStyle} onClick={handleUpdateProfilePic}>Upload &amp; Save</button>
        </Modal>
      )}

      {showEditModal && (
        <Modal title="Edit Profile" onClose={() => { setShowEditModal(false); clearFeedback(); }}>
          {[
            { key: "name",          label: "Full Name",      type: "text" },
            { key: "mobileNumber",  label: "Mobile Number",  type: "text" },
            { key: "course",        label: "Course",         type: "text" },
            { key: "teachingBatch", label: "Teaching Batch", type: "text" },
          ].map(f => (
            <div key={f.key}>
              <label style={labelStyle}>{f.label}</label>
              <input type={f.type} placeholder={f.label} value={editForm[f.key] || ""} onChange={e => setEditForm(prev => ({ ...prev, [f.key]: e.target.value }))} style={fieldStyle} />
            </div>
          ))}
          {actionErr && <p style={{ color: "#dc2626", marginBottom: 8 }}>{actionErr}</p>}
          {actionMsg && <p style={{ color: "#16a34a", marginBottom: 8 }}>{actionMsg}</p>}
          <button style={submitBtnStyle} onClick={handleUpdateProfile}>Save Changes</button>
        </Modal>
      )}

      {/* ── NEW: OTP-guarded modals ── */}
      {showChangePasswordModal && (
        <ChangePasswordModal
          email={faculty.email}
          onChangePassword={handleChangePassword}
          onClose={() => setShowChangePasswordModal(false)}
          onSuccess={() => { setShowChangePasswordModal(false); setActionMsg("Password updated successfully!"); }}
        />
      )}

      {showDeleteAccountModal && (
        <DeleteAccountModal
          name={faculty.name}
          email={faculty.email}
          onDeleteAccount={handleDeleteAccount}
          onClose={() => setShowDeleteAccountModal(false)}
        />
      )}
    </div>
  );
}


// // new code here all are seprate otp verify then password change and account delete

// import { useEffect, useState } from "react";
// import { Link, useParams, Outlet, useNavigate, useLocation } from "react-router-dom";

// import "../Common/css/common.css";
// import "./SubAdminDashboard.css";
// import FormatDate from "../../Components/DateTimeFunction/FormatDate";
// import ChangePasswordModal from "../../Components/Auth/ChangePasswordModal";
// import DeleteAccountModal  from "../../Components/Auth/DeleteAccountModal";

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
//   overlay: { position: "fixed", inset: 0, background: "rgba(0,0,0,0.55)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000 },
//   box:     { background: "#fff", borderRadius: 12, width: "min(500px, 95vw)", maxHeight: "90vh", overflowY: "auto", boxShadow: "0 8px 32px rgba(0,0,0,.25)" },
//   header:  { display: "flex", justifyContent: "space-between", alignItems: "center", padding: "16px 20px", borderBottom: "1px solid #e5e7eb" },
//   body:    { padding: "20px" },
//   closeBtn:{ background: "none", border: "none", fontSize: 18, cursor: "pointer", color: "#6b7280" },
// };

// const fieldStyle     = { width: "100%", padding: "8px 10px", marginBottom: 10, borderRadius: 6, border: "1px solid #d1d5db", fontSize: 14, boxSizing: "border-box" };
// const labelStyle     = { fontSize: 12, color: "#374151", fontWeight: 600, display: "block", marginBottom: 3 };
// const submitBtnStyle = { width: "100%", padding: "10px", borderRadius: 6, border: "none", background: "#2563eb", color: "#fff", fontWeight: 700, fontSize: 15, cursor: "pointer", marginTop: 4 };
// const outlineBtnStyle = (color) => ({ width: "calc(100% - 32px)", margin: "0 16px 10px", padding: "9px", borderRadius: 6, border: `1px solid ${color}`, background: "transparent", color, fontWeight: 600, cursor: "pointer" });

// // ─────────────────────────────────────────────
// // SubAdmin Dashboard
// // ─────────────────────────────────────────────
// export default function SubAdminDashboard() {
//   const API_BASE = import.meta.env.VITE_API_BASE_URL;
//   const { domain } = useParams();
//   const location   = useLocation();
//   const navigate   = useNavigate();

//   const [subAdmin,  setSubAdmin]  = useState({});
//   const [faculty,   setFaculty]   = useState([]);
//   const [students,  setStudents]  = useState([]);
//   const [showSidebar, setShowSidebar] = useState(true);

//   // Modal visibility
//   const [showProfilePicModal,     setShowProfilePicModal]     = useState(false);
//   const [showEditModal,           setShowEditModal]           = useState(false);
//   // ── NEW: OTP-guarded modals ──
//   const [showChangePasswordModal, setShowChangePasswordModal] = useState(false);
//   const [showDeleteAccountModal,  setShowDeleteAccountModal]  = useState(false);

//   // Form states
//   const [profilePicFile,    setProfilePicFile]    = useState(null);
//   const [profilePicPreview, setProfilePicPreview] = useState(null);
//   const [editForm,          setEditForm]          = useState({});

//   // Feedback
//   const [actionMsg, setActionMsg] = useState("");
//   const [actionErr, setActionErr] = useState("");
//   const clearFeedback = () => { setActionMsg(""); setActionErr(""); };

//   useEffect(() => { fetchAllData(); }, [domain]);

//   const fetchAllData = async () => {
//     try {
//       const headers = { "Authorization": `Bearer ${localStorage.getItem("token")}`, "Content-Type": "application/json" };
//       const [subAdminRes, studentRes, facultyRes] = await Promise.all([
//         fetch(`${API_BASE}/${domain}/subAdmin`, { headers }),
//         fetch(`${API_BASE}/${domain}/subAdmin/all_student`, { headers }),
//         fetch(`${API_BASE}/${domain}/subAdmin/all_faculty`, { headers }),
//       ]);
//       setSubAdmin(await subAdminRes.json() || {});
//       setStudents((await studentRes.json())?.data || []);
//       setFaculty((await facultyRes.json())?.data  || []);
//     } catch {
//       alert("Session expired. Please login again.");
//       localStorage.clear();
//       navigate(`/${domain}/login`);
//     }
//   };

//   const authHeaders = () => ({
//     "Authorization": `Bearer ${localStorage.getItem("token")}`,
//     "Content-Type": "application/json",
//   });

//   // ── Profile Picture ──────────────────────────────────────────────────────
//   const handleProfilePicChange = (e) => {
//     const file = e.target.files[0];
//     if (!file) return;
//     setProfilePicFile(file); setProfilePicPreview(URL.createObjectURL(file));
//   };

//   const handleUpdateProfilePic = async () => {
//     clearFeedback();
//     if (!profilePicFile) { setActionErr("Please select a file first."); return; }
//     try {
//       const formData = new FormData();
//       formData.append("profilePic", profilePicFile);
//       const res  = await fetch(`${API_BASE}/${domain}/subAdmin/update_profile_pic`, {
//         method: "PUT", headers: { "Authorization": `Bearer ${localStorage.getItem("token")}` }, body: formData,
//       });
//       const data = await res.json();
//       if (data.success) {
//         setActionMsg("Profile picture updated successfully!");
//         setSubAdmin(prev => ({ ...prev, profilePhotoPath: data.data }));
//         setShowProfilePicModal(false); setProfilePicFile(null); setProfilePicPreview(null);
//       } else {
//         setActionErr(data.message || "Failed to update profile picture.");
//       }
//     } catch (err) { setActionErr("Network error: " + err.message); }
//   };

//   // ── Edit Profile ─────────────────────────────────────────────────────────
//   const handleUpdateProfile = async () => {
//     clearFeedback();
//     try {
//       const res = await fetch(`${API_BASE}/${domain}/subAdmin/update_profile`, {
//         method: "PUT", headers: authHeaders(), body: JSON.stringify({ ...subAdmin, ...editForm }),
//       });
//       if (res.ok) {
//         setActionMsg("Profile updated successfully!");
//         setSubAdmin(prev => ({ ...prev, ...editForm }));
//         setShowEditModal(false); fetchAllData();
//       } else {
//         setActionErr(await res.text() || "Failed to update profile.");
//       }
//     } catch (err) { setActionErr("Network error: " + err.message); }
//   };

//   // ── Logout ───────────────────────────────────────────────────────────────
//   const handleLogout = () => { localStorage.clear(); navigate(`/${domain}/login`); };

//   // ── Callbacks for OTP modals ─────────────────────────────────────────────

//   // NOTE: SubAdmin password endpoint requires email as a query param (unlike other roles that use JWT)
//   const handleChangePassword = (newPassword) =>
//     fetch(
//       `${API_BASE}/${domain}/subAdmin/forgot_update_password?email=${encodeURIComponent(subAdmin.email)}&newpass=${encodeURIComponent(newPassword)}`,
//       { method: "PUT", headers: authHeaders() }
//     );

//   const handleDeleteAccount = async () => {
//     const res = await fetch(`${API_BASE}/${domain}/subAdmin/delete_account`, {
//       method: "DELETE",
//       headers: { "Authorization": `Bearer ${localStorage.getItem("token")}`, "Content-Type": "application/json" },
//     });
//     const msg = await res.text();
//     alert(msg);
//     localStorage.clear();
//     navigate(`/${domain}/login`);
//   };

//   const isParentRoute = location.pathname.endsWith("/dashboard");

//   return (
//     <div className="dashboard-container">
//       <button className="toggle-btn" onClick={() => setShowSidebar(!showSidebar)}>☰</button>

//       {/* ── Sidebar ── */}
//       {showSidebar && (
//         <div className="sidebar">
//           <div className="profile-section ">
//             <div
//               className="profile-pic"
//               style={{ position: "relative", cursor: "pointer" }}
//               onClick={() => { clearFeedback(); setShowProfilePicModal(true); }}
//               title="Click to update profile picture"
//             >
//               <img
//                 className="profile-pic-img"
//                 src={subAdmin.profilePic ? `${API_BASE}/${subAdmin.profilePic}` : "/default.png"}
//                 alt="Profile"
//               />
//               <div style={{ position: "absolute", bottom: 0, right: 0, background: "#2563eb", borderRadius: "50%", width: 26, height: 26, display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontSize: 13, border: "2px solid #fff" }}>✎</div>
//             </div>

//             <p><strong>SubAdmin ID:</strong>    {subAdmin.subAdminId}</p>
//             <p><strong>Name:</strong>           {subAdmin.name}</p>
//             <p><strong>Email:</strong>          {subAdmin.email}</p>
//             <p><strong>Mobile:</strong>         {subAdmin.mobileNumber}</p>
//             <p><strong>Course:</strong>         {subAdmin.course}</p>
//             <p><strong>Last Login:</strong>     {FormatDate(subAdmin.lastLoginDateTime)}</p>
//             <p><strong>Account Created:</strong>{FormatDate(subAdmin.createdDateTime)}</p>
//           </div>

//           <button
//             style={outlineBtnStyle("#2563eb")}
//             onClick={() => {
//               clearFeedback();
//               setEditForm({ name: subAdmin.name, mobileNumber: subAdmin.mobileNumber, course: subAdmin.course });
//               setShowEditModal(true);
//             }}
//           >✎ Edit Profile</button>

//           <button style={outlineBtnStyle("#7c3aed")} onClick={() => { clearFeedback(); setShowChangePasswordModal(true); }}>
//             🔑 Change Password
//           </button>

//           <button className="delete-btn mt-2 mb-5" onClick={() => { clearFeedback(); setShowDeleteAccountModal(true); }}>
//             Delete Account
//           </button>

//           <button className="logout-btn" onClick={handleLogout}>Logout</button>
//         </div>
//       )}

//       {/* ── Main Content ── */}
//       <div className="main-content">
//         {actionMsg && (
//           <div style={{ background: "#d1fae5", border: "1px solid #6ee7b7", color: "#065f46", borderRadius: 8, padding: "10px 16px", marginBottom: 12, display: "flex", justifyContent: "space-between" }}>
//             ✅ {actionMsg}<span style={{ cursor: "pointer", fontWeight: 700 }} onClick={() => setActionMsg("")}>✕</span>
//           </div>
//         )}
//         {actionErr && (
//           <div style={{ background: "#fee2e2", border: "1px solid #fca5a5", color: "#991b1b", borderRadius: 8, padding: "10px 16px", marginBottom: 12, display: "flex", justifyContent: "space-between" }}>
//             ❌ {actionErr}<span style={{ cursor: "pointer", fontWeight: 700 }} onClick={() => setActionErr("")}>✕</span>
//           </div>
//         )}

//         {isParentRoute ? (
//           <div className="card-grid">
//             <Link className="main-content-Link" to={"all-students"} state={{ students }}><div className="card">All Students: {students.length}</div></Link>
//             <Link className="main-content-Link" to={"all-faculty"}  state={{ faculty }}><div className="card">All Faculty: {faculty.length}</div></Link>
//             <Link className="main-content-Link" to={"notepad"}><div className="card">Notepad</div></Link>
//           </div>
//         ) : (
//           <div className="sub-page-container">
//             <button className="back-btn" onClick={() => navigate(-1)}>← Back to Dashboard</button>
//             <Outlet />
//           </div>
//         )}
//       </div>

//       {/* ════════════ MODALS ════════════ */}

//       {showProfilePicModal && (
//         <Modal title="Update Profile Picture" onClose={() => { setShowProfilePicModal(false); clearFeedback(); }}>
//           <div style={{ textAlign: "center", marginBottom: 16 }}>
//             <img src={profilePicPreview || (subAdmin.profilePic ? `${API_BASE}/${subAdmin.profilePic}` : "/default.png")} alt="Preview" style={{ width: 110, height: 110, borderRadius: "50%", objectFit: "cover", border: "3px solid #e5e7eb" }} />
//           </div>
//           <label style={labelStyle}>Choose New Profile Picture</label>
//           <input type="file" accept="image/*" onChange={handleProfilePicChange} style={{ ...fieldStyle, padding: "6px" }} />
//           {actionErr && <p style={{ color: "#dc2626", marginBottom: 8 }}>{actionErr}</p>}
//           {actionMsg && <p style={{ color: "#16a34a", marginBottom: 8 }}>{actionMsg}</p>}
//           <button style={submitBtnStyle} onClick={handleUpdateProfilePic}>Upload &amp; Save</button>
//         </Modal>
//       )}

//       {showEditModal && (
//         <Modal title="Edit Profile" onClose={() => { setShowEditModal(false); clearFeedback(); }}>
//           {[
//             { key: "name",         label: "Full Name",     type: "text" },
//             { key: "mobileNumber", label: "Mobile Number", type: "text" },
//             { key: "course",       label: "Course",        type: "text" },
//           ].map(f => (
//             <div key={f.key}>
//               <label style={labelStyle}>{f.label}</label>
//               <input type={f.type} placeholder={f.label} value={editForm[f.key] || ""} onChange={e => setEditForm(prev => ({ ...prev, [f.key]: e.target.value }))} style={fieldStyle} />
//             </div>
//           ))}
//           {actionErr && <p style={{ color: "#dc2626", marginBottom: 8 }}>{actionErr}</p>}
//           {actionMsg && <p style={{ color: "#16a34a", marginBottom: 8 }}>{actionMsg}</p>}
//           <button style={submitBtnStyle} onClick={handleUpdateProfile}>Save Changes</button>
//         </Modal>
//       )}

//       {/* ── NEW: OTP-guarded modals ── */}
//       {showChangePasswordModal && (
//         <ChangePasswordModal
//           email={subAdmin.email}
//           onChangePassword={handleChangePassword}
//           onClose={() => setShowChangePasswordModal(false)}
//           onSuccess={() => { setShowChangePasswordModal(false); setActionMsg("Password updated successfully!"); }}
//         />
//       )}

//       {showDeleteAccountModal && (
//         <DeleteAccountModal
//           name={subAdmin.name}
//           email={subAdmin.email}
//           onDeleteAccount={handleDeleteAccount}
//           onClose={() => setShowDeleteAccountModal(false)}
//         />
//       )}
//     </div>
//   );
// }



import { useEffect, useMemo, useState } from "react";
import {
  Outlet,
  useLocation,
  useNavigate,
  useParams,
  Link,
} from "react-router-dom";

import "../Common/css/common.css";
import "./SubAdminDashboard.css";

import FormatDate from "../../Components/DateTimeFunction/FormatDate";

import ChangePasswordModal from "../../Components/Auth/ChangePasswordModal";
import DeleteAccountModal from "../../Components/Auth/DeleteAccountModal";

import ERPLayout from "../../Components/ERP/ERPLayout";
import StatCard from "../../Components/ERP/StatCard";


// ============================================================
// SHARED MODAL
// ============================================================

function Modal({ title, onClose, children }) {
  return (
    <div className="subadmin-modal-overlay">
      <div className="subadmin-modal-box">

        <div className="subadmin-modal-header">

          <h3>
            {title}
          </h3>

          <button
            type="button"
            onClick={onClose}
            className="subadmin-modal-close"
          >
            ✕
          </button>

        </div>

        <div className="subadmin-modal-body">
          {children}
        </div>

      </div>
    </div>
  );
}


// ============================================================
// INLINE FORM STYLES
// ============================================================

const fieldStyle = {
  width: "100%",
  padding: "10px 12px",
  marginBottom: 12,
  borderRadius: 8,
  border: "1px solid #d1d5db",
  fontSize: 14,
  boxSizing: "border-box",
  outline: "none",
};

const labelStyle = {
  fontSize: 13,
  color: "#374151",
  fontWeight: 600,
  display: "block",
  marginBottom: 5,
};

const submitBtnStyle = {
  width: "100%",
  padding: "11px",
  borderRadius: 8,
  border: "none",
  background: "#2563eb",
  color: "#fff",
  fontWeight: 700,
  fontSize: 14,
  cursor: "pointer",
};

const outlineBtnStyle = (color) => ({
  width: "calc(100% - 32px)",
  margin: "0 16px 10px",
  padding: "10px",
  borderRadius: 8,
  border: `1px solid ${color}`,
  background: "transparent",
  color,
  fontWeight: 600,
  cursor: "pointer",
});


// ============================================================
// SUB ADMIN DASHBOARD
// ============================================================

export default function SubAdminDashboard() {

  const API_BASE =
    import.meta.env.VITE_API_BASE_URL;


  const { domain } = useParams();

  const location = useLocation();

  const navigate = useNavigate();


  // ==========================================================
  // STATE
  // ==========================================================

  const [subAdmin, setSubAdmin] = useState({});

  const [faculty, setFaculty] = useState([]);

  const [students, setStudents] = useState([]);

  const [showSidebar, setShowSidebar] =
    useState(true);


  // Profile picture modal
  const [showProfilePicModal, setShowProfilePicModal] =
    useState(false);


  // Edit profile modal
  const [showEditModal, setShowEditModal] =
    useState(false);


  // OTP guarded password modal
  const [showChangePasswordModal, setShowChangePasswordModal] =
    useState(false);


  // OTP guarded delete modal
  const [showDeleteAccountModal, setShowDeleteAccountModal] =
    useState(false);


  // Profile picture
  const [profilePicFile, setProfilePicFile] =
    useState(null);

  const [profilePicPreview, setProfilePicPreview] =
    useState(null);


  // Edit form
  const [editForm, setEditForm] =
    useState({});


  // Feedback
  const [actionMsg, setActionMsg] =
    useState("");

  const [actionErr, setActionErr] =
    useState("");


  // Loading
  const [loading, setLoading] =
    useState(true);


  // ==========================================================
  // HELPERS
  // ==========================================================

  const clearFeedback = () => {
    setActionMsg("");
    setActionErr("");
  };


  const authHeaders = () => ({
    Authorization:
      `Bearer ${localStorage.getItem("token")}`,

    "Content-Type":
      "application/json",
  });


  // ==========================================================
  // FETCH ALL SUB ADMIN DATA
  // ==========================================================

  useEffect(() => {

    fetchAllData();

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [domain]);


  const fetchAllData = async () => {

    try {

      setLoading(true);


      const headers = {
        Authorization:
          `Bearer ${localStorage.getItem("token")}`,

        "Content-Type":
          "application/json",
      };


      const [
        subAdminRes,
        studentRes,
        facultyRes,
      ] = await Promise.all([

        fetch(
          `${API_BASE}/${domain}/subAdmin`,
          { headers }
        ),

        fetch(
          `${API_BASE}/${domain}/subAdmin/all_student`,
          { headers }
        ),

        fetch(
          `${API_BASE}/${domain}/subAdmin/all_faculty`,
          { headers }
        ),

      ]);


      // -------------------------------------------------------
      // Authentication failure
      // -------------------------------------------------------

      if (
        subAdminRes.status === 401 ||
        studentRes.status === 401 ||
        facultyRes.status === 401
      ) {

        throw new Error(
          "SESSION_EXPIRED"
        );
      }


      // -------------------------------------------------------
      // Read responses
      // -------------------------------------------------------

      const subAdminData =
        await subAdminRes.json();

      const studentData =
        await studentRes.json();

      const facultyData =
        await facultyRes.json();


      // -------------------------------------------------------
      // Set state
      // -------------------------------------------------------

      setSubAdmin(
        subAdminData || {}
      );


      setStudents(
        studentData?.data || []
      );


      setFaculty(
        facultyData?.data || []
      );

    }

    catch (error) {

      console.error(
        "SubAdmin dashboard error:",
        error
      );


      alert(
        error.message === "SESSION_EXPIRED"
          ? "Session expired. Please login again."
          : "Unable to load dashboard data."
      );


      localStorage.clear();


      // navigate(
      //   `/${domain}/login`
      // );

    }

    finally {

      setLoading(false);

    }

  };


  // ==========================================================
  // PROFILE PICTURE
  // ==========================================================

  const handleProfilePicChange = (event) => {

    const file =
      event.target.files?.[0];


    if (!file) {
      return;
    }


    setProfilePicFile(file);


    setProfilePicPreview(
      URL.createObjectURL(file)
    );

  };


  const handleUpdateProfilePic =
    async () => {

      clearFeedback();


      if (!profilePicFile) {

        setActionErr(
          "Please select a profile picture first."
        );

        return;
      }


      try {

        const formData =
          new FormData();


        formData.append(
          "profilePic",
          profilePicFile
        );


        const response =
          await fetch(
            `${API_BASE}/${domain}/subAdmin/update_profile_pic`,
            {
              method: "PUT",

              headers: {
                Authorization:
                  `Bearer ${localStorage.getItem("token")}`,
              },

              body: formData,
            }
          );


        const data =
          await response.json();


        if (!response.ok || !data.success) {

          throw new Error(
            data?.message ||
            "Failed to update profile picture."
          );
        }


        setSubAdmin(
          previous => ({
            ...previous,

            /*
             * Your current backend response
             * returns the updated image path
             * in data.data.
             */
            profilePhotoPath:
              data.data,

            profilePic:
              data.data,
          })
        );


        setActionMsg(
          "Profile picture updated successfully."
        );


        setShowProfilePicModal(false);

        setProfilePicFile(null);

        setProfilePicPreview(null);

      }

      catch (error) {

        setActionErr(
          error.message ||
          "Unable to update profile picture."
        );

      }

    };


  // ==========================================================
  // EDIT PROFILE
  // ==========================================================

  const handleUpdateProfile =
    async () => {

      clearFeedback();


      try {

        const response =
          await fetch(
            `${API_BASE}/${domain}/subAdmin/update_profile`,
            {
              method: "PUT",

              headers:
                authHeaders(),

              body:
                JSON.stringify({
                  ...subAdmin,
                  ...editForm,
                }),
            }
          );


        if (!response.ok) {

          const message =
            await response.text();


          throw new Error(
            message ||
            "Failed to update profile."
          );
        }


        setSubAdmin(
          previous => ({
            ...previous,
            ...editForm,
          })
        );


        setActionMsg(
          "Profile updated successfully."
        );


        setShowEditModal(false);


        await fetchAllData();

      }

      catch (error) {

        setActionErr(
          error.message ||
          "Unable to update profile."
        );

      }

    };


  // ==========================================================
  // OTP PASSWORD CHANGE
  // ==========================================================

  const handleChangePassword =
    async (newPassword) => {

      return fetch(

        `${API_BASE}/${domain}/subAdmin/forgot_update_password` +
        `?email=${encodeURIComponent(subAdmin.email)}` +
        `&newpass=${encodeURIComponent(newPassword)}`,

        {
          method: "PUT",

          headers:
            authHeaders(),
        }

      );

    };


  // ==========================================================
  // ACCOUNT DELETE
  // ==========================================================

  const handleDeleteAccount =
    async () => {

      try {

        const response =
          await fetch(
            `${API_BASE}/${domain}/subAdmin/delete_account`,
            {
              method: "DELETE",

              headers: {
                Authorization:
                  `Bearer ${localStorage.getItem("token")}`,

                "Content-Type":
                  "application/json",
              },
            }
          );


        const message =
          await response.text();


        if (!response.ok) {

          throw new Error(
            message ||
            "Unable to delete account."
          );
        }


        alert(message);


        localStorage.clear();


        // navigate(
        //   `/${domain}/login`
        // );

      }

      catch (error) {

        setActionErr(
          error.message ||
          "Unable to delete account."
        );

      }

    };


  // ==========================================================
  // LOGOUT
  // ==========================================================

  const handleLogout = () => {

    localStorage.clear();

    navigate(
      `/${domain}/login`
    );

  };


  // ==========================================================
  // PROFILE IMAGE
  // ==========================================================

  const profileImage = useMemo(() => {

    const path =
      subAdmin.profilePhotoPath ||
      subAdmin.profilePic;


    if (!path) {
      return "/default.png";
    }


    if (
      path.startsWith("http://") ||
      path.startsWith("https://")
    ) {
      return path;
    }


    return `${API_BASE}/${path}`;

  }, [
    API_BASE,
    subAdmin.profilePhotoPath,
    subAdmin.profilePic,
  ]);


  // ==========================================================
  // ERP MENU
  // ==========================================================

  const menu = [

    {
      label: "Dashboard",
      icon: "dashboard",
      path:
        `/${domain}/subadmin/dashboard`,
      end: true,
    },

    {
      label: "Students",
      icon: "students",
      path:
        `/${domain}/subadmin/dashboard/all-students`,
    },

    {
      label: "Faculty",
      icon: "faculty",
      path:
        `/${domain}/subadmin/dashboard/all-faculty`,
    },

    {
      label: "Attendance",
      icon: "attendance",
      path:
        `/${domain}/subadmin/dashboard/attendance`,
    },

    {
      label: "Assignments",
      icon: "assignments",
      path:
        `/${domain}/subadmin/dashboard/assignments`,
    },

    {
      label: "Notes",
      icon: "notes",
      path:
        `/${domain}/subadmin/dashboard/notes`,
    },

    {
      label: "Notepad",
      icon: "notepad",
      path:
        `/${domain}/subadmin/dashboard/notepad`,
    },

  ];


  // ==========================================================
  // DASHBOARD ROUTE CHECK
  // ==========================================================

  const dashboardPath =
    `/${domain}/subadmin/dashboard`;


  const isDashboard =
    location.pathname === dashboardPath ||
    location.pathname === `${dashboardPath}/`;


  // ==========================================================
  // DASHBOARD PROFILE
  // ==========================================================

  const user = {

    name:
      subAdmin.name ||
      localStorage.getItem("name") ||
      "Sub Administrator",

    email:
      subAdmin.email ||
      localStorage.getItem("email") ||
      "",

    image:
      profileImage,

  };


  // ==========================================================
  // RENDER
  // ==========================================================

  return (

    <ERPLayout
      role="Sub Admin"
      user={user}
      menu={menu}
      showSidebar={showSidebar}
      onToggleSidebar={() =>
        setShowSidebar(
          previous => !previous
        )
      }
      onLogout={handleLogout}
    >

      {/* ======================================================
          GLOBAL FEEDBACK
      ====================================================== */}

      {actionMsg && (

        <div className="erp-alert erp-alert-success">

          <span>
            ✓ {actionMsg}
          </span>

          <button
            type="button"
            onClick={() =>
              setActionMsg("")
            }
          >
            ✕
          </button>

        </div>

      )}


      {actionErr && (

        <div className="erp-alert erp-alert-error">

          <span>
            ✕ {actionErr}
          </span>

          <button
            type="button"
            onClick={() =>
              setActionErr("")
            }
          >
            ✕
          </button>

        </div>

      )}


      {/* ======================================================
          DASHBOARD HOME
      ====================================================== */}

      {isDashboard ? (

        <>

          {/* ==================================================
              PAGE HEADER
          ================================================== */}

          <div className="erp-page-heading">

            <div>

              <span className="erp-eyebrow">
                ERP / ADMINISTRATION
              </span>

              <h1>
                Good evening,{" "}
                {subAdmin.name ||
                  "Sub Administrator"}
              </h1>

              <p>
                Manage students, faculty,
                attendance and academic
                operations from one place.
              </p>

            </div>


            <div className="erp-header-date">

              <span>
                Today
              </span>

              <strong>
                {new Date().toLocaleDateString(
                  "en-IN",
                  {
                    weekday: "long",
                    day: "2-digit",
                    month: "short",
                    year: "numeric",
                  }
                )}
              </strong>

            </div>

          </div>


          {/* ==================================================
              STAT CARDS
          ================================================== */}

          <div className="erp-stats">

            <StatCard
              type="students"
              label="Total Students"
              value={
                loading
                  ? "..."
                  : students.length
              }
              description="Registered students"
              onClick={() =>
                navigate(
                  `/${domain}/subadmin/dashboard/all-students`
                )
              }
            />


            <StatCard
              type="faculty"
              label="Total Faculty"
              value={
                loading
                  ? "..."
                  : faculty.length
              }
              description="Teaching faculty"
              onClick={() =>
                navigate(
                  `/${domain}/subadmin/dashboard/all-faculty`
                )
              }
            />


            <StatCard
              type="attendance"
              label="Attendance"
              value="—"
              description="Open attendance reports"
              onClick={() =>
                navigate(
                  `/${domain}/subadmin/dashboard/attendance`
                )
              }
            />


            <StatCard
              type="courses"
              label="Academic Operations"
              value="—"
              description="Assignments & notes"
              onClick={() =>
                navigate(
                  `/${domain}/subadmin/dashboard/assignments`
                )
              }
            />

          </div>


          {/* ==================================================
              MAIN DASHBOARD GRID
          ================================================== */}

          <div className="erp-dashboard-grid">


            {/* ----------------------------------------------
                QUICK ACTIONS
            ---------------------------------------------- */}

            <div className="erp-card erp-quick-card">

              <div className="erp-card-heading">

                <div>

                  <h3>
                    Quick Actions
                  </h3>

                  <p>
                    Frequently used ERP modules
                  </p>

                </div>

              </div>


              <div className="erp-quick-actions">

                <Link
                  to="all-students"
                  state={{
                    students,
                  }}
                  className="erp-action-item"
                >

                  <span className="erp-action-icon students-icon">
                    👨‍🎓
                  </span>

                  <span>

                    <strong>
                      Students
                    </strong>

                    <small>
                      View all students
                    </small>

                  </span>

                  <span>
                    →
                  </span>

                </Link>


                <Link
                  to="all-faculty"
                  state={{
                    faculty,
                  }}
                  className="erp-action-item"
                >

                  <span className="erp-action-icon faculty-icon">
                    👨‍🏫
                  </span>

                  <span>

                    <strong>
                      Faculty
                    </strong>

                    <small>
                      View teaching staff
                    </small>

                  </span>

                  <span>
                    →
                  </span>

                </Link>


                <Link
                  to="attendance"
                  className="erp-action-item"
                >

                  <span className="erp-action-icon attendance-icon">
                    ✓
                  </span>

                  <span>

                    <strong>
                      Attendance
                    </strong>

                    <small>
                      Monitor attendance
                    </small>

                  </span>

                  <span>
                    →
                  </span>

                </Link>


                <Link
                  to="notepad"
                  className="erp-action-item"
                >

                  <span className="erp-action-icon notes-icon">
                    📝
                  </span>

                  <span>

                    <strong>
                      Notepad
                    </strong>

                    <small>
                      Manage notes
                    </small>

                  </span>

                  <span>
                    →
                  </span>

                </Link>

              </div>

            </div>


            {/* ----------------------------------------------
                INSTITUTION SUMMARY
            ---------------------------------------------- */}

            <div className="erp-card">

              <div className="erp-card-heading">

                <div>

                  <h3>
                    Institution Overview
                  </h3>

                  <p>
                    Current account information
                  </p>

                </div>

              </div>


              <div className="erp-overview-list">

                <div>

                  <span>
                    Administrator
                  </span>

                  <strong>
                    {subAdmin.name || "—"}
                  </strong>

                </div>


                <div>

                  <span>
                    Email
                  </span>

                  <strong>
                    {subAdmin.email || "—"}
                  </strong>

                </div>


                <div>

                  <span>
                    Mobile
                  </span>

                  <strong>
                    {subAdmin.mobileNumber || "—"}
                  </strong>

                </div>


                <div>

                  <span>
                    Course
                  </span>

                  <strong>
                    {subAdmin.course || "—"}
                  </strong>

                </div>


                <div>

                  <span>
                    Last Login
                  </span>

                  <strong>
                    {FormatDate(
                      subAdmin.lastLoginDateTime
                    )}
                  </strong>

                </div>

              </div>

            </div>


            {/* ----------------------------------------------
                ATTENDANCE
            ---------------------------------------------- */}

            <div className="erp-card">

              <div className="erp-card-heading">

                <div>

                  <h3>
                    Attendance Overview
                  </h3>

                  <p>
                    Monitor batch attendance
                  </p>

                </div>

                <button
                  type="button"
                  className="erp-text-button"
                  onClick={() =>
                    navigate(
                      `/${domain}/subadmin/dashboard/attendance`
                    )
                  }
                >
                  View →
                </button>

              </div>


              <div className="erp-empty-state">

                <div className="erp-empty-icon">
                  ✓
                </div>

                <h4>
                  Attendance reports
                </h4>

                <p>
                  Select a batch and academic
                  session to inspect attendance.
                </p>

              </div>

            </div>


            {/* ----------------------------------------------
                RECENT ACADEMIC ACTIVITY
            ---------------------------------------------- */}

            <div className="erp-card">

              <div className="erp-card-heading">

                <div>

                  <h3>
                    Academic Management
                  </h3>

                  <p>
                    Manage academic resources
                  </p>

                </div>

              </div>


              <div className="erp-module-list">

                <Link
                  to="assignments"
                  className="erp-module-row"
                >

                  <span>
                    📚
                  </span>

                  <div>

                    <strong>
                      Assignments
                    </strong>

                    <small>
                      Create and manage assignments
                    </small>

                  </div>

                  <b>
                    →
                  </b>

                </Link>


                <Link
                  to="notes"
                  className="erp-module-row"
                >

                  <span>
                    📖
                  </span>

                  <div>

                    <strong>
                      Notes
                    </strong>

                    <small>
                      Manage academic notes
                    </small>

                  </div>

                  <b>
                    →
                  </b>

                </Link>


                <Link
                  to="notepad"
                  className="erp-module-row"
                >

                  <span>
                    📝
                  </span>

                  <div>

                    <strong>
                      Notepad
                    </strong>

                    <small>
                      Personal administrator notes
                    </small>

                  </div>

                  <b>
                    →
                  </b>

                </Link>

              </div>

            </div>


          </div>


          {/* ==================================================
              PROFILE / ACCOUNT FOOTER
          ================================================== */}

          <div className="erp-profile-footer">

            <div className="erp-profile-footer-user">

              <img
                src={profileImage}
                alt="Sub Admin"
                onError={(event) => {
                  event.currentTarget.src =
                    "/default.png";
                }}
              />

              <div>

                <strong>
                  {subAdmin.name ||
                    "Sub Administrator"}
                </strong>

                <span>
                  {subAdmin.email || ""}
                </span>

              </div>

            </div>


            <div className="erp-profile-footer-actions">

              <button
                type="button"
                onClick={() => {

                  clearFeedback();

                  setEditForm({
                    name:
                      subAdmin.name || "",

                    mobileNumber:
                      subAdmin.mobileNumber || "",

                    course:
                      subAdmin.course || "",
                  });

                  setShowEditModal(true);

                }}
              >
                Edit Profile
              </button>


              <button
                type="button"
                onClick={() => {

                  clearFeedback();

                  setShowChangePasswordModal(
                    true
                  );

                }}
              >
                Change Password
              </button>

            </div>

          </div>

        </>

      ) : (

        /* ====================================================
           CHILD ROUTES
        ==================================================== */

        <div className="erp-sub-page-container">

          <div className="erp-sub-page-toolbar">

            <button
              type="button"
              className="erp-back-button"
              onClick={() =>
                navigate(
                  `/${domain}/subadmin/dashboard`
                )
              }
            >
              ← Dashboard
            </button>

            <span>
              ERP / Sub Admin
            </span>

          </div>


          <Outlet />

        </div>

      )}


      {/* ======================================================
          PROFILE PICTURE MODAL
      ====================================================== */}

      {showProfilePicModal && (

        <Modal
          title="Update Profile Picture"
          onClose={() => {

            setShowProfilePicModal(false);

            setProfilePicFile(null);

            setProfilePicPreview(null);

            clearFeedback();

          }}
        >

          <div className="profile-picture-preview">

            <img
              src={
                profilePicPreview ||
                profileImage
              }
              alt="Preview"
            />

          </div>


          <label style={labelStyle}>
            Choose New Profile Picture
          </label>


          <input
            type="file"
            accept="image/png,image/jpeg,image/webp"
            onChange={handleProfilePicChange}
            style={{
              ...fieldStyle,
              padding: "8px",
            }}
          />


          {actionErr && (

            <p className="modal-error">
              {actionErr}
            </p>

          )}


          <button
            type="button"
            style={submitBtnStyle}
            onClick={handleUpdateProfilePic}
          >
            Upload & Save
          </button>

        </Modal>

      )}


      {/* ======================================================
          EDIT PROFILE MODAL
      ====================================================== */}

      {showEditModal && (

        <Modal
          title="Edit Profile"
          onClose={() => {

            setShowEditModal(false);

            clearFeedback();

          }}
        >

          <div>

            <label style={labelStyle}>
              Full Name
            </label>

            <input
              type="text"
              value={
                editForm.name || ""
              }
              onChange={(event) =>
                setEditForm(
                  previous => ({
                    ...previous,
                    name:
                      event.target.value,
                  })
                )
              }
              style={fieldStyle}
            />

          </div>


          <div>

            <label style={labelStyle}>
              Mobile Number
            </label>

            <input
              type="text"
              value={
                editForm.mobileNumber || ""
              }
              onChange={(event) =>
                setEditForm(
                  previous => ({
                    ...previous,
                    mobileNumber:
                      event.target.value,
                  })
                )
              }
              style={fieldStyle}
            />

          </div>


          <div>

            <label style={labelStyle}>
              Course
            </label>

            <input
              type="text"
              value={
                editForm.course || ""
              }
              onChange={(event) =>
                setEditForm(
                  previous => ({
                    ...previous,
                    course:
                      event.target.value,
                  })
                )
              }
              style={fieldStyle}
            />

          </div>


          {actionErr && (

            <p className="modal-error">
              {actionErr}
            </p>

          )}


          <button
            type="button"
            style={submitBtnStyle}
            onClick={handleUpdateProfile}
          >
            Save Changes
          </button>

        </Modal>

      )}


      {/* ======================================================
          OTP CHANGE PASSWORD
      ====================================================== */}

      {showChangePasswordModal && (

        <ChangePasswordModal
          email={subAdmin.email}

          onChangePassword={
            handleChangePassword
          }

          onClose={() =>
            setShowChangePasswordModal(false)
          }

          onSuccess={() => {

            setShowChangePasswordModal(
              false
            );

            setActionMsg(
              "Password updated successfully."
            );

          }}
        />

      )}


      {/* ======================================================
          OTP DELETE ACCOUNT
      ====================================================== */}

      {showDeleteAccountModal && (

        <DeleteAccountModal
          name={subAdmin.name}
          email={subAdmin.email}

          onDeleteAccount={
            handleDeleteAccount
          }

          onClose={() =>
            setShowDeleteAccountModal(false)
          }
        />

      )}

    </ERPLayout>

  );

}
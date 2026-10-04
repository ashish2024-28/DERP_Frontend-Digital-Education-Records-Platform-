// import { useEffect, useMemo, useState } from "react";
// import { Outlet,  useLocation,  useNavigate,  useParams,} from "react-router-dom";
// import "../Common/css/common.css";
// import "./FeesAdminDashboard.css";
// import FormatDate from "../../Components/DateTimeFunction/FormatDate";
// import ChangePasswordModal from "../../Components/Auth/ChangePasswordModal";
// import DeleteAccountModal from "../../Components/Auth/DeleteAccountModal";

// /*
//  * Fees Admin Dashboard
//  * ---------------------------------------------------------
//  * APIs are taken directly from FeesAdminController:
//  *
//  * GET    /{domain}/feesAdmin
//  * PUT    /{domain}/feesAdmin/update_profile
//  * PUT    /{domain}/feesAdmin/forgot_update_password
//  * DELETE /{domain}/feesAdmin/delete_account
//  * GET    /{domain}/feesAdmin/all_student
//  * GET    /{domain}/feesAdmin/all_faculty
//  *
//  * There is no fees-specific CRUD endpoint in the supplied
//  * FeesAdminController, so this dashboard does not invent one.
//  */

// export default function FeesAdminDashboard() {
//   const API_BASE =
//     import.meta.env.VITE_API_BASE_URL?.replace(/\/+$/, "");

//   const { domain } = useParams();
//   const navigate = useNavigate();
//   const location = useLocation();

//   const [feesAdmin, setFeesAdmin] = useState({});
//   const [students, setStudents] = useState([]);
//   const [faculty, setFaculty] = useState([]);

//   const [loading, setLoading] = useState(true);
//   const [showEditModal, setShowEditModal] = useState(false);
//   const [showChangePasswordModal, setShowChangePasswordModal] = useState(false);
//   const [showDeleteAccountModal, setShowDeleteAccountModal] = useState(false);

//   const [editForm, setEditForm] = useState({});
//   const [search, setSearch] = useState("");

//   const [actionMsg, setActionMsg] = useState("");
//   const [actionErr, setActionErr] = useState("");

//   const clearFeedback = () => {
//     setActionMsg("");
//     setActionErr("");
//   };

//   const authHeaders = () => ({
//     Authorization: `Bearer ${localStorage.getItem("token")}`,
//     "Content-Type": "application/json",
//   });

//   /*
//    * Read JSON safely. Spring can sometimes return plain text
//    * for older endpoints, so we support both JSON and text.
//    */
//   const readResponse = async (response) => {
//     const text = await response.text();

//     if (!text) return {};

//     try {
//       return JSON.parse(text);
//     } catch {
//       return { message: text };
//     }
//   };

//   /*
//    * Load Fees Admin profile + students + faculty.
//    * The controller exposes these three read operations.
//    */
//   const fetchAllData = async () => {
//     setLoading(true);
//     clearFeedback();

//     try {
//       const [profileRes, studentRes, facultyRes] =
//         await Promise.all([
//           fetch(`${API_BASE}/${domain}/feesAdmin`, {
//             headers: authHeaders(),
//           }),

//           fetch(`${API_BASE}/${domain}/feesAdmin/all_student`, {
//             headers: authHeaders(),
//           }),

//           fetch(`${API_BASE}/${domain}/feesAdmin/all_faculty`, {
//             headers: authHeaders(),
//           }),
//         ]);

//       const profileData = await readResponse(profileRes);
//       const studentData = await readResponse(studentRes);
//       const facultyData = await readResponse(facultyRes);

//       if (!profileRes.ok) {
//         throw new Error(
//           profileData?.message || "Unable to load Fees Admin profile."
//         );
//       }

//       /*
//        * Profile endpoint returns the FeesAdmin object directly.
//        */
//       setFeesAdmin(profileData?.data || profileData || {});

//       /*
//        * all_student / all_faculty are wrapped in ApiResponse,
//        * therefore data is normally inside .data.
//        */
//       const studentList = Array.isArray(studentData?.data)
//         ? studentData.data
//         : Array.isArray(studentData)
//           ? studentData
//           : [];

//       const facultyList = Array.isArray(facultyData?.data)
//         ? facultyData.data
//         : Array.isArray(facultyData)
//           ? facultyData
//           : [];

//       setStudents(studentList);
//       setFaculty(facultyList);
//     } catch (error) {
//       console.error("Fees Admin dashboard error:", error);
//       setActionErr(error?.message || "Unable to load dashboard.");
//     } finally {
//       setLoading(false);
//     }
//   };

//   useEffect(() => {
//     fetchAllData();
//   }, [domain]);

//   /*
//    * Update profile.
//    * Controller accepts a FeesAdmin request body.
//    */
//   const openEditProfile = () => {
//     clearFeedback();

//     setEditForm({
//       name: feesAdmin?.name || "",
//       mobileNumber: feesAdmin?.mobileNumber || "",
//     });

//     setShowEditModal(true);
//   };

//   const handleUpdateProfile = async () => {
//     clearFeedback();

//     if (!editForm.name?.trim()) {
//       setActionErr("Name is required.");
//       return;
//     }

//     if (
//       editForm.mobileNumber &&
//       !/^\d{10}$/.test(editForm.mobileNumber.trim())
//     ) {
//       setActionErr("Mobile number must contain exactly 10 digits.");
//       return;
//     }

//     try {
//       const response = await fetch(
//         `${API_BASE}/${domain}/feesAdmin/update_profile`,
//         {
//           method: "PUT",
//           headers: authHeaders(),
//           body: JSON.stringify({
//             ...feesAdmin,
//             ...editForm,
//           }),
//         }
//       );

//       const data = await readResponse(response);

//       if (!response.ok) {
//         throw new Error(
//           data?.message || "Failed to update profile."
//         );
//       }

//       setFeesAdmin((previous) => ({
//         ...previous,
//         ...editForm,
//       }));

//       setShowEditModal(false);
//       setActionMsg("Profile updated successfully.");
//     } catch (error) {
//       setActionErr(error?.message || "Profile update failed.");
//     }
//   };

//   /*
//    * Change password modal calls this function.
//    * Controller currently expects email + newpass.
//    */
//   const handleChangePassword = async (newPassword) => {
//     return fetch(
//       `${API_BASE}/${domain}/feesAdmin/forgot_update_password?email=${encodeURIComponent(
//         feesAdmin?.email || ""
//       )}&newpass=${encodeURIComponent(newPassword)}`,
//       {
//         method: "PUT",
//         headers: {
//           Authorization: `Bearer ${localStorage.getItem("token")}`,
//         },
//       }
//     );
//   };

//   /*
//    * Delete account.
//    * The corrected backend controller uses the authenticated
//    * email, so the frontend does not send an arbitrary email.
//    */
//   const handleDeleteAccount = async () => {
//     const response = await fetch(
//       `${API_BASE}/${domain}/feesAdmin/delete_account`,
//       {
//         method: "DELETE",
//         headers: {
//           Authorization: `Bearer ${localStorage.getItem("token")}`,
//         },
//       }
//     );

//     const data = await readResponse(response);

//     if (!response.ok) {
//       throw new Error(
//         data?.message || "Unable to delete account."
//       );
//     }

//     localStorage.clear();
//     navigate(`/${domain}/login`);
//   };

//   const handleLogout = () => {
//     localStorage.clear();
//     navigate(`/${domain}/login`);
//   };

//   const profileImage = feesAdmin?.profilePic
//     ? `${API_BASE}/${feesAdmin.profilePic}`
//     : "/default.png";

//   /*
//    * Search both students and faculty from the dashboard.
//    * This is local filtering; no extra backend API is invented.
//    */
//   const filteredStudents = useMemo(() => {
//     const query = search.trim().toLowerCase();

//     if (!query) return students;

//     return students.filter((item) =>
//       [
//         item?.name,
//         item?.email,
//         item?.rollNumber,
//         item?.course,
//         item?.branch,
//         item?.batch,
//       ]
//         .filter(Boolean)
//         .some((value) =>
//           String(value).toLowerCase().includes(query)
//         )
//     );
//   }, [students, search]);

//   const filteredFaculty = useMemo(() => {
//     const query = search.trim().toLowerCase();

//     if (!query) return faculty;

//     return faculty.filter((item) =>
//       [
//         item?.name,
//         item?.email,
//         item?.facultyId,
//         item?.course,
//       ]
//         .filter(Boolean)
//         .some((value) =>
//           String(value).toLowerCase().includes(query)
//         )
//     );
//   }, [faculty, search]);

//   const isDashboard =
//     location.pathname === `/${domain}/feesAdmin/dashboard`;

//   const menu = [
//     {
//       label: "Dashboard",
//       icon: "dashboard",
//       path: `/${domain}/feesAdmin/dashboard`,
//       end: true,
//     },
//     {
//       label: "Students",
//       icon: "students",
//       path: `/${domain}/feesAdmin/dashboard/all-students`,
//     },
//     {
//       label: "Faculty",
//       icon: "faculty",
//       path: `/${domain}/feesAdmin/dashboard/all-faculty`,
//     },
//     {
//       label: "Fees",
//       icon: "reports",
//       path: `/${domain}/feesAdmin/dashboard/fees`,
//     },
//     {
//       label: "Reports",
//       icon: "reports",
//       path: `/${domain}/feesAdmin/dashboard/reports`,
//     },
//     {
//       label: "Notepad",
//       icon: "notepad",
//       path: `/${domain}/feesAdmin/dashboard/notepad`,
//     },
//   ];

//   return (
    
//       <div className="fees-admin-dashboard">
//         {/* Feedback */}
//         {actionMsg && (
//           <div className="erp-feedback erp-feedback-success">
//             <span>✓</span>
//             <span>{actionMsg}</span>
//           </div>
//         )}

//         {actionErr && (
//           <div className="erp-feedback erp-feedback-error">
//             <span>!</span>
//             <span>{actionErr}</span>
//           </div>
//         )}

//         {isDashboard ? (
//           <>
//             {/* Page heading */}
//             <div className="erp-page-heading fees-admin-heading">
//               <div>
//                 <div className="fees-admin-eyebrow">
//                   Fees Administration
//                 </div>

//                 <h1>
//                   Welcome back,{" "}
//                   {feesAdmin?.name || "Fees Admin"} 👋
//                 </h1>

//                 <p>
//                   Manage student and faculty information and
//                   keep fee-related operations organized.
//                 </p>
//               </div>

//               <button
//                 type="button"
//                 className="erp-primary-btn"
//                 onClick={openEditProfile}
//               >
//                 Edit Profile
//               </button>
//             </div>

//             {/* Statistics */}
//             <div className="erp-stats">
//               <StatCard
//                 type="students"
//                 label="Students"
//                 value={loading ? "…" : students.length}
//                 subtitle="Students in university"
//               />

//               <StatCard
//                 type="faculty"
//                 label="Faculty"
//                 value={loading ? "…" : faculty.length}
//                 subtitle="Faculty records"
//               />

//               <StatCard
//                 type="courses"
//                 label="Account"
//                 value={feesAdmin?.feesAdminId || "—"}
//                 subtitle="Fees Admin ID"
//               />

//               <StatCard
//                 type="reports"
//                 label="Status"
//                 value="Active"
//                 subtitle="Signed-in account"
//               />
//             </div>

//             {/* Account overview */}
//             <section className="erp-card fees-admin-account">
//               <div className="fees-admin-section-header">
//                 <div>
//                   <h2>Account Overview</h2>
//                   <p>Your Fees Admin account information.</p>
//                 </div>

//                 <button
//                   type="button"
//                   className="erp-secondary-btn"
//                   onClick={openEditProfile}
//                 >
//                   Edit
//                 </button>
//               </div>

//               <div className="fees-admin-account-grid">
//                 <div>
//                   <span>Name</span>
//                   <strong>{feesAdmin?.name || "—"}</strong>
//                 </div>

//                 <div>
//                   <span>Fees Admin ID</span>
//                   <strong>{feesAdmin?.feesAdminId || "—"}</strong>
//                 </div>

//                 <div>
//                   <span>Email</span>
//                   <strong>{feesAdmin?.email || "—"}</strong>
//                 </div>

//                 <div>
//                   <span>Mobile</span>
//                   <strong>{feesAdmin?.mobileNumber || "—"}</strong>
//                 </div>

//                 <div>
//                   <span>Created</span>
//                   <strong>
//                     {FormatDate(feesAdmin?.createdDateTime)}
//                   </strong>
//                 </div>

//                 <div>
//                   <span>Last Login</span>
//                   <strong>
//                     {FormatDate(feesAdmin?.lastLoginDateTime)}
//                   </strong>
//                 </div>
//               </div>
//             </section>

//             {/* Quick data preview */}
//             <div className="fees-admin-preview-grid">
//               <section className="erp-card">
//                 <div className="fees-admin-section-header">
//                   <div>
//                     <h2>Recent Students</h2>
//                     <p>Student records available to Fees Admin.</p>
//                   </div>

//                   <span className="fees-admin-count">
//                     {students.length}
//                   </span>
//                 </div>

//                 <div className="erp-data-table-wrap">
//                   <table className="erp-data-table">
//                     <thead>
//                       <tr>
//                         <th>Name</th>
//                         <th>Roll Number</th>
//                         <th>Course</th>
//                       </tr>
//                     </thead>

//                     <tbody>
//                       {students.slice(0, 5).map((item, index) => (
//                         <tr key={item?.id || item?.email || index}>
//                           <td>
//                             <strong>{item?.name || "—"}</strong>
//                           </td>
//                           <td>{item?.rollNumber || "—"}</td>
//                           <td>{item?.course || "—"}</td>
//                         </tr>
//                       ))}

//                       {students.length === 0 && (
//                         <tr>
//                           <td colSpan="3">
//                             <div className="erp-empty-state">
//                               No student records found.
//                             </div>
//                           </td>
//                         </tr>
//                       )}
//                     </tbody>
//                   </table>
//                 </div>
//               </section>

//               <section className="erp-card">
//                 <div className="fees-admin-section-header">
//                   <div>
//                     <h2>Faculty</h2>
//                     <p>Faculty records available to Fees Admin.</p>
//                   </div>

//                   <span className="fees-admin-count">
//                     {faculty.length}
//                   </span>
//                 </div>

//                 <div className="erp-data-table-wrap">
//                   <table className="erp-data-table">
//                     <thead>
//                       <tr>
//                         <th>Name</th>
//                         <th>Faculty ID</th>
//                         <th>Course</th>
//                       </tr>
//                     </thead>

//                     <tbody>
//                       {faculty.slice(0, 5).map((item, index) => (
//                         <tr key={item?.id || item?.email || index}>
//                           <td>
//                             <strong>{item?.name || "—"}</strong>
//                           </td>
//                           <td>{item?.facultyId || "—"}</td>
//                           <td>{item?.course || "—"}</td>
//                         </tr>
//                       ))}

//                       {faculty.length === 0 && (
//                         <tr>
//                           <td colSpan="3">
//                             <div className="erp-empty-state">
//                               No faculty records found.
//                             </div>
//                           </td>
//                         </tr>
//                       )}
//                     </tbody>
//                   </table>
//                 </div>
//               </section>
//             </div>

//             {/* Searchable full data preview */}
//             <section className="erp-card fees-admin-data-card">
//               <div className="fees-admin-section-header">
//                 <div>
//                   <h2>University Records</h2>
//                   <p>
//                     Search student or faculty records from the
//                     APIs provided by FeesAdminController.
//                   </p>
//                 </div>

//                 <input
//                   className="fees-admin-search"
//                   type="search"
//                   value={search}
//                   onChange={(e) => setSearch(e.target.value)}
//                   placeholder="Search name, email, ID, course..."
//                 />
//               </div>

//               <div className="fees-admin-result-columns">
//                 <div>
//                   <div className="fees-admin-subheading">
//                     Students ({filteredStudents.length})
//                   </div>

//                   <div className="erp-data-table-wrap">
//                     <table className="erp-data-table">
//                       <thead>
//                         <tr>
//                           <th>Name</th>
//                           <th>Roll No</th>
//                           <th>Email</th>
//                           <th>Course</th>
//                         </tr>
//                       </thead>

//                       <tbody>
//                         {filteredStudents.slice(0, 20).map((item, index) => (
//                           <tr key={item?.id || item?.email || index}>
//                             <td>{item?.name || "—"}</td>
//                             <td>{item?.rollNumber || "—"}</td>
//                             <td>{item?.email || "—"}</td>
//                             <td>{item?.course || "—"}</td>
//                           </tr>
//                         ))}

//                         {filteredStudents.length === 0 && (
//                           <tr>
//                             <td colSpan="4">
//                               <div className="erp-empty-state">
//                                 No matching students.
//                               </div>
//                             </td>
//                           </tr>
//                         )}
//                       </tbody>
//                     </table>
//                   </div>
//                 </div>

//                 <div>
//                   <div className="fees-admin-subheading">
//                     Faculty ({filteredFaculty.length})
//                   </div>

//                   <div className="erp-data-table-wrap">
//                     <table className="erp-data-table">
//                       <thead>
//                         <tr>
//                           <th>Name</th>
//                           <th>Faculty ID</th>
//                           <th>Email</th>
//                           <th>Course</th>
//                         </tr>
//                       </thead>

//                       <tbody>
//                         {filteredFaculty.slice(0, 20).map((item, index) => (
//                           <tr key={item?.id || item?.email || index}>
//                             <td>{item?.name || "—"}</td>
//                             <td>{item?.facultyId || "—"}</td>
//                             <td>{item?.email || "—"}</td>
//                             <td>{item?.course || "—"}</td>
//                           </tr>
//                         ))}

//                         {filteredFaculty.length === 0 && (
//                           <tr>
//                             <td colSpan="4">
//                               <div className="erp-empty-state">
//                                 No matching faculty.
//                               </div>
//                             </td>
//                           </tr>
//                         )}
//                       </tbody>
//                     </table>
//                   </div>
//                 </div>
//               </div>
//             </section>
//           </>
//         ) : (
//           /*
//            * Child routes are rendered by React Router.
//            */
//           <Outlet />
//         )}

//         {/* Edit profile modal */}
//         {showEditModal && (
//           <div
//             className="erp-modal-overlay"
//             onMouseDown={(event) => {
//               if (event.target === event.currentTarget) {
//                 setShowEditModal(false);
//               }
//             }}
//           >
//             <div className="erp-modal">
//               <div className="erp-modal-header">
//                 <h3>Edit Fees Admin Profile</h3>

//                 <button
//                   type="button"
//                   className="erp-modal-close"
//                   onClick={() => setShowEditModal(false)}
//                 >
//                   ×
//                 </button>
//               </div>

//               <div className="erp-modal-body">
//                 <div className="erp-field">
//                   <label>Full Name</label>
//                   <input
//                     type="text"
//                     value={editForm?.name || ""}
//                     placeholder="Example: Ashish Kumar"
//                     onChange={(e) =>
//                       setEditForm((previous) => ({
//                         ...previous,
//                         name: e.target.value,
//                       }))
//                     }
//                   />
//                 </div>

//                 <div className="erp-field">
//                   <label>Mobile Number</label>
//                   <input
//                     type="text"
//                     inputMode="numeric"
//                     maxLength={10}
//                     value={editForm?.mobileNumber || ""}
//                     placeholder="Example: 9876543210"
//                     onChange={(e) =>
//                       setEditForm((previous) => ({
//                         ...previous,
//                         mobileNumber: e.target.value
//                           .replace(/\D/g, "")
//                           .slice(0, 10),
//                       }))
//                     }
//                   />
//                 </div>

//                 <div className="fees-admin-readonly-note">
//                   Email and Fees Admin ID are managed by the
//                   account system and are not edited here.
//                 </div>

//                 <div className="fees-admin-modal-actions">
//                   <button
//                     type="button"
//                     className="erp-secondary-btn"
//                     onClick={() => setShowEditModal(false)}
//                   >
//                     Cancel
//                   </button>

//                   <button
//                     type="button"
//                     className="erp-primary-btn"
//                     onClick={handleUpdateProfile}
//                   >
//                     Save Changes
//                   </button>
//                 </div>
//               </div>
//             </div>
//           </div>
//         )}

//         {showChangePasswordModal && (
//           <ChangePasswordModal
//             email={feesAdmin?.email}
//             onChangePassword={handleChangePassword}
//             onClose={() => setShowChangePasswordModal(false)}
//             onSuccess={() => {
//               setShowChangePasswordModal(false);
//               setActionMsg("Password updated successfully.");
//             }}
//           />
//         )}

//         {showDeleteAccountModal && (
//           <DeleteAccountModal
//             name={feesAdmin?.name}
//             email={feesAdmin?.email}
//             onDeleteAccount={handleDeleteAccount}
//             onClose={() => setShowDeleteAccountModal(false)}
//           />
//         )}

//         {/* Account actions stay at the bottom to avoid cluttering
//             the main dashboard. */}
//         <div className="fees-admin-account-actions">
//           <button
//             type="button"
//             className="erp-secondary-btn"
//             onClick={() => setShowChangePasswordModal(true)}
//           >
//             Change Password
//           </button>

//           <button
//             type="button"
//             className="erp-danger-btn"
//             onClick={() => setShowDeleteAccountModal(true)}
//           >
//             Delete Account
//           </button>
//         </div>
//       </div>
//   );
// }



















import { useCallback, useEffect, useMemo, useState } from "react";
import {
  Outlet,
  useLocation,
  useNavigate,
  useParams,
} from "react-router-dom";

import "../Common/css/common.css";
import "./FeesAdminDashboard.css";

import FormatDate from "../../Components/DateTimeFunction/FormatDate";
import ChangePasswordModal from "../../Components/Auth/ChangePasswordModal";
import DeleteAccountModal from "../../Components/Auth/DeleteAccountModal";

export default function FeesAdminDashboard() {
  const API_BASE =
    import.meta.env.VITE_API_BASE_URL?.replace(/\/+$/, "");

  const { domain } = useParams();
  const navigate = useNavigate();
  const location = useLocation();

  /*
   * IMPORTANT
   * These are intentionally different because your backend
   * controllers use feesAdmin and fees-admin separately.
   */
  const FEES_ADMIN_BASE = `${API_BASE}/${domain}/feesAdmin`;
  const FEES_ACCOUNT_BASE = `${API_BASE}/${domain}/fees-admin`;

  const [feesAdmin, setFeesAdmin] = useState({});
  const [students, setStudents] = useState([]);
  const [faculty, setFaculty] = useState([]);

  const [courseWiseFees, setCourseWiseFees] = useState([]);
  const [paymentMethods, setPaymentMethods] = useState([]);
  const [pendingPayments, setPendingPayments] = useState([]);

  const [loading, setLoading] = useState(true);
  const [feesLoading, setFeesLoading] = useState(false);
  const [showSidebar, setShowSidebar] = useState(true);
  const [refreshId, setRefreshId] = useState(0);

  const [search, setSearch] = useState("");
  const [activeSection, setActiveSection] = useState("overview");

  const [showEditModal, setShowEditModal] = useState(false);
  const [showChangePasswordModal, setShowChangePasswordModal] =
    useState(false);
  const [showDeleteAccountModal, setShowDeleteAccountModal] =
    useState(false);

  const [editForm, setEditForm] = useState({});

  const [actionMsg, setActionMsg] = useState("");
  const [actionErr, setActionErr] = useState("");

  const clearFeedback = () => {
    setActionMsg("");
    setActionErr("");
  };

  const authHeaders = useCallback(() => ({
    Authorization: `Bearer ${localStorage.getItem("token")}`,
    "Content-Type": "application/json",
  }), []);

  /*
   * Safely read JSON/text.
   */
  const readResponse = useCallback(async (response) => {
    const text = await response.text();

    if (!text) {
      return {};
    }

    try {
      return JSON.parse(text);
    } catch {
      return {
        message: text,
      };
    }
  }, []);

  /*
   * Extract array from either:
   *
   * ApiResponse:
   * {
   *   success: true,
   *   data: [...]
   * }
   *
   * or direct [...]
   */
  const extractArray = useCallback((data) => {
    if (Array.isArray(data?.data)) {
      return data.data;
    }

    if (Array.isArray(data)) {
      return data;
    }

    throw new Error("The server returned an invalid list response.");
  }, []);

  /*
   * ============================
   * PROFILE + UNIVERSITY DATA
   * ============================
   */
  const fetchBasicData = useCallback(async () => {
    const endpoints = [
      ["profile", FEES_ADMIN_BASE],
      ["students", `${FEES_ADMIN_BASE}/all_student`],
      ["faculty", `${FEES_ADMIN_BASE}/all_faculty`],
    ];
    const results = await Promise.allSettled(endpoints.map(async ([, url]) => {
      const response = await fetch(url, { headers: authHeaders() });
      const payload = await readResponse(response);
      if (!response.ok || payload?.success === false) {
        throw new Error(payload?.message || payload?.detail || `Request failed (${response.status}).`);
      }
      return payload;
    }));

    const issues = [];
    results.forEach((result, index) => {
      const [label] = endpoints[index];
      if (result.status === "rejected") {
        issues.push(`${label}: ${result.reason?.message || "request failed"}`);
        return;
      }
      try {
        if (label === "profile") {
          const profile = result.value?.data ?? result.value;
          if (!profile || typeof profile !== "object" || Array.isArray(profile)) {
            throw new Error("The server returned an invalid profile.");
          }
          setFeesAdmin(profile);
        } else if (label === "students") {
          setStudents(extractArray(result.value));
        } else {
          setFaculty(extractArray(result.value));
        }
      } catch (error) {
        issues.push(`${label}: ${error.message}`);
      }
    });
    if (issues.length) setActionErr(issues.join(" "));
  }, [FEES_ADMIN_BASE, authHeaders, readResponse, extractArray]);

  /*
   * ============================
   * FEES ACCOUNT GET APIs
   * ============================
   */
  const fetchFeesData = useCallback(async () => {
    setFeesLoading(true);

    try {
      const endpoints = [
        ["course fee schedule", `${FEES_ACCOUNT_BASE}/fees-course-wise`, setCourseWiseFees],
        ["payment methods", `${FEES_ACCOUNT_BASE}/payment-methods`, setPaymentMethods],
        ["pending payments", `${FEES_ACCOUNT_BASE}/payments/pending`, setPendingPayments],
      ];
      const results = await Promise.allSettled(
        endpoints.map(async ([, url]) => {
          const response = await fetch(url, { headers: authHeaders() });
          const payload = await readResponse(response);
          if (!response.ok || payload?.success === false) {
            throw new Error(payload?.message || payload?.detail || `Request failed (${response.status}).`);
          }
          return payload;
        })
      );
      const issues = [];

      results.forEach((result, index) => {
        const [label, , setter] = endpoints[index];
        if (result.status === "rejected") {
          issues.push(`${label}: ${result.reason?.message || "request failed"}`);
          return;
        }

        try {
          setter(extractArray(result.value));
        } catch (error) {
          issues.push(`${label}: ${error.message}`);
        }
      });

      if (issues.length > 0) {
        setActionErr(issues.join(" "));
      }
    } catch (error) {
      console.error(
        "Fees API error:",
        error
      );
      setActionErr(error?.message || "Unable to load fees administration data.");
    } finally {
      setFeesLoading(false);
    }
  }, [FEES_ACCOUNT_BASE, authHeaders, readResponse, extractArray]);

  /*
   * ============================
   * INITIAL LOAD
   * ============================
   */
  useEffect(() => {
    let mounted = true;

    const load = async () => {
      setLoading(true);
      clearFeedback();

      await fetchBasicData();

      if (mounted) {
        await fetchFeesData();
      }

      if (mounted) {
        setLoading(false);
      }
    };

    load();

    return () => {
      mounted = false;
    };
  }, [domain, refreshId, fetchBasicData, fetchFeesData]);

  /*
   * ============================
   * PROFILE IMAGE
   * ============================
   */
  const profileImage =
    feesAdmin?.profilePic
      ? `${API_BASE}/${feesAdmin.profilePic}`
      : "/default.png";

  /*
   * ============================
   * SEARCH
   * ============================
   */
  const filteredStudents = useMemo(() => {
    const query = search
      .trim()
      .toLowerCase();

    if (!query) {
      return students;
    }

    return students.filter((item) =>
      [
        item?.name,
        item?.email,
        item?.rollNumber,
        item?.course,
        item?.branch,
        item?.batch,
      ]
        .filter(Boolean)
        .some((value) =>
          String(value)
            .toLowerCase()
            .includes(query)
        )
    );
  }, [students, search]);

  const filteredFaculty = useMemo(() => {
    const query = search
      .trim()
      .toLowerCase();

    if (!query) {
      return faculty;
    }

    return faculty.filter((item) =>
      [
        item?.name,
        item?.email,
        item?.facultyId,
        item?.course,
      ]
        .filter(Boolean)
        .some((value) =>
          String(value)
            .toLowerCase()
            .includes(query)
        )
    );
  }, [faculty, search]);

  /*
   * ============================
   * PROFILE UPDATE
   * ============================
   */
  const openEditProfile = () => {
    clearFeedback();

    setEditForm({
      name: feesAdmin?.name || "",
      mobileNumber:
        feesAdmin?.mobileNumber || "",
    });

    setShowEditModal(true);
  };

  const handleUpdateProfile = async () => {
    clearFeedback();

    if (!editForm.name?.trim()) {
      setActionErr("Name is required.");
      return;
    }

    if (
      editForm.mobileNumber &&
      !/^\d{10}$/.test(
        editForm.mobileNumber.trim()
      )
    ) {
      setActionErr(
        "Mobile number must contain exactly 10 digits."
      );
      return;
    }

    try {
      const response = await fetch(
        `${FEES_ADMIN_BASE}/update_profile`,
        {
          method: "PUT",
          headers: authHeaders(),
          body: JSON.stringify({
            ...feesAdmin,
            ...editForm,
          }),
        }
      );

      const data = await readResponse(response);

      if (!response.ok) {
        throw new Error(
          data?.message ||
            "Failed to update profile."
        );
      }

      setFeesAdmin((previous) => ({
        ...previous,
        ...editForm,
      }));

      setShowEditModal(false);

      setActionMsg(
        "Profile updated successfully."
      );
    } catch (error) {
      setActionErr(
        error?.message ||
          "Profile update failed."
      );
    }
  };

  /*
   * ============================
   * PASSWORD
   * ============================
   */
  const handleChangePassword = async (newPassword) => {
    return fetch(
      `${FEES_ADMIN_BASE}/forgot_update_password`,
      {
        method: "PUT",
        body: JSON.stringify({ newPassword }),
        headers: {
          ...authHeaders(),
          Authorization: `Bearer ${localStorage.getItem(
            "token"
          )}`,
        },
      }
    );
  };

  const handleDeleteAccount = async () => {
    const response = await fetch(
      `${FEES_ADMIN_BASE}/delete_account`,
      {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      }
    );

    const data = await readResponse(response);

    if (!response.ok || data?.success === false) {
      throw new Error(
        data?.message ||
          "Unable to delete account."
      );
    }

    localStorage.clear();

    navigate(`/${domain}/login`);
  };

  /*
   * ============================
   * LOGOUT
   * ============================
   */
  const handleLogout = () => {
    localStorage.clear();

    navigate(`/${domain}/login`);
  };

  /*
   * ============================
   * GENERIC VALUE FORMATTER
   * ============================
   */
  /*
   * ============================
   * ACTIVE CHILD ROUTE
   * ============================
   */
  const isDashboard =
    location.pathname.replace(/\/+$/, "").toLowerCase() ===
    `/${domain}/feesadmin/dashboard`.toLowerCase();

  /*
   * ============================
   * NAVIGATION
   * ============================
   */
  const menu = [
    {
      key: "overview",
      label: "Dashboard",
      icon: "⌂",
      path: `/${domain}/feesAdmin/dashboard`,
    },
    {
      key: "students",
      label: "Students",
      icon: "👥",
      path: `/${domain}/feesAdmin/dashboard/all-students`,
    },
    {
      key: "faculty",
      label: "Faculty",
      icon: "🎓",
      path: `/${domain}/feesAdmin/dashboard/all-faculty`,
    },
    {
      key: "fees",
      label: "Fees",
      icon: "₹",
      path: `/${domain}/feesAdmin/dashboard/fees`,
    },
    {
      key: "notepad",
      label: "Notepad",
      icon: "▤",
      path: `/${domain}/feesAdmin/dashboard/notepad`,
    },
  ];
  useEffect(() => {
    const route = location.pathname.toLowerCase().split("/").pop();
    const section = {
      dashboard: "overview",
      "all-students": "students",
      "all-faculty": "faculty",
      fees: "fees",
      notepad: "notepad",
    }[route];
    if (section) setActiveSection(section);
  }, [location.pathname]);

  return (
    <div className="fees-admin-dashboard">

      {/* ========================================
          LEFT PROFILE SIDEBAR
      ======================================== */}

      <aside className={`fees-admin-sidebar${showSidebar ? "" : " is-collapsed"}`}>

        <div className="fees-admin-sidebar-top">
          <button
            type="button"
            className="fees-admin-menu-button"
            aria-label={showSidebar ? "Hide sidebar" : "Show sidebar"}
            onClick={() => setShowSidebar((visible) => !visible)}
          >
            ☰
          </button>
        </div>

        <div className="fees-admin-profile">

          <div className="fees-admin-avatar-wrapper">
            <img
              src={profileImage}
              alt="Fees Admin"
              className="fees-admin-avatar"
              onError={(event) => {
                event.currentTarget.src =
                  "/default.png";
              }}
            />

            <span className="fees-admin-online">
              ✓
            </span>
          </div>

          <div className="fees-admin-role">
            FEES ADMIN
          </div>

          <h2>
            {feesAdmin?.name ||
              "Fees Admin"}
          </h2>

          <div className="fees-admin-profile-info">

            <ProfileItem
              label="Fees Admin ID"
              value={
                feesAdmin?.feesAdminId
              }
            />

            <ProfileItem
              label="Email"
              value={
                feesAdmin?.email
              }
            />

            <ProfileItem
              label="Mobile"
              value={
                feesAdmin?.mobileNumber
              }
            />

            <ProfileItem
              label="Created"
              value={FormatDate(
                feesAdmin?.createdDateTime
              )}
            />

            <ProfileItem
              label="Last Login"
              value={FormatDate(
                feesAdmin?.lastLoginDateTime
              )}
            />

          </div>
        </div>

        <div className="fees-admin-sidebar-actions">

          <button
            type="button"
            className="fees-admin-sidebar-btn primary"
            onClick={openEditProfile}
          >
            ✎ Edit Profile
          </button>

          <button
            type="button"
            className="fees-admin-sidebar-btn purple"
            onClick={() =>
              setShowChangePasswordModal(true)
            }
          >
            🔑 Change Password
          </button>

          <button
            type="button"
            className="fees-admin-sidebar-btn danger"
            onClick={() =>
              setShowDeleteAccountModal(true)
            }
          >
            Delete Account
          </button>

          <button
            type="button"
            className="fees-admin-sidebar-btn logout"
            onClick={handleLogout}
          >
            Logout
          </button>

        </div>
      </aside>

      {/* ========================================
          MAIN AREA
      ======================================== */}

      <main className="fees-admin-main">

        {/* HEADER */}

        <header className="fees-admin-header">

          <div className="fees-admin-header-title">
            <button
              type="button"
              className="fees-admin-header-menu"
              onClick={() => setShowSidebar((visible) => !visible)}
              aria-label={showSidebar ? "Hide sidebar" : "Show sidebar"}
            >
              ☰
            </button>

            <div className="fees-admin-header-icon">
              FA
            </div>

            <div>
              <div className="fees-admin-eyebrow">
                FEES ADMINISTRATION
              </div>

              <h1>
                Fees Management Console
              </h1>

              <p>
                Manage student fee operations,
                payment methods and university
                records.
              </p>
            </div>

          </div>

          <div className="fees-admin-header-right">
            <button
              type="button"
              className="fees-admin-refresh"
              onClick={() => {
                clearFeedback();
                setRefreshId((value) => value + 1);
              }}
              disabled={loading || feesLoading}
            >
              {loading || feesLoading ? "Refreshing…" : "↻ Refresh"}
            </button>

            <div className="fees-admin-domain">
              DOMAIN
              <strong>
                {domain}
              </strong>
            </div>

            <div className="fees-admin-status">
              <span />
              Protected
            </div>

          </div>

        </header>

        {/* FEEDBACK */}

        {actionMsg && (
          <div className="erp-feedback erp-feedback-success">
            ✓ {actionMsg}
          </div>
        )}

        {actionErr && (
          <div className="erp-feedback erp-feedback-error">
            ! {actionErr}
          </div>
        )}

        {/* ========================================
            NAVIGATION
        ======================================== */}

        <nav className="fees-admin-navigation">

          {menu.map((item) => (
            <button
              key={item.key}
              type="button"
              className={
                activeSection === item.key
                  ? "active"
                  : ""
              }
              onClick={() => {
                setActiveSection(
                  item.key
                );

                if (
                  item.key ===
                  "overview"
                ) {
                  navigate(
                    item.path
                  );
                } else {
                  navigate(
                    item.path
                  );
                }
              }}
            >
              <span>
                {item.icon}
              </span>

              {item.label}
            </button>
          ))}

        </nav>

        {/* ========================================
            DASHBOARD
        ======================================== */}

        {isDashboard ? (
          <>
            <section className="fees-admin-shortcuts" aria-label="Dashboard shortcuts">
              <div className="fees-admin-shortcuts-heading">
                <div>
                  <span className="section-label">QUICK ACCESS</span>
                  <h2>Administration</h2>
                </div>
                <span>Manage your university’s fee operations</span>
              </div>
              <div className="fees-admin-shortcuts-grid">
                {[
                  { key: "students", label: "Students", description: "Browse student records", icon: "👥", path: menu[1].path },
                  { key: "faculty", label: "Faculty", description: "Browse faculty records", icon: "🎓", path: menu[2].path },
                  { key: "fees", label: "Fee accounts", description: "Manage payments and methods", icon: "₹", path: menu[3].path },
                  { key: "notepad", label: "Notepad", description: "Open your work notes", icon: "▤", path: menu[4].path },
                ].map((shortcut) => (
                  <button
                    className="fees-admin-shortcut"
                    key={shortcut.label}
                    type="button"
                    onClick={() => {
                      setActiveSection(shortcut.key);
                      navigate(shortcut.path);
                    }}
                  >
                    <span className="fees-admin-shortcut-icon">{shortcut.icon}</span>
                    <span className="fees-admin-shortcut-copy">
                      <strong>{shortcut.label}</strong>
                      <small>{shortcut.description}</small>
                    </span>
                    <span className="fees-admin-shortcut-arrow" aria-hidden="true">→</span>
                  </button>
                ))}
              </div>
            </section>

            {/* STATISTICS */}

            <section className="fees-admin-stats">

              <StatCard
                icon="👥"
                title="Students"
                value={
                  loading
                    ? "..."
                    : students.length
                }
                subtitle="University students"
              />

              <StatCard
                icon="🎓"
                title="Faculty"
                value={
                  loading
                    ? "..."
                    : faculty.length
                }
                subtitle="Faculty records"
              />

              <StatCard
                icon="₹"
                title="Pending Payments"
                value={
                  feesLoading
                    ? "..."
                    : pendingPayments.length
                }
                subtitle="Awaiting action"
              />

              <StatCard
                icon="▣"
                title="Payment Methods"
                value={
                  feesLoading
                    ? "..."
                    : paymentMethods.length
                }
                subtitle="Configured methods"
              />

            </section>

            {/* PROFILE CARD */}

            <section className="fees-admin-profile-card">

              <div className="fees-admin-profile-card-header">

                <div>
                  <span className="section-label">
                    ACCOUNT PROFILE
                  </span>

                  <h2>
                    Fees Admin Profile
                  </h2>

                  <p>
                    Your account information
                    and administration details.
                  </p>
                </div>

                <button
                  type="button"
                  className="erp-secondary-btn"
                  onClick={
                    openEditProfile
                  }
                >
                  Edit Profile
                </button>

              </div>

              <div className="fees-admin-profile-grid">

                <InfoBox
                  label="Full Name"
                  value={
                    feesAdmin?.name
                  }
                />

                <InfoBox
                  label="Fees Admin ID"
                  value={
                    feesAdmin?.feesAdminId
                  }
                />

                <InfoBox
                  label="Email"
                  value={
                    feesAdmin?.email
                  }
                />

                <InfoBox
                  label="Mobile Number"
                  value={
                    feesAdmin?.mobileNumber
                  }
                />

                <InfoBox
                  label="Created Date"
                  value={FormatDate(
                    feesAdmin?.createdDateTime
                  )}
                />

                <InfoBox
                  label="Last Login"
                  value={FormatDate(
                    feesAdmin?.lastLoginDateTime
                  )}
                />

              </div>

            </section>

            {/* UNIVERSITY RECORDS */}

            <section className="fees-admin-section">

              <div className="fees-admin-section-heading">

                <div>
                  <span className="section-label">
                    UNIVERSITY DATA
                  </span>

                  <h2>
                    University Records
                  </h2>

                  <p>
                    Students and faculty available
                    to your Fees Admin account.
                  </p>
                </div>

                <input
                  type="search"
                  className="fees-admin-search"
                  value={search}
                  onChange={(event) =>
                    setSearch(
                      event.target.value
                    )
                  }
                  placeholder="Search name, email, ID, course..."
                />

              </div>

              <div className="fees-admin-two-columns">

                {/* STUDENTS */}

                <DataCard
                  title="Students"
                  count={
                    filteredStudents.length
                  }
                  columns={[
                    "Name",
                    "Roll No",
                    "Course",
                  ]}
                >
                  {filteredStudents
                    .slice(0, 8)
                    .map(
                      (
                        item,
                        index
                      ) => (
                        <tr
                          key={
                            item?.id ||
                            item?.email ||
                            index
                          }
                        >
                          <td>
                            <strong>
                              {item?.name ||
                                "—"}
                            </strong>
                          </td>

                          <td>
                            {item?.rollNumber ||
                              "—"}
                          </td>

                          <td>
                            {item?.course ||
                              "—"}
                          </td>
                        </tr>
                      )
                    )}

                  {filteredStudents.length ===
                    0 && (
                    <EmptyRow
                      colSpan={3}
                      text="No students found."
                    />
                  )}
                </DataCard>

                {/* FACULTY */}

                <DataCard
                  title="Faculty"
                  count={
                    filteredFaculty.length
                  }
                  columns={[
                    "Name",
                    "Faculty ID",
                    "Course",
                  ]}
                >
                  {filteredFaculty
                    .slice(0, 8)
                    .map(
                      (
                        item,
                        index
                      ) => (
                        <tr
                          key={
                            item?.id ||
                            item?.email ||
                            index
                          }
                        >
                          <td>
                            <strong>
                              {item?.name ||
                                "—"}
                            </strong>
                          </td>

                          <td>
                            {item?.facultyId ||
                              "—"}
                          </td>

                          <td>
                            {item?.course ||
                              "—"}
                          </td>
                        </tr>
                      )
                    )}

                  {filteredFaculty.length ===
                    0 && (
                    <EmptyRow
                      colSpan={3}
                      text="No faculty found."
                    />
                  )}
                </DataCard>

              </div>

            </section>

            {/* ========================================
                FEES MANAGEMENT
            ======================================== */}

            <section className="fees-admin-section">

              <div className="fees-admin-section-heading">

                <div>
                  <span className="section-label">
                    FEES ACCOUNT
                  </span>

                  <h2>
                    Fee Management
                  </h2>

                  <p>
                    Live information from the
                    Fees Admin Account APIs.
                  </p>
                </div>

              </div>

              <div className="fees-admin-fee-grid">

                {/* COURSE WISE */}

                <div className="fees-admin-panel">

                  <div className="panel-title">
                    <div>
                      <h3>
                        Course-wise Fees
                      </h3>

                      <span>
                        {courseWiseFees.length} records
                      </span>
                    </div>
                  </div>

                  <div className="dynamic-record-list">

                    {courseWiseFees.length ===
                      0 ? (
                      <div className="empty-panel">
                        No course-wise fee
                        records available.
                      </div>
                    ) : (
                      courseWiseFees
                        .slice(0, 8)
                        .map(
                          (
                            item,
                            index
                          ) => (
                            <DynamicRecord
                              key={
                                item?.id ||
                                index
                              }
                              data={item}
                            />
                          )
                        )
                    )}

                  </div>

                </div>

                {/* PAYMENT METHODS */}

                <div className="fees-admin-panel">

                  <div className="panel-title">

                    <div>
                      <h3>
                        Payment Methods
                      </h3>

                      <span>
                        {paymentMethods.length} configured
                      </span>
                    </div>

                  </div>

                  <div className="dynamic-record-list">

                    {paymentMethods.length ===
                      0 ? (
                      <div className="empty-panel">
                        No payment methods
                        configured.
                      </div>
                    ) : (
                      paymentMethods
                        .slice(0, 8)
                        .map(
                          (
                            item,
                            index
                          ) => (
                            <DynamicRecord
                              key={
                                item?.id ||
                                index
                              }
                              data={item}
                            />
                          )
                        )
                    )}

                  </div>

                </div>

                {/* PENDING */}

                <div className="fees-admin-panel fees-admin-panel-wide">

                  <div className="panel-title">

                    <div>
                      <h3>
                        Pending Payments
                      </h3>

                      <span>
                        {pendingPayments.length} pending
                      </span>
                    </div>

                  </div>

                  <div className="dynamic-record-list">

                    {pendingPayments.length ===
                      0 ? (
                      <div className="empty-panel">
                        No pending payments.
                      </div>
                    ) : (
                      pendingPayments
                        .slice(0, 10)
                        .map(
                          (
                            item,
                            index
                          ) => (
                            <DynamicRecord
                              key={
                                item?.id ||
                                index
                              }
                              data={item}
                            />
                          )
                        )
                    )}

                  </div>

                </div>

              </div>

            </section>

          </>
        ) : (
          <Outlet />
        )}

      </main>

      {/* ========================================
          EDIT PROFILE MODAL
      ======================================== */}

      {showEditModal && (
        <div
          className="erp-modal-overlay"
          onMouseDown={(event) => {
            if (
              event.target ===
              event.currentTarget
            ) {
              setShowEditModal(false);
            }
          }}
        >

          <div className="erp-modal">

            <div className="erp-modal-header">

              <h3>
                Edit Fees Admin Profile
              </h3>

              <button
                type="button"
                className="erp-modal-close"
                onClick={() =>
                  setShowEditModal(false)
                }
              >
                ×
              </button>

            </div>

            <div className="erp-modal-body">

              <div className="erp-field">

                <label>
                  Full Name
                </label>

                <input
                  type="text"
                  value={
                    editForm?.name || ""
                  }
                  onChange={(event) =>
                    setEditForm(
                      (previous) => ({
                        ...previous,
                        name:
                          event.target
                            .value,
                      })
                    )
                  }
                />

              </div>

              <div className="erp-field">

                <label>
                  Mobile Number
                </label>

                <input
                  type="text"
                  inputMode="numeric"
                  maxLength={10}
                  value={
                    editForm?.mobileNumber ||
                    ""
                  }
                  onChange={(event) =>
                    setEditForm(
                      (previous) => ({
                        ...previous,
                        mobileNumber:
                          event.target.value
                            .replace(
                              /\D/g,
                              ""
                            )
                            .slice(
                              0,
                              10
                            ),
                      })
                    )
                  }
                />

              </div>

              <div className="fees-admin-readonly-note">
                Email and Fees Admin ID
                are managed by the
                account system.
              </div>

              <div className="fees-admin-modal-actions">

                <button
                  type="button"
                  className="erp-secondary-btn"
                  onClick={() =>
                    setShowEditModal(false)
                  }
                >
                  Cancel
                </button>

                <button
                  type="button"
                  className="erp-primary-btn"
                  onClick={
                    handleUpdateProfile
                  }
                >
                  Save Changes
                </button>

              </div>

            </div>

          </div>

        </div>
      )}

      {/* PASSWORD */}

      {showChangePasswordModal && (
        <ChangePasswordModal
          email={feesAdmin?.email}
          onChangePassword={
            handleChangePassword
          }
          onClose={() =>
            setShowChangePasswordModal(
              false
            )
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

      {/* DELETE */}

      {showDeleteAccountModal && (
        <DeleteAccountModal
          name={feesAdmin?.name}
          email={feesAdmin?.email}
          onDeleteAccount={
            handleDeleteAccount
          }
          onClose={() =>
            setShowDeleteAccountModal(
              false
            )
          }
        />
      )}

    </div>
  );
}


/* =========================================================
   SMALL COMPONENTS
========================================================= */

function ProfileItem({ label, value }) {
  return (
    <div className="fees-admin-profile-item">

      <span>
        {label}
      </span>

      <strong>
        {value || "—"}
      </strong>

    </div>
  );
}


function StatCard({
  icon,
  title,
  value,
  subtitle,
}) {
  return (
    <div className="fees-admin-stat-card">

      <div className="fees-admin-stat-icon">
        {icon}
      </div>

      <div>
        <span>
          {title}
        </span>

        <strong>
          {value}
        </strong>

        <small>
          {subtitle}
        </small>
      </div>

    </div>
  );
}


function InfoBox({ label, value }) {
  return (
    <div className="fees-admin-info-box">

      <span>
        {label}
      </span>

      <strong>
        {value || "—"}
      </strong>

    </div>
  );
}


function DataCard({
  title,
  count,
  columns,
  children,
}) {
  return (
    <div className="fees-admin-data-card">

      <div className="data-card-header">

        <div>
          <h3>
            {title}
          </h3>

          <span>
            {count} records
          </span>
        </div>

        <span className="record-count">
          {count}
        </span>

      </div>

      <div className="fees-admin-table-wrap">

        <table className="fees-admin-table">

          <thead>
            <tr>
              {columns.map(
                (column) => (
                  <th key={column}>
                    {column}
                  </th>
                )
              )}
            </tr>
          </thead>

          <tbody>
            {children}
          </tbody>

        </table>

      </div>

    </div>
  );
}


function EmptyRow({
  colSpan,
  text,
}) {
  return (
    <tr>
      <td colSpan={colSpan}>
        <div className="empty-table">
          {text}
        </div>
      </td>
    </tr>
  );
}


/*
 * Because the exact DTO fields were not supplied,
 * this safely displays whatever the backend returns
 * without inventing field names.
 */
function DynamicRecord({ data }) {
  if (!data || typeof data !== "object") {
    return null;
  }

  const entries = Object.entries(data)
    .filter(
      ([, value]) =>
        value !== null &&
        value !== undefined &&
        value !== ""
    )
    .slice(0, 5);

  return (
    <div className="dynamic-record">

      {entries.map(
        ([key, value]) => (
          <div
            className="dynamic-record-field"
            key={key}
          >

            <span>
              {key
                .replace(
                  /([A-Z])/g,
                  " $1"
                )
                .replace(
                  /^./,
                  (char) =>
                    char.toUpperCase()
                )}
            </span>

            <strong>
              {typeof value ===
              "object"
                ? JSON.stringify(
                    value
                  )
                : String(value)}
            </strong>

          </div>
        )
      )}

    </div>
  );
}
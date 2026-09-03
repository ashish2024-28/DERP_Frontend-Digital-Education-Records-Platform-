import { useEffect, useRef, useState } from "react";

import { Outlet, useLocation, useNavigate, useParams, Link, } from "react-router-dom";

import { Eye, EyeOff, Building2, RefreshCw, Users, GraduationCap, UserCog, WalletCards, ShieldCheck, KeyRound, Pencil, Trash2, Upload, LogOut, X, LayoutDashboard, ClipboardCheck, FileText, StickyNote, } from "lucide-react";

import "../Common/css/common.css";
import "./DomainAdminDashboard.css";

import FormatDate from "../../Components/DateTimeFunction/FormatDate";
import ChangePasswordModal from "../../Components/Auth/ChangePasswordModal";

import ERPLayout from "../../Components/ERP/ERPLayout";
import StatCard from "../../Components/ERP/StatCard";

// ─────────────────────────────────────────────
// Reusable Modal
// ─────────────────────────────────────────────
function Modal({ title, onClose, children }) {
  return (
    <div className="domain-admin-modal-overlay" style={modalStyles.overlay}>
      <div className="domain-admin-modal-box" style={modalStyles.box}>
        <div style={modalStyles.header}>
          <h3 style={{ margin: 0 }} className="">  {title}</h3>

          <button type="button" onClick={onClose} style={modalStyles.closeBtn} aria-label="Close modal" > ✕ </button>
        </div>

        <div style={modalStyles.body}>  {children}  </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
// Styles
// ─────────────────────────────────────────────
const modalStyles = {
  overlay: { position: "fixed", inset: 0, background: "rgba(0,0,0,0.55)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000, padding: 16, },
  box: { background: "#fff", borderRadius: 12, width: "min(520px, 95vw)", maxHeight: "90vh", overflowY: "auto", boxShadow: "0 8px 32px rgba(0,0,0,.25)", },
  header: { display: "flex", justifyContent: "space-between", alignItems: "center", padding: "16px 20px", borderBottom: "1px solid #cf2e2e", },
  body: { padding: "20px", },
  closeBtn: { background: "none", border: "none", fontSize: 18, cursor: "pointer", color: "#6b7280", },
};

const fieldStyle = { width: "100%", padding: "8px 10px", marginBottom: 10, borderRadius: 6, border: "1px solid #d1d5db", fontSize: 14, boxSizing: "border-box", };

const labelStyle = { fontSize: 12, color: "#374151", fontWeight: 600, display: "block", marginBottom: 3, };

const submitBtnStyle = { width: "100%", padding: "10px", borderRadius: 6, border: "none", background: "#2563eb", color: "#fff", fontWeight: 700, fontSize: 15, cursor: "pointer", marginTop: 4, };

const dangerBtnStyle = {
  ...submitBtnStyle,
  background: "#dc2626",
};


// ─────────────────────────────────────────────
// Domain Admin Dashboard
// ─────────────────────────────────────────────
export default function DomainAdminDashboard() {

  const API_BASE =
    import.meta.env.VITE_API_BASE_URL?.replace(/\/+$/, "");

  const { domain } = useParams();
  const navigate = useNavigate();
  const location = useLocation();

  // =========================================================
  // ERP USER

  const user = {
    name:
      localStorage.getItem("name") ||
      "Domain Administrator",
  };

  // =========================================================
  // ERP NAVIGATION

  const menu = [
    {
      label: "Dashboard",
      icon: "dashboard",
      path: `/${domain}/domainAdmin/dashboard`,
      end: true,
    },

    {
      label: "Students",
      icon: "students",
      path: `/${domain}/domainAdmin/dashboard/all-students`,
    },

    {
      label: "Faculty",
      icon: "faculty",
      path: `/${domain}/domainAdmin/dashboard/all-faculty`,
    },

    {
      label: "Sub Admins",
      icon: "faculty",
      path: `/${domain}/domainAdmin/dashboard/all-subAdmin`,
    },

    {
      label: "Fees Admin",
      icon: "students",
      path: `/${domain}/domainAdmin/dashboard/all-feesAdmin`,
    },

    {
      label: "Attendance",
      icon: "attendance",
      path: `/${domain}/domainAdmin/dashboard/attendance`,
    },

    {
      label: "Reports",
      icon: "reports",
      path: `/${domain}/domainAdmin/dashboard/reports`,
    },

    {
      label: "Notepad",
      icon: "reports",
      path: `/${domain}/domainAdmin/dashboard/notepad`,
    },
  ];

  const isDashboard =
    location.pathname ===
    `/${domain}/domainAdmin/dashboard`;

  // ─────────────────────────────────────────────
  // Profile state
  // ─────────────────────────────────────────────
  const [admin, setAdmin] = useState({});
  const [university, setUniversity] = useState({});

  // ─────────────────────────────────────────────
  // Dashboard counts
  // ─────────────────────────────────────────────
  const [totalStudent, setTotalStudent] = useState(0);
  const [totalFaculty, setTotalFaculty] = useState(0);
  const [totalSubAdmin, setTotalSubAdmin] = useState(0);
  const [totalFeesAdmin, setTotalFeesAdmin] = useState(0);

  // ─────────────────────────────────────────────
  // Table data
  // ─────────────────────────────────────────────
  const [students, setStudents] = useState([]);
  const [faculty, setFaculty] = useState([]);
  const [subAdmins, setSubAdmins] = useState([]);
  const [feesAdmins, setFeesAdmins] = useState([]);

  // ─────────────────────────────────────────────
  // UI state
  // ─────────────────────────────────────────────
  const [activeTab, setActiveTab] = useState("student");
  const [searchQuery, setSearchQuery] = useState("");
  const [showSidebar, setShowSidebar] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);


  // ─────────────────────────────────────────────
  // Modal state
  // ─────────────────────────────────────────────

  const [showUniversityLogo, setShowUniversityLogo] = useState(false);

  // Added: Domain Admin profile picture modal
  const [showProfilePicModal, setShowProfilePicModal] = useState(false);

  const [showAddModal, setShowAddModal] = useState(false);

  const [showEditModal, setShowEditModal] = useState(false);

  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const [showUploadModal, setShowUploadModal] = useState(false);

  const [
    showChangePasswordModal,
    setShowChangePasswordModal,
  ] = useState(false);

  const [selectedItem, setSelectedItem] = useState(null);

  // Added: Domain Admin profile editor
  const [showAdminProfileModal, setShowAdminProfileModal] = useState(false);
  const [adminProfileForm, setAdminProfileForm] = useState({});

  // Added: password modal for SubAdmin and FeesAdmin.
  // The current backend supports target-email password updates for these two roles.
  const [showUserPasswordModal, setShowUserPasswordModal] =
    useState(false);
  const [userPassword, setUserPassword] =
    useState("");
  const [userPasswordConfirm, setUserPasswordConfirm] =
    useState("");

  // ─────────────────────────────────────────────
  // File state
  // ─────────────────────────────────────────────

  const [profilePicFile, setProfilePicFile] = useState(null);

  const [profilePicPreview, setProfilePicPreview] = useState(null);

  const [universityLogo, setUniversityLogo] = useState(null);

  const [universityLogoPreview, setUniversityLogoPreview] = useState(null);

  const [uploadFiles, setUploadFiles] = useState([]);

  const [logoUploading, setLogoUploading] = useState(false);

  const [uploading, setUploading] = useState(false);

  const uploadInputRef = useRef(null);

  // ─────────────────────────────────────────────
  // Forms
  // ─────────────────────────────────────────────
  const [addForm, setAddForm] = useState({});
  const [editForm, setEditForm] = useState({});

  // ─────────────────────────────────────────────
  // Feedback
  // ─────────────────────────────────────────────
  const [actionMsg, setActionMsg] = useState("");
  const [actionErr, setActionErr] = useState("");

  const clearFeedback = () => {
    setActionMsg("");
    setActionErr("");
  };

  // ─────────────────────────────────────────────
  // Authentication headers
  // ─────────────────────────────────────────────
  const authHeaders = () => {
    const token = localStorage.getItem("token");

    return {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    };
  };

  // ─────────────────────────────────────────────
  // Domain Admin API registry
  // ─────────────────────────────────────────────
  // GET:  /{domain}/domainAdmin
  // GET:  /{domain}/domainAdmin/get_dashboard
  // GET:  /{domain}/domainAdmin/all_student
  // GET:  /{domain}/domainAdmin/all_faculty
  // GET:  /{domain}/domainAdmin/all_subAdmin
  // GET:  /{domain}/domainAdmin/all_feesAdmin
  // POST: /{domain}/domainAdmin/add_student
  // POST: /{domain}/domainAdmin/add_faculty
  // POST: /{domain}/domainAdmin/add_subAdmin
  // POST: /{domain}/domainAdmin/add_feesAdmin
  // PUT:  /{domain}/domainAdmin/update_profile
  // PUT:  /{domain}/domainAdmin/update_profile_pic
  // PUT:  /{domain}/domainAdmin/update_university_logo
  // PUT:  /{domain}/domainAdmin/forgot_update_password
  // PUT:  /{domain}/domainAdmin/update_student_profile
  // PUT:  /{domain}/domainAdmin/update_student_password
  // PUT:  /{domain}/domainAdmin/update_faculty_profile
  // PUT:  /{domain}/domainAdmin/update_faculty_password
  // PUT:  /{domain}/domainAdmin/update_subAdmin
  // PUT:  /{domain}/domainAdmin/update_subAdmin_password
  // PUT:  /{domain}/domainAdmin/update_feesAdmin
  // PUT:  /{domain}/domainAdmin/update_feesAdmin_password
  // DELETE:/{domain}/domainAdmin/delete_student
  // DELETE:/{domain}/domainAdmin/delete_faculty
  // DELETE:/{domain}/domainAdmin/delete_subAdmin
  // DELETE:/{domain}/domainAdmin/delete_feesAdmin
  // POST: /{domain}/domainAdmin/upload_students
  // POST: /{domain}/domainAdmin/upload_faculty
  // POST: /{domain}/domainAdmin/upload_subAdmin
  // POST: /{domain}/domainAdmin/upload_feesAdmin

  // ─────────────────────────────────────────────
  // API helper

  const readJsonResponse = async (response) => {
    const contentType =
      response.headers.get("content-type") || "";

    if (contentType.includes("application/json")) {
      return await response.json();
    }

    const text = await response.text();

    return text ? { message: text } : {};
  };

  // ─────────────────────────────────────────────
  // Fetch all dashboard data

  const fetchAllData = async () => {
    if (!API_BASE || !domain) {
      setActionErr(
        "API configuration or domain is missing."
      );
      return;
    }

    const token = localStorage.getItem("token");

    if (!token) {
      // navigate(`/${domain}/login`, { replace: true, });
      return;
    }

    setLoading(true);
    clearFeedback();


    try {
      const headers = authHeaders();

      const [adminRes, dashRes, studentRes, facultyRes, subRes, feesRes,] = await Promise.all([
        fetch(
          `${API_BASE}/${domain}/domainAdmin`,
          { headers }
        ),

        fetch(
          `${API_BASE}/${domain}/domainAdmin/get_dashboard`,
          { headers }
        ),

        fetch(
          `${API_BASE}/${domain}/domainAdmin/all_student`,
          { headers }
        ),

        fetch(
          `${API_BASE}/${domain}/domainAdmin/all_faculty`,
          { headers }
        ),

        fetch(
          `${API_BASE}/${domain}/domainAdmin/all_subAdmin`,
          { headers }
        ),

        fetch(
          `${API_BASE}/${domain}/domainAdmin/all_feesAdmin`,
          { headers }
        ),
      ]);

      // ─────────────────────────────────────────
      // Handle unauthorized
      // ─────────────────────────────────────────
      if (
        adminRes.status === 401 ||
        adminRes.status === 403
      ) {
        localStorage.clear();

        // navigate(`/${domain}/login`, { replace: true,});

        return;
      }

      // ─────────────────────────────────────────
      // Parse responses

      const adminData = await readJsonResponse(adminRes);

      const dashData = await readJsonResponse(dashRes);

      const studentData = await readJsonResponse(studentRes);

      const facultyData = await readJsonResponse(facultyRes);

      const subData = await readJsonResponse(subRes);

      const feesData = await readJsonResponse(feesRes);

      // ─────────────────────────────────────────
      // Check important API errors

      if (!adminRes.ok) {
        throw new Error(
          adminData?.message ||
          `Domain Admin API failed: ${adminRes.status}`
        );
      }

      if (!dashRes.ok) {
        throw new Error(
          dashData?.message ||
          `Dashboard API failed: ${dashRes.status}`
        );
      }

      // ─────────────────────────────────────────
      // IMPORTANT: Backend response: data: {   universityResponseDTO: {...},   domainAdminResponseDTO: {...} }

      const profileData = adminData?.data || {};

      setAdmin(profileData?.domainAdminResponseDTO || {});

      setUniversity(profileData?.universityResponseDTO || {});

      // ─────────────────────────────────────────
      // Dashboard counts

      const dashboard = dashData?.data || {};

      setTotalStudent(Number(dashboard?.students || 0));

      setTotalFaculty(Number(dashboard?.faculty || 0));

      setTotalSubAdmin(Number(dashboard?.subAdmin || 0));

      setTotalFeesAdmin(Number(dashboard?.feesAdmin || 0));

      // ─────────────────────────────────────────
      // Extract table arrays

      const extractArray = (response) => {
        if (Array.isArray(response)) { return response; }

        if (Array.isArray(response?.data)) { return response.data; }

        return [];
      };

      setStudents(extractArray(studentData));

      setFaculty(extractArray(facultyData));

      setSubAdmins(extractArray(subData));

      setFeesAdmins(extractArray(feesData));

    } catch (error) {
      console.error("Domain Admin Dashboard loading error:", error);

      setActionErr(error?.message || "Failed to load dashboard data.");

      // Only redirect for authentication errors.
      if (error?.message?.toLowerCase().includes("unauthorized") || error?.message?.toLowerCase().includes("forbidden")) {
        localStorage.clear();

        // navigate(`/${domain}/login`, { replace: true, });
      }
    } finally {
      setLoading(false);
    }
  };

  // ─────────────────────────────────────────────
  // Initial load
  useEffect(() => {
    fetchAllData();

  }, [domain]);

  // ─────────────────────────────────────────────
  // Cleanup object URLs

  useEffect(() => {
    return () => { if (profilePicPreview) { URL.revokeObjectURL(profilePicPreview); } };
  }, [profilePicPreview]);

  useEffect(() => {
    return () => { if (universityLogoPreview) { URL.revokeObjectURL(universityLogoPreview); } };
  }, [universityLogoPreview]);

  // ─────────────────────────────────────────────
  // Logout
  const handleLogout = () => {
    localStorage.clear();

    navigate(`/${domain}/login`, { replace: true, });
  };

  // ─────────────────────────────────────────────
  // Table data
  const currentData = activeTab === "student" ? students : activeTab === "faculty" ? faculty : activeTab === "subadmin" ? subAdmins : feesAdmins;

  const normalizedSearch = searchQuery.trim().toLowerCase();

  const filteredData =
    currentData.filter((item) => {
      if (!normalizedSearch) { return true; }

      return [item?.name, item?.rollNumber, item?.course, item?.branch, item?.batch, item?.studyBatch, item?.email, item?.mobileNumber, item?.facultyId, item?.subAdminId, item?.feesAdminId,
      ].some((value) =>
        String(value || "")
          .toLowerCase()
          .includes(normalizedSearch)
      );
    });

  const isParentRoute = location.pathname.endsWith("/dashboard");

  const activeTabLabel = activeTab === "student" ? "Student" : activeTab === "faculty" ? "Faculty" : activeTab === "subadmin" ? "SubAdmin" : "FeesAdmin";

  // ─────────────────────────────────────────────
  // Domain Admin profile picture
  const handleProfilePicChange = (e) => {
    const file = e.target.files?.[0];

    if (!file) {
      setProfilePicFile(null); setProfilePicPreview(null);
      return;
    }

    if (!file.type.startsWith("image/")) {
      setActionErr("Only image files are allowed.");
      return;
    }

    if (file.size > 2 * 1024 * 1024) {
      setActionErr("Profile picture must be less than 2MB.");
      return;
    }

    clearFeedback();
    setProfilePicFile(file);
    setProfilePicPreview(URL.createObjectURL(file));
  };

  const handleUpdateProfilePic = async () => {
    clearFeedback();

    if (!profilePicFile) {
      setActionErr("Please select a profile picture first.");
      return;
    }

    try {
      const formData = new FormData();
      formData.append("profilePic", profilePicFile);

      const res = await fetch(
        `${API_BASE}/${domain}/domainAdmin/update_profile_pic`,
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
          body: formData,
        }
      );

      const data = await readJsonResponse(res);

      if (!res.ok || data?.success === false) {
        throw new Error(
          data?.message || "Failed to update profile picture."
        );
      }

      setActionMsg("Profile picture updated successfully!");
      setShowProfilePicModal(false);
      setProfilePicFile(null);
      setProfilePicPreview(null);
      await fetchAllData();
    } catch (error) {
      console.error("Profile picture update error:", error);
      setActionErr(
        error?.message || "Failed to update profile picture."
      );
    }
  };

  // ─────────────────────────────────────────────
  // University logo file selection
  const handleUniversityLogoChange = (e) => {
    const file = e.target.files?.[0];

    if (!file) {
      setUniversityLogo(null);
      setUniversityLogoPreview(null);
      return;
    }

    if (!file.type.startsWith("image/")) {
      setActionErr(
        "Only image files are allowed."
      );
      return;
    }

    if (file.size > 2 * 1024 * 1024) {
      setActionErr(
        "University logo must be less than 2MB."
      );
      return;
    }

    clearFeedback();

    setUniversityLogo(file);

    setUniversityLogoPreview(
      URL.createObjectURL(file)
    );
  };

  // ─────────────────────────────────────────────
  // University logo update
  const handleUpdateLogo = async () => {
    clearFeedback();

    if (!universityLogo) {
      setActionErr(
        "Please select a university logo first."
      );
      return;
    }

    try {
      setLogoUploading(true);

      const formData = new FormData();

      /*
       * Backend expects: @RequestParam("profilePic") MultipartFile profilePic Therefore keep this exact field name unless your backend controller changes it.
       */
      formData.append("profilePic", universityLogo);

      const res = await fetch(
        `${API_BASE}/${domain}/domainAdmin/update_university_logo`,
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${localStorage.getItem(
              "token"
            )}`,
          },
          body: formData,
        }
      );

      const data =
        await readJsonResponse(res);

      if (!res.ok || data?.success === false) {
        throw new Error(
          data?.message ||
          "Failed to update university logo."
        );
      }

      setActionMsg(
        "University logo updated successfully!"
      );

      setShowUniversityLogo(false);
      setUniversityLogo(null);
      setUniversityLogoPreview(null);

      // Reload universityResponseDTO.
      await fetchAllData();

    } catch (error) {
      console.error(
        "University logo update error:",
        error
      );

      setActionErr(
        error?.message ||
        "Failed to update university logo."
      );
    } finally {
      setLogoUploading(false);
    }
  };

  // ─────────────────────────────────────────────
  // Domain Admin profile update // Backend: PUT /{domain}/domainAdmin/update_profile
  const openAdminProfileModal = () => {
    setAdminProfileForm({ ...admin });
    clearFeedback();
    setShowAdminProfileModal(true);
  };

  const handleAdminProfileUpdate = async () => {
    clearFeedback();

    if (!adminProfileForm?.email) {
      setActionErr("Admin email is missing.");
      return;
    }

    try {
      const res = await fetch(
        `${API_BASE}/${domain}/domainAdmin/update_profile`,
        {
          method: "PUT",
          headers: authHeaders(),
          body: JSON.stringify(adminProfileForm),
        }
      );

      const data = await readJsonResponse(res);

      if (!res.ok) {
        throw new Error(
          data?.message || "Failed to update Domain Admin profile."
        );
      }

      setActionMsg(
        data?.message || "Domain Admin profile updated successfully!"
      );
      setShowAdminProfileModal(false);
      await fetchAllData();
    } catch (error) {
      console.error("Admin profile update error:", error);
      setActionErr(
        error?.message || "Failed to update Domain Admin profile."
      );
    }
  };

  // ─────────────────────────────────────────────
  // Change password
  // ─────────────────────────────────────────────
  const handleChangePassword = async (
    newPassword
  ) => {
    return fetch(
      `${API_BASE}/${domain}/domainAdmin/forgot_update_password?newPassword=${encodeURIComponent(
        newPassword
      )}`,
      {
        method: "PUT",
        headers: authHeaders(),
      }
    );
  };


  // Convert teaching assignment text into backend format.
  //
  // Input:
  // 1A:JAVA,C,DSA;2A:AI,ML,OS;3A:MATH
  //
  // Output:
  // {
  //   "1A": ["JAVA", "C", "DSA"],
  //   "2A": ["AI", "ML", "OS"],
  //   "3A": ["MATH"]
  // }

  const parseTeachingAssignments = (value) => {
    if (!value || typeof value !== "string") {
      return {};
    }

    const assignments = {};

    value
      .split(";")
      .map((entry) => entry.trim())
      .filter(Boolean)
      .forEach((entry) => {

        const [batch, subjectsText] =
          entry.split(/:(.*)/s).filter(
            (value) => value !== undefined
          );

        if (!batch || !subjectsText) {
          return;
        }

        const normalizedBatch =
          batch.trim().toUpperCase();

        const subjects =
          subjectsText
            .split(",")
            .map((subject) => subject.trim())
            .filter(Boolean)
            .map((subject) => subject.toUpperCase());

        if (subjects.length > 0) {
          assignments[normalizedBatch] = [
            ...(assignments[normalizedBatch] || []),
            ...subjects,
          ].filter(
            (subject, index, array) =>
              array.indexOf(subject) === index
          );
        }
      });

    return assignments;
  };


  // ────────────────── Add ( Student, Faculty , SubAdmin , FeesAdmin) ───────────────────────────
  const handleAdd = async () => {
    clearFeedback();

    const endpointMap = { student: "add_student", faculty: "add_faculty", subadmin: "add_subAdmin", feesAdmin: "add_feesAdmin", };

    const endpoint = endpointMap[activeTab];

    if (!endpoint) {
      setActionErr("Invalid user type selected.");
      return;
    }

    try {

      // Create a new object. // Do NOT modify addForm directly.
      const payload = { ...addForm, };

      // Student studySubjects // Convert: // "python,java,dsa" // // Into: // ["PYTHON", "JAVA", "DSA"] 

      if (activeTab === "student") {

        if (typeof payload.studySubjects === "string") {

          payload.studySubjects = payload.studySubjects
            .split(",")
            .map((subject) => subject.trim())
            .filter(Boolean)
            .map((subject) => subject.toUpperCase());
        }

        // If empty/null, send [] 
        if (!payload.studySubjects) {
          payload.studySubjects = [];
        }
      }


      // FACULTY // 
      if (activeTab === "faculty") {

        if (typeof payload.teachingAssignments === "string") {
          payload.teachingAssignments = parseTeachingAssignments(
            payload.teachingAssignments);
        }

        if (!payload.teachingAssignments) {
          payload.teachingAssignments = {};
        }
      }

      // SUB ADMIN 

      if (activeTab === "subadmin") {

        if (typeof payload.teachingAssignments === "string") {
          payload.teachingAssignments = parseTeachingAssignments(
            payload.teachingAssignments);
        }
        if (!payload.teachingAssignments) {
          payload.teachingAssignments = {};
        }
      }

      // DEBUG 
      alert("FINAL PAYLOAD:", payload);
      alert("FINAL JSON:", JSON.stringify(payload, null, 2));


      // API REQUEST 
      const res = await fetch(
        `${API_BASE}/${domain}/domainAdmin/${endpoint}`,
        {
          method: "POST",
          headers: {
            ...authHeaders(), "Content-Type": "application/json",
          },
          // IMPORTANT: // Send payload, NOT addForm 
          body: JSON.stringify(payload),
        }
      );

      const data =
        await readJsonResponse(res);

      if (!res.ok) {
        throw new Error(
          data?.message ||
          "Failed to add user."
        );
      }

      setActionMsg(data?.message || `${activeTabLabel} added successfully!`);

      setShowAddModal(false);
      setAddForm({});

      await fetchAllData();

    } catch (error) {
      console.error(
        "Add error:",
        error
      );

      setActionErr(error?.message || "Failed to add user.");
    }
  };

  // ─────────────────────────────────────────────
  // Edit
  const openEditModal = (item) => { setSelectedItem(item); setEditForm({ ...item }); clearFeedback(); setShowEditModal(true); };

  const handleEdit = async () => {
    clearFeedback();

    const endpointMap = { student: "update_student_profile", faculty: "update_faculty_profile", subadmin: "update_subAdmin", feesAdmin: "update_feesAdmin", };

    const endpoint = endpointMap[activeTab];

    if (!endpoint) { setActionErr("Invalid user type selected."); return; }

    try {
      const res = await fetch(
        `${API_BASE}/${domain}/domainAdmin/${endpoint}`,
        {
          method: "PUT",
          headers: authHeaders(),
          body: JSON.stringify(editForm),
        }
      );

      const data = await readJsonResponse(res);

      if (!res.ok) {
        throw new Error(data?.message || "Update failed.");
      }

      setActionMsg(data?.message || "Updated successfully!");

      setShowEditModal(false);
      setSelectedItem(null);
      setEditForm({});

      await fetchAllData();

    } catch (error) {
      console.error("Edit error:", error);

      setActionErr(error?.message || "Update failed.");
    }
  };

  // ─────────────────────────────────────────────
  // User password update // Backend exposes email + newpass for Student, Faculty, SubAdmin and FeesAdmin.
  const openUserPasswordModal = (item) => {
    if (!item?.email) { setActionErr("Selected user email is missing."); return; }

    setSelectedItem(item);
    setUserPassword("");
    setUserPasswordConfirm("");
    clearFeedback();
    setShowUserPasswordModal(true);
  };

  const handleUserPasswordChange = async () => {
    clearFeedback();

    if (!selectedItem?.email) {
      setActionErr("Selected user email is missing.");
      return;
    }

    if (!userPassword || userPassword.length < 6) {
      setActionErr("Password must contain at least 6 characters.");
      return;
    }

    if (userPassword !== userPasswordConfirm) {
      setActionErr("Passwords do not match.");
      return;
    }

    const endpointMap = {
      student: "update_student_password",
      faculty: "update_faculty_password",
      subadmin: "update_subAdmin_password",
      feesAdmin: "update_feesAdmin_password",
    };

    const endpoint = endpointMap[activeTab];

    try {
      const query =
        `?email=${encodeURIComponent(selectedItem.email)}` +
        `&newpass=${encodeURIComponent(userPassword)}`;

      const res = await fetch(
        `${API_BASE}/${domain}/domainAdmin/${endpoint}${query}`,
        {
          method: "PUT",
          headers: authHeaders(),
        }
      );

      const data = await readJsonResponse(res);

      if (!res.ok) {
        throw new Error(
          data?.message ||
          (typeof data === "string" ? data : "Password update failed.")
        );
      }

      setActionMsg(
        "Password updated successfully!"
      );
      setShowUserPasswordModal(false);
      setSelectedItem(null);
      setUserPassword("");
      setUserPasswordConfirm("");
    } catch (error) {
      console.error("User password update error:", error);
      setActionErr(
        error?.message ||
        "Password update failed."
      );
    }
  };

  // ─────────────────────────────────────────────
  // Delete
  // ─────────────────────────────────────────────
  const openDeleteModal = (item) => {
    setSelectedItem(item);
    clearFeedback();
    setShowDeleteModal(true);
  };

  const handleDelete = async () => {
    clearFeedback();

    if (!selectedItem?.email) {
      setActionErr(
        "Selected user email is missing."
      );
      return;
    }

    const endpointMap = {
      student: `delete_student?email=${encodeURIComponent(selectedItem.email)}`,

      faculty: `delete_faculty?email=${encodeURIComponent(selectedItem.email)}`,

      subadmin: `delete_subAdmin?email=${encodeURIComponent(selectedItem.email)}`,

      feesAdmin: `delete_feesAdmin?email=${encodeURIComponent(selectedItem.email)}`,
    };

    const endpoint = endpointMap[activeTab];

    if (!endpoint) {
      setActionErr("Invalid user type selected."); return;
    }

    try {
      const res = await fetch(
        `${API_BASE}/${domain}/domainAdmin/${endpoint}`,
        {
          method: "DELETE",
          headers: authHeaders(),
        }
      );

      const data = await readJsonResponse(res);

      if (!res.ok) { throw new Error(data?.message || "Delete failed."); }

      setActionMsg(data?.message || "Deleted successfully!");

      setShowDeleteModal(false);
      setSelectedItem(null);

      await fetchAllData();

    } catch (error) {
      console.error("Delete error:", error);

      setActionErr(error?.message || "Delete failed.");
    }
  };

  // ─────────────────────────────────────────────
  // Excel upload
  const handleExcelUpload = async () => {
    clearFeedback();

    if (!uploadFiles || uploadFiles.length === 0) {
      setActionErr("Please select at least one Excel file first.");
      return;
    }

    // Validate all files before uploading
    const invalidFiles = uploadFiles.filter((file) => {
      const name = file.name.toLowerCase();

      return (
        !name.endsWith(".xlsx") &&
        !name.endsWith(".xls")
      );
    });


    const endpointMap = { student: "upload_students", faculty: "upload_faculty", subadmin: "upload_subAdmin", feesAdmin: "upload_feesAdmin", };

    const endpoint = endpointMap[activeTab];

    if (!endpoint) {
      setActionErr("Invalid upload type selected.");
      return;
    }

    if (invalidFiles.length > 0) {
      setActionErr(
        `Invalid Excel file${invalidFiles.length === 1 ? "" : "s"
        }: ${invalidFiles.map((f) => f.name).join(", ")}`
      );
      return;
    }
    try {
      setUploading(true);

      const formData = new FormData();

      uploadFiles.forEach((file) => {
        formData.append("files", file);
      });

      const res = await fetch(
        `${API_BASE}/${domain}/domainAdmin/${endpoint}`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
          body: formData,
        }
      );

      const data = await readJsonResponse(res);

      if (!res.ok || data?.success === false) {
        throw new Error(
          data?.message || "Excel upload failed."
        );
      }


      setActionMsg(
        data?.message ||
        `${uploadFiles.length} Excel file${uploadFiles.length === 1 ? "" : "s"
        } uploaded successfully!`
      );

      setShowUploadModal(false);    // Close modal

      setUploadFiles([]);   // Clear selected files

      // Clear actual input
      if (uploadInputRef.current) {
        uploadInputRef.current.value = "";
      }

      await fetchAllData();    // Refresh data

    } catch (error) {
      console.error("Excel upload error:", error);

      setActionErr(
        error?.message ||
        "Excel upload failed. Please try again."
      );

    } finally {
      setUploading(false);
    }
  };

  // ─────────────────────────────────────────────
  // Field definitions
  const studentFields = [
    { key: "rollNumber", label: "Roll Number", type: "text", placeholder: "Example: HU2026001 / 24101010043", },
    { key: "name", label: "Full Name", type: "text",          placeholder: "Example: Full Name",},
    { key: "email", label: "Email", type: "email",                    placeholder: "Example: xyz@gmail;.com / xyz@hu.ac.in",},
    { key: "mobileNumber", label: "Mobile Number", type: "text",        placeholder: "Example: 9999999999",},
    { key: "course", label: "Course", type: "text",         placeholder: "Example: B.Tech / B.Pharma / BCA",},
    { key: "branch", label: "Branch", type: "text",       placeholder: "Example: CSE / ", },
    { key: "batch", label: "Batch", type: "text",         placeholder: "Example: 2024-28",},
    { key: "studyBatch", label: "Study Batch / YearSection", type: "text",        placeholder: "Example: 1A / 1B ",},
    { key: "studySubjects", label: "Study Subjects (JAVA,DSA,OS)", type: "text",        placeholder: "Example: Rahul Kumar",},
    { key: "fatherName", label: "Father Name", type: "text",        placeholder: "Example: Rahul Kumar",},
    { key: "fatherMobNo", label: "Father Mobile Number", type: "text",        placeholder: "Example: Rahul Kumar",},
    { key: "password", label: "Password", type: "text",         placeholder: "Example: Rahul Kumar",},
  ];

  const facultyFields = [
    { key: "facultyId", label: "Faculty ID", type: "text", },
    { key: "name", label: "Full Name", type: "text", },
    { key: "email", label: "Email", type: "email", },
    { key: "mobileNumber", label: "Mobile Number", type: "text", },
    { key: "course", label: "Course", type: "text", },
    { key: "teachingBatch", label: "Teaching Batch", type: "text", },
    { key: "teachingSubjects", label: "Teaching Subjects (JAVA,DSA)", type: "text", },
    { key: "password", label: "Password", type: "text", },
  ];

  const subAdminFields = [
    { key: "subAdminId", label: "SubAdmin ID", type: "text", },
    { key: "name", label: "Full Name", type: "text", },
    { key: "email", label: "Email", type: "email", },
    { key: "mobileNumber", label: "Mobile Number", type: "text", },
    { key: "course", label: "Course", type: "text", },
    { key: "teachingBatch", label: "Teaching Batch", type: "text", },
    { key: "teachingSubjects", label: "Teaching Subjects (JAVA,DSA)", type: "text", },
    { key: "password", label: "Password", type: "text", },
  ];

  const feesAdminFields = [
    { key: "feesAdminId", label: "FeesAdmin ID", type: "text", },
    { key: "name", label: "Full Name", type: "text", },
    { key: "email", label: "Email", type: "email", },
    { key: "mobileNumber", label: "Mobile Number", type: "text", },
    { key: "password", label: "Password", type: "text", },
  ];

  const activeFields = activeTab === "student" ? studentFields : activeTab === "faculty" ? facultyFields : activeTab === "subadmin" ? subAdminFields : feesAdminFields;
  // ─────────────────────────────────────────────
  // Image URLs
  const profileImageUrl = admin?.profilePic ? `${API_BASE}/${String(admin.profilePic).replace(/^\/+/, "")}` : "/default.png";

  /*
   * IMPORTANT: * * Do not assume "/uploads/" here. * * This assumes the backend returns a usable * relative path from the API base. * * Example: * * university_logo/logo.png * * becomes: * * http://localhost:8080/api/university_logo/logo.png * * If your backend returns a complete URL, * use it directly.
   */
  const getFileUrl = (path) => {
    if (!path) {
      return "";
    }

    if (
      String(path).startsWith("http://") ||
      String(path).startsWith("https://")
    ) {
      return path;
    }

    return `${API_BASE}/${String(path).replace(
      /^\/+/,
      ""
    )}`;
  };

  const universityLogoUrl =
    getFileUrl(
      university?.universityLogoPath
    );

  // ─────────────────────────────────────────────
  // Render
  // ─────────────────────────────────────────────
  return (

    // <ERPLayout
    //   role="Domain Admin"
    //   user={user}
    //   menu={menu}
    // >

    <div className="dashboard-container">

      {/* ─────────────────────────────────────── */}
      {/* Sidebar Toggle */}
      <button className="toggle-btn" onClick={() => setShowSidebar((prev) => !prev)}>  ☰ </button>

      {/* ─────────────────────────────────────── */}
      {/* Sidebar */}
      {showSidebar && (
        <div className="sidebar">

          <div className="profile-section">

            {/* Profile Picture */}
            <div
              className="profile-pic"
              style={{ position: "relative", cursor: "pointer", }}
              onClick={() => { clearFeedback(); setShowProfilePicModal(true); }}
              title="Click to update profile picture"
            >
              <img
                className="profile-pic-img"
                src={getFileUrl(admin?.profilePic) || "/default.png"}
                alt="Domain Admin"
                onError={(e) => { e.currentTarget.src = "/default.png"; }}
              />

              <div
                style={{ position: "absolute", bottom: 0, right: 0, background: "#2563eb", borderRadius: "50%", width: 26, height: 26, display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontSize: 13, border: "2px solid #fff", }}
              >  ✎
              </div>
            </div>

            {/* Domain Admin Information */}
            <p>
              <strong>Name:</strong>{" "}
              {admin?.name || "-"}
            </p>

            <p>
              <strong>Mobile:</strong>{" "}
              {admin?.mobileNumber || "-"}
            </p>

            <p>
              <strong>Email:</strong>{" "}
              {admin?.email || "-"}
            </p>


            <p>
              <strong>Last Login:</strong>{" "}
              {FormatDate(
                admin?.lastLoginDateTime
              )}
            </p>

            <p>
              <strong>Account Created:</strong>{" "}
              {FormatDate(
                admin?.createdDateTime
              )}
            </p>

            {/* ─────────────────────────────── */}
            {/* University Information */}
            {/* ─────────────────────────────── */}
            <div
              style={{
                marginTop: 14,
                marginBottom: 14,
                paddingTop: 14,
                borderTop:
                  "1px solid #e5e7eb",
              }}
            >
              <p
                style={{
                  fontWeight: 700,
                  display: "flex",
                  alignItems: "center",
                  gap: 6,
                }}
              >
                <Building2 size={16} />
                University
              </p>

              <p>
                <strong>University ID:</strong>{" "}
                {university?.id || "-"}
              </p>

              <p>
                <strong>Domain:</strong>{" "}
                {admin?.domain ||
                  university?.domain ||
                  domain ||
                  "-"}
              </p>

              <p>
                <strong>Permanent ID:</strong>{" "}
                {university?.permanentId || "-"}
              </p>

              <p>
                <strong>University Name:</strong>{" "}
                {university?.universityName ||
                  "-"}
              </p>

              <p>
                <strong>Institution Name:</strong>{" "}
                {university?.institutionName ||
                  "-"}
              </p>

              <p>
                <strong>Institution Type:</strong>{" "}
                {university?.institutionType ||
                  "-"}
              </p>

              <p>
                <strong>Establishment Year:</strong>{" "}
                {university?.establishmentYear ||
                  "-"}
              </p>

              <p>
                <strong>Address:</strong>{" "}
                {university?.address || "-"}
              </p>

              <p>
                <strong>Email:</strong>{" "}
                {university?.email || "-"}
              </p>

              <p>
                <strong>Mobile:</strong>{" "}
                {university?.mobileNumber ||
                  "-"}
              </p>

              <p>
                <strong>Account Created:</strong>{" "}
                {FormatDate(
                  university?.createdDateTime
                )}
              </p>

            </div>

          </div>

          {/* Edit Domain Admin Profile */}
          <button
            type="button"
            className="sidebar-action-btn sidebar-profile-btn"
            onClick={openAdminProfileModal}
          >
            ✎ Edit Profile
          </button>

          {/* Change Password */}
          <button
            type="button"
            style={{
              width: "calc(100% - 32px)",
              margin: "0 16px 10px",
              padding: "9px",
              borderRadius: 6,
              border:
                "1px solid #2563eb",
              background: "transparent",
              color: "#2563eb",
              fontWeight: 600,
              cursor: "pointer",
            }}
            onClick={() => {
              clearFeedback();
              setShowChangePasswordModal(
                true
              );
            }}
          >
            🔑 Change Password
          </button>

          {/* Update University Logo */}
          <button
            type="button"
            onClick={() => {
              clearFeedback();
              setShowUniversityLogo(true);
            }}
            style={{
              width: "calc(100% - 32px)",
              margin: "0 16px 10px",
              padding: "9px",
              borderRadius: 6,
              border:
                "1px solid #eb2f25",
              background: "transparent",
              color: "#eb2f25",
              fontWeight: 600,
              cursor: "pointer",
            }}
          >
            🏢 Update University Logo
          </button>

          {/* Refresh */}
          <button
            type="button"
            onClick={fetchAllData}
            disabled={loading}
            style={{
              width: "calc(100% - 32px)",
              margin: "0 16px 10px",
              padding: "9px",
              borderRadius: 6,
              border:
                "1px solid #6b7280",
              background: "transparent",
              color: "#374151",
              fontWeight: 600,
              cursor: loading
                ? "not-allowed"
                : "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 7,
            }}
          >
            <RefreshCw size={15} />
            {loading
              ? "Refreshing..."
              : "Refresh Data"}
          </button>

          {/* Logout */}
          <button
            type="button"
            className="logout-btn"
            onClick={handleLogout}
          >
            Logout
          </button>
        </div>
      )}

      {/* ─────────────────────────────────────── */}
      {/* Main Content */}
      {/* ─────────────────────────────────────── */}
      <div className="main-content">
        <div className="domain-admin-topbar">
          <div className="domain-admin-topbar-title">
            <div className="domain-admin-brand-mark">DA</div>
            <div>
              <span className="domain-admin-eyebrow">ADMIN CONSOLE</span>
              <h1>{university?.universityName || "Domain Administration"}</h1>
              <p>Manage users, access, profiles and bulk records</p>
            </div>
          </div>

        </div>

        {/* Success message */}
        {actionMsg && (
          <div
            style={{
              background: "#d1fae5",
              border:
                "1px solid #6ee7b7",
              color: "#065f46",
              borderRadius: 8,
              padding: "10px 16px",
              marginBottom: 12,
              display: "flex",
              justifyContent:
                "space-between",
              gap: 12,
            }}
          >
            <span>
              ✅ {actionMsg}
            </span>

            <span
              style={{
                cursor: "pointer",
                fontWeight: 700,
              }}
              onClick={() =>
                setActionMsg("")
              }
            >
              ✕
            </span>
          </div>
        )}

        {/* Error message */}
        {actionErr && (
          <div
            style={{
              background: "#fee2e2",
              border:
                "1px solid #fca5a5",
              color: "#991b1b",
              borderRadius: 8,
              padding: "10px 16px",
              marginBottom: 12,
              display: "flex",
              justifyContent:
                "space-between",
              gap: 12,
            }}
          >
            <span>
              ❌ {actionErr}
            </span>

            <span
              style={{
                cursor: "pointer",
                fontWeight: 700,
              }}
              onClick={() =>
                setActionErr("")
              }
            >
              ✕
            </span>
          </div>
        )}

        {/* ───────────────────────────────────── */}
        {/* Parent Dashboard */}
        {/* ───────────────────────────────────── */}
        {isParentRoute ? (
          <>
            {/* Dashboard cards */}
            <div className="card-grid">

              <Link
                className="main-content-Link"
                to="all-students"
              >
                <div className="card card-student">
                  <Users size={20} /> All Students:{" "}
                  {totalStudent}
                </div>
              </Link>

              <Link
                className="main-content-Link"
                to="all-faculty"
              >
                <div className="card card-faculty">
                  <GraduationCap size={20} /> All Faculty:{" "}
                  {totalFaculty}
                </div>
              </Link>

              <Link
                className="main-content-Link"
                to="all-subAdmin"
              >
                <div className="card card-subadmin">
                  <UserCog size={20} /> All SubAdmin:{" "}
                  {totalSubAdmin}
                </div>
              </Link>

              <Link
                className="main-content-Link"
                to="all-feesAdmin"
              >
                <div className="card card-fees">
                  <WalletCards size={20} /> All FeesAdmin:{" "}
                  {totalFeesAdmin}
                </div>
              </Link>

              <Link
                className="main-content-Link"
                to="notepad"
              >
                <div className="card card-notepad">
                  📝 Notepad
                </div>
              </Link>

              {/* ERP Attendance */}
              <Link
                className="main-content-Link"
                to="attendance"
              >
                <div className="card card-notepad">
                  Attendance
                </div>
              </Link>


              {/* ERP  Reports*/}
              <Link
                className="main-content-Link"
                to="reports"
              >
                <div className="card card-notepad">
                  Reports
                </div>
              </Link>

            </div>

            <div className="domain-admin-overview-strip">
              <div><span>Active view</span><strong>{activeTabLabel}s</strong></div>
              <div><span>Visible records</span><strong>{filteredData.length}</strong></div>
              <div><span>Domain</span><strong>{admin?.domain || domain || "-"}</strong></div>
              <div><span>Security</span><strong><ShieldCheck size={16} /> Protected</strong></div>
            </div>

            {/* Tabs */}
            <div
              className="grid grid-cols-4 gap-6 mt-8"
            >

              {[
                "student",
                "faculty",
                "subadmin",
                "feesAdmin",
              ].map((tab) => (
                <button
                  type="button"
                  key={tab}
                  onClick={() => {
                    setActiveTab(tab);
                    setSearchQuery("");
                    clearFeedback();
                  }}
                  className={
                    activeTab === tab
                      ? "domain-admin-tab active"
                      : "domain-admin-tab"
                  }
                  style={{
                    fontWeight:
                      activeTab === tab
                        ? 700
                        : 400,

                    borderBottom:
                      activeTab === tab
                        ? "2px solid #2563eb"
                        : "none",

                    paddingBottom: 8,
                    cursor: "pointer",
                  }}
                >
                  {tab === "student"
                    ? `Students (${totalStudent})`
                    : tab === "faculty"
                      ? `Faculty (${totalFaculty})`
                      : tab === "subadmin"
                        ? `SubAdmin (${totalSubAdmin})`
                        : `FeesAdmin (${totalFeesAdmin})`}
                </button>
              ))}
            </div>

            {/* Table container */}
            <div className="shadow rounded-xl p-6">

              {/* Search + actions */}
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 10,
                  marginBottom: 12,
                  flexWrap: "wrap",
                }}
              >
                <input
                  type="text"
                  placeholder={`Search ${activeTabLabel}...`}
                  value={searchQuery}
                  onChange={(e) =>
                    setSearchQuery(
                      e.target.value
                    )
                  }
                  className="border p-2 mt-3 domain-admin-search"
                  aria-label={`Search ${activeTabLabel}`}
                  style={{
                  }}
                />

                <div className="domain-admin-results-count">
                  {filteredData.length} result{filteredData.length === 1 ? "" : "s"}
                </div>

                <button
                  type="button"
                  onClick={() => {
                    setAddForm({});
                    clearFeedback();
                    setShowAddModal(true);
                  }}
                  style={{
                    padding:
                      "8px 16px",
                    borderRadius: 6,
                    border: "none",
                    background:
                      "#16a34a",
                    color: "#fff",
                    fontWeight: 700,
                    cursor: "pointer",
                  }}
                >
                  + Add {activeTabLabel}
                </button>

                <button
                  type="button"
                  onClick={() => {
                    clearFeedback();
                    setUploadFiles([]);

                    if (uploadInputRef.current) {
                      uploadInputRef.current.value = "";
                    }

                    setShowUploadModal(true);
                  }}
                  style={{
                    padding: "8px 16px",
                    borderRadius: 6,
                    border: "none",
                    background: "#0891b2",
                    color: "#fff",
                    fontWeight: 700,
                    cursor: "pointer",
                  }}
                >
                  📥 Upload Excel
                </button>
              </div>

              {/* Table */}
              <div
                style={{
                  overflowX: "auto",
                  maxHeight: "500px",
                  overflowY: "auto",
                }}
              >
                <table className="table-wrapper">
                  <thead>
                    <tr>
                      <th>S.No</th>

                      {/* ID */}
                      {activeTab === "student" && <th>Roll No</th>}
                      {activeTab === "faculty" && <th>Faculty ID</th>}
                      {activeTab === "subadmin" && <th>SubAdmin ID</th>}
                      {activeTab === "feesAdmin" && <th>FeesAdmin ID</th>}

                      {/* Common */}
                      <th>Name</th>

                      {/* Course is not available in FeesAdmin DTO */}
                      {activeTab !== "feesAdmin" && <th>Course</th>}

                      {/* Student */}
                      {activeTab === "student" && (
                        <>
                          <th>Branch</th>
                          <th>Batch</th>
                          <th>Study Batch</th>
                        </>
                      )}

                      {/* Faculty / SubAdmin */}
                      {(activeTab === "faculty" || activeTab === "subadmin") && (
                        <>
                          <th>Teaching Batch</th>
                          <th>Teaching Subjects</th>
                        </>
                      )}

                      {/* Common */}
                      <th>Email</th>
                      <th>Mobile</th>

                      {/* Student */}
                      {activeTab === "student" && (
                        <>
                          <th>Father Name</th>
                          <th>Father Mob</th>
                        </>
                      )}

                      <th>Created At</th>
                      <th>Last Login</th>

                      <th>
                        Password
                        <span
                          style={{
                            marginLeft: 8,
                            cursor: "pointer",
                            display: "inline-flex",
                            alignItems: "center",
                            verticalAlign: "middle",
                          }}
                          onClick={() => setShowPassword((prev) => !prev)}
                          title={showPassword ? "Hide passwords" : "Show passwords"}
                        >
                          {showPassword ? (
                            <EyeOff size={16} />
                          ) : (
                            <Eye size={16} />
                          )}
                        </span>
                      </th>

                      <th>Actions</th>
                    </tr>
                  </thead>

                  <tbody>
                    {/* Loading */}
                    {loading && filteredData.length === 0 && (
                      <tr>
                        <td
                          colSpan={20}
                          style={{
                            textAlign: "center",
                            padding: 24,
                          }}
                        >
                          Loading...
                        </td>
                      </tr>
                    )}

                    {/* Data */}
                    {!loading &&
                      filteredData.map((item, index) => {
                        /*
                         * Safely format teaching assignments.
                         *
                         * Example:
                         * {
                         *   "BCA 2024": ["Java", "DBMS"],
                         *   "BCA 2025": ["Spring Boot", "React"]
                         * }
                         */

                        const assignments =
                          item?.teachingAssignments &&
                            typeof item.teachingAssignments === "object"
                            ? item.teachingAssignments
                            : {};

                        const teachingBatches = Object.keys(assignments);

                        const teachingSubjects = Object.entries(assignments)
                          .map(([batch, subjects]) => {
                            const subjectList = Array.isArray(subjects)
                              ? subjects
                              : [];

                            return `${batch}: ${subjectList.length > 0
                              ? subjectList.join(", ")
                              : "-"
                              }`;
                          })
                          .join(" | ");

                        return (
                          <tr
                            key={
                              item?.id ||
                              item?.email ||
                              item?.facultyId ||
                              item?.subAdminId ||
                              item?.feesAdminId ||
                              item?.rollNumber ||
                              index
                            }
                          >
                            {/* S.No */}
                            <td>{index + 1}</td>

                            {/* Student ID */}
                            {activeTab === "student" && (
                              <td>{item?.rollNumber || "-"}</td>
                            )}

                            {/* Faculty ID */}
                            {activeTab === "faculty" && (
                              <td>{item?.facultyId || "-"}</td>
                            )}

                            {/* SubAdmin ID */}
                            {activeTab === "subadmin" && (
                              <td>{item?.subAdminId || "-"}</td>
                            )}

                            {/* FeesAdmin ID */}
                            {activeTab === "feesAdmin" && (
                              <td>{item?.feesAdminId || "-"}</td>
                            )}

                            {/* Name */}
                            <td>{item?.name || "-"}</td>

                            {/* Course */}
                            {activeTab !== "feesAdmin" && (
                              <td>{item?.course || "-"}</td>
                            )}

                            {/* ================= STUDENT ================= */}
                            {activeTab === "student" && (
                              <>
                                <td>{item?.branch || "-"}</td>

                                <td>{item?.batch || "-"}</td>

                                <td>{item?.studyBatch || "-"}</td>
                              </>
                            )}

                            {/* ================= FACULTY ================= */}
                            {activeTab === "faculty" && (
                              <>
                                {/* Teaching Batch */}
                                <td>
                                  {teachingBatches.length > 0
                                    ? teachingBatches.join(", ")
                                    : item?.teachingBatch || "-"}
                                </td>

                                {/* Teaching Subjects */}
                                <td>
                                  {teachingSubjects ||
                                    item?.teachingSubjects ||
                                    item?.teachingSubject ||
                                    "-"}
                                </td>
                              </>
                            )}

                            {/* ================= SUBADMIN ================= */}
                            {activeTab === "subadmin" && (
                              <>
                                {/* Teaching Batch */}
                                <td>
                                  {teachingBatches.length > 0
                                    ? teachingBatches.join(", ")
                                    : item?.teachingBatch || "-"}
                                </td>

                                {/* Teaching Subjects */}
                                <td>
                                  {teachingSubjects ||
                                    item?.teachingSubjects ||
                                    item?.teachingSubject ||
                                    "-"}
                                </td>
                              </>
                            )}

                            {/* Email */}
                            <td>{item?.email || "-"}</td>

                            {/* Mobile */}
                            <td>{item?.mobileNumber || "-"}</td>

                            {/* Student Parent Information */}
                            {activeTab === "student" && (
                              <>
                                <td>{item?.fatherName || "-"}</td>

                                <td>{item?.fatherMobNo || "-"}</td>
                              </>
                            )}

                            {/* Created */}
                            <td>
                              {item?.createdDateTime
                                ? FormatDate(item.createdDateTime)
                                : "-"}
                            </td>

                            {/* Last Login */}
                            <td>
                              {item?.lastLoginDateTime
                                ? FormatDate(item.lastLoginDateTime)
                                : "-"}
                            </td>

                            {/* Password */}
                            <td>
                              {showPassword
                                ? item?.password || "-"
                                : "••••••••"}
                            </td>

                            {/* Actions */}
                            <td
                              style={{
                                whiteSpace: "nowrap",
                              }}
                            >
                              {/* Edit */}
                              <button
                                type="button"
                                onClick={() => openEditModal(item)}
                                className="action-btn action-edit"
                                style={{
                                  marginRight: 6,
                                  marginBottom: 4,
                                  padding: "4px 12px",
                                  borderRadius: 5,
                                  border: "none",
                                  background: "#2563eb",
                                  color: "#fff",
                                  cursor: "pointer",
                                  fontWeight: 600,
                                  fontSize: 13,
                                }}
                                title="Edit record"
                              >
                                ✎ Edit
                              </button>

                              {/* Change Password */}
                              {(activeTab === "student" ||
                                activeTab === "faculty" ||
                                activeTab === "subadmin" ||
                                activeTab === "feesAdmin") && (
                                  <button
                                    type="button"
                                    className="action-btn action-password"
                                    onClick={() =>
                                      openUserPasswordModal(item)
                                    }
                                    style={{
                                      marginRight: 6,
                                      marginBottom: 4,
                                      padding: "4px 12px",
                                      borderRadius: 5,
                                      border: "none",
                                      background: "#7c3aed",
                                      color: "#fff",
                                      cursor: "pointer",
                                      fontWeight: 600,
                                      fontSize: 13,
                                    }}
                                    title="Change user password"
                                  >
                                    🔑 Password
                                  </button>
                                )}

                              {/* Delete */}
                              <button
                                type="button"
                                onClick={() => openDeleteModal(item)}
                                className="action-btn action-delete"
                                style={{
                                  padding: "4px 12px",
                                  borderRadius: 5,
                                  border: "none",
                                  background: "#dc2626",
                                  color: "#fff",
                                  cursor: "pointer",
                                  fontWeight: 600,
                                  fontSize: 13,
                                }}
                                title="Delete record"
                              >
                                🗑 Delete
                              </button>
                            </td>
                          </tr>
                        );
                      })}

                    {/* Empty */}
                    {!loading && filteredData.length === 0 && (
                      <tr>
                        <td
                          colSpan={20}
                          style={{
                            textAlign: "center",
                            color: "#9ca3af",
                            padding: 24,
                          }}
                        >
                          No {activeTabLabel.toLowerCase()}s found.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>

              </div>
            </div>
          </>
        ) : (
          // ───────────────────────────────────
          // Child route
          // ───────────────────────────────────
          <div className="sub-page-container">

            <button
              type="button"
              className="back-btn"
              onClick={() =>
                navigate(-1)
              }
            >
              ← Back to Dashboard
            </button>

            <Outlet />
          </div>
        )}
      </div>


      {/* ═══════════════════════════════════════ */}
      {/* PROFILE PICTURE MODAL */}
      {/* ═══════════════════════════════════════ */}
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
          <div className="profile-upload-preview">
            <img
              src={
                profilePicPreview ||
                getFileUrl(admin?.profilePic) ||
                "/default.png"
              }
              alt="Profile Preview"
            />
          </div>

          <label style={labelStyle}>Choose New Profile Picture</label>
          <input
            type="file"
            accept="image/*"
            onChange={handleProfilePicChange}
            style={{ ...fieldStyle, padding: "6px" }}
          />

          {actionErr && (
            <p className="modal-error">{actionErr}</p>
          )}

          {actionMsg && (
            <p className="modal-success">{actionMsg}</p>
          )}

          <button
            type="button"
            style={submitBtnStyle}
            onClick={handleUpdateProfilePic}
          >
            Upload &amp; Save
          </button>
        </Modal>
      )}

      {/* ═══════════════════════════════════════ */}
      {/* DOMAIN ADMIN PROFILE MODAL */}
      {/* ═══════════════════════════════════════ */}
      {showAdminProfileModal && (
        <Modal
          title="Edit Domain Admin Profile"
          onClose={() => {
            setShowAdminProfileModal(false);
            setAdminProfileForm({});
            clearFeedback();
          }}
        >
          <label style={labelStyle}>Full Name</label>
          <input
            type="text"
            value={adminProfileForm?.name || ""}
            onChange={(e) =>
              setAdminProfileForm((prev) => ({
                ...prev,
                name: e.target.value,
              }))
            }
            style={fieldStyle}
          />

          <label style={labelStyle}>Email</label>
          <input
            type="email"
            value={adminProfileForm?.email || ""}
            style={fieldStyle}
            readOnly
          />

          <label style={labelStyle}>Mobile Number</label>
          <input
            type="tel"
            inputMode="numeric"
            maxLength={10}
            placeholder="Enter 10 digit mobile number"
            value={adminProfileForm?.mobileNumber || ""}
            onChange={(e) =>
              setAdminProfileForm((prev) => ({
                ...prev,
                mobileNumber: e.target.value,
              }))
            }
            style={fieldStyle}
          />

          {actionErr && (
            <p className="modal-error">{actionErr}</p>
          )}

          {actionMsg && (
            <p className="modal-success">{actionMsg}</p>
          )}

          <button
            type="button"
            style={submitBtnStyle}
            onClick={handleAdminProfileUpdate}
          >
            Save Profile
          </button>
        </Modal>
      )}

      {/* ═══════════════════════════════════════ */}
      {/* USER PASSWORD MODAL */}
      {/* ═══════════════════════════════════════ */}
      {showUserPasswordModal && selectedItem && (
        <Modal
          title={`Change ${activeTabLabel} Password`}
          onClose={() => {
            setShowUserPasswordModal(false);
            setSelectedItem(null);
            setUserPassword("");
            setUserPasswordConfirm("");
            clearFeedback();
          }}
        >
          <div className="user-password-summary">
            <div className="user-password-avatar">
              {(selectedItem?.name || "U")
                .charAt(0)
                .toUpperCase()}
            </div>
            <div>
              <strong>{selectedItem?.name || "-"}</strong>
              <span>{selectedItem?.email || "-"}</span>
            </div>
          </div>

          <label style={labelStyle}>New Password</label>
          <input
            type="password"
            value={userPassword}
            onChange={(e) =>
              setUserPassword(e.target.value)
            }
            placeholder="Minimum 6 characters"
            autoComplete="new-password"
            style={fieldStyle}
          />

          <label style={labelStyle}>Confirm Password</label>
          <input
            type="password"
            value={userPasswordConfirm}
            onChange={(e) =>
              setUserPasswordConfirm(e.target.value)
            }
            placeholder="Re-enter new password"
            autoComplete="new-password"
            style={fieldStyle}
          />

          <p className="security-note">
            🔒 Password is sent securely to the existing backend password endpoint.
          </p>

          {actionErr && (
            <p className="modal-error">{actionErr}</p>
          )}

          {actionMsg && (
            <p className="modal-success">{actionMsg}</p>
          )}

          <button
            type="button"
            style={submitBtnStyle}
            onClick={handleUserPasswordChange}
          >
            Update Password
          </button>
        </Modal>
      )}

      {/* ═══════════════════════════════════════ */}
      {/* UNIVERSITY LOGO MODAL */}
      {/* ═══════════════════════════════════════ */}

      {showUniversityLogo && (
        <Modal
          title="Update University Logo"
          onClose={() => {
            setShowUniversityLogo(false);
            setUniversityLogo(null);
            setUniversityLogoPreview(null);
            clearFeedback();
          }}
        >
          {/* Current logo */}
          {universityLogoUrl &&
            !universityLogoPreview && (
              <div
                style={{
                  textAlign: "center",
                  marginBottom: 16,
                }}
              >
                <img
                  src={
                    universityLogoUrl
                  }
                  alt="Current University Logo"
                  style={{
                    width: 120,
                    height: 120,
                    objectFit: "contain",
                    borderRadius: 8,
                    border:
                      "2px solid #e5e7eb",
                  }}
                />
              </div>
            )}

          {/* New logo preview */}
          {universityLogoPreview && (
            <div
              style={{
                textAlign: "center",
                marginBottom: 16,
              }}
            >
              <img
                src={
                  universityLogoPreview
                }
                alt="New Logo Preview"
                style={{
                  width: 120,
                  height: 120,
                  objectFit: "contain",
                  borderRadius: 8,
                  border:
                    "2px solid #eb2f25",
                }}
              />
            </div>
          )}

          <label style={labelStyle}>
            Select Logo
          </label>

          <input
            type="file"
            accept="image/*"
            onChange={
              handleUniversityLogoChange
            }
            style={{
              ...fieldStyle,
              padding: "6px",
            }}
          />

          {actionErr && (
            <p
              style={{
                color: "#dc2626",
                marginBottom: 8,
              }}
            >
              {actionErr}
            </p>
          )}

          {actionMsg && (
            <p
              style={{
                color: "#16a34a",
                marginBottom: 8,
              }}
            >
              {actionMsg}
            </p>
          )}

          <button
            type="button"
            style={{
              ...submitBtnStyle,
              background:
                logoUploading
                  ? "#9ca3af"
                  : "#2563eb",
              cursor:
                logoUploading
                  ? "not-allowed"
                  : "pointer",
            }}
            onClick={
              handleUpdateLogo
            }
            disabled={logoUploading}
          >
            {logoUploading
              ? "Uploading..."
              : "Upload Logo"}
          </button>
        </Modal>
      )}

      {/* ═══════════════════════════════════════ */}
      {/* ADD MODAL */}
      {/* ═══════════════════════════════════════ */}
      {showAddModal && (
        <Modal
          title={`Add ${activeTabLabel}`}
          onClose={() => {
            setShowAddModal(false);
            setAddForm({});
            clearFeedback();
          }}
        >
          {activeFields.map((field) => (
            <div key={field.key}>
              <label
                style={labelStyle}
              >
                {field.label}
              </label>

              <input
                type={field.type}
                placeholder={
                  field.label
                }
                value={
                  addForm[
                  field.key
                  ] || ""
                }
                onChange={(e) =>
                  setAddForm(
                    (prev) => ({
                      ...prev,
                      [field.key]:
                        e.target
                          .value,
                    })
                  )
                }
                style={fieldStyle}
              />
            </div>
          ))}

          {actionErr && (
            <p
              style={{
                color: "#dc2626",
                marginBottom: 8,
              }}
            >
              {actionErr}
            </p>
          )}

          {actionMsg && (
            <p
              style={{
                color: "#16a34a",
                marginBottom: 8,
              }}
            >
              {actionMsg}
            </p>
          )}

          <button
            type="button"
            style={submitBtnStyle}
            onClick={handleAdd}
          >
            Add {activeTabLabel}
          </button>
        </Modal>
      )}

      {/* ═══════════════════════════════════════ */}
      {/* EDIT MODAL */}
      {/* ═══════════════════════════════════════ */}
      {showEditModal &&
        selectedItem && (
          <Modal
            title={`Edit ${activeTabLabel}`}
            onClose={() => {
              setShowEditModal(
                false
              );
              setSelectedItem(
                null
              );
              setEditForm({});
              clearFeedback();
            }}
          >
            {activeFields.map(
              (field) => (
                <div
                  key={field.key}
                >
                  <label
                    style={
                      labelStyle
                    }
                  >
                    {field.label}
                  </label>

                  <input
                    type={
                      field.type ===
                        "password"
                        ? "text"
                        : field.type
                    }
                    placeholder={
                      field.label
                    }
                    value={
                      editForm[
                      field.key
                      ] || ""
                    }
                    onChange={(
                      e
                    ) =>
                      setEditForm(
                        (prev) => ({
                          ...prev,
                          [field.key]:
                            e
                              .target
                              .value,
                        })
                      )
                    }
                    style={
                      fieldStyle
                    }
                    readOnly={
                      field.key ===
                      "email"
                    }
                  />
                </div>
              )
            )}

            {actionErr && (
              <p
                style={{
                  color:
                    "#dc2626",
                  marginBottom: 8,
                }}
              >
                {actionErr}
              </p>
            )}

            {actionMsg && (
              <p
                style={{
                  color:
                    "#16a34a",
                  marginBottom: 8,
                }}
              >
                {actionMsg}
              </p>
            )}

            <button
              type="button"
              style={
                submitBtnStyle
              }
              onClick={
                handleEdit
              }
            >
              Save Changes
            </button>
          </Modal>
        )}

      {/* ═══════════════════════════════════════ */}
      {/* DELETE MODAL */}
      {/* ═══════════════════════════════════════ */}
      {showDeleteModal &&
        selectedItem && (
          <Modal
            title={`Delete ${activeTabLabel}`}
            onClose={() => {
              setShowDeleteModal(false);
              setSelectedItem(null);
              clearFeedback();
            }}
          >
            <p
              style={{
                fontSize: 16,
                marginBottom: 6,
              }}
            >
              Are you sure you want to delete:
            </p>

            <div
              style={{
                borderRadius: 8,
                padding:
                  "12px 14px",
                marginBottom: 8,
              }}
            >
              <p
                style={{
                  margin:
                    "2px 0",
                  fontWeight: 700,
                  fontSize: 18,
                }}
              > Name : {selectedItem?.name || "-"}
              </p>

              <p
                style={{
                  margin:
                    "2px 0",
                  fontSize: 15,
                }}
              > Email : {selectedItem?.email ||
                "-"}
              </p>

              <p
                style={{
                  margin:
                    "2px 0",
                  fontSize: 15,
                }}
              > Roll Number : {selectedItem?.rollNumber ||
                "-"}
              </p>
            </div>

            <p
              style={{
                color:
                  "#dc2626",
                fontSize: 17,
                marginBottom: 14,
              }}
            >
              ⚠️ This action cannot be undone.
            </p>

            {actionErr && (
              <p
                style={{
                  color:
                    "#dc2626",
                  marginBottom: 8,
                }}
              >
                {actionErr}
              </p>
            )}

            {actionMsg && (
              <p
                style={{
                  color:
                    "#16a34a",
                  marginBottom: 8,
                }}
              >
                {actionMsg}
              </p>
            )}

            <div
              style={{
                display:
                  "flex",
                gap: 10,
              }}
            >
              <button
                type="button"
                style={{
                  ...submitBtnStyle,
                  background:
                    "#6b7280",
                }}
                onClick={() =>
                  setShowDeleteModal(
                    false
                  )
                }
              >
                Cancel
              </button>

              <button
                type="button"
                style={
                  dangerBtnStyle
                }
                onClick={
                  handleDelete
                }
              >
                Yes, Delete
              </button>
            </div>
          </Modal>
        )}

      {/* ═══════════════════════════════════════ */}
      {/* EXCEL UPLOAD MODAL */}
      {/* ═══════════════════════════════════════ */}
      {showUploadModal && (
        <Modal
          title={`Bulk Upload ${activeTabLabel}s via Excel`}
          onClose={() => {
            setShowUploadModal(false);
            setUploadFiles([]);
            clearFeedback();

            if (uploadInputRef.current) {
              uploadInputRef.current.value = "";
            }
          }}
        >
          <div
            style={{

              background:
                "#eff6ff",
              border:
                "1px solid #bfdbfe",
              borderRadius: 8,
              padding:
                "12px 14px",
              marginBottom: 16,
            }}
          >
            <p
              style={{
                margin: 0,
                fontSize: 13,
                color:
                  "#1d4ed8",
                fontWeight: 600,
              }}
            >
              📋 Excel Format
              Required
            </p>

            <p
              style={{
                margin:
                  "4px 0 0",
                fontSize: 12,
                color:
                  "#1e40af",
              }}
            >

              {activeTab === "student" && (
                <div className="excel-help">

                  <strong>Student Excel Columns:</strong>

                  <div className="excel-columns">
                    rollNumber → name → email → mobileNumber → course → branch →
                    batch → studyBatch → studySubjects → fatherName → fatherMobNo → password
                  </div>

                  <br />

                  <strong>Study Subjects Format:</strong>

                  <div className="excel-format">
                    SUBJECT1,SUBJECT2,SUBJECT3
                  </div>

                  <br />

                  <strong>Example:</strong>

                  <div className="excel-example">
                    JAVA,DSA,OS,DBMS
                  </div>

                  <br />

                  <div style={{ overflowX: "auto" }}>
                    <table className="excel-example-table">
                      <thead>
                        <tr>
                          <th>rollNumber</th>
                          <th>name</th>
                          <th>email</th>
                          <th>mobileNumber</th>
                          <th>course</th>
                          <th>branch</th>
                          <th>batch</th>
                          <th>studyBatch</th>
                          <th>studySubjects</th>
                          <th>fatherName</th>
                          <th>fatherMobNo</th>
                          <th>password</th>
                        </tr>
                      </thead>

                      <tbody>
                        <tr>
                          <td>STU001</td>
                          <td>STU Name</td>
                          <td>stu@gmail.com</td>
                          <td>99999..</td>
                          <td>B.Tech</td>
                          <td>CSE</td>
                          <td>2024-28</td>
                          <td>1A</td>
                          <td>JAVA,DSA,OS,DBMS</td>
                          <td>Father Name</td>
                          <td>88888...</td>
                          <td>Pasword@123</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>

                </div>
              )}


              {activeTab === "faculty" && (
                <div className="excel-help">

                  <strong>Faculty Excel Columns:</strong>

                  <div className="excel-columns">
                    facultyId → name → email → mobileNumber →
                    course → teachingAssignments → password
                  </div>

                  <br />

                  <strong>Teaching Assignments Format:</strong>

                  <div className="excel-format">
                    BATCH:SUBJECT1,SUBJECT2 ; BATCH:SUBJECT1,SUBJECT2
                  </div>

                  <br />

                  <strong>Example:</strong>

                  <div className="excel-example">
                    1A:JAVA,C,DSA;2A:AI,ML,OS;2C:OS,AI;3A:MATH
                  </div>

                  <br />

                  <div style={{ overflowX: "auto" }}>
                    <table className="excel-example-table">
                      <thead>
                        <tr>
                          <th>facultyId </th>
                          <th>name</th>
                          <th>email</th>
                          <th>mobileNumber</th>
                          <th>course</th>
                          <th>teachingAssignments</th>
                          <th>password</th>
                        </tr>
                      </thead>

                      <tbody>

                        <tr>
                          <td>FAC01</td>
                          <td>FAC Name</td>
                          <td>fac@gmail.com</td>
                          <td>99999..</td>
                          <td>B.Tech</td>
                          <td>
                            1A:JAVA,C,DSA ; 2A:AI,ML,OS ; 3A:MATH
                          </td>
                          <td>Pasword@123</td>
                        </tr>

                      </tbody>
                    </table>
                  </div>

                </div>
              )}

              {activeTab === "subadmin" && (
                <div className="excel-help">

                  <strong>SubAdmin Excel Columns:</strong>

                  <div>
                    subAdminId → name → email → mobileNumber →
                    course → teachingAssignments → password
                  </div>

                  <br />

                  <strong>Teaching Assignments Format:</strong>

                  <div>
                    BATCH:SUBJECT1,SUBJECT2;BATCH:SUBJECT1,SUBJECT2
                  </div>

                  <br />

                  <strong>Example:</strong>

                  <div>
                    1A:JAVA,C,DSA;2A:AI,ML,OS;2C:OS,AI;3A:MATH
                  </div>

                  <br />

                  <strong>Sample SubAdmin Excel:</strong>

                  <div style={{ overflowX: "auto" }}>
                    <table className="excel-example-table">

                      <thead>
                        <tr>
                          <th>subAdminId</th>
                          <th>name</th>
                          <th>email</th>
                          <th>mobileNumber</th>
                          <th>course</th>
                          <th>teachingAssignments</th>
                          <th>password</th>
                        </tr>
                      </thead>

                      <tbody>

                        <tr>
                          <td>SUB001</td>
                          <td>Admin One</td>
                          <td>admin@gmail.com</td>
                          <td>9876500001</td>
                          <td>B.Tech</td>
                          <td>
                            1A:JAVA,C,DSA;2A:AI,ML,OS;3A:MATH
                          </td>
                          <td>Pasword@123</td>
                        </tr>

                      </tbody>

                    </table>
                  </div>

                </div>
              )}

              {activeTab === "feesAdmin" && (
                <div className="excel-help">

                  <strong>FeesAdmin Excel Columns:</strong><br />

                  feesAdminId → name → email →
                  mobileNumber → password

                  <br /><br />

                  <strong>Sample FeesAdmin Excel:</strong>

                  <div style={{ overflowX: "auto" }}>
                    <table className="excel-example-table">
                      <thead>
                        <tr>
                          <th>feesAdminId</th>
                          <th>name</th>
                          <th>email</th>
                          <th>mobileNumber</th>
                          <th>password</th>
                        </tr>
                      </thead>

                      <tbody>
                        <tr>
                          <td>FEES01</td>
                          <td>Name</td>
                          <td>fees@gmail.com</td>
                          <td>98765...</td>
                          <td>Pasword@123</td>
                        </tr>

                      </tbody>
                    </table>
                  </div>

                </div>
              )}

            </p>

          </div>

          <label
            style={labelStyle}
          >
            Select Excel File
            (.xlsx / .xls)
          </label>

          <input
            ref={uploadInputRef}
            type="file"
            accept=".xlsx,.xls"
            multiple
            onChange={(e) => {
              const selectedFiles = Array.from(
                e.target.files || []
              );

              // Only Excel files
              const excelFiles = selectedFiles.filter(
                (file) => {
                  const name = file.name.toLowerCase();

                  return (
                    name.endsWith(".xlsx") ||
                    name.endsWith(".xls")
                  );
                }
              );
              if (excelFiles.length !== selectedFiles.length) {
                setActionErr(
                  "Only .xlsx and .xls Excel files are allowed."
                );
              } else {
                clearFeedback();
              }
              setUploadFiles(excelFiles);
            }}
            style={{
              ...fieldStyle,
              padding: "6px",
            }}
          />

          {/* Selected files */}
          {uploadFiles.length > 0 && (
            <div
              style={{
                marginTop: 12,
                marginBottom: 12,
              }}
            >

              <p
                style={{
                  fontSize: 13,
                  color:
                    "#374151",
                  marginBottom: 8,
                  fontWeight: 600,
                }}
              >
                Selected {uploadFiles.length} Excel file
                {uploadFiles.length === 1 ? "" : "s"}:
              </p>

              {actionErr && (
                <p
                  style={{
                    color:
                      "#dc2626",
                    marginBottom: 8,
                  }}
                >
                  {actionErr}
                </p>
              )}

              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: 6,
                }}
              >
                {uploadFiles.map((file, index) => (
                  <div
                    key={`${file.name}-${index}`}
                    style={{

                      position: "relative",
                      padding: "12px 40px 12px 10px",
                      background: "#f9fafb",

                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      gap: 10,
                      border: "1px solid #d1d5db",
                      borderRadius: 6,
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 8,
                        minWidth: 0,
                      }}
                    >
                      <span>📄 </span>

                      <span
                        style={{
                          fontSize: 13,
                          color: "#374151",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          whiteSpace: "nowrap",
                        }}
                      >
                        {file.name}
                      </span>
                    </div>

                    <button
                      type="button"
                      onClick={() => {
                        setUploadFiles((prev) =>
                          prev.filter(
                            (_, fileIndex) => fileIndex !== index
                          )
                        );
                      }}
                      style={{
                        position: "absolute",
                        top: 6,
                        right: 6,
                        width: 24,
                        height: 24,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        border: "none",
                        borderRadius: "50%",
                        background: "#fee2e2",
                        color: "#dc2626",
                        cursor: "pointer",
                        fontSize: 14,
                        fontWeight: 800,
                        lineHeight: 1,
                        padding: 0,
                        zIndex: 2,
                      }}
                      title="Remove file"
                    >
                      ✕
                    </button>
                  </div>
                ))}
              </div>

              {/* Clear all */}
              <button
                type="button"
                disabled={uploading}

                onClick={() => {
                  setUploadFiles([]);

                  if (uploadInputRef.current) {
                    uploadInputRef.current.value = "";
                  }

                  clearFeedback();
                }}
                style={{
                  marginTop: 8,
                  border: "none",
                  background: "transparent",
                  color: "#dc2626",
                  cursor: "pointer",
                  fontSize: 13,
                  fontWeight: 600,
                }}
              >
                Clear all files
              </button>
            </div>
          )}

          {/* No file selected */}
          {uploadFiles.length === 0 && (
            <p
              style={{
                fontSize: 13,
                color: "#6b7280",
                marginTop: 8,
              }}
            >
              Select one or multiple Excel files (.xlsx or .xls).
            </p>
          )}

          {/* Modal buttons */}
          <div
            style={{
              display: "flex",
              justifyContent: "flex-end",
              gap: 8,
              marginTop: 16,
            }}
          >
            <button
              type="button"
              onClick={() => {
                setShowUploadModal(false);
                setUploadFiles([]);
                clearFeedback();

                if (uploadInputRef.current) {
                  uploadInputRef.current.value = "";
                }
              }}
              disabled={uploading}
              style={{
                padding: "8px 16px",
                borderRadius: 6,
                border: "1px solid #d1d5db",
                background: "#fff",
                color: "#374151",
                fontWeight: 600,
                cursor: uploading
                  ? "not-allowed"
                  : "pointer",
              }}
            >
              Cancel
            </button>

            <button
              type="button"
              onClick={handleExcelUpload}
              disabled={
                uploading || uploadFiles.length === 0
              }
              style={{
                padding: "8px 16px",
                borderRadius: 6,
                border: "none",
                background:
                  uploading || uploadFiles.length === 0
                    ? "#9ca3af"
                    : "#0891b2",
                color: "#fff",
                fontWeight: 700,
                cursor:
                  uploading || uploadFiles.length === 0
                    ? "not-allowed"
                    : "pointer",
              }}
            >
              {uploading
                ? "Uploading..."
                : `Upload ${uploadFiles.length || ""
                } Excel${uploadFiles.length === 1
                  ? ""
                  : "s"
                }`}
            </button>

          </div>
        </Modal>
      )
      }

      {/* ═══════════════════════════════════════ */}
      {/* CHANGE PASSWORD MODAL */}
      {/* ═══════════════════════════════════════ */}
      {
        showChangePasswordModal && (
          <ChangePasswordModal
            email={admin?.email}
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
                "Password updated successfully!"
              );
            }}
          />
        )
      }
    </div >
    // </ERPLayout>
  );
}

import { useEffect, useState } from "react";

import {
  Link,
  useParams,
  Outlet,
  useNavigate,
  useLocation,
} from "react-router-dom";

import "../Common/css/common.css";
import "./StudentDashboard.css";

import FormatDate from "../../Components/DateTimeFunction/FormatDate";

import ChangePasswordModal from "../../Components/Auth/ChangePasswordModal";
import DeleteAccountModal from "../../Components/Auth/DeleteAccountModal";

import ERPLayout from "../../Components/ERP/ERPLayout";
import StatCard from "../../Components/ERP/StatCard";


// ============================================================
// MODAL
// ============================================================

function Modal({ title, onClose, children }) {

  return (
    <div style={modalStyles.overlay}>

      <div style={modalStyles.box}>

        <div style={modalStyles.header}>

          <h3 style={{ margin: 0, fontSize: 17 }}>
            {title}
          </h3>

          <button
            onClick={onClose}
            style={modalStyles.closeBtn}
          >
            ✕
          </button>

        </div>

        <div style={modalStyles.body}>
          {children}
        </div>

      </div>

    </div>
  );
}


// ============================================================
// MODAL STYLES
// ============================================================

const modalStyles = {

  overlay: {
    position: "fixed",
    inset: 0,
    background: "rgba(0,0,0,0.55)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 1000,
  },

  box: {
    background: "#fff",
    borderRadius: 12,
    width: "min(500px, 95vw)",
    maxHeight: "90vh",
    overflowY: "auto",
    boxShadow: "0 8px 32px rgba(0,0,0,.25)",
  },

  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "16px 20px",
    borderBottom: "1px solid #e5e7eb",
  },

  body: {
    padding: "20px",
  },

  closeBtn: {
    background: "none",
    border: "none",
    fontSize: 18,
    cursor: "pointer",
    color: "#6b7280",
  },

};


// ============================================================
// FORM STYLES
// ============================================================

const fieldStyle = {

  width: "100%",
  padding: "8px 10px",
  marginBottom: 10,
  borderRadius: 6,
  border: "1px solid #d1d5db",
  fontSize: 14,
  boxSizing: "border-box",

};


const labelStyle = {

  fontSize: 12,
  color: "#374151",
  fontWeight: 600,
  display: "block",
  marginBottom: 3,

};


const submitBtnStyle = {

  width: "100%",
  padding: "10px",
  borderRadius: 6,
  border: "none",
  background: "#2563eb",
  color: "#fff",
  fontWeight: 700,
  fontSize: 15,
  cursor: "pointer",
  marginTop: 4,

};


const outlineBtnStyle = (color) => ({

  width: "calc(100% - 32px)",
  margin: "0 16px 10px",
  padding: "9px",
  borderRadius: 6,
  border: `1px solid ${color}`,
  background: "transparent",
  color,
  fontWeight: 600,
  cursor: "pointer",

});


// ============================================================
// STUDENT DASHBOARD
// ============================================================

export default function StudentDashboard() {

  // ==========================================================
  // CONFIG
  // ==========================================================

  const API_BASE =
    import.meta.env.VITE_API_BASE_URL;

  const { domain } = useParams();

  const location =
    useLocation();

  const navigate =
    useNavigate();


  // ==========================================================
  // STUDENT
  // ==========================================================

  const [student, setStudent] =
    useState({});


  // ==========================================================
  // SIDEBAR
  // ==========================================================

  const [showSidebar, setShowSidebar] =
    useState(true);


  // ==========================================================
  // PROFILE MODALS
  // ==========================================================

  const [showProfilePicModal, setShowProfilePicModal] =
    useState(false);

  const [showEditModal, setShowEditModal] =
    useState(false);


  // ==========================================================
  // OTP MODALS
  // ==========================================================

  const [showChangePasswordModal, setShowChangePasswordModal] =
    useState(false);

  const [showDeleteAccountModal, setShowDeleteAccountModal] =
    useState(false);


  // ==========================================================
  // PROFILE FORM
  // ==========================================================

  const [profilePicFile, setProfilePicFile] =
    useState(null);

  const [profilePicPreview, setProfilePicPreview] =
    useState(null);

  const [editForm, setEditForm] =
    useState({});


  // ==========================================================
  // FEEDBACK
  // ==========================================================

  const [actionMsg, setActionMsg] =
    useState("");

  const [actionErr, setActionErr] =
    useState("");


  const clearFeedback = () => {

    setActionMsg("");
    setActionErr("");

  };


  // ==========================================================
  // ERP ATTENDANCE
  // ==========================================================

  const [attendance, setAttendance] =
    useState(null);

  const [attendanceLoading, setAttendanceLoading] =
    useState(false);

  const [attendanceError, setAttendanceError] =
    useState("");


  // ==========================================================
  // ACADEMIC SESSION
  // ==========================================================

  const currentYear =
    new Date().getFullYear();

  const defaultAcademicSession =
    `${currentYear}-${currentYear + 1}`;


  const [academicSession, setAcademicSession] =
    useState(
      localStorage.getItem("academicSession") ||
      defaultAcademicSession
    );


  // ==========================================================
  // FETCH STUDENT
  // ==========================================================

  useEffect(() => {

    fetchAllData();

  }, [domain]);


  // ==========================================================
  // FETCH ATTENDANCE
  // ==========================================================

  useEffect(() => {

    if (!domain) {
      return;
    }

    fetchAttendance();

  }, [domain, academicSession]);


  // ==========================================================
  // STUDENT DATA
  // ==========================================================

  const fetchAllData = async () => {

    try {

      const res = await fetch(
        `${API_BASE}/${domain}/student`,
        {
          headers: {
            Authorization:
              `Bearer ${localStorage.getItem("token")}`,

            "Content-Type":
              "application/json",
          },
        }
      );


      if (!res.ok) {

        throw new Error(
          "Unable to load student data"
        );

      }


      const data =
        await res.json();


      setStudent(
        data || {}
      );


      /*
       * If your student API contains academicSession,
       * automatically use it.
       */

      if (data?.academicSession) {

        setAcademicSession(
          data.academicSession
        );

        localStorage.setItem(
          "academicSession",
          data.academicSession
        );

      }

    } catch (error) {

      console.error(
        "Student fetch error:",
        error
      );

      alert(
        "Session expired. Please login again."
      );

      localStorage.clear();

      navigate(
        `/${domain}/login`
      );

    }

  };


  // ==========================================================
  // AUTH HEADERS
  // ==========================================================

  const authHeaders = () => ({

    Authorization:
      `Bearer ${localStorage.getItem("token")}`,

    "Content-Type":
      "application/json",

  });


  // ==========================================================
  // ATTENDANCE
  // ==========================================================

  const fetchAttendance = async () => {

    setAttendanceLoading(true);

    setAttendanceError("");


    try {

      const query =
        new URLSearchParams({
          academicSession:
            academicSession,
        });


      const res = await fetch(

        `${API_BASE}/api/erp/attendance/student/me?${query.toString()}`,

        {
          method: "GET",

          headers: authHeaders(),

        }

      );


      if (!res.ok) {

        const errorText =
          await res.text();

        throw new Error(
          errorText ||
          "Unable to load attendance"
        );

      }


      const data =
        await res.json();


      setAttendance(
        data
      );


    } catch (error) {

      console.error(
        "Attendance error:",
        error
      );

      setAttendanceError(
        "Attendance data is currently unavailable."
      );

    } finally {

      setAttendanceLoading(false);

    }

  };


  // ==========================================================
  // ATTENDANCE CALCULATIONS
  // ==========================================================

  const calculateAttendancePercentage = () => {

    if (!attendance?.summaries?.length) {

      return null;

    }


    let totalClasses = 0;
    let totalPresent = 0;


    attendance.summaries.forEach(
      (summary) => {

        totalClasses +=
          Number(
            summary.totalClasses || 0
          );

        totalPresent +=
          Number(
            summary.present || 0
          );

      }
    );


    if (totalClasses === 0) {

      return 0;

    }


    return Math.round(
      (totalPresent / totalClasses) * 100
    );

  };


  const attendancePercentage =
    calculateAttendancePercentage();


  const totalSubjects =
    attendance?.subjects?.length ||
    attendance?.summaries?.length ||
    0;


  const totalClasses =
    attendance?.summaries?.reduce(
      (total, item) =>
        total +
        Number(item.totalClasses || 0),
      0
    ) || 0;


  const totalPresent =
    attendance?.summaries?.reduce(
      (total, item) =>
        total +
        Number(item.present || 0),
      0
    ) || 0;


  const totalAbsent =
    attendance?.summaries?.reduce(
      (total, item) =>
        total +
        Number(item.absent || 0),
      0
    ) || 0;


  // ==========================================================
  // PROFILE PICTURE
  // ==========================================================

  const handleProfilePicChange = (e) => {

    const file =
      e.target.files[0];


    if (!file) {
      return;
    }


    setProfilePicFile(
      file
    );


    setProfilePicPreview(
      URL.createObjectURL(file)
    );

  };


  const handleUpdateProfilePic = async () => {

    clearFeedback();


    if (!profilePicFile) {

      setActionErr(
        "Please select a file first."
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


      const res =
        await fetch(

          `${API_BASE}/${domain}/student/update_profile_pic`,

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
        await res.json();


      if (data.success) {

        setActionMsg(
          "Profile picture updated successfully!"
        );


        setStudent(
          prev => ({
            ...prev,
            profilePic:
              data.data,
          })
        );


        setShowProfilePicModal(
          false
        );


        setProfilePicFile(
          null
        );


        setProfilePicPreview(
          null
        );


      } else {

        setActionErr(
          data.message ||
          "Failed to update profile picture."
        );

      }


    } catch (err) {

      setActionErr(
        "Network error: " +
        err.message
      );

    }

  };


  // ==========================================================
  // EDIT PROFILE
  // ==========================================================

  const handleUpdateProfile = async () => {

    clearFeedback();


    try {

      const res =
        await fetch(

          `${API_BASE}/${domain}/student/update_profile`,

          {
            method: "PUT",

            headers:
              authHeaders(),

            body:
              JSON.stringify({
                ...student,
                ...editForm,
              }),

          }

        );


      if (res.ok) {

        setActionMsg(
          "Profile updated successfully!"
        );


        setStudent(
          prev => ({
            ...prev,
            ...editForm,
          })
        );


        setShowEditModal(
          false
        );


        fetchAllData();


      } else {

        const text =
          await res.text();


        setActionErr(
          text ||
          "Failed to update profile."
        );

      }


    } catch (err) {

      setActionErr(
        "Network error: " +
        err.message
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
  // CHANGE PASSWORD
  // ==========================================================

  const handleChangePassword =
    (newPassword) =>

      fetch(

        `${API_BASE}/${domain}/student/forgot_update_password?newpass=${encodeURIComponent(newPassword)}`,

        {
          method: "PUT",

          headers:
            authHeaders(),

        }

      );


  // ==========================================================
  // DELETE ACCOUNT
  // ==========================================================

  const handleDeleteAccount =
    async () => {

      try {

        const res =
          await fetch(

            `${API_BASE}/${domain}/student/delete_account`,

            {
              method: "DELETE",

              headers: {

                Authorization:
                  `Bearer ${localStorage.getItem("token")}`,

              },

            }

          );


        const msg =
          await res.text();


        alert(msg);


        localStorage.clear();


        navigate(
          `/${domain}/login`
        );


      } catch (error) {

        alert(
          "Unable to delete account: " +
          error.message
        );

      }

    };


  // ==========================================================
  // ROUTE
  // ==========================================================

  const isParentRoute =
    location.pathname.endsWith(
      "/dashboard"
    );


  // ==========================================================
  // USER FOR ERP LAYOUT
  // ==========================================================

  const erpUser = {

    name:
      student.name ||
      localStorage.getItem("name") ||
      "Student",

    email:
      student.email ||
      "",

    role:
      "Student",

    profilePic:
      student.profilePic ||
      null,

  };


  // ==========================================================
  // ERP MENU
  // ==========================================================

  const menu = [

    {
      label: "Dashboard",
      icon: "dashboard",
      path:
        `/${domain}/student/dashboard`,
      end: true,
    },

    {
      label: "My Attendance",
      icon: "attendance",
      path:
        `/${domain}/student/dashboard/erp-attendence`,
    },

    {
      label: "Assignments",
      icon: "reports",
      path:
        `/${domain}/student/dashboard/assignment`,
    },

    {
      label: "Tests & Quiz",
      icon: "reports",
      path:
        `/${domain}/student/dashboard/test-quize`,
    },

    {
      label: "Notes",
      icon: "reports",
      path:
        `/${domain}/student/dashboard/notes`,
    },

    {
      label: "Fees",
      icon: "reports",
      path:
        `/${domain}/student/dashboard/fees`,
    },

    {
      label: "Certification",
      icon: "reports",
      path:
        `/${domain}/student/dashboard/certification`,
    },

    {
      label: "Notepad",
      icon: "reports",
      path:
        `/${domain}/student/dashboard/notepad`,
    },

  ];


  // ==========================================================
  // ERP DASHBOARD
  // ==========================================================

  const dashboardContent = (

    <>

      {/* =====================================================
          PAGE HEADER
      ===================================================== */}

      <div className="erp-page-heading">

        <div>

          <div className="erp-welcome-text">
            Welcome back,
          </div>

          <h1>
            {student.name ||
              "Student"}
          </h1>

          <p>
            Track your academic progress,
            attendance and activities from
            one place.
          </p>

        </div>


        <div className="erp-session-selector">

          <label>
            Academic Session
          </label>

          <select
            value={academicSession}
            onChange={(e) => {

              const value =
                e.target.value;

              setAcademicSession(
                value
              );

              localStorage.setItem(
                "academicSession",
                value
              );

            }}
          >

            <option value={defaultAcademicSession}>
              {defaultAcademicSession}
            </option>

            <option value={`${currentYear - 1}-${currentYear}`}>
              {currentYear - 1}-{currentYear}
            </option>

            <option value={`${currentYear + 1}-${currentYear + 2}`}>
              {currentYear + 1}-{currentYear + 2}
            </option>

          </select>

        </div>

      </div>


      {/* =====================================================
          STUDENT QUICK INFORMATION
      ===================================================== */}

      <div className="erp-student-banner">

        <div className="erp-student-avatar">

          <img
            src={
              student.profilePic
                ? `${API_BASE}/${student.profilePic}`
                : "/default.png"
            }
            alt="Student"
          />

        </div>


        <div className="erp-student-info">

          <h2>
            {student.name ||
              "Student"}
          </h2>

          <div className="erp-student-meta">

            <span>
              Roll No:
              <strong>
                {student.rollNumber ||
                  "—"}
              </strong>
            </span>

            <span>
              Course:
              <strong>
                {student.course ||
                  "—"}
              </strong>
            </span>

            <span>
              Branch:
              <strong>
                {student.branch ||
                  "—"}
              </strong>
            </span>

            <span>
              Batch:
              <strong>
                {student.batch ||
                  student.studyBatch ||
                  "—"}
              </strong>
            </span>

          </div>

        </div>


        <button
          className="erp-profile-button"
          onClick={() => {

            clearFeedback();

            setEditForm({
              name:
                student.name,

              mobileNumber:
                student.mobileNumber,

              fatherName:
                student.fatherName,

              fatherMobNo:
                student.fatherMobNo,

              branch:
                student.branch,
            });

            setShowEditModal(
              true
            );

          }}
        >
          Edit Profile
        </button>

      </div>


      {/* =====================================================
          ERP STAT CARDS
      ===================================================== */}

      <div className="erp-stats">

        <StatCard
          type="attendance"
          label="Attendance"
          value={
            attendanceLoading
              ? "..."
              : attendancePercentage !== null
                ? `${attendancePercentage}%`
                : "—"
          }
        />


        <StatCard
          type="courses"
          label="Subjects"
          value={
            attendanceLoading
              ? "..."
              : totalSubjects
          }
        />


        <StatCard
          type="reports"
          label="Classes Attended"
          value={
            attendanceLoading
              ? "..."
              : totalPresent
          }
        />


        <StatCard
          type="reports"
          label="Classes Absent"
          value={
            attendanceLoading
              ? "..."
              : totalAbsent
          }
        />

      </div>


      {/* =====================================================
          ATTENDANCE SECTION
      ===================================================== */}

      <div className="erp-section-header">

        <div>

          <h2>
            Attendance Overview
          </h2>

          <p>
            Your attendance for{" "}
            {academicSession}
          </p>

        </div>


        <Link
          to="erp-attendence"
          className="erp-view-button"
        >
          View Full Attendance →
        </Link>

      </div>


      {attendanceError && (

        <div className="erp-alert erp-alert-warning">

          ⚠️ {attendanceError}

        </div>

      )}


      {attendanceLoading ? (

        <div className="erp-loading-card">

          <div className="erp-loader"></div>

          <span>
            Loading attendance...
          </span>

        </div>

      ) : attendance?.summaries?.length ? (

        <div className="erp-card">

          <div className="erp-table-wrapper">

            <table className="erp-table">

              <thead>

                <tr>

                  <th>
                    Subject
                  </th>

                  <th>
                    Total Classes
                  </th>

                  <th>
                    Present
                  </th>

                  <th>
                    Absent
                  </th>

                  <th>
                    Attendance
                  </th>

                </tr>

              </thead>


              <tbody>

                {attendance.summaries
                  .slice(0, 5)
                  .map(
                    (summary, index) => {

                      const percentage =
                        Number(
                          summary.percentage ||
                          0
                        );


                      return (

                        <tr
                          key={
                            `${summary.subject}-${index}`
                          }
                        >

                          <td>

                            <strong>
                              {summary.subject ||
                                "—"}
                            </strong>

                          </td>

                          <td>
                            {
                              summary.totalClasses ??
                              0
                            }
                          </td>

                          <td className="erp-present">
                            {
                              summary.present ??
                              0
                            }
                          </td>

                          <td className="erp-absent">
                            {
                              summary.absent ??
                              0
                            }
                          </td>

                          <td>

                            <div className="erp-progress-container">

                              <div className="erp-progress">

                                <div
                                  className={
                                    percentage >= 75
                                      ? "erp-progress-bar erp-progress-good"
                                      : percentage >= 60
                                        ? "erp-progress-bar erp-progress-average"
                                        : "erp-progress-bar erp-progress-danger"
                                  }
                                  style={{
                                    width:
                                      `${Math.min(
                                        Math.max(
                                          percentage,
                                          0
                                        ),
                                        100
                                      )}%`,
                                  }}
                                />

                              </div>

                              <span>
                                {percentage}%
                              </span>

                            </div>

                          </td>

                        </tr>

                      );

                    }
                  )}

              </tbody>

            </table>

          </div>

        </div>

      ) : (

        <div className="erp-empty-card">

          <div className="erp-empty-icon">
            📊
          </div>

          <h3>
            No attendance data
          </h3>

          <p>
            Attendance records for this
            academic session will appear
            here once available.
          </p>

        </div>

      )}


      {/* =====================================================
          ACADEMIC ACTIVITY
      ===================================================== */}

      <div className="erp-dashboard-grid">


        {/* ===================================================
            QUICK ACTIONS
        =================================================== */}

        <div className="erp-card">

          <div className="erp-card-heading">

            <div>

              <h3>
                Academic Modules
              </h3>

              <p>
                Quickly access your ERP modules.
              </p>

            </div>

          </div>


          <div className="erp-module-grid">

            <Link
              to="assignment"
              className="erp-module-card"
            >

              <span className="erp-module-icon">
                📝
              </span>

              <span>
                Assignments
              </span>

            </Link>


            <Link
              to="test-quize"
              className="erp-module-card"
            >

              <span className="erp-module-icon">
                🧪
              </span>

              <span>
                Tests & Quiz
              </span>

            </Link>


            <Link
              to="notes"
              className="erp-module-card"
            >

              <span className="erp-module-icon">
                📚
              </span>

              <span>
                Notes
              </span>

            </Link>


            <Link
              to="fees"
              className="erp-module-card"
            >

              <span className="erp-module-icon">
                💳
              </span>

              <span>
                Fees
              </span>

            </Link>


            <Link
              to="certification"
              className="erp-module-card"
            >

              <span className="erp-module-icon">
                🎓
              </span>

              <span>
                Certification
              </span>

            </Link>


            <Link
              to="notepad"
              className="erp-module-card"
            >

              <span className="erp-module-icon">
                📒
              </span>

              <span>
                Notepad
              </span>

            </Link>

          </div>

        </div>


        {/* ===================================================
            LAST 7 DAYS
        =================================================== */}

        <div className="erp-card">

          <div className="erp-card-heading">

            <div>

              <h3>
                Recent Attendance
              </h3>

              <p>
                Last 7 attendance records.
              </p>

            </div>

          </div>


          {attendance?.last7Days?.length ? (

            <div className="erp-recent-list">

              {attendance.last7Days
                .slice(0, 7)
                .map(
                  (day, index) => (

                    <div
                      className="erp-recent-item"
                      key={
                        `${day.date}-${index}`
                      }
                    >

                      <div>

                        <strong>
                          {day.subject ||
                            "Subject"}
                        </strong>

                        <small>
                          {day.date}
                          {" • "}
                          Period{" "}
                          {day.periodNumber ??
                            "—"}
                        </small>

                      </div>


                      <span
                        className={
                          String(
                            day.status
                          ).toUpperCase() ===
                          "PRESENT"
                            ? "erp-status-present"
                            : "erp-status-absent"
                        }
                      >

                        {day.status ||
                          "—"}

                      </span>

                    </div>

                  )
                )}

            </div>

          ) : (

            <div className="erp-mini-empty">

              No recent attendance
              available.

            </div>

          )}

        </div>

      </div>


      {/* =====================================================
          PROFILE INFORMATION
      ===================================================== */}

      <div className="erp-card erp-account-card">

        <div className="erp-card-heading">

          <div>

            <h3>
              Account Information
            </h3>

            <p>
              Your current student account
              details.
            </p>

          </div>

        </div>


        <div className="erp-account-grid">

          <div>

            <span>
              Email
            </span>

            <strong>
              {student.email ||
                "—"}
            </strong>

          </div>


          <div>

            <span>
              Mobile
            </span>

            <strong>
              {student.mobileNumber ||
                "—"}
            </strong>

          </div>


          <div>

            <span>
              Father Name
            </span>

            <strong>
              {student.fatherName ||
                "—"}
            </strong>

          </div>


          <div>

            <span>
              Father Mobile
            </span>

            <strong>
              {student.fatherMobNo ||
                "—"}
            </strong>

          </div>


          <div>

            <span>
              Last Login
            </span>

            <strong>
              {student.lastLoginDateTime
                ? FormatDate(
                    student.lastLoginDateTime
                  )
                : "—"}
            </strong>

          </div>


          <div>

            <span>
              Account Created
            </span>

            <strong>
              {student.createdDateTime
                ? FormatDate(
                    student.createdDateTime
                  )
                : "—"}
            </strong>

          </div>

        </div>

      </div>

    </>

  );


  // ==========================================================
  // RETURN
  // ==========================================================

  return (

    <ERPLayout
      role="Student"
      user={erpUser}
      menu={menu}
      onLogout={handleLogout}
    >

      {isParentRoute ? (

        dashboardContent

      ) : (

        <div className="sub-page-container">

          <button
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


      {/* =====================================================
          PROFILE PICTURE MODAL
      ===================================================== */}

      {showProfilePicModal && (

        <Modal
          title="Update Profile Picture"
          onClose={() => {

            setShowProfilePicModal(
              false
            );

            clearFeedback();

          }}
        >

          <div
            style={{
              textAlign: "center",
              marginBottom: 16,
            }}
          >

            <img
              src={
                profilePicPreview ||
                (
                  student.profilePic
                    ? `${API_BASE}/${student.profilePic}`
                    : "/default.png"
                )
              }
              alt="Preview"
              style={{
                width: 110,
                height: 110,
                borderRadius: "50%",
                objectFit: "cover",
                border:
                  "3px solid #e5e7eb",
              }}
            />

          </div>


          <label style={labelStyle}>
            Choose New Profile Picture
          </label>


          <input
            type="file"
            accept="image/*"
            onChange={
              handleProfilePicChange
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
            style={submitBtnStyle}
            onClick={
              handleUpdateProfilePic
            }
          >
            Upload &amp; Save
          </button>

        </Modal>

      )}


      {/* =====================================================
          EDIT PROFILE MODAL
      ===================================================== */}

      {showEditModal && (

        <Modal
          title="Edit Profile"
          onClose={() => {

            setShowEditModal(
              false
            );

            clearFeedback();

          }}
        >

          {[

            {
              key: "name",
              label: "Full Name",
              type: "text",
            },

            {
              key: "mobileNumber",
              label: "Mobile Number",
              type: "text",
            },

            {
              key: "fatherName",
              label: "Father Name",
              type: "text",
            },

            {
              key: "fatherMobNo",
              label: "Father Mobile",
              type: "text",
            },

            {
              key: "branch",
              label: "Branch",
              type: "text",
            },

          ].map(
            (field) => (

              <div
                key={field.key}
              >

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
                    editForm[
                      field.key
                    ] || ""
                  }
                  onChange={(e) =>
                    setEditForm(
                      (prev) => ({
                        ...prev,
                        [field.key]:
                          e.target.value,
                      })
                    )
                  }
                  style={
                    fieldStyle
                  }
                />

              </div>

            )
          )}


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
            style={submitBtnStyle}
            onClick={
              handleUpdateProfile
            }
          >
            Save Changes
          </button>

        </Modal>

      )}


      {/* =====================================================
          OTP CHANGE PASSWORD
      ===================================================== */}

      {showChangePasswordModal && (

        <ChangePasswordModal
          email={
            student.email
          }

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

      )}


      {/* =====================================================
          OTP DELETE ACCOUNT
      ===================================================== */}

      {showDeleteAccountModal && (

        <DeleteAccountModal
          name={
            student.name
          }

          email={
            student.email
          }

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

    </ERPLayout>

  );

}
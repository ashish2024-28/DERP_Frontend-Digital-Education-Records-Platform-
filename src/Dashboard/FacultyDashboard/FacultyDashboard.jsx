import { useEffect, useState } from "react";
import { Link, useParams, Outlet, useNavigate, useLocation } from "react-router-dom";

import "../Common/css/common.css";
import "./FacultyDashboard.css";

import FormatDate from "../../Components/DateTimeFunction/FormatDate";
import ChangePasswordModal from "../../Components/Auth/ChangePasswordModal";
import DeleteAccountModal from "../../Components/Auth/DeleteAccountModal";

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

// ============================================================
// MODAL STYLES
// ============================================================
const modalStyles = {
    overlay: { position: "fixed", inset: 0, background: "rgba(0,0,0,0.55)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000 },
    box: { background: "#fff", borderRadius: 12, width: "min(500px, 95vw)", maxHeight: "90vh", overflowY: "auto", boxShadow: "0 8px 32px rgba(0,0,0,.25)" },
    header: { display: "flex", justifyContent: "space-between", alignItems: "center", padding: "16px 20px", borderBottom: "1px solid #e5e7eb" },
    body: { padding: "20px" },
    closeBtn: { background: "none", border: "none", fontSize: 18, cursor: "pointer", color: "#6b7280" },
};

const fieldStyle = { width: "100%", padding: "8px 10px", marginBottom: 10, borderRadius: 6, border: "1px solid #d1d5db", fontSize: 14, boxSizing: "border-box" };
const labelStyle = { fontSize: 12, color: "#374151", fontWeight: 600, display: "block", marginBottom: 3 };
const submitBtnStyle = { width: "100%", padding: "10px", borderRadius: 6, border: "none", background: "#2563eb", color: "#fff", fontWeight: 700, fontSize: 15, cursor: "pointer", marginTop: 4 };
const outlineBtnStyle = (color) => ({ width: "calc(100% - 32px)", margin: "0 16px 10px", padding: "9px", borderRadius: 6, border: `1px solid ${color}`, background: "transparent", color, fontWeight: 600, cursor: "pointer" });

// ─────────────────────────────────────────────
// Faculty Dashboard
// ─────────────────────────────────────────────
export default function FacultyDashboard() {
    const API_BASE = import.meta.env.VITE_API_BASE_URL;
    const { domain } = useParams();
    const location = useLocation();
    const navigate = useNavigate();

    const [faculty, setFaculty] = useState({});
    const [students, setStudents] = useState([]);
    const [showSidebar, setShowSidebar] = useState(true);

    // Modal visibility
    const [showProfilePicModal, setShowProfilePicModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    // ── NEW: OTP-guarded modals ──
    const [showChangePasswordModal, setShowChangePasswordModal] = useState(false);
    const [showDeleteAccountModal, setShowDeleteAccountModal] = useState(false);

    // Form states
    const [profilePicFile, setProfilePicFile] = useState(null);
    const [profilePicPreview, setProfilePicPreview] = useState(null);
    const [editForm, setEditForm] = useState({});

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
            const res = await fetch(`${API_BASE}/${domain}/faculty/update_profile_pic`, {
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

                        <p><strong>Faculty ID:</strong>                   {faculty.facultyId}</p>
                        <p><strong>Name:</strong>                         {faculty.name}</p>
                        <p><strong>Email:</strong>                        {faculty.email}</p>
                        <p><strong>Mobile:</strong>                       {faculty.mobileNumber}</p>
                        <p><strong>Course:</strong>                       {faculty.course}</p>

                        <div className="profile-row teaching-assignment-row">
                            <strong className="profile-label">
                                Teaching Assignments:
                            </strong>

                            <div className="teaching-assignments-list">
                                {faculty.teachingAssignments
                                    ?.split(";")
                                    .map((assignment) => assignment.trim())
                                    .filter(Boolean)
                                    .map((assignment, index) => {
                                        const [batch, subjects] = assignment.split(":", 2);

                                        return (
                                            <div
                                                key={`${batch}-${index}`}
                                                className="teaching-assignment-item"
                                            >
                                                <span className="assignment-batch">
                                                    {batch?.trim() || "-"}
                                                </span>

                                                <span className="assignment-arrow">
                                                    →
                                                </span>

                                                <span className="assignment-subjects">
                                                    {subjects
                                                        ?.split(",")
                                                        .map((subject) => subject.trim())
                                                        .filter(Boolean)
                                                        .join(", ") || "-"}
                                                </span>
                                            </div>
                                        );
                                    })}

                                {!faculty.teachingAssignments?.trim() && (
                                    <span className="assignment-empty">
                                        No teaching assignments
                                    </span>
                                )}
                            </div>
                        </div>


                        <p><strong>Account Created:</strong>{FormatDate(faculty.createdDateTime)}</p>
                        <p><strong>Updated At:</strong>{FormatDate(faculty.lastUpdateDateTime)}</p>
                        <p><strong>Last Login:</strong>     {FormatDate(faculty.lastLoginDateTime)}</p>
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

            {/* ─────────────────────────────────────── */}
            {/* Main Content */}
            {/* ─────────────────────────────────────── */}



            {/* Success message */}
            <div className="main-content">
                <div className="domain-admin-topbar">
                    <div className="domain-admin-topbar-title">
                        <div className="domain-admin-brand-mark">FA</div>
                        <div>
                            <span className="domain-admin-eyebrow">FACULTY CONSOLE</span>
                            <h1>{faculty.universityName || "Faculty Administration"}</h1>
                            <p>Manage Students, access, profiles and erp attendence records</p>
                        </div>
                    </div>

                </div>

                {/* Success message */}

                {actionMsg && (
                    <div style={{ background: "#d1fae5", border: "1px solid #6ee7b7", color: "#065f46", borderRadius: 8, padding: "10px 16px", marginBottom: 12, display: "flex", justifyContent: "space-between" }}>
                        <span>✅ {actionMsg} </span>
                        <span style={{ cursor: "pointer", fontWeight: 700 }} onClick={() => setActionMsg("")}>✕</span>
                    </div>
                )}

                {/* Error message */}
                {actionErr && (
                    <div style={{ background: "#fee2e2", border: "1px solid #fca5a5", color: "#991b1b", borderRadius: 8, padding: "10px 16px", marginBottom: 12, display: "flex", justifyContent: "space-between", gap: 12, }} >
                        <span> ❌ {actionErr} </span>
                        <span style={{ cursor: "pointer", fontWeight: 700, }} onClick={() => setActionErr("")} >  ✕ </span>
                    </div>
                )}

                {/* ───────────────────────────────────── */}
                {/* Parent Dashboard */}
                {/* ───────────────────────────────────── */}

                {isParentRoute ? (
                    /* Dashboard cards */

                    <div className="card-grid">
                        <Link className="main-content-Link" to={"all-students"} state={{ students }}><div className="card">All Students: {students.length}</div></Link>
                        <Link className="main-content-Link" to={"notepad"}><div className="card">Notepad</div></Link>
                        <Link className="main-content-Link" to={"faculty-erp-attendence"}><div className="card">ERP / Attendance</div></Link>
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
                        { key: "name", label: "Full Name", type: "text" },
                        { key: "mobileNumber", label: "Mobile Number", type: "text" },
                        { key: "course", label: "Course", type: "text" },
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
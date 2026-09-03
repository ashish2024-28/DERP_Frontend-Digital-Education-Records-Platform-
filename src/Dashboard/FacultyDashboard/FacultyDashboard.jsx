import {
    useEffect,
    useState
} from "react";

import {
    Outlet,
    useLocation,
    useNavigate,
    useParams
} from "react-router-dom";

import "../Common/css/common.css";
import "./FacultyDashboard.css";

import FormatDate
    from "../../Components/DateTimeFunction/FormatDate";

import ChangePasswordModal
    from "../../Components/Auth/ChangePasswordModal";

import DeleteAccountModal
    from "../../Components/Auth/DeleteAccountModal";

import ERPLayout
    from "../../Components/ERP/ERPLayout";

import StatCard
    from "../../Components/ERP/StatCard";


export default function FacultyDashboard() {

    const API_BASE =
        import.meta.env.VITE_API_BASE_URL;

    const { domain } = useParams();

    const location =
        useLocation();

    const navigate =
        useNavigate();


    // =====================================================
    // FACULTY DATA
    // =====================================================

    const [faculty, setFaculty] =
        useState({});

    const [students, setStudents] =
        useState([]);


    // =====================================================
    // UI
    // =====================================================

    const [
        showProfilePicModal,
        setShowProfilePicModal
    ] = useState(false);


    const [
        showEditModal,
        setShowEditModal
    ] = useState(false);


    const [
        showChangePasswordModal,
        setShowChangePasswordModal
    ] = useState(false);


    const [
        showDeleteAccountModal,
        setShowDeleteAccountModal
    ] = useState(false);


    // =====================================================
    // PROFILE IMAGE
    // =====================================================

    const [
        profilePicFile,
        setProfilePicFile
    ] = useState(null);


    const [
        profilePicPreview,
        setProfilePicPreview
    ] = useState(null);


    // =====================================================
    // EDIT PROFILE
    // =====================================================

    const [
        editForm,
        setEditForm
    ] = useState({});


    // =====================================================
    // FEEDBACK
    // =====================================================

    const [
        actionMsg,
        setActionMsg
    ] = useState("");


    const [
        actionErr,
        setActionErr
    ] = useState("");


    const clearFeedback = () => {

        setActionMsg("");
        setActionErr("");

    };


    // =====================================================
    // FETCH DATA
    // =====================================================

    useEffect(() => {

        fetchAllData();

    }, [domain]);


    const fetchAllData = async () => {

        try {

            const token =
                localStorage.getItem("token");


            if (!token) {

                // navigate(
                //     `/${domain}/login`
                // );

                return;

            }


            const headers = {

                Authorization:
                    `Bearer ${token}`,

                "Content-Type":
                    "application/json"

            };


            const [
                facultyRes,
                studentRes
            ] = await Promise.all([

                fetch(
                    `${API_BASE}/${domain}/faculty`,
                    {
                        headers
                    }
                ),

                fetch(
                    `${API_BASE}/${domain}/faculty/all_student`,
                    {
                        headers
                    }
                )

            ]);


            if (
                facultyRes.status === 401 ||
                facultyRes.status === 403
            ) {

                throw new Error(
                    "SESSION_EXPIRED"
                );

            }


            const facultyData =
                await facultyRes.json();


            const studentData =
                await studentRes.json();


            setFaculty(
                facultyData || {}
            );


            setStudents(
                studentData?.data || []
            );


        } catch (error) {

            console.error(
                "Faculty dashboard error:",
                error
            );


            if (
                error.message ===
                "SESSION_EXPIRED"
            ) {

                alert(
                    "Session expired. Please login again."
                );

                localStorage.clear();

                // navigate(
                //     `/${domain}/login`
                // );

            }

        }

    };


    // =====================================================
    // AUTH HEADERS
    // =====================================================

    const authHeaders = () => ({

        Authorization:
            `Bearer ${localStorage.getItem("token")}`,

        "Content-Type":
            "application/json"

    });


    // =====================================================
    // PROFILE PICTURE
    // =====================================================

    const handleProfilePicChange = (event) => {

        const file =
            event.target.files?.[0];


        if (!file) return;


        if (
            !file.type.startsWith("image/")
        ) {

            setActionErr(
                "Please select an image file."
            );

            return;

        }


        if (
            file.size >
            5 * 1024 * 1024
        ) {

            setActionErr(
                "Image must be smaller than 5 MB."
            );

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


                const response =
                    await fetch(
                        `${API_BASE}/${domain}/faculty/update_profile_pic`,
                        {
                            method: "PUT",

                            headers: {
                                Authorization:
                                    `Bearer ${localStorage.getItem("token")}`
                            },

                            body: formData
                        }
                    );


                const data =
                    await response.json();


                if (!response.ok) {

                    throw new Error(
                        data?.message ||
                        "Failed to update profile picture."
                    );

                }


                setFaculty(
                    previous => ({
                        ...previous,
                        profilePic:
                            data.data
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


                setActionMsg(
                    "Profile picture updated successfully."
                );


            } catch (error) {

                setActionErr(
                    error.message
                );

            }

        };


    // =====================================================
    // EDIT PROFILE
    // =====================================================

    const openEditProfile = () => {

        clearFeedback();


        setEditForm({

            name:
                faculty.name || "",

            mobileNumber:
                faculty.mobileNumber || "",

            course:
                faculty.course || "",

            teachingBatch:
                faculty.teachingBatch || ""

        });


        setShowEditModal(
            true
        );

    };


    const handleUpdateProfile =
        async () => {

            clearFeedback();


            try {

                const response =
                    await fetch(
                        `${API_BASE}/${domain}/faculty/update_profile`,
                        {
                            method: "PUT",

                            headers:
                                authHeaders(),

                            body:
                                JSON.stringify({
                                    ...faculty,
                                    ...editForm
                                })
                        }
                    );


                if (!response.ok) {

                    const text =
                        await response.text();

                    throw new Error(
                        text ||
                        "Failed to update profile."
                    );

                }


                setFaculty(
                    previous => ({
                        ...previous,
                        ...editForm
                    })
                );


                setShowEditModal(
                    false
                );


                setActionMsg(
                    "Profile updated successfully."
                );


                fetchAllData();


            } catch (error) {

                setActionErr(
                    error.message
                );

            }

        };


    // =====================================================
    // CHANGE PASSWORD
    // =====================================================

    const handleChangePassword =
        async (newPassword) => {

            return fetch(
                `${API_BASE}/${domain}/faculty/update_faculty_password?newpass=${encodeURIComponent(
                    newPassword
                )}`,
                {
                    method: "PUT",
                    headers: authHeaders()
                }
            );

        };


    // =====================================================
    // DELETE ACCOUNT
    // =====================================================

    const handleDeleteAccount =
        async () => {

            const response =
                await fetch(
                    `${API_BASE}/${domain}/faculty/delete_account`,
                    {
                        method: "DELETE",

                        headers: {
                            Authorization:
                                `Bearer ${localStorage.getItem("token")}`
                        }
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


            navigate(
                `/${domain}/login`
            );

        };


    // =====================================================
    // LOGOUT
    // =====================================================

    const handleLogout = () => {

        localStorage.clear();

        navigate(
            `/${domain}/login`
        );

    };


    // =====================================================
    // PROFILE IMAGE URL
    // =====================================================

    const profileImage =
        faculty.profilePic
            ? `${API_BASE}/${faculty.profilePic}`
            : "/default.png";


    // =====================================================
    // ERP MENU
    // =====================================================

    const menu = [

        {
            label: "Dashboard",
            icon: "dashboard",
            path:
                `/${domain}/faculty/dashboard`,
            end: true
        },

        {
            label: "My Students",
            icon: "students",
            path:
                `/${domain}/faculty/dashboard/all-students`
        },

        {
            label: "Attendance",
            icon: "attendance",
            path:
                `/${domain}/faculty/dashboard/erp-attendence`
        },

        {
            label: "Assignments",
            icon: "assignments",
            path:
                `/${domain}/faculty/dashboard/assignment`
        },

        {
            label: "Tests & Quiz",
            icon: "tests",
            path:
                `/${domain}/faculty/dashboard/test-quize`
        },

        {
            label: "Notes",
            icon: "notes",
            path:
                `/${domain}/faculty/dashboard/notes`
        },

        {
            label: "Notepad",
            icon: "notepad",
            path:
                `/${domain}/faculty/dashboard/notepad`
        }

    ];


    // =====================================================
    // PARENT DASHBOARD
    // =====================================================

    const isDashboard =
        location.pathname ===
        `/${domain}/faculty/dashboard`;


    return (

        <ERPLayout

            role="Faculty"

            user={{
                name:
                    faculty.name ||
                    "Faculty"
            }}

            profileImage={
                profileImage
            }

            menu={
                menu
            }

            onLogout={
                handleLogout
            }

        >

            {/* =================================================
                FEEDBACK
            ================================================= */}

            {actionMsg && (

                <div
                    style={{
                        background: "#d1fae5",
                        border: "1px solid #6ee7b7",
                        color: "#065f46",
                        borderRadius: 8,
                        padding: "10px 16px",
                        marginBottom: 18
                    }}
                >
                    ✅ {actionMsg}
                </div>

            )}


            {actionErr && (

                <div
                    style={{
                        background: "#fee2e2",
                        border: "1px solid #fca5a5",
                        color: "#991b1b",
                        borderRadius: 8,
                        padding: "10px 16px",
                        marginBottom: 18
                    }}
                >
                    ❌ {actionErr}
                </div>

            )}


            {/* =================================================
                MAIN DASHBOARD
            ================================================= */}

            {isDashboard ? (

                <>

                    <div className="erp-page-heading">

                        <h1>
                            Welcome back,{" "}
                            {faculty.name ||
                                "Faculty"} 👋
                        </h1>

                        <p>
                            Manage your students,
                            classes, attendance and
                            academic activities.
                        </p>

                    </div>


                    {/* =================================================
                        STATS
                    ================================================= */}

                    <div className="erp-stats">

                        <StatCard
                            type="students"
                            label="My Students"
                            value={
                                students.length
                            }
                            subtitle="Students assigned"
                        />


                        <StatCard
                            type="courses"
                            label="Teaching Batch"
                            value={
                                faculty.teachingBatch ||
                                "—"
                            }
                            subtitle="Current batch"
                        />


                        <StatCard
                            type="attendance"
                            label="Attendance"
                            value="—"
                            subtitle="Today's attendance"
                        />


                        <StatCard
                            type="assignments"
                            label="Assignments"
                            value="—"
                            subtitle="Academic work"
                        />

                    </div>


                    {/* =================================================
                        INFORMATION CARDS
                    ================================================= */}

                    <div className="erp-grid">


                        <div className="erp-card">

                            <h3>
                                Faculty Information
                            </h3>

                            <div
                                style={{
                                    display:
                                        "grid",

                                    gridTemplateColumns:
                                        "repeat(2, 1fr)",

                                    gap: 15,

                                    marginTop: 18
                                }}
                            >

                                <div>

                                    <small>
                                        Faculty ID
                                    </small>

                                    <strong
                                        style={{
                                            display:
                                                "block",
                                            marginTop: 4
                                        }}
                                    >
                                        {
                                            faculty.facultyId ||
                                            "—"
                                        }
                                    </strong>

                                </div>


                                <div>

                                    <small>
                                        Course
                                    </small>

                                    <strong
                                        style={{
                                            display:
                                                "block",
                                            marginTop: 4
                                        }}
                                    >
                                        {
                                            faculty.course ||
                                            "—"
                                        }
                                    </strong>

                                </div>


                                <div>

                                    <small>
                                        Email
                                    </small>

                                    <strong
                                        style={{
                                            display:
                                                "block",
                                            marginTop: 4,
                                            wordBreak:
                                                "break-word"
                                        }}
                                    >
                                        {
                                            faculty.email ||
                                            "—"
                                        }
                                    </strong>

                                </div>


                                <div>

                                    <small>
                                        Last Login
                                    </small>

                                    <strong
                                        style={{
                                            display:
                                                "block",
                                            marginTop: 4
                                        }}
                                    >
                                        {
                                            FormatDate(
                                                faculty.lastLoginDateTime
                                            )
                                        }
                                    </strong>

                                </div>

                            </div>

                        </div>


                        <div className="erp-card">

                            <h3>
                                Quick Actions
                            </h3>

                            <p
                                style={{
                                    marginBottom: 18
                                }}
                            >
                                Quickly access your
                                most frequently used
                                academic tools.
                            </p>


                            <div
                                style={{
                                    display:
                                        "grid",
                                    gridTemplateColumns:
                                        "repeat(2, 1fr)",
                                    gap: 10
                                }}
                            >

                                <button
                                    onClick={() =>
                                        navigate(
                                            `/${domain}/faculty/dashboard/erp-attendence`
                                        )
                                    }
                                    style={{
                                        padding: 12,
                                        borderRadius: 9,
                                        border:
                                            "1px solid #dbeafe",
                                        background:
                                            "#eff6ff",
                                        cursor:
                                            "pointer"
                                    }}
                                >
                                    ✓ Mark Attendance
                                </button>


                                <button
                                    onClick={() =>
                                        navigate(
                                            `/${domain}/faculty/dashboard/all-students`
                                        )
                                    }
                                    style={{
                                        padding: 12,
                                        borderRadius: 9,
                                        border:
                                            "1px solid #e5e7eb",
                                        background:
                                            "white",
                                        cursor:
                                            "pointer"
                                    }}
                                >
                                    👨‍🎓 View Students
                                </button>


                                <button
                                    onClick={() =>
                                        navigate(
                                            `/${domain}/faculty/dashboard/assignment`
                                        )
                                    }
                                    style={{
                                        padding: 12,
                                        borderRadius: 9,
                                        border:
                                            "1px solid #e5e7eb",
                                        background:
                                            "white",
                                        cursor:
                                            "pointer"
                                    }}
                                >
                                    📝 Assignment
                                </button>


                                <button
                                    onClick={() =>
                                        navigate(
                                            `/${domain}/faculty/dashboard/notes`
                                        )
                                    }
                                    style={{
                                        padding: 12,
                                        borderRadius: 9,
                                        border:
                                            "1px solid #e5e7eb",
                                        background:
                                            "white",
                                        cursor:
                                            "pointer"
                                    }}
                                >
                                    📚 Notes
                                </button>

                            </div>

                        </div>

                    </div>


                    {/* =================================================
                        ACCOUNT CARD
                    ================================================= */}

                    <div
                        className="erp-card"
                        style={{
                            marginTop: 18
                        }}
                    >

                        <h3>
                            Account
                        </h3>

                        <p>
                            Manage your faculty
                            account settings.
                        </p>


                        <div
                            style={{
                                display:
                                    "flex",
                                gap: 10,
                                flexWrap:
                                    "wrap",
                                marginTop: 18
                            }}
                        >

                            <button
                                onClick={
                                    openEditProfile
                                }
                                style={{
                                    padding:
                                        "9px 15px",
                                    borderRadius:
                                        8,
                                    border:
                                        "1px solid #2563eb",
                                    background:
                                        "white",
                                    color:
                                        "#2563eb",
                                    cursor:
                                        "pointer"
                                }}
                            >
                                ✎ Edit Profile
                            </button>


                            <button
                                onClick={() => {

                                    clearFeedback();

                                    setShowChangePasswordModal(
                                        true
                                    );

                                }}
                                style={{
                                    padding:
                                        "9px 15px",
                                    borderRadius:
                                        8,
                                    border:
                                        "1px solid #7c3aed",
                                    background:
                                        "white",
                                    color:
                                        "#7c3aed",
                                    cursor:
                                        "pointer"
                                }}
                            >
                                🔑 Change Password
                            </button>

                        </div>

                    </div>

                </>

            ) : (

                /* =================================================
                   CHILD PAGE
                ================================================= */

                <div>

                    <button
                        onClick={() =>
                            navigate(
                                `/${domain}/faculty/dashboard`
                            )
                        }
                        style={{
                            border: "none",
                            background:
                                "transparent",
                            color:
                                "#2563eb",
                            cursor:
                                "pointer",
                            marginBottom:
                                15,
                            fontWeight:
                                600
                        }}
                    >
                        ← Dashboard
                    </button>


                    <Outlet />

                </div>

            )}


            {/* =====================================================
                PROFILE PICTURE MODAL
            ===================================================== */}

            {showProfilePicModal && (

                <div className="faculty-modal-overlay">

                    <div className="faculty-modal">

                        <div className="faculty-modal-header">

                            <h3>
                                Update Profile Picture
                            </h3>

                            <button
                                onClick={() =>
                                    setShowProfilePicModal(
                                        false
                                    )
                                }
                            >
                                ×
                            </button>

                        </div>


                        <div className="faculty-modal-body">

                            <div
                                style={{
                                    textAlign:
                                        "center",
                                    marginBottom:
                                        18
                                }}
                            >

                                <img
                                    src={
                                        profilePicPreview ||
                                        profileImage
                                    }
                                    alt="Preview"
                                    style={{
                                        width: 110,
                                        height: 110,
                                        borderRadius:
                                            "50%",
                                        objectFit:
                                            "cover",
                                        border:
                                            "3px solid #e5e7eb"
                                    }}
                                />

                            </div>


                            <label>
                                Choose New Profile Picture
                            </label>

                            <input
                                type="file"
                                accept="image/*"
                                onChange={
                                    handleProfilePicChange
                                }
                            />


                            <button
                                className="faculty-primary-button"
                                onClick={
                                    handleUpdateProfilePic
                                }
                            >
                                Upload & Save
                            </button>

                        </div>

                    </div>

                </div>

            )}


            {/* =====================================================
                EDIT PROFILE MODAL
            ===================================================== */}

            {showEditModal && (

                <div className="faculty-modal-overlay">

                    <div className="faculty-modal">

                        <div className="faculty-modal-header">

                            <h3>
                                Edit Profile
                            </h3>

                            <button
                                onClick={() =>
                                    setShowEditModal(
                                        false
                                    )
                                }
                            >
                                ×
                            </button>

                        </div>


                        <div className="faculty-modal-body">

                            {[
                                {
                                    key: "name",
                                    label: "Full Name"
                                },
                                {
                                    key: "mobileNumber",
                                    label: "Mobile Number"
                                },
                                {
                                    key: "course",
                                    label: "Course"
                                },
                                {
                                    key: "teachingBatch",
                                    label: "Teaching Batch"
                                }
                            ].map(
                                field => (

                                    <div
                                        key={
                                            field.key
                                        }
                                        style={{
                                            marginBottom:
                                                12
                                        }}
                                    >

                                        <label>
                                            {
                                                field.label
                                            }
                                        </label>

                                        <input
                                            type="text"
                                            value={
                                                editForm[
                                                    field.key
                                                ] || ""
                                            }
                                            onChange={
                                                event =>
                                                    setEditForm(
                                                        previous => ({
                                                            ...previous,
                                                            [field.key]:
                                                                event
                                                                    .target
                                                                    .value
                                                        })
                                                    )
                                            }
                                        />

                                    </div>

                                )
                            )}


                            <button
                                className="faculty-primary-button"
                                onClick={
                                    handleUpdateProfile
                                }
                            >
                                Save Changes
                            </button>

                        </div>

                    </div>

                </div>

            )}


            {/* =====================================================
                OTP CHANGE PASSWORD
            ===================================================== */}

            {showChangePasswordModal && (

                <ChangePasswordModal

                    email={
                        faculty.email
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
                            "Password updated successfully."
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
                        faculty.name
                    }

                    email={
                        faculty.email
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
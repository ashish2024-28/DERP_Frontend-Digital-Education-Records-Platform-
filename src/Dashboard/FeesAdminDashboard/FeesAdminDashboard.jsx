import { useEffect, useMemo, useState } from "react";
import { Outlet,  useLocation,  useNavigate,  useParams,} from "react-router-dom";
import "../Common/css/common.css";
import "./FeesAdminDashboard.css";
import FormatDate from "../../Components/DateTimeFunction/FormatDate";
import ChangePasswordModal from "../../Components/Auth/ChangePasswordModal";
import DeleteAccountModal from "../../Components/Auth/DeleteAccountModal";

/*
 * Fees Admin Dashboard
 * ---------------------------------------------------------
 * APIs are taken directly from FeesAdminController:
 *
 * GET    /{domain}/feesAdmin
 * PUT    /{domain}/feesAdmin/update_profile
 * PUT    /{domain}/feesAdmin/forgot_update_password
 * DELETE /{domain}/feesAdmin/delete_account
 * GET    /{domain}/feesAdmin/all_student
 * GET    /{domain}/feesAdmin/all_faculty
 *
 * There is no fees-specific CRUD endpoint in the supplied
 * FeesAdminController, so this dashboard does not invent one.
 */

export default function FeesAdminDashboard() {
  const API_BASE =
    import.meta.env.VITE_API_BASE_URL?.replace(/\/+$/, "");

  const { domain } = useParams();
  const navigate = useNavigate();
  const location = useLocation();

  const [feesAdmin, setFeesAdmin] = useState({});
  const [students, setStudents] = useState([]);
  const [faculty, setFaculty] = useState([]);

  const [loading, setLoading] = useState(true);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showChangePasswordModal, setShowChangePasswordModal] = useState(false);
  const [showDeleteAccountModal, setShowDeleteAccountModal] = useState(false);

  const [editForm, setEditForm] = useState({});
  const [search, setSearch] = useState("");

  const [actionMsg, setActionMsg] = useState("");
  const [actionErr, setActionErr] = useState("");

  const clearFeedback = () => {
    setActionMsg("");
    setActionErr("");
  };

  const authHeaders = () => ({
    Authorization: `Bearer ${localStorage.getItem("token")}`,
    "Content-Type": "application/json",
  });

  /*
   * Read JSON safely. Spring can sometimes return plain text
   * for older endpoints, so we support both JSON and text.
   */
  const readResponse = async (response) => {
    const text = await response.text();

    if (!text) return {};

    try {
      return JSON.parse(text);
    } catch {
      return { message: text };
    }
  };

  /*
   * Load Fees Admin profile + students + faculty.
   * The controller exposes these three read operations.
   */
  const fetchAllData = async () => {
    setLoading(true);
    clearFeedback();

    try {
      const [profileRes, studentRes, facultyRes] =
        await Promise.all([
          fetch(`${API_BASE}/${domain}/feesAdmin`, {
            headers: authHeaders(),
          }),

          fetch(`${API_BASE}/${domain}/feesAdmin/all_student`, {
            headers: authHeaders(),
          }),

          fetch(`${API_BASE}/${domain}/feesAdmin/all_faculty`, {
            headers: authHeaders(),
          }),
        ]);

      const profileData = await readResponse(profileRes);
      const studentData = await readResponse(studentRes);
      const facultyData = await readResponse(facultyRes);

      if (!profileRes.ok) {
        throw new Error(
          profileData?.message || "Unable to load Fees Admin profile."
        );
      }

      /*
       * Profile endpoint returns the FeesAdmin object directly.
       */
      setFeesAdmin(profileData?.data || profileData || {});

      /*
       * all_student / all_faculty are wrapped in ApiResponse,
       * therefore data is normally inside .data.
       */
      const studentList = Array.isArray(studentData?.data)
        ? studentData.data
        : Array.isArray(studentData)
          ? studentData
          : [];

      const facultyList = Array.isArray(facultyData?.data)
        ? facultyData.data
        : Array.isArray(facultyData)
          ? facultyData
          : [];

      setStudents(studentList);
      setFaculty(facultyList);
    } catch (error) {
      console.error("Fees Admin dashboard error:", error);
      setActionErr(error?.message || "Unable to load dashboard.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAllData();
  }, [domain]);

  /*
   * Update profile.
   * Controller accepts a FeesAdmin request body.
   */
  const openEditProfile = () => {
    clearFeedback();

    setEditForm({
      name: feesAdmin?.name || "",
      mobileNumber: feesAdmin?.mobileNumber || "",
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
      !/^\d{10}$/.test(editForm.mobileNumber.trim())
    ) {
      setActionErr("Mobile number must contain exactly 10 digits.");
      return;
    }

    try {
      const response = await fetch(
        `${API_BASE}/${domain}/feesAdmin/update_profile`,
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
          data?.message || "Failed to update profile."
        );
      }

      setFeesAdmin((previous) => ({
        ...previous,
        ...editForm,
      }));

      setShowEditModal(false);
      setActionMsg("Profile updated successfully.");
    } catch (error) {
      setActionErr(error?.message || "Profile update failed.");
    }
  };

  /*
   * Change password modal calls this function.
   * Controller currently expects email + newpass.
   */
  const handleChangePassword = async (newPassword) => {
    return fetch(
      `${API_BASE}/${domain}/feesAdmin/forgot_update_password?email=${encodeURIComponent(
        feesAdmin?.email || ""
      )}&newpass=${encodeURIComponent(newPassword)}`,
      {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      }
    );
  };

  /*
   * Delete account.
   * The corrected backend controller uses the authenticated
   * email, so the frontend does not send an arbitrary email.
   */
  const handleDeleteAccount = async () => {
    const response = await fetch(
      `${API_BASE}/${domain}/feesAdmin/delete_account`,
      {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      }
    );

    const data = await readResponse(response);

    if (!response.ok) {
      throw new Error(
        data?.message || "Unable to delete account."
      );
    }

    localStorage.clear();
    navigate(`/${domain}/login`);
  };

  const handleLogout = () => {
    localStorage.clear();
    navigate(`/${domain}/login`);
  };

  const profileImage = feesAdmin?.profilePic
    ? `${API_BASE}/${feesAdmin.profilePic}`
    : "/default.png";

  /*
   * Search both students and faculty from the dashboard.
   * This is local filtering; no extra backend API is invented.
   */
  const filteredStudents = useMemo(() => {
    const query = search.trim().toLowerCase();

    if (!query) return students;

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
          String(value).toLowerCase().includes(query)
        )
    );
  }, [students, search]);

  const filteredFaculty = useMemo(() => {
    const query = search.trim().toLowerCase();

    if (!query) return faculty;

    return faculty.filter((item) =>
      [
        item?.name,
        item?.email,
        item?.facultyId,
        item?.course,
      ]
        .filter(Boolean)
        .some((value) =>
          String(value).toLowerCase().includes(query)
        )
    );
  }, [faculty, search]);

  const isDashboard =
    location.pathname === `/${domain}/feesAdmin/dashboard`;

  const menu = [
    {
      label: "Dashboard",
      icon: "dashboard",
      path: `/${domain}/feesAdmin/dashboard`,
      end: true,
    },
    {
      label: "Students",
      icon: "students",
      path: `/${domain}/feesAdmin/dashboard/all-students`,
    },
    {
      label: "Faculty",
      icon: "faculty",
      path: `/${domain}/feesAdmin/dashboard/all-faculty`,
    },
    {
      label: "Fees",
      icon: "reports",
      path: `/${domain}/feesAdmin/dashboard/fees`,
    },
    {
      label: "Reports",
      icon: "reports",
      path: `/${domain}/feesAdmin/dashboard/reports`,
    },
    {
      label: "Notepad",
      icon: "notepad",
      path: `/${domain}/feesAdmin/dashboard/notepad`,
    },
  ];

  return (
    
      <div className="fees-admin-dashboard">
        {/* Feedback */}
        {actionMsg && (
          <div className="erp-feedback erp-feedback-success">
            <span>✓</span>
            <span>{actionMsg}</span>
          </div>
        )}

        {actionErr && (
          <div className="erp-feedback erp-feedback-error">
            <span>!</span>
            <span>{actionErr}</span>
          </div>
        )}

        {isDashboard ? (
          <>
            {/* Page heading */}
            <div className="erp-page-heading fees-admin-heading">
              <div>
                <div className="fees-admin-eyebrow">
                  Fees Administration
                </div>

                <h1>
                  Welcome back,{" "}
                  {feesAdmin?.name || "Fees Admin"} 👋
                </h1>

                <p>
                  Manage student and faculty information and
                  keep fee-related operations organized.
                </p>
              </div>

              <button
                type="button"
                className="erp-primary-btn"
                onClick={openEditProfile}
              >
                Edit Profile
              </button>
            </div>

            {/* Statistics */}
            <div className="erp-stats">
              <StatCard
                type="students"
                label="Students"
                value={loading ? "…" : students.length}
                subtitle="Students in university"
              />

              <StatCard
                type="faculty"
                label="Faculty"
                value={loading ? "…" : faculty.length}
                subtitle="Faculty records"
              />

              <StatCard
                type="courses"
                label="Account"
                value={feesAdmin?.feesAdminId || "—"}
                subtitle="Fees Admin ID"
              />

              <StatCard
                type="reports"
                label="Status"
                value="Active"
                subtitle="Signed-in account"
              />
            </div>

            {/* Account overview */}
            <section className="erp-card fees-admin-account">
              <div className="fees-admin-section-header">
                <div>
                  <h2>Account Overview</h2>
                  <p>Your Fees Admin account information.</p>
                </div>

                <button
                  type="button"
                  className="erp-secondary-btn"
                  onClick={openEditProfile}
                >
                  Edit
                </button>
              </div>

              <div className="fees-admin-account-grid">
                <div>
                  <span>Name</span>
                  <strong>{feesAdmin?.name || "—"}</strong>
                </div>

                <div>
                  <span>Fees Admin ID</span>
                  <strong>{feesAdmin?.feesAdminId || "—"}</strong>
                </div>

                <div>
                  <span>Email</span>
                  <strong>{feesAdmin?.email || "—"}</strong>
                </div>

                <div>
                  <span>Mobile</span>
                  <strong>{feesAdmin?.mobileNumber || "—"}</strong>
                </div>

                <div>
                  <span>Created</span>
                  <strong>
                    {FormatDate(feesAdmin?.createdDateTime)}
                  </strong>
                </div>

                <div>
                  <span>Last Login</span>
                  <strong>
                    {FormatDate(feesAdmin?.lastLoginDateTime)}
                  </strong>
                </div>
              </div>
            </section>

            {/* Quick data preview */}
            <div className="fees-admin-preview-grid">
              <section className="erp-card">
                <div className="fees-admin-section-header">
                  <div>
                    <h2>Recent Students</h2>
                    <p>Student records available to Fees Admin.</p>
                  </div>

                  <span className="fees-admin-count">
                    {students.length}
                  </span>
                </div>

                <div className="erp-data-table-wrap">
                  <table className="erp-data-table">
                    <thead>
                      <tr>
                        <th>Name</th>
                        <th>Roll Number</th>
                        <th>Course</th>
                      </tr>
                    </thead>

                    <tbody>
                      {students.slice(0, 5).map((item, index) => (
                        <tr key={item?.id || item?.email || index}>
                          <td>
                            <strong>{item?.name || "—"}</strong>
                          </td>
                          <td>{item?.rollNumber || "—"}</td>
                          <td>{item?.course || "—"}</td>
                        </tr>
                      ))}

                      {students.length === 0 && (
                        <tr>
                          <td colSpan="3">
                            <div className="erp-empty-state">
                              No student records found.
                            </div>
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </section>

              <section className="erp-card">
                <div className="fees-admin-section-header">
                  <div>
                    <h2>Faculty</h2>
                    <p>Faculty records available to Fees Admin.</p>
                  </div>

                  <span className="fees-admin-count">
                    {faculty.length}
                  </span>
                </div>

                <div className="erp-data-table-wrap">
                  <table className="erp-data-table">
                    <thead>
                      <tr>
                        <th>Name</th>
                        <th>Faculty ID</th>
                        <th>Course</th>
                      </tr>
                    </thead>

                    <tbody>
                      {faculty.slice(0, 5).map((item, index) => (
                        <tr key={item?.id || item?.email || index}>
                          <td>
                            <strong>{item?.name || "—"}</strong>
                          </td>
                          <td>{item?.facultyId || "—"}</td>
                          <td>{item?.course || "—"}</td>
                        </tr>
                      ))}

                      {faculty.length === 0 && (
                        <tr>
                          <td colSpan="3">
                            <div className="erp-empty-state">
                              No faculty records found.
                            </div>
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </section>
            </div>

            {/* Searchable full data preview */}
            <section className="erp-card fees-admin-data-card">
              <div className="fees-admin-section-header">
                <div>
                  <h2>University Records</h2>
                  <p>
                    Search student or faculty records from the
                    APIs provided by FeesAdminController.
                  </p>
                </div>

                <input
                  className="fees-admin-search"
                  type="search"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search name, email, ID, course..."
                />
              </div>

              <div className="fees-admin-result-columns">
                <div>
                  <div className="fees-admin-subheading">
                    Students ({filteredStudents.length})
                  </div>

                  <div className="erp-data-table-wrap">
                    <table className="erp-data-table">
                      <thead>
                        <tr>
                          <th>Name</th>
                          <th>Roll No</th>
                          <th>Email</th>
                          <th>Course</th>
                        </tr>
                      </thead>

                      <tbody>
                        {filteredStudents.slice(0, 20).map((item, index) => (
                          <tr key={item?.id || item?.email || index}>
                            <td>{item?.name || "—"}</td>
                            <td>{item?.rollNumber || "—"}</td>
                            <td>{item?.email || "—"}</td>
                            <td>{item?.course || "—"}</td>
                          </tr>
                        ))}

                        {filteredStudents.length === 0 && (
                          <tr>
                            <td colSpan="4">
                              <div className="erp-empty-state">
                                No matching students.
                              </div>
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>

                <div>
                  <div className="fees-admin-subheading">
                    Faculty ({filteredFaculty.length})
                  </div>

                  <div className="erp-data-table-wrap">
                    <table className="erp-data-table">
                      <thead>
                        <tr>
                          <th>Name</th>
                          <th>Faculty ID</th>
                          <th>Email</th>
                          <th>Course</th>
                        </tr>
                      </thead>

                      <tbody>
                        {filteredFaculty.slice(0, 20).map((item, index) => (
                          <tr key={item?.id || item?.email || index}>
                            <td>{item?.name || "—"}</td>
                            <td>{item?.facultyId || "—"}</td>
                            <td>{item?.email || "—"}</td>
                            <td>{item?.course || "—"}</td>
                          </tr>
                        ))}

                        {filteredFaculty.length === 0 && (
                          <tr>
                            <td colSpan="4">
                              <div className="erp-empty-state">
                                No matching faculty.
                              </div>
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </section>
          </>
        ) : (
          /*
           * Child routes are rendered by React Router.
           */
          <Outlet />
        )}

        {/* Edit profile modal */}
        {showEditModal && (
          <div
            className="erp-modal-overlay"
            onMouseDown={(event) => {
              if (event.target === event.currentTarget) {
                setShowEditModal(false);
              }
            }}
          >
            <div className="erp-modal">
              <div className="erp-modal-header">
                <h3>Edit Fees Admin Profile</h3>

                <button
                  type="button"
                  className="erp-modal-close"
                  onClick={() => setShowEditModal(false)}
                >
                  ×
                </button>
              </div>

              <div className="erp-modal-body">
                <div className="erp-field">
                  <label>Full Name</label>
                  <input
                    type="text"
                    value={editForm?.name || ""}
                    placeholder="Example: Ashish Kumar"
                    onChange={(e) =>
                      setEditForm((previous) => ({
                        ...previous,
                        name: e.target.value,
                      }))
                    }
                  />
                </div>

                <div className="erp-field">
                  <label>Mobile Number</label>
                  <input
                    type="text"
                    inputMode="numeric"
                    maxLength={10}
                    value={editForm?.mobileNumber || ""}
                    placeholder="Example: 9876543210"
                    onChange={(e) =>
                      setEditForm((previous) => ({
                        ...previous,
                        mobileNumber: e.target.value
                          .replace(/\D/g, "")
                          .slice(0, 10),
                      }))
                    }
                  />
                </div>

                <div className="fees-admin-readonly-note">
                  Email and Fees Admin ID are managed by the
                  account system and are not edited here.
                </div>

                <div className="fees-admin-modal-actions">
                  <button
                    type="button"
                    className="erp-secondary-btn"
                    onClick={() => setShowEditModal(false)}
                  >
                    Cancel
                  </button>

                  <button
                    type="button"
                    className="erp-primary-btn"
                    onClick={handleUpdateProfile}
                  >
                    Save Changes
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {showChangePasswordModal && (
          <ChangePasswordModal
            email={feesAdmin?.email}
            onChangePassword={handleChangePassword}
            onClose={() => setShowChangePasswordModal(false)}
            onSuccess={() => {
              setShowChangePasswordModal(false);
              setActionMsg("Password updated successfully.");
            }}
          />
        )}

        {showDeleteAccountModal && (
          <DeleteAccountModal
            name={feesAdmin?.name}
            email={feesAdmin?.email}
            onDeleteAccount={handleDeleteAccount}
            onClose={() => setShowDeleteAccountModal(false)}
          />
        )}

        {/* Account actions stay at the bottom to avoid cluttering
            the main dashboard. */}
        <div className="fees-admin-account-actions">
          <button
            type="button"
            className="erp-secondary-btn"
            onClick={() => setShowChangePasswordModal(true)}
          >
            Change Password
          </button>

          <button
            type="button"
            className="erp-danger-btn"
            onClick={() => setShowDeleteAccountModal(true)}
          >
            Delete Account
          </button>
        </div>
      </div>
  );
}

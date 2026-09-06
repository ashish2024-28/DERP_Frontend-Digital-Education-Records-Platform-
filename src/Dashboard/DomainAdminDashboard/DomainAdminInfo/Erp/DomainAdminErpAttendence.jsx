import { useMemo, useState } from "react";
import "./DomainAdminErpAttendence.css";

const API_BASE = (import.meta.env.VITE_API_BASE_URL || "").replace(/\/$/, "");

function getDomain() {
  return window.location.pathname.split("/")[1];
}

function authHeaders() {
  return {
    Authorization: `Bearer ${localStorage.getItem("token")}`,
    "Content-Type": "application/json",
  };
}

async function readJson(response) {
  const text = await response.text();
  let data = {};
  try { data = text ? JSON.parse(text) : {}; } catch { data = { message: text }; }
  if (!response.ok) throw new Error(data?.message || "Request failed");
  return data;
}

// GET /{domain}/erp/attendance/admin/overview?course=&batch=
async function getAttendanceOverview(course, batch) {
  const domain = getDomain();
  const params = new URLSearchParams();
  if (course) params.set("course", course);
  if (batch) params.set("batch", batch);

  const response = await fetch(
    `${API_BASE}/${domain}/erp/attendance/admin/overview?${params}`,
    { headers: authHeaders() }
  );
  return readJson(response); // -> { success, message, data: AttendanceOverviewResponse }
}

export default function DomainAdminErpAttendence() {
  const [course, setCourse] = useState("");
  const [batch, setBatch] = useState("");
  const [overview, setOverview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [searched, setSearched] = useState(false);
  const [searchText, setSearchText] = useState("");

  async function searchAttendance() {
    try {
      setLoading(true);
      setError("");

      const result = await getAttendanceOverview(course.trim(), batch.trim());
      setOverview(result?.data || null);
      setSearched(true);
    } catch (err) {
      setOverview(null);
      setSearched(true);
      setError(err?.message || "Unable to load attendance.");
    } finally {
      setLoading(false);
    }
  }

  function clearSearch() {
    setCourse("");
    setBatch("");
    setSearchText("");
    setOverview(null);
    setError("");
    setSearched(false);
  }

  function formatPercentage(value) {
    const number = Number(value);
    if (Number.isNaN(number)) return "0%";
    return `${number.toFixed(1)}%`;
  }

  function getPercentageClass(value) {
    const percentage = Number(value || 0);
    if (percentage >= 75) return "attendance-good";
    if (percentage >= 60) return "attendance-warning";
    return "attendance-danger";
  }

  // Filter students inside each batch group by the table search box
  const filteredCourses = useMemo(() => {
    if (!overview?.courses) return [];

    const query = searchText.trim().toLowerCase();
    if (!query) return overview.courses;

    return overview.courses
      .map((courseGroup) => ({
        ...courseGroup,
        studyBatches: courseGroup.studyBatches
          .map((batchGroup) => ({
            ...batchGroup,
            students: batchGroup.students.filter(
              (s) =>
                String(s.rollNumber ?? "").toLowerCase().includes(query) ||
                String(s.studentName ?? "").toLowerCase().includes(query)
            ),
          }))
          .filter((batchGroup) => batchGroup.students.length > 0),
      }))
      .filter((courseGroup) => courseGroup.studyBatches.length > 0);
  }, [overview, searchText]);

  const hasResults = overview && overview.totalStudents > 0;

  return (
    <div className="erp-attendance-page">

      {/* ================================================= PAGE HEADER ================================================= */}
      <div className="erp-attendance-header">
        <div>
          <div className="erp-attendance-eyebrow">ERP / ATTENDANCE</div>
          <h1>Attendance Overview</h1>
          <p>Monitor student attendance across courses, study batches and subjects.</p>
        </div>

        {searched && !loading && (
          <div className="erp-attendance-header-badge">
            <span className="status-dot" />
            Attendance Overview
          </div>
        )}
      </div>

      {/* ================================================= FILTER CARD ================================================= */}
      <section className="erp-attendance-filter-card">
        <div className="erp-attendance-filter-heading">
          <div>
            <h2>Attendance Search</h2>
            <p>Filter by course and/or study batch, or leave blank to view the whole domain.</p>
          </div>
        </div>

        <div className="erp-attendance-filter-grid">
          <div className="erp-attendance-field">
            <label htmlFor="attendance-course">Course (optional)</label>
            <input
              id="attendance-course"
              type="text"
              placeholder="Example: B.PHARMA"
              value={course}
              onChange={(event) => setCourse(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === "Enter") searchAttendance();
              }}
            />
          </div>

          <div className="erp-attendance-field">
            <label htmlFor="attendance-batch">Study Batch (optional)</label>
            <input
              id="attendance-batch"
              type="text"
              placeholder="Example: 2A"
              value={batch}
              onChange={(event) => setBatch(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === "Enter") searchAttendance();
              }}
            />
          </div>

          <div className="erp-attendance-filter-actions">
            <button
              type="button"
              className="attendance-search-btn"
              onClick={searchAttendance}
              disabled={loading}
            >
              {loading ? (
                <>
                  <span className="button-spinner" />
                  Loading...
                </>
              ) : (
                <>
                  <span className="search-icon">⌕</span>
                  Search Attendance
                </>
              )}
            </button>

            <button
              type="button"
              className="attendance-clear-btn"
              onClick={clearSearch}
              disabled={loading}
            >
              Clear
            </button>
          </div>
        </div>
      </section>

      {/* ================================================= ERROR ================================================= */}
      {error && (
        <div className="erp-attendance-alert error">
          <div className="alert-icon">!</div>
          <div>
            <strong>Unable to load attendance</strong>
            <p>{error}</p>
          </div>
        </div>
      )}

      {/* ================================================= LOADING ================================================= */}
      {loading && (
        <div className="erp-attendance-loading">
          <div className="loading-spinner" />
          <div>
            <strong>Loading attendance...</strong>
            <span>Please wait while the attendance records are loaded.</span>
          </div>
        </div>
      )}

      {/* ================================================= OVERALL STATISTICS ================================================= */}
      {!loading && searched && !error && hasResults && (
        <div className="erp-attendance-stats">
          <div className="attendance-stat-card">
            <div className="attendance-stat-icon students">👥</div>
            <div>
              <span>Students</span>
              <strong>{overview.totalStudents}</strong>
              <small>Across all matched courses</small>
            </div>
          </div>

          <div className="attendance-stat-card">
            <div className="attendance-stat-icon subjects">◫</div>
            <div>
              <span>Courses</span>
              <strong>{overview.courses.length}</strong>
              <small>Matched courses</small>
            </div>
          </div>

          <div className="attendance-stat-card">
            <div className="attendance-stat-icon present">✓</div>
            <div>
              <span>Present</span>
              <strong>{overview.present}</strong>
              <small>Recorded classes</small>
            </div>
          </div>

          <div className="attendance-stat-card">
            <div className="attendance-stat-icon absent">×</div>
            <div>
              <span>Absent</span>
              <strong>{overview.absent}</strong>
              <small>Recorded classes</small>
            </div>
          </div>

          <div className="attendance-stat-card highlight">
            <div className="attendance-stat-icon percentage">%</div>
            <div>
              <span>Overall Attendance</span>
              <strong>{formatPercentage(overview.percentage)}</strong>
              <small>Domain-wide</small>
            </div>
          </div>
        </div>
      )}

      {/* ================================================= TABLE SEARCH (only when results exist) ================================================= */}
      {!loading && searched && !error && hasResults && (
        <div style={{ marginTop: 18 }}>
          <div className="attendance-table-search" style={{ width: "100%", maxWidth: 340 }}>
            <span>⌕</span>
            <input
              type="text"
              placeholder="Search student or roll number..."
              value={searchText}
              onChange={(event) => setSearchText(event.target.value)}
            />
          </div>
        </div>
      )}

      {/* ================================================= COURSE → BATCH → STUDENT HIERARCHY ================================================= */}
      {!loading && searched && !error && hasResults && (
        <>
          {filteredCourses.map((courseGroup) => (
            <section
              key={courseGroup.course}
              className="erp-attendance-results"
              style={{ marginTop: 18 }}
            >
              <div className="erp-attendance-results-header">
                <div>
                  <div className="results-title-row">
                    <h2>{courseGroup.course}</h2>
                    <span className="result-count">{courseGroup.studentCount}</span>
                  </div>
                  <p>
                    {courseGroup.totalClasses} classes recorded ·{" "}
                    <strong className={getPercentageClass(courseGroup.percentage)}>
                      {formatPercentage(courseGroup.percentage)}
                    </strong>{" "}
                    overall
                  </p>
                </div>
              </div>

              {courseGroup.studyBatches.map((batchGroup) => (
                <div
                  key={batchGroup.studyBatch}
                  style={{ borderTop: "1px solid #f1f5f9" }}
                >
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      padding: "14px 20px",
                      background: "#fafafa",
                    }}
                  >
                    <span className="batch-badge" style={{ fontSize: 12 }}>
                      Batch {batchGroup.studyBatch}
                    </span>
                    <span style={{ color: "#64748b", fontSize: 12, fontWeight: 600 }}>
                      {batchGroup.studentCount} students ·{" "}
                      <span className={getPercentageClass(batchGroup.percentage)}>
                        {formatPercentage(batchGroup.percentage)}
                      </span>
                    </span>
                  </div>

                  <div className="erp-attendance-table-wrapper">
                    <table className="erp-attendance-table">
                      <thead>
                        <tr>
                          <th>#</th>
                          <th>Student</th>
                          <th>Roll Number</th>
                          <th>Branch</th>
                          <th className="number-column">Total</th>
                          <th className="number-column">Present</th>
                          <th className="number-column">Absent</th>
                          <th>Attendance</th>
                        </tr>
                      </thead>
                      <tbody>
                        {batchGroup.students.map((s, index) => (
                          <tr key={s.rollNumber}>
                            <td className="serial-column">{index + 1}</td>
                            <td>
                              <div className="student-cell">
                                <div className="student-avatar">
                                  {String(s.studentName || "S").charAt(0).toUpperCase()}
                                </div>
                                <div>
                                  <strong>{s.studentName || "Unknown Student"}</strong>
                                  {s.fatherName && <span>Father: {s.fatherName}</span>}
                                </div>
                              </div>
                            </td>
                            <td><span className="roll-number">{s.rollNumber || "—"}</span></td>
                            <td><span className="batch-badge">{s.branch || "—"}</span></td>
                            <td className="number-column">{s.totalClasses ?? 0}</td>
                            <td className="number-column">
                              <span className="present-value">{s.present ?? 0}</span>
                            </td>
                            <td className="number-column">
                              <span className="absent-value">{s.absent ?? 0}</span>
                            </td>
                            <td>
                              <div className="attendance-percentage-cell">
                                <div className="percentage-top">
                                  <span className={getPercentageClass(s.percentage)}>
                                    {formatPercentage(s.percentage)}
                                  </span>
                                </div>
                                <div className="percentage-progress">
                                  <span
                                    className={getPercentageClass(s.percentage)}
                                    style={{
                                      width: `${Math.min(Math.max(s.percentage || 0, 0), 100)}%`,
                                    }}
                                  />
                                </div>
                              </div>
                            </td>
                          </tr>
                        ))}

                        {batchGroup.students.length === 0 && (
                          <tr>
                            <td colSpan="8" className="empty-search-cell">
                              <div>
                                <span>⌕</span>
                                <strong>No matching records</strong>
                                <p>Try another student or roll number.</p>
                              </div>
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              ))}
            </section>
          ))}
        </>
      )}

      {/* ================================================= EMPTY STATE ================================================= */}
      {!loading && searched && !error && !hasResults && (
        <div className="erp-attendance-empty">
          <div className="empty-icon">◫</div>
          <h2>No attendance records found</h2>
          <p>
            There are no attendance records available
            {course ? ` for course ${course.toUpperCase()}` : ""}
            {batch ? ` in batch ${batch.toUpperCase()}` : ""}.
          </p>
          <button type="button" onClick={clearSearch}>
            Search Again
          </button>
        </div>
      )}

      {/* ================================================= INITIAL STATE ================================================= */}
      {!loading && !searched && (
        <div className="erp-attendance-initial">
          <div className="initial-icon">✓</div>
          <h2>View Attendance Overview</h2>
          <p>
            Filter by course and/or study batch above, or search with both fields
            empty to view attendance across the whole domain.
          </p>
        </div>
      )}
    </div>
  );
}
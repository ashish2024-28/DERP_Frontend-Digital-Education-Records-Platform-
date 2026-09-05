import { useCallback, useEffect, useMemo, useState } from "react";
import { useParams } from "react-router-dom";

import "../../../Common/css/common.css";
import "./ErpAttendence.css";

/*
 * Student Attendance ERP Page
 * ---------------------------------------------------------
 * Backend API:
 * GET /{domain}/erp/attendance/student/me?academicSession=...
 *
 * Response:
 * StudentAttendanceResponse
 *   - studentName
 *   - rollNumber
 *   - cource
 *   - branch
 *   - batch
 *   - studyBatch
 *   - subjects
 *   - summaries
 *   - last7Days
 */
export default function ErpAttendence() {
  const API_BASE = (import.meta.env.VITE_API_BASE_URL || "").replace(/\/$/, "");
  const { domain } = useParams();

  const getInitialSession = () => {
    const params = new URLSearchParams(window.location.search);
    return (
      params.get("academicSession") ||
      localStorage.getItem("academicSession") ||
      `${new Date().getFullYear()}-${String(new Date().getFullYear() + 1).slice(-2)}`
    );
  };

  const [academicSession, setAcademicSession] = useState(getInitialSession);
  const [attendance, setAttendance] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedSubject, setSelectedSubject] = useState("ALL");

  const authHeaders = () => ({
    Authorization: `Bearer ${localStorage.getItem("token")}`,
    "Content-Type": "application/json",
  });

  const readResponse = async (response) => {
    const text = await response.text();
    if (!text) return {};

    try {
      return JSON.parse(text);
    } catch {
      return { message: text };
    }
  };

  const fetchAttendance = useCallback(async () => {
    if (!academicSession?.trim()) {
      setError("Academic session is required.");
      setLoading(false);
      return;
    }

    setLoading(true);
    setError("");

    try {
      const query = new URLSearchParams({
        academicSession: academicSession.trim(),
      });

      // Keep the URL exactly aligned with AttendenceErpController.
      const response = await fetch(
        `${API_BASE}/${domain}/erp/attendance/student/me?${query.toString()}`,
        {
          method: "GET",
          headers: authHeaders(),
        }
      );

      const data = await readResponse(response);

      if (!response.ok) {
        throw new Error(data?.message || "Unable to load attendance.");
      }

      setAttendance(data || null);
      localStorage.setItem("academicSession", academicSession.trim());
    } catch (err) {
      console.error("Student attendance error:", err);
      setAttendance(null);
      setError(err?.message || "Attendance data is currently unavailable.");
    } finally {
      setLoading(false);
    }
  }, [API_BASE, domain, academicSession]);

  useEffect(() => {
    fetchAttendance();
  }, [fetchAttendance]);

  const summaries = Array.isArray(attendance?.summaries)
    ? attendance.summaries
    : [];

  const subjects = useMemo(() => {
    const fromResponse = Array.isArray(attendance?.subjects)
      ? attendance.subjects
      : [];

    const fromSummary = summaries.map((item) => item?.subject).filter(Boolean);

    return [...new Set([...fromResponse, ...fromSummary])].sort((a, b) =>
      String(a).localeCompare(String(b))
    );
  }, [attendance?.subjects, summaries]);

  const filteredSummaries = useMemo(() => {
    if (selectedSubject === "ALL") return summaries;

    return summaries.filter(
      (item) => String(item?.subject || "") === selectedSubject
    );
  }, [summaries, selectedSubject]);

  const recentRecords = useMemo(() => {
    const records = Array.isArray(attendance?.last7Days)
      ? [...attendance.last7Days]
      : [];

    return records
      .sort((a, b) => {
        const dateCompare = String(b?.date || "").localeCompare(String(a?.date || ""));
        if (dateCompare !== 0) return dateCompare;
        return Number(b?.periodNumber || 0) - Number(a?.periodNumber || 0);
      })
      .filter((item) =>
        selectedSubject === "ALL"
          ? true
          : String(item?.subject || "") === selectedSubject
      );
  }, [attendance?.last7Days, selectedSubject]);

  const totals = useMemo(() => {
    return filteredSummaries.reduce(
      (result, item) => {
        result.totalClasses += Number(item?.totalClasses || 0);
        result.present += Number(item?.present || 0);
        result.absent += Number(item?.absent || 0);
        return result;
      },
      { totalClasses: 0, present: 0, absent: 0 }
    );
  }, [filteredSummaries]);

  const overallPercentage =
    totals.totalClasses > 0
      ? Math.round((totals.present / totals.totalClasses) * 100)
      : 0;

  const attendanceTone =
    overallPercentage >= 75
      ? "good"
      : overallPercentage >= 60
        ? "average"
        : "danger";

  const formatDate = (value) => {
    if (!value) return "—";

    const date = new Date(`${value}T00:00:00`);
    if (Number.isNaN(date.getTime())) return value;

    return new Intl.DateTimeFormat("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    }).format(date);
  };

  const formatDay = (value) => {
    if (!value) return "—";

    const date = new Date(`${value}T00:00:00`);
    if (Number.isNaN(date.getTime())) return value;

    return new Intl.DateTimeFormat("en-IN", {
      weekday: "short",
      day: "2-digit",
      month: "short",
    }).format(date);
  };

  const getStatus = (status) => String(status || "UNKNOWN").toUpperCase();

  const getStatusClass = (status) => {
    const normalized = getStatus(status);

    if (normalized === "PRESENT" || normalized === "P") return "attendance-status present";
    if (normalized === "ABSENT" || normalized === "A") return "attendance-status absent";
    return "attendance-status unknown";
  };

  const groupedDays = useMemo(() => {
    const groups = new Map();

    recentRecords.forEach((record) => {
      const key = record?.date || "unknown";

      if (!groups.has(key)) {
        groups.set(key, {
          date: key,
          records: [],
          present: 0,
          absent: 0,
        });
      }

      const group = groups.get(key);
      group.records.push(record);

      if (["PRESENT", "P"].includes(getStatus(record?.status))) {
        group.present += 1;
      } else if (["ABSENT", "A"].includes(getStatus(record?.status))) {
        group.absent += 1;
      }
    });

    return Array.from(groups.values()).sort((a, b) =>
      String(b.date).localeCompare(String(a.date))
    );
  }, [recentRecords]);

  return (
    <div className="attendance-page">
      {/* =====================================================
          PAGE HEADER
      ===================================================== */}
      <div className="attendance-page-header">
        <div>
          <span className="attendance-eyebrow">ACADEMIC RECORD</span>
          <h1>My Attendance</h1>
          <p>Track subject-wise attendance and your latest 7-day class history.</p>
        </div>

        <div className="attendance-header-actions">
          <div className="attendance-session-field">
            <label htmlFor="academic-session">Academic Session</label>
            <input
              id="academic-session"
              value={academicSession}
              onChange={(event) => setAcademicSession(event.target.value)}
              placeholder="2026-27"
            />
          </div>

          <button
            type="button"
            className="attendance-refresh-btn"
            onClick={fetchAttendance}
            disabled={loading}
          >
            {loading ? "Loading..." : "↻ Refresh"}
          </button>
        </div>
      </div>

      {error && (
        <div className="attendance-alert attendance-alert-error">
          <span>!</span>
          <div>
            <strong>Unable to load attendance</strong>
            <p>{error}</p>
          </div>
        </div>
      )}

      {loading ? (
        <div className="attendance-loading-card">
          <div className="attendance-spinner" />
          <strong>Loading attendance records...</strong>
          <span>Fetching your subject summaries and recent class history.</span>
        </div>
      ) : (
        <>
          {/* =====================================================
              STUDENT INFORMATION
          ===================================================== */}
          <section className="attendance-student-card">
            <div className="attendance-student-avatar">
              {(attendance?.studentName || "S").charAt(0).toUpperCase()}
            </div>

            <div className="attendance-student-info">
              <span className="attendance-label">STUDENT</span>
              <h2>{attendance?.studentName || "Student"}</h2>
              <div className="attendance-student-meta">
                <span><strong>Roll No:</strong> {attendance?.rollNumber || "—"}</span>
                <span><strong>Course:</strong> {attendance?.cource || "—"}</span>
                <span><strong>Branch:</strong> {attendance?.branch || "—"}</span>
                <span><strong>Batch:</strong> {attendance?.batch || "—"}</span>
                <span><strong>Study Batch:</strong> {attendance?.studyBatch || "—"}</span>
              </div>
            </div>

            <div className={`attendance-overall-badge ${attendanceTone}`}>
              <span>Overall Attendance</span>
              <strong>{overallPercentage}%</strong>
              <small>{totals.present} of {totals.totalClasses} classes</small>
            </div>
          </section>

          {/* =====================================================
              SUMMARY STATISTICS
          ===================================================== */}
          <div className="attendance-stat-grid">
            <div className="attendance-stat-card">
              <span>Total Subjects</span>
              <strong>{subjects.length}</strong>
              <small>Subjects registered</small>
            </div>

            <div className="attendance-stat-card">
              <span>Total Classes</span>
              <strong>{totals.totalClasses}</strong>
              <small>Recorded classes</small>
            </div>

            <div className="attendance-stat-card">
              <span>Classes Attended</span>
              <strong className="attendance-number-present">{totals.present}</strong>
              <small>Present records</small>
            </div>

            <div className="attendance-stat-card">
              <span>Classes Absent</span>
              <strong className="attendance-number-absent">{totals.absent}</strong>
              <small>Absent records</small>
            </div>
          </div>

          {/* =====================================================
              SUBJECT SUMMARY
          ===================================================== */}
          <section className="attendance-section-card">
            <div className="attendance-section-heading">
              <div>
                <span className="attendance-section-kicker">SUBJECT SUMMARY</span>
                <h2>Attendance by Subject</h2>
                <p>Your complete attendance totals for {academicSession}.</p>
              </div>

              <select
                className="attendance-subject-filter"
                value={selectedSubject}
                onChange={(event) => setSelectedSubject(event.target.value)}
              >
                <option value="ALL">All Subjects</option>
                {subjects.map((subject) => (
                  <option key={subject} value={subject}>{subject}</option>
                ))}
              </select>
            </div>

            {filteredSummaries.length > 0 ? (
              <div className="attendance-table-wrapper">
                <table className="attendance-table">
                  <thead>
                    <tr>
                      <th>Subject</th>
                      <th>Total Classes</th>
                      <th>Present</th>
                      <th>Absent</th>
                      <th>Attendance</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredSummaries.map((summary, index) => {
                      const percentage = Math.max(0, Math.min(100, Number(summary?.percentage || 0)));
                      const tone = percentage >= 75 ? "good" : percentage >= 60 ? "average" : "danger";

                      return (
                        <tr key={`${summary?.subject || "subject"}-${index}`}>
                          <td>
                            <strong>{summary?.subject || "—"}</strong>
                            <small>
                              {summary?.teachingBatch || summary?.studyBatch
                                ? `${summary?.teachingBatch || ""}${summary?.teachingBatch && summary?.studyBatch ? " • " : ""}${summary?.studyBatch || ""}`
                                : "Subject record"}
                            </small>
                          </td>
                          <td>{summary?.totalClasses ?? 0}</td>
                          <td className="attendance-present-text">{summary?.present ?? 0}</td>
                          <td className="attendance-absent-text">{summary?.absent ?? 0}</td>
                          <td>
                            <div className="attendance-progress-row">
                              <div className="attendance-progress-track">
                                <div
                                  className={`attendance-progress-fill ${tone}`}
                                  style={{ width: `${percentage}%` }}
                                />
                              </div>
                              <strong className={`attendance-percentage ${tone}`}>
                                {percentage}%
                              </strong>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="attendance-empty-state">
                <div>📊</div>
                <h3>No subject attendance found</h3>
                <p>No attendance summary is available for the selected session or subject.</p>
              </div>
            )}
          </section>

          {/* =====================================================
              LAST 7 DAYS
          ===================================================== */}
          <section className="attendance-section-card">
            <div className="attendance-section-heading">
              <div>
                <span className="attendance-section-kicker">RECENT HISTORY</span>
                <h2>Last 7 Days</h2>
                <p>Every attendance record returned by the backend for the latest seven-day period.</p>
              </div>

              <span className="attendance-record-count">
                {recentRecords.length} record{recentRecords.length === 1 ? "" : "s"}
              </span>
            </div>

            {groupedDays.length > 0 ? (
              <>
                <div className="attendance-day-grid">
                  {groupedDays.map((day) => (
                    <div className="attendance-day-card" key={day.date}>
                      <div>
                        <strong>{formatDay(day.date)}</strong>
                        <small>{formatDate(day.date)}</small>
                      </div>
                      <div className="attendance-day-counts">
                        <span className="day-present">{day.present} Present</span>
                        <span className="day-absent">{day.absent} Absent</span>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="attendance-history-table-wrapper">
                  <table className="attendance-table attendance-history-table">
                    <thead>
                      <tr>
                        <th>Date</th>
                        <th>Period</th>
                        <th>Subject</th>
                        <th>Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {recentRecords.map((record, index) => {
                        const status = getStatus(record?.status);

                        return (
                          <tr key={`${record?.date || "date"}-${record?.periodNumber || "period"}-${index}`}>
                            <td>
                              <strong>{formatDate(record?.date)}</strong>
                            </td>
                            <td>Period {record?.periodNumber ?? "—"}</td>
                            <td>{record?.subject || "—"}</td>
                            <td>
                              <span className={getStatusClass(status)}>
                                <span className="attendance-status-dot" />
                                {status}
                              </span>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </>
            ) : (
              <div className="attendance-empty-state">
                <div>🗓️</div>
                <h3>No recent attendance history</h3>
                <p>The backend has not returned any attendance records for the latest seven-day period.</p>
              </div>
            )}
          </section>

          {/* =====================================================
              SUBJECT LIST
          ===================================================== */}
          <section className="attendance-section-card attendance-subject-list-card">
            <div className="attendance-section-heading">
              <div>
                <span className="attendance-section-kicker">ACADEMICS</span>
                <h2>All Subjects</h2>
                <p>Subjects included in your attendance response.</p>
              </div>
            </div>

            {subjects.length > 0 ? (
              <div className="attendance-subject-chips">
                {subjects.map((subject) => (
                  <button
                    type="button"
                    className={`attendance-subject-chip ${selectedSubject === subject ? "active" : ""}`}
                    key={subject}
                    onClick={() => setSelectedSubject(subject)}
                  >
                    {subject}
                  </button>
                ))}
              </div>
            ) : (
              <p className="attendance-muted">No subjects available.</p>
            )}
          </section>
        </>
      )}
    </div>
  );
}

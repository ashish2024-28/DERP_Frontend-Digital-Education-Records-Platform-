import { useCallback, useEffect, useMemo, useState } from "react";
import { useParams } from "react-router-dom";

import "../../../Common/css/common.css";
import "./StudentErpAttendence.css";

const EMPTY_SUMMARIES = [];

/*
 * Student Attendance ERP Page
 * ---------------------------------------------------------
 * Backend API:
 * GET /{domain}/erp/attendance/student/me
 *
 * Response:
 * StudentAttendanceResponse
 *   - studentName
 *   - rollNumber
 *   - course
 *   - branch
 *   - batch
 *   - studyBatch
 *   - subjects
 *   - summaries
 *   - lastDays
 */
export default function StudentErpAttendence() {
  const API_BASE = (import.meta.env.VITE_API_BASE_URL || "").replace(/\/$/, "");
  const { domain } = useParams();

  const [attendance, setAttendance] = useState({});
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
    setLoading(true);
    setError("");
    try {
      const response = await fetch(
        `${API_BASE}/${domain}/erp/attendance/student/me`,
        {
          method: "GET",
          headers: authHeaders(),
        }
      );

      const data = await readResponse(response);

      if (!response.ok) {
        throw new Error(data?.message || "Unable to load attendance.");
      }

      
      setAttendance(data.data|| null);
    } catch (err) {
      console.error("Student attendance error:", err);
      setAttendance(null);
      setError(err?.message || "Attendance data is currently unavailable.");
    } finally {
      setLoading(false);
    }
  }, [API_BASE, domain]);

  useEffect(() => {
    fetchAttendance();
  }, [fetchAttendance]);

  const summaries = Array.isArray(attendance?.summaries)
    ? attendance.summaries
    : EMPTY_SUMMARIES;

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

  const attendanceRecords = useMemo(() => {
    const records = Array.isArray(attendance?.last7Days)
      ? [...attendance.last7Days]
      : [];

    return records.filter((item) => item?.date && item?.subject);
  }, [attendance?.last7Days]);

  const attendanceDates = useMemo(
    () => [...new Set(attendanceRecords.map((record) => record.date))]
      .sort((left, right) => String(left).localeCompare(String(right))),
    [attendanceRecords]
  );

  const matrixSubjects = useMemo(
    () => (selectedSubject === "ALL"
      ? subjects
      : subjects.filter((subject) => subject === selectedSubject)),
    [selectedSubject, subjects]
  );

  const attendanceMatrix = useMemo(() => {
    const matrix = new Map();

    attendanceRecords.forEach((record) => {
      const key = `${record.subject}\u0000${record.date}`;
      const entries = matrix.get(key) || [];
      entries.push(record);
      matrix.set(key, entries);
    });

    matrix.forEach((records) => {
      records.sort((left, right) => Number(left.periodNumber || 0) - Number(right.periodNumber || 0));
    });

    return matrix;
  }, [attendanceRecords]);

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

  const getStatus = (status) => String(status || "UNKNOWN").toUpperCase();

  const formatMatrixDate = (value) => {
    if (!value) return "—";
    const date = new Date(`${value}T00:00:00`);
    if (Number.isNaN(date.getTime())) return value;

    return new Intl.DateTimeFormat("en-GB", {
      day: "2-digit",
      month: "2-digit",
      year: "2-digit",
    }).format(date);
  };

  return (
    <div className="attendance-page">
      {/* =====================================================
          PAGE HEADER
      ===================================================== */}
      <div className="attendance-page-header">
        <div>
          <span className="attendance-eyebrow">ACADEMIC RECORD</span>
          <h1>My Attendance</h1>
          <p>Track subject summaries and view your attendance by subject and date.</p>
        </div>

        <div className="attendance-header-actions">
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
                <span><strong>Course:</strong> {attendance?.course || "—"}</span>
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
                <span className="attendance-section-kicker">DATE-WISE ATTENDANCE</span>
                <h2>Attendance by Subject and Date</h2>
                <p>Each row is a subject and each date column shows your attendance status.</p>
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

            {attendanceDates.length > 0 && matrixSubjects.length > 0 ? (
              <>
              <div className="attendance-matrix-legend" aria-label="Attendance status legend">
                <span><strong className="present">P</strong> Present</span>
                <span><strong className="absent">A</strong> Absent</span>
                <span>— No record</span>
                <span className="attendance-matrix-scroll-hint">Scroll horizontally to see all dates</span>
              </div>
              <div className="attendance-matrix-wrapper" role="region" aria-label="Date-wise attendance table" tabIndex={0}>
                <table className="attendance-matrix">
                  <thead>
                    <tr>
                      <th scope="col" className="attendance-matrix-subject-heading">Subject</th>
                      {attendanceDates.map((date) => (
                        <th scope="col" key={date}>{formatMatrixDate(date)}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {matrixSubjects.map((subject) => (
                      <tr key={subject}>
                        <th scope="row" className="attendance-matrix-subject">{subject}</th>
                        {attendanceDates.map((date) => {
                          const records = attendanceMatrix.get(`${subject}\u0000${date}`) || [];

                          return (
                            <td key={`${subject}-${date}`}>
                              {records.length > 0 ? (
                                <div className="attendance-matrix-statuses">
                                  {records.map((record, index) => {
                                    const status = getStatus(record.status);
                                    const isPresent = status === "PRESENT" || status === "P";
                                    const isAbsent = status === "ABSENT" || status === "A";

                                    return (
                                      <span
                                        key={`${record.periodNumber ?? "period"}-${index}`}
                                        className={`attendance-matrix-status ${isPresent ? "present" : isAbsent ? "absent" : "unknown"}`}
                                        title={`Period ${record.periodNumber ?? "—"}: ${status}`}
                                      >
                                        {isPresent ? "P" : isAbsent ? "A" : status.charAt(0)}
                                      </span>
                                    );
                                  })}
                                </div>
                              ) : (
                                <span className="attendance-matrix-no-record" aria-label="No attendance record">—</span>
                              )}
                            </td>
                          );
                        })}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              </>
            ) : (
              <div className="attendance-empty-state">
              <div>🗓️</div>
              <h3>No date-wise attendance found</h3>
              <p>No dated attendance records are available for this subject yet.</p>
              </div>
            )}
          </section>
        </>
      )}
    </div>
  );
}

import { useEffect, useMemo, useState } from "react";
import "./RecentAttendancePanel.css";

const API_BASE = (import.meta.env.VITE_API_BASE_URL || "").replace(/\/$/, "");

function authHeaders() {
  return { Authorization: `Bearer ${localStorage.getItem("token")}` };
}

async function readJson(response) {
  const text = await response.text();
  let data = {};
  try { data = text ? JSON.parse(text) : {}; } catch { data = { message: text }; }
  if (!response.ok) throw new Error(data?.message || "Request failed");
  return data;
}

async function getRecentAttendance(domain) {
  const response = await fetch(
    `${API_BASE}/${domain}/erp/attendance/faculty/recent`,
    { headers: authHeaders() }
  );
  return readJson(response); // -> { success, message, data: FacultyRecentAttendanceResponse }
}

function formatDate(value) {
  if (!value) return "—";
  const date = new Date(`${value}T00:00:00`);
  if (Number.isNaN(date.getTime())) return value;
  return new Intl.DateTimeFormat("en-IN", {
    weekday: "short",
    day: "2-digit",
    month: "short",
  }).format(date);
}

export default function RecentAttendancePanel({ domain }) {
  const [batches, setBatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [collapsed, setCollapsed] = useState(false);

  const [activeBatch, setActiveBatch] = useState("");
  const [expandedSessions, setExpandedSessions] = useState(new Set());

  useEffect(() => {
    if (!domain) return;
    loadRecent();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [domain]);

  async function loadRecent() {
    try {
      setLoading(true);
      setError("");

      const res = await getRecentAttendance(domain);
      const data = res?.data?.batches || [];
      setBatches(data);

      if (data.length > 0) {
        setActiveBatch(data[0].teachingBatch);
      }
    } catch (err) {
      setError(err?.message || "Unable to load recent attendance.");
      setBatches([]);
    } finally {
      setLoading(false);
    }
  }

  const activeBatchGroup = useMemo(
    () => batches.find((b) => b.teachingBatch === activeBatch),
    [batches, activeBatch]
  );

  function toggleSession(key) {
    setExpandedSessions((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  }

  const totalSessionsThisWeek = useMemo(
    () =>
      batches.reduce(
        (sum, b) => sum + b.subjects.reduce((s2, sub) => s2 + sub.sessions.length, 0),
        0
      ),
    [batches]
  );

  if (loading) {
    return (
      <section className="recent-panel">
        <div className="recent-panel-header">
          <div>
            <h2>Recent Attendance</h2>
            <p>Last 7 days across all your taught batches.</p>
          </div>
        </div>
        <div className="recent-panel-loading">
          <div className="recent-spinner" />
          <span>Loading recent attendance...</span>
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section className="recent-panel">
        <div className="recent-panel-header">
          <div>
            <h2>Recent Attendance</h2>
            <p>Last 7 days across all your taught batches.</p>
          </div>
        </div>
        <div className="recent-panel-error">
          <span>!</span> {error}
        </div>
      </section>
    );
  }

  if (batches.length === 0) {
    return (
      <section className="recent-panel">
        <div className="recent-panel-header">
          <div>
            <h2>Recent Attendance</h2>
            <p>Last 7 days across all your taught batches.</p>
          </div>
        </div>
        <div className="recent-panel-empty">
          No attendance has been recorded in the last 7 days.
        </div>
      </section>
    );
  }

  return (
    <section className={`recent-panel ${collapsed ? "collapsed" : ""}`}>
      <div className="recent-panel-header">
        <div>
          <h2>Recent Attendance</h2>
          <p>
            {totalSessionsThisWeek} session{totalSessionsThisWeek !== 1 ? "s" : ""} recorded in the last 7 days
          </p>
        </div>
        <button
          type="button"
          className="recent-collapse-btn"
          onClick={() => setCollapsed((c) => !c)}
        >
          {collapsed ? "Show" : "Hide"}
        </button>
      </div>

      {!collapsed && (
        <>
          {/* Batch tabs */}
          <div className="recent-batch-tabs">
            {batches.map((b) => (
              <button
                key={b.teachingBatch}
                type="button"
                className={activeBatch === b.teachingBatch ? "active" : ""}
                onClick={() => setActiveBatch(b.teachingBatch)}
              >
                {b.teachingBatch}
              </button>
            ))}
          </div>

          {/* Subjects + sessions for active batch */}
          <div className="recent-body">
            {activeBatchGroup?.subjects.map((subjectGroup) => (
              <div key={subjectGroup.subject} className="recent-subject-block">
                <div className="recent-subject-title">{subjectGroup.subject}</div>

                <div className="recent-session-list">
                  {subjectGroup.sessions.map((session) => {
                    const sessionKey = `${activeBatchGroup.teachingBatch}-${subjectGroup.subject}-${session.date}-${session.periodNumber}`;
                    const isExpanded = expandedSessions.has(sessionKey);
                    const pct =
                      session.totalCount > 0
                        ? Math.round((session.presentCount / session.totalCount) * 100)
                        : 0;

                    return (
                      <div key={sessionKey} className="recent-session-card">
                        <button
                          type="button"
                          className="recent-session-summary"
                          onClick={() => toggleSession(sessionKey)}
                        >
                          <div className="recent-session-date">
                            <strong>{formatDate(session.date)}</strong>
                            <span>Period {session.periodNumber}</span>
                          </div>

                          <div className="recent-session-counts">
                            <span className="count-present">{session.presentCount} P</span>
                            <span className="count-absent">{session.absentCount} A</span>
                            <span className={`count-pct ${pct >= 75 ? "good" : pct >= 60 ? "warn" : "bad"}`}>
                              {pct}%
                            </span>
                          </div>

                          <span className={`recent-chevron ${isExpanded ? "open" : ""}`}>⌄</span>
                        </button>

                        {isExpanded && (
                          <div className="recent-session-details">
                            <table className="recent-student-table">
                              <thead>
                                <tr>
                                  <th>Roll No</th>
                                  <th>Student</th>
                                  <th>Status</th>
                                </tr>
                              </thead>
                              <tbody>
                                {session.students.map((s) => (
                                  <tr key={s.rollNumber}>
                                    <td>{s.rollNumber}</td>
                                    <td>{s.studentName}</td>
                                    <td>
                                      <span
                                        className={`status-pill ${
                                          s.status === "PRESENT" ? "present" : "absent"
                                        }`}
                                      >
                                        {s.status === "PRESENT" ? "Present" : "Absent"}
                                      </span>
                                    </td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </section>
  );
}
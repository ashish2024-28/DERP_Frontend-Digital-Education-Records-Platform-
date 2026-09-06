import { useEffect, useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import "./FacultyErpAttendence.css";
import Toast from "../../../../Components/Toast/Toast";
import RecentAttendancePanel from "./RecentAttendancePanel"; // adjust path

const API_BASE = (import.meta.env.VITE_API_BASE_URL || "").replace(/\/$/, "");

const ATTENDANCE_PRESENT = "P";
const ATTENDANCE_ABSENT = "A";

function authHeaders(json = true) {
  const headers = { Authorization: `Bearer ${localStorage.getItem("token")}` };
  if (json) headers["Content-Type"] = "application/json";
  return headers;
}

async function readJson(response) {
  const text = await response.text();
  let data = {};
  try { data = text ? JSON.parse(text) : {}; } catch { data = { message: text }; }
  if (!response.ok) throw new Error(data?.message || "Request failed");
  return data;
}

const facultyApi = {
  getSetup: (domain) =>
    fetch(`${API_BASE}/${domain}/erp/attendance/faculty/setup`, {
      headers: authHeaders(false),
    }).then(readJson),

  getStudents: (domain, batch, subject) => {
    const query = new URLSearchParams({ batch, subject });
    return fetch(`${API_BASE}/${domain}/erp/attendance/faculty/students?${query}`, {
      headers: authHeaders(false),
    }).then(readJson);
  },

  markAttendance: (domain, payload) =>
    fetch(`${API_BASE}/${domain}/erp/attendance/faculty/mark`, {
      method: "POST",
      headers: authHeaders(),
      body: JSON.stringify(payload),
    }).then(readJson),
};

function parseTeachingAssignments(value) {
  const result = {};
  if (!value || typeof value !== "string") return result;

  value
    .split(";")
    .map((item) => item.trim())
    .filter(Boolean)
    .forEach((item) => {
      const separatorIndex = item.indexOf(":");
      if (separatorIndex === -1) return;

      const batch = item.substring(0, separatorIndex).trim();
      const subjectsString = item.substring(separatorIndex + 1).trim();
      if (!batch || !subjectsString) return;

      const subjects = subjectsString
        .split(",")
        .map((subject) => subject.trim())
        .filter(Boolean);

      if (subjects.length > 0) result[batch] = [...new Set(subjects)];
    });

  return result;
}

function normalizeText(value) {
  return String(value || "").trim().toLowerCase();
}

export default function FacultyErpAttendence() {
  const { domain } = useParams();

  const [assignments, setAssignments] = useState({});
  const [facultyCourse, setFacultyCourse] = useState("");

  const [batch, setBatch] = useState("");
  const [subject, setSubject] = useState("");
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  const [period, setPeriod] = useState(1);

  const [students, setStudents] = useState([]);
  const [attendance, setAttendance] = useState({});

  const [searchQuery, setSearchQuery] = useState("");
  const [attendanceFilter, setAttendanceFilter] = useState("ALL");

  const [loadingAssignments, setLoadingAssignments] = useState(false);
  const [loadingStudents, setLoadingStudents] = useState(false);
  const [savingAttendance, setSavingAttendance] = useState(false);

  // ---- CHANGED: toast state instead of message/error banners ----
  const [toast, setToast] = useState({ type: "success", message: "" });

  // ---- NEW: lock state so faculty can't save the same sheet twice by accident ----
  const [isLocked, setIsLocked] = useState(false);

  const today = useMemo(() => new Date().toISOString().split("T")[0], []);

  useEffect(() => {
    loadAssignments();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [domain]);

  function showToast(type, message) {
    setToast({ type, message });
  }

  function closeToast() {
    setToast((prev) => ({ ...prev, message: "" }));
  }

  async function loadAssignments() {
    try {
      setLoadingAssignments(true);

      const res = await facultyApi.getSetup(domain);
      const setup = res?.data || {};
      const parsed = parseTeachingAssignments(setup.teachingAssignments || "");

      setFacultyCourse(setup.course || "");
      setAssignments(parsed);
    } catch (err) {
      setAssignments({});
      setFacultyCourse("");
      showToast("error", err?.message || "Unable to load teaching assignments.");
    } finally {
      setLoadingAssignments(false);
    }
  }

  const batches = useMemo(
    () =>
      Object.keys(assignments).sort((a, b) =>
        a.localeCompare(b, undefined, { numeric: true, sensitivity: "base" })
      ),
    [assignments]
  );

  const subjects = useMemo(() => (batch ? assignments[batch] || [] : []), [assignments, batch]);

  const filteredStudents = useMemo(() => {
    const query = normalizeText(searchQuery);

    return students.filter((student) => {
      const status = attendance[student.rollNumber] || ATTENDANCE_PRESENT;
      if (attendanceFilter !== "ALL" && status !== attendanceFilter) return false;
      if (!query) return true;

      const searchableText = [
        student.rollNumber,
        student.studentName,
        student.branch,
        student.studyBatch,
        student.fatherName,
      ]
        .map(normalizeText)
        .join(" ");

      return searchableText.includes(query);
    });
  }, [students, attendance, searchQuery, attendanceFilter]);

  const totalCount = students.length;
  const presentCount = students.filter((s) => attendance[s.rollNumber] === ATTENDANCE_PRESENT).length;
  const absentCount = students.filter((s) => attendance[s.rollNumber] === ATTENDANCE_ABSENT).length;
  const attendancePercentage = totalCount > 0 ? Math.round((presentCount / totalCount) * 100) : 0;

  function resetStudents() {
    setStudents([]);
    setAttendance({});
    setSearchQuery("");
    setAttendanceFilter("ALL");
    setIsLocked(false); // ---- NEW: unlock whenever the sheet is cleared ----
  }

  function handleBatchChange(event) {
    setBatch(event.target.value);
    setSubject("");
    resetStudents();
  }

  function handleSubjectChange(event) {
    setSubject(event.target.value);
    resetStudents();
  }

  function handleDateChange(event) {
    setDate(event.target.value);
    resetStudents(); // ---- NEW: changing date means a different session, so unlock/clear ----
  }

  function handlePeriodChange(event) {
    setPeriod(event.target.value);
    resetStudents(); // ---- NEW: changing period means a different session, so unlock/clear ----
  }

  async function loadStudents() {
    if (!batch) return showToast("error", "Please select a teaching batch.");
    if (!subject) return showToast("error", "Please select a subject.");
    if (!date) return showToast("error", "Attendance date is required.");
    if (!period || Number(period) < 1) return showToast("error", "Please enter a valid period.");

    try {
      setLoadingStudents(true);

      const res = await facultyApi.getStudents(domain, batch, subject);
      const list = Array.isArray(res?.data) ? res.data : [];

      const uniqueStudents = [];
      const usedRollNumbers = new Set();

      list.forEach((student) => {
        const rollNumber = String(student?.rollNumber || "").trim();
        if (rollNumber && !usedRollNumbers.has(rollNumber)) {
          usedRollNumbers.add(rollNumber);
          uniqueStudents.push(student);
        }
      });

      setStudents(uniqueStudents);

      const initialAttendance = {};
      uniqueStudents.forEach((student) => {
        const rollNumber = String(student?.rollNumber || "").trim();
        if (rollNumber) initialAttendance[rollNumber] = ATTENDANCE_PRESENT;
      });
      setAttendance(initialAttendance);
      setIsLocked(false); // ---- NEW: fresh load is always editable ----

      if (uniqueStudents.length === 0) {
        showToast("info", `No students found for batch ${batch} and subject ${subject}.`);
      } else {
        showToast("success", `${uniqueStudents.length} student(s) loaded.`);
      }
    } catch (err) {
      setStudents([]);
      setAttendance({});
      showToast("error", err?.message || "Unable to load students.");
    } finally {
      setLoadingStudents(false);
    }
  }

  function updateAttendance(rollNumber, status) {
    if (!rollNumber || isLocked) return; // ---- CHANGED: block edits while locked ----
    setAttendance((prev) => ({ ...prev, [rollNumber]: status }));
  }

  function markAllPresent() {
    if (!students.length || isLocked) return; // ---- CHANGED ----
    const updated = {};
    students.forEach((s) => {
      const roll = String(s?.rollNumber || "").trim();
      if (roll) updated[roll] = ATTENDANCE_PRESENT;
    });
    setAttendance(updated);
    showToast("success", "All students marked Present.");
  }

  function markAllAbsent() {
    if (!students.length || isLocked) return; // ---- CHANGED ----
    const updated = {};
    students.forEach((s) => {
      const roll = String(s?.rollNumber || "").trim();
      if (roll) updated[roll] = ATTENDANCE_ABSENT;
    });
    setAttendance(updated);
    showToast("success", "All students marked Absent.");
  }

  function resetAttendance() {
    if (!students.length || isLocked) return; // ---- CHANGED ----
    const updated = {};
    students.forEach((s) => {
      const roll = String(s?.rollNumber || "").trim();
      if (roll) updated[roll] = ATTENDANCE_PRESENT;
    });
    setAttendance(updated);
    showToast("success", "Attendance reset. All students are Present.");
  }

  async function saveAttendance() {
    if (isLocked) {
      return showToast("info", 'Attendance is already saved. Click "Edit Attendance" to make changes.');
    }
    if (!students.length) return showToast("error", "Please load students before saving attendance.");
    if (!batch || !subject) return showToast("error", "Teaching batch and subject are required.");
    if (!date) return showToast("error", "Attendance date is required.");
    if (date > today) return showToast("error", "Attendance date cannot be in the future.");
    if (!period || Number(period) < 1 || Number(period) > 20)
      return showToast("error", "Period must be between 1 and 20.");

    const invalidStudent = students.find((student) => {
      const status = attendance[student.rollNumber];
      return status !== ATTENDANCE_PRESENT && status !== ATTENDANCE_ABSENT;
    });

    if (invalidStudent) {
      return showToast(
        "error",
        `Attendance status missing for ${invalidStudent.studentName || invalidStudent.rollNumber}.`
      );
    }

    try {
      setSavingAttendance(true);

      await facultyApi.markAttendance(domain, {
        teachingBatch: batch,
        subject,
        attendanceDate: date,
        periodNumber: Number(period),
        attendance,
      });

      showToast(
        "success",
        `Attendance saved successfully. ${presentCount} Present · ${absentCount} Absent.`
      );

      setIsLocked(true); // ---- NEW: lock the sheet after a successful save ----
    } catch (err) {
      showToast("error", err?.message || "Unable to save attendance.");
    } finally {
      setSavingAttendance(false);
    }
  }

  // ---- NEW: lets faculty intentionally unlock to correct a mistake ----
  function enterEditMode() {
    setIsLocked(false);
    showToast("info", "Edit mode enabled — make your changes and save again.");
  }

  return (
    <div className="attendance-page">

      {/* ---- CHANGED: Toast replaces the old inline alert banners ---- */}
      <Toast type={toast.type} message={toast.message} onClose={closeToast} />

      {/* ================================================== HEADER ================================================== */}
      <div className="attendance-page-header">
        <div>
          <div className="attendance-page-label">ERP / Attendance</div>
          <h1>Mark Attendance</h1>
          <p>Manage attendance for your assigned batches and subjects.</p>
        </div>
        <div className="attendance-header-icon">✓</div>
      </div>

{/* // ...inside return, right after the page header: */}
<RecentAttendancePanel domain={domain} />

      {/* ================================================== ASSIGNMENT STATUS ================================================== */}
      <section className="attendance-card">
        <div className="attendance-card-header">
          <div>
            <h2>Attendance Details</h2>
            <p>Select a batch and subject from your teaching assignments.</p>
          </div>
          <div className="setup-status">
            <span className="status-dot" />
            {loadingAssignments
              ? "Loading assignments..."
              : `${batches.length} assigned batch${batches.length !== 1 ? "es" : ""}`}
          </div>
        </div>

        <div className="attendance-form-grid">
          <div className="attendance-form-group attendance-readonly-group">
            <label>Faculty Course</label>
            <input
              type="text"
              value={facultyCourse || "Loading..."}
              readOnly
              aria-readonly="true"
              disabled={loadingAssignments || loadingStudents || savingAttendance}
            />
            <small>Fixed from your faculty profile.</small>
          </div>

          <div className="attendance-form-group">
            <label>Teaching Batch</label>
            <select
              value={batch}
              onChange={handleBatchChange}
              disabled={loadingAssignments || loadingStudents || savingAttendance}
            >
              <option value="">Select teaching batch</option>
              {batches.map((item) => (
                <option key={item} value={item}>{item}</option>
              ))}
            </select>
            <small>Year + Section · e.g. 1A = 1st year, Section A.</small>
          </div>

          <div className="attendance-form-group">
            <label>Subject</label>
            <select
              value={subject}
              disabled={!batch || loadingAssignments || loadingStudents || savingAttendance}
              onChange={handleSubjectChange}
            >
              <option value="">Select subject</option>
              {subjects.map((item) => (
                <option key={item} value={item}>{item}</option>
              ))}
            </select>
          </div>

          <div className="attendance-form-group">
            <label>Attendance Date</label>
            <input
              type="date"
              value={date}
              max={today}
              disabled={loadingStudents || savingAttendance}
              onChange={handleDateChange}
            />
          </div>

          <div className="attendance-form-group">
            <label>Period</label>
            <input
              type="number"
              min="1"
              max="20"
              value={period}
              disabled={loadingStudents || savingAttendance}
              onChange={handlePeriodChange}
            />
          </div>
        </div>

        <div className="attendance-setup-footer">
          <button
            className="attendance-primary-btn"
            onClick={loadStudents}
            disabled={loadingStudents || savingAttendance || loadingAssignments || !batch || !subject}
          >
            {loadingStudents ? "Loading students..." : "Load Students"}
          </button>
        </div>
      </section>

      {/* ================================================== ATTENDANCE SHEET ================================================== */}
      {students.length > 0 && (
        <section className="attendance-card attendance-sheet">

          <div className="attendance-sheet-header">
            <div>
              <div className="sheet-title-row">
                <h2>{subject}</h2>
                <span className="batch-badge">{batch}</span>

                {/* ---- NEW: visual lock indicator ---- */}
                {isLocked && (
                  <span className="batch-badge" style={{ background: "#fef3c7", color: "#92400e" }}>
                    Saved
                  </span>
                )}
              </div>
              <p>
                Attendance for <strong>{date}</strong> · Period <strong>{period}</strong>
              </p>
            </div>

            <div className="attendance-summary">
              <div className="summary-item">
                <span className="summary-label">Total</span>
                <strong>{totalCount}</strong>
              </div>
              <div className="summary-item present-summary">
                <span className="summary-label">Present</span>
                <strong>{presentCount}</strong>
              </div>
              <div className="summary-item absent-summary">
                <span className="summary-label">Absent</span>
                <strong>{absentCount}</strong>
              </div>
              <div className="summary-item">
                <span className="summary-label">Attendance</span>
                <strong>{attendancePercentage}%</strong>
              </div>
            </div>
          </div>

          <div className="attendance-quick-actions">
            <span>Quick actions</span>
            <button type="button" onClick={markAllPresent} disabled={savingAttendance || isLocked}>
              ✓ Mark All Present
            </button>
            <button type="button" onClick={markAllAbsent} disabled={savingAttendance || isLocked}>
              × Mark All Absent
            </button>
            <button type="button" onClick={resetAttendance} disabled={savingAttendance || isLocked}>
              ↻ Reset
            </button>

            {/* ---- NEW: only shown once locked, lets faculty intentionally fix a mistake ---- */}
            {isLocked && (
              <button
                type="button"
                onClick={enterEditMode}
                style={{ marginLeft: "auto", background: "#eff6ff", color: "#1d4ed8", borderColor: "#bfdbfe" }}
              >
                ✎ Edit Attendance
              </button>
            )}
          </div>

          <div className="attendance-toolbar">
            <div className="attendance-search">
              <input
                type="search"
                value={searchQuery}
                placeholder="Search by roll number, name, branch..."
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <div className="attendance-filter">
              <button type="button" className={attendanceFilter === "ALL" ? "active" : ""} onClick={() => setAttendanceFilter("ALL")}>
                All ({totalCount})
              </button>
              <button type="button" className={attendanceFilter === "P" ? "active present" : ""} onClick={() => setAttendanceFilter("P")}>
                Present ({presentCount})
              </button>
              <button type="button" className={attendanceFilter === "A" ? "active absent" : ""} onClick={() => setAttendanceFilter("A")}>
                Absent ({absentCount})
              </button>
            </div>
          </div>

          <div className="attendance-result-info">
            Showing <strong>{filteredStudents.length}</strong> of <strong>{totalCount}</strong> students
          </div>

          <div className="attendance-table-wrapper">
            <table className="attendance-table">
              <thead>
                <tr>
                  <th className="number-column">#</th>
                  <th>Roll Number</th>
                  <th>Student</th>
                  <th>Branch</th>
                  <th>Study Batch</th>
                  <th>Attendance</th>
                </tr>
              </thead>
              <tbody>
                {filteredStudents.map((student, index) => {
                  const rollNumber = student.rollNumber;
                  const currentStatus = attendance[rollNumber] || ATTENDANCE_PRESENT;
                  const studentName = student.studentName || student.name || "-";

                  return (
                    <tr key={rollNumber}>
                      <td className="number-column"><span className="row-number">{index + 1}</span></td>
                      <td><span className="roll-number">{rollNumber || "-"}</span></td>
                      <td>
                        <div className="student-cell">
                          <div className="student-avatar">{studentName.charAt(0).toUpperCase()}</div>
                          <div>
                            <strong>{studentName}</strong>
                            {student.email && <small>{student.email}</small>}
                            {student.fatherName && <small>Father: {student.fatherName}</small>}
                          </div>
                        </div>
                      </td>
                      <td><span className="branch-text">{student.branch || "-"}</span></td>
                      <td><span className="study-batch-badge">{student.studyBatch || "-"}</span></td>
                      <td>
                        <div className="attendance-toggle">
                          <button
                            type="button"
                            className={currentStatus === ATTENDANCE_PRESENT ? "active present" : ""}
                            disabled={savingAttendance || isLocked}
                            onClick={() => updateAttendance(rollNumber, ATTENDANCE_PRESENT)}
                          >
                            <span>✓</span> Present
                          </button>
                          <button
                            type="button"
                            className={currentStatus === ATTENDANCE_ABSENT ? "active absent" : ""}
                            disabled={savingAttendance || isLocked}
                            onClick={() => updateAttendance(rollNumber, ATTENDANCE_ABSENT)}
                          >
                            <span>×</span> Absent
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}

                {filteredStudents.length === 0 && (
                  <tr>
                    <td colSpan="6" className="attendance-empty">
                      No students match the current search/filter.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          <div className="attendance-sheet-footer">
            <div>
              <strong>Attendance Summary</strong>
              <span>
                {presentCount} present · {absentCount} absent · {totalCount} total · {attendancePercentage}% attendance
              </span>
            </div>

            <button
              className="attendance-save-btn"
              onClick={saveAttendance}
              disabled={savingAttendance || loadingStudents || totalCount === 0 || isLocked}
            >
              {savingAttendance ? "Saving..." : isLocked ? "Saved" : "Save Attendance"}
            </button>
          </div>

        </section>
      )}
    </div>
  );
}
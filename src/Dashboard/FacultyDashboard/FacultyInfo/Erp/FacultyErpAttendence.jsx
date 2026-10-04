import { useEffect, useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import "./FacultyErpAttendence.css";
import Toast from "../../../../Components/Toast/Toast";
import RecentAttendancePanel from "./RecentAttendancePanel"; // adjust path

const API_BASE = (import.meta.env.VITE_API_BASE_URL || "").replace(/\/$/, "");

const ATTENDANCE_PRESENT = "P";
const ATTENDANCE_ABSENT = "A";
const STUDY_YEARS = Array.from({ length: 9 }, (_, index) => String(index + 1));
const SECTIONS = Array.from({ length: 26 }, (_, index) => String.fromCharCode(65 + index));

function formatYear(year) {
  const value = Number(year);
  const suffix = value % 100 >= 11 && value % 100 <= 13
    ? "th"
    : ({ 1: "st", 2: "nd", 3: "rd" }[value % 10] || "th");
  return `${value}${suffix} Year`;
}

function authHeaders(json = true) {
  const headers = { Authorization: `Bearer ${localStorage.getItem("token")}` };
  if (json) headers["Content-Type"] = "application/json";
  return headers;
}

async function readJson(response) {
  const text = await response.text();
  let data = {};
  try { data = text ? JSON.parse(text) : {}; } catch { data = { message: text }; }
  if (!response.ok || data?.success === false) {
    throw new Error(data?.message || data?.detail || "Request failed");
  }
  return data;
}

const facultyApi = {
  getSetup: (domain) =>
    fetch(`${API_BASE}/${domain}/faculty`, {
      headers: authHeaders(false),
    }).then(readJson),

  getSubjects: (domain, course, studyBatch) => {
    const query = new URLSearchParams({ course, studyBatch });
    return fetch(`${API_BASE}/${domain}/erp/attendance/faculty/subjects?${query}`, {
      headers: authHeaders(false),
    }).then(readJson);
  },

  getStudents: (domain, course, studyBatch, subject) => {
    const query = new URLSearchParams({ course, studyBatch, subject });
    return fetch(`${API_BASE}/${domain}/erp/attendance/faculty/students?${query}`, {
      headers: authHeaders(false),
    }).then(readJson);
  },

  getExisting: (domain, studyBatch, subject, date, period) => {
    const query = new URLSearchParams({
      studentBatch: studyBatch,
      subject,
      date,
      period: String(period),
    });
    return fetch(`${API_BASE}/${domain}/erp/attendance/faculty/existing?${query}`, {
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

function normalizeText(value) {
  return String(value || "").trim().toLowerCase();
}

function getLocalDate() {
  const date = new Date();
  const offset = date.getTimezoneOffset() * 60_000;
  return new Date(date.getTime() - offset).toISOString().slice(0, 10);
}

function normalizeAttendanceStatus(value) {
  const status = String(value || "").trim().toUpperCase();
  if (status === "PRESENT" || status === ATTENDANCE_PRESENT) return ATTENDANCE_PRESENT;
  if (status === "ABSENT" || status === ATTENDANCE_ABSENT) return ATTENDANCE_ABSENT;
  return "";
}

export default function FacultyErpAttendence() {
  const { domain } = useParams();

  const [facultyCourse, setFacultyCourse] = useState("");

  const [year, setYear] = useState("");
  const [section, setSection] = useState("");
  const [subjects, setSubjects] = useState([]);
  const [loadingSubjects, setLoadingSubjects] = useState(false);
  const [subject, setSubject] = useState("");
  const [date] = useState(getLocalDate);
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
      const setup = res?.data ?? res ?? {};
      setFacultyCourse(setup.course || "");
    } catch (err) {
      setFacultyCourse("");
      showToast("error", err?.message || "Unable to load teaching assignments.");
    } finally {
      setLoadingAssignments(false);
    }
  }

  const batch = year && section ? `${year}${section}` : "";

  useEffect(() => {
    if (!facultyCourse || !batch) {
      setSubjects([]);
      setSubject("");
      setLoadingSubjects(false);
      return undefined;
    }

    let isCurrentRequest = true;
    setSubjects([]);
    setSubject("");
    setLoadingSubjects(true);

    facultyApi
      .getSubjects(domain, facultyCourse, batch)
      .then((response) => {
        if (!isCurrentRequest) return;
        const subjectList = Array.isArray(response?.data) ? response.data : [];
        setSubjects(subjectList);
        if (subjectList.length === 0) {
          showToast("info", `No subjects found for teaching batch ${batch}.`);
        }
      })
      .catch((err) => {
        if (!isCurrentRequest) return;
        setSubjects([]);
        showToast("error", err?.message || "Unable to load subjects for this teaching batch.");
      })
      .finally(() => {
        if (isCurrentRequest) setLoadingSubjects(false);
      });

    return () => {
      isCurrentRequest = false;
    };
  }, [domain, facultyCourse, batch]);

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

  function handleYearChange(event) {
    setYear(event.target.value);
    setSubject("");
    resetStudents();
  }

  function handleSectionChange(event) {
    setSection(event.target.value);
    setSubject("");
    resetStudents();
  }

  function handleSubjectChange(event) {
    setSubject(event.target.value);
    resetStudents();
  }

  function handlePeriodChange(event) {
    setPeriod(event.target.value);
    resetStudents(); // ---- NEW: changing period means a different session, so unlock/clear ----
  }

  async function loadStudents() {
    if (!facultyCourse) return showToast("error", "Unable to determine your faculty course.");
    if (!batch) return showToast("error", "Please select a teaching batch.");
    if (!subject) return showToast("error", "Please select a subject.");
    if (!period || Number(period) < 1) return showToast("error", "Please enter a valid period.");

    try {
      setLoadingStudents(true);

      const [res, existing] = await Promise.all([
        facultyApi.getStudents(domain, facultyCourse, batch, subject),
        facultyApi.getExisting(domain, batch, subject, date, Number(period)),
      ]);
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

      const existingAttendance = existing?.data?.attendance || {};
      const initialAttendance = {};
      uniqueStudents.forEach((student) => {
        const rollNumber = String(student?.rollNumber || "").trim();
        const priorStatus = normalizeAttendanceStatus(existingAttendance[rollNumber]);
        if (rollNumber) {
          initialAttendance[rollNumber] = priorStatus || ATTENDANCE_PRESENT;
        }
      });
      setAttendance(initialAttendance);
      setIsLocked(existing?.data?.alreadyMarked === true);

      if (uniqueStudents.length === 0) {
        showToast("info", `No students found for batch ${batch} and subject ${subject}.`);
      } else if (existing?.data?.alreadyMarked) {
        showToast("info", "Attendance already exists for today. Review it or choose Edit Attendance.");
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
        studyBatch: batch,
        subject,
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
          <p>Choose a year, section, and subject to mark student attendance.</p>
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
            <p>Choose a year and section. Subjects are loaded from students in that teaching batch.</p>
          </div>
          <div className="setup-status">
            <span className="status-dot" />
            {loadingAssignments
              ? "Loading faculty profile..."
              : batch && loadingSubjects
                ? `Finding subjects for ${batch}...`
                : batch
                  ? `${subjects.length} subject${subjects.length === 1 ? "" : "s"} found`
                  : "Choose year and section"}
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
            <label htmlFor="attendance-year">Year</label>
            <select
              id="attendance-year"
              value={year}
              onChange={handleYearChange}
              disabled={loadingAssignments || loadingStudents || savingAttendance}
            >
              <option value="">Select year</option>
              {STUDY_YEARS.map((item) => (
                <option key={item} value={item}>{formatYear(item)}</option>
              ))}
            </select>
            <small>Select the current study year (1 to 9).</small>
          </div>

          <div className="attendance-form-group">
            <label htmlFor="attendance-section">Section</label>
            <select
              id="attendance-section"
              value={section}
              onChange={handleSectionChange}
              disabled={loadingAssignments || loadingStudents || savingAttendance}
            >
              <option value="">Select section</option>
              {SECTIONS.map((item) => (
                <option key={item} value={item}>Section {item}</option>
              ))}
            </select>
            <small>Select a section from A to Z.</small>
          </div>

          <div className="attendance-form-group attendance-readonly-group">
            <label htmlFor="attendance-teaching-batch">Teaching Batch</label>
            <input
              id="attendance-teaching-batch"
              type="text"
              value={batch}
              placeholder="Year + section"
              readOnly
              aria-readonly="true"
              disabled={!batch || loadingStudents || savingAttendance}
            />
            <small>Automatically combined, e.g. 2A.</small>
          </div>

          <div className="attendance-form-group">
            <label htmlFor="attendance-subject">Subject</label>
            <select
              id="attendance-subject"
              value={subject}
              disabled={!batch || loadingSubjects || loadingStudents || savingAttendance || subjects.length === 0}
              onChange={handleSubjectChange}
            >
              <option value="">
                {loadingSubjects ? "Loading subjects..." : "Select subject"}
              </option>
              {subjects.map((item) => (
                <option key={item} value={item}>{item}</option>
              ))}
            </select>
          </div>

          <div className="attendance-form-group">
            <label htmlFor="attendance-date">Attendance Date</label>
            <input
              id="attendance-date"
              type="text"
              value={date}
              readOnly
              aria-readonly="true"
              disabled={loadingStudents || savingAttendance}
            />
            <small>Attendance is recorded for today by the server.</small>
          </div>

          <div className="attendance-form-group">
            <label htmlFor="attendance-period">Period</label>
            <input
              id="attendance-period"
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
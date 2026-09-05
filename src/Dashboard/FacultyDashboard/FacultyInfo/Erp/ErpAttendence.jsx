import { useEffect, useMemo, useState } from "react";
import { attendanceApi } from "../../../../api/attendanceApi";

import "./ErpAttendence.css";

export default function ErpAttendence() {

    // =========================================================
    // STATE
    // =========================================================

    const [assignments, setAssignments] = useState({});

    const [batch, setBatch] = useState("");
    const [subject, setSubject] = useState("");

    const [students, setStudents] = useState([]);
    const [attendance, setAttendance] = useState({});

    const [date, setDate] = useState(
        new Date().toISOString().split("T")[0]
    );

    const [period, setPeriod] = useState(1);
    const [session, setSession] = useState("2026-27");

    const [loading, setLoading] = useState(false);

    const [message, setMessage] = useState("");
    const [error, setError] = useState("");


    // =========================================================
    // LOAD FACULTY ASSIGNMENTS
    // =========================================================
    //
    // Example:
    //
    // {
    //     "2A": ["JAVA", "DSA"],
    //     "2B": ["OS"]
    // }
    //
    // This only controls what the faculty can select.
    // Backend performs the final authorization.
    //
    // =========================================================

    useEffect(() => {
        loadAssignments();
    }, []);


    async function loadAssignments() {

        try {

            setError("");

            const data =
                await attendanceApi.getFacultyAssignments();

            setAssignments(data || {});

        } catch (err) {

            setError(
                err.message ||
                "Unable to load your teaching assignments."
            );
        }
    }


    // =========================================================
    // BATCHES
    // =========================================================

    const batches = useMemo(
        () => Object.keys(assignments || {}),
        [assignments]
    );


    // =========================================================
    // SUBJECTS FOR SELECTED BATCH
    // =========================================================

    const subjects =
        batch
            ? assignments[batch] || []
            : [];


    // =========================================================
    // ATTENDANCE COUNTS
    // =========================================================

    const presentCount =
        students.filter(
            student =>
                attendance[student.rollNumber] === "P"
        ).length;


    const absentCount =
        students.filter(
            student =>
                attendance[student.rollNumber] === "A"
        ).length;


    const totalCount = students.length;


    // =========================================================
    // LOAD STUDENTS
    // =========================================================
    //
    // Backend decides the correct students:
    //
    // Faculty course
    //       +
    // Selected study batch
    //       +
    // Student subject
    //
    // Frontend does NOT need student ID.
    //
    // =========================================================

    async function loadStudents() {

        if (!batch || !subject) {

            setError(
                "Please select a teaching batch and subject."
            );

            return;
        }


        try {

            setLoading(true);

            setError("");
            setMessage("");

            const data =
                await attendanceApi.getFacultyStudents(
                    batch,
                    subject
                );


            const list =
                Array.isArray(data)
                    ? data
                    : [];


            setStudents(list);


            // -------------------------------------------------
            // Default every student to PRESENT.
            //
            // Key = rollNumber
            // -------------------------------------------------

            const initialAttendance = {};


            list.forEach(student => {

                if (student.rollNumber) {

                    initialAttendance[
                        student.rollNumber
                    ] = "P";
                }
            });


            setAttendance(initialAttendance);


            if (list.length === 0) {

                setMessage(
                    "No students found for this batch and subject."
                );
            }

        } catch (err) {

            setStudents([]);
            setAttendance({});

            setError(
                err.message ||
                "Unable to load students."
            );

        } finally {

            setLoading(false);
        }
    }


    // =========================================================
    // UPDATE ATTENDANCE
    // =========================================================

    function updateAttendance(
        rollNumber,
        status
    ) {

        setAttendance(prev => ({
            ...prev,
            [rollNumber]: status
        }));
    }


    // =========================================================
    // MARK ALL PRESENT
    // =========================================================

    function markAllPresent() {

        const updated = {};

        students.forEach(student => {

            if (student.rollNumber) {

                updated[
                    student.rollNumber
                ] = "P";
            }
        });

        setAttendance(updated);
    }


    // =========================================================
    // MARK ALL ABSENT
    // =========================================================

    function markAllAbsent() {

        const updated = {};

        students.forEach(student => {

            if (student.rollNumber) {

                updated[
                    student.rollNumber
                ] = "A";
            }
        });

        setAttendance(updated);
    }


    // =========================================================
    // SAVE ATTENDANCE
    // =========================================================

    async function saveAttendance() {

        if (!students.length) {

            setError(
                "Please load students before saving attendance."
            );

            return;
        }


        if (!date || !period || !session) {

            setError(
                "Date, period and academic session are required."
            );

            return;
        }


        try {

            setLoading(true);

            setError("");
            setMessage("");


            await attendanceApi.markAttendance({

                teachingBatch: batch,

                subject: subject,

                attendanceDate: date,

                periodNumber: Number(period),

                academicSession: session,

                // ---------------------------------------------
                // IMPORTANT:
                // Backend expects Map<String, String>
                //
                // Example:
                //
                // {
                //     "101": "P",
                //     "102": "A"
                // }
                // ---------------------------------------------

                attendance: attendance
            });


            setMessage(
                "Attendance saved successfully."
            );

        } catch (err) {

            setError(
                err.message ||
                "Unable to save attendance."
            );

        } finally {

            setLoading(false);
        }
    }


    // =========================================================
    // RESET STUDENT LIST
    // =========================================================

    function resetStudents() {

        setStudents([]);
        setAttendance({});

        setMessage("");
        setError("");
    }


    // =========================================================
    // UI
    // =========================================================

    return (

        <div className="attendance-page">

            {/* =================================================
                PAGE HEADER
            ================================================= */}

            <div className="attendance-page-header">

                <div>

                    <div className="attendance-page-label">
                        ERP / Attendance
                    </div>

                    <h1>
                        Mark Attendance
                    </h1>

                    <p>
                        Manage attendance for your assigned
                        classes and subjects.
                    </p>

                </div>

                <div className="attendance-header-icon">
                    ✓
                </div>

            </div>


            {/* =================================================
                ALERTS
            ================================================= */}

            {message && (

                <div className="attendance-alert success">

                    <span className="alert-icon">
                        ✓
                    </span>

                    <span>
                        {message}
                    </span>

                </div>
            )}


            {error && (

                <div className="attendance-alert error">

                    <span className="alert-icon">
                        !
                    </span>

                    <span>
                        {error}
                    </span>

                </div>
            )}


            {/* =================================================
                ATTENDANCE SETUP
            ================================================= */}

            <section className="attendance-card">

                <div className="attendance-card-header">

                    <div>

                        <h2>
                            Attendance Details
                        </h2>

                        <p>
                            Select the class information to
                            load eligible students.
                        </p>

                    </div>

                    <div className="setup-status">

                        <span className="status-dot" />

                        Faculty Attendance

                    </div>

                </div>


                <div className="attendance-form-grid">

                    {/* =================================================
                        BATCH
                    ================================================= */}

                    <div className="attendance-form-group">

                        <label>
                            Teaching Batch
                        </label>

                        <select
                            value={batch}
                            onChange={e => {

                                setBatch(e.target.value);

                                setSubject("");

                                resetStudents();
                            }}
                        >

                            <option value="">
                                Select teaching batch
                            </option>

                            {batches.map(item => (

                                <option
                                    key={item}
                                    value={item}
                                >
                                    {item}
                                </option>

                            ))}

                        </select>

                    </div>


                    {/* =================================================
                        SUBJECT
                    ================================================= */}

                    <div className="attendance-form-group">

                        <label>
                            Subject
                        </label>

                        <select
                            value={subject}
                            disabled={!batch}
                            onChange={e => {

                                setSubject(e.target.value);

                                resetStudents();
                            }}
                        >

                            <option value="">
                                Select subject
                            </option>

                            {subjects.map(item => (

                                <option
                                    key={item}
                                    value={item}
                                >
                                    {item}
                                </option>

                            ))}

                        </select>

                    </div>


                    {/* =================================================
                        DATE
                    ================================================= */}

                    <div className="attendance-form-group">

                        <label>
                            Attendance Date
                        </label>

                        <input
                            type="date"
                            value={date}
                            max={
                                new Date()
                                    .toISOString()
                                    .split("T")[0]
                            }
                            onChange={e =>
                                setDate(e.target.value)
                            }
                        />

                    </div>


                    {/* =================================================
                        PERIOD
                    ================================================= */}

                    <div className="attendance-form-group">

                        <label>
                            Period
                        </label>

                        <input
                            type="number"
                            min="1"
                            max="20"
                            value={period}
                            onChange={e =>
                                setPeriod(e.target.value)
                            }
                        />

                    </div>


                    {/* =================================================
                        ACADEMIC SESSION
                    ================================================= */}

                    <div className="attendance-form-group">

                        <label>
                            Academic Session
                        </label>

                        <input
                            type="text"
                            value={session}
                            placeholder="2026-27"
                            onChange={e =>
                                setSession(e.target.value)
                            }
                        />

                    </div>

                </div>


                {/* =================================================
                    LOAD BUTTON
                ================================================= */}

                <div className="attendance-setup-footer">

                    <button
                        className="attendance-primary-btn"
                        onClick={loadStudents}
                        disabled={
                            loading ||
                            !batch ||
                            !subject
                        }
                    >

                        {loading
                            ? "Loading students..."
                            : "Load Students"}

                    </button>

                </div>

            </section>


            {/* =================================================
                ATTENDANCE SHEET
            ================================================= */}

            {students.length > 0 && (

                <section className="attendance-card attendance-sheet">

                    {/* =================================================
                        SHEET HEADER
                    ================================================= */}

                    <div className="attendance-sheet-header">

                        <div>

                            <div className="sheet-title-row">

                                <h2>
                                    {subject}
                                </h2>

                                <span className="batch-badge">
                                    {batch}
                                </span>

                            </div>

                            <p>
                                Attendance sheet for{" "}
                                <strong>
                                    {date}
                                </strong>
                                {" "}· Period {period}
                            </p>

                        </div>


                        {/* =================================================
                            SUMMARY
                        ================================================= */}

                        <div className="attendance-summary">

                            <div className="summary-item">

                                <span className="summary-label">
                                    Total
                                </span>

                                <strong>
                                    {totalCount}
                                </strong>

                            </div>


                            <div className="summary-item present-summary">

                                <span className="summary-label">
                                    Present
                                </span>

                                <strong>
                                    {presentCount}
                                </strong>

                            </div>


                            <div className="summary-item absent-summary">

                                <span className="summary-label">
                                    Absent
                                </span>

                                <strong>
                                    {absentCount}
                                </strong>

                            </div>

                        </div>

                    </div>


                    {/* =================================================
                        QUICK ACTIONS
                    ================================================= */}

                    <div className="attendance-quick-actions">

                        <span>
                            Quick actions
                        </span>

                        <button
                            type="button"
                            onClick={markAllPresent}
                        >
                            ✓ Mark All Present
                        </button>

                        <button
                            type="button"
                            onClick={markAllAbsent}
                        >
                            × Mark All Absent
                        </button>

                    </div>


                    {/* =================================================
                        TABLE
                    ================================================= */}

                    <div className="attendance-table-wrapper">

                        <table className="attendance-table">

                            <thead>

                                <tr>

                                    <th className="number-column">
                                        #
                                    </th>

                                    <th>
                                        Roll Number
                                    </th>

                                    <th>
                                        Student
                                    </th>

                                    <th>
                                        Branch
                                    </th>

                                    <th>
                                        Study Batch
                                    </th>

                                    <th className="attendance-column">
                                        Attendance
                                    </th>

                                </tr>

                            </thead>


                            <tbody>

                                {students.map(
                                    (student, index) => {

                                        const currentStatus =
                                            attendance[
                                                student.rollNumber
                                            ] || "P";


                                        return (

                                            <tr
                                                key={
                                                    student.rollNumber
                                                }
                                            >

                                                {/* =========================
                                                    NUMBER
                                                ========================= */}

                                                <td className="number-column">

                                                    <span className="row-number">
                                                        {index + 1}
                                                    </span>

                                                </td>


                                                {/* =========================
                                                    ROLL NUMBER
                                                ========================= */}

                                                <td>

                                                    <span className="roll-number">
                                                        {
                                                            student.rollNumber ||
                                                            "-"
                                                        }
                                                    </span>

                                                </td>


                                                {/* =========================
                                                    STUDENT
                                                ========================= */}

                                                <td>

                                                    <div className="student-cell">

                                                        <div className="student-avatar">

                                                            {
                                                                (
                                                                    student.studentName ||
                                                                    "S"
                                                                )
                                                                    .charAt(0)
                                                                    .toUpperCase()
                                                            }

                                                        </div>

                                                        <div>

                                                            <strong>
                                                                {
                                                                    student.studentName ||
                                                                    "-"
                                                                }
                                                            </strong>

                                                            {student.fatherName && (

                                                                <small>
                                                                    Father:{" "}
                                                                    {
                                                                        student.fatherName
                                                                    }
                                                                </small>

                                                            )}

                                                        </div>

                                                    </div>

                                                </td>


                                                {/* =========================
                                                    BRANCH
                                                ========================= */}

                                                <td>

                                                    <span className="branch-text">

                                                        {
                                                            student.branch ||
                                                            "-"
                                                        }

                                                    </span>

                                                </td>


                                                {/* =========================
                                                    STUDY BATCH
                                                ========================= */}

                                                <td>

                                                    <span className="study-batch-badge">

                                                        {
                                                            student.studyBatch ||
                                                            "-"
                                                        }

                                                    </span>

                                                </td>


                                                {/* =========================
                                                    ATTENDANCE
                                                ========================= */}

                                                <td>

                                                    <div className="attendance-toggle">

                                                        <button
                                                            type="button"
                                                            className={
                                                                currentStatus === "P"
                                                                    ? "active present"
                                                                    : ""
                                                            }
                                                            onClick={() =>
                                                                updateAttendance(
                                                                    student.rollNumber,
                                                                    "P"
                                                                )
                                                            }
                                                        >
                                                            <span>
                                                                ✓
                                                            </span>

                                                            Present
                                                        </button>


                                                        <button
                                                            type="button"
                                                            className={
                                                                currentStatus === "A"
                                                                    ? "active absent"
                                                                    : ""
                                                            }
                                                            onClick={() =>
                                                                updateAttendance(
                                                                    student.rollNumber,
                                                                    "A"
                                                                )
                                                            }
                                                        >
                                                            <span>
                                                                ×
                                                            </span>

                                                            Absent
                                                        </button>

                                                    </div>

                                                </td>

                                            </tr>

                                        );
                                    }
                                )}

                            </tbody>

                        </table>

                    </div>


                    {/* =================================================
                        SAVE FOOTER
                    ================================================= */}

                    <div className="attendance-sheet-footer">

                        <div>

                            <strong>
                                Ready to save?
                            </strong>

                            <span>
                                {presentCount} present ·{" "}
                                {absentCount} absent ·{" "}
                                {totalCount} total
                            </span>

                        </div>


                        <button
                            className="attendance-save-btn"
                            onClick={saveAttendance}
                            disabled={loading}
                        >

                            {loading
                                ? "Saving..."
                                : "Save Attendance"}

                        </button>

                    </div>

                </section>
            )}

        </div>
    );
}

import { useEffect, useState } from "react";

import { attendanceApi } from "../../../api/attendanceApi";

export default function ErpAttendence() {

    const [assignments, setAssignments] =
        useState({});

    const [batch, setBatch] =
        useState("");

    const [subject, setSubject] =
        useState("");

    const [students, setStudents] =
        useState([]);

    const [attendance, setAttendance] =
        useState({});

    const [date, setDate] =
        useState(
            new Date()
                .toISOString()
                .split("T")[0]
        );

    const [period, setPeriod] =
        useState(1);

    const [session, setSession] =
        useState("2026-27");

    const [loading, setLoading] =
        useState(false);

    const [message, setMessage] =
        useState("");

    const [error, setError] =
        useState("");


    // ==========================================
    // LOAD FACULTY ASSIGNMENTS
    // ==========================================

    useEffect(() => {

        loadAssignments();

    }, []);


    async function loadAssignments() {

        try {

            const data =
                await attendanceApi
                    .getFacultyAssignments();

            setAssignments(data || {});

        } catch (err) {

            setError(err.message);

        }

    }


    // ==========================================
    // SELECT BATCH
    // ==========================================

    const batches =
        Object.keys(assignments || {});


    const subjects =
        batch
            ? assignments[batch] || []
            : [];


    async function loadStudents() {

        if (!batch || !subject) {

            setError(
                "Select batch and subject first."
            );

            return;
        }


        try {

            setLoading(true);
            setError("");

            const data =
                await attendanceApi
                    .getFacultyStudents(
                        batch,
                        subject
                    );

            setStudents(data || []);


            const initial = {};

            data.forEach((student) => {

                /*
                 * Backend AttendanceMarkRequest
                 * expects Map<Long,String>
                 *
                 * BUT AttendanceStudentResponse
                 * currently doesn't return Student ID.
                 *
                 * This is a backend issue.
                 */

                initial[student.id] =
                    "P";

            });

            setAttendance(initial);

        } catch (err) {

            setError(err.message);

        } finally {

            setLoading(false);

        }

    }


    async function saveAttendance() {

        try {

            setLoading(true);
            setError("");
            setMessage("");


            const request = {

                teachingBatch: batch,

                subject,

                attendanceDate: date,

                periodNumber: Number(period),

                academicSession: session,

                attendance

            };


            await attendanceApi
                .markAttendance(request);


            setMessage(
                "Attendance saved successfully."
            );

        } catch (err) {

            setError(err.message);

        } finally {

            setLoading(false);

        }

    }


    return (

        <div>

            <div className="erp-page-heading">

                <h1>
                    Mark Attendance
                </h1>

                <p>
                    Select your batch and subject,
                    then mark attendance.
                </p>

            </div>


            {message && (
                <div
                    className="erp-card"
                    style={{
                        marginBottom: 15,
                        color: "green"
                    }}
                >
                    {message}
                </div>
            )}


            {error && (
                <div
                    className="erp-card"
                    style={{
                        marginBottom: 15,
                        color: "#dc2626"
                    }}
                >
                    {error}
                </div>
            )}


            <div className="erp-card">

                <div
                    style={{
                        display: "grid",
                        gridTemplateColumns:
                            "repeat(auto-fit,minmax(180px,1fr))",
                        gap: 15
                    }}
                >

                    <div>

                        <label>
                            Batch
                        </label>

                        <select
                            value={batch}
                            onChange={(e) => {

                                setBatch(e.target.value);
                                setSubject("");
                                setStudents([]);

                            }}
                            style={{
                                width: "100%",
                                padding: 10,
                                marginTop: 6
                            }}
                        >

                            <option value="">
                                Select batch
                            </option>

                            {batches.map(
                                (item) => (

                                    <option
                                        key={item}
                                        value={item}
                                    >
                                        {item}
                                    </option>

                                )
                            )}

                        </select>

                    </div>


                    <div>

                        <label>
                            Subject
                        </label>

                        <select
                            value={subject}
                            onChange={(e) =>
                                setSubject(
                                    e.target.value
                                )
                            }
                            style={{
                                width: "100%",
                                padding: 10,
                                marginTop: 6
                            }}
                            disabled={!batch}
                        >

                            <option value="">
                                Select subject
                            </option>

                            {subjects.map(
                                (item) => (

                                    <option
                                        key={item}
                                        value={item}
                                    >
                                        {item}
                                    </option>

                                )
                            )}

                        </select>

                    </div>


                    <div>

                        <label>
                            Date
                        </label>

                        <input
                            type="date"
                            value={date}
                            onChange={(e) =>
                                setDate(
                                    e.target.value
                                )
                            }
                            style={{
                                width: "100%",
                                padding: 10,
                                marginTop: 6
                            }}
                        />

                    </div>


                    <div>

                        <label>
                            Period
                        </label>

                        <input
                            type="number"
                            min="1"
                            value={period}
                            onChange={(e) =>
                                setPeriod(
                                    e.target.value
                                )
                            }
                            style={{
                                width: "100%",
                                padding: 10,
                                marginTop: 6
                            }}
                        />

                    </div>

                </div>


                <button
                    onClick={loadStudents}
                    disabled={loading}
                    style={{
                        marginTop: 20,
                        padding: "11px 20px",
                        background: "#2563eb",
                        color: "white",
                        border: 0,
                        borderRadius: 8,
                        cursor: "pointer"
                    }}
                >
                    Load Students
                </button>

            </div>


            {students.length > 0 && (

                <div
                    className="erp-card"
                    style={{
                        marginTop: 20,
                        overflowX: "auto"
                    }}
                >

                    <h3>
                        Students
                    </h3>


                    <table
                        style={{
                            width: "100%",
                            borderCollapse:
                                "collapse",
                            marginTop: 15
                        }}
                    >

                        <thead>

                            <tr>

                                <th>
                                    Roll Number
                                </th>

                                <th>
                                    Student
                                </th>

                                <th>
                                    Batch
                                </th>

                                <th>
                                    Attendance
                                </th>

                            </tr>

                        </thead>


                        <tbody>

                            {students.map(
                                (student) => (

                                    <tr
                                        key={
                                            student.id
                                        }
                                    >

                                        <td>
                                            {
                                                student.rollNumber
                                            }
                                        </td>

                                        <td>
                                            {
                                                student.studentName
                                            }
                                        </td>

                                        <td>
                                            {
                                                student.studyBatch
                                            }
                                        </td>

                                        <td>

                                            <select
                                                value={
                                                    attendance[
                                                        student.id
                                                    ] || "P"
                                                }
                                                onChange={
                                                    (e) =>
                                                        setAttendance(
                                                            prev => ({
                                                                ...prev,
                                                                [student.id]:
                                                                    e.target.value
                                                            })
                                                        )
                                                }
                                            >

                                                <option value="P">
                                                    Present
                                                </option>

                                                <option value="A">
                                                    Absent
                                                </option>

                                            </select>

                                        </td>

                                    </tr>

                                )
                            )}

                        </tbody>

                    </table>


                    <button
                        onClick={saveAttendance}
                        disabled={loading}
                        style={{
                            marginTop: 20,
                            padding:
                                "12px 25px",
                            background:
                                "#16a34a",
                            color: "white",
                            border: 0,
                            borderRadius: 8,
                            fontWeight: 700,
                            cursor: "pointer"
                        }}
                    >
                        Save Attendance
                    </button>

                </div>

            )}

        </div>
    );
}























/*
import { useEffect, useMemo, useState } from "react";
import { attendanceApi } from "../../../api/attendanceApi";

export default function ErpAttendence() {
    const [assignments, setAssignments] = useState({});
    const [batch, setBatch] = useState("");
    const [subject, setSubject] = useState("");
    const [students, setStudents] = useState([]);
    const [attendance, setAttendance] = useState({});
    const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
    const [period, setPeriod] = useState(1);
    const [session, setSession] = useState("2026-27");
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState("");
    const [error, setError] = useState("");

    useEffect(() => {
        loadAssignments();
    }, []);

    async function loadAssignments() {
        try {
            setError("");
            const data = await attendanceApi.getFacultyAssignments();
            setAssignments(data || {});
        } catch (err) {
            setError(err.message || "Failed to load teaching assignments.");
        }
    }

    const batches = useMemo(() => Object.keys(assignments), [assignments]);
    const subjects = batch ? assignments[batch] || [] : [];

    const presentCount = students.filter(
        s => attendance[s.studentId] === "P"
    ).length;

    const absentCount = students.length - presentCount;

    async function loadStudents() {
        if (!batch || !subject) {
            setError("Please select batch and subject.");
            return;
        }

        try {
            setLoading(true);
            setError("");
            setMessage("");

            const data = await attendanceApi.getFacultyStudents(batch, subject);
            const list = Array.isArray(data) ? data : [];

            setStudents(list);

            const initial = {};
            list.forEach(student => {
                if (student.studentId != null) {
                    initial[student.studentId] = "P";
                }
            });

            setAttendance(initial);
        } catch (err) {
            setStudents([]);
            setAttendance({});
            setError(err.message || "Failed to load students.");
        } finally {
            setLoading(false);
        }
    }

    async function saveAttendance() {
        if (!students.length) {
            setError("Load students before saving attendance.");
            return;
        }

        if (!date || !period || !session) {
            setError("Date, period and academic session are required.");
            return;
        }

        try {
            setLoading(true);
            setError("");
            setMessage("");

            await attendanceApi.markAttendance({
                teachingBatch: batch,
                subject,
                attendanceDate: date,
                periodNumber: Number(period),
                academicSession: session,
                attendance
            });

            setMessage("Attendance saved successfully.");
        } catch (err) {
            setError(err.message || "Failed to save attendance.");
        } finally {
            setLoading(false);
        }
    }

    function updateAttendance(studentId, status) {
        setAttendance(prev => ({
            ...prev,
            [studentId]: status
        }));
    }

    return (
        <div className="erp-page">
            <div className="erp-page-heading">
                <h1>Mark Attendance</h1>
                <p>Manage student attendance for your assigned batch and subject.</p>
            </div>

            {message && <div className="erp-alert erp-alert-success">{message}</div>}
            {error && <div className="erp-alert erp-alert-error">{error}</div>}

            <div className="erp-card">
                <div className="erp-card-header">
                    <div>
                        <h3>Attendance Details</h3>
                        <p>Select the class details before loading students.</p>
                    </div>
                </div>

                <div className="erp-form-grid">
                    <div className="erp-form-group">
                        <label>Teaching Batch</label>
                        <select
                            value={batch}
                            onChange={e => {
                                setBatch(e.target.value);
                                setSubject("");
                                setStudents([]);
                                setAttendance({});
                            }}
                        >
                            <option value="">Select batch</option>
                            {batches.map(item => (
                                <option key={item} value={item}>{item}</option>
                            ))}
                        </select>
                    </div>

                    <div className="erp-form-group">
                        <label>Subject</label>
                        <select
                            value={subject}
                            onChange={e => {
                                setSubject(e.target.value);
                                setStudents([]);
                                setAttendance({});
                            }}
                            disabled={!batch}
                        >
                            <option value="">Select subject</option>
                            {subjects.map(item => (
                                <option key={item} value={item}>{item}</option>
                            ))}
                        </select>
                    </div>

                    <div className="erp-form-group">
                        <label>Attendance Date</label>
                        <input
                            type="date"
                            value={date}
                            max={new Date().toISOString().split("T")[0]}
                            onChange={e => setDate(e.target.value)}
                        />
                    </div>

                    <div className="erp-form-group">
                        <label>Period</label>
                        <input
                            type="number"
                            min="1"
                            max="20"
                            value={period}
                            onChange={e => setPeriod(e.target.value)}
                        />
                    </div>

                    <div className="erp-form-group">
                        <label>Academic Session</label>
                        <input
                            value={session}
                            placeholder="2026-27"
                            onChange={e => setSession(e.target.value)}
                        />
                    </div>
                </div>

                <button
                    className="erp-primary-btn"
                    onClick={loadStudents}
                    disabled={loading || !batch || !subject}
                >
                    {loading ? "Loading..." : "Load Students"}
                </button>
            </div>

            {students.length > 0 && (
                <div className="erp-card erp-attendance-card">
                    <div className="erp-card-header">
                        <div>
                            <h3>{subject} — {batch}</h3>
                            <p>{students.length} students found</p>
                        </div>

                        <div className="erp-attendance-summary">
                            <span className="attendance-present">
                                Present: {presentCount}
                            </span>
                            <span className="attendance-absent">
                                Absent: {absentCount}
                            </span>
                        </div>
                    </div>

                    <div className="table-wrapper">
                        <table className="erp-table">
                            <thead>
                                <tr>
                                    <th>#</th>
                                    <th>Roll Number</th>
                                    <th>Student</th>
                                    <th>Study Batch</th>
                                    <th>Attendance</th>
                                </tr>
                            </thead>

                            <tbody>
                                {students.map((student, index) => (
                                    <tr key={student.studentId}>
                                        <td>{index + 1}</td>
                                        <td>{student.rollNumber || "-"}</td>
                                        <td>
                                            <strong>{student.studentName || "-"}</strong>
                                            {student.fatherName && (
                                                <small>Father: {student.fatherName}</small>
                                            )}
                                        </td>
                                        <td>{student.studyBatch || "-"}</td>
                                        <td>
                                            <div className="attendance-toggle">
                                                <button
                                                    type="button"
                                                    className={
                                                        attendance[student.studentId] === "P"
                                                            ? "active present"
                                                            : ""
                                                    }
                                                    onClick={() =>
                                                        updateAttendance(student.studentId, "P")
                                                    }
                                                >
                                                    Present
                                                </button>

                                                <button
                                                    type="button"
                                                    className={
                                                        attendance[student.studentId] === "A"
                                                            ? "active absent"
                                                            : ""
                                                    }
                                                    onClick={() =>
                                                        updateAttendance(student.studentId, "A")
                                                    }
                                                >
                                                    Absent
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    <div className="erp-attendance-footer">
                        <button
                            className="erp-success-btn"
                            onClick={saveAttendance}
                            disabled={loading}
                        >
                            {loading ? "Saving..." : "Save Attendance"}
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
*/
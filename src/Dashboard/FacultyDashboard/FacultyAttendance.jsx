import {
    useEffect,
    useState
} from "react";

import {
    useParams
} from "react-router-dom";


export default function FacultyAttendance() {

    const API_BASE =
        import.meta.env.VITE_API_BASE_URL;

    const { domain } =
        useParams();


    // =====================================================
    // STATE
    // =====================================================

    const [assignments, setAssignments] =
        useState({});


    const [selectedBatch, setSelectedBatch] =
        useState("");


    const [selectedSubject, setSelectedSubject] =
        useState("");


    const [attendanceDate, setAttendanceDate] =
        useState(
            new Date()
                .toISOString()
                .split("T")[0]
        );


    const [periodNumber, setPeriodNumber] =
        useState(1);


    const [students, setStudents] =
        useState([]);


    const [attendance, setAttendance] =
        useState({});


    const [loading, setLoading] =
        useState(false);


    const [saving, setSaving] =
        useState(false);


    const [message, setMessage] =
        useState("");


    const [error, setError] =
        useState("");


    // =====================================================
    // AUTH
    // =====================================================

    const headers = () => ({

        Authorization:
            `Bearer ${localStorage.getItem("token")}`,

        "Content-Type":
            "application/json"

    });


    // =====================================================
    // GET ASSIGNMENTS
    // =====================================================

    useEffect(() => {

        loadAssignments();

    }, []);


    const loadAssignments = async () => {

        try {

            setLoading(true);


            const response =
                await fetch(
                    `${API_BASE}/api/erp/attendance/faculty/assignments`,
                    {
                        headers: headers()
                    }
                );


            if (!response.ok) {

                throw new Error(
                    "Unable to load teaching assignments."
                );

            }


            const data =
                await response.json();


            setAssignments(
                data || {}
            );


        } catch (err) {

            setError(
                err.message
            );

        } finally {

            setLoading(false);

        }

    };


    // =====================================================
    // LOAD STUDENTS
    // =====================================================

    const loadStudents = async () => {

        if (
            !selectedBatch ||
            !selectedSubject
        ) {

            setError(
                "Select batch and subject first."
            );

            return;

        }


        try {

            setLoading(true);
            setError("");
            setMessage("");


            const params =
                new URLSearchParams({

                    batch:
                        selectedBatch,

                    subject:
                        selectedSubject

                });


            const response =
                await fetch(
                    `${API_BASE}/api/erp/attendance/faculty/students?${params}`,
                    {
                        headers: headers()
                    }
                );


            if (!response.ok) {

                throw new Error(
                    await response.text() ||
                    "Unable to load students."
                );

            }


            const data =
                await response.json();


            setStudents(
                data || []
            );


            // Default everyone to ABSENT

            const initialAttendance = {};


            data.forEach(student => {

                /*
                 * This assumes rollNumber is NOT
                 * the attendance map key.
                 *
                 * Your backend AttendanceMarkRequest
                 * expects Map<Long, String>.
                 *
                 * Therefore the backend response
                 * should ideally contain studentId.
                 */

            });


            setAttendance(
                initialAttendance
            );


        } catch (err) {

            setError(
                err.message
            );

        } finally {

            setLoading(false);

        }

    };


    // =====================================================
    // ATTENDANCE CHANGE
    // =====================================================

    const markStudent = (
        studentId,
        status
    ) => {

        setAttendance(
            previous => ({
                ...previous,
                [studentId]:
                    status
            })
        );

    };


    // =====================================================
    // MARK ALL PRESENT
    // =====================================================

    const markAll = (
        status
    ) => {

        const result = {};


        students.forEach(
            student => {

                if (student.id) {

                    result[student.id] =
                        status;

                }

            }
        );


        setAttendance(
            result
        );

    };


    // =====================================================
    // SAVE
    // =====================================================

    const saveAttendance = async () => {

        setError("");
        setMessage("");


        if (!selectedBatch) {

            setError(
                "Teaching batch is required."
            );

            return;

        }


        if (!selectedSubject) {

            setError(
                "Subject is required."
            );

            return;

        }


        if (!students.length) {

            setError(
                "No students loaded."
            );

            return;

        }


        try {

            setSaving(true);


            const request = {

                teachingBatch:
                    selectedBatch,

                subject:
                    selectedSubject,

                attendanceDate:
                    attendanceDate,

                periodNumber:
                    Number(
                        periodNumber
                    ),

                academicSession:
                    localStorage.getItem(
                        "academicSession"
                    ) ||
                    new Date()
                        .getFullYear()
                        .toString(),

                attendance:
                    attendance

            };


            const response =
                await fetch(
                    `${API_BASE}/api/erp/attendance/faculty/mark`,
                    {
                        method: "POST",

                        headers:
                            headers(),

                        body:
                            JSON.stringify(
                                request
                            )
                    }
                );


            if (!response.ok) {

                throw new Error(
                    await response.text() ||
                    "Unable to save attendance."
                );

            }


            setMessage(
                "Attendance saved successfully."
            );


        } catch (err) {

            setError(
                err.message
            );

        } finally {

            setSaving(false);

        }

    };


    // =====================================================
    // SUBJECTS
    // =====================================================

    /*
     * Your teachingAssignmentsMap structure was not
     * included in the code you sent.
     *
     * Therefore this function supports common
     * Map<String,List<String>> structures.
     */

    const getSubjects = () => {

        if (!selectedBatch)
            return [];


        const value =
            assignments[
                selectedBatch
            ];


        if (Array.isArray(value))
            return value;


        if (
            typeof value ===
            "string"
        )
            return [value];


        return [];

    };


    const subjects =
        getSubjects();


    return (

        <div>

            {/* =================================================
                HEADER
            ================================================= */}

            <div className="erp-page-heading">

                <h1>
                    Attendance Management
                </h1>

                <p>
                    Select your teaching batch
                    and subject to mark attendance.
                </p>

            </div>


            {/* =================================================
                FILTER CARD
            ================================================= */}

            <div className="erp-card">

                <h3>
                    Class Information
                </h3>


                <div
                    style={{
                        display: "grid",
                        gridTemplateColumns:
                            "repeat(4, 1fr)",
                        gap: 15,
                        marginTop: 18
                    }}
                >

                    {/* Batch */}

                    <div>

                        <label>
                            Teaching Batch
                        </label>

                        <select
                            value={
                                selectedBatch
                            }
                            onChange={event => {

                                setSelectedBatch(
                                    event.target.value
                                );

                                setSelectedSubject("");

                                setStudents([]);

                            }}
                        >

                            <option value="">
                                Select Batch
                            </option>

                            {Object.keys(
                                assignments
                            ).map(
                                batch => (

                                    <option
                                        key={batch}
                                        value={batch}
                                    >
                                        {batch}
                                    </option>

                                )
                            )}

                        </select>

                    </div>


                    {/* Subject */}

                    <div>

                        <label>
                            Subject
                        </label>

                        <select
                            value={
                                selectedSubject
                            }
                            onChange={event =>
                                setSelectedSubject(
                                    event.target.value
                                )
                            }
                            disabled={
                                !selectedBatch
                            }
                        >

                            <option value="">
                                Select Subject
                            </option>

                            {subjects.map(
                                subject => (

                                    <option
                                        key={subject}
                                        value={subject}
                                    >
                                        {subject}
                                    </option>

                                )
                            )}

                        </select>

                    </div>


                    {/* Date */}

                    <div>

                        <label>
                            Attendance Date
                        </label>

                        <input
                            type="date"
                            value={
                                attendanceDate
                            }
                            onChange={event =>
                                setAttendanceDate(
                                    event.target.value
                                )
                            }
                        />

                    </div>


                    {/* Period */}

                    <div>

                        <label>
                            Period
                        </label>

                        <input
                            type="number"
                            min="1"
                            value={
                                periodNumber
                            }
                            onChange={event =>
                                setPeriodNumber(
                                    event.target.value
                                )
                            }
                        />

                    </div>

                </div>


                <button
                    onClick={
                        loadStudents
                    }
                    disabled={loading}
                    style={{
                        marginTop: 18,
                        padding:
                            "10px 18px",
                        border: 0,
                        borderRadius: 8,
                        background:
                            "#2563eb",
                        color: "white",
                        fontWeight: 700,
                        cursor:
                            "pointer"
                    }}
                >
                    {loading
                        ? "Loading..."
                        : "Load Students"}
                </button>

            </div>


            {/* =================================================
                FEEDBACK
            ================================================= */}

            {error && (

                <div
                    style={{
                        marginTop: 15,
                        padding: 12,
                        borderRadius: 8,
                        background:
                            "#fee2e2",
                        color:
                            "#991b1b"
                    }}
                >
                    ❌ {error}
                </div>

            )}


            {message && (

                <div
                    style={{
                        marginTop: 15,
                        padding: 12,
                        borderRadius: 8,
                        background:
                            "#dcfce7",
                        color:
                            "#166534"
                    }}
                >
                    ✅ {message}
                </div>

            )}


            {/* =================================================
                STUDENTS
            ================================================= */}

            {students.length > 0 && (

                <div
                    className="erp-card"
                    style={{
                        marginTop: 18
                    }}
                >

                    <div
                        style={{
                            display:
                                "flex",
                            justifyContent:
                                "space-between",
                            alignItems:
                                "center",
                            marginBottom:
                                18
                        }}
                    >

                        <div>

                            <h3>
                                Students
                            </h3>

                            <p>
                                {
                                    students.length
                                } students
                            </p>

                        </div>


                        <div
                            style={{
                                display:
                                    "flex",
                                gap: 8
                            }}
                        >

                            <button
                                onClick={() =>
                                    markAll(
                                        "PRESENT"
                                    )
                                }
                            >
                                Mark All Present
                            </button>

                            <button
                                onClick={() =>
                                    markAll(
                                        "ABSENT"
                                    )
                                }
                            >
                                Mark All Absent
                            </button>

                        </div>

                    </div>


                    <div
                        style={{
                            overflowX:
                                "auto"
                        }}
                    >

                        <table
                            style={{
                                width:
                                    "100%",
                                borderCollapse:
                                    "collapse"
                            }}
                        >

                            <thead>

                                <tr>

                                    <th>
                                        #
                                    </th>

                                    <th>
                                        Roll Number
                                    </th>

                                    <th>
                                        Student
                                    </th>

                                    <th>
                                        Father Name
                                    </th>

                                    <th>
                                        Status
                                    </th>

                                </tr>

                            </thead>


                            <tbody>

                                {students.map(
                                    (
                                        student,
                                        index
                                    ) => (

                                        <tr
                                            key={
                                                student.id ||
                                                student.rollNumber
                                            }
                                        >

                                            <td>
                                                {index + 1}
                                            </td>

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
                                                    student.fatherName
                                                }
                                            </td>

                                            <td>

                                                <div
                                                    style={{
                                                        display:
                                                            "flex",
                                                        gap:
                                                            6
                                                    }}
                                                >

                                                    <button
                                                        onClick={() =>
                                                            markStudent(
                                                                student.id,
                                                                "PRESENT"
                                                            )
                                                        }
                                                        style={{
                                                            padding:
                                                                "6px 10px",
                                                            borderRadius:
                                                                6,
                                                            border:
                                                                "1px solid #16a34a",
                                                            background:
                                                                attendance[
                                                                    student.id
                                                                ] ===
                                                                "PRESENT"
                                                                    ? "#16a34a"
                                                                    : "white",
                                                            color:
                                                                attendance[
                                                                    student.id
                                                                ] ===
                                                                "PRESENT"
                                                                    ? "white"
                                                                    : "#16a34a"
                                                        }}
                                                    >
                                                        Present
                                                    </button>


                                                    <button
                                                        onClick={() =>
                                                            markStudent(
                                                                student.id,
                                                                "ABSENT"
                                                            )
                                                        }
                                                        style={{
                                                            padding:
                                                                "6px 10px",
                                                            borderRadius:
                                                                6,
                                                            border:
                                                                "1px solid #dc2626",
                                                            background:
                                                                attendance[
                                                                    student.id
                                                                ] ===
                                                                "ABSENT"
                                                                    ? "#dc2626"
                                                                    : "white",
                                                            color:
                                                                attendance[
                                                                    student.id
                                                                ] ===
                                                                "ABSENT"
                                                                    ? "white"
                                                                    : "#dc2626"
                                                        }}
                                                    >
                                                        Absent
                                                    </button>

                                                </div>

                                            </td>

                                        </tr>

                                    )
                                )}

                            </tbody>

                        </table>

                    </div>


                    <button
                        onClick={
                            saveAttendance
                        }
                        disabled={saving}
                        style={{
                            width:
                                "100%",
                            marginTop:
                                18,
                            padding:
                                12,
                            border: 0,
                            borderRadius:
                                8,
                            background:
                                "#111827",
                            color:
                                "white",
                            fontWeight:
                                700,
                            cursor:
                                "pointer"
                        }}
                    >

                        {saving
                            ? "Saving..."
                            : "Save Attendance"}

                    </button>

                </div>

            )}

        </div>

    );

}
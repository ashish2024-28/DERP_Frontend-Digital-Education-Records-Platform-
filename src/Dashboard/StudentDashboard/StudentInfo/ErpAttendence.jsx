import { useEffect, useState } from "react";
import { attendanceApi } from "../../../api/attendanceApi";

export default function ErpAttendence() {

    const [data, setData] = useState(null);

    const [loading, setLoading] =
        useState(true);

    const [error, setError] =
        useState("");

    const [academicSession, setAcademicSession] =
        useState("2026-27");


    useEffect(() => {

        loadAttendance();

    }, [academicSession]);


    async function loadAttendance() {

        try {

            setLoading(true);
            setError("");

            const result =
                await attendanceApi
                    .getMyAttendance(
                        academicSession
                    );

            setData(result);

        } catch (err) {

            console.error(err);

            setError(
                err.message ||
                "Unable to load attendance"
            );

        } finally {

            setLoading(false);

        }
    }


    if (loading) {

        return (
            <div className="erp-card">
                Loading attendance...
            </div>
        );

    }


    if (error) {

        return (
            <div className="erp-card">
                <strong>
                    Attendance Error
                </strong>

                <p>
                    {error}
                </p>
            </div>
        );

    }


    return (

        <div>

            <div className="erp-page-heading">

                <h1>
                    My Attendance
                </h1>

                <p>
                    View subject-wise attendance.
                </p>

            </div>


            <div className="erp-card">

                <label>
                    Academic Session
                </label>

                <select
                    value={academicSession}
                    onChange={(e) =>
                        setAcademicSession(
                            e.target.value
                        )
                    }
                    style={{
                        marginTop: 8,
                        padding: 10,
                        borderRadius: 8,
                        border: "1px solid #ddd"
                    }}
                >

                    <option value="2026-27">
                        2026-27
                    </option>

                    <option value="2025-26">
                        2025-26
                    </option>

                </select>

            </div>


            {data && (

                <>

                    <div
                        className="erp-stats"
                        style={{
                            marginTop: 20
                        }}
                    >

                        <div className="erp-stat">

                            <div className="erp-stat-label">
                                Student
                            </div>

                            <div
                                className="erp-stat-value"
                                style={{
                                    fontSize: 20
                                }}
                            >
                                {data.studentName}
                            </div>

                        </div>


                        <div className="erp-stat">

                            <div className="erp-stat-label">
                                Roll Number
                            </div>

                            <div
                                className="erp-stat-value"
                                style={{
                                    fontSize: 20
                                }}
                            >
                                {data.rollNumber}
                            </div>

                        </div>


                        <div className="erp-stat">

                            <div className="erp-stat-label">
                                Batch
                            </div>

                            <div
                                className="erp-stat-value"
                                style={{
                                    fontSize: 20
                                }}
                            >
                                {data.studyBatch}
                            </div>

                        </div>

                    </div>


                    <div
                        className="erp-card"
                        style={{
                            marginTop: 20,
                            overflowX: "auto"
                        }}
                    >

                        <h3>
                            Subject Attendance
                        </h3>

                        <table
                            style={{
                                width: "100%",
                                marginTop: 15,
                                borderCollapse:
                                    "collapse"
                            }}
                        >

                            <thead>

                                <tr>

                                    <th>Subject</th>
                                    <th>Total</th>
                                    <th>Present</th>
                                    <th>Absent</th>
                                    <th>Percentage</th>

                                </tr>

                            </thead>


                            <tbody>

                                {data.summaries?.map(
                                    (item, index) => (

                                        <tr key={index}>

                                            <td>
                                                {item.subject}
                                            </td>

                                            <td>
                                                {item.totalClasses}
                                            </td>

                                            <td>
                                                {item.present}
                                            </td>

                                            <td>
                                                {item.absent}
                                            </td>

                                            <td>
                                                {item.percentage}%
                                            </td>

                                        </tr>

                                    )
                                )}

                            </tbody>

                        </table>

                    </div>


                    <div
                        className="erp-card"
                        style={{
                            marginTop: 20
                        }}
                    >

                        <h3>
                            Last 7 Days
                        </h3>

                        {data.last7Days?.map(
                            (day, index) => (

                                <div
                                    key={index}
                                    style={{
                                        display: "flex",
                                        justifyContent:
                                            "space-between",
                                        padding: "13px 0",
                                        borderBottom:
                                            "1px solid #eee"
                                    }}
                                >

                                    <span>
                                        {day.date}
                                    </span>

                                    <span>
                                        {day.subject}
                                    </span>

                                    <strong>
                                        {day.status}
                                    </strong>

                                </div>

                            )
                        )}

                    </div>

                </>

            )}

        </div>
    );
}
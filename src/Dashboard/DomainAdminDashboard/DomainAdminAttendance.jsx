import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";

export default function DomainAdminAttendance() {

    const API_BASE =
        import.meta.env.VITE_API_BASE_URL?.replace(/\/+$/, "");

    const { domain } = useParams();

    const [batch, setBatch] = useState("");
    const [academicSession, setAcademicSession] =
        useState("");

    const [records, setRecords] = useState([]);

    const [loading, setLoading] =
        useState(false);

    const [error, setError] =
        useState("");

    const loadAttendance = async () => {

        if (!batch || !academicSession) {
            setError(
                "Please select batch and academic session."
            );

            return;
        }

        setLoading(true);
        setError("");

        try {

            const response = await fetch(
                `${API_BASE}/api/erp/attendance/admin/batch` +
                `?domain=${encodeURIComponent(domain)}` +
                `&batch=${encodeURIComponent(batch)}` +
                `&academicSession=${encodeURIComponent(
                    academicSession
                )}`,
                {
                    headers: {
                        Authorization:
                            `Bearer ${localStorage.getItem(
                                "token"
                            )}`,
                    },
                }
            );

            if (!response.ok) {
                throw new Error(
                    await response.text()
                );
            }

            const data =
                await response.json();

            setRecords(
                Array.isArray(data)
                    ? data
                    : data?.data || []
            );

        } catch (err) {

            setError(
                err.message ||
                "Failed to load attendance."
            );

        } finally {

            setLoading(false);

        }
    };


    return (
        <div className="erp-page">

            <div className="erp-page-heading">

                <h1>
                    Attendance ERP
                </h1>

                <p>
                    Monitor attendance by batch,
                    subject and academic session.
                </p>

            </div>


            <div className="erp-filter-card">

                <div>

                    <label>
                        Batch  :- Example: 2A
                    </label>

                    <input
                        value={batch}
                        onChange={(e) =>
                            setBatch(e.target.value)
                        }
                        placeholder="Example: 2A"
                    />

                </div>


                <div>

                    <label>
                        Academic Session :- Example: 2026-27
                    </label>

                    <input
                        value={academicSession}
                        onChange={(e) =>
                            setAcademicSession(
                                e.target.value
                            )
                        }
                        placeholder="Example: 2026-27"
                    />

                </div>


                <button
                    onClick={loadAttendance}
                    disabled={loading}
                >
                    {loading
                        ? "Loading..."
                        : "View Attendance"}
                </button>

            </div>


            {error && (
                <div className="erp-error">
                    {error}
                </div>
            )}


            <div className="erp-card">

                <div
                    style={{
                        overflowX: "auto",
                    }}
                >

                    <table className="table-wrapper">

                        <thead>

                            <tr>

                                <th>
                                    Student
                                </th>

                                <th>
                                    Roll Number
                                </th>

                                <th>
                                    Teaching Batch
                                </th>

                                <th>
                                    Study Batch
                                </th>

                                <th>
                                    Subject
                                </th>

                                <th>
                                    Total Classes
                                </th>

                                <th>
                                    Present
                                </th>

                                <th>
                                    Absent
                                </th>

                                <th>
                                    Percentage
                                </th>

                            </tr>

                        </thead>


                        <tbody>

                            {records.map(
                                (record, index) => (

                                    <tr
                                        key={
                                            record.id ||
                                            `${record.rollNumber}-${index}`
                                        }
                                    >

                                        <td>
                                            {record.studentName ||
                                                "-"}
                                        </td>

                                        <td>
                                            {record.rollNumber ||
                                                "-"}
                                        </td>

                                        <td>
                                            {record.teachingBatch ||
                                                "-"}
                                        </td>

                                        <td>
                                            {record.studyBatch ||
                                                "-"}
                                        </td>

                                        <td>
                                            {record.subject ||
                                                "-"}
                                        </td>

                                        <td>
                                            {record.totalClasses ??
                                                0}
                                        </td>

                                        <td>
                                            {record.present ??
                                                0}
                                        </td>

                                        <td>
                                            {record.absent ??
                                                0}
                                        </td>

                                        <td>
                                            {record.percentage ??
                                                0}
                                            %
                                        </td>

                                    </tr>

                                )
                            )}

                        </tbody>

                    </table>

                </div>

            </div>

        </div>
    );
}


/*
import { useState } from "react";
import { useParams } from "react-router-dom";

export default function DomainAdminAttendance() {
    const API_BASE = import.meta.env.VITE_API_BASE_URL?.replace(/\/+$/, "");
    const { domain } = useParams();

    const [batch, setBatch] = useState("");
    const [academicSession, setAcademicSession] = useState("2026-27");
    const [records, setRecords] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    async function loadAttendance() {
        if (!batch || !academicSession) {
            setError("Please select batch and academic session.");
            return;
        }

        try {
            setLoading(true);
            setError("");

            const params = new URLSearchParams({
                domain,
                batch: batch.trim().toUpperCase(),
                academicSession: academicSession.trim()
            });

            const response = await fetch(
                `${API_BASE}/api/erp/attendance/admin/batch?${params}`,
                {
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem("token")}`
                    }
                }
            );

            const data = await response.json().catch(() => null);

            if (!response.ok) {
                throw new Error(
                    data?.message || "Failed to load attendance."
                );
            }

            setRecords(Array.isArray(data) ? data : data?.data || []);
        } catch (err) {
            setRecords([]);
            setError(err.message || "Failed to load attendance.");
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className="erp-page">
            <div className="erp-page-heading">
                <h1>Attendance Reports</h1>
                <p>Monitor attendance by batch, subject and academic session.</p>
            </div>

            {error && (
                <div className="erp-alert erp-alert-error">{error}</div>
            )}

            <div className="erp-card">
                <div className="erp-form-grid">
                    <div className="erp-form-group">
                        <label>Study Batch</label>
                        <input
                            value={batch}
                            placeholder="Example: 2A"
                            onChange={e => setBatch(e.target.value)}
                        />
                    </div>

                    <div className="erp-form-group">
                        <label>Academic Session</label>
                        <input
                            value={academicSession}
                            placeholder="Example: 2026-27"
                            onChange={e => setAcademicSession(e.target.value)}
                        />
                    </div>
                </div>

                <button
                    className="erp-primary-btn"
                    onClick={loadAttendance}
                    disabled={loading}
                >
                    {loading ? "Loading..." : "View Attendance"}
                </button>
            </div>

            <div className="erp-card" style={{ marginTop: 20 }}>
                <div className="erp-card-header">
                    <div>
                        <h3>Attendance Records</h3>
                        <p>{records.length} records found</p>
                    </div>
                </div>

                <div className="table-wrapper">
                    <table className="erp-table">
                        <thead>
                            <tr>
                                <th>Student</th>
                                <th>Roll Number</th>
                                <th>Teaching Batch</th>
                                <th>Study Batch</th>
                                <th>Subject</th>
                                <th>Total Classes</th>
                                <th>Present</th>
                                <th>Absent</th>
                                <th>Percentage</th>
                            </tr>
                        </thead>

                        <tbody>
                            {records.length === 0 ? (
                                <tr>
                                    <td colSpan="9" style={{ textAlign: "center" }}>
                                        No attendance records found.
                                    </td>
                                </tr>
                            ) : (
                                records.map((record, index) => (
                                    <tr key={record.id || `${record.rollNumber}-${record.subject}-${index}`}>
                                        <td>{record.studentName || "-"}</td>
                                        <td>{record.rollNumber || "-"}</td>
                                        <td>{record.teachingBatch || "-"}</td>
                                        <td>{record.studyBatch || "-"}</td>
                                        <td>{record.subject || "-"}</td>
                                        <td>{record.totalClasses ?? 0}</td>
                                        <td>{record.present ?? 0}</td>
                                        <td>{record.absent ?? 0}</td>
                                        <td>{Number(record.percentage || 0).toFixed(1)}%</td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
*/
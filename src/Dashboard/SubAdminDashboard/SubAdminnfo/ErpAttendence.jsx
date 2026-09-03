import { useState } from "react";

import { attendanceApi } from "../../../api/attendanceApi";

export default function ErpAttendence() {

    const [batch, setBatch] =
        useState("");

    const [session, setSession] =
        useState("2026-27");

    const [data, setData] =
        useState([]);

    const [loading, setLoading] =
        useState(false);

    const [error, setError] =
        useState("");


    async function search() {

        if (!batch) {

            setError("Enter a batch.");

            return;
        }


        try {

            setLoading(true);
            setError("");

            const result =
                await attendanceApi
                    .getSubAdminBatchAttendance(
                        batch,
                        session
                    );

            setData(result || []);

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
                    Batch Attendance
                </h1>

                <p>
                    View attendance of students
                    in a batch.
                </p>

            </div>


            <div className="erp-card">

                <input
                    placeholder="Batch e.g. 2A"
                    value={batch}
                    onChange={(e) =>
                        setBatch(e.target.value)
                    }
                    style={{
                        padding: 10,
                        marginRight: 10
                    }}
                />


                <select
                    value={session}
                    onChange={(e) =>
                        setSession(e.target.value)
                    }
                    style={{
                        padding: 10,
                        marginRight: 10
                    }}
                >

                    <option>
                        2026-27
                    </option>

                    <option>
                        2025-26
                    </option>

                </select>


                <button
                    onClick={search}
                    style={{
                        padding: "10px 18px",
                        border: 0,
                        borderRadius: 7,
                        background: "#2563eb",
                        color: "white"
                    }}
                >
                    Search
                </button>

            </div>


            {error && (
                <div
                    className="erp-card"
                    style={{
                        marginTop: 15,
                        color: "red"
                    }}
                >
                    {error}
                </div>
            )}


            {loading && (
                <div
                    className="erp-card"
                    style={{
                        marginTop: 15
                    }}
                >
                    Loading...
                </div>
            )}


            {!loading && data.length > 0 && (

                <div
                    className="erp-card"
                    style={{
                        marginTop: 20,
                        overflowX: "auto"
                    }}
                >

                    <table
                        style={{
                            width: "100%",
                            borderCollapse:
                                "collapse"
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
                                    Subject
                                </th>

                                <th>
                                    Total
                                </th>

                                <th>
                                    Present
                                </th>

                                <th>
                                    Absent
                                </th>

                                <th>
                                    %
                                </th>

                            </tr>

                        </thead>


                        <tbody>

                            {data.map(
                                (item, index) => (

                                    <tr key={index}>

                                        <td>
                                            {
                                                item.rollNumber
                                            }
                                        </td>

                                        <td>
                                            {
                                                item.studentName
                                            }
                                        </td>

                                        <td>
                                            {
                                                item.subject
                                            }
                                        </td>

                                        <td>
                                            {
                                                item.totalClasses
                                            }
                                        </td>

                                        <td>
                                            {
                                                item.present
                                            }
                                        </td>

                                        <td>
                                            {
                                                item.absent
                                            }
                                        </td>

                                        <td>
                                            {
                                                item.percentage
                                            }%
                                        </td>

                                    </tr>

                                )
                            )}

                        </tbody>

                    </table>

                </div>

            )}

        </div>
    );
}
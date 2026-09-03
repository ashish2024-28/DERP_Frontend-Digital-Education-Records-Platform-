import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";

export default function DomainAdminReports() {

    const API_BASE = import.meta.env.VITE_API_BASE_URL;
    const { domain } = useParams();

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const [report, setReport] = useState({
        students: 0,
        faculty: 0,
        courses: 0,
        attendance: 0
    });

    useEffect(() => {
        loadReports();
    }, [domain]);

    const loadReports = async () => {

        setLoading(true);
        setError("");

        try {

            const token =
                localStorage.getItem("token");

            const response = await fetch(
                `${API_BASE}/${domain}/admin/reports`,
                {
                    method: "GET",
                    headers: {
                        Authorization:
                            `Bearer ${token}`,
                        "Content-Type":
                            "application/json"
                    }
                }
            );

            if (!response.ok) {
                throw new Error(
                    "Unable to load reports"
                );
            }

            const data =
                await response.json();

            setReport({
                students:
                    data.students ?? 0,

                faculty:
                    data.faculty ?? 0,

                courses:
                    data.courses ?? 0,

                attendance:
                    data.attendance ?? 0
            });

        } catch (err) {

            console.error(err);

            setError(
                err.message ||
                "Failed to load reports"
            );

        } finally {

            setLoading(false);

        }
    };

    return (
        <div className="erp-page">

            <div className="erp-page-heading">

                <div>

                    <h1>
                        Reports
                    </h1>

                    <p>
                        Monitor academic,
                        faculty and student
                        activity across your
                        domain.
                    </p>

                </div>

                <button
                    className="erp-primary-btn"
                    onClick={loadReports}
                    disabled={loading}
                >
                    {loading
                        ? "Refreshing..."
                        : "Refresh Reports"}
                </button>

            </div>


            {error && (

                <div className="erp-alert erp-alert-error">

                    {error}

                </div>

            )}


            <div className="erp-stats">

                <div className="erp-stat-card">

                    <div className="erp-stat-icon">
                        👨‍🎓
                    </div>

                    <div>

                        <span>
                            Students
                        </span>

                        <strong>
                            {report.students}
                        </strong>

                    </div>

                </div>


                <div className="erp-stat-card">

                    <div className="erp-stat-icon">
                        👨‍🏫
                    </div>

                    <div>

                        <span>
                            Faculty
                        </span>

                        <strong>
                            {report.faculty}
                        </strong>

                    </div>

                </div>


                <div className="erp-stat-card">

                    <div className="erp-stat-icon">
                        📚
                    </div>

                    <div>

                        <span>
                            Courses
                        </span>

                        <strong>
                            {report.courses}
                        </strong>

                    </div>

                </div>


                <div className="erp-stat-card">

                    <div className="erp-stat-icon">
                        📊
                    </div>

                    <div>

                        <span>
                            Attendance
                        </span>

                        <strong>
                            {report.attendance}%
                        </strong>

                    </div>

                </div>

            </div>


            <div className="erp-grid">

                <div className="erp-card">

                    <div className="erp-card-header">

                        <div>

                            <h3>
                                Academic Overview
                            </h3>

                            <p>
                                Overall academic
                                activity in your
                                domain.
                            </p>

                        </div>

                    </div>


                    <div className="erp-report-row">

                        <span>
                            Total Students
                        </span>

                        <strong>
                            {report.students}
                        </strong>

                    </div>


                    <div className="erp-report-row">

                        <span>
                            Total Faculty
                        </span>

                        <strong>
                            {report.faculty}
                        </strong>

                    </div>


                    <div className="erp-report-row">

                        <span>
                            Total Courses
                        </span>

                        <strong>
                            {report.courses}
                        </strong>

                    </div>


                    <div className="erp-report-row">

                        <span>
                            Attendance Rate
                        </span>

                        <strong>
                            {report.attendance}%
                        </strong>

                    </div>

                </div>


                <div className="erp-card">

                    <h3>
                        Attendance Report
                    </h3>

                    <p>
                        Attendance analytics
                        will be displayed here.
                    </p>

                    <div className="erp-progress">

                        <div
                            className="erp-progress-bar"
                            style={{
                                width:
                                    `${Math.min(
                                        report.attendance,
                                        100
                                    )}%`
                            }}
                        />

                    </div>

                    <strong>
                        {report.attendance}%
                    </strong>

                </div>

            </div>

        </div>
    );
}
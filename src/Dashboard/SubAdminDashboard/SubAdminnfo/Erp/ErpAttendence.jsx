import { useMemo, useState } from "react";

import { attendanceApi } from "../../../api/attendanceApi";

import "./erpAttendence.css";


/*
 * =========================================================
 * ERP ATTENDANCE
 * =========================================================
 *
 * SubAdmin attendance monitoring page.
 *
 * Flow:
 *
 * SubAdmin
 *    ↓
 * Select Batch
 *    ↓
 * Select Academic Session
 *    ↓
 * Search
 *    ↓
 * Backend returns student + subject attendance
 *    ↓
 * Dashboard summary + attendance table
 *
 * This page does NOT mark or delete attendance.
 * It is intended for monitoring and reviewing attendance.
 * =========================================================
 */

export default function ErpAttendence() {

    // =====================================================
    // FILTER STATE
    // =====================================================

    const [batch, setBatch] = useState("");

    const [session, setSession] =
        useState("2026-27");


    // =====================================================
    // DATA STATE
    // =====================================================

    const [data, setData] = useState([]);


    // =====================================================
    // UI STATE
    // =====================================================

    const [loading, setLoading] =
        useState(false);

    const [error, setError] =
        useState("");

    const [searched, setSearched] =
        useState(false);

    const [searchText, setSearchText] =
        useState("");


    // =====================================================
    // LOAD BATCH ATTENDANCE
    // =====================================================

    async function searchAttendance() {

        const requestedBatch =
            batch.trim();

        if (!requestedBatch) {

            setError(
                "Please enter a batch before searching."
            );

            setData([]);
            setSearched(false);

            return;
        }


        try {

            setLoading(true);
            setError("");

            const result =
                await attendanceApi
                    .getSubAdminBatchAttendance(
                        requestedBatch,
                        session
                    );


            setData(
                Array.isArray(result)
                    ? result
                    : []
            );

            setSearched(true);

        } catch (err) {

            setData([]);

            setSearched(true);

            setError(
                err?.message ||
                "Unable to load attendance."
            );

        } finally {

            setLoading(false);
        }
    }


    // =====================================================
    // CLEAR FILTERS / DATA
    // =====================================================

    function clearSearch() {

        setBatch("");

        setSession("2026-27");

        setSearchText("");

        setData([]);

        setError("");

        setSearched(false);
    }


    // =====================================================
    // FILTER TABLE DATA
    // =====================================================

    const filteredData = useMemo(() => {

        const query =
            searchText
                .trim()
                .toLowerCase();


        if (!query) {
            return data;
        }


        return data.filter((item) => {

            return (
                String(
                    item.rollNumber ?? ""
                )
                    .toLowerCase()
                    .includes(query)

                ||

                String(
                    item.studentName ?? ""
                )
                    .toLowerCase()
                    .includes(query)

                ||

                String(
                    item.subject ?? ""
                )
                    .toLowerCase()
                    .includes(query)
            );
        });

    }, [data, searchText]);


    // =====================================================
    // ATTENDANCE STATISTICS
    // =====================================================

    const statistics = useMemo(() => {

        if (!data.length) {

            return {
                students: 0,
                subjects: 0,
                totalClasses: 0,
                present: 0,
                absent: 0,
                percentage: 0
            };
        }


        /*
         * A student can have multiple subject rows.
         *
         * Therefore students are counted using roll number
         * instead of simply using data.length.
         */

        const uniqueStudents =
            new Set(
                data.map(
                    (item) =>
                        item.rollNumber
                )
            );


        const uniqueSubjects =
            new Set(
                data.map(
                    (item) =>
                        item.subject
                )
            );


        const totalClasses =
            data.reduce(
                (sum, item) =>
                    sum +
                    Number(
                        item.totalClasses || 0
                    ),
                0
            );


        const present =
            data.reduce(
                (sum, item) =>
                    sum +
                    Number(
                        item.present || 0
                    ),
                0
            );


        const absent =
            data.reduce(
                (sum, item) =>
                    sum +
                    Number(
                        item.absent || 0
                    ),
                0
            );


        const percentage =
            totalClasses > 0
                ? (present * 100) /
                  totalClasses
                : 0;


        return {

            students:
                uniqueStudents.size,

            subjects:
                uniqueSubjects.size,

            totalClasses,

            present,

            absent,

            percentage
        };

    }, [data]);


    // =====================================================
    // FORMAT PERCENTAGE
    // =====================================================

    function formatPercentage(value) {

        const number =
            Number(value);

        if (Number.isNaN(number)) {
            return "0%";
        }

        return `${number.toFixed(1)}%`;
    }


    // =====================================================
    // GET ATTENDANCE STATUS CLASS
    // =====================================================

    function getPercentageClass(value) {

        const percentage =
            Number(value || 0);


        if (percentage >= 75) {
            return "attendance-good";
        }


        if (percentage >= 60) {
            return "attendance-warning";
        }


        return "attendance-danger";
    }


    // =====================================================
    // RENDER
    // =====================================================

    return (

        <div className="erp-attendance-page">

            {/* =================================================
                PAGE HEADER
            ================================================= */}

            <div className="erp-attendance-header">

                <div>

                    <div className="erp-attendance-eyebrow">
                        ERP / ATTENDANCE
                    </div>

                    <h1>
                        Batch Attendance
                    </h1>

                    <p>
                        Monitor student attendance,
                        subject performance and
                        attendance percentage.
                    </p>

                </div>


                {searched && !loading && (
                    <div className="erp-attendance-header-badge">

                        <span className="status-dot" />

                        Attendance Overview

                    </div>
                )}

            </div>


            {/* =================================================
                SEARCH / FILTER CARD
            ================================================= */}

            <section className="erp-attendance-filter-card">

                <div className="erp-attendance-filter-heading">

                    <div>

                        <h2>
                            Attendance Search
                        </h2>

                        <p>
                            Select a batch and academic
                            session to view attendance.
                        </p>

                    </div>

                </div>


                <div className="erp-attendance-filter-grid">

                    {/* Batch */}

                    <div className="erp-attendance-field">

                        <label htmlFor="attendance-batch">
                            Batch
                        </label>

                        <input
                            id="attendance-batch"
                            type="text"
                            placeholder="Example: 2A"
                            value={batch}
                            onChange={(event) =>
                                setBatch(
                                    event.target.value
                                )
                            }
                            onKeyDown={(event) => {

                                if (
                                    event.key === "Enter"
                                ) {
                                    searchAttendance();
                                }
                            }}
                        />

                    </div>


                    {/* Academic Session */}

                    <div className="erp-attendance-field">

                        <label htmlFor="attendance-session">
                            Academic Session
                        </label>

                        <select
                            id="attendance-session"
                            value={session}
                            onChange={(event) =>
                                setSession(
                                    event.target.value
                                )
                            }
                        >

                            <option value="2026-27">
                                2026-27
                            </option>

                            <option value="2025-26">
                                2025-26
                            </option>

                            <option value="2024-25">
                                2024-25
                            </option>

                        </select>

                    </div>


                    {/* Buttons */}

                    <div className="erp-attendance-filter-actions">

                        <button
                            type="button"
                            className="attendance-search-btn"
                            onClick={
                                searchAttendance
                            }
                            disabled={loading}
                        >

                            {loading ? (
                                <>
                                    <span className="button-spinner" />
                                    Loading...
                                </>
                            ) : (
                                <>
                                    <span className="search-icon">
                                        ⌕
                                    </span>
                                    Search Attendance
                                </>
                            )}

                        </button>


                        <button
                            type="button"
                            className="attendance-clear-btn"
                            onClick={clearSearch}
                            disabled={loading}
                        >
                            Clear
                        </button>

                    </div>

                </div>

            </section>


            {/* =================================================
                ERROR
            ================================================= */}

            {error && (

                <div className="erp-attendance-alert error">

                    <div className="alert-icon">
                        !
                    </div>

                    <div>

                        <strong>
                            Unable to load attendance
                        </strong>

                        <p>
                            {error}
                        </p>

                    </div>

                </div>

            )}


            {/* =================================================
                LOADING
            ================================================= */}

            {loading && (

                <div className="erp-attendance-loading">

                    <div className="loading-spinner" />

                    <div>

                        <strong>
                            Loading attendance...
                        </strong>

                        <span>
                            Please wait while the
                            attendance records are loaded.
                        </span>

                    </div>

                </div>

            )}


            {/* =================================================
                STATISTICS
            ================================================= */}

            {!loading &&
                searched &&
                !error &&
                data.length > 0 && (

                    <div className="erp-attendance-stats">

                        {/* Students */}

                        <div className="attendance-stat-card">

                            <div className="attendance-stat-icon students">
                                👥
                            </div>

                            <div>

                                <span>
                                    Students
                                </span>

                                <strong>
                                    {statistics.students}
                                </strong>

                                <small>
                                    In selected batch
                                </small>

                            </div>

                        </div>


                        {/* Subjects */}

                        <div className="attendance-stat-card">

                            <div className="attendance-stat-icon subjects">
                                ◫
                            </div>

                            <div>

                                <span>
                                    Subjects
                                </span>

                                <strong>
                                    {statistics.subjects}
                                </strong>

                                <small>
                                    Attendance subjects
                                </small>

                            </div>

                        </div>


                        {/* Present */}

                        <div className="attendance-stat-card">

                            <div className="attendance-stat-icon present">
                                ✓
                            </div>

                            <div>

                                <span>
                                    Present
                                </span>

                                <strong>
                                    {statistics.present}
                                </strong>

                                <small>
                                    Recorded classes
                                </small>

                            </div>

                        </div>


                        {/* Absent */}

                        <div className="attendance-stat-card">

                            <div className="attendance-stat-icon absent">
                                ×
                            </div>

                            <div>

                                <span>
                                    Absent
                                </span>

                                <strong>
                                    {statistics.absent}
                                </strong>

                                <small>
                                    Recorded classes
                                </small>

                            </div>

                        </div>


                        {/* Overall */}

                        <div className="attendance-stat-card highlight">

                            <div className="attendance-stat-icon percentage">
                                %
                            </div>

                            <div>

                                <span>
                                    Overall Attendance
                                </span>

                                <strong>
                                    {formatPercentage(
                                        statistics.percentage
                                    )}
                                </strong>

                                <small>
                                    Selected batch
                                </small>

                            </div>

                        </div>

                    </div>
                )}


            {/* =================================================
                RESULTS
            ================================================= */}

            {!loading &&
                searched &&
                !error &&
                data.length > 0 && (

                    <section className="erp-attendance-results">

                        {/* Result Header */}

                        <div className="erp-attendance-results-header">

                            <div>

                                <div className="results-title-row">

                                    <h2>
                                        Attendance Records
                                    </h2>

                                    <span className="result-count">
                                        {data.length}
                                    </span>

                                </div>

                                <p>
                                    Batch{" "}
                                    <strong>
                                        {batch.trim().toUpperCase()}
                                    </strong>

                                    {" · "}

                                    Session{" "}
                                    <strong>
                                        {session}
                                    </strong>
                                </p>

                            </div>


                            {/* Table Search */}

                            <div className="attendance-table-search">

                                <span>
                                    ⌕
                                </span>

                                <input
                                    type="text"
                                    placeholder="Search student, roll or subject..."
                                    value={searchText}
                                    onChange={(event) =>
                                        setSearchText(
                                            event.target.value
                                        )
                                    }
                                />

                            </div>

                        </div>


                        {/* Table */}

                        <div className="erp-attendance-table-wrapper">

                            <table className="erp-attendance-table">

                                <thead>

                                    <tr>

                                        <th>
                                            #
                                        </th>

                                        <th>
                                            Student
                                        </th>

                                        <th>
                                            Roll Number
                                        </th>

                                        <th>
                                            Study Batch
                                        </th>

                                        <th>
                                            Subject
                                        </th>

                                        <th className="number-column">
                                            Total
                                        </th>

                                        <th className="number-column">
                                            Present
                                        </th>

                                        <th className="number-column">
                                            Absent
                                        </th>

                                        <th>
                                            Attendance
                                        </th>

                                    </tr>

                                </thead>


                                <tbody>

                                    {filteredData.map(
                                        (item, index) => {

                                            const percentage =
                                                Number(
                                                    item.percentage || 0
                                                );


                                            return (

                                                <tr
                                                    key={`${item.rollNumber}-${item.subject}-${index}`}
                                                >

                                                    <td className="serial-column">
                                                        {index + 1}
                                                    </td>


                                                    <td>

                                                        <div className="student-cell">

                                                            <div className="student-avatar">
                                                                {String(
                                                                    item.studentName ||
                                                                    "S"
                                                                )
                                                                    .charAt(0)
                                                                    .toUpperCase()}
                                                            </div>

                                                            <div>

                                                                <strong>
                                                                    {
                                                                        item.studentName ||
                                                                        "Unknown Student"
                                                                    }
                                                                </strong>

                                                                <span>
                                                                    Student
                                                                </span>

                                                            </div>

                                                        </div>

                                                    </td>


                                                    <td>

                                                        <span className="roll-number">
                                                            {
                                                                item.rollNumber ||
                                                                "—"
                                                            }
                                                        </span>

                                                    </td>


                                                    <td>

                                                        <span className="batch-badge">
                                                            {
                                                                item.studyBatch ||
                                                                item.teachingBatch ||
                                                                "—"
                                                            }
                                                        </span>

                                                    </td>


                                                    <td>

                                                        <span className="subject-name">
                                                            {
                                                                item.subject ||
                                                                "—"
                                                            }
                                                        </span>

                                                    </td>


                                                    <td className="number-column">
                                                        {
                                                            item.totalClasses ??
                                                            0
                                                        }
                                                    </td>


                                                    <td className="number-column">

                                                        <span className="present-value">
                                                            {
                                                                item.present ??
                                                                0
                                                            }
                                                        </span>

                                                    </td>


                                                    <td className="number-column">

                                                        <span className="absent-value">
                                                            {
                                                                item.absent ??
                                                                0
                                                            }
                                                        </span>

                                                    </td>


                                                    <td>

                                                        <div className="attendance-percentage-cell">

                                                            <div className="percentage-top">

                                                                <span
                                                                    className={
                                                                        getPercentageClass(
                                                                            percentage
                                                                        )
                                                                    }
                                                                >
                                                                    {formatPercentage(
                                                                        percentage
                                                                    )}
                                                                </span>

                                                            </div>


                                                            <div className="percentage-progress">

                                                                <span
                                                                    className={
                                                                        getPercentageClass(
                                                                            percentage
                                                                        )
                                                                    }
                                                                    style={{
                                                                        width: `${Math.min(
                                                                            Math.max(
                                                                                percentage,
                                                                                0
                                                                            ),
                                                                            100
                                                                        )}%`
                                                                    }}
                                                                />

                                                            </div>

                                                        </div>

                                                    </td>

                                                </tr>

                                            );
                                        }
                                    )}


                                    {filteredData.length === 0 && (

                                        <tr>

                                            <td
                                                colSpan="9"
                                                className="empty-search-cell"
                                            >

                                                <div>

                                                    <span>
                                                        ⌕
                                                    </span>

                                                    <strong>
                                                        No matching records
                                                    </strong>

                                                    <p>
                                                        Try another student,
                                                        roll number or subject.
                                                    </p>

                                                </div>

                                            </td>

                                        </tr>

                                    )}

                                </tbody>

                            </table>

                        </div>


                        {/* Results Footer */}

                        <div className="erp-attendance-results-footer">

                            Showing{" "}
                            <strong>
                                {filteredData.length}
                            </strong>
                            {" "}of{" "}
                            <strong>
                                {data.length}
                            </strong>
                            {" "}attendance records

                        </div>

                    </section>
                )}


            {/* =================================================
                EMPTY STATE
            ================================================= */}

            {!loading &&
                searched &&
                !error &&
                data.length === 0 && (

                    <div className="erp-attendance-empty">

                        <div className="empty-icon">
                            ◫
                        </div>

                        <h2>
                            No attendance records found
                        </h2>

                        <p>
                            There are no attendance records
                            available for batch{" "}
                            <strong>
                                {batch.trim().toUpperCase()}
                            </strong>
                            {" "}in academic session{" "}
                            <strong>
                                {session}
                            </strong>.
                        </p>

                        <button
                            type="button"
                            onClick={clearSearch}
                        >
                            Search Another Batch
                        </button>

                    </div>
                )}


            {/* =================================================
                INITIAL STATE
            ================================================= */}

            {!loading &&
                !searched && (

                    <div className="erp-attendance-initial">

                        <div className="initial-icon">
                            ✓
                        </div>

                        <h2>
                            View Batch Attendance
                        </h2>

                        <p>
                            Select a batch and academic
                            session above to view detailed
                            attendance records.
                        </p>

                    </div>
                )}

        </div>
    );
}
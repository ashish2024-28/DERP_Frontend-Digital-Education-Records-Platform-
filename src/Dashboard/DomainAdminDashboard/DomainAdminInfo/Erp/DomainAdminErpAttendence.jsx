import { useEffect, useMemo, useState } from "react";
import { ChevronDown, History } from "lucide-react";
import { Link } from "react-router-dom";
import {
  cleanupAttendanceByDateRange,
  deleteAttendance,
  getAdminBatch,
  getAdminRecords,
  getAttendanceOverview as fetchAttendanceOverview,
  getRetention,
  previewAttendanceCleanup,
  updateRetention,
} from "../../../../api/domainAdminAttendanceApi";
import "./DomainAdminErpAttendence.css";
import "./AttendanceAdminControls.css";

function DisclosureSection({ sectionId, title, description, expanded, onToggle, children, className = "", aside }) {
  const contentId = `attendance-section-${sectionId}`;

  return (
    <section className={`attendance-admin-panel attendance-admin-disclosure ${className}`}>
      <div className="attendance-admin-disclosure__heading">
        <button
          type="button"
          className="attendance-admin-disclosure__toggle"
          aria-expanded={expanded}
          aria-controls={contentId}
          onClick={onToggle}
        >
          <span className="attendance-admin-disclosure__copy">
            <strong>{title}</strong>
            <span>{description}</span>
          </span>
          <ChevronDown className={expanded ? "is-expanded" : ""} size={20} aria-hidden="true" />
        </button>
        {aside}
      </div>
      {expanded && <div id={contentId} className="attendance-admin-disclosure__body">{children}</div>}
    </section>
  );
}

function localDateString(offsetDays = 0) {
  const date = new Date();
  date.setDate(date.getDate() + offsetDays);
  const offset = date.getTimezoneOffset();
  return new Date(date.getTime() - offset * 60000).toISOString().slice(0, 10);
}

export default function DomainAdminErpAttendence() {
  const sectionIds = ["retention", "cleanup", "search", "results"];
  const [expandedSections, setExpandedSections] = useState(() =>
    Object.fromEntries(sectionIds.map((sectionId) => [sectionId, true]))
  );
  const allSectionsExpanded = sectionIds.every((sectionId) => expandedSections[sectionId]);
  const [course, setCourse] = useState("");
  const [batch, setBatch] = useState("");
  const [expandedCourses, setExpandedCourses] = useState({});
  const [expandedBatches, setExpandedBatches] = useState({});
  const [overview, setOverview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [searched, setSearched] = useState(false);
  const [searchText, setSearchText] = useState("");
  const [retention, setRetention] = useState(null);
  const [retentionSaving, setRetentionSaving] = useState(false);
  const [retentionError, setRetentionError] = useState("");
  const [retentionMessage, setRetentionMessage] = useState("");
  const [cleanupMessage, setCleanupMessage] = useState("");
  const [cleanupFrom, setCleanupFrom] = useState(() => localDateString(-6));
  const [cleanupTo, setCleanupTo] = useState(() => localDateString());
  const [cleanupPreview, setCleanupPreview] = useState(null);
  const [cleanupConfirmation, setCleanupConfirmation] = useState("");
  const [cleanupBusy, setCleanupBusy] = useState(false);
  const [recordsPage, setRecordsPage] = useState(null);
  const [recordsPageIndex, setRecordsPageIndex] = useState(0);
  const [recordsError, setRecordsError] = useState("");
  const [recordToDelete, setRecordToDelete] = useState(null);
  const [recordDeleteConfirmation, setRecordDeleteConfirmation] = useState("");
  const [batchSummary, setBatchSummary] = useState([]);

  function toggleSection(sectionId) {
    setExpandedSections((current) => ({ ...current, [sectionId]: !current[sectionId] }));
  }

  function toggleAllSections() {
    const expandAll = !allSectionsExpanded;
    setExpandedSections(Object.fromEntries(sectionIds.map((sectionId) => [sectionId, expandAll])));
  }

  function toggleCourseResults(courseName) {
    setExpandedCourses((current) => ({ ...current, [courseName]: !current[courseName] }));
  }

  function toggleBatchResults(batchKey) {
    setExpandedBatches((current) => ({ ...current, [batchKey]: !current[batchKey] }));
  }

  useEffect(() => {
    let active = true;
    getRetention()
      .then((result) => {
        if (active) setRetention(result?.data || null);
      })
      .catch((requestError) => {
        if (active) setRetentionError(requestError.message || "Unable to load retention settings.");
      });
    return () => { active = false; };
  }, []);

  async function searchAttendance() {
    try {
      setLoading(true);
      setError("");

      const [result, batchResult] = await Promise.all([
        fetchAttendanceOverview(course.trim(), batch.trim()),
        batch.trim() ? getAdminBatch(batch.trim()) : Promise.resolve(null),
      ]);
      setOverview(result?.data || null);
      setBatchSummary(Array.isArray(batchResult?.data) ? batchResult.data : []);
      setSearched(true);
    } catch (err) {
      setOverview(null);
      setBatchSummary([]);
      setSearched(true);
      setError(err?.message || "Unable to load attendance.");
    } finally {
      setLoading(false);
    }
  }

  function clearSearch() {
    setCourse("");
    setBatch("");
    setSearchText("");
    setOverview(null);
    setBatchSummary([]);
    setError("");
    setSearched(false);
  }

  async function saveRetention(event) {
    event.preventDefault();
    setRetentionSaving(true);
    setRetentionError("");
    setRetentionMessage("");
    try {
      const result = await updateRetention({
        retentionMonths: Number(retention.retentionMonths),
        enabled: Boolean(retention.enabled),
      });
      setRetention(result.data);
      setRetentionMessage("Attendance retention settings saved.");
    } catch (requestError) {
      setRetentionError(requestError.message || "Unable to save retention settings.");
    } finally {
      setRetentionSaving(false);
    }
  }

  async function previewCleanup() {
    if (!cleanupFrom || !cleanupTo || cleanupFrom > cleanupTo) {
      setRecordsError("Choose a valid date range: the start date must be on or before the end date.");
      return;
    }
    setCleanupBusy(true);
    setRecordsError("");
    setCleanupMessage("");
    setCleanupPreview(null);
    setCleanupConfirmation("");
    try {
      const [previewResult, recordsResult] = await Promise.all([
        previewAttendanceCleanup(cleanupFrom, cleanupTo),
        getAdminRecords(cleanupFrom, cleanupTo),
      ]);
      setCleanupPreview(Number(previewResult?.data ?? 0));
      setRecordsPage(recordsResult?.data || null);
      setRecordsPageIndex(0);
    } catch (requestError) {
      setRecordsError(requestError.message || "Unable to preview attendance records.");
    } finally {
      setCleanupBusy(false);
    }
  }

  async function loadRecordPage(pageIndex) {
    setCleanupBusy(true);
    setRecordsError("");
    try {
      const result = await getAdminRecords(cleanupFrom, cleanupTo, pageIndex);
      setRecordsPage(result?.data || null);
      setRecordsPageIndex(pageIndex);
    } catch (requestError) {
      setRecordsError(requestError.message || "Unable to load attendance records.");
    } finally {
      setCleanupBusy(false);
    }
  }

  async function runCleanup() {
    if (cleanupConfirmation !== `DELETE ${cleanupPreview}`) {
      setRecordsError(`Type DELETE ${cleanupPreview} exactly to confirm this cleanup.`);
      return;
    }
    setCleanupBusy(true);
    setRecordsError("");
    try {
      const result = await cleanupAttendanceByDateRange(cleanupFrom, cleanupTo);
      setCleanupMessage(`Cleanup completed: ${Number(result?.data ?? 0).toLocaleString()} records removed.`);
      setCleanupPreview(null);
      setCleanupConfirmation("");
      setRecordToDelete(null);
      await previewCleanup();
      if (searched) await searchAttendance();
    } catch (requestError) {
      setRecordsError(requestError.message || "Attendance cleanup failed.");
    } finally {
      setCleanupBusy(false);
    }
  }

  async function deleteSingleRecord(record) {
    if (recordDeleteConfirmation !== String(record.id)) {
      setRecordsError(`Type record ID ${record.id} exactly to confirm deletion.`);
      return;
    }
    setCleanupBusy(true);
    setRecordsError("");
    try {
      await deleteAttendance(record.id);
      setRecordToDelete(null);
      setRecordDeleteConfirmation("");
      setCleanupMessage(`Attendance record ${record.id} deleted.`);
      await previewCleanup();
      if (searched) await searchAttendance();
    } catch (requestError) {
      setRecordsError(requestError.message || "Attendance record could not be deleted.");
    } finally {
      setCleanupBusy(false);
    }
  }

  function formatPercentage(value) {
    const number = Number(value);
    if (Number.isNaN(number)) return "0%";
    return `${number.toFixed(1)}%`;
  }

  function getPercentageClass(value) {
    const percentage = Number(value || 0);
    if (percentage >= 75) return "attendance-good";
    if (percentage >= 60) return "attendance-warning";
    return "attendance-danger";
  }

  // Filter students inside each batch group by the table search box
  const filteredCourses = useMemo(() => {
    if (!overview?.courses) return [];

    const query = searchText.trim().toLowerCase();
    if (!query) return overview.courses;

    return overview.courses
      .map((courseGroup) => ({
        ...courseGroup,
        studyBatches: courseGroup.studyBatches
          .map((batchGroup) => ({
            ...batchGroup,
            students: batchGroup.students.filter(
              (s) =>
                String(s.rollNumber ?? "").toLowerCase().includes(query) ||
                String(s.studentName ?? "").toLowerCase().includes(query)
            ),
          }))
          .filter((batchGroup) => batchGroup.students.length > 0),
      }))
      .filter((courseGroup) => courseGroup.studyBatches.length > 0);
  }, [overview, searchText]);

  const hasResults = overview && overview.totalStudents > 0;

  return (
    <div className="erp-attendance-page">

      {/* ================================================= PAGE HEADER ================================================= */}
      <div className="erp-attendance-header erp-attendance-order--header">
        <div>
          <div className="erp-attendance-eyebrow">DOMAIN ADMIN / ERP</div>
          <h1>Attendance administration</h1>
          <p>Choose how long attendance is kept, review records, and find attendance for a course or batch.</p>
        </div>
        <div className="attendance-admin-header-actions">
          <Link to="../erp-activity" className="attendance-admin-activity-link">
            <History size={16} aria-hidden="true" />
            ERP Activity Logs
          </Link>
          <button type="button" className="attendance-admin-all-toggle" onClick={toggleAllSections}>
            <ChevronDown className={allSectionsExpanded ? "is-expanded" : ""} size={17} aria-hidden="true" />
            {allSectionsExpanded ? "Hide all sections" : "Show all data"}
          </button>
        </div>
      </div>

      <DisclosureSection
        sectionId="retention"
        title="01 · How long should attendance be kept?"
        description="Set a retention period and decide whether older records are removed automatically."
        expanded={expandedSections.retention}
        onToggle={() => toggleSection("retention")}
        className="attendance-admin-panel--retention erp-attendance-order--retention"
        aside={retention && (
            <span className={`attendance-admin-status ${retention.enabled ? "is-enabled" : "is-disabled"}`}>
              {retention.enabled ? "Automatic cleanup enabled" : "Automatic cleanup disabled"}
            </span>
          )}
      >
        {retentionError && <p className="attendance-admin-alert" role="alert">{retentionError}</p>}
        {retentionMessage && <p className="attendance-admin-success" role="status">{retentionMessage}</p>}
        {retention ? (
          <form className="attendance-admin-retention" onSubmit={saveRetention}>
            <label>
              Keep records for (months)
              <input type="number" min="1" max="120" required
                value={retention.retentionMonths}
                onChange={(event) => setRetention({ ...retention, retentionMonths: event.target.value })} />
            </label>
            <label className="attendance-admin-toggle">
              <input type="checkbox" checked={Boolean(retention.enabled)}
                onChange={(event) => setRetention({ ...retention, enabled: event.target.checked })} />
              Enable scheduled automatic cleanup
            </label>
            <button type="submit" disabled={retentionSaving}>
              {retentionSaving ? "Saving…" : "Save retention settings"}
            </button>
          </form>
        ) : !retentionError ? <p>Loading retention settings…</p> : null}
        <p className="attendance-admin-note">
          Example: set 12 months to keep about one year of attendance. Turning automatic cleanup off does not affect manual cleanup below.
        </p>
      </DisclosureSection>

      <DisclosureSection
        sectionId="cleanup"
        title="02 · Review and clean up records"
        description="Choose a date range, inspect matching records, and delete only after reviewing the total."
        expanded={expandedSections.cleanup}
        onToggle={() => toggleSection("cleanup")}
        className="attendance-admin-panel--cleanup erp-attendance-order--cleanup"
      >
        <div className="attendance-admin-range">
          <label>
            Start date
            <input type="date" value={cleanupFrom}
              onChange={(event) => {
                setCleanupFrom(event.target.value);
                setCleanupPreview(null);
                setRecordsPage(null);
                setCleanupConfirmation("");
                setCleanupMessage("");
              }} />
          </label>
          <label>
            End date
            <input type="date" value={cleanupTo}
              onChange={(event) => {
                setCleanupTo(event.target.value);
                setCleanupPreview(null);
                setRecordsPage(null);
                setCleanupConfirmation("");
                setCleanupMessage("");
              }} />
          </label>
          <button type="button" onClick={previewCleanup}
            disabled={cleanupBusy || !cleanupFrom || !cleanupTo || cleanupFrom > cleanupTo}>
            {cleanupBusy ? "Loading…" : "Review these dates"}
          </button>
        </div>

        {recordsError && <p className="attendance-admin-alert" role="alert">{recordsError}</p>}
        {cleanupMessage && <p className="attendance-admin-success" role="status">{cleanupMessage}</p>}
        {cleanupPreview !== null && (
          <div className="attendance-admin-preview">
            <strong>{cleanupPreview.toLocaleString()} attendance records found from {cleanupFrom} through {cleanupTo}.</strong>
            {cleanupPreview > 0 && (
              <>
                <label>
                  To permanently remove all {cleanupPreview.toLocaleString()} records, type <code>DELETE {cleanupPreview}</code>
                  <input value={cleanupConfirmation}
                    onChange={(event) => setCleanupConfirmation(event.target.value)}
                    autoComplete="off" />
                </label>
                <button type="button" className="attendance-admin-danger"
                  onClick={runCleanup} disabled={cleanupBusy || cleanupConfirmation !== `DELETE ${cleanupPreview}`}>
                  {cleanupBusy ? "Deleting…" : "Permanently delete these records"}
                </button>
                <p className="attendance-admin-note">
                  This cannot be undone. Both dates are included, and attendance totals are recalculated after deletion.
                </p>
              </>
            )}
          </div>
        )}

        {recordsPage && (
          <>
            <div className="attendance-admin-records-heading">
              <div>
                <strong>Matching attendance records</strong>
                <span>{Number(recordsPage.totalElements || 0).toLocaleString()} total · up to 50 shown per page</span>
              </div>
              <span>Page {recordsPage.totalPages ? recordsPage.number + 1 : 0} of {recordsPage.totalPages || 0}</span>
            </div>
            <div className="attendance-admin-records-table-wrap">
              <table className="attendance-admin-records-table">
                <thead><tr><th>Date</th><th>Student</th><th>Course / batch</th><th>Subject</th><th>Period</th><th>Status</th><th>Marked by</th><th>Action</th></tr></thead>
                <tbody>
                  {(recordsPage.content || []).map((record) => (
                    <tr key={record.id}>
                      <td>{record.date}</td>
                      <td>{record.studentName}<small>{record.rollNumber}</small></td>
                      <td>{record.course} / {record.studyBatch}</td>
                      <td>{record.subject}</td>
                      <td>{record.periodNumber}</td>
                      <td>{record.status}</td>
                      <td>{record.facultyName || "—"}</td>
                      <td>
                        {recordToDelete?.id === record.id ? (
                          <div className="attendance-admin-delete-confirm">
                            <label>Type this record number to confirm: {record.id}
                              <input value={recordDeleteConfirmation}
                                onChange={(event) => setRecordDeleteConfirmation(event.target.value)} />
                            </label>
                            <button type="button" className="attendance-admin-danger"
                              onClick={() => deleteSingleRecord(record)}
                              disabled={cleanupBusy || recordDeleteConfirmation !== String(record.id)}>Confirm</button>
                            <button type="button" onClick={() => {
                              setRecordToDelete(null);
                              setRecordDeleteConfirmation("");
                            }}>Cancel</button>
                          </div>
                        ) : (
                          <button type="button" className="attendance-admin-danger"
                            onClick={() => {
                              setRecordToDelete(record);
                              setRecordDeleteConfirmation("");
                            }}>Delete this record</button>
                        )}
                      </td>
                    </tr>
                  ))}
                  {!recordsPage.content?.length && (
                    <tr><td colSpan="8">No attendance records were recorded in this date range.</td></tr>
                  )}
                </tbody>
              </table>
            </div>
            <div className="attendance-admin-pagination">
              <button type="button" onClick={() => loadRecordPage(recordsPageIndex - 1)}
                disabled={cleanupBusy || recordsPageIndex <= 0}>Previous</button>
              <button type="button" onClick={() => loadRecordPage(recordsPageIndex + 1)}
                disabled={cleanupBusy || recordsPageIndex + 1 >= (recordsPage.totalPages || 0)}>Next</button>
            </div>
          </>
        )}
      </DisclosureSection>

      {/* ================================================= FILTER CARD ================================================= */}
      <DisclosureSection
        sectionId="search"
        title="03 · Find attendance by course or batch"
        description="Enter a course, a batch, or both. Leave both blank to see attendance across your domain."
        expanded={expandedSections.search}
        onToggle={() => toggleSection("search")}
        className="erp-attendance-filter-card attendance-admin-search-section erp-attendance-order--search"
      >

        <div className="erp-attendance-filter-grid">
          <div className="erp-attendance-field">
            <label htmlFor="attendance-course">Course <span>(optional)</span></label>
            <input
              id="attendance-course"
              type="text"
              placeholder="Example: B.PHARMA"
              value={course}
              onChange={(event) => setCourse(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === "Enter") searchAttendance();
              }}
            />
          </div>

          <div className="erp-attendance-field">
            <label htmlFor="attendance-batch">Study batch <span>(optional)</span></label>
            <input
              id="attendance-batch"
              type="text"
              placeholder="Example: 2A"
              value={batch}
              onChange={(event) => setBatch(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === "Enter") searchAttendance();
              }}
            />
          </div>

          <div className="erp-attendance-filter-actions">
            <button
              type="button"
              className="attendance-search-btn"
              onClick={searchAttendance}
              disabled={loading}
            >
              {loading ? (
                <>
                  <span className="button-spinner" />
                  Loading...
                </>
              ) : (
                <>
                  <span className="search-icon">⌕</span>
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
      </DisclosureSection>

      <DisclosureSection
        sectionId="results"
        title="04 · Attendance results"
        description={searched
          ? `${overview?.totalStudents ?? 0} students found${batch ? ` · batch ${batch}` : ""}.`
          : "Search above to load attendance details, course totals, student records, and batch summaries."}
        expanded={expandedSections.results}
        onToggle={() => toggleSection("results")}
        className="attendance-admin-results-section erp-attendance-order--section-results"
      >
      {/* ================================================= ERROR ================================================= */}
      {error && (
        <div className="erp-attendance-alert error erp-attendance-order--feedback">
          <div className="alert-icon">!</div>
          <div>
            <strong>Unable to load attendance</strong>
            <p>{error}</p>
          </div>
        </div>
      )}

      {/* ================================================= LOADING ================================================= */}
      {loading && (
        <div className="erp-attendance-loading erp-attendance-order--feedback">
          <div className="loading-spinner" />
          <div>
            <strong>Loading attendance...</strong>
            <span>Please wait while the attendance records are loaded.</span>
          </div>
        </div>
      )}

      {/* ================================================= OVERALL STATISTICS ================================================= */}
      {!loading && searched && !error && hasResults && (
        <div className="erp-attendance-stats erp-attendance-order--stats">
          <div className="attendance-stat-card">
            <div className="attendance-stat-icon students">👥</div>
            <div>
              <span>Students</span>
              <strong>{overview.totalStudents}</strong>
              <small>Across all matched courses</small>
            </div>
          </div>

          <div className="attendance-stat-card">
            <div className="attendance-stat-icon subjects">◫</div>
            <div>
              <span>Courses</span>
              <strong>{overview.courses.length}</strong>
              <small>Matched courses</small>
            </div>
          </div>

          <div className="attendance-stat-card">
            <div className="attendance-stat-icon present">✓</div>
            <div>
              <span>Present</span>
              <strong>{overview.present}</strong>
              <small>Recorded classes</small>
            </div>
          </div>

          <div className="attendance-stat-card">
            <div className="attendance-stat-icon absent">×</div>
            <div>
              <span>Absent</span>
              <strong>{overview.absent}</strong>
              <small>Recorded classes</small>
            </div>
          </div>

          <div className="attendance-stat-card highlight">
            <div className="attendance-stat-icon percentage">%</div>
            <div>
              <span>Overall Attendance</span>
              <strong>{formatPercentage(overview.percentage)}</strong>
              <small>Domain-wide</small>
            </div>
          </div>
        </div>
      )}

      {/* ================================================= TABLE SEARCH (only when results exist) ================================================= */}
      {!loading && searched && !error && hasResults && (
        <div className="erp-attendance-order--student-search">
          <div className="attendance-table-search">
            <span>⌕</span>
            <input
              type="text"
              placeholder="Search student or roll number..."
              value={searchText}
              onChange={(event) => setSearchText(event.target.value)}
            />
          </div>
        </div>
      )}

      {/* ================================================= COURSE → BATCH → STUDENT HIERARCHY ================================================= */}
      {!loading && searched && !error && hasResults && (
        <div className="erp-attendance-course-list erp-attendance-order--results">
          {filteredCourses.map((courseGroup) => (
            <article key={courseGroup.course} className="erp-attendance-course-card">
              <button
                type="button"
                className="erp-attendance-course-toggle"
                aria-expanded={Boolean(expandedCourses[courseGroup.course])}
                aria-controls={`course-batches-${encodeURIComponent(courseGroup.course)}`}
                onClick={() => toggleCourseResults(courseGroup.course)}
              >
                <span className="erp-attendance-course-copy">
                  <span className="erp-attendance-course-name">{courseGroup.course}</span>
                  <span className="erp-attendance-course-metrics">
                    <span className="result-count">{courseGroup.studentCount} students</span>
                    <span>{courseGroup.totalClasses} classes recorded</span>
                    <strong className={getPercentageClass(courseGroup.percentage)}>
                      {formatPercentage(courseGroup.percentage)} overall
                    </strong>
                    <span>{courseGroup.studyBatches.length} batches</span>
                  </span>
                </span>
                <ChevronDown
                  className={expandedCourses[courseGroup.course] ? "is-expanded" : ""}
                  size={21}
                  aria-hidden="true"
                />
              </button>

              {expandedCourses[courseGroup.course] && (
                <div id={`course-batches-${encodeURIComponent(courseGroup.course)}`} className="erp-attendance-course-batches">
                  {courseGroup.studyBatches.map((batchGroup) => {
                    const batchKey = `${courseGroup.course}::${batchGroup.studyBatch}`;
                    const batchExpanded = Boolean(expandedBatches[batchKey]);
                    const batchContentId = `attendance-batch-${encodeURIComponent(batchKey)}`;
                    return (
                    <section key={batchKey} className="erp-attendance-batch">
                      <button
                        type="button"
                        className="erp-attendance-batch-toggle"
                        aria-expanded={batchExpanded}
                        aria-controls={batchContentId}
                        onClick={() => toggleBatchResults(batchKey)}
                      >
                        <span className="erp-attendance-batch-heading">
                          <span className="batch-badge">Batch {batchGroup.studyBatch}</span>
                          <span className="erp-attendance-batch-summary">
                            {batchGroup.studentCount} students ·{" "}
                            <span className={getPercentageClass(batchGroup.percentage)}>
                              {formatPercentage(batchGroup.percentage)}
                            </span>
                          </span>
                        </span>
                        <ChevronDown className={batchExpanded ? "is-expanded" : ""} size={19} aria-hidden="true" />
                      </button>

                      {batchExpanded && <div id={batchContentId} className="erp-attendance-table-wrapper">
                    <table className="erp-attendance-table">
                      <thead>
                        <tr>
                          <th>#</th>
                          <th>Student</th>
                          <th>Roll Number</th>
                          <th className="number-column">Total</th>
                          <th className="number-column">Present</th>
                          <th className="number-column">Absent</th>
                          <th>Attendance</th>
                        </tr>
                      </thead>
                      <tbody>
                        {batchGroup.students.map((s, index) => (
                          <tr key={s.rollNumber}>
                            <td className="serial-column">{index + 1}</td>
                            <td>
                              <div className="student-cell">
                                <div className="student-avatar">
                                  {String(s.studentName || "S").charAt(0).toUpperCase()}
                                </div>
                                <div>
                                  <strong>{s.studentName || "Unknown Student"}</strong>
                                  {s.fatherName && <span>Father: {s.fatherName}</span>}
                                </div>
                              </div>
                            </td>
                            <td><span className="roll-number">{s.rollNumber || "—"}</span></td>
                            <td className="number-column">{s.totalClasses ?? 0}</td>
                            <td className="number-column">
                              <span className="present-value">{s.present ?? 0}</span>
                            </td>
                            <td className="number-column">
                              <span className="absent-value">{s.absent ?? 0}</span>
                            </td>
                            <td>
                              <div className="attendance-percentage-cell">
                                <div className="percentage-top">
                                  <span className={getPercentageClass(s.percentage)}>
                                    {formatPercentage(s.percentage)}
                                  </span>
                                </div>
                                <div className="percentage-progress">
                                  <span
                                    className={getPercentageClass(s.percentage)}
                                    style={{
                                      width: `${Math.min(Math.max(s.percentage || 0, 0), 100)}%`,
                                    }}
                                  />
                                </div>
                              </div>
                            </td>
                          </tr>
                        ))}

                        {batchGroup.students.length === 0 && (
                          <tr>
                            <td colSpan="8" className="empty-search-cell">
                              <div>
                                <span>⌕</span>
                                <strong>No matching records</strong>
                                <p>Try another student or roll number.</p>
                              </div>
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                      </div>}
                    </section>
                    );
                  })}
                </div>
              )}
            </article>
          ))}
        </div>
      )}

      {/* ================================================= EMPTY STATE ================================================= */}
      {!loading && searched && !error && !hasResults && (
        <div className="erp-attendance-empty erp-attendance-order--empty">
          <div className="empty-icon">◫</div>
          <h2>No attendance records found</h2>
          <p>
            There are no attendance records available
            {course ? ` for course ${course.toUpperCase()}` : ""}
            {batch ? ` in batch ${batch.toUpperCase()}` : ""}.
          </p>
          <button type="button" onClick={clearSearch}>
            Search Again
          </button>
        </div>
      )}

      {/* ================================================= INITIAL STATE ================================================= */}
      {!loading && !searched && (
        <div className="erp-attendance-initial erp-attendance-order--empty">
          <div className="initial-icon">✓</div>
          <h2>Your attendance overview will appear here</h2>
          <p>
            Example: enter “B.PHARMA” and “2A” to see that course and batch together. Leave both fields blank to see all students who have attendance records.
          </p>
        </div>
      )}

      {batchSummary.length > 0 && (
        <section className="attendance-admin-panel erp-attendance-order--batch">
          <span className="attendance-admin-kicker">BATCH DETAILS</span>
          <h2>Attendance by batch</h2>
          <p>Shows student and subject totals for the batch you searched. For example, “2A” shows its recorded classes, present count, and absences across courses. Use the overview above to narrow by course too.</p>
          <div className="attendance-admin-records-table-wrap">
            <table className="attendance-admin-records-table">
              <thead><tr><th>Student</th><th>Roll number</th><th>Batch</th><th>Subject</th><th>Total classes</th><th>Present</th><th>Absent</th><th>Attendance</th></tr></thead>
              <tbody>
                {batchSummary.map((row, index) => (
                  <tr key={`${row.rollNumber}-${row.subject}-${index}`}>
                    <td>{row.studentName || "—"}</td>
                    <td>{row.rollNumber || "—"}</td>
                    <td>{row.studyBatch || "—"}</td>
                    <td>{row.subject || "—"}</td>
                    <td>{row.totalClasses ?? 0}</td>
                    <td>{row.present ?? 0}</td>
                    <td>{row.absent ?? 0}</td>
                    <td>{formatPercentage(row.percentage)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}
      </DisclosureSection>
    </div>
  );
}
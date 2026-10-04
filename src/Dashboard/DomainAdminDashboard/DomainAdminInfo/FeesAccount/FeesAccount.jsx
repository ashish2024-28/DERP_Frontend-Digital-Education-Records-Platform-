import { useEffect, useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import "./FeesAccount.css";
import "../../../.././Dashboard/FeesAdminDashboard/FeesAccount/FeesAccount.css";


const apiBase = import.meta.env.VITE_API_BASE_URL?.replace(/\/+$/, "");

function getHeaders() {
  return {
    Authorization: `Bearer ${localStorage.getItem("token") || ""}`,
    "Content-Type": "application/json",
  };
}

async function fetchList(url) {
  const response = await fetch(url, { headers: getHeaders() });
  const text = await response.text();
  let result = {};

  if (text) {
    try {
      result = JSON.parse(text);
    } catch {
      result = { message: text };
    }
  }

  if (!response.ok || result.success === false) {
    throw new Error(result.message || result.detail || `Request failed (${response.status}).`);
  }

  const payload = result?.data ?? result;
  if (!Array.isArray(payload)) {
    throw new Error("The fees service returned an invalid list response.");
  }
  return payload;
}

async function fetchFeesAccountData(domain) {
  const base = `${apiBase}/${domain}/fees-admin`;
  const endpoints = [
    ["student accounts", "students", `${base}/all-students`],
    ["course fee schedule", "courseFees", `${base}/fees-course-wise`],
    ["payment methods", "methods", `${base}/payment-methods`],
    ["payment history", "payments", `${base}/admin/payments`],
    ["Fees Admin activity", "activity", `${base}/activity-logs`],
  ];
  const results = await Promise.allSettled(
    apiBase && domain ? endpoints.map(([, , url]) => fetchList(url)) : []
  );
  const data = { students: [], courseFees: [], methods: [], payments: [], activity: [] };
  const errors = [];

  if (!apiBase || !domain) {
    errors.push("The fees service URL or domain is not configured.");
  }
  results.forEach((result, index) => {
    const [label, key] = endpoints[index];
    if (result.status === "fulfilled") {
      data[key] = result.value;
    } else {
      errors.push(`${label}: ${result.reason?.message || "request failed"}`);
    }
  });
  return { data, errors };
}


function formatAmount(value) {
  if (value == null || value === "") return "—";
  const amount = Number(value);
  return Number.isFinite(amount)
    ? `₹${amount.toLocaleString("en-IN", { maximumFractionDigits: 2 })}`
    : "—";
}

function formatDate(value) {
  if (!value) return "—";
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? "—" : date.toLocaleString();
}

function getQrImageUrl(path) {
  if (!path) return "";
  return /^https?:\/\//i.test(path)
    ? path
    : `${apiBase}/${path.replace(/^\/+/, "")}`;
}

function StatusBadge({ value }) {
  const normalized = String(value || "unknown").toLowerCase();
  return <span className={`fees-account__status fees-account__status--${normalized}`}>{value || "Unknown"}</span>;
}

export default function DomainAdminFeesAccount() {
  const { domain } = useParams();
  const [students, setStudents] = useState([]);
  const [courseFees, setCourseFees] = useState([]);
  const [methods, setMethods] = useState([]);
  const [payments, setPayments] = useState([]);
  const [activity, setActivity] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [selectedCourse, setSelectedCourse] = useState("ALL");
  const [selectedBatch, setSelectedBatch] = useState("ALL");
  const [refreshId, setRefreshId] = useState(0);

  useEffect(() => {
    let active = true;
    fetchFeesAccountData(domain).then(({ data, errors }) => {
      if (!active) return;
      setStudents(data.students);
      setCourseFees(data.courseFees);
      setMethods(data.methods);
      setPayments(data.payments);
      setActivity(data.activity);
      setError(errors.join(" "));
      setLoading(false);
    });
    return () => {
      active = false;
    };
  }, [domain, refreshId]);

  const studentCourses = useMemo(
    () => [...new Set(students.map((student) => student.course?.trim()).filter(Boolean))]
      .sort((first, second) => first.localeCompare(second)),
    [students]
  );

  const courseCounts = useMemo(
    () => students.reduce((counts, student) => {
      const course = student.course?.trim();
      if (course) counts[course] = (counts[course] || 0) + 1;
      return counts;
    }, {}),
    [students]
  );

  const courseFilteredStudents = useMemo(
    () => selectedCourse === "ALL"
      ? students
      : students.filter((student) => student.course?.trim() === selectedCourse),
    [selectedCourse, students]
  );

  const studentBatches = useMemo(
    () => [...new Set(courseFilteredStudents
      .map((student) => student.studyBatch?.trim() || student.batch?.trim())
      .filter(Boolean))]
      .sort((first, second) => first.localeCompare(second, undefined, { numeric: true })),
    [courseFilteredStudents]
  );

  const batchCounts = useMemo(
    () => courseFilteredStudents.reduce((counts, student) => {
      const batch = student.studyBatch?.trim() || student.batch?.trim();
      if (batch) counts[batch] = (counts[batch] || 0) + 1;
      return counts;
    }, {}),
    [courseFilteredStudents]
  );

  const batchFilteredStudents = useMemo(
    () => selectedBatch === "ALL"
      ? courseFilteredStudents
      : courseFilteredStudents.filter(
        (student) => (student.studyBatch?.trim() || student.batch?.trim()) === selectedBatch
      ),
    [courseFilteredStudents, selectedBatch]
  );

  const filteredStudents = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return batchFilteredStudents;
    return batchFilteredStudents.filter((student) =>
      [student.name, student.email, student.rollNumber, student.course, student.studyBatch, student.batch, student.academicSession]
        .filter(Boolean)
        .some((value) => String(value).toLowerCase().includes(query))
    );
  }, [batchFilteredStudents, search]);

  const totalOutstanding = useMemo(
    () => students.reduce((sum, student) => sum + (Number(student.feesAccount?.totalDues) || 0), 0),
    [students]
  );


 
async function toggleMethod(method) {
  setSaving(true);
  setError("");

  try {
    const base = `${apiBase}/${domain}/fees-admin`;

    const url =
      `${base}/payment-method/${method.id}/active?active=${!method.active}`;

    console.log("Toggle payment method URL:", url);
    console.log("Current method:", method);
    console.log("New active value:", !method.active);

    const response = await fetch(url, {
      method: "PUT",
      headers: getHeaders(),
    });

    const text = await response.text();

    console.log("Toggle response status:", response.status);
    console.log("Toggle response body:", text);

    let result = {};

    if (text) {
      try {
        result = JSON.parse(text);
      } catch {
        result = { message: text };
      }
    }

    if (!response.ok || result.success === false) {
      throw new Error(
        result.message ||
        result.detail ||
        text ||
        `Request failed (${response.status}).`
      );
    }

    setRefreshId((value) => value + 1);

  } catch (requestError) {
    console.error("Toggle payment method error:", requestError);

    setError(
      requestError.message ||
      "Unable to update payment method."
    );
  } finally {
    setSaving(false);
  }
}


    return (
      <main className="fees-account">
        <header className="fees-account__header">
          <div>
            <p className="fees-account__eyebrow">DOMAIN ADMIN · FINANCE</p>
            <h1>Fees Account Oversight</h1>
            <p>Read-only view of student fee accounts, payment methods, transactions, and Fees Admin activity.</p>
          </div>
          <button type="button" className="fees-account__button" onClick={() => { setLoading(true); setRefreshId((value) => value + 1); }} disabled={loading}>
            <span aria-hidden="true"> ↻ </span>{loading ? "Refreshing…" : "Refresh"}
          </button>
        </header>

        {error && <div className="fees-account__notice" role="alert">{error}</div>}

        <section className="fees-account__summary">
          <article><span>Student fee accounts</span><strong>{loading ? "…" : students.length}</strong></article>
          <article><span>Course fee schedules</span><strong>{loading ? "…" : courseFees.length}</strong></article>
          <article><span>Payment methods</span><strong>{loading ? "…" : methods.length}</strong></article>
          <article><span>Recorded payments</span><strong>{loading ? "…" : payments.length}</strong></article>
          <article><span>Total outstanding</span><strong>{loading ? "…" : formatAmount(totalOutstanding)}</strong></article>
        </section>

        <section className="fees-account__panel">
          <div className="fees-account__section-heading">
            <div><h2>Student fee accounts</h2><p>Balances reflect recorded and verified payments.</p></div>
            <input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search students" aria-label="Search student fee accounts" />
          </div>
          <div className="fees-account__filters">
            <div className="fees-account__filter-group" role="group" aria-label="Filter student accounts by course">
              <span className="fees-account__filter-label">Course</span>
              <div className="fees-account__course-filters">
                <button
                  type="button"
                  className={selectedCourse === "ALL" ? "is-selected" : ""}
                  aria-pressed={selectedCourse === "ALL"}
                  onClick={() => {
                    setSelectedCourse("ALL");
                    setSelectedBatch("ALL");
                  }}
                >
                  All courses <span>{students.length}</span>
                </button>
                {studentCourses.map((course) => (
                  <button
                    key={course}
                    type="button"
                    className={selectedCourse === course ? "is-selected" : ""}
                    aria-pressed={selectedCourse === course}
                    onClick={() => {
                      setSelectedCourse(course);
                      setSelectedBatch("ALL");
                    }}
                  >
                    {course} <span>{courseCounts[course]}</span>
                  </button>
                ))}
              </div>
            </div>
            {studentBatches.length > 0 && (
              <div className="fees-account__filter-group" role="group" aria-label="Filter student accounts by batch or section">
                <span className="fees-account__filter-label">Batch / section</span>
                <div className="fees-account__course-filters">
                  <button
                    type="button"
                    className={selectedBatch === "ALL" ? "is-selected" : ""}
                    aria-pressed={selectedBatch === "ALL"}
                    onClick={() => setSelectedBatch("ALL")}
                  >
                    All batches <span>{courseFilteredStudents.length}</span>
                  </button>
                  {studentBatches.map((batch) => (
                    <button
                      key={batch}
                      type="button"
                      className={selectedBatch === batch ? "is-selected" : ""}
                      aria-pressed={selectedBatch === batch}
                      onClick={() => setSelectedBatch(batch)}
                    >
                      {batch} <span>{batchCounts[batch]}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
          {loading ? <p className="fees-account__empty">Loading student accounts…</p> : filteredStudents.length === 0 ? (
            <p className="fees-account__empty">
              {search || selectedCourse !== "ALL" || selectedBatch !== "ALL"
                ? "No student accounts match the selected course, batch, and search."
                : "No student accounts found."}
            </p>
          ) : (
            <div className="fees-account__table-wrap">
              <table>
                <thead><tr><th>S.No</th><th>Student</th><th>Roll number</th><th>Course</th><th>Session</th><th>Total fees</th><th>Paid</th><th>Outstanding</th></tr></thead>
                <tbody>{filteredStudents.map((student, index) => (
                  <tr key={student.email || student.rollNumber}>
                    <td>{index + 1}</td>
                    <td>{student.name || "—"}<small>{student.email || "—"}</small></td>
                    <td>{student.rollNumber || "—"}</td>
                    <td>{student.course || "—"}</td>
                    <td>{student.feesAccount?.academicSession || student.academicSession || "—"}</td>
                    <td>{formatAmount(student.feesAccount?.totalFees)}</td>
                    <td>{formatAmount(student.feesAccount?.totalPaid)}</td>
                    <td>{formatAmount(student.feesAccount?.totalDues)}</td>
                  </tr>
                ))}</tbody>
              </table>
            </div>
          )}
        </section>

        <section className="fees-account__panel">
          <div className="fees-account__section-heading">
            <div><h2>Course fee schedule</h2><p>Fee amounts configured for this domain.</p></div>
          </div>
          {loading ? <p className="fees-account__empty">Loading fee schedule…</p> : courseFees.length === 0 ? (
            <p className="fees-account__empty">No course fee amounts are configured.</p>
          ) : (
            <div className="fees-account__course-list">{courseFees.map((course) => (
              <article key={course.course}><span>{course.course || "Course"}</span><strong>{formatAmount(course.fees)}</strong></article>
            ))}</div>
          )}
        </section>

        <section className="fees-account__panel">
          <div className="fees-account__section-heading">
            <div><h2>Payment methods</h2><p>Configured bank and online payment instructions.</p></div>
          </div>
          {loading ? <p className="fees-account__empty">Loading payment methods…</p> : methods.length === 0 ? (
            <p className="fees-account__empty">No payment methods have been configured.</p>
          ) : (
            <div className="fees-account__method-list">{methods.map((method) => (
              <article key={method.id}>
                <div>

                  <span className="inline-flex items-center whitespace-nowrap">
                    <button
                      type="button"
                      className="inline-flex items-center justify-center whitespace-nowrap rounded-md px-3 py-2 text-sm font-medium"
                      onClick={() => toggleMethod(method)}
                      disabled={saving}
                    >
                      {method.active ? "Deactivate" : "Activate"}
                    </button>

                    <span className={`fees-management__pill ${method.active ? "is-active" : ""}`}>{method.active ? "Active" : "Inactive"}</span>
                  </span>

                  <h3>{method.displayName || method.paymentType || "Payment method"}</h3>
                  <p>{method.paymentType === "BANK"
                    ? [method.bankName, method.accountName, method.accountNumber, method.ifsc, method.branch].filter(Boolean).join(" · ")
                    : method.upiId || "Online payment"}
                  </p>
                  {method.instructions && <small>{method.instructions}</small>}
                  {method.feesAdminEmail && <p><small>Managed by {method.feesAdminEmail}</small></p>}
                </div>
                {method.qrImagePath && (
                  <img
                    className="fees-account__method-qr"
                    src={getQrImageUrl(method.qrImagePath)}
                    alt={`${method.displayName || "Payment"} QR code`}
                    loading="lazy"
                  />
                )}
              </article>
            ))}</div>
          )}
        </section>

        <section className="fees-account__panel">
          <div className="fees-account__section-heading">
            <div><h2>Payment history</h2><p>All cash and online transactions recorded for this domain.</p></div>
          </div>
          {loading ? <p className="fees-account__empty">Loading payment history…</p> : payments.length === 0 ? (
            <p className="fees-account__empty">No payments are recorded yet.</p>
          ) : (
            <div className="fees-account__table-wrap">
              <table>
                <thead><tr><th>Student</th><th>Roll number</th><th>Session</th><th>Type</th><th>Reference</th><th>Amount</th><th>Status</th><th>Verified by</th><th>Updated</th></tr></thead>
                <tbody>{payments.map((payment) => (
                  <tr key={payment.id}>
                    <td>{payment.studentName || "—"}<small>{payment.email || "—"}</small></td>
                    <td>{payment.rollNumber || "—"}</td>
                    <td>{payment.academicSession || "—"}</td>
                    <td>{payment.paymentType || "—"}</td>
                    <td>{payment.upiTransactionId || "—"}</td>
                    <td>{formatAmount(payment.amount)}</td>
                    <td><StatusBadge value={payment.status} /></td>
                    <td>{payment.verifiedByFeesAdminEmail || "—"}</td>
                    <td>{formatDate(payment.verifiedAt)}</td>
                  </tr>
                ))}</tbody>
              </table>
            </div>
          )}
        </section>

        <section className="fees-account__panel">
          <div className="fees-account__section-heading">
            <div><h2>Fees Admin activity</h2><p>Domain-wide audit trail of payment and payment-method changes.</p></div>
          </div>
          {loading ? <p className="fees-account__empty">Loading activity…</p> : activity.length === 0 ? (
            <p className="fees-account__empty">No Fees Admin activity has been recorded.</p>
          ) : (
            <div className="fees-account__activity-list">{activity.map((entry) => (
              <article key={entry.id}>
                <div><strong>{String(entry.action || "Activity").replaceAll("_", " ")}</strong><p>{entry.details || entry.targetType || "Fees account activity"}</p></div>
                <div><span>{entry.actorEmail}</span><time dateTime={entry.createdAt}>{formatDate(entry.createdAt)}</time></div>
              </article>
            ))}</div>
          )}
        </section>
      </main>
    );
  }

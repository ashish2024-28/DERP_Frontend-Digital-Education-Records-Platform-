
import { useCallback, useEffect, useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import "./FeesAccount.css";

const apiBase = import.meta.env.VITE_API_BASE_URL?.replace(/\/+$/, "");

function headers() {
  return {
    Authorization: "Bearer " + localStorage.getItem("token"),
    "Content-Type": "application/json",
  };
}

async function readResponse(response) {
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
    const validationMessages = Object.values(result.errors || {})
      .flat()
      .filter(Boolean);

    throw new Error(
      result.message ||
        result.detail ||
        validationMessages.join(" ") ||
        result.title ||
        `Fee request failed (${response.status}).`
    );
  }

  return result;
}

function responseData(payload) {
  return payload?.data ?? payload;
}

function getQrImageUrl(path) {
  if (!path) return "";

  return /^https?:\/\//i.test(path)
    ? path
    : `${apiBase}/${path.replace(/^\/+/, "")}`;
}

function formatAmount(amount) {
  return `₹${Number(amount || 0).toLocaleString("en-IN", {
    maximumFractionDigits: 2,
  })}`;
}

function formatDate(value) {
  if (!value) return "—";

  const date = new Date(value);

  return Number.isNaN(date.getTime())
    ? String(value)
    : date.toLocaleString("en-IN");
}

const initialBank = {
  displayName: "",
  bankName: "",
  accountName: "",
  accountNumber: "",
  ifsc: "",
  branch: "",
  instructions: "",
};

const initialOnline = {
  displayName: "",
  upiId: "",
  instructions: "",
};

/* Reusable collapsible dashboard section */
function CollapsibleSection({
  title,
  description,
  children,
  actions,
  defaultOpen = true,
}) {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <section className="fees-management__panel">
      <div className="fees-management__section-heading">
        <button
          type="button"
          className="fees-management__collapse-toggle"
          aria-expanded={open}
          onClick={() => setOpen((previous) => !previous)}
        >
          <span className="fees-management__collapse-icon" aria-hidden="true">
            {open ? "−" : "+"}
          </span>

          <span className="fees-management__collapse-text">
            <span className="fees-management__collapse-title">
              {title}
            </span>

            <span className="fees-management__collapse-description">
              {description}
            </span>
          </span>
        </button>

        {actions && (
          <div className="fees-management__section-actions">
            {actions}
          </div>
        )}
      </div>

      {open && (
        <div className="fees-management__section-body">
          {children}
        </div>
      )}
    </section>
  );
}

export default function FeesAdminFeesAccount() {
  const { domain } = useParams();
  const base = `${apiBase}/${domain}/fees-admin`;

  const [methods, setMethods] = useState([]);
  const [pending, setPending] = useState([]);
  const [recordedPayments, setRecordedPayments] = useState(0);
  const [students, setStudents] = useState([]);
  const [courseFees, setCourseFees] = useState([]);
  const [activityLogs, setActivityLogs] = useState([]);

  const [bankForm, setBankForm] = useState(initialBank);
  const [onlineForm, setOnlineForm] = useState(initialOnline);
  const [qrImage, setQrImage] = useState(null);

  const [cashForm, setCashForm] = useState({
    email: "",
    rollNumber: "",
    amount: "",
  });

  const [rejectionReasons, setRejectionReasons] = useState({});
  const [search, setSearch] = useState("");
  const [studentSearch, setStudentSearch] = useState("");

  const [selectedCourse, setSelectedCourse] = useState("ALL");
  const [selectedBatch, setSelectedBatch] = useState("ALL");

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [confirmReview, setConfirmReview] = useState(null);

  const loadFeesData = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      if (!apiBase || !domain) {
        throw new Error(
          "Fee service URL or domain is not configured."
        );
      }

      const endpoints = [
        ["payment methods", `${base}/payment-methods`, setMethods],
        ["pending payments", `${base}/payments/pending`, setPending],
        [
          "recorded payment count",
          `${base}/payments/recorded/count`,
          setRecordedPayments,
        ],
        ["student accounts", `${base}/all-students`, setStudents],
        ["course fee schedule", `${base}/fees-course-wise`, setCourseFees],
        ["Fees Admin activity", `${base}/activity-logs`, setActivityLogs],
      ];

      const results = await Promise.allSettled(
        endpoints.map(async ([, url]) => {
          const response = await fetch(url, {
            headers: headers(),
          });

          return readResponse(response);
        })
      );

      const issues = [];

      results.forEach((result, index) => {
        const [label, , setter] = endpoints[index];

        if (result.status === "rejected") {
          issues.push(
            `${label}: ${result.reason?.message || "request failed"}`
          );
          return;
        }

        const payload = responseData(result.value);

        if (index === 2) {
          const count = Number(payload);

          if (!Number.isFinite(count) || count < 0) {
            issues.push(
              "recorded payment count: invalid response from the server"
            );
          } else {
            setter(count);
          }
        } else {
          setter(Array.isArray(payload) ? payload : []);
        }
      });

      setError(issues.join(" "));
    } catch (requestError) {
      setError(
        requestError.message ||
          "Unable to load fee management data."
      );
    } finally {
      setLoading(false);
    }
  }, [base, domain]);

  useEffect(() => {
    loadFeesData();
  }, [loadFeesData]);

  const filteredPending = useMemo(() => {
    const query = search.trim().toLowerCase();

    return pending.filter((payment) =>
      [
        payment.studentName,
        payment.email,
        payment.rollNumber,
        payment.upiTransactionId,
        payment.course,
        payment.academicSession,
        payment.paymentType,
      ]
        .filter(Boolean)
        .some((value) =>
          String(value).toLowerCase().includes(query)
        )
    );
  }, [pending, search]);

  const studentCourses = useMemo(
    () =>
      [
        ...new Set(
          students
            .map((student) => student.course?.trim())
            .filter(Boolean)
        ),
      ].sort((a, b) => a.localeCompare(b)),
    [students]
  );

  const courseFilteredStudents = useMemo(
    () =>
      selectedCourse === "ALL"
        ? students
        : students.filter(
            (student) => student.course?.trim() === selectedCourse
          ),
    [selectedCourse, students]
  );

  const studentBatches = useMemo(
    () =>
      [
        ...new Set(
          courseFilteredStudents
            .map(
              (student) =>
                student.studyBatch?.trim() || student.batch?.trim()
            )
            .filter(Boolean)
        ),
      ].sort((a, b) =>
        a.localeCompare(b, undefined, { numeric: true })
      ),
    [courseFilteredStudents]
  );

  const filteredStudents = useMemo(() => {
    const query = studentSearch.trim().toLowerCase();

    return courseFilteredStudents
      .filter((student) => {
        const batch =
          student.studyBatch?.trim() || student.batch?.trim();

        return selectedBatch === "ALL" || batch === selectedBatch;
      })
      .filter((student) => {
        if (!query) return true;

        return [
          student.name,
          student.email,
          student.rollNumber,
          student.course,
          student.studyBatch,
          student.batch,
          student.academicSession,
        ]
          .filter(Boolean)
          .some((value) =>
            String(value).toLowerCase().includes(query)
          );
      });
  }, [courseFilteredStudents, selectedBatch, studentSearch]);

  const totalOutstanding = useMemo(
    () =>
      students.reduce(
        (sum, student) =>
          sum + (Number(student.feesAccount?.totalDues) || 0),
        0
      ),
    [students]
  );

  async function sendRequest(path, method, body) {
    const response = await fetch(`${base}${path}`, {
      method,
      headers: headers(),
      ...(body ? { body: JSON.stringify(body) } : {}),
    });

    return readResponse(response);
  }

  async function createMethod(event, type) {
    event.preventDefault();
    setSaving(true);
    setError("");
    setMessage("");

    try {
      const form = type === "BANK" ? bankForm : onlineForm;
      let result;

      if (type === "ONLINE") {
        const formData = new FormData();

        formData.append(
          "paymentOnlineDTO",
          new Blob([JSON.stringify(form)], {
            type: "application/json",
          })
        );

        if (qrImage) {
          formData.append("qrImage", qrImage);
        }

        const response = await fetch(
          `${base}/payment-method/online`,
          {
            method: "POST",
            headers: {
              Authorization: headers().Authorization,
            },
            body: formData,
          }
        );

        result = await readResponse(response);
      } else {
        result = await sendRequest(
          `/payment-method/${type.toLowerCase()}`,
          "POST",
          form
        );
      }

      setMessage(result.message || "Payment instructions saved.");

      if (type === "BANK") {
        setBankForm(initialBank);
      } else {
        setOnlineForm(initialOnline);
        setQrImage(null);
      }

      await loadFeesData();
    } catch (requestError) {
      setError(
        requestError.message ||
          "Unable to save payment instructions."
      );
    } finally {
      setSaving(false);
    }
  }

  async function toggleMethod(method) {
    setSaving(true);
    setError("");
    setMessage("");

    try {
      const result = await sendRequest(
        `/payment-method/${method.id}/active?active=${!method.active}`,
        "PUT"
      );

      setMessage(result.message || "Payment method updated.");
      await loadFeesData();
    } catch (requestError) {
      setError(
        requestError.message ||
          "Unable to update payment method."
      );
    } finally {
      setSaving(false);
    }
  }

  async function recordCashPayment(event) {
    event.preventDefault();

    const paymentAmount = Number(cashForm.amount);

    if (!Number.isFinite(paymentAmount) || paymentAmount <= 0) {
      setError(
        "Enter a valid cash payment amount greater than zero."
      );
      return;
    }

    setSaving(true);
    setError("");
    setMessage("");

    try {
      const result = await sendRequest("/payment/cash", "POST", {
        email: cashForm.email.trim(),
        rollNumber: cashForm.rollNumber.trim(),
        amount: paymentAmount,
      });

      setMessage(result.message || "Cash payment recorded.");

      setCashForm({
        email: "",
        rollNumber: "",
        amount: "",
      });

      await loadFeesData();
    } catch (requestError) {
      setError(
        requestError.message ||
          "Unable to record cash payment."
      );
    } finally {
      setSaving(false);
    }
  }

  function reviewPayment(payment, approve) {
    const transactionId = payment.upiTransactionId;
    const note = (
      rejectionReasons[transactionId] || ""
    ).trim();

    if (!transactionId) {
      setError("Transaction ID is missing for this payment.");
      return;
    }

    if (!note) {
      setError("Please enter a note before continuing.");
      return;
    }

    setError("");
    setMessage("");

    setConfirmReview({
      payment,
      approve,
      note,
    });
  }

  async function confirmReviewPayment() {
    if (!confirmReview || saving) return;

    const { payment, approve, note } = confirmReview;
    const transactionId = payment.upiTransactionId;

    setSaving(true);
    setError("");
    setMessage("");

    try {
      const result = await sendRequest(
        `/online-payment/verify-${approve ? "success" : "fail"}`,
        "POST",
        {
          email: payment.email,
          rollNumber: payment.rollNumber,
          upiTransactionId: transactionId,
          rejectionReason: note,
        }
      );

      setConfirmReview(null);

      setMessage(
        result.message ||
          (approve
            ? "Payment verified successfully."
            : "Payment rejected successfully.")
      );

      setRejectionReasons((previous) => {
        const updated = { ...previous };
        delete updated[transactionId];
        return updated;
      });

      await loadFeesData();
    } catch (requestError) {
      setError(
        requestError.message ||
          "Unable to review this payment."
      );
    } finally {
      setSaving(false);
    }
  }

  return (
    <main className="fees-management">
      <header className="fees-management__header">
        <div>
          <p className="fees-management__eyebrow">
            FEES ADMIN · FINANCE
          </p>

          <h1>Fees &amp; Payment Operations</h1>

          <p>
            Configure payment instructions, review student submissions,
            and record cash receipts.
          </p>
        </div>

        <button
          type="button"
          className="fees-management__secondary"
          onClick={loadFeesData}
          disabled={loading || saving}
        >
          <span aria-hidden="true">↻</span>{" "}
          {loading ? "Refreshing…" : "Refresh"}
        </button>
      </header>

      {error && (
        <div
          className="fees-management__notice fees-management__notice--error"
          role="alert"
        >
          {error}
        </div>
      )}

      {message && (
        <div
          className="fees-management__notice fees-management__notice--success"
          role="status"
        >
          {message}
        </div>
      )}

      {/* Summary cards */}
      <section className="fees-management__summary">
        <article>
          <span className="fees-management__summary-icon">♙</span>
          <div>
            <span>Student fee accounts</span>
            <strong>{loading ? "…" : students.length}</strong>
          </div>
        </article>

        <article>
          <span className="fees-management__summary-icon">♙</span>
          <div>
            <span>Course fee schedules</span>
            <strong>{loading ? "…" : courseFees.length}</strong>
          </div>
        </article>

        <article>
          <span className="fees-management__summary-icon">₹</span>
          <div>
            <span>Payment methods</span>
            <strong>{loading ? "…" : methods.length}</strong>
          </div>
        </article>

        <article>
          <span className="fees-management__summary-icon">✓</span>
          <div>
            <span>Recorded payments</span>
            <strong>{loading ? "…" : recordedPayments}</strong>
          </div>
        </article>

        <article>
          <span className="fees-management__summary-icon">Σ</span>
          <div>
            <span>Total outstanding</span>
            <strong>
              {loading ? "…" : formatAmount(totalOutstanding)}
            </strong>
          </div>
        </article>
      </section>

      {/* 1. Student fee accounts */}
      <CollapsibleSection
        title={`Student fee accounts (${students.length})`}
        description="Balances reflect recorded and verified payments."
        actions={
          <input
            className="fees-management__student-search"
            type="search"
            value={studentSearch}
            onChange={(event) => setStudentSearch(event.target.value)}
            placeholder="Search students"
            aria-label="Search student fee accounts"
          />
        }
      >
        <div className="fees-management__filters">
          <div
            className="fees-management__filter-group"
            role="group"
            aria-label="Filter student accounts by course"
          >
            <span>Course</span>

            <div className="fees-management__filter-options">
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
                  type="button"
                  key={course}
                  className={
                    selectedCourse === course ? "is-selected" : ""
                  }
                  aria-pressed={selectedCourse === course}
                  onClick={() => {
                    setSelectedCourse(course);
                    setSelectedBatch("ALL");
                  }}
                >
                  {course}
                  <span>
                    {
                      students.filter(
                        (student) =>
                          student.course?.trim() === course
                      ).length
                    }
                  </span>
                </button>
              ))}
            </div>
          </div>

          {studentBatches.length > 0 && (
            <div
              className="fees-management__filter-group"
              role="group"
              aria-label="Filter student accounts by batch or section"
            >
              <span>Batch / section</span>

              <div className="fees-management__filter-options">
                <button
                  type="button"
                  className={
                    selectedBatch === "ALL" ? "is-selected" : ""
                  }
                  aria-pressed={selectedBatch === "ALL"}
                  onClick={() => setSelectedBatch("ALL")}
                >
                  All batches
                  <span>{courseFilteredStudents.length}</span>
                </button>

                {studentBatches.map((batch) => (
                  <button
                    type="button"
                    key={batch}
                    className={
                      selectedBatch === batch ? "is-selected" : ""
                    }
                    aria-pressed={selectedBatch === batch}
                    onClick={() => setSelectedBatch(batch)}
                  >
                    {batch}
                    <span>
                      {
                        courseFilteredStudents.filter(
                          (student) =>
                            (student.studyBatch?.trim() ||
                              student.batch?.trim()) === batch
                        ).length
                      }
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {loading ? (
          <p className="fees-management__empty">
            Loading student accounts…
          </p>
        ) : filteredStudents.length === 0 ? (
          <p className="fees-management__empty">
            {studentSearch ||
            selectedCourse !== "ALL" ||
            selectedBatch !== "ALL"
              ? "No student accounts match the selected course, batch, and search."
              : "No student fee accounts found."}
          </p>
        ) : (
          <div className="fees-management__table-wrap">
            <table className="fees-management__table">
              <thead>
                <tr>
                  <th>S.No</th>
                  <th>Student</th>
                  <th>Roll number</th>
                  <th>Course</th>
                  <th>Batch</th>
                  <th>Session</th>
                  <th>Total fees</th>
                  <th>Paid</th>
                  <th>Outstanding</th>
                </tr>
              </thead>

              <tbody>
                {filteredStudents.map((student, index) => (
                  <tr key={student.email || student.rollNumber || index}>
                    <td>{index + 1}</td>

                    <td>
                      {student.name || "—"}
                      <small>{student.email || "—"}</small>
                    </td>

                    <td>{student.rollNumber || "—"}</td>
                    <td>{student.course || "—"}</td>

                    <td>
                      {student.studyBatch || student.batch || "—"}
                    </td>

                    <td>
                      {student.feesAccount?.academicSession ||
                        student.academicSession ||
                        "—"}
                    </td>

                    <td>
                      {student.feesAccount?.totalFees == null
                        ? "—"
                        : formatAmount(student.feesAccount.totalFees)}
                    </td>

                    <td>
                      {student.feesAccount?.totalPaid == null
                        ? "—"
                        : formatAmount(student.feesAccount.totalPaid)}
                    </td>

                    <td>
                      {student.feesAccount?.totalDues == null
                        ? "—"
                        : formatAmount(student.feesAccount.totalDues)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </CollapsibleSection>

      {/* 2. Course fee schedule */}
      <CollapsibleSection
        title={`Course fee schedule (${courseFees.length})`}
        description="Read-only course fee amounts configured by the domain administrator."
      >
        {loading ? (
          <p className="fees-management__empty">
            Loading course fee schedule…
          </p>
        ) : courseFees.length === 0 ? (
          <p className="fees-management__empty">
            No course fee entries are configured.
          </p>
        ) : (
          <div className="fees-management__course-list">
            {courseFees.map((course, index) => (
              <article key={course.course || index}>
                <span>{course.course || "Unnamed course"}</span>
                <strong>
                  {course.fees == null
                    ? "—"
                    : formatAmount(course.fees)}
                </strong>
              </article>
            ))}
          </div>
        )}
      </CollapsibleSection>

      {/* 3. Payment instructions */}
      <CollapsibleSection
        title="Payment instructions"
        description="Add bank details or online payment instructions for students."
      >
        <div className="fees-management__forms">
          <form onSubmit={(event) => createMethod(event, "BANK")}>
            <h3>Add bank account</h3>

            <label>
              Display name
              <input
                value={bankForm.displayName}
                onChange={(event) =>
                  setBankForm({
                    ...bankForm,
                    displayName: event.target.value,
                  })
                }
                required
              />
            </label>

            <label>
              Bank name
              <input
                value={bankForm.bankName}
                onChange={(event) =>
                  setBankForm({
                    ...bankForm,
                    bankName: event.target.value,
                  })
                }
                required
              />
            </label>

            <label>
              Account holder
              <input
                value={bankForm.accountName}
                onChange={(event) =>
                  setBankForm({
                    ...bankForm,
                    accountName: event.target.value,
                  })
                }
                required
              />
            </label>

            <label>
              Account number
              <input
                value={bankForm.accountNumber}
                onChange={(event) =>
                  setBankForm({
                    ...bankForm,
                    accountNumber: event.target.value,
                  })
                }
                required
              />
            </label>

            <label>
              IFSC
              <input
                value={bankForm.ifsc}
                onChange={(event) =>
                  setBankForm({
                    ...bankForm,
                    ifsc: event.target.value,
                  })
                }
                required
              />
            </label>

            <label>
              Branch
              <input
                value={bankForm.branch}
                onChange={(event) =>
                  setBankForm({
                    ...bankForm,
                    branch: event.target.value,
                  })
                }
              />
            </label>

            <label>
              Instructions
              <textarea
                value={bankForm.instructions}
                onChange={(event) =>
                  setBankForm({
                    ...bankForm,
                    instructions: event.target.value,
                  })
                }
              />
            </label>

            <button type="submit" disabled={saving}>
              {saving ? "Saving…" : "Save bank details"}
            </button>
          </form>

          <form onSubmit={(event) => createMethod(event, "ONLINE")}>
            <h3>Add UPI / online method</h3>

            <label>
              Display name
              <input
                value={onlineForm.displayName}
                onChange={(event) =>
                  setOnlineForm({
                    ...onlineForm,
                    displayName: event.target.value,
                  })
                }
                required
              />
            </label>

            <label>
              UPI ID
              <input
                value={onlineForm.upiId}
                onChange={(event) =>
                  setOnlineForm({
                    ...onlineForm,
                    upiId: event.target.value,
                  })
                }
                required
              />
            </label>

            <label>
              QR image (optional)
              <input
                type="file"
                accept="image/png,image/jpeg"
                onChange={(event) => {
                  const file = event.target.files?.[0] || null;

                  if (
                    file &&
                    !["image/png", "image/jpeg"].includes(file.type)
                  ) {
                    setError(
                      "QR image must be a PNG or JPEG file."
                    );
                    event.target.value = "";
                    setQrImage(null);
                    return;
                  }

                  if (file && file.size > 5 * 1024 * 1024) {
                    setError(
                      "QR image must be 5 MB or smaller."
                    );
                    event.target.value = "";
                    setQrImage(null);
                    return;
                  }

                  setError("");
                  setQrImage(file);
                }}
              />

              <small className="fees-management__file-hint">
                {qrImage
                  ? qrImage.name
                  : "PNG or JPEG, up to 5 MB"}
              </small>
            </label>

            <label>
              Instructions
              <textarea
                value={onlineForm.instructions}
                onChange={(event) =>
                  setOnlineForm({
                    ...onlineForm,
                    instructions: event.target.value,
                  })
                }
              />
            </label>

            <button type="submit" disabled={saving}>
              {saving ? "Saving…" : "Save online details"}
            </button>
          </form>
        </div>
      </CollapsibleSection>

      {/* 4. Payment methods */}
      <CollapsibleSection
        title={`Payment methods (${methods.length})`}
        description="All configured bank and online payment methods for this domain."
      >
        <div className="fees-management__method-list">
          {methods.map((method) => (
            <article
              key={method.id}
              className="fees-management__method"
            >
              <div className="fees-management__method-details">
                <div className="fees-management__method-status">
                  <button
                    type="button"
                    onClick={() => toggleMethod(method)}
                    disabled={saving}
                  >
                    {method.active ? "Deactivate" : "Activate"}
                  </button>

                  <span
                    className={`fees-management__pill ${
                      method.active ? "is-active" : ""
                    }`}
                  >
                    {method.active ? "Active" : "Inactive"}
                  </span>
                </div>

                <h3>
                  Display name: {method.displayName || "—"}
                </h3>

                {method.paymentType === "BANK" ? (
                  <div>
                    <p>
                      Account holder: {method.accountName || "—"}
                    </p>
                    <p>
                      Account number: {method.accountNumber || "—"}
                    </p>
                    <p>IFSC: {method.ifsc || "—"}</p>
                    <p>Bank: {method.bankName || "—"}</p>
                    <p>Branch: {method.branch || "—"}</p>
                  </div>
                ) : (
                  <p>UPI ID: {method.upiId || "—"}</p>
                )}

                {method.instructions && (
                  <p>{method.instructions}</p>
                )}

                {method.feesAdminEmail && (
                  <small>
                    Managed by {method.feesAdminEmail}
                  </small>
                )}
              </div>

              {method.qrImagePath && (
                <img
                  className="fees-management__qr"
                  src={getQrImageUrl(method.qrImagePath)}
                  alt={`${method.displayName || "Payment"} QR code`}
                  loading="lazy"
                />
              )}
            </article>
          ))}

          {!loading && methods.length === 0 && (
            <p className="fees-management__empty">
              No payment methods configured yet.
            </p>
          )}
        </div>
      </CollapsibleSection>

      {/* 5. Pending payment verification */}
      <CollapsibleSection
        title={`Pending payment verification (${pending.length})`}
        description="Only successful verification increases the student's paid balance."
        actions={
          <input
            className="fees-management__search"
            type="search"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search name, email, roll, reference"
            aria-label="Search pending payments"
          />
        }
      >
        {loading ? (
          <p className="fees-management__empty">
            Loading payment queue…
          </p>
        ) : filteredPending.length === 0 ? (
          <p className="fees-management__empty">
            No matching pending payments.
          </p>
        ) : (
          <div className="fees-management__table-wrap">
            <table className="fees-management__table fees-management__pending-table">
              <thead>
                <tr>
                  <th>S.No</th>
                  <th>Student name</th>
                  <th>Email</th>
                  <th>Roll number</th>
                  <th>Course</th>
                  <th>Session</th>
                  <th>Payment type</th>
                  <th>Amount</th>
                  <th>Transaction ID</th>
                  <th>Submitted at</th>
                  <th>Verification / rejection note</th>
                  <th>Actions</th>
                </tr>
              </thead>

              <tbody>
                {filteredPending.map((payment, index) => {
                  const transactionId = payment.upiTransactionId;
                  const note = (
                    rejectionReasons[transactionId] || ""
                  ).trim();

                  return (
                    <tr key={transactionId || `${payment.email}-${index}`}>
                      <td>{index + 1}</td>
                      <td>{payment.studentName || "—"}</td>
                      <td>{payment.email || "—"}</td>
                      <td>{payment.rollNumber || "—"}</td>
                      <td>{payment.course || "—"}</td>
                      <td>{payment.academicSession || "—"}</td>
                      <td>{payment.paymentType || "—"}</td>
                      <td>{formatAmount(payment.amount)}</td>
                      <td>{transactionId || "—"}</td>
                      <td>
                        {formatDate(
                          payment.submittedAt || payment.createdAt
                        )}
                      </td>

                      <td>
                        <input
                          type="text"
                          value={rejectionReasons[transactionId] || ""}
                          onChange={(event) => {
                            const value = event.target.value;

                            setRejectionReasons((previous) => ({
                              ...previous,
                              [transactionId]: value,
                            }));
                          }}
                          placeholder="Enter required note"
                          maxLength={500}
                          aria-label={`Note for ${
                            payment.studentName || payment.email
                          }`}
                        />
                      </td>

                      <td>
                        <div className="fees-management__table-actions">
                          <button
                            type="button"
                            disabled={saving || !note || !transactionId}
                            onClick={() =>
                              reviewPayment(payment, true)
                            }
                          >
                            Verify
                          </button>

                          <button
                            type="button"
                            className="is-danger"
                            disabled={saving || !note || !transactionId}
                            onClick={() =>
                              reviewPayment(payment, false)
                            }
                          >
                            Reject
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </CollapsibleSection>

      {/* 6. Record cash payment */}
      <CollapsibleSection
        title="Record cash payment"
        description="Cash receipts are posted as verified payments immediately."
      >
        <form
          className="fees-management__cash-form"
          onSubmit={recordCashPayment}
        >
          <label>
            Student email
            <input
              type="email"
              value={cashForm.email}
              onChange={(event) =>
                setCashForm({
                  ...cashForm,
                  email: event.target.value,
                })
              }
              required
            />
          </label>

          <label>
            Roll number
            <input
              value={cashForm.rollNumber}
              onChange={(event) =>
                setCashForm({
                  ...cashForm,
                  rollNumber: event.target.value,
                })
              }
              required
            />
          </label>

          <label>
            Amount
            <input
              type="number"
              min="0.01"
              step="0.01"
              value={cashForm.amount}
              onChange={(event) =>
                setCashForm({
                  ...cashForm,
                  amount: event.target.value,
                })
              }
              required
            />
          </label>

          <button type="submit" disabled={saving}>
            {saving ? "Recording…" : "Record cash receipt"}
          </button>
        </form>
      </CollapsibleSection>

      {/* 7. Fees Admin activity */}
      <CollapsibleSection
        title={`Fees Admin activity (${activityLogs.length})`}
        description="Audit history of payment and payment-method actions across this domain."
      >
        {loading ? (
          <p className="fees-management__empty">
            Loading activity…
          </p>
        ) : activityLogs.length === 0 ? (
          <p className="fees-management__empty">
            No Fees Admin activity recorded yet.
          </p>
        ) : (
          <div className="fees-management__activity-list">
            {activityLogs.map((entry, index) => (
              <article key={entry.id ?? index}>
                <div>
                  <strong>
                    {String(entry.action || "Activity").replaceAll(
                      "_",
                      " "
                    )}
                  </strong>

                  <p>
                    {entry.details ||
                      entry.targetType ||
                      "Fees account activity"}
                  </p>
                </div>

                <div className="fees-management__activity-meta">
                  <span>{entry.actorEmail || "—"}</span>

                  <time dateTime={entry.createdAt || undefined}>
                    {formatDate(entry.createdAt)}
                  </time>
                </div>
              </article>
            ))}
          </div>
        )}
      </CollapsibleSection>

      {/* Custom confirmation modal */}
      {confirmReview && (
        <div className="confirm-overlay">
          <div
            className="confirm-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="confirm-title"
          >
            <h3 id="confirm-title">
              {confirmReview.approve
                ? "Confirm Payment Verification"
                : "Confirm Payment Rejection"}
            </h3>

            <p>
              Are you sure you want to{" "}
              {confirmReview.approve ? "verify" : "reject"} this payment?
            </p>

            <div className="confirm-details">
              <p>
                <strong>Student:</strong>{" "}
                {confirmReview.payment.studentName ||
                  confirmReview.payment.email ||
                  "—"}
              </p>

              <p>
                <strong>Roll number:</strong>{" "}
                {confirmReview.payment.rollNumber || "—"}
              </p>

              <p>
                <strong>Amount:</strong>{" "}
                {formatAmount(confirmReview.payment.amount)}
              </p>

              <p>
                <strong>Transaction ID:</strong>{" "}
                {confirmReview.payment.upiTransactionId}
              </p>

              <p>
                <strong>Note:</strong> {confirmReview.note}
              </p>
            </div>

            <div className="confirm-actions">
              <button
                type="button"
                className="cancel-btn"
                onClick={() => setConfirmReview(null)}
                disabled={saving}
              >
                Cancel
              </button>

              <button
                type="button"
                className={
                  confirmReview.approve
                    ? "confirm-verify-btn"
                    : "confirm-reject-btn"
                }
                onClick={confirmReviewPayment}
                disabled={saving}
              >
                {saving
                  ? "Processing..."
                  : confirmReview.approve
                    ? "Confirm Verification"
                    : "Confirm Rejection"}
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}

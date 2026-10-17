
import { useCallback, useEffect, useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import "./Fees.css";

const API_BASE = (import.meta.env.VITE_API_BASE_URL || "").replace(/\/+$/, "");

const ENDPOINTS = {
  account: "my/payment-account",
  methods: "payment-methods",
  history: "my/payment-history",
  submit: "add-payment",
};

function getToken() {
  return localStorage.getItem("token");
}

function authHeaders() {
  const token = getToken();

  return {
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    Accept: "application/json",
    "Content-Type": "application/json",
  };
}

async function readResponse(response) {
  const raw = await response.text();
  let result = {};

  if (raw) {
    try {
      result = JSON.parse(raw);
    } catch {
      result = { message: raw };
    }
  }

  if (!response.ok || result?.success === false) {
    if (response.status === 401) {
      throw new Error("Session expired. Please sign in again.");
    }

    if (response.status === 403) {
      throw new Error(
        "Access denied. Check your JWT, STUDENT role, and domain."
      );
    }

    const validationMessages = Object.values(result?.errors || {})
      .flat()
      .filter(Boolean);

    throw new Error(
      result?.message ||
        result?.detail ||
        validationMessages.join(" ") ||
        result?.title ||
        `Request failed with status ${response.status}.`
    );
  }

  return result;
}

function unwrapData(payload) {
  let value = payload;

  for (let i = 0; i < 4; i += 1) {
    if (
      value &&
      typeof value === "object" &&
      !Array.isArray(value) &&
      Object.prototype.hasOwnProperty.call(value, "data")
    ) {
      value = value.data;
    } else {
      break;
    }
  }

  return value;
}

async function getJson(url) {
  const response = await fetch(url, {
    method: "GET",
    headers: authHeaders(),
  });

  return unwrapData(await readResponse(response));
}

function normalizeType(value) {
  return String(value || "").trim().toUpperCase();
}

function formatMoney(value) {
  if (value === null || value === undefined || value === "") {
    return "—";
  }

  const amount = Number(value);

  if (!Number.isFinite(amount)) return "—";

  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 2,
  }).format(amount);
}

function formatDate(value) {
  if (!value) return "—";

  const normalized =
    typeof value === "string" ? value.replace(" ", "T") : value;

  const date = new Date(normalized);

  if (Number.isNaN(date.getTime())) return String(value);

  return new Intl.DateTimeFormat("en-IN", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date);
}

function statusClass(status) {
  const normalized = String(status || "PENDING")
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9-]/g, "");

  return `student-fees__status--${normalized || "pending"}`;
}

function getQrUrl(path) {
  if (!path) return "";

  const value = String(path).trim();

  if (/^https?:\/\//i.test(value) || value.startsWith("data:image/")) {
    return value;
  }

  if (!API_BASE) return value;

  return `${API_BASE}/${value.replace(/^\/+/, "")}`;
}

async function copyText(value) {
  if (!value) throw new Error("Nothing to copy.");

  if (!navigator.clipboard?.writeText) {
    throw new Error("Clipboard access is unavailable in this browser.");
  }

  await navigator.clipboard.writeText(String(value));
}

function paymentMethodLabel(type) {
  const normalized = normalizeType(type);

  if (normalized === "ONLINE") return "UPI / Online";
  if (normalized === "BANK") return "Bank transfer";

  return normalized || "Payment";
}

export default function Fees() {
  const { domain } = useParams();

  const [account, setAccount] = useState(null);
  const [payments, setPayments] = useState([]);
  const [paymentMethods, setPaymentMethods] = useState([]);

  const [paymentType, setPaymentType] = useState("");
  const [amount, setAmount] = useState("");
  const [transactionId, setTransactionId] = useState("");

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [loadIssues, setLoadIssues] = useState({});
  const [copyMessage, setCopyMessage] = useState("");

  const baseUrl = useMemo(() => {
    if (!API_BASE || !domain) return "";

    return `${API_BASE}/${encodeURIComponent(domain)}/fees-student`;
  }, [domain]);

  const activeMethods = useMemo(
    () => paymentMethods.filter((method) => method?.active === true),
    [paymentMethods]
  );

  const availableTypes = useMemo(
    () => [
      ...new Set(
        activeMethods
          .map((method) => normalizeType(method.paymentType))
          .filter(Boolean)
      ),
    ],
    [activeMethods]
  );

  const displayedMethods = useMemo(
    () =>
      activeMethods.filter(
        (method) =>
          normalizeType(method.paymentType) === normalizeType(paymentType)
      ),
    [activeMethods, paymentType]
  );

  const loadFees = useCallback(
    async ({ silent = false } = {}) => {
      if (!API_BASE || !domain || !baseUrl) {
        setError(
          "API URL or domain is missing. Check VITE_API_BASE_URL and your route."
        );
        setLoading(false);
        return;
      }

      if (!getToken()) {
        setError("You are not signed in. Please sign in and try again.");
        setLoading(false);
        return;
      }

      if (!silent) setLoading(true);

      setError("");
      setLoadIssues({});

      const endpoints = [
        ["account", `${baseUrl}/${ENDPOINTS.account}`],
        ["history", `${baseUrl}/${ENDPOINTS.history}`],
        ["methods", `${baseUrl}/${ENDPOINTS.methods}`],
      ];

      try {
        const results = await Promise.allSettled(
          endpoints.map(async ([key, url]) => ({
            key,
            data: await getJson(url),
          }))
        );

        const issues = {};

        results.forEach((result, index) => {
          const key = endpoints[index][0];

          if (result.status === "rejected") {
            issues[key] =
              result.reason?.message || `Unable to load ${key}.`;
            return;
          }

          const payload = result.value.data;

          if (key === "account") {
            if (payload && typeof payload === "object") {
              setAccount(payload);
            } else {
              issues.account = "The server returned an invalid fee account.";
            }
          }

          if (key === "history") {
            if (Array.isArray(payload)) {
              setPayments(payload);
            } else {
              issues.history = "The server returned an invalid payment history.";
            }
          }

          if (key === "methods") {
            if (Array.isArray(payload)) {
              setPaymentMethods(payload);

              const types = [
                ...new Set(
                  payload
                    .filter((method) => method?.active === true)
                    .map((method) => normalizeType(method.paymentType))
                    .filter(Boolean)
                ),
              ];

              setPaymentType((current) => {
                const currentType = normalizeType(current);

                return types.includes(currentType)
                  ? currentType
                  : types[0] || "";
              });
            } else {
              issues.methods =
                "The server returned invalid payment method data.";
            }
          }
        });

        setLoadIssues(issues);

        if (Object.keys(issues).length === endpoints.length) {
          setError(
            "Fee information could not be loaded. Check the API and try again."
          );
        }
      } catch (requestError) {
        setError(
          requestError?.message || "Unable to load your fee information."
        );
      } finally {
        setLoading(false);
      }
    },
    [baseUrl, domain]
  );

  useEffect(() => {
    loadFees();
  }, [loadFees]);

  async function handleCopy(value, label) {
    try {
      await copyText(value);
      setCopyMessage(`${label} copied.`);
    } catch (copyError) {
      setCopyMessage(copyError?.message || "Unable to copy.");
    }
  }

  async function submitPayment(event) {
    event.preventDefault();

    setError("");
    setMessage("");
    setCopyMessage("");

    if (submitting) return;

    if (!getToken()) {
      setError("You are not signed in. Please sign in and try again.");
      return;
    }

    if (!baseUrl) {
      setError("API URL or domain is not configured.");
      return;
    }

    if (!availableTypes.includes(normalizeType(paymentType))) {
      setError("Select an active payment method before submitting.");
      return;
    }

    const parsedAmount = Number(amount);

    if (!Number.isFinite(parsedAmount) || parsedAmount <= 0) {
      setError("Enter an amount greater than zero.");
      return;
    }

    const reference = transactionId.trim();

    if (!reference) {
      setError("Enter your bank or online transaction reference.");
      return;
    }

    if (reference.length > 120) {
      setError("Transaction reference cannot exceed 120 characters.");
      return;
    }

    setSubmitting(true);

    try {
      const response = await fetch(`${baseUrl}/${ENDPOINTS.submit}`, {
        method: "POST",
        headers: authHeaders(),
        body: JSON.stringify({
          amount: parsedAmount,
          upiTransactionId: reference,
          paymentType: normalizeType(paymentType),
        }),
      });

      const result = await readResponse(response);

      setMessage(
        result?.message ||
          "Payment submitted successfully. Awaiting Fees Admin verification."
      );

      setAmount("");
      setTransactionId("");

      await loadFees({ silent: true });
    } catch (requestError) {
      setError(
        requestError?.message || "Unable to submit your payment."
      );
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <main className="student-fees">
      <header className="student-fees__header">
        <div>
          <p className="student-fees__eyebrow">STUDENT PORTAL</p>
          <h1>Fees &amp; Payments</h1>
          <p className="student-fees__subtitle">
            View your fee balance, follow your institution's payment
            instructions, and track payment verification.
          </p>
        </div>

        <button
          className="student-fees__refresh"
          type="button"
          onClick={() => loadFees()}
          disabled={loading || submitting}
        >
          {loading ? "Loading…" : "↻ Refresh"}
        </button>
      </header>

      {error && (
        <div
          className="student-fees__notice student-fees__notice--error"
          role="alert"
        >
          <strong>Something needs attention</strong>
          <span>{error}</span>
        </div>
      )}

      {message && (
        <div
          className="student-fees__notice student-fees__notice--success"
          role="status"
        >
          <strong>Payment submission</strong>
          <span>{message}</span>
        </div>
      )}

      {copyMessage && (
        <div className="student-fees__notice" role="status">
          {copyMessage}
        </div>
      )}

      <section className="student-fees__balances" aria-label="Fee account summary">
        <article className="student-fees__balance">
          <span>Total fees</span>
          <strong>
            {loading && !account ? "Loading…" : formatMoney(account?.totalFees)}
          </strong>
          <small>Your total assessed fees</small>
        </article>

        <article className="student-fees__balance">
          <span>Total paid</span>
          <strong>
            {loading && !account ? "Loading…" : formatMoney(account?.totalPaid)}
          </strong>
          <small>Amount recorded in your account</small>
        </article>

        <article className="student-fees__balance student-fees__balance--due">
          <span>Outstanding</span>
          <strong>
            {loading && !account ? "Loading…" : formatMoney(account?.totalDues)}
          </strong>
          <small>Remaining balance</small>
        </article>
      </section>

      {account?.academicSession && (
        <p className="student-fees__session">
          Academic session: <strong>{account.academicSession}</strong>
        </p>
      )}

      {loadIssues.account && (
        <div className="student-fees__inline-error" role="alert">
          Fee balance unavailable: {loadIssues.account}
        </div>
      )}

      <section className="student-fees__panel">
        <div className="student-fees__section-heading">
          <div>
            <p className="student-fees__eyebrow">PAYMENT</p>
            <h2>Payment instructions</h2>
            <p>Use only active payment details provided by your institution.</p>
          </div>
        </div>

        {loadIssues.methods && (
          <div className="student-fees__inline-error" role="alert">
            Payment methods unavailable: {loadIssues.methods}
          </div>
        )}

        {loading && paymentMethods.length === 0 ? (
          <div className="student-fees__empty">Loading payment methods…</div>
        ) : availableTypes.length === 0 ? (
          <div className="student-fees__empty">
            <strong>No active payment methods</strong>
            <p>
              Please contact your Fees Admin for the correct payment
              instructions.
            </p>
          </div>
        ) : (
          <>
            <div
              className="student-fees__method-tabs"
              role="tablist"
              aria-label="Payment type"
            >
              {availableTypes.map((type) => (
                <button
                  key={type}
                  type="button"
                  role="tab"
                  aria-selected={normalizeType(paymentType) === type}
                  className={
                    normalizeType(paymentType) === type ? "is-active" : ""
                  }
                  onClick={() => setPaymentType(type)}
                >
                  {paymentMethodLabel(type)}
                </button>
              ))}
            </div>

            <div className="student-fees__method-list">
              {displayedMethods.map((method) => {
                const type = normalizeType(method.paymentType);
                const isBank = type === "BANK";

                return (
                  <article className="student-fees__method" key={method.id}>
                    <div className="student-fees__method-title">
                      <div>
                        <h3>{method.displayName || paymentMethodLabel(type)}</h3>
                        <span className="student-fees__active-label">
                          Active method
                        </span>
                      </div>
                    </div>

                    {isBank ? (
                      <dl className="student-fees__details">
                        {[
                          ["Bank name", method.bankName],
                          ["Account name", method.accountName],
                          ["Account number", method.accountNumber],
                          ["IFSC", method.ifsc],
                          ["Branch", method.branch],
                        ].map(([label, value]) => (
                          <div key={label}>
                            <dt>{label}</dt>
                            <dd>
                              <span>{value || "Not provided"}</span>
                              {value && label === "Account number" && (
                                <button
                                  type="button"
                                  className="student-fees__copy"
                                  onClick={() => handleCopy(value, label)}
                                >
                                  Copy
                                </button>
                              )}
                            </dd>
                          </div>
                        ))}
                      </dl>
                    ) : (
                      <div className="student-fees__online-details">
                        <div className="student-fees__upi">
                          <span>UPI ID</span>
                          <strong>{method.upiId || "Not provided"}</strong>

                          {method.upiId && (
                            <button
                              type="button"
                              className="student-fees__copy"
                              onClick={() => handleCopy(method.upiId, "UPI ID")}
                            >
                              Copy UPI ID
                            </button>
                          )}
                        </div>

                        {method.qrImagePath && (
                          <div className="student-fees__qr">
                            <img
                              src={getQrUrl(method.qrImagePath)}
                              alt={`${method.displayName || "Payment"} QR code`}
                              loading="lazy"
                              onError={(event) => {
                                event.currentTarget.style.display = "none";
                              }}
                            />
                            <small>
                              Scan using your supported payment app.
                            </small>
                          </div>
                        )}
                      </div>
                    )}

                    {method.instructions && (
                      <div className="student-fees__instructions">
                        <strong>Instructions</strong>
                        <p>{method.instructions}</p>
                      </div>
                    )}

                    {method.feesAdminEmail && (
                      <p className="student-fees__contact">
                        Payment help:{" "}
                        <a href={`mailto:${method.feesAdminEmail}`}>
                          {method.feesAdminEmail}
                        </a>
                      </p>
                    )}
                  </article>
                );
              })}
            </div>

            <form className="student-fees__payment-form" onSubmit={submitPayment}>
              <div className="student-fees__form-heading">
                <h3>Submit payment for verification</h3>
                <p>
                  After completing your transfer, enter the amount and
                  transaction reference. Your submission remains pending
                  until reviewed by the Fees Admin.
                </p>
              </div>

              <label className="student-fees__field">
                <span>Amount paid (₹)</span>
                <input
                  type="number"
                  name="amount"
                  min="0.01"
                  step="0.01"
                  inputMode="decimal"
                  placeholder="e.g. 5000"
                  value={amount}
                  onChange={(event) => setAmount(event.target.value)}
                  required
                  disabled={submitting}
                />
              </label>

              <label className="student-fees__field">
                <span>Transaction reference / UTR</span>
                <input
                  type="text"
                  name="upiTransactionId"
                  placeholder="Enter your transaction reference"
                  value={transactionId}
                  onChange={(event) => setTransactionId(event.target.value)}
                  maxLength={120}
                  autoComplete="off"
                  required
                  disabled={submitting}
                />
              </label>

              <div className="student-fees__submission-note">
                <span aria-hidden="true">ⓘ</span>
                <p>
                  Submitting records a payment claim. It does not confirm
                  that money was received or automatically update your paid
                  balance.
                </p>
              </div>

              <button
                className="student-fees__submit"
                type="submit"
                disabled={
                  submitting ||
                  loading ||
                  !availableTypes.includes(normalizeType(paymentType))
                }
              >
                {submitting ? "Submitting…" : "Submit for verification"}
              </button>
            </form>
          </>
        )}
      </section>

      <section className="student-fees__panel">
        <div className="student-fees__section-heading">
          <div>
            <p className="student-fees__eyebrow">RECORDS</p>
            <h2>Payment history</h2>
            <p>Review your payment submissions and verification status.</p>
          </div>

          <span className="student-fees__count">
            {payments.length} records
          </span>
        </div>

        {loadIssues.history ? (
          <div className="student-fees__inline-error" role="alert">
            Payment history unavailable: {loadIssues.history}
          </div>
        ) : loading && payments.length === 0 ? (
          <div className="student-fees__empty">Loading payment history…</div>
        ) : payments.length === 0 ? (
          <div className="student-fees__empty">
            <strong>No payment submissions yet</strong>
            <p>Your submitted payments will appear here.</p>
          </div>
        ) : (
          <div className="student-fees__table-wrap">
            <table className="student-fees__table">
              <thead>
                <tr>
                  <th>Transaction reference</th>
                  <th>Session</th>
                  <th>Method</th>
                  <th>Amount</th>
                  <th>Status</th>
                  <th>Submitted</th>
                  <th>Verified</th>
                  <th>Verification details</th>
                </tr>
              </thead>

              <tbody>
                {payments.map((payment, index) => (
                  <tr
                    key={`${payment.upiTransactionId || "payment"}-${
                      payment.submittedAt || index
                    }`}
                  >
                    <td className="student-fees__reference">
                      {payment.upiTransactionId || "—"}
                    </td>
                    <td>{payment.academicSession || "—"}</td>
                    <td>{paymentMethodLabel(payment.paymentType)}</td>
                    <td>{formatMoney(payment.amount)}</td>
                    <td>
                      <span
                        className={`student-fees__status ${statusClass(
                          payment.status
                        )}`}
                      >
                        {payment.status || "PENDING"}
                      </span>
                    </td>
                    <td>{formatDate(payment.submittedAt)}</td>
                    <td>{formatDate(payment.verifiedAt)}</td>
                    <td>
                      {payment.rejectionReason ? (
                        <span className="student-fees__rejection">
                          {payment.rejectionReason}
                        </span>
                      ) : payment.verifyByFeesAdmin ? (
                        <span>
                          Reviewed by {payment.verifyByFeesAdmin}
                        </span>
                      ) : (
                        "Awaiting review"
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </main>
  );
}

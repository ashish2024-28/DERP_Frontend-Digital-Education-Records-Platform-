import { useCallback, useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import "./Fees.css";

const apiBase = import.meta.env.VITE_API_BASE_URL?.replace(/\/+$/, "");

function authHeaders() {
  return {
    Authorization: `******"token")}`,
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
    const validationMessages = Object.values(result.errors || {}).flat().filter(Boolean);
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

export default function Fees() {
  const { domain } = useParams();
  const [account, setAccount] = useState(null);
  const [payments, setPayments] = useState([]);
  const [paymentMethods, setPaymentMethods] = useState([]);
  const [paymentType, setPaymentType] = useState("ONLINE");
  const [amount, setAmount] = useState("");
  const [transactionId, setTransactionId] = useState("");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [loadIssues, setLoadIssues] = useState({});
  const [message, setMessage] = useState("");

  const loadFees = useCallback(async () => {
    setLoading(true);
    setError("");
    setLoadIssues({});
    try {
      if (!apiBase || !domain) {
        throw new Error("Fee service URL or domain is not configured.");
      }

      const base = `${apiBase}/${domain}/fees-student`;
      const endpoints = [
        ["account", `${base}/my/payment-account`],
        ["history", `${base}/my/payment-history`],
        ["methods", `${base}/payment-methods`],
      ];
      const results = await Promise.allSettled(
        endpoints.map(async ([key, url]) => {
          const response = await fetch(url, { headers: authHeaders() });
          return [key, await readResponse(response)];
        })
      );
      const issues = {};
      let methodsPayload = [];

      results.forEach((result, index) => {
        const [key] = endpoints[index];
        if (result.status === "rejected") {
          issues[key] = result.reason?.message || `Unable to load ${key}.`;
          return;
        }

        const payload = responseData(result.value[1]);
        if (key === "account") setAccount(payload);
        if (key === "history") setPayments(Array.isArray(payload) ? payload : []);
        if (key === "methods") {
          methodsPayload = Array.isArray(payload) ? payload : [];
          setPaymentMethods(methodsPayload);
        }
      });

      setLoadIssues(issues);
      if (Object.keys(issues).length === endpoints.length) {
        setError("Unable to load any fee information. Check your connection and try again.");
      }
      const activeType = (Array.isArray(methodsPayload) ? methodsPayload : [])
        .find((method) => method.active)?.paymentType;
      if (activeType) setPaymentType(activeType);
    } catch (requestError) {
      setError(requestError.message || "Unable to load your fee account.");
    } finally {
      setLoading(false);
    }
  }, [domain]);

  useEffect(() => {
    loadFees();
  }, [loadFees]);

  const activeMethods = paymentMethods.filter((method) => method.active);
  const availableTypes = [...new Set(activeMethods.map((method) => method.paymentType))];
  const displayedMethods = activeMethods.filter((method) => method.paymentType === paymentType);

  async function submitPayment(event) {
    event.preventDefault();
    setError("");
    setMessage("");
    const parsedAmount = Number(amount);
    if (!Number.isFinite(parsedAmount) || parsedAmount <= 0) {
      setError("Enter a valid payment amount greater than zero.");
      return;
    }
    if (!transactionId.trim()) {
      setError("Enter the bank or online transaction reference.");
      return;
    }
    setSubmitting(true);
    try {
      const response = await fetch(`${apiBase}/${domain}/fees-student/add-payment`, {
        method: "POST",
        headers: authHeaders(),
        body: JSON.stringify({
          amount: parsedAmount,
          upiTransactionId: transactionId.trim(),
          paymentType,
        }),
      });
      const result = await readResponse(response);
      setMessage(result?.message || "Payment submitted for verification.");
      setAmount("");
      setTransactionId("");
      await loadFees();
    } catch (requestError) {
      setError(requestError.message || "Unable to submit your payment.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <main className="student-fees">
      <header className="student-fees__header">
        <div>
          <p className="student-fees__eyebrow">STUDENT SERVICES</p>
          <h1>Fees &amp; Payments</h1>
          <p>Review your balance, payment instructions, and verification history.</p>
        </div>
        <button className="student-fees__refresh" onClick={loadFees} disabled={loading}>
          {loading ? "Refreshing…" : "Refresh"}
        </button>
      </header>

      {error && <div className="student-fees__notice student-fees__notice--error" role="alert">{error}</div>}
      {message && <div className="student-fees__notice student-fees__notice--success" role="status">{message}</div>}

      <section className="student-fees__balances" aria-label="Fee account summary">
        {[
          ["Total fees", account?.totalFees],
          ["Paid", account?.totalPaid],
          ["Outstanding", account?.totalDues],
        ].map(([label, value]) => (
          <article className="student-fees__balance" key={label}>
            <span>{label}</span>
            <strong>{loading ? "…" : value == null ? "—" : `₹${Number(value).toLocaleString("en-IN")}`}</strong>
          </article>
        ))}
        {loadIssues.account && (
          <p className="student-fees__notice student-fees__notice--error" role="alert">
            Fee balance: {loadIssues.account}
          </p>
        )}
      </section>

      <section className="student-fees__panel">
        <div className="student-fees__section-heading">
          <div>
            <h2>Submit a payment</h2>
            <p>Pay using the institution's instructions, then submit the transaction reference.</p>
          </div>
        </div>
        {loadIssues.methods && (
          <p className="student-fees__notice student-fees__notice--error" role="alert">
            Payment instructions: {loadIssues.methods}
          </p>
        )}
        {availableTypes.length === 0 ? (
          <p className="student-fees__empty">No active payment instructions are available. Contact your Fees Admin.</p>
        ) : (
          <>
            <div className="student-fees__method-tabs" role="tablist" aria-label="Payment method">
              {availableTypes.map((type) => (
                <button
                  key={type}
                  type="button"
                  role="tab"
                  aria-selected={paymentType === type}
                  className={paymentType === type ? "is-active" : ""}
                  onClick={() => setPaymentType(type)}
                >
                  {type === "ONLINE" ? "UPI / Online" : "Bank transfer"}
                </button>
              ))}
            </div>
            <div className="student-fees__method-list">
              {displayedMethods.map((method) => (
                <article className="student-fees__method" key={method.id}>
                  <h3>{method.displayName}</h3>
                  {method.paymentType === "BANK" ? (
                    <dl>
                      <div><dt>Bank</dt><dd>{method.bankName || "—"}</dd></div>
                      <div><dt>Account name</dt><dd>{method.accountName || "—"}</dd></div>
                      <div><dt>Account number</dt><dd>{method.accountNumber || "—"}</dd></div>
                      <div><dt>IFSC</dt><dd>{method.ifsc || "—"}</dd></div>
                      <div><dt>Branch</dt><dd>{method.branch || "—"}</dd></div>
                    </dl>
                  ) : (
                    <div className="student-fees__online-details">
                      <p>UPI ID: <strong>{method.upiId || "—"}</strong></p>
                      {method.qrImagePath && (
                        <img
                          src={
                            /^https?:\/\//i.test(method.qrImagePath)
                              ? method.qrImagePath
                              : `${apiBase}/${method.qrImagePath.replace(/^\/+/, "")}`
                          }
                          alt={`${method.displayName || "Payment"} QR code`}
                          loading="lazy"
                        />
                      )}
                    </div>
                  )}
                  {method.instructions && <p className="student-fees__instructions">{method.instructions}</p>}
                </article>
              ))}
            </div>
            <form className="student-fees__payment-form" onSubmit={submitPayment}>
              <label>
                Amount paid
                <input type="number" min="0.01" step="0.01" value={amount}
                  onChange={(event) => setAmount(event.target.value)} required />
              </label>
              <label>
                Transaction reference
                <input type="text" value={transactionId}
                  onChange={(event) => setTransactionId(event.target.value)} required maxLength={120} />
              </label>
              <button type="submit" disabled={submitting}>
                {submitting ? "Submitting…" : "Submit for verification"}
              </button>
            </form>
          </>
        )}
      </section>

      <section className="student-fees__panel">
        <div className="student-fees__section-heading">
          <div>
            <h2>Payment history</h2>
            <p>{account?.academicSession ? `Academic session ${account.academicSession}` : "Your submitted and verified payments"}</p>
          </div>
        </div>
        {loadIssues.history ? (
          <p className="student-fees__notice student-fees__notice--error" role="alert">
            Payment history: {loadIssues.history}
          </p>
        ) : loading ? <p className="student-fees__empty">Loading payment history…</p> : payments.length === 0 ? (
          <p className="student-fees__empty">No payments submitted yet.</p>
        ) : (
          <div className="student-fees__table-wrap">
            <table className="student-fees__table">
              <thead><tr><th>Reference</th><th>Session</th><th>Method</th><th>Amount</th><th>Status</th><th>Note</th></tr></thead>
              <tbody>
                {payments.map((payment, index) => (
                  <tr key={`${payment.upiTransactionId || "payment"}-${index}`}>
                    <td>{payment.upiTransactionId || "—"}</td>
                    <td>{payment.academicSession || "—"}</td>
                    <td>{payment.paymentType || "—"}</td>
                    <td>{payment.amount == null ? "—" : `₹${Number(payment.amount).toLocaleString("en-IN")}`}</td>
                    <td><span className={`student-fees__status student-fees__status--${String(payment.status || "pending").toLowerCase()}`}>{payment.status || "Pending"}</span></td>
                    <td>{payment.rejectionReason || payment.verifyByFeesAdmin || "—"}</td>
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

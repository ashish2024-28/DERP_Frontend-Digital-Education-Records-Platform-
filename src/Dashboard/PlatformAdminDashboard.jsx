import { useCallback, useEffect, useMemo, useState } from "react";
import "./PlatformAdminDashboard.css";

const apiBase = import.meta.env.VITE_API_BASE_URL?.replace(/\/+$/, "");

function authHeaders(json = true) {
  return {
    Authorization: `******"token")}`,
    ...(json ? { "Content-Type": "application/json" } : {}),
  };
}

async function readResponse(response) {
  const text = await response.text();
  let data = {};
  if (text) {
    try {
      data = JSON.parse(text);
    } catch {
      data = { message: text };
    }
  }
  if (!response.ok || data.success === false) {
    throw new Error(data.message || "The platform-admin request failed.");
  }
  return data;
}

function formatDate(value) {
  if (!value) return "—";
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? value : date.toLocaleString();
}

export default function PlatformAdminDashboard() {
  const [universities, setUniversities] = useState([]);
  const [domainAdmins, setDomainAdmins] = useState([]);
  const [auditLogs, setAuditLogs] = useState([]);
  const [search, setSearch] = useState("");
  const [lookupId, setLookupId] = useState("");
  const [lookupDomain, setLookupDomain] = useState("");
  const [lookupResult, setLookupResult] = useState(null);
  const [editUniversity, setEditUniversity] = useState(null);
  const [editName, setEditName] = useState("");
  const [deleteUniversity, setDeleteUniversity] = useState(null);
  const [deleteReason, setDeleteReason] = useState("");
  const [deleteConfirmation, setDeleteConfirmation] = useState("");
  const [deleteOtp, setDeleteOtp] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const loadAdminData = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const [universityResponse, adminResponse, auditResponse] = await Promise.all([
        fetch(`${apiBase}/admin/all_universities`, { headers: authHeaders(false) }),
        fetch(`${apiBase}/admin/all_domain_admins`, { headers: authHeaders(false) }),
        fetch(`${apiBase}/admin/audit_logs`, { headers: authHeaders(false) }),
      ]);
      const [universityData, adminData, auditData] = await Promise.all([
        readResponse(universityResponse),
        readResponse(adminResponse),
        readResponse(auditResponse),
      ]);
      setUniversities(Array.isArray(universityData) ? universityData : []);
      setDomainAdmins(Array.isArray(adminData) ? adminData : []);
      setAuditLogs(Array.isArray(auditData) ? auditData : []);
    } catch (requestError) {
      setError(requestError.message || "Unable to load platform-admin data.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadAdminData();
  }, [loadAdminData]);

  const filteredUniversities = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return universities;
    return universities.filter((university) =>
      [
        university.universityName,
        university.institutionName,
        university.domain,
        university.permanentId,
        university.state,
        university.email,
      ].filter(Boolean).some((value) => String(value).toLowerCase().includes(query))
    );
  }, [universities, search]);

  async function lookupUniversity(event, lookupBy) {
    event.preventDefault();
    setError("");
    setMessage("");
    const value = lookupBy === "id" ? lookupId.trim() : lookupDomain.trim();
    if (!value) {
      setError(lookupBy === "id" ? "Enter a university ID." : "Enter a university domain.");
      return;
    }
    try {
      const parameter = lookupBy === "id"
        ? `id=${encodeURIComponent(value)}`
        : `domain=${encodeURIComponent(value)}`;
      const endpoint = lookupBy === "id" ? "universitie_id" : "universitie_domain";
      const response = await fetch(`${apiBase}/admin/${endpoint}?${parameter}`, {
        headers: authHeaders(false),
      });
      setLookupResult(await readResponse(response));
    } catch (requestError) {
      setLookupResult(null);
      setError(requestError.message || "University lookup failed.");
    }
  }

  function openEdit(university) {
    setError("");
    setMessage("");
    setEditUniversity(university);
    setEditName(university.universityName || "");
  }

  async function saveUniversity(event) {
    event.preventDefault();
    if (!editUniversity || !editName.trim()) {
      setError("University name is required.");
      return;
    }
    setSaving(true);
    setError("");
    setMessage("");
    try {
      const query = new URLSearchParams({
        id: editUniversity.id,
        domain: editUniversity.domain,
      });
      const response = await fetch(`${apiBase}/admin/universitie_update/id_domain?${query}`, {
        method: "PUT",
        headers: authHeaders(),
        body: JSON.stringify({ universityName: editName.trim() }),
      });
      await readResponse(response);
      setMessage(`University ${editUniversity.domain} updated.`);
      setEditUniversity(null);
      await loadAdminData();
    } catch (requestError) {
      setError(requestError.message || "University update failed.");
    } finally {
      setSaving(false);
    }
  }

  function openDelete(university) {
    setError("");
    setMessage("");
    setDeleteUniversity(university);
    setDeleteReason("");
    setDeleteConfirmation("");
    setDeleteOtp("");
    setOtpSent(false);
  }

  async function sendDeleteOtp() {
    if (!deleteUniversity) return;
    if (deleteReason.trim().length < 10) {
      setError("Write a deletion reason of at least 10 characters before requesting an OTP.");
      return;
    }
    setSaving(true);
    setError("");
    setMessage("");
    try {
      const response = await fetch(
        `${apiBase}/admin/universities/${deleteUniversity.id}/delete-otp`,
        {
          method: "POST",
          headers: authHeaders(),
          body: JSON.stringify({ domain: deleteUniversity.domain, reason: deleteReason.trim() }),
        }
      );
      const result = await readResponse(response);
      setOtpSent(true);
      setMessage(result.message || "OTP sent to the platform administrator's registered email.");
    } catch (requestError) {
      setError(requestError.message || "Could not send the deletion OTP.");
    } finally {
      setSaving(false);
    }
  }

  async function permanentlyDeleteUniversity() {
    if (!deleteUniversity || !otpSent) return;
    if (deleteConfirmation !== deleteUniversity.domain) {
      setError("Type the university domain exactly as shown to confirm deletion.");
      return;
    }
    if (deleteReason.trim().length < 10 || !/^\d{6}$/.test(deleteOtp)) {
      setError("Enter a deletion reason and the six-digit OTP.");
      return;
    }
    setSaving(true);
    setError("");
    setMessage("");
    try {
      const query = new URLSearchParams({ id: deleteUniversity.id });
      const response = await fetch(`${apiBase}/admin/universitie_delete/id_domain?${query}`, {
        method: "DELETE",
        headers: authHeaders(),
        body: JSON.stringify({
          domain: deleteUniversity.domain,
          confirmation: deleteConfirmation,
          reason: deleteReason.trim(),
          otp: deleteOtp,
        }),
      });
      const result = await readResponse(response);
      setMessage(result.message || "University and associated records deleted.");
      setDeleteUniversity(null);
      await loadAdminData();
    } catch (requestError) {
      setError(requestError.message || "University deletion failed.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <main className="platform-admin">
      <header className="platform-admin__header">
        <div>
          <p className="platform-admin__eyebrow">PLATFORM ADMINISTRATION</p>
          <h1>University Management</h1>
          <p>Review registered institutions and the administrators who manage them.</p>
        </div>
        <button type="button" className="platform-admin__secondary" onClick={loadAdminData} disabled={loading}>
          {loading ? "Refreshing…" : "Refresh"}
        </button>
      </header>
      {error && <div className="platform-admin__notice platform-admin__notice--error" role="alert">{error}</div>}
      {message && <div className="platform-admin__notice platform-admin__notice--success" role="status">{message}</div>}

      <section className="platform-admin__lookup">
        <form onSubmit={(event) => lookupUniversity(event, "id")}>
          <label>Find university by ID<input type="number" min="1" value={lookupId} onChange={(event) => setLookupId(event.target.value)} /></label>
          <button type="submit">Look up ID</button>
        </form>
        <form onSubmit={(event) => lookupUniversity(event, "domain")}>
          <label>Find university by domain<input value={lookupDomain} onChange={(event) => setLookupDomain(event.target.value)} /></label>
          <button type="submit">Look up domain</button>
        </form>
        {lookupResult && (
          <article className="platform-admin__lookup-result">
            <strong>{lookupResult.universityName || lookupResult.institutionName}</strong>
            <span>{lookupResult.domain} · ID {lookupResult.id} · {lookupResult.state || "State unavailable"}</span>
          </article>
        )}
      </section>

      <section className="platform-admin__panel">
        <div className="platform-admin__section-heading">
          <div><h2>Universities</h2><p>{loading ? "Loading institution records…" : `${universities.length} registered institutions`}</p></div>
          <input value={search} onChange={(event) => setSearch(event.target.value)}
            placeholder="Search by name, domain, state, or ID" aria-label="Search universities" />
        </div>
        {loading ? <p className="platform-admin__empty">Loading universities…</p> : filteredUniversities.length === 0 ? (
          <p className="platform-admin__empty">No universities match this search.</p>
        ) : (
          <div className="platform-admin__table-wrap">
            <table className="platform-admin__table">
              <thead><tr><th>Institution</th><th>Domain</th><th>Permanent ID</th><th>Location</th><th>Domain Admin</th><th>Actions</th></tr></thead>
              <tbody>
                {filteredUniversities.map((university) => (
                  <tr key={university.id}>
                    <td><strong>{university.universityName || university.institutionName}</strong><small>{university.institutionType || "—"}</small></td>
                    <td>{university.domain}</td>
                    <td>{university.permanentId || "—"}</td>
                    <td>{[university.state, university.address].filter(Boolean).join(", ") || "—"}</td>
                    <td>{university.domainAdminName || "—"}<small>{university.domainAdminEmail || "—"}</small></td>
                    <td className="platform-admin__actions">
                      <button type="button" onClick={() => setLookupResult(university)}>View</button>
                      <button type="button" onClick={() => openEdit(university)}>Edit name</button>
                      <button type="button" className="is-danger" onClick={() => openDelete(university)}>Delete…</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <section className="platform-admin__panel">
        <div className="platform-admin__section-heading">
          <div><h2>Domain administrators</h2><p>Administrator accounts currently linked to registered institutions.</p></div>
        </div>
        {loading ? <p className="platform-admin__empty">Loading administrators…</p> : domainAdmins.length === 0 ? (
          <p className="platform-admin__empty">No domain administrators found.</p>
        ) : (
          <div className="platform-admin__admin-list">
            {domainAdmins.map((admin) => (
              <article key={admin.email}>
                <div><strong>{admin.name}</strong><span>{admin.email}</span></div>
                <span>{admin.domain}</span>
                <span>{admin.mobileNumber || "—"}</span>
              </article>
            ))}
          </div>
        )}
      </section>

      <section className="platform-admin__panel">
        <div className="platform-admin__section-heading">
          <div><h2>Recent deletion audit</h2><p>Permanent university deletions and their required business reasons.</p></div>
        </div>
        {auditLogs.length === 0 ? <p className="platform-admin__empty">No platform-admin deletion events recorded.</p> : (
          <div className="platform-admin__audit-list">
            {auditLogs.map((audit, index) => (
              <article key={`${audit.universityDomain}-${audit.createdAt}-${index}`}>
                <div><strong>{audit.eventType} · {audit.universityDomain}</strong><span>{audit.adminEmail} · {formatDate(audit.createdAt)}</span></div>
                <p>{audit.reason}</p>
              </article>
            ))}
          </div>
        )}
      </section>

      {editUniversity && (
        <div className="platform-admin__overlay" role="presentation">
          <form className="platform-admin__modal" onSubmit={saveUniversity}>
            <h2>Edit university name</h2>
            <p>Only the university name is editable through the current backend update contract.</p>
            <label>University name<input value={editName} onChange={(event) => setEditName(event.target.value)} required maxLength={180} /></label>
            <div className="platform-admin__modal-actions">
              <button type="button" className="platform-admin__secondary" onClick={() => setEditUniversity(null)}>Cancel</button>
              <button type="submit" disabled={saving}>{saving ? "Saving…" : "Save name"}</button>
            </div>
          </form>
        </div>
      )}

      {deleteUniversity && (
        <div className="platform-admin__overlay" role="presentation">
          <section className="platform-admin__modal platform-admin__modal--danger" role="dialog" aria-modal="true" aria-labelledby="delete-title">
            <h2 id="delete-title">Permanently delete {deleteUniversity.universityName || deleteUniversity.institutionName}?</h2>
            <div className="platform-admin__danger-notice">
              This operation is irreversible and removes all university-owned records, including domain admin, fees-admin, sub-admin, faculty, student, and course-fee data.
            </div>
            <label>Business reason (10–1000 characters)
              <textarea value={deleteReason} onChange={(event) => setDeleteReason(event.target.value)} maxLength={1000} rows={3} disabled={otpSent} />
            </label>
            {!otpSent ? (
              <button type="button" className="platform-admin__danger-button" onClick={sendDeleteOtp} disabled={saving}>
                {saving ? "Sending OTP…" : "Send OTP to platform-admin email"}
              </button>
            ) : (
              <>
                <p className="platform-admin__otp-help">The OTP will be verified by the backend immediately before deletion.</p>
                <label>Six-digit OTP<input inputMode="numeric" autoComplete="one-time-code" maxLength={6}
                  value={deleteOtp.replace(/\D/g, "").slice(0, 6)}
                  onChange={(event) => setDeleteOtp(event.target.value.replace(/\D/g, "").slice(0, 6))} /></label>
                <label>Type this domain exactly: <strong>{deleteUniversity.domain}</strong>
                  <input value={deleteConfirmation} onChange={(event) => setDeleteConfirmation(event.target.value)} /></label>
                <button type="button" className="platform-admin__danger-button" onClick={permanentlyDeleteUniversity}
                  disabled={saving || deleteOtp.length !== 6 || deleteConfirmation !== deleteUniversity.domain || deleteReason.trim().length < 10}>
                  {saving ? "Deleting…" : "Verify OTP and permanently delete"}
                </button>
              </>
            )}
            <button type="button" className="platform-admin__secondary"
              onClick={() => setDeleteUniversity(null)} disabled={saving}>Cancel — keep university</button>
          </section>
        </div>
      )}
    </main>
  );
}

import { useCallback, useEffect, useState } from "react";
import { RefreshCw } from "lucide-react";
import { getAttendanceAuditLogs } from "../../api/domainAdminAttendanceApi";
import "./DomainAdminErpActivity.css";

function formatTimestamp(value) {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return String(value);
  return new Intl.DateTimeFormat(undefined, {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date);
}

export default function DomainAdminErpActivity() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadEvents = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const response = await getAttendanceAuditLogs();
      setEvents(Array.isArray(response?.data) ? response.data : []);
    } catch (requestError) {
      setError(requestError.message || "Unable to load ERP activity.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadEvents();
  }, [loadEvents]);

  return (
    <main className="erp-activity-page">
      <header className="erp-activity-header">
        <div>
          <p className="erp-activity-eyebrow">DOMAIN ADMIN / ERP</p>
          <h1>ERP Activity Logs</h1>
          <p>Review recent attendance administration actions for your domain.</p>
        </div>
        <button type="button" onClick={loadEvents} disabled={loading}>
          <RefreshCw size={16} aria-hidden="true" />
          {loading ? "Refreshing…" : "Refresh"}
        </button>
      </header>

      <section className="erp-activity-panel" aria-labelledby="erp-activity-list-title">
        <div className="erp-activity-panel-heading">
          <div>
            <h2 id="erp-activity-list-title">Recent activity</h2>
            <p>Actions are shown newest first.</p>
          </div>
          {!loading && !error && (
            <span className="erp-activity-count">{events.length} {events.length === 1 ? "event" : "events"}</span>
          )}
        </div>

        {error && (
          <div className="erp-activity-message erp-activity-message--error" role="alert">
            <span>{error}</span>
            <button type="button" onClick={loadEvents}>Try again</button>
          </div>
        )}
        {loading && <p className="erp-activity-message" role="status">Loading ERP activity…</p>}
        {!loading && !error && events.length === 0 && (
          <p className="erp-activity-message">No attendance administration activity has been recorded yet.</p>
        )}
        {!loading && !error && events.length > 0 && (
          <div className="erp-activity-table-wrap">
            <table className="erp-activity-table">
              <thead>
                <tr>
                  <th scope="col">Date and time</th>
                  <th scope="col">Action</th>
                  <th scope="col">Performed by</th>
                  <th scope="col">Record</th>
                  <th scope="col">Details</th>
                </tr>
              </thead>
              <tbody>
                {events.map((event) => (
                  <tr key={event.id}>
                    <td>{formatTimestamp(event.createdAt)}</td>
                    <td><span className="erp-activity-action">{event.action || "—"}</span></td>
                    <td>
                      {event.actorEmail || "—"}
                      {event.role && <small>{event.role}</small>}
                    </td>
                    <td>
                      {event.targetType || "—"}
                      {event.targetId != null && <small>ID {event.targetId}</small>}
                    </td>
                    <td>{event.details || "—"}</td>
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

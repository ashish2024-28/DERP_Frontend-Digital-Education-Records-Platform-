const API_BASE = (import.meta.env.VITE_API_BASE_URL || "").replace(/\/$/, "");

function currentDomain() {
  return window.location.pathname.split("/")[1];
}

function authHeaders(json = false) {
  const headers = {
    Authorization: `Bearer ${localStorage.getItem("token")}`,
  };
  if (json) headers["Content-Type"] = "application/json";
  return headers;
}

async function request(path, { method = "GET", body, domain = currentDomain() } = {}) {
  const response = await fetch(`${API_BASE}/${domain}/erp/attendance${path}`, {
    method,
    headers: authHeaders(body !== undefined),
    ...(body !== undefined ? { body: JSON.stringify(body) } : {}),
  });
  const text = await response.text();
  let payload;
  try {
    payload = text ? JSON.parse(text) : {};
  } catch {
    payload = { message: text };
  }
  if (!response.ok || payload?.success === false) {
    throw new Error(payload?.message || `Request failed (${response.status})`);
  }
  return payload;
}

export function getRetention(domain) {
  return request("/admin/retention", { domain });
}

export function updateRetention(retention, domain) {
  return request("/admin/retention", {
    method: "PUT",
    body: retention,
    domain,
  });
}

export function cleanupAttendanceByDateRange(fromDate, toDate, domain) {
  return request("/admin/cleanup", {
    method: "DELETE",
    body: { fromDate, toDate },
    domain,
  });
}

export function getAdminBatch(batch, domain) {
  const query = new URLSearchParams({ batch });
  return request(`/admin/batch?${query}`, { domain });
}

export function deleteAttendance(attendanceId, domain) {
  return request(`/admin/${encodeURIComponent(attendanceId)}`, {
    method: "DELETE",
    domain,
  });
}

export function getAttendanceOverview(course, batch, domain) {
  const query = new URLSearchParams();
  if (course) query.set("course", course);
  if (batch) query.set("batch", batch);
  return request(`/admin/overview?${query}`, { domain });
}

export function previewAttendanceCleanup(fromDate, toDate, domain) {
  const query = new URLSearchParams({ fromDate, toDate });
  return request(`/admin/cleanup-preview?${query}`, { domain });
}

export function getAdminRecords(fromDate, toDate, page = 0, size = 50, domain) {
  const query = new URLSearchParams({
    fromDate,
    toDate,
    page: String(page),
    size: String(size),
  });
  return request(`/admin/records?${query}`, { domain });
}

export function getAttendanceAuditLogs(domain) {
  return request("/admin/audit-logs", { domain });
}

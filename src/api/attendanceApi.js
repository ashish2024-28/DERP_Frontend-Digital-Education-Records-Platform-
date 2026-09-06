// // src/api/attendanceApi.js
// const API_BASE = (import.meta.env.VITE_API_BASE_URL || "").replace(/\/$/, "");

// function getDomain() {
//   // adjust if you store domain differently (e.g. from useParams elsewhere)
//   return window.location.pathname.split("/")[1];
// }

// function authHeaders(json = true) {
//   const headers = { Authorization: `Bearer ${localStorage.getItem("token")}` };
//   if (json) headers["Content-Type"] = "application/json";
//   return headers;
// }

// async function readJson(response) {
//   const text = await response.text();
//   let data = {};
//   try { data = text ? JSON.parse(text) : {}; } catch { data = { message: text }; }
//   if (!response.ok) throw new Error(data?.message || "Request failed");
//   return data;
// }

// export const attendanceApi = {
//   async getFacultySetup() {
//     const domain = getDomain();
//     const res = await fetch(`${API_BASE}/${domain}/erp/attendance/faculty/setup`, {
//       headers: authHeaders(false),
//     });
//     return readJson(res);
//   },
//   async getFacultyAssignments() {
//     const domain = getDomain();
//     const res = await fetch(`${API_BASE}/${domain}/erp/attendance/faculty/assignments`, {
//       headers: authHeaders(false),
//     });
//     // NOTE: backend returns a raw text/plain string, not JSON — don't call res.json()
//     const text = await res.text();
//     if (!res.ok) throw new Error(text || "Unable to load assignments");
//     return text; // pass raw "1A:JAVA,C,DSA;2A:AI,ML" to parseTeachingAssignments
//   },

//   async getFacultyStudents(batch, subject) {
//     const domain = getDomain();
//     const query = new URLSearchParams({ batch, subject });
//     const res = await fetch(
//       `${API_BASE}/${domain}/erp/attendance/faculty/students?${query}`,
//       { headers: authHeaders(false) }
//     );
//     return readJson(res);
//   },

//   async markAttendance(payload) {
//     const domain = getDomain();
//     const res = await fetch(`${API_BASE}/${domain}/erp/attendance/faculty/mark`, {
//       method: "POST",
//       headers: authHeaders(),
//       body: JSON.stringify(payload),
//     });
//     return readJson(res);
//   },
// };
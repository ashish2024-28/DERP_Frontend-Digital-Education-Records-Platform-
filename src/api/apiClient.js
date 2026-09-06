// const API_BASE = import.meta.env.VITE_API_BASE_URL;

// export async function apiRequest(
//     endpoint,
//     options = {}
// ) {
//     const token = localStorage.getItem("token");

//     const headers = {
//         ...(options.body instanceof FormData
//             ? {}
//             : {
//                 "Content-Type": "application/json",
//             }),
//         ...(token
//             ? {
//                 Authorization: `Bearer ${token}`,
//             }
//             : {}),
//         ...(options.headers || {}),
//     };

//     const response = await fetch(
//         `${API_BASE}${endpoint}`,
//         {
//             ...options,
//             headers,
//         }
//     );

//     if (response.status === 401) {
//         localStorage.clear();
//         window.location.href = "/";
//         throw new Error("Session expired");
//     }

//     if (!response.ok) {
//         const text = await response.text();

//         throw new Error(
//             text || `Request failed: ${response.status}`
//         );
//     }

//     const contentType =
//         response.headers.get("content-type") || "";

//     if (contentType.includes("application/json")) {
//         return response.json();
//     }

//     return response.text();
// }
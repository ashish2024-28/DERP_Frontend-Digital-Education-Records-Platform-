// import { useEffect, useState } from "react";
// import { useLocation, useParams } from "react-router-dom";
// import { Eye, EyeOff } from "lucide-react";
// import FormatDate from "../../../Components/DateTimeFunction/FormatDate";


// export default function AllSubAdmin() {

//     const API_BASE = import.meta.env.VITE_API_BASE_URL;

//     const { domain } = useParams();
//     const role = localStorage.getItem("role");
//     // const location = useLocation();
//     const [subAdmin, SetSubAdmin] = useState([]);
//   const [showPassword, setShowPassword] = useState(false);


//     const [searchQuery, setSearchQuery] = useState("");

//     // ================= FETCH DATA =================
//     useEffect(() => {
//         fetchAllData();
//     }, [domain]);

//     const fetchAllData = async () => {
//         try {
//             const headers = {
//                 "Authorization": `Bearer ${localStorage.getItem("token")}`,
//                 "Content-Type": "application/json"
//             }

//             //   All Faculty
//             const subAdminRes = await fetch(`${API_BASE}/${domain}/${role}/allSubAdmin`, { headers });
//             const subAdminData = await subAdminRes.json();
//             SetSubAdmin(subAdminData?.data || subAdminData || []);


//         } catch (error) {
//             console.error("Error:", error);
//             alert(`Session expired. ${localStorage.getItem("role")} Please login again.`);
//             localStorage.clear();
//             navigate(`/${domain}/login`);
//         }
//     };


//     const filteredData = (subAdmin || []).filter(item =>
//         item.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
//         item.subAdminId?.toLowerCase().includes(searchQuery.toLowerCase()) ||
//         item.course?.toLowerCase().includes(searchQuery.toLowerCase()) ||
//         item.email?.toLowerCase().includes(searchQuery.toLowerCase())
//     );


//     return (
//         <div>

//             <h1 className="text-2xl font-bold mb-4">All SubAdmin</h1>

//             <div className=" shadow rounded-xl p-6">

//                 <input
//                     type="text"
//                     placeholder="Search..."
//                     onChange={(e) => setSearchQuery(e.target.value)}
//                     className="border p-2 mb-4 w-full"
//                 />

//                 <table className="table-wrapper w-full">

//                     <thead>
//                         <tr>
//                             <th>S.No</th>
//                             <th>SubAdmin ID</th>
//                             <th>Name</th>
//                             <th>Course</th>
//                             <th>Email</th>
//                             <th>Mobile Number</th>
//                             {/* {role === "DOMAIN_ADMIN" && (<>
//                                 <th>Created At</th>
//                                 <th>Last Login</th>
//                                 <th>
//                                     Password
//                                     <span style={{ marginLeft: "8px", cursor: "pointer" }}
//                                         onClick={() => setShowPassword(!showPassword)}>
//                                         {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
//                                     </span>
//                                 </th></>

//                             )} */}
//                         </tr>
//                     </thead>

//                     <tbody>
//                         {filteredData.map((item, index) => (
//                             <tr key={index}>
//                                 <td>{index+1}.</td>
//                                 <td>{item.subAdminId}</td>
//                                 <td>{item.name}</td>
//                                 <td>{item.course}</td>
//                                 <td>{item.email}</td>
//                                 <td>{item.mobileNumber}</td>
//                                 {/* {role === "DOMAIN_ADMIN" && (<>
//                                     <td>{FormatDate(item.createdDateTime)}</td>
//                                     <td>{FormatDate(item.lastLoginDateTime)}</td>
//                                     <td>
//                                         {showPassword
//                                             ? item.password
//                                             : "••••••••"}
//                                     </td></>
//                                 )} */}
//                             </tr>
//                         ))}

//                     </tbody>

//                 </table>

//             </div>

//         </div>
//     );
// }





import { useEffect, useState, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Eye, EyeOff, ChevronDown, Shield } from "lucide-react";
import FormatDate from "../../../Components/DateTimeFunction/FormatDate";

export default function AllSubAdmin() {
  const API_BASE = import.meta.env.VITE_API_BASE_URL;
  const { domain } = useParams();
  const navigate = useNavigate();
  const role = localStorage.getItem("role");

  const [subAdmins, setSubAdmins] = useState([]);
  const [showPassword, setShowPassword] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [openCourses, setOpenCourses] = useState({});

  // ── Fetch ──────────────────────────────────────────────────────────────────
  useEffect(() => { fetchAllData(); }, [domain]);

  const fetchAllData = async () => {
    try {
      const headers = {
        Authorization: `Bearer ${localStorage.getItem("token")}`,
        "Content-Type": "application/json",
      };
      const res = await fetch(`${API_BASE}/${domain}/${role}/allSubAdmin`, { headers });
      const data = await res.json();
      const list = data?.data || data || [];
      setSubAdmins(list);

      const courseMap = {};
      list.forEach((s) => { courseMap[s.course || "Unknown Department"] = true; });
      setOpenCourses(courseMap);
    } catch (err) {
      console.error("Error:", err);
      alert(`Session expired. Please login again.`);
      localStorage.clear();
      navigate(`/${domain}/login`);
    }
  };

  // ── Filter + Group ─────────────────────────────────────────────────────────
  const filtered = useMemo(() => {
    const q = searchQuery.toLowerCase();
    return (subAdmins || []).filter(
      (s) =>
        !q ||
        s.name?.toLowerCase().includes(q) ||
        s.subAdminId?.toLowerCase().includes(q) ||
        s.course?.toLowerCase().includes(q) ||
        s.email?.toLowerCase().includes(q)
    );
  }, [subAdmins, searchQuery]);

  const grouped = useMemo(() => {
    const map = {};
    filtered.forEach((s) => {
      const course = s.course || "Unknown Department";
      if (!map[course]) map[course] = [];
      map[course].push(s);
    });
    return { map, courses: Object.keys(map).sort() };
  }, [filtered]);

  const toggleCourse = (course) =>
    setOpenCourses((p) => ({ ...p, [course]: !p[course] }));

  const courseColors = [
    { bg: "bg-orange-50 border-orange-200", header: "bg-orange-100", accent: "text-orange-700", badge: "bg-orange-600" },
    { bg: "bg-rose-50 border-rose-200", header: "bg-rose-100", accent: "text-rose-700", badge: "bg-rose-600" },
    { bg: "bg-purple-50 border-purple-200", header: "bg-purple-100", accent: "text-purple-700", badge: "bg-purple-600" },
    { bg: "bg-teal-50 border-teal-200", header: "bg-teal-100", accent: "text-teal-700", badge: "bg-teal-600" },
    { bg: "bg-sky-50 border-sky-200", header: "bg-sky-100", accent: "text-sky-700", badge: "bg-sky-600" },
  ];

  return (
    <div>
      {/* ── Page Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-orange-600 flex items-center justify-center">
            <Shield size={20} className="text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-800 dark:text-gray-100">All Sub Admins</h1>
            <p className="text-xs text-gray-400">{filtered.length} sub-admins • {grouped.courses.length} departments</p>
          </div>
        </div>
        <input
          type="text"
          placeholder="Search by name, ID, department…"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="border border-gray-300 rounded-lg px-4 py-2 text-sm w-full sm:w-72 focus:outline-none focus:ring-2 focus:ring-orange-400 dark:bg-gray-800 dark:border-gray-600 dark:text-gray-100"
        />
      </div>

      {filtered.length === 0 && (
        <div className="text-center py-16 text-gray-400 text-sm">No sub-admins found.</div>
      )}

      {/* ── Department Panels ── */}
      <div className="space-y-4">
        {grouped.courses.map((course, ci) => {
          const color = courseColors[ci % courseColors.length];
          const members = grouped.map[course];
          const isOpen = openCourses[course] !== false;

          return (
            <div key={course} className={`border-2 rounded-2xl overflow-hidden ${color.bg}`}>
              {/* Header */}
              <button
                onClick={() => toggleCourse(course)}
                className={`w-full flex items-center justify-between px-5 py-4 ${color.header} transition-colors`}
              >
                <div className="flex items-center gap-3">
                  <ChevronDown
                    size={18}
                    className={`${color.accent} transition-transform duration-200 ${isOpen ? "" : "-rotate-90"}`}
                  />
                  <span className={`font-bold text-base ${color.accent}`}>🛡️ {course}</span>
                  <span className={`text-xs text-white px-2.5 py-0.5 rounded-full font-semibold ${color.badge}`}>
                    {members.length} sub-admin{members.length !== 1 ? "s" : ""}
                  </span>
                </div>
              </button>

              {/* Table */}
              {isOpen && (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="bg-white dark:bg-gray-900 text-gray-500 dark:text-gray-400 text-xs uppercase tracking-wide border-b border-gray-100">
                        <th className="px-4 py-2 text-left">#</th>
                        <th className="px-4 py-2 text-left">Sub Admin ID</th>
                        <th className="px-4 py-2 text-left">Name</th>
                        <th className="px-4 py-2 text-left">Course</th>
                        <th className="px-4 py-2 text-left">Email</th>
                        <th className="px-4 py-2 text-left">Mobile</th>
                        {/* {role === "DOMAIN_ADMIN" && (
                          <>
                            <th className="px-4 py-2 text-left">Created At</th>
                            <th className="px-4 py-2 text-left">Last Login</th>
                            <th className="px-4 py-2 text-left">
                              Password
                              <button
                                className="ml-1 inline-flex"
                                onClick={(e) => { e.stopPropagation(); setShowPassword((v) => !v); }}
                              >
                                {showPassword ? <EyeOff size={13} /> : <Eye size={13} />}
                              </button>
                            </th>
                          </>
                        )} */}
                      </tr>
                    </thead>
                    <tbody>
                      {members.map((s, idx) => (
                        <tr
                          key={s.subAdminId || idx}
                          className="border-t border-gray-100 dark:border-gray-700 hover:bg-white dark:hover:bg-gray-800 bg-white dark:bg-gray-900 transition-colors"
                        >
                          <td className="px-4 py-2 text-gray-400">{idx + 1}.</td>
                          <td className="px-4 py-2 font-mono font-medium text-gray-700 dark:text-gray-200">{s.subAdminId}</td>
                          <td className="px-4 py-2 font-medium text-gray-800 dark:text-gray-100">{s.name}</td>
                          <td className="px-4 py-2 text-gray-500">{s.course}</td>
                          <td className="px-4 py-2 text-gray-500">{s.email}</td>
                          <td className="px-4 py-2 text-gray-500">{s.mobileNumber}</td>
                          {/* {role === "DOMAIN_ADMIN" && (
                            <>
                              <td className="px-4 py-2 text-gray-400 text-xs">{FormatDate(s.createdDateTime)}</td>
                              <td className="px-4 py-2 text-gray-400 text-xs">{FormatDate(s.lastLoginDateTime)}</td>
                              <td className="px-4 py-2 font-mono text-xs text-gray-500">
                                {showPassword ? s.password : "••••••••"}
                              </td>
                            </>
                          )} */}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
// import { useEffect, useState } from "react";
// import { useLocation, useParams } from "react-router-dom";
// import { Eye, EyeOff } from "lucide-react";
// import FormatDate from "../../../Components/DateTimeFunction/FormatDate";


// export default function AllFaculty() {

//     const API_BASE = import.meta.env.VITE_API_BASE_URL;

//     const { domain } = useParams();
//     const role = localStorage.getItem("role");
//     // const location = useLocation();
//     const [faculty, setFaculty] = useState([]);
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
//             const facultlyRes = await fetch(`${API_BASE}/${domain}/${role}/allFaculty`, { headers });
//             const faacultyData = await facultlyRes.json();
//             setFaculty(faacultyData?.data || faacultyData || []);


//         } catch (error) {
//             console.error("Error:", error);
//             alert(`Session expired. ${localStorage.getItem("role")} Please login again.`);
//             localStorage.clear();
//             navigate(`/${domain}/login`);
//         }
//     };


//     const filteredData = (faculty || []).filter(item =>
//         item.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
//         item.facultyId?.toLowerCase().includes(searchQuery.toLowerCase()) ||
//         item.course?.toLowerCase().includes(searchQuery.toLowerCase()) ||
//         item.teachingBatch?.toLowerCase().includes(searchQuery.toLowerCase()) ||
//         item.email?.toLowerCase().includes(searchQuery.toLowerCase())
//     );


//     return (
//         <div>

//             <h1 className="text-2xl font-bold mb-4">All Facutly</h1>

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
//                             <th>Faculty ID</th>
//                             <th>Name</th>
//                             <th>Course</th>
//                             <th>Teaching Batch</th>
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
//                                 <td>{item.facultyId}</td>
//                                 <td>{item.name}</td>
//                                 <td>{item.course}</td>
//                                 <td>{item.teachingBatch}</td>
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
import { Eye, EyeOff, ChevronDown, ChevronRight, BookOpen } from "lucide-react";
import FormatDate from "../../../Components/DateTimeFunction/FormatDate";

export default function AllFaculty() {
  const API_BASE = import.meta.env.VITE_API_BASE_URL;
  const { domain } = useParams();
  const navigate = useNavigate();
  const role = localStorage.getItem("role");

  const [faculty, setFaculty] = useState([]);
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
      const res = await fetch(`${API_BASE}/${domain}/${role}/allFaculty`, { headers });
      const data = await res.json();
      const list = data?.data || data || [];
      setFaculty(list);

      // Default all courses to open
      const courseMap = {};
      list.forEach((f) => { courseMap[f.course || "Unknown Course"] = true; });
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
    return (faculty || []).filter(
      (f) =>
        !q ||
        f.name?.toLowerCase().includes(q) ||
        f.facultyId?.toLowerCase().includes(q) ||
        f.course?.toLowerCase().includes(q) ||
        f.teachingBatch?.toLowerCase().includes(q) ||
        f.email?.toLowerCase().includes(q)
    );
  }, [faculty, searchQuery]);

  // Group by course
  const grouped = useMemo(() => {
    const map = {};
    filtered.forEach((f) => {
      const course = f.course || "Unknown Course";
      if (!map[course]) map[course] = [];
      map[course].push(f);
    });
    return { map, courses: Object.keys(map).sort() };
  }, [filtered]);

  const toggleCourse = (course) =>
    setOpenCourses((p) => ({ ...p, [course]: !p[course] }));

  const courseColors = [
    { bg: "bg-green-50 border-green-200", header: "bg-green-100", accent: "text-green-700", badge: "bg-green-600" },
    { bg: "bg-cyan-50 border-cyan-200", header: "bg-cyan-100", accent: "text-cyan-700", badge: "bg-cyan-600" },
    { bg: "bg-indigo-50 border-indigo-200", header: "bg-indigo-100", accent: "text-indigo-700", badge: "bg-indigo-600" },
    { bg: "bg-orange-50 border-orange-200", header: "bg-orange-100", accent: "text-orange-700", badge: "bg-orange-600" },
    { bg: "bg-pink-50 border-pink-200", header: "bg-pink-100", accent: "text-pink-700", badge: "bg-pink-600" },
  ];

  return (
    <div>
      {/* ── Page Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-green-600 flex items-center justify-center">
            <BookOpen size={20} className="text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-800 dark:text-gray-100">All Faculty</h1>
            <p className="text-xs text-gray-400">{filtered.length} faculty members • {grouped.courses.length} courses</p>
          </div>
        </div>
        <input
          type="text"
          placeholder="Search by name, ID, course, batch…"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="border border-gray-300 rounded-lg px-4 py-2 text-sm w-full sm:w-72 focus:outline-none focus:ring-2 focus:ring-green-400 dark:bg-gray-800 dark:border-gray-600 dark:text-gray-100"
        />
      </div>

      {filtered.length === 0 && (
        <div className="text-center py-16 text-gray-400 text-sm">No faculty found.</div>
      )}

      {/* ── Course Panels ── */}
      <div className="space-y-4">
        {grouped.courses.map((course, ci) => {
          const color = courseColors[ci % courseColors.length];
          const members = grouped.map[course];
          const isOpen = openCourses[course] !== false;

          return (
            <div key={course} className={`border-2 rounded-2xl overflow-hidden ${color.bg}`}>
              {/* Course Header */}
              <button
                onClick={() => toggleCourse(course)}
                className={`w-full flex items-center justify-between px-5 py-4 ${color.header} transition-colors`}
              >
                <div className="flex items-center gap-3">
                  <ChevronDown
                    size={18}
                    className={`${color.accent} transition-transform duration-200 ${isOpen ? "" : "-rotate-90"}`}
                  />
                  <span className={`font-bold text-base ${color.accent}`}>📚 {course}</span>
                  <span className={`text-xs text-white px-2.5 py-0.5 rounded-full font-semibold ${color.badge}`}>
                    {members.length} faculty
                  </span>
                </div>
              </button>

              {/* Faculty Table */}
              {isOpen && (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="bg-white dark:bg-gray-900 text-gray-500 dark:text-gray-400 text-xs uppercase tracking-wide border-b border-gray-100">
                        <th className="px-4 py-2 text-left">S.No</th>
                        <th className="px-4 py-2 text-left">Faculty ID</th>
                        <th className="px-4 py-2 text-left">Name</th>
                        <th className="px-4 py-2 text-left">Course</th>
                        <th className="px-4 py-2 text-left">Teaching Batch</th>
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
                      {members.map((f, idx) => (
                        <tr
                          key={f.facultyId || idx}
                          className="border-t border-gray-100 dark:border-gray-700 hover:bg-white dark:hover:bg-gray-800 bg-white dark:bg-gray-900 transition-colors"
                        >
                          <td className="px-4 py-2 text-gray-400">{idx + 1}.</td>
                          <td className="px-4 py-2 font-mono font-medium text-gray-700 dark:text-gray-200">{f.facultyId}</td>
                          <td className="px-4 py-2 font-medium text-gray-800 dark:text-gray-100">{f.name}</td>
                          <td className="px-4 py-2 text-gray-500">{f.course}</td>
                          <td className="px-4 py-2 text-gray-500">{f.teachingBatch || "—"}</td>
                          <td className="px-4 py-2 text-gray-500">{f.email}</td>
                          <td className="px-4 py-2 text-gray-500">{f.mobileNumber}</td>
                          {/* {role === "DOMAIN_ADMIN" && (
                            <>
                              <td className="px-4 py-2 text-gray-400 text-xs">{FormatDate(f.createdDateTime)}</td>
                              <td className="px-4 py-2 text-gray-400 text-xs">{FormatDate(f.lastLoginDateTime)}</td>
                              <td className="px-4 py-2 font-mono text-xs text-gray-500">
                                {showPassword ? f.password : "••••••••"}
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
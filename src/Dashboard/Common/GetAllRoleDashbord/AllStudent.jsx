// import { useEffect, useState } from "react";
// import { useLocation, useParams } from "react-router-dom";
// import { Eye, EyeOff } from "lucide-react";
// import FormatDate from "../../../Components/DateTimeFunction/FormatDate";


// export default function AllStudents() {

//     const API_BASE = import.meta.env.VITE_API_BASE_URL;

//     const { domain } = useParams();
//     const role = localStorage.getItem("role");
//     // const location = useLocation();
//     const [students, setStudents] = useState([]);
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

//             //   All Students
//             const studentRes = await fetch(`${API_BASE}/${domain}/${role}/allStudent`, { headers });
//             const studentData = await studentRes.json();
//             setStudents(studentData?.data || studentData || []);


//         } catch (error) {
//             console.error("Error:", error);
//             alert(`Session expired. ${localStorage.getItem("role")} Please login again.`);
//             localStorage.clear();
//             navigate(`/${domain}/login`);
//         }
//     };


//     const filteredData = (students || []).filter(item =>
//         item.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
//         item.rollNumber?.toLowerCase().includes(searchQuery.toLowerCase()) ||
//         item.course?.toLowerCase().includes(searchQuery.toLowerCase()) ||
//         item.branch?.toLowerCase().includes(searchQuery.toLowerCase()) ||
//         item.batch?.toLowerCase().includes(searchQuery.toLowerCase()) ||
//         item.email?.toLowerCase().includes(searchQuery.toLowerCase())
//     );


//     return (
//         <div>

//             <h1 className="text-2xl font-bold mb-4">Students</h1>

//             <div className="shadow rounded-xl p-6">

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
//                             <th>Roll No</th>
//                             <th>Name</th>
//                             <th>Course</th>
//                             <th>Branch</th>
//                             <th>Batch</th>
//                             <th>Email</th>
//                             <th>Mobile Number</th>
//                             <th>Father Name</th>
//                             <th>Father Number</th>
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
//                                 <td>{item.rollNumber}</td>
//                                 <td>{item.name}</td>
//                                 <td>{item.email}</td>
//                                 <td>{item.course}</td>
//                                 <td>{item.branch}</td>
//                                 <td>{item.batch}</td>
//                                 <td>{item.mobileNumber}</td>
//                                 <td>{item.fatherName}</td>
//                                 <td>{item.fatherMobNo}</td>
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
import { Eye, EyeOff, ChevronDown, ChevronRight, Users, BookOpen, GraduationCap } from "lucide-react";
import FormatDate from "../../../Components/DateTimeFunction/FormatDate";

export default function AllStudents() {
  const API_BASE = import.meta.env.VITE_API_BASE_URL;
  const { domain } = useParams();
  const navigate = useNavigate();
  const role = localStorage.getItem("role");

  const [students, setStudents] = useState([]);
  const [showPassword, setShowPassword] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  // Track which batch-panels and course-panels are open
  // Default: all open
  const [openBatches, setOpenBatches] = useState({});
  const [openCourses, setOpenCourses] = useState({});

  // ── Fetch ──────────────────────────────────────────────────────────────────
  useEffect(() => { fetchAllData(); }, [domain]);

  const fetchAllData = async () => {
    try {
      const headers = {
        Authorization: `Bearer ${localStorage.getItem("token")}`,
        "Content-Type": "application/json",
      };
      const res = await fetch(`${API_BASE}/${domain}/${role}/allStudent`, { headers });
      const data = await res.json();
      const list = data?.data || data || [];
      setStudents(list);

      // Default all batches & courses to open
      const batchMap = {};
      const courseMap = {};
      list.forEach((s) => {
        const b = s.batch || "Unknown Batch";
        const c = s.course || "Unknown Course";
        batchMap[b] = true;
        courseMap[`${b}__${c}`] = true;
      });
      setOpenBatches(batchMap);
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
    return (students || []).filter(
      (s) =>
        !q ||
        s.name?.toLowerCase().includes(q) ||
        s.rollNumber?.toLowerCase().includes(q) ||
        s.course?.toLowerCase().includes(q) ||
        s.branch?.toLowerCase().includes(q) ||
        s.batch?.toLowerCase().includes(q) ||
        s.email?.toLowerCase().includes(q)
    );
  }, [students, searchQuery]);

  // Group: batch → course → students[]
  const grouped = useMemo(() => {
    const map = {};
    filtered.forEach((s) => {
      const batch = s.batch || "Unknown Batch";
      const course = s.course || "Unknown Course";
      if (!map[batch]) map[batch] = {};
      if (!map[batch][course]) map[batch][course] = [];
      map[batch][course].push(s);
    });
    // Sort batches descending (newest first)
    const sorted = Object.keys(map).sort((a, b) => {
      const aYear = parseInt(a.split("-")[0]) || 0;
      const bYear = parseInt(b.split("-")[0]) || 0;
      return bYear - aYear;
    });
    return { map, sortedBatches: sorted };
  }, [filtered]);

  const toggleBatch = (batch) =>
    setOpenBatches((p) => ({ ...p, [batch]: !p[batch] }));

  const toggleCourse = (key) =>
    setOpenCourses((p) => ({ ...p, [key]: !p[key] }));

  // Batch colours (cycles)
  const batchColors = [
    { bg: "bg-blue-50 border-blue-200", header: "bg-blue-100", accent: "text-blue-700", badge: "bg-blue-600" },
    { bg: "bg-violet-50 border-violet-200", header: "bg-violet-100", accent: "text-violet-700", badge: "bg-violet-600" },
    { bg: "bg-emerald-50 border-emerald-200", header: "bg-emerald-100", accent: "text-emerald-700", badge: "bg-emerald-600" },
    { bg: "bg-amber-50 border-amber-200", header: "bg-amber-100", accent: "text-amber-700", badge: "bg-amber-600" },
    { bg: "bg-rose-50 border-rose-200", header: "bg-rose-100", accent: "text-rose-700", badge: "bg-rose-600" },
  ];

  return (
    <div>
      {/* ── Page Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center">
            <GraduationCap size={20} className="text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-800 dark:text-gray-100">All Students</h1>
            <p className="text-xs text-gray-400">{filtered.length} students • {grouped.sortedBatches.length} batches</p>
          </div>
        </div>

        {/* Search */}
        <input
          type="text"
          placeholder="Search by name, roll no, course, batch…"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="border border-gray-300 rounded-lg px-4 py-2 text-sm w-full sm:w-72 focus:outline-none focus:ring-2 focus:ring-blue-400 dark:bg-gray-800 dark:border-gray-600 dark:text-gray-100"
        />
      </div>

      {filtered.length === 0 && (
        <div className="text-center py-16 text-gray-400 text-sm">No students found.</div>
      )}

      {/* ── Batch Panels ── */}
      <div className="space-y-6">
        {grouped.sortedBatches.map((batch, bi) => {
          const color = batchColors[bi % batchColors.length];
          const batchStudents = Object.values(grouped.map[batch]).flat();
          const courses = Object.keys(grouped.map[batch]).sort();
          const isOpen = openBatches[batch] !== false; // default open

          return (
            <div key={batch} className={`border-2 rounded-2xl overflow-hidden ${color.bg}`}>
              {/* Batch Header */}
              <button
                onClick={() => toggleBatch(batch)}
                className={`w-full flex items-center justify-between px-5 py-4 ${color.header} transition-colors`}
              >
                <div className="flex items-center gap-3">
                  <ChevronDown
                    size={18}
                    className={`${color.accent} transition-transform duration-200 ${isOpen ? "" : "-rotate-90"}`}
                  />
                  <span className={`font-bold text-base ${color.accent}`}>
                    🎓 Batch {batch}
                  </span>
                  <span className={`text-xs text-white px-2.5 py-0.5 rounded-full font-semibold ${color.badge}`}>
                    {batchStudents.length} students
                  </span>
                  <span className="text-xs text-gray-500">{courses.length} courses</span>
                </div>
              </button>

              {/* Batch Body */}
              {isOpen && (
                <div className="p-4 space-y-4">
                  {courses.map((course) => {
                    const courseKey = `${batch}__${course}`;
                    const courseStudents = grouped.map[batch][course];
                    const isCourseOpen = openCourses[courseKey] !== false;

                    return (
                      <div key={courseKey} className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl overflow-hidden shadow-sm">
                        {/* Course Header */}
                        <button
                          onClick={() => toggleCourse(courseKey)}
                          className="w-full flex items-center justify-between px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                        >
                          <div className="flex items-center gap-2">
                            {isCourseOpen
                              ? <ChevronDown size={15} className="text-gray-500" />
                              : <ChevronRight size={15} className="text-gray-500" />}
                            <BookOpen size={15} className={color.accent} />
                            <span className="font-semibold text-sm text-gray-700 dark:text-gray-200">
                              {course}
                            </span>
                            <span className={`text-xs px-2 py-0.5 rounded-full font-semibold text-white ${color.badge}`}>
                              {courseStudents.length}
                            </span>
                          </div>
                        </button>

                        {/* Students Table */}
                        {isCourseOpen && (
                          <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                              <thead>
                                <tr className="bg-gray-50 dark:bg-gray-800 text-gray-500 dark:text-gray-400 text-xs uppercase tracking-wide">
                                  <th className="px-3 py-2 text-left">#</th>
                                  <th className="px-3 py-2 text-left">Roll No</th>
                                  <th className="px-3 py-2 text-left">Name</th>
                                  <th className="px-3 py-2 text-left">Course</th>
                                  <th className="px-3 py-2 text-left">Branch</th>
                                  <th className="px-3 py-2 text-left">Batch</th>
                                  <th className="px-3 py-2 text-left">Email</th>
                                  <th className="px-3 py-2 text-left">Mobile</th>
                                  <th className="px-3 py-2 text-left">Father Name</th>
                                  <th className="px-3 py-2 text-left">Father No.</th>
                                  {/* {role === "DOMAIN_ADMIN" && (
                                    <>
                                      <th className="px-3 py-2 text-left">Created At</th>
                                      <th className="px-3 py-2 text-left">Last Login</th>
                                      <th className="px-3 py-2 text-left">
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
                                {courseStudents.map((s, idx) => (
                                  <tr
                                    key={s.rollNumber || idx}
                                    className="border-t border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                                  >
                                    <td className="px-3 py-2 text-gray-400">{idx + 1}.</td>
                                    <td className="px-3 py-2 font-mono font-medium text-gray-700 dark:text-gray-200">{s.rollNumber}</td>
                                    <td className="px-3 py-2 font-medium text-gray-800 dark:text-gray-100">{s.name}</td>
                                    <td className="px-3 py-2 text-gray-500">{s.course || "—"}</td>
                                    <td className="px-3 py-2 text-gray-500">{s.branch || "—"}</td>
                                    <td className="px-3 py-2 text-gray-500">{s.batch || "—"}</td>
                                    <td className="px-3 py-2 text-gray-500">{s.email}</td>
                                    <td className="px-3 py-2 text-gray-500">{s.mobileNumber}</td>
                                    <td className="px-3 py-2 text-gray-500">{s.fatherName}</td>
                                    <td className="px-3 py-2 text-gray-500">{s.fatherMobNo}</td>
                                    {/* {role === "DOMAIN_ADMIN" && (
                                      <>
                                        <td className="px-3 py-2 text-gray-400 text-xs">{FormatDate(s.createdDateTime)}</td>
                                        <td className="px-3 py-2 text-gray-400 text-xs">{FormatDate(s.lastLoginDateTime)}</td>
                                        <td className="px-3 py-2 font-mono text-xs text-gray-500">
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
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
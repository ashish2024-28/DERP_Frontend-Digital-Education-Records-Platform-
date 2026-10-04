import { lazy, Suspense } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";

import ThemeToggle from "./Components/DarakNLightMode/ThemToggle";
import { ThemeProvider } from "./Components/DarakNLightMode/ThemeContext";

// 404
import NotFound from "./Error/NotFound_404/NotFound";

// Home
const Home = lazy(() => import("./HomePage/Home/Home"));
const Login = lazy(() => import("./HomePage/Login/Login"));
const Signup = lazy(() => import("./HomePage/Signup/Signup"));
const SignupConfirm = lazy(() => import("./HomePage/Signup/SignupConfirm"));

// Common
const About = lazy(() => import("./Components/About/About"));
const Contact = lazy(() => import("./Components/Contact/Contact"));
const UniversityRegister = lazy(() => import("./HomePage/UniversityRegister/UniversityRegister"));

const Notes = lazy(() => import("./Dashboard/Common/StudentFacultyDashboard/ClassRoom/Notes"));
const TestQuize = lazy(() => import("./Dashboard/Common/StudentFacultyDashboard/ClassRoom/TestsQuiz"));
const Assignment = lazy(() => import("./Dashboard/Common/StudentFacultyDashboard/ClassRoom/Assignments"));
const Notepad = lazy(() => import("./Dashboard/Common/NotePad/Notepad"));

const AllStudents = lazy(() => import("./Dashboard/Common/GetAllRoleDashbord/AllStudent"));
const AllFaculty = lazy(() => import("./Dashboard/Common/GetAllRoleDashbord/AllFaculty"));
const AllSubAdmin = lazy(() => import("./Dashboard/Common/GetAllRoleDashbord/AllSubAdmin"));
const AllFeesAdmin = lazy(() => import("./Dashboard/Common/GetAllRoleDashbord/AllFeesAdmin"));

// Student
const StudentDashboard = lazy(() => import("./Dashboard/StudentDashboard/StudentDashboard"));
const Certification = lazy(() => import("./Dashboard/StudentDashboard/StudentInfo/Certification"));
const Fees = lazy(() => import("./Dashboard/Common/AdminStudent/Fees"));

// Faculty
const FacultyDashboard = lazy(() => import("./Dashboard/FacultyDashboard/FacultyDashboard"));

// SubAdmin
const SubAdminDashboard = lazy(() => import("./Dashboard/SubAdminDashboard/SubAdminDashboard"));

// FeesAdmin
const FeesAdminDashboard = lazy(() => import("./Dashboard/FeesAdminDashboard/FeesAdminDashboard"));
const FeesAccount = lazy(() => import("./Dashboard/FeesAdminDashboard/FeesAccount/FeesAccount"));
const PlatformAdminDashboard = lazy(() => import("./Dashboard/PlatformAdminDashboard"));

// DomainAdmin
const DomainAdminDashboard = lazy(() => import("./Dashboard/DomainAdminDashboard/DomainAdminDashboard"));
const DomainAdminErpActivity = lazy(() => import("./Dashboard/DomainAdminDashboard/DomainAdminErpActivity"));
const DomainAdminFeesAccount = lazy(() => import("./Dashboard/DomainAdminDashboard/DomainAdminInfo/FeesAccount/FeesAccount"));

const ProfileDashboard = lazy(() => import("./Dashboard/Common/ProfileDashboard/ProfileDashboard"));

// ERP
const DomainAdminErpAttendence = lazy(() => import("./Dashboard/DomainAdminDashboard/DomainAdminInfo/Erp/DomainAdminErpAttendence"));
const SubAdminErpAttendance = lazy(() => import("./Dashboard/SubAdminDashboard/SubAdminnfo/Erp/SubAdminErpAttendence"));
const FacultyErpAttendence = lazy(() => import("./Dashboard/FacultyDashboard/FacultyInfo/Erp/FacultyErpAttendence"));
const StudentErpAttendence = lazy(() => import("./Dashboard/StudentDashboard/StudentInfo/Erp/StudentErpAttendence"));

function App() {
  return (
    <ThemeProvider>
      <BrowserRouter>

        {/* ONE GLOBAL THEME TOGGLE */}
        <ThemeToggle />

        <Suspense fallback={<div className="route-loading" role="status">Loading page...</div>}>
          <Routes>

            {/* ================= HOME ================= */}

            <Route path="/" element={<Home />} />

            <Route path="/about" element={<About />} />

            <Route path="/contact" element={<Contact />} />

            <Route path="/admin/dashboard" element={<PlatformAdminDashboard />} />

            <Route
              path="/HomePage/university-register"
              element={<UniversityRegister />}
            />

{/* :domain     → university/domain
:role       → logged-in role, e.g. domainAdmin
:userType   → student / faculty / subAdmin / feesAdmin
:userId     → rollNumber / facultyId / subAdminId / feesAdminId */}
            <Route
              path="/:domain/:role/:userType/:userId"
              element={<ProfileDashboard />}
            />
            {/* 



            {/* ================= AUTH ================= */}

            <Route
              path="/:domain/login"
              element={<Login />}
            />

            <Route
              path="/:domain/signup"
              element={<Signup />}
            />

            <Route
              path="/:domain/signup/confirm"
              element={<SignupConfirm />}
            />


            {/* ================= STUDENT ================= */}

            <Route
              path="/:domain/student/dashboard"
              element={<StudentDashboard />}
            >

              <Route
                path="certification"
                element={<Certification />}
              />

              <Route
                path="student-erp-attendence"
                element={<StudentErpAttendence />}
              />

              <Route
                path="fees"
                element={<Fees />}
              />

              <Route
                path="notepad"
                element={<Notepad />}
              />

              <Route
                path="assignment"
                element={<Assignment />}
              />

              <Route
                path="test-quize"
                element={<TestQuize />}
              />

              <Route
                path="notes"
                element={<Notes />}
              />

            </Route>


            {/* ================= FACULTY ================= */}

            <Route
              path="/:domain/faculty/dashboard"
              element={<FacultyDashboard />}
            >

              <Route
                path="faculty-erp-attendence"
                element={<FacultyErpAttendence />}
              />

              <Route
                path="notepad"
                element={<Notepad />}
              />

              <Route
                path="all-students"
                element={<AllStudents />}
              />

              <Route
                path="notes"
                element={<Notes />}
              />

              <Route
                path="assignment"
                element={<Assignment />}
              />

              <Route
                path="test-quize"
                element={<TestQuize />}
              />

            </Route>


            {/* ================= SUB ADMIN ================= */}

            <Route
              path="/:domain/subadmin/dashboard"
              element={<SubAdminDashboard />}
            >

              <Route
                path="all-students"
                element={<AllStudents />}
              />

              <Route
                path="all-faculty"
                element={<AllFaculty />}
              />

              <Route
                path="notepad"
                element={<Notepad />}
              />

              <Route
                path="attendance"
                element={<SubAdminErpAttendance />}
              />

            </Route>


            {/* ================= FEES ADMIN ================= */}

            <Route
              path="/:domain/feesadmin/dashboard"
              element={<FeesAdminDashboard />}
            >

              <Route
                path="all-students"
                element={<AllStudents />}
              />

              <Route
                path="all-faculty"
                element={<AllFaculty />}
              />

              <Route
                path="notepad"
                element={<Notepad />}
              />

              <Route
                path="fees"
                element={<FeesAccount />}
              />

              {/* <Route
              path="attendance"
              element={<SubAdminErpAttendance />}
            /> */}

            </Route>


            {/* ================= DOMAIN ADMIN ================= */}

            <Route
              path="/:domain/domainAdmin/dashboard"
              element={<DomainAdminDashboard />}
            >

              <Route
                path="all-students"
                element={<AllStudents />}
              />

              <Route
                path="all-faculty"
                element={<AllFaculty />}
              />

              <Route
                path="all-subAdmin"
                element={<AllSubAdmin />}
              />

              <Route
                path="all-feesAdmin"
                element={<AllFeesAdmin />}
              />

              <Route
                path="notepad"
                element={<Notepad />}
              />


              <Route
                path="attendance"
                element={<DomainAdminErpAttendence />}
              />

              <Route
                path="erp-activity"
                element={<DomainAdminErpActivity />}
              />

              <Route
                path="fees-account"
                element={<DomainAdminFeesAccount />}
              />

              <Route
                path="admin-erp-attendence"
                element={<DomainAdminErpAttendence />}
              />

            </Route>


            {/* ================= 404 ================= */}

            <Route
              path="*"
              element={<NotFound />}
            />

          </Routes>
        </Suspense>

      </BrowserRouter>
    </ThemeProvider>
  );
}

export default App;
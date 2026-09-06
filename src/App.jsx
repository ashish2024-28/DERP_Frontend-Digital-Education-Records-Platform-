import { BrowserRouter, Routes, Route } from "react-router-dom";

import ThemeToggle from "./Components/DarakNLightMode/ThemToggle";
import { ThemeProvider } from "./Components/DarakNLightMode/ThemeContext";

// 404
import NotFound from "./Error/NotFound_404/NotFound";

// Home
import Home from "./HomePage/Home/Home";
import Login from "./HomePage/Login/Login";
import Signup from "./HomePage/Signup/Signup";
import SignupConfirm from "./HomePage/Signup/SignupConfirm";

// Common
import About from "./Components/About/About";
import Contact from "./Components/Contact/Contact";
import UniversityRegister from "./HomePage/UniversityRegister/UniversityRegister";

import Notes from "./Dashboard/Common/StudentFacultyDashboard/ClassRoom/Notes";
import TestQuize from "./Dashboard/Common/StudentFacultyDashboard/ClassRoom/TestsQuiz";
import Assignment from "./Dashboard/Common/StudentFacultyDashboard/ClassRoom/Assignments";
import Notepad from "./Dashboard/Common/NotePad/Notepad";

import AllStudents from "./Dashboard/Common/GetAllRoleDashbord/AllStudent";
import AllFaculty from "./Dashboard/Common/GetAllRoleDashbord/AllFaculty";
import AllSubAdmin from "./Dashboard/Common/GetAllRoleDashbord/AllSubAdmin";
import AllFeesAdmin from "./Dashboard/Common/GetAllRoleDashbord/AllFeesAdmin";

// Student
import StudentDashboard from "./Dashboard/StudentDashboard/StudentDashboard";
import Certification from "./Dashboard/StudentDashboard/StudentInfo/Certification";
import Fees from "./Dashboard/Common/AdminStudent/Fees";

// Faculty
import FacultyDashboard from "./Dashboard/FacultyDashboard/FacultyDashboard";

// SubAdmin
import SubAdminDashboard from "./Dashboard/SubAdminDashboard/SubAdminDashboard";

// FeesAdmin
import FeesAdminDashboard from "./Dashboard/FeesAdminDashboard/FeesAdminDashboard";

// DomainAdmin
import DomainAdminDashboard from "./Dashboard/DomainAdminDashboard/DomainAdminDashboard";


// ERP
import DomainAdminErpAttendence from "./Dashboard/DomainAdminDashboard/DomainAdminInfo/Erp/DomainAdminErpAttendence";
import DomainAdminReports from "./Dashboard/DomainAdminDashboard/DomainAdminReports";
import SubAdminErpAttendance from "./Dashboard/SubAdminDashboard/SubAdminnfo/Erp/SubAdminErpAttendence";
import FacultyErpAttendence from "./Dashboard/FacultyDashboard/FacultyInfo/Erp/FacultyErpAttendence";
import StudentErpAttendence from "./Dashboard/StudentDashboard/StudentInfo/Erp/StudentErpAttendence";

function App() {
  return (
    <ThemeProvider>
      <BrowserRouter>

        {/* ONE GLOBAL THEME TOGGLE */}
        <ThemeToggle />

        <Routes>

          {/* ================= HOME ================= */}

          <Route path="/" element={<Home />} />

          <Route path="/about" element={<About />} />

          <Route path="/contact" element={<Contact />} />

          <Route
            path="/HomePage/university-register"
            element={<UniversityRegister />}
          />


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

            {/* <Route
              path="all-faculty"
              element={<AllFaculty />}
            /> */}

            <Route
              path="notepad"
              element={<Notepad />}
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
              path="reports"
              element={<DomainAdminReports />}
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

      </BrowserRouter>
    </ThemeProvider>
  );
}

export default App;
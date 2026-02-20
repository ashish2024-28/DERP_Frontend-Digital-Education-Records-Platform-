import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import ThemeToggle from "./Components/DarakNLightMode/ThemToggle";
import { ThemeProvider } from "./Components/DarakNLightMode/ThemeContext"; // Import the Provider you created
// university add
import UniversityRegister from "./HomePage/UniversityRegister";
//home
import Login from "./HomePage/Login";
import Signup from "./HomePage/Signup";
import SignupConfirm from "./HomePage/SignupConfirm";
// common 
import Notes from "./Dashboard/Common/StudentFacultyDashboard/ClassRoom/Notes";
import TestQuize from "./Dashboard/Common/StudentFacultyDashboard/ClassRoom/TestsQuiz";
import Assignment from "./Dashboard/Common/StudentFacultyDashboard/ClassRoom/Assignments";


// Student 
import StudentDashboard from "./Dashboard/StudentDashboard/StudentDashboard";
import Certification from "./Dashboard/StudentDashboard/StudentInfo/Certification";
import StudentNotepad from "./Dashboard/StudentDashboard/StudentInfo/Notepad";
import StudentErpAttendence from "./Dashboard/StudentDashboard/StudentInfo/ErpAttendence";
import Fees from "./Dashboard/Common/AdminStudent/Fees";

// Faculty
import FacultyDashboard from "./Dashboard/FacultyDashboard/FacultyDashboard";
import AllStudents from "./Dashboard/FacultyDashboard/FacultyInfo/AllStudnts";
import FacultyErpAttendence from "./Dashboard/FacultyDashboard/FacultyInfo/ErpAttendence";
import FacultyNotepad from "./Dashboard/FacultyDashboard/FacultyInfo/Notepad";

// SubAdminDashboard
import SubAdminDashboard from "./Dashboard/SubAdminDashboard/SubAdminDashboard";

// DomainAdmin
import DomainAdminDashboard from "./Dashboard/DomainAdminDashboard/DomainAdminDashboard";





function App() {
  return (
    <ThemeProvider> {/* 1. Wrap the entire app here */}
      <BrowserRouter>
        <ThemeToggle /> {/* This button now has access to the context */}
        <Routes>
          {/* Default redirect */}
          <Route path="/" element={<Navigate to="/:domain/login" />} />

          {/* University register */}
          <Route path="/HomePage/university-register" element={<UniversityRegister />} />

          <Route path="/:domain/login" element={<Login />} />
          <Route path="/:domain/signup" element={<Signup />} />
          <Route path="/:domain/signup/confirm" element={<SignupConfirm />} />


          {/*Student Dashboards */}
          <Route path="/:domain/student/dashboard" element={<StudentDashboard />} >
            {/* Use index or relative paths */}
            <Route path="certification" element={<Certification />} />
            <Route path="notepad" element={<StudentNotepad />} />
            <Route path="erp-attendence" element={<StudentErpAttendence />} />
            <Route path="fees" element={<Fees />} />
            {/* common student and faculty */}
            <Route path="assignment" element={<Assignment />} />
            <Route path="test-quize" element={<TestQuize />} />
            <Route path="notes" element={<Notes />} />

          </Route>

          {/*Faculty Dashboards */}
          <Route path="/:domain/faculty/dashboard" element={<FacultyDashboard />} >
            <Route path="all-students" element={<AllStudents />} />
            <Route path="notepad" element={<FacultyNotepad />} />
            <Route path="erp-attendence" element={<FacultyErpAttendence />} />
            {/* common student and faculty */}
            <Route path="assignment" element={<Assignment />} />
            <Route path="test-quize" element={<TestQuize />} />
            <Route path="notes" element={<Notes />} />

          </Route>


          {/*SubAdmin Dashboards */}
          <Route path="/:domain/subadmin/dashboard" element={<SubAdminDashboard />} />


          {/*DomainAdmin Dashboards */}
          <Route path="/:domain/domainAdmin/dashboard" element={<DomainAdminDashboard />} />




        </Routes>
      </BrowserRouter >
    </ThemeProvider>
  );
}

export default App;

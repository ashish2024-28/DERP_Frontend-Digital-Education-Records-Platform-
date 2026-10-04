

import { useCallback, useEffect, useRef, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";

import {
  ArrowLeft,
  User,
  GraduationCap,
  CalendarCheck,
  Award,
  IndianRupee,
  Mail,
  Phone,
  Users,
  BookOpen,
  Clock3,
  ShieldCheck,
  BadgeCheck,
  CircleUserRound,
  Download,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

import FormatDate from "../../../Components/DateTimeFunction/FormatDate";

function formatAttendanceDate(value) {
  const [year, month, day] = String(value).split("-").map(Number);
  if (!year || !month || !day) return value;

  return new Intl.DateTimeFormat("en-GB", {
    day: "2-digit",
    month: "2-digit",
    year: "2-digit",
  }).format(new Date(year, month - 1, day));
}

export default function StudentProfileDashboard() {
  const API_BASE = import.meta.env.VITE_API_BASE_URL;

  const { domain, role, userId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();

  const [student, setStudent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [downloadError, setDownloadError] = useState("");
  const [downloadingCertificateId, setDownloadingCertificateId] = useState(null);
  const certificatesScrollerRef = useRef(null);

  const normalizedRole = (role || "").toUpperCase();

  // =========================================================
  // ROLE CHECK
  // =========================================================

  const isDomainAdmin =
    normalizedRole === "DOMAINADMIN" ||
    normalizedRole === "DOMAIN_ADMIN";

  const isFeesAdmin =
    normalizedRole === "FEESADMIN" ||
    normalizedRole === "FEES_ADMIN";

  const isFaculty = normalizedRole === "FACULTY";

  const isSubAdmin =
    normalizedRole === "SUBADMIN" ||
    normalizedRole === "SUB_ADMIN";

  const canSeeAll = isDomainAdmin;

  const canSeeFees = isDomainAdmin || isFeesAdmin;

  const canSeeAcademic =
    isDomainAdmin || isFaculty || isSubAdmin;

  // =========================================================
  // LOAD PROFILE
  // =========================================================

  const loadStudentProfile = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const token = localStorage.getItem("token");

      if (!token) {
        throw new Error("Authentication token not found.");
      }

      /*
       * STEP 1
       * First try email received from the previous page.
       */
      let email = location.state?.email;

      /*
       * STEP 2
       * If page was refreshed, location.state disappears.
       *
       * Therefore find the email using the student ID in the route.
       */
      if (!email) {
        const allStudentsResponse = await fetch(
          `${API_BASE}/${domain}/${role}/all_student`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          }
        );

        if (!allStudentsResponse.ok) {
          throw new Error(
            `Unable to find student (${allStudentsResponse.status})`
          );
        }

        const allStudentsData =
          await allStudentsResponse.json();

        const students =
          allStudentsData?.data ||
          allStudentsData ||
          [];

        const matchedStudent = students.find(
          (item) =>
            String(item?.rollNumber || "").toLowerCase() ===
            String(userId || "").toLowerCase()
        );

        if (!matchedStudent?.email) {
          throw new Error(
            "Student email could not be found."
          );
        }

        email = matchedStudent.email;
      }

      /*
       * STEP 3
       *
       * IMPORTANT:
       * Student profile API receives EMAIL.
       *
       * The student ID is only present in the frontend URL.
       */
      const response = await fetch(
        `${API_BASE}/${domain}/${role}/student?email=${encodeURIComponent(
          email
        )}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (response.status === 401) {
        throw new Error(
          "Your session has expired. Please login again."
        );
      }

      if (response.status === 403) {
        throw new Error(
          "You are not authorized to view this student profile."
        );
      }

      if (!response.ok) {
        throw new Error(
          `Unable to load student profile (${response.status})`
        );
      }

      const data = await response.json();

      setStudent(data?.data || data);
    } catch (err) {
      console.error("Student profile error:", err);

      setError(
        err.message ||
          "Unable to load student profile."
      );
    } finally {
      setLoading(false);
    }
  }, [API_BASE, domain, role, userId, location.state?.email]);

  useEffect(() => {
    loadStudentProfile();
  }, [loadStudentProfile]);

  // =========================================================
  // PROFILE IMAGE
  // =========================================================

  const getProfileImage = () => {
    if (!student?.profilePic) {
      return "/default.png";
    }

    /*
     * Same pattern used in StudentDashboard:
     *
     * API_BASE + profilePic
     */
    return `${API_BASE}/${student.profilePic}`;
  };

  const downloadCertificate = async (certificate) => {
    if (!certificate?.id) {
      setDownloadError("Certificate ID is missing.");
      return;
    }

    setDownloadError("");
    setDownloadingCertificateId(certificate.id);

    try {
      const token = localStorage.getItem("token");
      if (!token) {
        throw new Error("Authentication token not found.");
      }

      const response = await fetch(
        `${API_BASE}/${domain}/domain-admin/student/certifications/${certificate.id}/file`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (!response.ok) {
        throw new Error(`Unable to download certificate (${response.status}).`);
      }

      const fileUrl = URL.createObjectURL(await response.blob());
      const link = document.createElement("a");
      link.href = fileUrl;
      link.download = `certificate-${certificate.id}`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.setTimeout(() => URL.revokeObjectURL(fileUrl), 1000);
    } catch (downloadFailure) {
      console.error("Certificate download error:", downloadFailure);
      setDownloadError(downloadFailure.message || "Unable to download certificate.");
    } finally {
      setDownloadingCertificateId(null);
    }
  };

  const scrollCertificates = (direction) => {
    certificatesScrollerRef.current?.scrollBy({
      left: direction * 320,
      behavior: "smooth",
    });
  };

  // =========================================================
  // LOADING
  // =========================================================

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-950 p-4 md:p-8">
        <div className="mx-auto max-w-7xl">

          <div className="animate-pulse">

            <div className="h-10 w-48 rounded-lg bg-gray-200 dark:bg-gray-800 mb-6" />

            <div className="rounded-3xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 p-6">
              <div className="flex gap-6">

                <div className="h-28 w-28 rounded-2xl bg-gray-200 dark:bg-gray-800" />

                <div className="flex-1 space-y-4">
                  <div className="h-6 w-64 rounded bg-gray-200 dark:bg-gray-800" />
                  <div className="h-4 w-48 rounded bg-gray-200 dark:bg-gray-800" />
                  <div className="h-4 w-80 rounded bg-gray-200 dark:bg-gray-800" />
                </div>

              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
              <div className="h-48 rounded-3xl bg-gray-200 dark:bg-gray-800" />
              <div className="h-48 rounded-3xl bg-gray-200 dark:bg-gray-800" />
            </div>

          </div>

        </div>
      </div>
    );
  }

  // =========================================================
  // ERROR
  // =========================================================

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-950 p-4 md:p-8">

        <div className="mx-auto max-w-3xl">

          <button
            onClick={() => navigate(-1)}
            className="
              mb-6
              inline-flex
              items-center
              gap-2
              rounded-xl
              border
              border-gray-200
              dark:border-gray-700
              bg-white
              dark:bg-gray-900
              px-4
              py-2
              text-sm
              font-semibold
              text-gray-700
              dark:text-gray-200
              hover:bg-gray-50
              dark:hover:bg-gray-800
              transition
            "
          >
            <ArrowLeft size={17} />
            Back
          </button>

          <div className="
            rounded-2xl
            border
            border-red-200
            dark:border-red-900
            bg-red-50
            dark:bg-red-950/30
            p-5
            text-red-700
            dark:text-red-300
          ">
            <div className="flex gap-3">
              <ShieldCheck size={22} />

              <div>
                <h2 className="font-bold">
                  Unable to load profile
                </h2>

                <p className="text-sm mt-1">
                  {error}
                </p>
              </div>
            </div>
          </div>

        </div>
      </div>
    );
  }

  if (!student) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-950 p-8 text-center">
        <p className="text-gray-500">
          Student not found.
        </p>
      </div>
    );
  }

  // =========================================================
  // DATA HELPERS
  // =========================================================

  const attendanceBySubject = Array.isArray(student.studentTotalAttendanceSubjectWise)
    ? student.studentTotalAttendanceSubjectWise
    : [];
  const attendanceRecords = Array.isArray(student.studentAttendanceRecordDayWises)
    ? student.studentAttendanceRecordDayWises
    : [];
  const totalAttendanceClassesFromSummary = attendanceBySubject.reduce(
    (total, record) => total + (Number(record.totalClasses) || 0),
    0
  );
  const totalAttendancePresentFromSummary = attendanceBySubject.reduce(
    (total, record) => total + (Number(record.presentCount) || 0),
    0
  );
  const totalAttendanceAbsentFromSummary = attendanceBySubject.reduce(
    (total, record) => total + (Number(record.absentCount) || 0),
    0
  );
  const totalAttendanceClasses = totalAttendanceClassesFromSummary || attendanceRecords.length;
  const totalAttendancePresent = totalAttendancePresentFromSummary || attendanceRecords.filter(
    (record) => String(record.status || "").toUpperCase() === "PRESENT"
  ).length;
  const totalAttendanceAbsent = totalAttendanceAbsentFromSummary || attendanceRecords.filter(
    (record) => String(record.status || "").toUpperCase() === "ABSENT"
  ).length;
  const overallAttendanceRate = totalAttendanceClasses > 0
    ? Math.round((totalAttendancePresent / totalAttendanceClasses) * 100)
    : 0;
  const attendanceDates = [...new Set(
    attendanceRecords.map((record) => record.attendanceDate).filter(Boolean)
  )].sort();
  const attendanceSubjects = [...new Set([
    ...attendanceRecords.map((record) => record.subject),
    ...attendanceBySubject.map((record) => record.subject),
  ].filter(Boolean))].sort((left, right) => left.localeCompare(right));
  const attendanceMatrix = new Map();

  attendanceRecords.forEach((record) => {
    if (!record.subject || !record.attendanceDate) return;

    const key = `${record.subject}\u0000${record.attendanceDate}`;
    const entries = attendanceMatrix.get(key) || [];
    entries.push(record);
    attendanceMatrix.set(key, entries);
  });

  const certificatesAvailable =
    student.certifications;

  const feesAccountAvailable =
    student.feesAccount;

  const feesPaymentsAvailable =
    student.feesPayments;

  return (
    <div className="
      min-h-screen
      bg-gray-50
      dark:bg-gray-950
      text-gray-800
      dark:text-gray-100
      p-4
      md:p-6
      lg:p-8
    ">

      <div className="mx-auto w-full max-w-screen-2xl space-y-6">

        {/* =================================================
            TOP BAR
        ================================================= */}

        <div className="
          flex
          flex-col
          sm:flex-row
          sm:items-center
          sm:justify-between
          gap-4
        ">

          <div className="flex items-center gap-3">

            <button
              onClick={() => navigate(-1)}
              className="
                h-10
                w-10
                flex
                items-center
                justify-center
                rounded-xl
                border
                border-gray-200
                dark:border-gray-700
                bg-white
                dark:bg-gray-900
                hover:bg-gray-50
                dark:hover:bg-gray-800
                transition
              "
              title="Go back"
            >
              <ArrowLeft size={19} />
            </button>

            <div>
              <h1 className="
                text-xl
                md:text-2xl
                font-bold
                text-gray-900
                dark:text-white
              ">
                Student Profile
              </h1>

              <p className="
                text-xs
                md:text-sm
                text-gray-500
                dark:text-gray-400
              ">
                Student details and academic information
              </p>
            </div>

          </div>

          <div className="
            inline-flex
            items-center
            gap-2
            self-start
            sm:self-auto
            rounded-full
            border
            border-blue-200
            dark:border-blue-900
            bg-blue-50
            dark:bg-blue-950/40
            px-4
            py-2
            text-xs
            font-bold
            text-blue-700
            dark:text-blue-300
          ">
            <ShieldCheck size={15} />
            {formatRole(normalizedRole)}
          </div>

        </div>


        {/* =================================================
            PROFILE HERO
        ================================================= */}

        <section className="
          overflow-hidden
          rounded-3xl
          border
          border-gray-200
          dark:border-gray-800
          bg-white
          dark:bg-gray-900
          shadow-sm
        ">

          {/* Top decorative area */}

          <div className="
            h-28
            md:h-36
            bg-gradient-to-r
            from-blue-600
            via-indigo-600
            to-violet-600
          " />

          <div className="px-5 md:px-8 pb-7">

            <div className="
              flex
              flex-col
              lg:flex-row
              lg:items-end
              lg:justify-between
              gap-5
              -mt-14
              md:-mt-16
            ">

              {/* Profile image */}

              <div className="flex items-end gap-5">

                <div className="
                  relative
                  shrink-0
                  h-28
                  w-28
                  md:h-32
                  md:w-32
                  rounded-2xl
                  border-4
                  border-white
                  dark:border-gray-900
                  bg-gray-100
                  dark:bg-gray-800
                  shadow-lg
                  overflow-hidden
                ">

                  <img
                    src={getProfileImage()}
                    alt={student.name || "Student"}
                    className="
                      h-full
                      w-full
                      object-cover
                    "
                    onError={(event) => {
                      event.currentTarget.src =
                        "/default.png";
                    }}
                  />

                </div>

                <div className="pb-1">

                  <div className="
                    flex
                    flex-wrap
                    items-center
                    gap-2
                  ">

                    <h2 className="
                      text-xl
                      md:text-2xl
                      font-bold
                      text-gray-900
                      dark:text-white
                    ">
                      {student.name || "Student"}
                    </h2>

                    <span className="
                      inline-flex
                      items-center
                      gap-1
                      rounded-full
                      bg-emerald-100
                      dark:bg-emerald-950/50
                      px-2.5
                      py-1
                      text-xs
                      font-semibold
                      text-emerald-700
                      dark:text-emerald-300
                    ">
                      <BadgeCheck size={13} />
                      Student
                    </span>

                  </div>

                  <p className="
                    mt-1
                    text-sm
                    text-gray-500
                    dark:text-gray-400
                  ">
                    Roll No:{" "}
                    <span className="font-semibold text-gray-700 dark:text-gray-200">
                      {student.rollNumber || userId || "-"}
                    </span>
                  </p>

                </div>

              </div>


              {/* Quick information */}

              <div className="
                grid
                grid-cols-2
                md:grid-cols-3
                lg:grid-cols-3
                gap-3
              ">

                <QuickStat
                  icon={<BookOpen size={17} />}
                  label="Course"
                  value={student.course}
                />


                <QuickStat
                  icon={<CalendarCheck size={17} />}
                  label="Batch"
                  value={student.batch}
                />

              </div>

            </div>


            {/* Contact row */}

            <div className="
              mt-7
              pt-5
              border-t
              border-gray-100
              dark:border-gray-800
              flex
              flex-col
              md:flex-row
              md:items-center
              gap-3
              md:gap-6
              text-sm
              text-gray-600
              dark:text-gray-400
            ">

              <div className="flex items-center gap-2">
                <Mail size={16} className="text-blue-600" />
                <span className="break-all">
                  {student.email || "-"}
                </span>
              </div>

              <div className="flex items-center gap-2">
                <Phone size={16} className="text-emerald-600" />
                <span>
                  {student.mobileNumber || "-"}
                </span>
              </div>

            </div>

          </div>

        </section>


        {/* =================================================
            PERSONAL INFORMATION
        ================================================= */}

        <ProfileSection
          icon={<CircleUserRound size={21} />}
          title="Personal Information"
          description="Basic student and family information"
        >

          <Info
            icon={<User size={17} />}
            label="Full Name"
            value={student.name}
          />

          <Info
            icon={<Mail size={17} />}
            label="Email Address"
            value={student.email}
          />

          <Info
            icon={<Phone size={17} />}
            label="Mobile Number"
            value={student.mobileNumber}
          />

          <Info
            icon={<Users size={17} />}
            label="Father Name"
            value={student.fatherName}
          />

          <Info
            icon={<Phone size={17} />}
            label="Father Mobile"
            value={student.fatherMobNo}
          />

          <Info
            icon={<BadgeCheck size={17} />}
            label="Roll Number"
            value={student.rollNumber}
          />

        </ProfileSection>


        {/* =================================================
            ACADEMIC INFORMATION
        ================================================= */}

        <ProfileSection
          icon={<GraduationCap size={21} />}
          title="Academic Information"
          description="Course, and study details"
        >

          <Info
            icon={<BookOpen size={17} />}
            label="Course"
            value={student.course}
          />


          <Info
            icon={<CalendarCheck size={17} />}
            label="Batch"
            value={student.batch}
          />

          <Info
            icon={<CalendarCheck size={17} />}
            label="Study Batch"
            value={student.studyBatch}
          />

          <Info
            icon={<BookOpen size={17} />}
            label="Study Subjects"
            value={student.studySubjects}
          />

        </ProfileSection>


        {/* =================================================
            ACADEMIC ACCESS
        ================================================= */}

        {canSeeAcademic && (
          <div className="
            grid
            grid-cols-1
            2xl:grid-cols-2
            gap-6
          ">

            {/* Attendance */}

            <ProfileSection
              icon={<CalendarCheck size={21} />}
              title="Attendance"
              description="Student attendance information"
              contentClassName="min-w-0 space-y-4"
            >

              {attendanceBySubject.length > 0 || attendanceRecords.length > 0 ? (
                <>
                  <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                    <AttendanceMetric label="Overall" value={`${overallAttendanceRate}%`} />
                    <AttendanceMetric label="Classes" value={totalAttendanceClasses} />
                    <AttendanceMetric label="Present" value={totalAttendancePresent} />
                    <AttendanceMetric label="Absent" value={totalAttendanceAbsent} />
                  </div>

                  {attendanceDates.length > 0 && attendanceSubjects.length > 0 ? (
                    <div className="overflow-x-auto rounded-xl border border-gray-200 dark:border-gray-700">
                      <table className="w-full min-w-max border-separate border-spacing-0 text-left text-sm">
                        <thead>
                          <tr className="bg-gray-50 text-xs uppercase tracking-wide text-gray-500 dark:bg-gray-950/60 dark:text-gray-400">
                            <th scope="col" className="sticky left-0 z-20 min-w-36 border-b border-gray-200 bg-gray-50 px-4 py-3 font-semibold dark:border-gray-700 dark:bg-gray-950">
                              Subject
                            </th>
                            {attendanceDates.map((date) => (
                              <th
                                key={date}
                                scope="col"
                                className="min-w-28 whitespace-nowrap border-b border-gray-200 px-4 py-3 text-center font-semibold dark:border-gray-700"
                              >
                                {formatAttendanceDate(date)}
                              </th>
                            ))}
                          </tr>
                        </thead>
                        <tbody>
                          {attendanceSubjects.map((subject) => (
                            <tr key={subject} className="odd:bg-white even:bg-gray-50/70 dark:odd:bg-gray-900 dark:even:bg-gray-950/40">
                              <th
                                scope="row"
                                className="sticky left-0 z-10 border-b border-gray-100 bg-inherit px-4 py-3 text-left font-semibold text-gray-800 dark:border-gray-800 dark:text-gray-100"
                              >
                                {subject}
                              </th>
                              {attendanceDates.map((date) => {
                                const records = attendanceMatrix.get(`${subject}\u0000${date}`) || [];

                                return (
                                  <td
                                    key={`${subject}-${date}`}
                                    className="border-b border-gray-100 px-4 py-3 text-center dark:border-gray-800"
                                  >
                                    {records.length > 0 ? (
                                      <div className="flex min-w-20 flex-wrap justify-center gap-1">
                                        {records.map((record, index) => {
                                          const status = String(record.status || "UNKNOWN").toUpperCase();
                                          const isPresent = status === "PRESENT";
                                          const isAbsent = status === "ABSENT";

                                          return (
                                            <span
                                              key={record.id ?? `${record.periodNumber ?? "period"}-${index}`}
                                              title={`Period ${record.periodNumber ?? "-"}: ${status}`}
                                              className={`inline-flex min-w-7 items-center justify-center rounded-md px-2 py-1 text-xs font-bold ${
                                                isPresent
                                                  ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300"
                                                  : isAbsent
                                                    ? "bg-rose-100 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300"
                                                    : "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-200"
                                              }`}
                                            >
                                              {isPresent ? "P" : isAbsent ? "A" : status.charAt(0)}
                                            </span>
                                          );
                                        })}
                                      </div>
                                    ) : (
                                      <span className="text-gray-300 dark:text-gray-700">—</span>
                                    )}
                                  </td>
                                );
                              })}
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  ) : (
                    <p className="rounded-xl border border-dashed border-gray-300 p-4 text-sm text-gray-500 dark:border-gray-700 dark:text-gray-400">
                      No date-wise attendance records are available yet.
                    </p>
                  )}
                </>
              ) : (
                <div className="flex min-h-28 flex-col items-center justify-center gap-2 rounded-2xl border border-dashed border-gray-300 bg-gray-50/70 p-5 text-center dark:border-gray-700 dark:bg-gray-950/40">
                  <CalendarCheck size={21} className="text-gray-400" />
                  <strong className="text-sm text-gray-700 dark:text-gray-200">No attendance summary yet</strong>
                  <span className="text-xs text-gray-500 dark:text-gray-400">
                    Subject-wise attendance totals will appear here after attendance is recorded.
                  </span>
                </div>
              )}

            </ProfileSection>


            {/* Certificates */}

            <ProfileSection
              icon={<Award size={21} />}
              title="Certificates"
              description="Student certification information"
              contentClassName="min-w-0"
            >
              {canSeeAll ? (
                <div className="col-span-full min-w-0">
                  {downloadError && (
                    <p role="alert" className="mb-3 text-sm text-red-600 dark:text-red-400">
                      {downloadError}
                    </p>
                  )}
                  {Array.isArray(certificatesAvailable) && certificatesAvailable.length > 0 ? (
                    <>
                      {certificatesAvailable.length > 1 && (
                        <div className="mb-3 flex justify-end gap-2">
                          <button
                            type="button"
                            onClick={() => scrollCertificates(-1)}
                            aria-label="Scroll certificates left"
                            className="rounded-full border border-gray-200 p-2 text-gray-700 hover:bg-gray-100 dark:border-gray-700 dark:text-gray-200 dark:hover:bg-gray-800"
                          >
                            <ChevronLeft size={18} />
                          </button>
                          <button
                            type="button"
                            onClick={() => scrollCertificates(1)}
                            aria-label="Scroll certificates right"
                            className="rounded-full border border-gray-200 p-2 text-gray-700 hover:bg-gray-100 dark:border-gray-700 dark:text-gray-200 dark:hover:bg-gray-800"
                          >
                            <ChevronRight size={18} />
                          </button>
                        </div>
                      )}
                      <div
                        ref={certificatesScrollerRef}
                        className="flex w-full snap-x snap-mandatory gap-4 overflow-x-auto scroll-smooth pb-2"
                      >
                        {certificatesAvailable.map((certificate, index) => (
                          <article
                            key={certificate.id ?? `${certificate.title}-${index}`}
                            className="w-[min(100%,18rem)] shrink-0 snap-start rounded-xl border border-gray-200 p-4 dark:border-gray-700"
                          >
                            <div className="flex h-full flex-col justify-between gap-4">
                              <div>
                                <h3 className="font-semibold text-gray-900 dark:text-white">
                                  {certificate.title || "Certificate"}
                                </h3>
                                <p className="mt-1 break-words text-sm text-gray-600 dark:text-gray-300">
                                  {certificate.description || "No description provided."}
                                </p>
                              </div>
                              {certificate.id && (
                                <button
                                  type="button"
                                  onClick={() => downloadCertificate(certificate)}
                                  disabled={downloadingCertificateId === certificate.id}
                                  className="inline-flex w-fit items-center justify-center gap-2 rounded-lg border border-blue-200 px-3 py-2 text-sm font-semibold text-blue-700 hover:bg-blue-50 disabled:cursor-wait disabled:opacity-60 dark:border-blue-800 dark:text-blue-300 dark:hover:bg-blue-950/40"
                                >
                                  <Download size={16} />
                                  {downloadingCertificateId === certificate.id ? "Downloading..." : "Download"}
                                </button>
                              )}
                            </div>
                          </article>
                        ))}
                      </div>
                    </>
                  ) : (
                    <p className="text-sm text-gray-500">No certificates have been added.</p>
                  )}
                </div>
              ) : (
                <StatusCard
                  icon={<Award size={21} />}
                  title="Certificates"
                  available={Boolean(certificatesAvailable?.length)}
                  availableText="Certificate records available"
                  unavailableText="No certificate data available"
                />
              )}

            </ProfileSection>

          </div>
        )}


        {/* =================================================
            FEES
        ================================================= */}

        {canSeeFees && (
          <ProfileSection
            icon={<IndianRupee size={21} />}
            title="Fees Information"
            description="Student fee account and payment information"
            contentClassName="min-w-0"
          >
            {canSeeAll ? (
              <div className="space-y-5">
                {feesAccountAvailable ? (
                  <>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      Academic session: {feesAccountAvailable.academicSession || student.academicSession || "-"}
                    </p>
                    <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
                      <FeeSummary label="Total fees" value={feesAccountAvailable.totalFees} />
                      <FeeSummary label="Total paid" value={feesAccountAvailable.totalPaid} />
                      <FeeSummary label="Total dues" value={feesAccountAvailable.totalDues} />
                    </div>
                  </>
                ) : (
                  <p className="text-sm text-gray-500">No fee account is available.</p>
                )}

                <div>
                  <h3 className="mb-3 font-semibold text-gray-900 dark:text-white">Payment history</h3>
                  {Array.isArray(feesPaymentsAvailable) && feesPaymentsAvailable.length > 0 ? (
                    <div className="overflow-x-auto rounded-xl border border-gray-200 dark:border-gray-700">
                      <table className="w-full min-w-[900px] divide-y divide-gray-200 text-left text-sm dark:divide-gray-700">
                        <thead className="bg-gray-50 text-xs uppercase text-gray-500 dark:bg-gray-800">
                          <tr>
                            <th className="px-4 py-3">Session</th>
                            <th className="px-4 py-3">Amount</th>
                            <th className="px-4 py-3">Type</th>
                            <th className="px-4 py-3">Status</th>
                            <th className="px-4 py-3">Transaction ID</th>
                            <th className="px-4 py-3">Submitted</th>
                            <th className="px-4 py-3">Verified</th>
                            <th className="px-4 py-3">Verified by</th>
                            <th className="px-4 py-3">Rejection reason</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                          {feesPaymentsAvailable.map((payment, index) => (
                            <tr key={`${payment.upiTransactionId || payment.submittedAt || "payment"}-${index}`}>
                              <td className="whitespace-nowrap px-4 py-3">{payment.academicSession || "-"}</td>
                              <td className="whitespace-nowrap px-4 py-3">{formatCurrency(payment.amount)}</td>
                              <td className="whitespace-nowrap px-4 py-3">{payment.paymentType || "-"}</td>
                              <td className="whitespace-nowrap px-4 py-3">{payment.status || "-"}</td>
                              <td className="px-4 py-3">{payment.upiTransactionId || "-"}</td>
                              <td className="whitespace-nowrap px-4 py-3">{payment.submittedAt ? FormatDate(payment.submittedAt) : "-"}</td>
                              <td className="whitespace-nowrap px-4 py-3">{payment.verifiedAt ? FormatDate(payment.verifiedAt) : "-"}</td>
                              <td className="whitespace-nowrap px-4 py-3">{payment.verifyByFeesAdmin || "-"}</td>
                              <td className="px-4 py-3">{payment.rejectionReason || "-"}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  ) : (
                    <p className="text-sm text-gray-500">No payment records are available.</p>
                  )}
                </div>
              </div>
            ) : (
              <>
                <StatusCard
                  icon={<IndianRupee size={21} />}
                  title="Fees Account"
                  available={Boolean(feesAccountAvailable)}
                  availableText="Fees account information available"
                  unavailableText="No fees account data available"
                />
                <StatusCard
                  icon={<IndianRupee size={21} />}
                  title="Payment History"
                  available={Boolean(feesPaymentsAvailable?.length)}
                  availableText="Payment records available"
                  unavailableText="No payment data available"
                />
              </>
            )}

          </ProfileSection>
        )}


        {/* =================================================
            DOMAIN ADMIN ACCOUNT INFORMATION
        ================================================= */}

        {canSeeAll && (
          <ProfileSection
            icon={<Clock3 size={21} />}
            title="Account Information"
            description="System account timestamps"
          >

            <Info
              icon={<Clock3 size={17} />}
              label="Account Created"
              value={
                student.createdDateTime
                  ? FormatDate(
                      student.createdDateTime
                    )
                  : "-"
              }
            />

            <Info
              icon={<Clock3 size={17} />}
              label="Last Updated"
              value={
                student.lastUpdateDateTime
                  ? FormatDate(
                      student.lastUpdateDateTime
                    )
                  : "-"
              }
            />

            <Info
              icon={<Clock3 size={17} />}
              label="Last Login"
              value={
                student.lastLoginDateTime
                  ? FormatDate(
                      student.lastLoginDateTime
                    )
                  : "-"
              }
            />

          </ProfileSection>
        )}


        {/* =================================================
            ACCESS SUMMARY
        ================================================= */}

        <section className="
          rounded-3xl
          border
          border-gray-200
          dark:border-gray-800
          bg-white
          dark:bg-gray-900
          p-5
          md:p-6
          shadow-sm
        ">

          <div className="flex items-start gap-3 mb-5">

            <div className="
              h-10
              w-10
              shrink-0
              rounded-xl
              bg-blue-50
              dark:bg-blue-950/50
              text-blue-600
              flex
              items-center
              justify-center
            ">
              <ShieldCheck size={20} />
            </div>

            <div>
              <h2 className="font-bold text-gray-900 dark:text-white">
                Profile Access
              </h2>

              <p className="text-sm text-gray-500 dark:text-gray-400">
                Information available for the current role
              </p>
            </div>

          </div>

          <div className="flex flex-wrap gap-2">

            <AccessBadge
              text="Basic Profile"
              enabled
            />

            <AccessBadge
              text="Academic"
              enabled={canSeeAcademic}
            />

            <AccessBadge
              text="Attendance"
              enabled={canSeeAcademic}
            />

            <AccessBadge
              text="Certificates"
              enabled={canSeeAcademic}
            />

            <AccessBadge
              text="Fees"
              enabled={canSeeFees}
            />

            <AccessBadge
              text="Account Details"
              enabled={canSeeAll}
            />

          </div>

        </section>


        {/* Bottom spacing */}

        <div className="h-4" />

      </div>
    </div>
  );
}


// =============================================================
// COMPONENTS
// =============================================================

function ProfileSection({
  icon,
  title,
  description,
  children,
  contentClassName,
}) {
  return (
    <section className="
      rounded-3xl
      border
      border-gray-200
      dark:border-gray-800
      bg-white
      dark:bg-gray-900
      p-5
      md:p-6
      shadow-sm
    ">

      <div className="
        flex
        items-start
        gap-3
        mb-5
      ">

        <div className="
          h-10
          w-10
          shrink-0
          rounded-xl
          bg-blue-50
          dark:bg-blue-950/50
          text-blue-600
          flex
          items-center
          justify-center
        ">
          {icon}
        </div>

        <div>
          <h2 className="
            text-lg
            font-bold
            text-gray-900
            dark:text-white
          ">
            {title}
          </h2>

          <p className="
            text-sm
            text-gray-500
            dark:text-gray-400
          ">
            {description}
          </p>
        </div>

      </div>

      <div className={contentClassName || "grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3"}>
        {children}
      </div>

    </section>
  );
}


function Info({
  icon,
  label,
  value,
}) {
  return (
    <div className="
      group
      rounded-2xl
      border
      border-gray-100
      dark:border-gray-800
      bg-gray-50
      dark:bg-gray-950/50
      p-4
      hover:border-blue-200
      dark:hover:border-blue-900
      transition
    ">

      <div className="
        flex
        items-center
        gap-2
        mb-2
        text-gray-500
        dark:text-gray-400
      ">

        {icon && (
          <span className="text-blue-600">
            {icon}
          </span>
        )}

        <span className="text-xs font-semibold uppercase tracking-wide">
          {label}
        </span>

      </div>

      <p className="
        text-sm
        md:text-base
        font-semibold
        text-gray-800
        dark:text-gray-100
        break-words
      ">
        {value ?? "-"}
      </p>

    </div>
  );
}


function QuickStat({
  icon,
  label,
  value,
}) {
  return (
    <div className="
      min-w-0
      rounded-2xl
      border
      border-gray-100
      dark:border-gray-800
      bg-gray-50/80
      dark:bg-gray-950/50
      px-3
      py-2.5
    ">

      <div className="
        flex
        items-center
        gap-1.5
        text-gray-500
        dark:text-gray-400
      ">
        <span className="text-blue-600">
          {icon}
        </span>

        <span className="text-[11px] font-semibold">
          {label}
        </span>
      </div>

      <p className="
        mt-1
        text-sm
        font-bold
        truncate
        text-gray-800
        dark:text-gray-100
      ">
        {value || "-"}
      </p>

    </div>
  );
}


function StatusCard({
  icon,
  title,
  available,
  availableText,
  unavailableText,
}) {
  return (
    <div className="
      rounded-2xl
      border
      border-gray-100
      dark:border-gray-800
      bg-gray-50
      dark:bg-gray-950/50
      p-4
    ">

      <div className="flex items-center gap-3">

        <div className="
          h-11
          w-11
          rounded-xl
          bg-white
          dark:bg-gray-900
          border
          border-gray-200
          dark:border-gray-700
          flex
          items-center
          justify-center
          text-blue-600
        ">
          {icon}
        </div>

        <div className="min-w-0">

          <p className="
            font-semibold
            text-gray-800
            dark:text-gray-100
          ">
            {title}
          </p>

          <div className="
            mt-1
            flex
            items-center
            gap-1.5
            text-xs
          ">

            <span
              className={`
                h-2
                w-2
                rounded-full
                ${
                  available
                    ? "bg-emerald-500"
                    : "bg-gray-400"
                }
              `}
            />

            <span className={
              available
                ? "text-emerald-600 dark:text-emerald-400"
                : "text-gray-500"
            }>
              {available
                ? availableText
                : unavailableText}
            </span>

          </div>

        </div>

      </div>

    </div>
  );
}

function AttendanceMetric({ label, value }) {
  return (
    <div className="min-w-0 rounded-xl border border-gray-100 bg-gray-50 px-3 py-3 dark:border-gray-800 dark:bg-gray-950/50">
      <span className="block truncate text-[10px] font-bold uppercase tracking-wide text-gray-500 dark:text-gray-400">
        {label}
      </span>
      <strong className="mt-1 block text-lg font-extrabold text-gray-900 dark:text-white">
        {value}
      </strong>
    </div>
  );
}


function AccessBadge({
  text,
  enabled,
}) {
  return (
    <span
      className={`
        inline-flex
        items-center
        gap-1.5
        rounded-full
        px-3
        py-1.5
        text-xs
        font-bold
        ${
          enabled
            ? `
              bg-emerald-100
              dark:bg-emerald-950/50
              text-emerald-700
              dark:text-emerald-300
            `
            : `
              bg-gray-100
              dark:bg-gray-800
              text-gray-400
              dark:text-gray-500
            `
        }
      `}
    >
      {enabled ? "✓" : "×"}
      {text}
    </span>
  );
}


// =============================================================
// ROLE LABEL
// =============================================================

function formatRole(role) {
  switch (role) {
    case "DOMAIN_ADMIN":
    case "DOMAINADMIN":
      return "Domain Admin";

    case "FEES_ADMIN":
    case "FEESADMIN":
      return "Fees Admin";

    case "SUB_ADMIN":
    case "SUBADMIN":
      return "Sub Admin";

    case "FACULTY":
      return "Faculty";

    case "ADMIN":
      return "Admin";

    default:
      return role || "User";
  }
}

function FeeSummary({ label, value }) {
  return (
    <div className="rounded-xl border border-gray-200 bg-gray-50 p-4 dark:border-gray-700 dark:bg-gray-800">
      <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">{label}</p>
      <p className="mt-2 text-lg font-bold text-gray-900 dark:text-white">{formatCurrency(value)}</p>
    </div>
  );
}

function formatCurrency(value) {
  const amount = Number(value);
  if (value == null || !Number.isFinite(amount)) {
    return "-";
  }


  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 2,
  }).format(amount);
}
import { apiRequest } from "./apiClient";

export const attendanceApi = {

    // ============================================
    // FACULTY
    // ============================================

    getFacultyAssignments() {
        return apiRequest(
            "/api/erp/attendance/faculty/assignments"
        );
    },

    getFacultyStudents(batch, subject) {
        const params = new URLSearchParams({
            batch,
            subject,
        });

        return apiRequest(
            `/api/erp/attendance/faculty/students?${params}`
        );
    },

    markAttendance(data) {
        return apiRequest(
            "/api/erp/attendance/faculty/mark",
            {
                method: "POST",
                body: JSON.stringify(data),
            }
        );
    },


    // ============================================
    // STUDENT
    // ============================================

    getMyAttendance(academicSession) {

        const params = new URLSearchParams({
            academicSession,
        });

        return apiRequest(
            `/api/erp/attendance/student/me?${params}`
        );
    },


    // ============================================
    // SUB ADMIN
    // ============================================

    getSubAdminBatchAttendance(
        batch,
        academicSession
    ) {

        const params = new URLSearchParams({
            batch,
            academicSession,
        });

        return apiRequest(
            `/api/erp/attendance/subadmin/batch?${params}`
        );
    },


    // ============================================
    // DOMAIN ADMIN
    // ============================================

    getAdminBatchAttendance(
        batch,
        academicSession
    ) {

        const params = new URLSearchParams({
            batch,
            academicSession,
        });

        return apiRequest(
            `/api/erp/attendance/admin/batch?${params}`
        );
    },


    deleteAttendance(attendanceId) {

        return apiRequest(
            `/api/erp/attendance/admin/${attendanceId}`,
            {
                method: "DELETE",
            }
        );
    },
};
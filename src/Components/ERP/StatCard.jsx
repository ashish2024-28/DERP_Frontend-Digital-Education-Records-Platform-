import {
    Users,
    GraduationCap,
    BookOpen,
    CalendarCheck,
    ShieldCheck
} from "lucide-react";

const icons = {
    students: Users,
    faculty: GraduationCap,
    courses: BookOpen,
    attendance: CalendarCheck,
    admins: ShieldCheck,
};

export default function StatCard({
    type,
    label,
    value
}) {

    const Icon =
        icons[type] || Users;

    return (
        <div className="erp-stat">

            <div className="erp-stat-top">

                <div className="erp-stat-icon">
                    <Icon size={21} />
                </div>

            </div>

            <div className="erp-stat-label">
                {label}
            </div>

            <div className="erp-stat-value">
                {value ?? 0}
            </div>

        </div>
    );
}
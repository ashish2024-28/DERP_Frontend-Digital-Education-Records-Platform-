import { useParams } from "react-router-dom";
import StudentProfileDashboard from "./StudentProfileDashboard";
import FacultyProfileDashboard from "./FacultyProfileDashboard";
import SubAdminProfileDashboard from "./SubAdminProfileDashboard";
import FeesAdminProfileDashboard from "./FeesAdminProfileDashboard";

const PROFILE_COMPONENTS = {
  student: StudentProfileDashboard,
  faculty: FacultyProfileDashboard,
  subadmin: SubAdminProfileDashboard,
  feesadmin: FeesAdminProfileDashboard,
};

export default function ProfileDashboard() {
  const { userType } = useParams();
  const ProfileComponent = PROFILE_COMPONENTS[userType?.toLowerCase()];

  if (!ProfileComponent) {
    return <div className="p-8 text-center text-gray-600">Unsupported profile type.</div>;
  }

  return <ProfileComponent />;
}

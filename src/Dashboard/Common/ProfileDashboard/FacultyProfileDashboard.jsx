import RoleProfileDashboard from "./RoleProfileDashboard";

const PROFILE_TYPE = {
  label: "Faculty",
  subtitle: "Faculty profile and teaching information",
  listEndpoint: "allFaculty",
  idField: "facultyId",
  idLabel: "Faculty ID",
  profileEndpoint: "faculty",
  quickFields: [
    { key: "course", label: "Course", icon: "book" },
  ],
  sections: [
    {
      title: "Personal Information",
      description: "Basic faculty and contact information",
      icon: "user",
      fields: [
        { key: "name", label: "Full name", icon: "user" },
        { key: "email", label: "Email address", icon: "mail" },
        { key: "mobileNumber", label: "Mobile number", icon: "phone" },
        { key: "role", label: "Role", icon: "badge" },
      ],
    },
    {
      title: "Faculty Information",
      description: "Faculty identification and academic assignment",
      icon: "graduation",
      fields: [
        { key: "facultyId", label: "Faculty ID", icon: "badge" },
        { key: "course", label: "Course", icon: "book" },
        { key: "universityName", label: "University", icon: "building" },
      ],
    },
    {
      title: "Account Information",
      description: "System account timestamps",
      icon: "clock",
      fields: [
        { key: "createdDateTime", label: "Account created", icon: "calendar" },
        { key: "lastUpdateDateTime", label: "Last updated", icon: "clock" },
        { key: "lastLoginDateTime", label: "Last login", icon: "clock" },
      ],
    },
  ],
};

export default function FacultyProfileDashboard() {
  return <RoleProfileDashboard profileType={PROFILE_TYPE} />;
}

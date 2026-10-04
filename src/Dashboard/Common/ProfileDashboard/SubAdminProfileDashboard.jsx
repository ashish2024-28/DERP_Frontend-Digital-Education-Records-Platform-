import RoleProfileDashboard from "./RoleProfileDashboard";

const PROFILE_TYPE = {
  label: "Sub Admin",
  subtitle: "Sub administrator profile and domain information",
  listEndpoint: "allSubAdmin",
  idField: "subAdminId",
  idLabel: "Sub Admin ID",
  profileEndpoint: "subAdmin",
  quickFields: [
    { key: "course", label: "Course", icon: "book" },
  ],
  sections: [
    {
      title: "Personal Information",
      description: "Basic sub-admin and contact information",
      icon: "user",
      fields: [
        { key: "name", label: "Full name", icon: "user" },
        { key: "email", label: "Email address", icon: "mail" },
        { key: "mobileNumber", label: "Mobile number", icon: "phone" },
        { key: "role", label: "Role", icon: "badge" },
      ],
    },
    {
      title: "Sub Admin Information",
      description: "Administrator identification and assignment",
      icon: "graduation",
      fields: [
        { key: "subAdminId", label: "Sub Admin ID", icon: "badge" },
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

export default function SubAdminProfileDashboard() {
  return <RoleProfileDashboard profileType={PROFILE_TYPE} />;
}

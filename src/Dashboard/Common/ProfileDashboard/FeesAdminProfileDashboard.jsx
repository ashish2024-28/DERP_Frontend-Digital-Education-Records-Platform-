import RoleProfileDashboard from "./RoleProfileDashboard";

const PROFILE_TYPE = {
  label: "Fees Admin",
  subtitle: "Fees administrator profile and account information",
  listEndpoint: "allFeesAdmin",
  idField: "feesAdminId",
  idLabel: "Fees Admin ID",
  profileEndpoint: "feesAdmin",
  quickFields: [
    { key: "universityName", label: "University", icon: "building" },
  ],
  sections: [
    {
      title: "Personal Information",
      description: "Basic fees-admin and contact information",
      icon: "user",
      fields: [
        { key: "name", label: "Full name", icon: "user" },
        { key: "email", label: "Email address", icon: "mail" },
        { key: "mobileNumber", label: "Mobile number", icon: "phone" },
        { key: "role", label: "Role", icon: "badge" },
      ],
    },
    {
      title: "Fees Admin Information",
      description: "Fees administration assignment",
      icon: "building",
      fields: [
        { key: "feesAdminId", label: "Fees Admin ID", icon: "badge" },
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

export default function FeesAdminProfileDashboard() {
  return <RoleProfileDashboard profileType={PROFILE_TYPE} />;
}

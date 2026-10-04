import { createElement } from "react";
import { useEffect, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import {
  ArrowLeft,
  BadgeCheck,
  BookOpen,
  Building2,
  CalendarCheck,
  CircleUserRound,
  Clock3,
  GraduationCap,
  Mail,
  Phone,
  ShieldCheck,
  User,
} from "lucide-react";
import FormatDate from "../../../Components/DateTimeFunction/FormatDate";

const FIELD_ICONS = {
  user: User,
  mail: Mail,
  phone: Phone,
  badge: BadgeCheck,
  book: BookOpen,
  graduation: GraduationCap,
  building: Building2,
  calendar: CalendarCheck,
  clock: Clock3,
};

export default function RoleProfileDashboard({ profileType }) {
  const API_BASE = import.meta.env.VITE_API_BASE_URL;
  const { domain, role, userId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadProfile = async () => {
      setLoading(true);
      setError("");

      try {
        const token = localStorage.getItem("token");
        if (!token) {
          throw new Error("Authentication token not found.");
        }

        const headers = {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        };

        let email = location.state?.email;
        if (!email) {
          const listResponse = await fetch(
            `${API_BASE}/${domain}/${role}/${profileType.listEndpoint}`,
            { headers }
          );
          if (!listResponse.ok) {
            throw new Error(`Unable to find ${profileType.label} (${listResponse.status}).`);
          }

          const listPayload = await listResponse.json();
          const records = listPayload?.data ?? listPayload;
          const matchedProfile = (Array.isArray(records) ? records : []).find(
            (record) =>
              String(record?.[profileType.idField] ?? "").toLowerCase() ===
              String(userId ?? "").toLowerCase()
          );
          email = matchedProfile?.email;
        }

        if (!email) {
          throw new Error(`${profileType.label} email could not be found.`);
        }

        const response = await fetch(
          `${API_BASE}/${domain}/${role}/${profileType.profileEndpoint}?email=${encodeURIComponent(email)}`,
          { headers }
        );
        if (response.status === 401) {
          throw new Error("Your session has expired. Please login again.");
        }
        if (response.status === 403) {
          throw new Error(`You are not authorized to view this ${profileType.label.toLowerCase()} profile.`);
        }
        if (!response.ok) {
          throw new Error(`Unable to load ${profileType.label} profile (${response.status}).`);
        }

        const payload = await response.json();
        setProfile(payload?.data ?? payload);
      } catch (loadError) {
        console.error(`${profileType.label} profile error:`, loadError);
        setError(loadError.message || `Unable to load ${profileType.label} profile.`);
      } finally {
        setLoading(false);
      }
    };

    loadProfile();
  }, [API_BASE, domain, role, userId, location.state?.email, profileType]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-8 text-center text-gray-500 dark:bg-gray-950">
        Loading {profileType.label.toLowerCase()} profile...
      </div>
    );
  }

  const backButton = (
    <button
      type="button"
      onClick={() => navigate(-1)}
      className="
        flex h-10 w-10 shrink-0 items-center justify-center rounded-xl
        border border-gray-200 bg-white text-gray-700 transition
        hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-900
        dark:text-gray-200 dark:hover:bg-gray-800
      "
      title="Go back"
      aria-label="Go back"
    >
      <ArrowLeft size={19} />
    </button>
  );

  return (
    <main className="min-h-screen bg-gray-50 p-4 text-gray-800 dark:bg-gray-950 dark:text-gray-100 md:p-6 lg:p-8">
      <div className="mx-auto max-w-7xl space-y-6">
        <header className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            {backButton}
            <div>
              <h1 className="text-xl font-bold text-gray-900 dark:text-white md:text-2xl">
                {profileType.label} Profile
              </h1>
              <p className="text-xs text-gray-500 dark:text-gray-400 md:text-sm">
                {profileType.subtitle}
              </p>
            </div>
          </div>
          <div className="inline-flex items-center gap-2 self-start rounded-full border border-blue-200 bg-blue-50 px-4 py-2 text-xs font-bold text-blue-700 dark:border-blue-900 dark:bg-blue-950/40 dark:text-blue-300 sm:self-auto">
            <ShieldCheck size={15} />
            {profileType.label}
          </div>
        </header>

        {error ? (
          <div role="alert" className="rounded-2xl border border-red-200 bg-red-50 p-5 text-red-700 dark:border-red-900 dark:bg-red-950/30 dark:text-red-300">
            <h2 className="font-bold">Unable to load profile</h2>
            <p className="mt-1 text-sm">{error}</p>
          </div>
        ) : !profile ? (
          <div className="rounded-2xl border border-gray-200 bg-white p-6 text-gray-600 dark:border-gray-800 dark:bg-gray-900">
            {profileType.label} profile not found.
          </div>
        ) : (
          <>
            <section className="overflow-hidden rounded-3xl border border-gray-200 bg-white shadow-sm dark:border-gray-800 dark:bg-gray-900">
              <div className="h-28 bg-gradient-to-r from-blue-600 via-indigo-600 to-violet-600 md:h-36" />
              <div className="px-5 pb-7 md:px-8">
                <div className="-mt-14 flex flex-col gap-5 lg:-mt-16 lg:flex-row lg:items-end lg:justify-between">
                  <div className="flex min-w-0 items-end gap-5">
                    <div className="relative flex h-28 w-28 shrink-0 items-center justify-center overflow-hidden rounded-2xl border-4 border-white bg-gray-100 shadow-lg dark:border-gray-900 dark:bg-gray-800 md:h-32 md:w-32">
                    {profile.profilePic ? (
                      <img
                        src={`${API_BASE}/${profile.profilePic}`}
                        alt={profile.name || profileType.label}
                        className="h-full w-full object-cover"
                        onError={(event) => {
                          event.currentTarget.src = "/default.png";
                        }}
                      />
                    ) : (
                      <CircleUserRound size={72} className="text-gray-400" />
                    )}
                  </div>
                    <div className="min-w-0 pb-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <h2 className="break-words text-xl font-bold text-gray-900 dark:text-white md:text-2xl">
                          {profile.name || `${profileType.label}`}
                        </h2>
                        <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2.5 py-1 text-xs font-semibold text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300">
                          <BadgeCheck size={13} />
                          {profileType.label}
                        </span>
                      </div>
                      <p className="mt-1 break-all text-sm text-gray-500 dark:text-gray-400">
                        {profileType.idLabel}:{" "}
                        <span className="font-semibold text-gray-700 dark:text-gray-200">
                          {profile[profileType.idField] || userId || "-"}
                        </span>
                      </p>
                    </div>
                  </div>

                  {profileType.quickFields?.length > 0 && (
                    <div className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:max-w-2xl lg:flex-1">
                      {profileType.quickFields.map((field) => (
                        <QuickStat
                          key={field.key}
                          field={field}
                          value={profile[field.key]}
                        />
                      ))}
                    </div>
                  )}
                </div>

                <div className="mt-7 flex flex-col gap-3 border-t border-gray-100 pt-5 text-sm text-gray-600 dark:border-gray-800 dark:text-gray-400 md:flex-row md:items-center md:gap-6">
                  <ContactItem icon={Mail} value={profile.email} />
                  <ContactItem icon={Phone} value={profile.mobileNumber} />
                </div>
              </div>
            </section>

            {profileType.sections.map((section) => {
              const visibleFields = section.fields.filter(
                (field) => profile[field.key] != null && profile[field.key] !== ""
              );
              if (visibleFields.length === 0) {
                return null;
              }

              return (
                <section
                  key={section.title}
                  className="rounded-3xl border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-800 dark:bg-gray-900 md:p-6"
                >
                  <div className="mb-5 flex items-start gap-3">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-600 dark:bg-blue-950/50">
                      {renderIcon(section.icon, 21)}
                    </div>
                    <div>
                      <h2 className="text-lg font-bold text-gray-900 dark:text-white">
                        {section.title}
                      </h2>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        {section.description}
                      </p>
                    </div>
                  </div>
                  <dl className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
                    {visibleFields.map((field) => (
                      <div
                        key={field.key}
                        className="group min-w-0 rounded-2xl border border-gray-100 bg-gray-50 p-4 transition hover:border-blue-200 dark:border-gray-800 dark:bg-gray-950/50 dark:hover:border-blue-900"
                      >
                        <div className="mb-2 flex items-center gap-2 text-gray-500 dark:text-gray-400">
                          {renderIcon(field.icon, 16)}
                          <dt className="text-xs font-semibold uppercase tracking-wide">
                            {field.label}
                          </dt>
                        </div>
                        <dd className="break-words text-sm font-semibold text-gray-800 dark:text-gray-100 md:text-base">
                          {formatField(profile[field.key], field)}
                        </dd>
                      </div>
                    ))}
                  </dl>
                </section>
              );
            })}
          </>
        )}
      </div>
    </main>
  );
}

function renderIcon(iconName, size) {
  const Icon = FIELD_ICONS[iconName] || BadgeCheck;
  return createElement(Icon, { size });
}

function formatField(value, field) {
  if (field.format) {
    return field.format(value);
  }
  if (field.key.endsWith("DateTime")) {
    return FormatDate(value);
  }
  return String(value);
}

function QuickStat({ field, value }) {
  return (
    <div className="min-w-0 rounded-2xl border border-gray-100 bg-gray-50/80 px-3 py-2.5 dark:border-gray-800 dark:bg-gray-950/50">
      <div className="flex items-center gap-1.5 text-gray-500 dark:text-gray-400">
        <span className="text-blue-600">{renderIcon(field.icon, 17)}</span>
        <span className="text-[11px] font-semibold">{field.label}</span>
      </div>
      <p className="mt-1 truncate text-sm font-bold text-gray-800 dark:text-gray-100">
        {value || "-"}
      </p>
    </div>
  );
}

function ContactItem({ icon: Icon, value }) {
  if (!value) {
    return null;
  }

  return (
    <div className="flex min-w-0 items-center gap-2">
    {createElement(Icon, { size: 16, className: "shrink-0 text-blue-600" })}
      <span className="break-all">{value}</span>
    </div>
  );
}

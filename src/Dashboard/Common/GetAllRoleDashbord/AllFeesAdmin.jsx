import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  ChevronDown,
  Eye,
  EyeOff,
  Mail,
  Phone,
  Shield,
  UserRound,
  Users,
} from "lucide-react";
import FormatDate from "../../../Components/DateTimeFunction/FormatDate";

export default function AllFeesAdmin() {
  const API_BASE = import.meta.env.VITE_API_BASE_URL;

  const { domain } = useParams();
  const navigate = useNavigate();

  const role = localStorage.getItem("role");

  const [feesAdmins, setFeesAdmins] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [isUniversityOpen, setIsUniversityOpen] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(true);

  // ─────────────────────────────────────────────────────────────
  // FETCH FEES ADMINS
  // ─────────────────────────────────────────────────────────────
  useEffect(() => {
    fetchAllFeesAdmins();
  }, [domain]);

  const fetchAllFeesAdmins = async () => {
    try {
      setLoading(true);

      const token = localStorage.getItem("token");

      const response = await fetch(
        `${API_BASE}/${domain}/${role}/allFeesAdmin`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      const data = await response.json();

      const list = Array.isArray(data)
        ? data
        : Array.isArray(data?.data)
        ? data.data
        : [];

      setFeesAdmins(list);
    } catch (error) {
      console.error("Error fetching Fees Admins:", error);

      alert("Session expired. Please login again.");

      localStorage.clear();
      // navigate(`/${domain}/login`);
    } finally {
      setLoading(false);
    }
  };

  // ─────────────────────────────────────────────────────────────
  // SEARCH
  // ─────────────────────────────────────────────────────────────
  const filteredFeesAdmins = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();

    if (!query) {
      return feesAdmins;
    }

    return feesAdmins.filter((admin) => {
      return (
        admin.name?.toLowerCase().includes(query) ||
        admin.feesAdminId?.toLowerCase().includes(query) ||
        admin.email?.toLowerCase().includes(query) ||
        admin.mobileNumber?.toLowerCase().includes(query) ||
        admin.universityName?.toLowerCase().includes(query)
      );
    });
  }, [feesAdmins, searchQuery]);

  // ─────────────────────────────────────────────────────────────
  // GET UNIVERSITY NAME
  //
  // If all Fees Admins belong to one university, show ONE
  // university section.
  // ─────────────────────────────────────────────────────────────
  const universityName = useMemo(() => {
    if (filteredFeesAdmins.length === 0) {
      return "University";
    }

    const firstUniversity =
      filteredFeesAdmins[0]?.universityName?.trim();

    return firstUniversity || "Unknown University";
  }, [filteredFeesAdmins]);

  // ─────────────────────────────────────────────────────────────
  // EMPTY / LOADING
  // ─────────────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="text-sm text-gray-500 dark:text-gray-400">
          Loading Fees Admins...
        </div>
      </div>
    );
  }

  return (
    <div className="w-full">
      {/* =========================================================
          PAGE HEADER
      ========================================================= */}
      <div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-orange-600 shadow-sm">
            <Shield size={21} className="text-white" />
          </div>

          <div>
            <h1 className="text-xl font-bold text-gray-800 dark:text-gray-100 sm:text-2xl">
              Fees Admins
            </h1>

            <p className="mt-0.5 text-xs text-gray-500 dark:text-gray-400">
              {filteredFeesAdmins.length}{" "}
              {filteredFeesAdmins.length === 1
                ? "Fees Admin"
                : "Fees Admins"}
            </p>
          </div>
        </div>

        {/* SEARCH */}
        <div className="relative w-full lg:w-96">
          <UserRound
            size={17}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
          />

          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search Fees Admin..."
            className="
              w-full rounded-xl border border-gray-200
              bg-white py-2.5 pl-10 pr-4 text-sm
              text-gray-700 outline-none
              transition
              focus:border-orange-400
              focus:ring-2 focus:ring-orange-100
              dark:border-gray-700
              dark:bg-gray-800
              dark:text-gray-100
              dark:focus:border-orange-500
              dark:focus:ring-orange-900/30
            "
          />
        </div>
      </div>

      {/* =========================================================
          EMPTY STATE
      ========================================================= */}
      {filteredFeesAdmins.length === 0 ? (
        <div
          className="
            rounded-2xl border border-dashed border-gray-300
            bg-white px-6 py-16 text-center
            dark:border-gray-700 dark:bg-gray-900
          "
        >
          <Users
            size={40}
            className="mx-auto mb-3 text-gray-300 dark:text-gray-600"
          />

          <h3 className="font-semibold text-gray-700 dark:text-gray-200">
            No Fees Admins Found
          </h3>

          <p className="mt-1 text-sm text-gray-400">
            {searchQuery
              ? "Try a different search."
              : "There are no Fees Admins available."}
          </p>
        </div>
      ) : (
        /* =======================================================
           ONE UNIVERSITY PANEL
        ======================================================= */
        <div
          className="
            overflow-hidden rounded-2xl
            border border-orange-200
            bg-white shadow-sm
            dark:border-gray-700
            dark:bg-gray-900
          "
        >
          {/* UNIVERSITY HEADER */}
          <button
            type="button"
            onClick={() =>
              setIsUniversityOpen((previous) => !previous)
            }
            className="
              flex w-full items-center justify-between
              bg-orange-50 px-4 py-4
              text-left transition
              hover:bg-orange-100
              dark:bg-orange-950/30
              dark:hover:bg-orange-950/50
              sm:px-5
            "
          >
            <div className="flex min-w-0 items-center gap-3">
              <ChevronDown
                size={19}
                className={`
                  shrink-0 text-orange-600
                  transition-transform duration-200
                  ${isUniversityOpen ? "" : "-rotate-90"}
                `}
              />

              <div
                className="
                  flex h-9 w-9 shrink-0 items-center
                  justify-center rounded-lg
                  bg-orange-600 text-white
                "
              >
                <span className="text-base">🏫</span>
              </div>

              <div className="min-w-0">
                <h2 className="truncate text-sm font-bold text-orange-800 dark:text-orange-300 sm:text-base">
                  {universityName}
                </h2>

                <p className="text-xs text-orange-600/80 dark:text-orange-400">
                  Fees Administration
                </p>
              </div>
            </div>

            <span
              className="
                ml-3 shrink-0 rounded-full
                bg-orange-600 px-3 py-1
                text-xs font-bold text-white
              "
            >
              {filteredFeesAdmins.length}{" "}
              {filteredFeesAdmins.length === 1
                ? "Fees Admin"
                : "Fees Admins"}
            </span>
          </button>

          {/* =====================================================
              FEES ADMIN TABLE
          ===================================================== */}
          {isUniversityOpen && (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[900px] text-sm">
                <thead>
                  <tr
                    className="
                      border-b border-gray-200
                      bg-gray-50 text-xs uppercase
                      tracking-wide text-gray-500
                      dark:border-gray-700
                      dark:bg-gray-800/70
                      dark:text-gray-400
                    "
                  >
                    <th className="w-14 px-4 py-3 text-left">
                      #
                    </th>

                    <th className="px-4 py-3 text-left">
                      Fees Admin
                    </th>

                    <th className="px-4 py-3 text-left">
                      Contact
                    </th>

                    <th className="px-4 py-3 text-left">
                      Mobile
                    </th>

                    {role === "DOMAIN_ADMIN" && (
                      <>
                        <th className="px-4 py-3 text-left">
                          Created
                        </th>

                        <th className="px-4 py-3 text-left">
                          Last Login
                        </th>

                        <th className="px-4 py-3 text-left">
                          Password
                          <button
                            type="button"
                            title={
                              showPassword
                                ? "Hide passwords"
                                : "Show passwords"
                            }
                            onClick={(e) => {
                              e.stopPropagation();
                              setShowPassword(
                                (previous) => !previous
                              );
                            }}
                            className="
                              ml-2 inline-flex
                              rounded p-1
                              hover:bg-gray-200
                              dark:hover:bg-gray-700
                            "
                          >
                            {showPassword ? (
                              <EyeOff size={14} />
                            ) : (
                              <Eye size={14} />
                            )}
                          </button>
                        </th>
                      </>
                    )}
                  </tr>
                </thead>

                <tbody>
                  {filteredFeesAdmins.map((feesAdmin, index) => (
                    <tr
                      key={
                        feesAdmin.feesAdminId ||
                        `${feesAdmin.email}-${index}`
                      }
                      className="
                        border-b border-gray-100
                        transition-colors
                        last:border-b-0
                        hover:bg-orange-50/50
                        dark:border-gray-800
                        dark:hover:bg-gray-800/60
                      "
                    >
                      {/* NUMBER */}
                      <td className="px-4 py-4 text-gray-400">
                        {index + 1}
                      </td>

                      {/* FEES ADMIN */}
                      <td className="px-4 py-4">
                        <div className="flex items-center gap-3">
                          {/* PROFILE */}
                          {feesAdmin.profilePic ? (
                            <img
                              src={feesAdmin.profilePic}
                              alt={feesAdmin.name || "Fees Admin"}
                              className="
                                h-10 w-10 shrink-0
                                rounded-full object-cover
                                ring-2 ring-orange-100
                                dark:ring-orange-900/40
                              "
                            />
                          ) : (
                            <div
                              className="
                                flex h-10 w-10 shrink-0
                                items-center justify-center
                                rounded-full
                                bg-orange-100
                                text-orange-700
                                dark:bg-orange-900/40
                                dark:text-orange-300
                              "
                            >
                              <UserRound size={18} />
                            </div>
                          )}

                          <div className="min-w-0">
                            <div className="font-semibold text-gray-800 dark:text-gray-100">
                              {feesAdmin.name || "-"}
                            </div>

                            <div className="mt-0.5 font-mono text-xs text-gray-400">
                              {feesAdmin.feesAdminId || "-"}
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* EMAIL */}
                      <td className="px-4 py-4">
                        <div className="flex items-center gap-2 text-gray-600 dark:text-gray-300">
                          <Mail
                            size={15}
                            className="shrink-0 text-gray-400"
                          />

                          <span className="break-all">
                            {feesAdmin.email || "-"}
                          </span>
                        </div>
                      </td>

                      {/* MOBILE */}
                      <td className="px-4 py-4">
                        <div className="flex items-center gap-2 text-gray-600 dark:text-gray-300">
                          <Phone
                            size={15}
                            className="shrink-0 text-gray-400"
                          />

                          <span>
                            {feesAdmin.mobileNumber || "-"}
                          </span>
                        </div>
                      </td>

                      {/* CREATED */}
                      {role === "DOMAIN_ADMIN" && (
                        <>
                          <td className="px-4 py-4 text-xs text-gray-500 dark:text-gray-400">
                            {feesAdmin.createdDateTime
                              ? FormatDate(
                                  feesAdmin.createdDateTime
                                )
                              : "-"}
                          </td>

                          {/* LAST LOGIN */}
                          <td className="px-4 py-4 text-xs text-gray-500 dark:text-gray-400">
                            {feesAdmin.lastLoginDateTime
                              ? FormatDate(
                                  feesAdmin.lastLoginDateTime
                                )
                              : "Never"}
                          </td>

                          {/* PASSWORD */}
                          <td className="px-4 py-4 font-mono text-xs text-gray-500 dark:text-gray-400">
                            {showPassword
                              ? feesAdmin.password || "-"
                              : "••••••••"}
                          </td>
                        </>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

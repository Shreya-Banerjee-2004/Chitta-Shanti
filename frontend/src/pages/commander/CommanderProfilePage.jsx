import { useEffect, useState } from "react";

import {
  BadgeCheck,
  Building2,
  Check,
  LockKeyhole,
  Pencil,
  ShieldCheck,
  UserRound,
} from "lucide-react";

import Navbar from "../../components/common/Navbar";
import { getCurrentUser } from "../../api/authApi";
import { getAuthToken } from "../../utils/authToken";

const DEFAULT_PROFILE = {
  username: "",
  fullName: "",
  role: "",
  unitId: "",
  rank: "Not provided",
};

export default function CommanderProfilePage() {
  const [profile, setProfile] = useState(DEFAULT_PROFILE);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadProfile() {
      try {
        setLoading(true);
        setError("");

        const token = getAuthToken();

        if (!token) {
          throw new Error("No authentication token found.");
        }

        const user = await getCurrentUser(token);

        setProfile({
          username: user.user_id,
          fullName: user.full_name,
          role: user.role,
          unitId: user.unit_id,
          rank: "Not provided",
        });
      } catch (err) {
        console.error("Failed to load commander profile:", err);
        setError(
          err?.message || "Unable to load your profile."
        );
      } finally {
        setLoading(false);
      }
    }

    loadProfile();
  }, []);

  const initials = getInitials(profile.fullName);

  return (
    <div className="min-h-screen bg-[#fff5f8]">
      <Navbar role="commander" />

      <main
        className="
          min-h-screen
          ml-[265px]
          px-5
          py-8
          sm:px-8
          lg:px-12
          xl:px-14
        "
      >
        <div className="mx-auto w-full max-w-[1100px]">

          {/* Page Header */}
          <div className="mb-7 text-center">
            <div className="flex items-center justify-center gap-3">
              <UserRound
                size={27}
                strokeWidth={2}
                className="text-[#d12b63]"
              />

              <h1
                className="
                  text-3xl
                  font-semibold
                  uppercase
                  tracking-[0.12em]
                  text-[#172033]
                  sm:text-4xl
                "
              >
                Profile
              </h1>
            </div>

            <p className="mt-3 text-sm text-[#858b97] sm:text-base">
              Your command account, unit details & access information
            </p>
          </div>

          {/* Error */}
          {error && (
            <div
              className="
                mb-6
                rounded-2xl
                border
                border-red-200
                bg-red-50
                px-5
                py-4
                text-sm
                text-red-700
              "
            >
              {error}
            </div>
          )}

          {/* Profile Identity Card */}
          <section
            className="
              rounded-[28px]
              border
              border-[#f0d2de]
              bg-gradient-to-r
              from-[#fde8ef]
              to-[#fff1f5]
              p-5
              shadow-[0_10px_30px_rgba(118,36,63,0.06)]
              sm:p-7
            "
          >
            {/* Top row */}
            <div className="flex items-center justify-between gap-4">
              <div
                className="
                  inline-flex
                  items-center
                  gap-2
                  rounded-full
                  border
                  border-[#d8ead9]
                  bg-white
                  px-3
                  py-1.5
                  text-xs
                  font-semibold
                  text-[#477a47]
                  shadow-sm
                "
              >
                <ShieldCheck size={14} />
                Verified Account
              </div>

              <button
                type="button"
                className="
                  inline-flex
                  items-center
                  gap-2
                  rounded-xl
                  bg-white
                  px-4
                  py-2.5
                  text-xs
                  font-semibold
                  text-[#a52252]
                  shadow-sm
                  transition
                  hover:bg-[#fff8fa]
                  active:scale-[0.98]
                "
              >
                <Pencil size={15} />
                Edit Profile
              </button>
            </div>

            {/* Identity */}
            <div className="mt-7 flex flex-col gap-5 sm:flex-row sm:items-center">

              {/* Avatar */}
              <div
                className="
                  relative
                  flex
                  h-[104px]
                  w-[104px]
                  shrink-0
                  items-center
                  justify-center
                  rounded-full
                  border-[4px]
                  border-white
                  bg-gradient-to-br
                  from-[#df6389]
                  to-[#c51f59]
                  text-3xl
                  font-semibold
                  text-white
                  shadow-[0_5px_15px_rgba(197,31,89,0.18)]
                "
              >
                {loading ? "..." : initials}

                <span
                  className="
                    absolute
                    bottom-1
                    right-1
                    h-6
                    w-6
                    rounded-full
                    border-[3px]
                    border-white
                    bg-[#5b9b5b]
                  "
                />
              </div>

              {/* Identity information */}
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <h2 className="text-2xl font-semibold text-[#172033] sm:text-3xl">
                    {loading ? "Loading..." : profile.fullName}
                  </h2>

                  {!loading && (
                    <span
                      className="
                        rounded-full
                        bg-[#d12b63]
                        px-3
                        py-1
                        text-xs
                        font-semibold
                        text-white
                      "
                    >
                      Commander
                    </span>
                  )}
                </div>

                <p className="mt-2 text-sm text-[#68758a]">
                  Personnel ID:{" "}
                  <span className="font-semibold text-[#3b4658]">
                    {loading ? "—" : profile.username}
                  </span>
                </p>

                <div className="mt-4 flex flex-wrap gap-2">
                  <ProfilePill
                    icon={Building2}
                    text={loading ? "Loading unit..." : profile.unitId}
                  />

                  <ProfilePill
                    icon={BadgeCheck}
                    text={profile.rank}
                  />
                </div>
              </div>
            </div>
          </section>

          {/* Account Details + Access Information */}
          <div className="mt-6 grid gap-6 lg:grid-cols-2">

            <AccountDetails profile={profile} />

            <AccessInformation />
          </div>
        </div>
      </main>
    </div>
  );
}


/* =====================================================
   Profile Pill
===================================================== */

function ProfilePill({ icon: Icon, text }) {
  return (
    <div
      className="
        inline-flex
        items-center
        gap-2
        rounded-full
        bg-white
        px-3
        py-2
        text-xs
        font-medium
        text-[#68758a]
        shadow-sm
      "
    >
      <Icon
        size={14}
        strokeWidth={2}
        className="text-[#68758a]"
      />

      {text || "Not provided"}
    </div>
  );
}


/* =====================================================
   Account Details
===================================================== */

function AccountDetails({ profile }) {
  return (
    <section
      className="
        rounded-[26px]
        border
        border-[#f0dce3]
        bg-white
        p-6
        shadow-[0_8px_25px_rgba(118,36,63,0.05)]
      "
    >
      <div className="flex items-center gap-3">
        <div
          className="
            flex
            h-10
            w-10
            items-center
            justify-center
            rounded-xl
            bg-[#fff0f4]
          "
        >
          <UserRound
            size={21}
            className="text-[#d12b63]"
          />
        </div>

        <h2 className="text-lg font-semibold text-[#172033]">
          Account Details
        </h2>
      </div>

      <div className="mt-5 divide-y divide-[#f1e6ea]">
        <DetailRow
          label="Username"
          value={profile.username}
        />

        <DetailRow
          label="Full Name"
          value={profile.fullName}
        />

        <DetailRow
          label="Rank / Designation"
          value={profile.rank}
        />

        <DetailRow
          label="Role"
          value="Commander"
        />

        <DetailRow
          label="Unit ID"
          value={profile.unitId}
        />

        <div className="flex items-center justify-between gap-4 py-4">
          <div className="flex items-center gap-2">
            <LockKeyhole
              size={16}
              className="text-[#9da0a8]"
            />

            <span className="text-sm text-[#858b97]">
              Password
            </span>
          </div>

          <span className="text-sm font-medium text-[#858b97]">
            ••••••••
          </span>
        </div>
      </div>
    </section>
  );
}


/* =====================================================
   Commander Access Information
===================================================== */

function AccessInformation() {
  return (
    <section
      className="
        rounded-[26px]
        border
        border-[#f0dce3]
        bg-white
        p-6
        shadow-[0_8px_25px_rgba(118,36,63,0.05)]
      "
    >
      <div className="flex items-center gap-3">
        <div
          className="
            flex
            h-10
            w-10
            items-center
            justify-center
            rounded-xl
            bg-[#edf7ee]
          "
        >
          <ShieldCheck
            size={21}
            className="text-[#5c9561]"
          />
        </div>

        <h2 className="text-lg font-semibold text-[#172033]">
          Command Access
        </h2>
      </div>

      <div className="mt-5 space-y-4">
        <AccessItem>
          You can view personnel readiness information
          available to your assigned command unit.
        </AccessItem>

        <AccessItem>
          Personnel are represented using anonymized IDs
          in the command readiness view.
        </AccessItem>

        <AccessItem>
          Detailed medical and assessment information is
          restricted from the command dashboard.
        </AccessItem>

        <AccessItem>
          Your account access is determined by your assigned
          commander role and unit.
        </AccessItem>
      </div>
    </section>
  );
}


/* =====================================================
   Access Item
===================================================== */

function AccessItem({ children }) {
  return (
    <div className="flex items-start gap-3">
      <Check
        size={17}
        strokeWidth={2.5}
        className="mt-0.5 shrink-0 text-[#68758a]"
      />

      <p className="text-sm leading-6 text-[#68758a]">
        {children}
      </p>
    </div>
  );
}


/* =====================================================
   Detail Row
===================================================== */

function DetailRow({ label, value }) {
  return (
    <div className="flex items-center justify-between gap-5 py-4">
      <span className="text-sm text-[#9da0a8]">
        {label}
      </span>

      <span className="text-right text-sm font-semibold text-[#3b4658]">
        {value || "Not provided"}
      </span>
    </div>
  );
}


/* =====================================================
   Helpers
===================================================== */

function getInitials(name) {
  if (!name) {
    return "CS";
  }

  const parts = name.trim().split(/\s+/);

  if (parts.length === 1) {
    return parts[0].slice(0, 2).toUpperCase();
  }

  return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
}
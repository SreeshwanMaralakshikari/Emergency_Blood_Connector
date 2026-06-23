//view-only profile page — shows all user info cleanly

import { Link } from "react-router";
import { useSelector } from "react-redux";
import { selectUser, selectRole } from "../../store/authSlice";
import {
  pageBackground, pageWrapper, pageTitleClass, bodyText,
  divider, primaryBtn, secondaryBtn,
  getLevelClass, getRoleClass, availableClass, unavailableClass,
  detailGrid, detailLabel, detailValue,
  avatarLg, pointsPill,
} from "../../styles/common";
import { formatDate } from "../../utils/formatDate";

export default function Profile() {
  const user = useSelector(selectUser);
  const role = useSelector(selectRole);

  if (!user) return null;

  const initials = `${user.firstName?.[0] || ""}${user.lastName?.[0] || ""}`.toUpperCase();
  const isDonor  = role === "DONOR";

  return (
    <div className={pageBackground}>
      <div className={pageWrapper}>

        {/* Header */}
        <div className="mb-10">
          <p className="text-[#c0152a] text-xs font-bold uppercase tracking-widest mb-2">
            Account
          </p>
          <h1 className={pageTitleClass}>My profile</h1>
          <p className={`${bodyText} mt-2`}>
            Your personal information and account details.
          </p>
        </div>

        {/* Profile card */}
        <div className="bg-[#f4f4f4] rounded-2xl p-8 mb-8">
          <div className="flex flex-col sm:flex-row sm:items-start gap-6">

            {/* Avatar */}
            {user.profileImageUrl ? (
              <img
                src={user.profileImageUrl}
                alt={`${user.firstName} ${user.lastName}`}
                className="w-20 h-20 rounded-full object-cover border-2 border-[#e4e4e4] shrink-0"
              />
            ) : (
              <div className={`${avatarLg} !w-20 !h-20 !text-2xl shrink-0`}>
                {initials}
              </div>
            )}

            {/* Name + badges */}
            <div className="flex flex-col gap-2 flex-1">
              <h2 className="text-2xl font-bold text-[#1a1a1a] tracking-tight">
                {user.firstName} {user.lastName}
              </h2>
              <div className="flex items-center gap-2 flex-wrap">
                <span className={getRoleClass(user.role)}>{user.role}</span>
                {isDonor && user.donorLevel && (
                  <span className={getLevelClass(user.donorLevel)}>{user.donorLevel}</span>
                )}
                {isDonor && (
                  <span className={user.isAvailable ? availableClass : unavailableClass}>
                    {user.isAvailable ? "Available" : "Unavailable"}
                  </span>
                )}
                {isDonor && user.totalPoints !== undefined && (
                  <span className={pointsPill}>{user.totalPoints} pts</span>
                )}
              </div>
              <p className="text-xs text-[#9e9e9e] mt-0.5">
                Member since {formatDate(user.createdAt)}
              </p>
            </div>

            {/* Edit button */}
            <Link to="/profile/edit" className={`${primaryBtn} sm:self-start`}>
              Edit profile
            </Link>
          </div>
        </div>

        {/* Details grid */}
        <h2 className="text-base font-bold text-[#1a1a1a] mb-4 tracking-tight">
          Personal information
        </h2>
        <div className={`${detailGrid} mb-10`}>
          <div>
            <p className={detailLabel}>First name</p>
            <p className={detailValue}>{user.firstName}</p>
          </div>
          <div>
            <p className={detailLabel}>Last name</p>
            <p className={detailValue}>{user.lastName}</p>
          </div>
          <div>
            <p className={detailLabel}>Email address</p>
            <p className={detailValue}>{user.email}</p>
          </div>
          <div>
            <p className={detailLabel}>Phone number</p>
            <p className={detailValue}>{user.phoneNumber}</p>
          </div>
          <div>
            <p className={detailLabel}>Blood group</p>
            <p className={detailValue}>{user.bloodGroup}</p>
          </div>
          <div>
            <p className={detailLabel}>State</p>
            <p className={detailValue}>{user.state}</p>
          </div>
          <div>
            <p className={detailLabel}>Role</p>
            <p className={detailValue}>{user.role}</p>
          </div>
          <div>
            <p className={detailLabel}>Account status</p>
            <p className={detailValue}>{user.isUserActive ? "Active" : "Deactivated"}</p>
          </div>
        </div>

        {/* Donor-only stats */}
        {isDonor && (
          <>
            <div className={divider} />
            <h2 className="text-base font-bold text-[#1a1a1a] mb-4 tracking-tight">
              Donor stats
            </h2>
            <div className={`${detailGrid} mb-10`}>
              <div>
                <p className={detailLabel}>Donor level</p>
                <p className={detailValue}>{user.donorLevel || "Iron"}</p>
              </div>
              <div>
                <p className={detailLabel}>Total points</p>
                <p className={detailValue}>{user.totalPoints ?? 0}</p>
              </div>
              <div>
                <p className={detailLabel}>Donations count</p>
                <p className={detailValue}>{user.donationsCount ?? 0}</p>
              </div>
              <div>
                <p className={detailLabel}>Badges earned</p>
                <p className={detailValue}>{user.badges?.length ?? 0}</p>
              </div>
              <div>
                <p className={detailLabel}>Last donation</p>
                <p className={detailValue}>
                  {user.lastDonationDate ? formatDate(user.lastDonationDate) : "—"}
                </p>
              </div>
              <div>
                <p className={detailLabel}>Next eligible date</p>
                <p className={detailValue}>
                  {user.nextEligibleDonationDate
                    ? formatDate(user.nextEligibleDonationDate)
                    : "Eligible now"}
                </p>
              </div>
            </div>
          </>
        )}

        <div className={divider} />

        {/* Actions */}
        <div className="flex gap-3 flex-wrap">
          <Link to="/profile/edit"            className={primaryBtn}>Edit profile</Link>
          <Link to="/profile/change-password" className={secondaryBtn}>Change password</Link>
        </div>

      </div>
    </div>
  );
}

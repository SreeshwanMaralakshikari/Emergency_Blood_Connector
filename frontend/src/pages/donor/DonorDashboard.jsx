// src/pages/donor/DonorDashboard.jsx

import { useEffect, useState } from "react";
import { Link } from "react-router";
import { useSelector } from "react-redux";
import axiosInstance from "../../api/axiosInstance";
import { selectUser } from "../../store/authSlice";
import {
  pageBackground, pageWrapper, pageTitleClass, bodyText, mutedText,
  sectionHeader, sectionTitle, divider, errorClass, loadingClass,
  dashStatsGrid, dashStatCard, dashStatCardAccent, dashStatValue,
  dashStatValueAccent, dashStatLabel, avatarLg, getLevelClass,
  availableClass, unavailableClass, primaryBtn, secondaryBtn, pointsPill,
} from "../../styles/common";
import { formatDate } from "../../utils/formatDate";

function StatCard({ label, value, accent }) {
  return (
    <div className={accent ? dashStatCardAccent : dashStatCard}>
      <p className={accent ? dashStatValueAccent : dashStatValue}>{value ?? "—"}</p>
      <p className={dashStatLabel}>{label}</p>
    </div>
  );
}

export default function DonorDashboard() {
  const user                      = useSelector(selectUser);
  const [dashboard, setDashboard] = useState(null);
  const [rank, setRank]           = useState(null);
  const [loading, setLoading]     = useState(true);
  const [error, setError]         = useState("");

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        const [dashRes, rankRes] = await Promise.all([
          axiosInstance.get("/donor-api/dashboard"),
          axiosInstance.get("/donor-api/my-rank"),
        ]);
        setDashboard(dashRes.data?.payload);
        setRank(rankRes.data?.payload);
      } catch (err) {
        setError(err.response?.data?.message || "Failed to load dashboard.");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const initials = user
    ? `${user.firstName?.[0] || ""}${user.lastName?.[0] || ""}`.toUpperCase()
    : "";

  const isAvailable = user?.isAvailable ?? false;

  if (loading) return <div className={pageBackground}><p className={`${loadingClass} pt-32`}>Loading dashboard…</p></div>;
  if (error)   return <div className={pageBackground}><div className={`${errorClass} max-w-xl mx-auto mt-20`}>{error}</div></div>;

  const d = dashboard || {};

  return (
    <div className={pageBackground}>
      <div className={pageWrapper}>

        {/* ── Profile strip ─────────────────────── */}
        <div className="flex items-start gap-5 mb-10">
          <div className={avatarLg}>{initials}</div>
          <div className="flex flex-col gap-1.5">
            <h1 className="text-2xl font-bold text-[#1a1a1a] tracking-tight">
              {user?.firstName} {user?.lastName}
            </h1>
            <div className="flex items-center gap-2 flex-wrap">
              {/* Donor level badge */}
              {d.donorLevel && (
                <span className={getLevelClass(d.donorLevel)}>{d.donorLevel}</span>
              )}
              {/* Availability */}
              <span className={isAvailable ? availableClass : unavailableClass}>
                {isAvailable ? "Available" : "Unavailable"}
              </span>
              {/* Points pill */}
              {d.totalPoints !== undefined && (
                <span className={pointsPill}>{d.totalPoints} pts</span>
              )}
            </div>
            <p className="text-xs text-[#9e9e9e]">{user?.bloodGroup} · {user?.state}</p>
          </div>
        </div>

        {/* ── Stats strip ───────────────────────── */}
        <div className={`${dashStatsGrid} mb-10`}>
          <StatCard label="Total donations"   value={d.donationsCount}  accent />
          <StatCard label="Total points"      value={d.totalPoints} />
          <StatCard label="Rank"              value={rank?.rank ? `#${rank.rank}` : "—"} />
          <StatCard label="Donor level"       value={d.donorLevel} />
          <StatCard label="Badges earned"     value={d.badges?.length ?? 0} />
        </div>

        {/* ── Eligibility card ──────────────────── */}
        <div className="bg-[#f4f4f4] rounded-xl p-6 mb-10">
          <div className="flex items-start justify-between gap-4 flex-wrap">
            <div>
              <p className="text-xs font-semibold text-[#9e9e9e] uppercase tracking-widest mb-1">
                Donation eligibility
              </p>
              {d.nextEligibleDonationDate ? (
                <>
                  <p className="text-sm font-semibold text-[#1a1a1a]">
                    Next eligible:{" "}
                    <span className={
                      new Date(d.nextEligibleDonationDate) <= new Date()
                        ? "text-[#16a34a]"
                        : "text-[#d97706]"
                    }>
                      {formatDate(d.nextEligibleDonationDate)}
                    </span>
                  </p>
                  {d.lastDonationDate && (
                    <p className="text-xs text-[#9e9e9e] mt-0.5">
                      Last donated: {formatDate(d.lastDonationDate)}
                    </p>
                  )}
                </>
              ) : (
                <p className="text-sm font-semibold text-[#16a34a]">
                  You are eligible to donate now
                </p>
              )}
            </div>
            <Link to="/requests" className={primaryBtn}>
              Browse open requests
            </Link>
          </div>
        </div>

        {/* ── Quick links ───────────────────────── */}
        <div className={sectionHeader}>
          <h2 className={sectionTitle}>My donor activity</h2>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-10">
          {[
            { label: "Donation history",  sub: "See all your past donations",    to: "/donor/history" },
            { label: "Badges",            sub: "Badges you've earned",            to: "/donor/badges" },
            { label: "Achievements",      sub: "Milestones and progress",         to: "/donor/achievements" },
          ].map((item) => (
            <Link
              key={item.to}
              to={item.to}
              className="bg-[#f4f4f4] rounded-xl p-5 hover:bg-[#ececec] transition-colors flex flex-col gap-1"
            >
              <p className="text-sm font-semibold text-[#1a1a1a]">{item.label}</p>
              <p className="text-xs text-[#9e9e9e]">{item.sub}</p>
            </Link>
          ))}
        </div>

        <div className={divider} />

        {/* ── Leaderboard teaser ─────────────────── */}
        <div className="flex items-center justify-between">
          <div>
            <h2 className={sectionTitle}>Leaderboard</h2>
            <p className={`${mutedText} mt-1`}>
              {rank?.rank ? `You are ranked #${rank.rank} out of all donors.` : "Donate to appear on the leaderboard."}
            </p>
          </div>
          <Link to="/donor/leaderboard" className={secondaryBtn}>
            View leaderboard
          </Link>
        </div>

      </div>
    </div>
  );
}

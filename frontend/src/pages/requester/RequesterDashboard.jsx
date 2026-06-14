// src/pages/requester/RequesterDashboard.jsx

import { useEffect, useState } from "react";
import { Link } from "react-router";
import { useSelector } from "react-redux";
import axiosInstance from "../../api/axiosInstance";
import { selectUser } from "../../store/authSlice";
import {
  pageBackground, pageWrapper, pageTitleClass, bodyText, mutedText,
  sectionHeader, sectionTitle, divider, errorClass, loadingClass,
  emptyStateClass, primaryBtn, secondaryBtn,
  dashStatsGrid, dashStatCard, dashStatCardAccent,
  dashStatValue, dashStatValueAccent, dashStatLabel,
  requestGrid, avatarLg,
} from "../../styles/common";
import RequestCard from "../../components/RequestCard";

function StatCard({ label, value, accent }) {
  return (
    <div className={accent ? dashStatCardAccent : dashStatCard}>
      <p className={accent ? dashStatValueAccent : dashStatValue}>{value ?? 0}</p>
      <p className={dashStatLabel}>{label}</p>
    </div>
  );
}

export default function RequesterDashboard() {
  const user                        = useSelector(selectUser);
  const [dashboard, setDashboard]   = useState(null);
  const [requests, setRequests]     = useState([]);
  const [loading, setLoading]       = useState(true);
  const [error, setError]           = useState("");

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        const [dashRes, reqRes] = await Promise.all([
          axiosInstance.get("/request-api/dashboard"),
          axiosInstance.get("/request-api/my-requests"),
        ]);
        setDashboard(dashRes.data?.payload);
        // Show only the 3 most recent on dashboard
        setRequests((reqRes.data?.payload || []).slice(0, 3));
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

  if (loading) return <div className={pageBackground}><p className={`${loadingClass} pt-32`}>Loading dashboard…</p></div>;
  if (error)   return <div className={pageBackground}><div className={`${errorClass} max-w-xl mx-auto mt-20`}>{error}</div></div>;

  const d = dashboard || {};

  return (
    <div className={pageBackground}>
      <div className={pageWrapper}>

        {/* ── Profile strip ─────────────────────── */}
        <div className="flex items-start justify-between gap-4 mb-10 flex-wrap">
          <div className="flex items-start gap-5">
            <div className={avatarLg}>{initials}</div>
            <div className="flex flex-col gap-1">
              <h1 className="text-2xl font-bold text-[#1a1a1a] tracking-tight">
                {user?.firstName} {user?.lastName}
              </h1>
              <p className="text-xs text-[#9e9e9e]">{user?.state} · Requester</p>
            </div>
          </div>
          <Link to="/requester/create" className={primaryBtn}>
            + New request
          </Link>
        </div>

        {/* ── Stats strip ───────────────────────── */}
        <div className={`${dashStatsGrid} mb-10`}>
          <StatCard label="Total requests"     value={d.totalRequests}     accent />
          <StatCard label="Open"               value={d.openRequests} />
          <StatCard label="Fulfilled"          value={d.fulfilledRequests} />
          <StatCard label="Units required"     value={d.totalUnitsRequired} />
          <StatCard label="Units fulfilled"    value={d.totalUnitsFulfilled} />
        </div>

        {/* ── Fulfillment progress bar ──────────── */}
        {d.totalUnitsRequired > 0 && (
          <div className="bg-[#f4f4f4] rounded-xl p-5 mb-10">
            <div className="flex justify-between items-center mb-2">
              <p className="text-xs font-semibold text-[#9e9e9e] uppercase tracking-widest">
                Overall units fulfilled
              </p>
              <p className="text-sm font-bold text-[#1a1a1a]">
                {d.totalUnitsFulfilled} / {d.totalUnitsRequired}
              </p>
            </div>
            <div className="w-full bg-[#e4e4e4] rounded-full h-1.5 overflow-hidden">
              <div
                className="bg-[#c0152a] h-1.5 rounded-full transition-all duration-500"
                style={{
                  width: `${Math.min(100, Math.round(
                    (d.totalUnitsFulfilled / d.totalUnitsRequired) * 100
                  ))}%`,
                }}
              />
            </div>
          </div>
        )}

        {/* ── Recent requests ───────────────────── */}
        <div className={sectionHeader}>
          <h2 className={sectionTitle}>Recent requests</h2>
          <Link to="/requester/my-requests" className={secondaryBtn}>
            View all
          </Link>
        </div>

        {requests.length === 0 ? (
          <div className={emptyStateClass}>
            No requests yet.{" "}
            <Link to="/requester/create" className="text-[#c0152a] font-semibold">
              Create your first request.
            </Link>
          </div>
        ) : (
          <div className={requestGrid}>
            {requests.map((req) => (
              <RequestCard key={req._id} req={req} />
            ))}
          </div>
        )}

        <div className={divider} />

        {/* ── Quick actions ─────────────────────── */}
        <div className="flex gap-3 flex-wrap">
          <Link to="/requester/create"      className={primaryBtn}>Create new request</Link>
          <Link to="/requester/my-requests" className={secondaryBtn}>All my requests</Link>
        </div>

      </div>
    </div>
  );
}

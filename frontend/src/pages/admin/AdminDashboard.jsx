// src/pages/admin/AdminDashboard.jsx

import { useEffect, useState } from "react";
import { Link } from "react-router";
import axiosInstance from "../../api/axiosInstance";
import {
  pageBackground, pageWrapper, pageTitleClass, bodyText,
  mutedText, sectionHeader, sectionTitle, divider,
  loadingClass, errorClass,
  dashStatsGrid, dashStatCard, dashStatCardAccent,
  dashStatValue, dashStatValueAccent, dashStatLabel,
} from "../../styles/common";

function Stat({ label, value, accent }) {
  return (
    <div className={accent ? dashStatCardAccent : dashStatCard}>
      <p className={accent ? dashStatValueAccent : dashStatValue}>{value ?? 0}</p>
      <p className={dashStatLabel}>{label}</p>
    </div>
  );
}

export default function AdminDashboard() {
  const [data, setData]       = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState("");

  useEffect(() => {
    const load = async () => {
      try {
        const res = await axiosInstance.get("/admin-api/dashboard");
        setData(res.data?.payload);
      } catch (err) {
        setError(err.response?.data?.message || "Failed to load admin dashboard.");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  if (loading) return <div className={pageBackground}><p className={`${loadingClass} pt-32`}>Loading dashboard…</p></div>;
  if (error)   return <div className={pageBackground}><div className={`${errorClass} max-w-xl mx-auto mt-20`}>{error}</div></div>;

  const d = data || {};

  return (
    <div className={pageBackground}>
      <div className={pageWrapper}>

        {/* Header */}
        <div className="mb-10">
          <p className="text-[#c0152a] text-xs font-bold uppercase tracking-widest mb-2">
            Admin panel
          </p>
          <h1 className={pageTitleClass}>Dashboard</h1>
          <p className={`${bodyText} mt-2`}>
            Live platform overview across all users, requests, and donations.
          </p>
        </div>

        {/* ── Users ──────────────────────────────── */}
        <h2 className={`${sectionTitle} mb-4`}>Users</h2>
        <div className={`${dashStatsGrid} mb-10`}>
          <Stat label="Total users"       value={d.totalUsers}      accent />
          <Stat label="Donors"            value={d.totalDonors} />
          <Stat label="Requesters"        value={d.totalRequesters} />
          <Stat label="Available donors"  value={d.availableDonors} />
          <Stat label="Unavailable"       value={d.unavailableDonors} />
        </div>

        {/* ── Requests ───────────────────────────── */}
        <h2 className={`${sectionTitle} mb-4`}>Requests</h2>
        <div className={`${dashStatsGrid} mb-10`}>
          <Stat label="Total requests"    value={d.totalRequests}     accent />
          <Stat label="Open"              value={d.openRequests} />
          <Stat label="Fulfilled"         value={d.fulfilledRequests} />
          <Stat label="Closed"            value={d.closedRequests} />
          <Stat label="Deleted"           value={d.deletedRequests} />
        </div>

        {/* ── Donations ──────────────────────────── */}
        <h2 className={`${sectionTitle} mb-4`}>Donations</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-10">
          <Stat label="Total donations"   value={d.totalDonations} accent />
          <Stat label="Expired requests"  value={d.expiredRequests} />
        </div>

        <div className={divider} />

        {/* ── Quick nav ───────────────────────────── */}
        <h2 className={`${sectionTitle} mb-5`}>Manage</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[
            { to: "/admin/users",      label: "Users",      sub: "View, activate and deactivate accounts" },
            { to: "/admin/requests",   label: "Requests",   sub: "Browse, filter and force-close requests" },
            { to: "/admin/statistics", label: "Statistics", sub: "Blood group, state and alert distributions" },
          ].map((item) => (
            <Link
              key={item.to}
              to={item.to}
              className="bg-[#f4f4f4] rounded-xl p-5 hover:bg-[#ececec]
                         transition-colors flex flex-col gap-1"
            >
              <p className="text-sm font-bold text-[#1a1a1a]">{item.label}</p>
              <p className="text-xs text-[#9e9e9e]">{item.sub}</p>
            </Link>
          ))}
        </div>

      </div>
    </div>
  );
}

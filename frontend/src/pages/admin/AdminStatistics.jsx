// src/pages/admin/AdminStatistics.jsx
// Visual distribution breakdowns — blood groups, alert levels,
// request statuses, and state-wise users. Pure CSS bars, no chart library.

import { useEffect, useState } from "react";
import axiosInstance from "../../api/axiosInstance";
import {
  pageBackground, pageWrapper, pageTitleClass, bodyText,
  sectionTitle, divider, loadingClass, errorClass,
  getAlertClass, getStatusClass,
} from "../../styles/common";

// ── Simple horizontal bar chart ───────────────────────────────
function BarChart({ rows, colorClass, total }) {
  if (!rows || rows.length === 0) return <p className="text-sm text-[#9e9e9e]">No data.</p>;
  const max = Math.max(...rows.map((r) => r.count), 1);

  return (
    <div className="flex flex-col gap-3">
      {rows.map((row) => {
        const pct      = Math.round((row.count / max) * 100);
        const sharePct = total ? Math.round((row.count / total) * 100) : null;
        return (
          <div key={row.label} className="flex flex-col gap-1">
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold text-[#1a1a1a]">{row.label}</span>
              <span className="text-[#9e9e9e]">
                {row.count}{sharePct !== null ? ` · ${sharePct}%` : ""}
              </span>
            </div>
            <div className="w-full bg-[#e4e4e4] rounded-full h-2 overflow-hidden">
              <div
                className={`${colorClass} h-2 rounded-full transition-all duration-500`}
                style={{ width: `${pct}%` }}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ── Badge-style distribution (for alert levels / statuses) ────
function BadgeDistribution({ rows, getBadgeClass }) {
  if (!rows || rows.length === 0) return <p className="text-sm text-[#9e9e9e]">No data.</p>;
  const total = rows.reduce((s, r) => s + r.count, 0);

  return (
    <div className="flex flex-col gap-3">
      {rows.map((row) => {
        const pct = total ? Math.round((row.count / total) * 100) : 0;
        return (
          <div key={row.label} className="flex items-center gap-3">
            <span className={getBadgeClass(row.label)}>{row.label}</span>
            <div className="flex-1 bg-[#e4e4e4] rounded-full h-2 overflow-hidden">
              <div
                className="bg-[#c0152a] h-2 rounded-full transition-all duration-500"
                style={{ width: `${pct}%` }}
              />
            </div>
            <span className="text-xs text-[#9e9e9e] w-16 text-right shrink-0">
              {row.count} · {pct}%
            </span>
          </div>
        );
      })}
    </div>
  );
}

// Normalise API response — backend returns array of {_id, count}
// Convert to {label, count} for consistent rendering
function toRows(data) {
  if (!data) return [];
  if (Array.isArray(data)) {
    return data.map((item) => ({
      label: item._id || item.label || String(item),
      count: item.count ?? 0,
    })).sort((a, b) => b.count - a.count);
  }
  return Object.entries(data)
    .map(([label, count]) => ({ label, count: Number(count) }))
    .sort((a, b) => b.count - a.count);
}

export default function AdminStatistics() {
  const [stats, setStats]     = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState("");

  useEffect(() => {
    const load = async () => {
      try {
        const res = await axiosInstance.get("/admin-api/statistics");
        setStats(res.data?.payload);
      } catch (err) {
        setError(err.response?.data?.message || "Failed to load statistics.");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  if (loading) return <div className={pageBackground}><p className={`${loadingClass} pt-32`}>Loading statistics…</p></div>;
  if (error)   return <div className={pageBackground}><div className={`${errorClass} max-w-xl mx-auto mt-20`}>{error}</div></div>;

  // Backend sends: bloodGroupStats, stateStats, alertLevelStats, requestStatusStats
  const bloodGroupRows = toRows(stats?.bloodGroupStats);
  const alertRows      = toRows(stats?.alertLevelStats);
  const statusRows     = toRows(stats?.requestStatusStats);
  const stateRows      = toRows(stats?.stateStats);

  const totalBG    = bloodGroupRows.reduce((s, r) => s + r.count, 0);
  const totalState = stateRows.reduce((s, r) => s + r.count, 0);

  return (
    <div className={pageBackground}>
      <div className={pageWrapper}>

        {/* Header */}
        <div className="mb-10">
          <p className="text-[#c0152a] text-xs font-bold uppercase tracking-widest mb-2">
            Admin · Analytics
          </p>
          <h1 className={pageTitleClass}>Statistics</h1>
          <p className={`${bodyText} mt-2`}>
            Platform-wide distributions across blood groups, urgency levels, request statuses, and geography.
          </p>
        </div>

        {/* ── Blood group distribution ──────────── */}
        <section className="mb-10">
          <h2 className={`${sectionTitle} mb-6`}>Blood group distribution</h2>
          <div className="bg-[#f4f4f4] rounded-xl p-6">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
              {bloodGroupRows.map((r) => (
                <div key={r.label} className="bg-white rounded-xl p-4 text-center">
                  <p className="text-xl font-bold text-[#c0152a]">{r.label}</p>
                  <p className="text-2xl font-bold text-[#1a1a1a] mt-0.5">{r.count}</p>
                  <p className="text-xs text-[#9e9e9e] mt-0.5">
                    {totalBG ? Math.round((r.count / totalBG) * 100) : 0}%
                  </p>
                </div>
              ))}
            </div>
            <BarChart rows={bloodGroupRows} colorClass="bg-[#c0152a]" total={totalBG} />
          </div>
        </section>

        <div className={divider} />

        {/* ── Alert level distribution ──────────── */}
        <section className="mb-10">
          <h2 className={`${sectionTitle} mb-6`}>Alert level distribution</h2>
          <div className="bg-[#f4f4f4] rounded-xl p-6">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
              {alertRows.map((r) => (
                <div key={r.label} className="bg-white rounded-xl p-4 text-center flex flex-col items-center gap-2">
                  <span className={getAlertClass(r.label)}>{r.label}</span>
                  <p className="text-2xl font-bold text-[#1a1a1a]">{r.count}</p>
                </div>
              ))}
            </div>
            <BadgeDistribution rows={alertRows} getBadgeClass={getAlertClass} />
          </div>
        </section>

        <div className={divider} />

        {/* ── Request status distribution ───────── */}
        <section className="mb-10">
          <h2 className={`${sectionTitle} mb-6`}>Request status distribution</h2>
          <div className="bg-[#f4f4f4] rounded-xl p-6">
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-6">
              {statusRows.map((r) => (
                <div key={r.label} className="bg-white rounded-xl p-4 text-center flex flex-col items-center gap-2">
                  <span className={getStatusClass(r.label)}>{r.label}</span>
                  <p className="text-2xl font-bold text-[#1a1a1a]">{r.count}</p>
                </div>
              ))}
            </div>
            <BadgeDistribution rows={statusRows} getBadgeClass={getStatusClass} />
          </div>
        </section>

        <div className={divider} />

        {/* ── State-wise user distribution ─────── */}
        <section className="mb-10">
          <h2 className={`${sectionTitle} mb-2`}>State-wise user distribution</h2>
          <p className={`${bodyText} mb-6`}>Top states by number of registered users.</p>
          <div className="bg-[#f4f4f4] rounded-xl p-6">
            {stateRows.length > 0 && (
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
                {stateRows.slice(0, 3).map((r, i) => (
                  <div key={r.label} className="bg-white rounded-xl p-4 flex items-center gap-3">
                    <span className="text-2xl">{["🥇","🥈","🥉"][i]}</span>
                    <div>
                      <p className="text-sm font-bold text-[#1a1a1a]">{r.label}</p>
                      <p className="text-xs text-[#9e9e9e]">
                        {r.count} user{r.count !== 1 ? "s" : ""}
                        {totalState ? ` · ${Math.round((r.count / totalState) * 100)}%` : ""}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
            <BarChart rows={stateRows} colorClass="bg-[#0369a1]" total={totalState} />
          </div>
        </section>

      </div>
    </div>
  );
}

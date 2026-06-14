// src/pages/donor/Achievements.jsx

import { useEffect, useState } from "react";
import { Link } from "react-router";
import axiosInstance from "../../api/axiosInstance";
import {
  pageBackground, pageWrapper, pageTitleClass, bodyText, mutedText,
  loadingClass, errorClass, emptyStateClass, divider,
  statsGrid, statCard, statValue, statLabel,
  getLevelClass, pointsPill,
  progressTrack, progressFill, progressFillSuccess,
} from "../../styles/common";

// Level thresholds — match backend logic
const LEVELS = [
  { name: "Iron",     minPoints: 0   },
  { name: "Bronze",   minPoints: 10  },
  { name: "Silver",   minPoints: 30  },
  { name: "Gold",     minPoints: 75  },
  { name: "Platinum", minPoints: 150 },
  { name: "Diamond",  minPoints: 300 },
];

function getLevelProgress(totalPoints) {
  const idx = [...LEVELS].reverse().findIndex((l) => totalPoints >= l.minPoints);
  const currentIdx = idx === -1 ? 0 : LEVELS.length - 1 - idx;
  const current  = LEVELS[currentIdx];
  const next     = LEVELS[currentIdx + 1];
  if (!next) return { current, next: null, pct: 100, ptsToNext: 0 };
  const range  = next.minPoints - current.minPoints;
  const earned = totalPoints - current.minPoints;
  const pct    = Math.min(100, Math.round((earned / range) * 100));
  return { current, next, pct, ptsToNext: next.minPoints - totalPoints };
}

// Milestone thresholds
const MILESTONES = [
  { label: "First Donation",   donationsNeeded: 1,   pointsNeeded: null },
  { label: "Five Donations",   donationsNeeded: 5,   pointsNeeded: null },
  { label: "Ten Donations",    donationsNeeded: 10,  pointsNeeded: null },
  { label: "Twenty Donations", donationsNeeded: 20,  pointsNeeded: null },
  { label: "Fifty Points",     donationsNeeded: null, pointsNeeded: 50  },
  { label: "Hundred Points",   donationsNeeded: null, pointsNeeded: 100 },
];

function MilestoneRow({ milestone, donationsCount, totalPoints }) {
  const reached = milestone.donationsNeeded !== null
    ? donationsCount >= milestone.donationsNeeded
    : totalPoints    >= milestone.pointsNeeded;

  const current = milestone.donationsNeeded !== null ? donationsCount : totalPoints;
  const target  = milestone.donationsNeeded ?? milestone.pointsNeeded;
  const pct     = Math.min(100, Math.round((current / target) * 100));

  return (
    <div className="flex flex-col gap-2 py-4 border-b border-[#f4f4f4] last:border-0">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-base">{reached ? "✅" : "⬜"}</span>
          <span className={`text-sm font-semibold ${reached ? "text-[#1a1a1a]" : "text-[#9e9e9e]"}`}>
            {milestone.label}
          </span>
        </div>
        <span className="text-xs text-[#9e9e9e]">
          {Math.min(current, target)} / {target}{" "}
          {milestone.donationsNeeded ? "donations" : "pts"}
        </span>
      </div>
      <div className={progressTrack}>
        <div
          className={reached ? progressFillSuccess : progressFill}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}

export default function Achievements() {
  const [data, setData]       = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState("");

  useEffect(() => {
    const load = async () => {
      try {
        const res = await axiosInstance.get("/donor-api/achievements");
        setData(res.data?.payload);
      } catch (err) {
        setError(err.response?.data?.message || "Failed to load achievements.");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const donationsCount = data?.donationsCount ?? 0;
  const totalPoints    = data?.totalPoints    ?? 0;
  const donorLevel     = data?.donorLevel     || "Iron";
  const { current, next, pct, ptsToNext } = getLevelProgress(totalPoints);

  return (
    <div className={pageBackground}>
      <div className={pageWrapper}>

        {/* Header */}
        <div className="mb-8">
          <p className="text-[#c0152a] text-xs font-bold uppercase tracking-widest mb-2">
            Progress
          </p>
          <h1 className={pageTitleClass}>Achievements</h1>
          <p className={`${bodyText} mt-2`}>
            Track your milestones and see how close you are to the next donor level.
          </p>
        </div>

        {loading && <p className={loadingClass}>Loading achievements…</p>}
        {error   && <div className={errorClass}>{error}</div>}

        {!loading && !error && (
          <>
            {/* ── Stats ──────────────────────────── */}
            <div className={`${statsGrid} mb-10`}>
              <div className={statCard}>
                <p className={statValue}>{donationsCount}</p>
                <p className={statLabel}>Total donations</p>
              </div>
              <div className={statCard}>
                <p className={statValue}>{totalPoints}</p>
                <p className={statLabel}>Total points</p>
              </div>
              <div className={statCard}>
                <p className={statValue}>{data?.badges?.length ?? 0}</p>
                <p className={statLabel}>Badges earned</p>
              </div>
              <div className={statCard}>
                <p className={statValue}>{donorLevel}</p>
                <p className={statLabel}>Donor level</p>
              </div>
            </div>

            {/* ── Level progress ─────────────────── */}
            <div className="bg-[#f4f4f4] rounded-xl p-6 mb-10">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <p className="text-xs font-semibold text-[#9e9e9e] uppercase tracking-widest mb-1">
                    Current level
                  </p>
                  <div className="flex items-center gap-2">
                    <span className={getLevelClass(current.name)}
                          style={{ fontSize: "0.75rem", padding: "0.3rem 0.7rem" }}>
                      {current.name}
                    </span>
                    {next && (
                      <>
                        <span className="text-[#9e9e9e] text-xs">→</span>
                        <span className="text-xs text-[#9e9e9e]">{next.name}</span>
                      </>
                    )}
                  </div>
                </div>
                <span className={pointsPill}>{totalPoints} pts</span>
              </div>

              {next ? (
                <>
                  <div className={progressTrack}>
                    <div className={progressFill} style={{ width: `${pct}%` }} />
                  </div>
                  <p className="text-xs text-[#9e9e9e] mt-2">
                    {ptsToNext} more point{ptsToNext !== 1 ? "s" : ""} to reach {next.name}
                  </p>
                </>
              ) : (
                <div className={progressTrack}>
                  <div className={progressFillSuccess} style={{ width: "100%" }} />
                </div>
              )}
              {!next && (
                <p className="text-xs text-[#16a34a] mt-2 font-semibold">
                  Maximum level reached — Diamond Donor 💎
                </p>
              )}
            </div>

            {/* ── Milestones ─────────────────────── */}
            <h2 className="text-base font-bold text-[#1a1a1a] mb-4 tracking-tight">
              Milestones
            </h2>
            <div className="bg-white border border-[#e4e4e4] rounded-xl px-6">
              {MILESTONES.map((m) => (
                <MilestoneRow
                  key={m.label}
                  milestone={m}
                  donationsCount={donationsCount}
                  totalPoints={totalPoints}
                />
              ))}
            </div>

            <div className={divider} />

            <div className="flex gap-3">
              <Link to="/donor/badges"   className="text-sm font-semibold text-[#c0152a] hover:text-[#960f20] transition-colors">
                View badges →
              </Link>
              <Link to="/donor/leaderboard" className="text-sm font-semibold text-[#6b6b6b] hover:text-[#1a1a1a] transition-colors">
                View leaderboard →
              </Link>
            </div>
          </>
        )}

      </div>
    </div>
  );
}

// src/pages/donor/Badges.jsx

import { useEffect, useState } from "react";
import axiosInstance from "../../api/axiosInstance";
import {
  pageBackground, pageWrapper, pageTitleClass, bodyText, mutedText,
  loadingClass, errorClass, emptyStateClass,
  badgeGrid, badgeCard, badgeCardEarned, badgeName,
} from "../../styles/common";

// Badge icon map — domain-relevant icons for each badge type
const BADGE_ICONS = {
  "First Donation":    "🩸",
  "Five Donations":    "⭐",
  "Ten Donations":     "🌟",
  "Fifty Points":      "🏅",
  "Hundred Points":    "🏆",
  "Twenty Donations":  "💪",
  "Diamond Donor":     "💎",
  "Lifesaver":         "❤️",
  "Emergency Hero":    "🚨",
};

const DEFAULT_ICON = "🎖️";

function BadgeCard({ badge, earned }) {
  const icon = BADGE_ICONS[badge.name] || DEFAULT_ICON;
  return (
    <div className={earned ? badgeCardEarned : badgeCard}>
      <span className="text-3xl" role="img" aria-label={badge.name}>{icon}</span>
      <p className={badgeName}>{badge.name}</p>
      {badge.description && (
        <p className="text-[0.7rem] text-[#9e9e9e] text-center leading-relaxed">
          {badge.description}
        </p>
      )}
      {earned ? (
        <span className="text-[10px] font-bold text-[#b45309] bg-[#b45309]/10
                         px-2 py-0.5 rounded-full uppercase tracking-wide mt-1">
          Earned
        </span>
      ) : (
        <span className="text-[10px] font-bold text-[#9e9e9e] bg-[#9e9e9e]/10
                         px-2 py-0.5 rounded-full uppercase tracking-wide mt-1">
          Locked
        </span>
      )}
    </div>
  );
}

export default function Badges() {
  const [data, setData]       = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState("");

  useEffect(() => {
    const load = async () => {
      try {
        const res = await axiosInstance.get("/donor-api/badges");
        setData(res.data?.payload);
      } catch (err) {
        setError(err.response?.data?.message || "Failed to load badges.");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const earned   = data?.earnedBadges   || [];
  const all      = data?.allBadges      || [];
  // Build a set of earned names for quick lookup
  const earnedNames = new Set(earned.map((b) => b.name || b));

  // If API returns flat arrays, use them; if only earnedBadges, show those
  const displayAll = all.length > 0 ? all : earned;

  return (
    <div className={pageBackground}>
      <div className={pageWrapper}>

        {/* Header */}
        <div className="mb-8">
          <p className="text-[#c0152a] text-xs font-bold uppercase tracking-widest mb-2">
            Rewards
          </p>
          <h1 className={pageTitleClass}>Badges</h1>
          <p className={`${bodyText} mt-2`}>
            Badges are awarded automatically when you hit donation and point milestones.
          </p>
        </div>

        {/* Earned count */}
        {!loading && (
          <div className="bg-[#f4f4f4] rounded-xl p-5 mb-8 flex items-center gap-4">
            <p className="text-3xl font-bold text-[#1a1a1a] tracking-tight">
              {earned.length}
            </p>
            <div>
              <p className="text-sm font-semibold text-[#1a1a1a]">
                badge{earned.length !== 1 ? "s" : ""} earned
              </p>
              {all.length > earned.length && (
                <p className="text-xs text-[#9e9e9e]">
                  {all.length - earned.length} more to unlock
                </p>
              )}
            </div>
          </div>
        )}

        {loading && <p className={loadingClass}>Loading badges…</p>}
        {error   && <div className={errorClass}>{error}</div>}

        {!loading && !error && displayAll.length === 0 && (
          <p className={emptyStateClass}>No badges available yet. Keep donating!</p>
        )}

        {/* Badge grid */}
        {!loading && displayAll.length > 0 && (
          <div className={badgeGrid}>
            {displayAll.map((badge, i) => {
              const name    = badge.name || badge;
              const isEarned = earnedNames.has(name);
              return (
                <BadgeCard
                  key={i}
                  badge={typeof badge === "string" ? { name: badge } : badge}
                  earned={isEarned}
                />
              );
            })}
          </div>
        )}

        {/* If API only returned earned badges (no allBadges), show them */}
        {!loading && all.length === 0 && earned.length > 0 && (
          <div className={badgeGrid}>
            {earned.map((badge, i) => (
              <BadgeCard
                key={i}
                badge={typeof badge === "string" ? { name: badge } : badge}
                earned
              />
            ))}
          </div>
        )}

      </div>
    </div>
  );
}

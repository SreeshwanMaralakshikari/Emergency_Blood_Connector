import { useEffect, useState } from "react";
import axiosInstance from "../../api/axiosInstance";
import {
  pageBackground, pageWrapper, pageTitleClass, bodyText,
  loadingClass, errorClass, emptyStateClass,
  badgeGrid, badgeCard, badgeCardEarned, badgeName,
} from "../../styles/common";

//badge icon map — domain-relevant icons for each badge type
const BADGE_ICONS = {
  "First Donation":  "🩸",
  "5 Donations":     "⭐",
  "10 Donations":    "🌟",
  "25 Donations":    "💪",
  "50 Donations":    "💎",
  "100 Points":      "🏅",
  "500 Points":      "🏆",
  "1000 Points":     "👑",
};

const DEFAULT_ICON = "🎖️";

function BadgeCard({ name, earned }) {
  const icon = BADGE_ICONS[name] || DEFAULT_ICON;
  return (
    <div className={earned ? badgeCardEarned : badgeCard}>
      <span className="text-3xl" role="img" aria-label={name}>{icon}</span>
      <p className={badgeName}>{name}</p>
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

//all possible badges in order — used to show locked ones too
const ALL_BADGES = [
  "First Donation", "5 Donations", "10 Donations", "25 Donations", "50 Donations",
  "100 Points", "500 Points", "1000 Points",
];

export default function Badges() {
  const [data, setData]       = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState("");

  useEffect(() => {
    const load = async () => {
      try {
        //payload: { badges:[...], donationsCount, totalPoints, donorLevel }
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

  //badges is a flat array of earned badge name strings
  const earnedSet = new Set(data?.badges || []);
  const earnedCount = earnedSet.size;

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
              {earnedCount}
            </p>
            <div>
              <p className="text-sm font-semibold text-[#1a1a1a]">
                badge{earnedCount !== 1 ? "s" : ""} earned
              </p>
              {ALL_BADGES.length > earnedCount && (
                <p className="text-xs text-[#9e9e9e]">
                  {ALL_BADGES.length - earnedCount} more to unlock
                </p>
              )}
            </div>
          </div>
        )}

        {loading && <p className={loadingClass}>Loading badges…</p>}
        {error   && <div className={errorClass}>{error}</div>}

        {/* Badge grid — show all badges, earned ones highlighted */}
        {!loading && !error && (
          <div className={badgeGrid}>
            {ALL_BADGES.map((name) => (
              <BadgeCard key={name} name={name} earned={earnedSet.has(name)} />
            ))}
          </div>
        )}

      </div>
    </div>
  );
}

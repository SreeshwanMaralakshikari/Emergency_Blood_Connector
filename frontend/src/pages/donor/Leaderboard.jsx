// src/pages/donor/Leaderboard.jsx
// Public page — shows top donors + current donor's personal rank

import { useEffect, useState } from "react";
import axiosInstance from "../../api/axiosInstance";
import { useSelector } from "react-redux";
import { selectUser, selectIsAuth } from "../../store/authSlice";
import {
  pageBackground, pageWrapper, pageTitleClass, bodyText, mutedText,
  loadingClass, errorClass, emptyStateClass,
  leaderboardList, leaderboardRow, leaderboardRowMe,
  leaderboardRank, leaderboardRankTop,
  leaderboardName, leaderboardScore, leaderboardMeta,
  getLevelClass, bloodGroupBadge, pointsPill, divider,
  sectionHeader, sectionTitle,
} from "../../styles/common";

const MEDALS = ["🥇", "🥈", "🥉"];

function LeaderRow({ entry, isMe, position }) {
  const isTop3 = position <= 3;
  return (
    <div className={isMe ? leaderboardRowMe : leaderboardRow}>
      {/* Rank */}
      <span className={isTop3 ? leaderboardRankTop : leaderboardRank}>
        {isTop3 ? MEDALS[position - 1] : `#${position}`}
      </span>

      {/* Name + meta */}
      <div className="flex flex-col gap-0.5 flex-1 px-3">
        <span className={leaderboardName}>
          {entry.firstName} {entry.lastName}
          {isMe && (
            <span className="ml-2 text-[10px] font-bold text-[#c0152a] bg-[#c0152a]/10
                             px-2 py-0.5 rounded-full uppercase tracking-wide">
              You
            </span>
          )}
        </span>
        <div className="flex items-center gap-2 flex-wrap">
          {entry.donorLevel && (
            <span className={getLevelClass(entry.donorLevel)}>{entry.donorLevel}</span>
          )}
          {entry.bloodGroup && (
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full
                             bg-[#c0152a]/8 text-[#960f20] border border-[#c0152a]/15">
              {entry.bloodGroup}
            </span>
          )}
          <span className={mutedText}>{entry.state}</span>
        </div>
      </div>

      {/* Stats */}
      <div className="flex flex-col items-end gap-1 shrink-0">
        <span className={leaderboardScore}>{entry.totalPoints} pts</span>
        <span className="text-xs text-[#9e9e9e]">
          {entry.donationsCount} donation{entry.donationsCount !== 1 ? "s" : ""}
        </span>
      </div>
    </div>
  );
}

export default function Leaderboard() {
  const user                    = useSelector(selectUser);
  const isAuth                  = useSelector(selectIsAuth);
  const [leaders, setLeaders]   = useState([]);
  const [myRank, setMyRank]     = useState(null);
  const [loading, setLoading]   = useState(true);
  const [error, setError]       = useState("");

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        const promises = [axiosInstance.get("/donor-api/leaderboard")];
        if (isAuth) promises.push(axiosInstance.get("/donor-api/my-rank"));
        const [lbRes, rankRes] = await Promise.all(promises);
        setLeaders(lbRes.data?.payload || []);
        if (rankRes) setMyRank(rankRes.data?.payload);
      } catch (err) {
        setError(err.response?.data?.message || "Failed to load leaderboard.");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [isAuth]);

  const userId = user?.id || user?._id;

  return (
    <div className={pageBackground}>
      <div className={pageWrapper}>

        {/* Header */}
        <div className="mb-8">
          <p className="text-[#c0152a] text-xs font-bold uppercase tracking-widest mb-2">
            Community
          </p>
          <h1 className={pageTitleClass}>Leaderboard</h1>
          <p className={`${bodyText} mt-2`}>
            Top donors ranked by total points. Earn more by accepting high-alert requests.
          </p>
        </div>

        {/* My rank card */}
        {isAuth && myRank && (
          <div className="bg-[#c0152a]/[0.04] border border-[#c0152a]/[0.14]
                          rounded-xl p-5 mb-8 flex items-center justify-between flex-wrap gap-4">
            <div>
              <p className="text-xs font-semibold text-[#9e9e9e] uppercase tracking-widest mb-1">
                Your rank
              </p>
              <p className="text-3xl font-bold text-[#c0152a] tracking-tight">
                #{myRank.rank}
              </p>
              <p className="text-sm text-[#6b6b6b] mt-0.5">
                {myRank.totalPoints} pts · {myRank.donationsCount} donation{myRank.donationsCount !== 1 ? "s" : ""}
              </p>
            </div>
            {myRank.donorLevel && (
              <span className={getLevelClass(myRank.donorLevel)}
                    style={{ fontSize: "0.75rem", padding: "0.35rem 0.75rem" }}>
                {myRank.donorLevel}
              </span>
            )}
          </div>
        )}

        {loading && <p className={loadingClass}>Loading leaderboard…</p>}
        {error   && <div className={errorClass}>{error}</div>}
        {!loading && !error && leaders.length === 0 && (
          <p className={emptyStateClass}>No donors on the leaderboard yet.</p>
        )}

        {/* Leaderboard list */}
        {!loading && leaders.length > 0 && (
          <div className={leaderboardList}>
            {leaders.map((entry, i) => (
              <LeaderRow
                key={entry._id}
                entry={entry}
                position={i + 1}
                isMe={String(entry._id) === String(userId)}
              />
            ))}
          </div>
        )}

      </div>
    </div>
  );
}

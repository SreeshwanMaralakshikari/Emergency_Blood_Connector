//shows all users across role tabs with search — admin can activate or deactivate any account

import { useEffect, useState, useCallback } from "react";
import axiosInstance from "../../api/axiosInstance";
import toast from "react-hot-toast";
import {
  pageBackground, pageWrapper, pageTitleClass, bodyText, mutedText,
  loadingClass, errorClass, emptyStateClass,
  tableWrapper, tableClass, tableHead, tableTh, tableTr, tableTd, tableTdMuted,
  getRoleClass, getLevelClass, getUserActiveClass,
  inputClass, avatar,
} from "../../styles/common";
import { formatDate } from "../../utils/formatDate";

const TABS = [
  { key: "all",        label: "All users",  endpoint: "/admin-api/users"      },
  { key: "donors",     label: "Donors",     endpoint: "/admin-api/donors"     },
  { key: "requesters", label: "Requesters", endpoint: "/admin-api/requesters" },
];

function UserRow({ user, onToggle, toggling }) {
  const initials = `${user.firstName?.[0] || ""}${user.lastName?.[0] || ""}`.toUpperCase();
  const isActive = user.isUserActive;

  return (
    <tr className={tableTr}>
      {/* Name + avatar */}
      <td className={tableTd}>
        <div className="flex items-center gap-3">
          <div className={`${avatar} shrink-0`}>{initials}</div>
          <div>
            <p className="text-sm font-semibold text-[#1a1a1a]">
              {user.firstName} {user.lastName}
            </p>
            <p className="text-xs text-[#9e9e9e]">{user.email}</p>
          </div>
        </div>
      </td>

      {/* Role */}
      <td className={tableTd}>
        <span className={getRoleClass(user.role)}>{user.role}</span>
      </td>

      {/* Blood group */}
      <td className={tableTdMuted}>{user.bloodGroup || "—"}</td>

      {/* State */}
      <td className={tableTdMuted}>{user.state || "—"}</td>

      {/* Donor level (donors only) */}
      <td className={tableTd}>
        {user.role === "DONOR" && user.donorLevel
          ? <span className={getLevelClass(user.donorLevel)}>{user.donorLevel}</span>
          : <span className="text-[#9e9e9e]">—</span>}
      </td>

      {/* Donations / Points */}
      <td className={tableTdMuted}>
        {user.role === "DONOR"
          ? `${user.donationsCount ?? 0} · ${user.totalPoints ?? 0} pts`
          : "—"}
      </td>

      {/* Joined */}
      <td className={tableTdMuted}>{formatDate(user.createdAt)}</td>

      {/* Status + toggle */}
      <td className={tableTd}>
        <div className="flex items-center gap-3">
          <span className={getUserActiveClass(isActive)}>
            {isActive ? "Active" : "Inactive"}
          </span>
          <button
            onClick={() => onToggle(user._id, isActive)}
            disabled={toggling === user._id}
            className={`text-xs font-semibold px-3 py-1.5 rounded-full cursor-pointer
                        transition-colors border ${
              isActive
                ? "border-[#dc2626]/30 text-[#dc2626] hover:bg-[#dc2626]/5"
                : "border-[#16a34a]/30 text-[#16a34a] hover:bg-[#16a34a]/5"
            } ${toggling === user._id ? "opacity-50 cursor-not-allowed" : ""}`}
          >
            {toggling === user._id
              ? "…"
              : isActive ? "Deactivate" : "Activate"}
          </button>
        </div>
      </td>
    </tr>
  );
}

export default function AdminUsers() {
  const [users, setUsers]     = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [tab, setTab]         = useState("all");
  const [search, setSearch]   = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState("");
  const [toggling, setToggling] = useState(""); // userId being toggled

  const fetchUsers = useCallback(async (endpoint) => {
    try {
      setLoading(true);
      setError("");
      const res = await axiosInstance.get(endpoint);
      setUsers(res.data?.payload || []);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load users.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const t = TABS.find((t) => t.key === tab);
    if (t) fetchUsers(t.endpoint);
  }, [tab, fetchUsers]);

  //client-side search
  useEffect(() => {
    if (!search.trim()) { setFiltered(users); return; }
    const q = search.toLowerCase();
    setFiltered(users.filter((u) =>
      `${u.firstName} ${u.lastName}`.toLowerCase().includes(q) ||
      u.email?.toLowerCase().includes(q) ||
      u.state?.toLowerCase().includes(q) ||
      u.bloodGroup?.toLowerCase().includes(q)
    ));
  }, [users, search]);

  const handleToggle = async (userId, currentlyActive) => {
    try {
      setToggling(userId);
      await axiosInstance.patch("/admin-api/user-status", {
        userId,
        isUserActive: !currentlyActive,
      });
      toast.success(`User ${currentlyActive ? "deactivated" : "activated"} successfully.`);
      //update local state immediately
      setUsers((prev) =>
        prev.map((u) =>
          u._id === userId ? { ...u, isUserActive: !currentlyActive } : u
        )
      );
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to update user status.");
    } finally {
      setToggling("");
    }
  };

  return (
    <div className={pageBackground}>
      <div className={pageWrapper}>

        {/* Header */}
        <div className="mb-8">
          <p className="text-[#c0152a] text-xs font-bold uppercase tracking-widest mb-2">
            Admin · Users
          </p>
          <h1 className={pageTitleClass}>User management</h1>
          <p className={`${bodyText} mt-2`}>
            View and manage all registered users. Activate or deactivate accounts as needed.
          </p>
        </div>

        {/* Tabs + search */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div className="flex gap-1 border-b border-[#e4e4e4]">
            {TABS.map((t) => (
              <button
                key={t.key}
                onClick={() => { setTab(t.key); setSearch(""); }}
                className={`text-sm px-4 py-2.5 border-b-2 -mb-px cursor-pointer
                            whitespace-nowrap transition-colors ${
                  tab === t.key
                    ? "font-semibold text-[#c0152a] border-[#c0152a]"
                    : "font-medium text-[#6b6b6b] border-transparent hover:text-[#1a1a1a]"
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>
          <input
            type="text"
            placeholder="Search by name, email, state…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className={`${inputClass} max-w-xs`}
          />
        </div>

        {/* Result count */}
        {!loading && (
          <p className={`${mutedText} mb-4`}>
            {filtered.length} user{filtered.length !== 1 ? "s" : ""}
          </p>
        )}

        {loading && <p className={loadingClass}>Loading users…</p>}
        {error   && <div className={errorClass}>{error}</div>}

        {!loading && !error && filtered.length === 0 && (
          <p className={emptyStateClass}>No users found.</p>
        )}

        {/* Table */}
        {!loading && filtered.length > 0 && (
          <div className={tableWrapper}>
            <table className={tableClass}>
              <thead className={tableHead}>
                <tr>
                  {["User", "Role", "Blood group", "State", "Level",
                    "Donations · Points", "Joined", "Status"].map((h) => (
                    <th key={h} className={tableTh}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map((u) => (
                  <UserRow
                    key={u._id}
                    user={u}
                    onToggle={handleToggle}
                    toggling={toggling}
                  />
                ))}
              </tbody>
            </table>
          </div>
        )}

      </div>
    </div>
  );
}

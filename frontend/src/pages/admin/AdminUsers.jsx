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
      <td className={tableTd}>
        <div className="flex items-center gap-3">
          {user.profileImageUrl ? (
            <img src={user.profileImageUrl} alt={initials}
                 className="w-8 h-8 rounded-full object-cover border border-[#e4e4e4] shrink-0" />
          ) : (
            <div className={`${avatar} shrink-0`}>{initials}</div>
          )}
          <div>
            <p className="text-sm font-semibold text-[#1a1a1a]">
              {user.firstName} {user.lastName}
            </p>
            <p className="text-xs text-[#9e9e9e]">{user.email}</p>
          </div>
        </div>
      </td>
      <td className={tableTd}><span className={getRoleClass(user.role)}>{user.role}</span></td>
      <td className={tableTdMuted}>{user.bloodGroup || "—"}</td>
      <td className={tableTdMuted}>{user.state || "—"}</td>
      <td className={tableTd}>
        {user.role === "DONOR" && user.donorLevel ? (
          <span className={getLevelClass(user.donorLevel)}>{user.donorLevel}</span>
        ) : "—"}
      </td>
      <td className={tableTdMuted}>
        {user.role === "DONOR" ? (user.donationsCount ?? 0) : "—"}
      </td>
      <td className={tableTdMuted}>{formatDate(user.createdAt)}</td>
      <td className={tableTd}>
        <div className="flex items-center gap-3">
          <span className={getUserActiveClass(isActive)}>
            {isActive ? "Active" : "Inactive"}
          </span>
          <button
            onClick={() => onToggle(user._id, !isActive)}
            disabled={toggling === user._id}
            className={`text-xs font-semibold cursor-pointer transition-colors ${
              isActive
                ? "text-[#dc2626] hover:text-[#b91c1c]"
                : "text-[#16a34a] hover:text-[#15803d]"
            } ${toggling === user._id ? "opacity-50 cursor-not-allowed" : ""}`}
          >
            {toggling === user._id
              ? "Saving…"
              : isActive ? "Deactivate" : "Activate"}
          </button>
        </div>
      </td>
    </tr>
  );
}

// Mobile card view for each user
function UserCard({ user, onToggle, toggling }) {
  const initials = `${user.firstName?.[0] || ""}${user.lastName?.[0] || ""}`.toUpperCase();
  const isActive = user.isUserActive;
  return (
    <div className="bg-white border border-[#e4e4e4] rounded-xl p-4 flex flex-col gap-3">
      <div className="flex items-center gap-3">
        {user.profileImageUrl ? (
          <img src={user.profileImageUrl} alt={initials}
               className="w-10 h-10 rounded-full object-cover border border-[#e4e4e4] shrink-0" />
        ) : (
          <div className={`${avatar} shrink-0`}>{initials}</div>
        )}
        <div className="min-w-0 flex-1">
          <p className="text-sm font-semibold text-[#1a1a1a] truncate">
            {user.firstName} {user.lastName}
          </p>
          <p className="text-xs text-[#9e9e9e] truncate">{user.email}</p>
        </div>
        <span className={getUserActiveClass(isActive)}>
          {isActive ? "Active" : "Inactive"}
        </span>
      </div>
      <div className="flex flex-wrap gap-2 text-xs">
        <span className={getRoleClass(user.role)}>{user.role}</span>
        {user.bloodGroup && (
          <span className="bg-[#f4f4f4] text-[#6b6b6b] px-2 py-0.5 rounded-full font-medium">
            {user.bloodGroup}
          </span>
        )}
        {user.role === "DONOR" && user.donorLevel && (
          <span className={getLevelClass(user.donorLevel)}>{user.donorLevel}</span>
        )}
      </div>
      <div className="flex items-center justify-between text-xs text-[#9e9e9e]">
        <span>{user.state || "—"}</span>
        <span>Joined {formatDate(user.createdAt)}</span>
      </div>
      <button
        onClick={() => onToggle(user._id, !isActive)}
        disabled={toggling === user._id}
        className={`w-full py-2 rounded-lg text-sm font-semibold border transition-colors cursor-pointer ${
          isActive
            ? "border-[#dc2626] text-[#dc2626] hover:bg-[#dc2626]/[0.04]"
            : "border-[#16a34a] text-[#16a34a] hover:bg-[#16a34a]/[0.04]"
        } ${toggling === user._id ? "opacity-50 cursor-not-allowed" : ""}`}
      >
        {toggling === user._id ? "Saving…" : isActive ? "Deactivate" : "Activate"}
      </button>
    </div>
  );
}

export default function AdminUsers() {
  const [users,    setUsers]    = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [tab,      setTab]      = useState("all");
  const [search,   setSearch]   = useState("");
  const [loading,  setLoading]  = useState(true);
  const [error,    setError]    = useState("");
  const [toggling, setToggling] = useState("");

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

  useEffect(() => {
    if (!search.trim()) { setFiltered(users); return; }
    const q = search.toLowerCase();
    setFiltered(users.filter((u) =>
      u.firstName?.toLowerCase().includes(q) ||
      u.lastName?.toLowerCase().includes(q)  ||
      u.email?.toLowerCase().includes(q)     ||
      u.state?.toLowerCase().includes(q)     ||
      u.bloodGroup?.toLowerCase().includes(q)
    ));
  }, [users, search]);

  const handleToggle = async (userId, newStatus) => {
    try {
      setToggling(userId);
      await axiosInstance.patch("/admin-api/user-status", { userId, isUserActive: newStatus });
      toast.success(`User ${newStatus ? "activated" : "deactivated"}.`);
      setUsers((prev) =>
        prev.map((u) => u._id === userId ? { ...u, isUserActive: newStatus } : u)
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

        <div className="mb-8">
          <p className="text-[#c0152a] text-xs font-bold uppercase tracking-widest mb-2">
            Admin · Users
          </p>
          <h1 className={pageTitleClass}>User management</h1>
          <p className={`${bodyText} mt-2`}>
            View, search and manage all registered users.
          </p>
        </div>

        {/* Tabs + search */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div className="flex gap-1 border-b border-[#e4e4e4] overflow-x-auto">
            {TABS.map((t) => (
              <button key={t.key} onClick={() => { setTab(t.key); setSearch(""); }}
                      className={`text-sm px-4 py-2.5 border-b-2 -mb-px cursor-pointer
                                  whitespace-nowrap transition-colors ${
                        tab === t.key
                          ? "font-semibold text-[#c0152a] border-[#c0152a]"
                          : "font-medium text-[#6b6b6b] border-transparent hover:text-[#1a1a1a]"
                      }`}>
                {t.label}
              </button>
            ))}
          </div>
          <input type="text" placeholder="Search users…"
                 value={search} onChange={(e) => setSearch(e.target.value)}
                 className={`${inputClass} sm:max-w-xs`} />
        </div>

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

        {/* Desktop table — hidden on mobile */}
        {!loading && filtered.length > 0 && (
          <>
            <div className={`${tableWrapper} hidden sm:block`}>
              <table className={tableClass}>
                <thead className={tableHead}>
                  <tr>
                    {["Name", "Role", "Blood", "State", "Level", "Donations", "Joined", "Status"].map((h) => (
                      <th key={h} className={tableTh}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((u) => (
                    <UserRow key={u._id} user={u} onToggle={handleToggle} toggling={toggling} />
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile card list — shown only on mobile */}
            <div className="flex flex-col gap-3 sm:hidden">
              {filtered.map((u) => (
                <UserCard key={u._id} user={u} onToggle={handleToggle} toggling={toggling} />
              ))}
            </div>
          </>
        )}

      </div>
    </div>
  );
}

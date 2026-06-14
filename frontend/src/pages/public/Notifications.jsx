// src/pages/public/Notifications.jsx
// Shows all notifications for the logged-in user.
// Unread ones are highlighted. Clicking "Mark as read" updates the badge
// in the Navbar via the Redux notifSlice.

import { useEffect, useState, useCallback } from "react";
import { useDispatch } from "react-redux";
import axiosInstance from "../../api/axiosInstance";
import { fetchUnreadCount, decrementUnread } from "../../store/notifSlice";
import {
  pageBackground, pageWrapper, pageTitleClass, bodyText, mutedText,
  loadingClass, errorClass, emptyStateClass,
  notifCard, notifCardUnread,
  notifTitle, notifMessage, notifTime,
  getNotifDotClass,
} from "../../styles/common";
import { timeAgo, formatDateTime } from "../../utils/formatDate";

// Human-readable labels for notification types
const TYPE_LABELS = {
  REQUEST_CREATED:    "Request created",
  REQUEST_ACCEPTED:   "Request accepted",
  DONATION_COMPLETED: "Donation completed",
  BADGE_EARNED:       "Badge earned",
  GENERAL:            "General",
};

function NotifCard({ notif, onMarkRead }) {
  const isUnread = !notif.isRead;
  const dotClass = getNotifDotClass(notif.type);

  return (
    <div className={isUnread ? notifCardUnread : notifCard}>
      <div className="flex items-start gap-3">
        {/* Type dot */}
        <span className={`${dotClass} mt-1`} />

        {/* Content */}
        <div className="flex flex-col gap-1 flex-1 min-w-0">
          <div className="flex items-start justify-between gap-3">
            <p className={notifTitle}>{notif.title}</p>
            {/* Type pill */}
            <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full
                             bg-[#f4f4f4] text-[#9e9e9e] uppercase tracking-wide shrink-0">
              {TYPE_LABELS[notif.type] || notif.type}
            </span>
          </div>

          {notif.message && (
            <p className={notifMessage}>{notif.message}</p>
          )}

          <div className="flex items-center justify-between mt-1">
            <p className={notifTime} title={formatDateTime(notif.createdAt)}>
              {timeAgo(notif.createdAt)}
            </p>
            {isUnread && (
              <button
                onClick={() => onMarkRead(notif._id)}
                className="text-xs text-[#c0152a] font-semibold
                           hover:text-[#960f20] transition-colors cursor-pointer"
              >
                Mark as read
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function Notifications() {
  const dispatch                      = useDispatch();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading]         = useState(true);
  const [error, setError]             = useState("");
  const [filter, setFilter]           = useState("ALL"); // ALL | UNREAD | READ

  const fetchNotifications = useCallback(async () => {
    try {
      setLoading(true);
      setError("");
      const res = await axiosInstance.get("/notification-api/my-notifications");
      setNotifications(res.data?.payload || []);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load notifications.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  const handleMarkRead = async (id) => {
    try {
      await axiosInstance.put(`/notification-api/mark-read/${id}`);
      // Update local state immediately — no full refetch needed
      setNotifications((prev) =>
        prev.map((n) => (n._id === id ? { ...n, isRead: true } : n))
      );
      // Decrement the navbar badge
      dispatch(decrementUnread());
    } catch (err) {
      // Silent fail — notification stays unread, user can retry
      console.error("Mark read failed:", err.message);
    }
  };

  const handleMarkAllRead = async () => {
    const unread = notifications.filter((n) => !n.isRead);
    // Fire all in parallel
    await Promise.allSettled(
      unread.map((n) => axiosInstance.put(`/notification-api/mark-read/${n._id}`))
    );
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
    // Re-sync the badge from the server
    dispatch(fetchUnreadCount());
  };

  // Filtered list
  const displayed =
    filter === "UNREAD" ? notifications.filter((n) => !n.isRead)
    : filter === "READ"  ? notifications.filter((n) =>  n.isRead)
    : notifications;

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  return (
    <div className={pageBackground}>
      <div className={pageWrapper}>

        {/* ── Header ──────────────────────────── */}
        <div className="flex items-start justify-between mb-8 flex-wrap gap-4">
          <div>
            <p className="text-[#c0152a] text-xs font-bold uppercase tracking-widest mb-2">
              Inbox
            </p>
            <h1 className={pageTitleClass}>Notifications</h1>
            <p className={`${bodyText} mt-2`}>
              {unreadCount > 0
                ? `You have ${unreadCount} unread notification${unreadCount !== 1 ? "s" : ""}.`
                : "You're all caught up."}
            </p>
          </div>

          {/* Mark all read button */}
          {unreadCount > 0 && (
            <button
              onClick={handleMarkAllRead}
              className="text-sm font-semibold text-[#c0152a] hover:text-[#960f20]
                         transition-colors cursor-pointer self-start mt-1"
            >
              Mark all as read
            </button>
          )}
        </div>

        {/* ── Filter tabs ──────────────────────── */}
        <div className="flex gap-1 border-b border-[#e4e4e4] mb-8">
          {[
            { key: "ALL",    label: "All",    count: notifications.length },
            { key: "UNREAD", label: "Unread", count: unreadCount },
            { key: "READ",   label: "Read",   count: notifications.length - unreadCount },
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => setFilter(tab.key)}
              className={`text-sm px-4 py-2.5 border-b-2 -mb-px cursor-pointer
                          whitespace-nowrap transition-colors ${
                filter === tab.key
                  ? "font-semibold text-[#c0152a] border-[#c0152a]"
                  : "font-medium text-[#6b6b6b] border-transparent hover:text-[#1a1a1a]"
              }`}
            >
              {tab.label}
              {tab.count > 0 && (
                <span className={`ml-1.5 text-[10px] font-bold px-1.5 py-0.5 rounded-full ${
                  filter === tab.key
                    ? "bg-[#c0152a]/10 text-[#c0152a]"
                    : "bg-[#f4f4f4] text-[#9e9e9e]"
                }`}>
                  {tab.count}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* ── States ───────────────────────────── */}
        {loading && <p className={loadingClass}>Loading notifications…</p>}
        {error   && (
          <div className={`${errorClass} mb-6`}>
            {error}{" "}
            <button
              onClick={fetchNotifications}
              className="underline font-semibold ml-1 cursor-pointer"
            >
              Retry
            </button>
          </div>
        )}

        {!loading && !error && displayed.length === 0 && (
          <p className={emptyStateClass}>
            {filter === "UNREAD" ? "No unread notifications."
            : filter === "READ"  ? "No read notifications yet."
            : "No notifications yet."}
          </p>
        )}

        {/* ── Notification list ─────────────────── */}
        {!loading && displayed.length > 0 && (
          <div className="flex flex-col gap-3">
            {displayed.map((n) => (
              <NotifCard
                key={n._id}
                notif={n}
                onMarkRead={handleMarkRead}
              />
            ))}
          </div>
        )}

      </div>
    </div>
  );
}

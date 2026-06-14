// src/pages/public/RequestDetail.jsx
// Shows full details of a blood request.
// DONOR   → can Accept (if OPEN) or Complete (if already accepted)
// REQUESTER (owner) → can Edit, Close, Delete
// ADMIN   → can Force Close
// Public  → read-only view

import { useEffect, useState, useCallback } from "react";
import { useParams, useNavigate, Link } from "react-router";
import { useSelector } from "react-redux";
import toast from "react-hot-toast";
import axiosInstance from "../../api/axiosInstance";
import {
  selectUser,
  selectRole,
  selectIsAuth,
} from "../../store/authSlice";
import {
  pageBackground,
  requestPageWrapper,
  requestMainTitle,
  requestMetaRow,
  requestInfoRow,
  requestFooter,
  requestActions,
  detailGrid,
  detailLabel,
  detailValue,
  progressTrack,
  progressFill,
  progressFillSuccess,
  requestNumberClass,
  bloodGroupBadge,
  getStatusClass,
  getAlertClass,
  acceptBtn,
  completeBtn,
  editBtn,
  closeBtn,
  deleteBtn,
  forceCloseBtn,
  errorClass,
  loadingClass,
  mutedText,
  divider,
  bodyText,
} from "../../styles/common";
import { formatDate, formatDateTime, timeAgo } from "../../utils/formatDate";

export default function RequestDetail() {
  const { requestNumber }         = useParams();
  const navigate                  = useNavigate();
  const user                      = useSelector(selectUser);
  const role                      = useSelector(selectRole);
  const isAuth                    = useSelector(selectIsAuth);

  const [request, setRequest]     = useState(null);
  const [loading, setLoading]     = useState(true);
  const [error, setError]         = useState("");
  const [actionLoading, setActionLoading] = useState("");

  const fetchRequest = useCallback(async () => {
    try {
      setLoading(true);
      setError("");
      const res = await axiosInstance.get(`/request-api/request/${requestNumber}`);
      setRequest(res.data?.payload);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load request details.");
    } finally {
      setLoading(false);
    }
  }, [requestNumber]);

  useEffect(() => {
    fetchRequest();
  }, [fetchRequest]);

  if (loading) return <div className={pageBackground}><p className={`${loadingClass} pt-32`}>Loading request…</p></div>;
  if (error)   return <div className={pageBackground}><div className={`${errorClass} max-w-xl mx-auto mt-20`}>{error}</div></div>;
  if (!request) return null;

  const req        = request;
  const fulfilled  = req.unitsFulfilled ?? 0;
  const required   = req.unitsRequired  ?? 1;
  const pct        = Math.min(100, Math.round((fulfilled / required) * 100));
  const isDone     = fulfilled >= required;

  // Determine donor's relationship to this request
  const userId           = user?.id || user?._id;
  const hasAccepted      = req.acceptedDonors?.some(
    (d) => String(d.donorId || d) === String(userId)
  );
  const hasCompleted     = req.completedDonors?.some(
    (d) => String(d.donorId || d) === String(userId)
  );
  const isOwner          = String(req.requestCreatedBy?._id || req.requestCreatedBy) === String(userId);
  const isOpen           = req.status === "OPEN";

  // ── Action handlers ─────────────────────────────────

  const handleAccept = async () => {
    try {
      setActionLoading("accept");
      await axiosInstance.put("/donor-api/accept-request", { requestNumber: req.requestNumber });
      toast.success("Request accepted! Head to the hospital and donate.");
      fetchRequest();
    } catch (err) {
      toast.error(err.response?.data?.message || "Could not accept request.");
    } finally {
      setActionLoading("");
    }
  };

  const handleComplete = async () => {
    try {
      setActionLoading("complete");
      await axiosInstance.put("/donor-api/complete-donation", { requestNumber: req.requestNumber });
      toast.success("Donation marked complete. Thank you for saving a life! 🩸");
      fetchRequest();
    } catch (err) {
      toast.error(err.response?.data?.message || "Could not complete donation.");
    } finally {
      setActionLoading("");
    }
  };

  const handleClose = async () => {
    if (!window.confirm("Close this request? It will no longer accept donors.")) return;
    try {
      setActionLoading("close");
      await axiosInstance.patch("/request-api/close-request", { requestNumber: req.requestNumber });
      toast.success("Request closed.");
      fetchRequest();
    } catch (err) {
      toast.error(err.response?.data?.message || "Could not close request.");
    } finally {
      setActionLoading("");
    }
  };

  const handleDelete = async () => {
    if (!window.confirm("Delete this request? This cannot be undone.")) return;
    try {
      setActionLoading("delete");
      await axiosInstance.patch("/request-api/delete-request", { requestNumber: req.requestNumber });
      toast.success("Request deleted.");
      navigate("/requests");
    } catch (err) {
      toast.error(err.response?.data?.message || "Could not delete request.");
    } finally {
      setActionLoading("");
    }
  };

  const handleForceClose = async () => {
    if (!window.confirm("Force close this request as admin?")) return;
    try {
      setActionLoading("forceClose");
      await axiosInstance.patch("/admin-api/force-close-request", { requestNumber: req.requestNumber });
      toast.success("Request force closed.");
      fetchRequest();
    } catch (err) {
      toast.error(err.response?.data?.message || "Could not force close request.");
    } finally {
      setActionLoading("");
    }
  };

  const busy = (key) => actionLoading === key;

  return (
    <div className={pageBackground}>
      <div className={requestPageWrapper}>

        {/* Back */}
        <button
          onClick={() => navigate(-1)}
          className="text-xs text-[#9e9e9e] hover:text-[#1a1a1a] transition-colors mb-8 flex items-center gap-1 cursor-pointer"
        >
          ← Back to requests
        </button>

        {/* ── Header ─────────────────────────────── */}
        <div className="mb-6 flex flex-col gap-3">
          {/* Badges row */}
          <div className="flex items-center gap-2 flex-wrap">
            <span className={bloodGroupBadge}>{req.bloodGroup}</span>
            <span className={getAlertClass(req.alertLevel)}>{req.alertLevel}</span>
            <span className={getStatusClass(req.status)}>{req.status}</span>
          </div>

          {/* Title */}
          <h1 className={requestMainTitle}>
            {req.patientName}, {req.patientAge}
            {req.patientGender ? ` · ${req.patientGender}` : ""}
          </h1>

          {/* Request number */}
          <span className={requestNumberClass}>{req.requestNumber}</span>
        </div>

        {/* ── Meta row ───────────────────────────── */}
        <div className={requestMetaRow}>
          <div className="flex items-center gap-6 flex-wrap text-sm text-[#6b6b6b]">
            <span>📍 {req.hospitalName}, {req.state}</span>
            <span>🕐 {timeAgo(req.createdAt)}</span>
            {req.requiredByDate && (
              <span>📅 Needed by {formatDate(req.requiredByDate)}</span>
            )}
          </div>
        </div>

        {/* ── Units progress ──────────────────────── */}
        <div className="mt-7 mb-6 bg-[#f4f4f4] rounded-xl p-5">
          <div className="flex items-center justify-between mb-3">
            <div>
              <p className="text-xs font-semibold text-[#9e9e9e] uppercase tracking-widest mb-0.5">
                Units fulfilled
              </p>
              <p className="text-2xl font-bold text-[#1a1a1a] tracking-tight">
                {fulfilled}
                <span className="text-base font-medium text-[#9e9e9e]"> / {required}</span>
              </p>
            </div>
            <span className={`text-2xl font-bold ${isDone ? "text-[#16a34a]" : "text-[#c0152a]"}`}>
              {pct}%
            </span>
          </div>
          <div className={progressTrack}>
            <div
              className={isDone ? progressFillSuccess : progressFill}
              style={{ width: `${pct}%` }}
            />
          </div>
          <p className="text-xs text-[#9e9e9e] mt-2">
            {isDone
              ? "All units have been fulfilled. Thank you to all donors!"
              : `${required - fulfilled} unit${required - fulfilled !== 1 ? "s" : ""} still needed`}
          </p>
        </div>

        {/* ── Action buttons ──────────────────────── */}
        {isAuth && (
          <div className={requestActions}>

            {/* DONOR actions */}
            {role === "DONOR" && isOpen && !hasCompleted && (
              <>
                {!hasAccepted && (
                  <button
                    onClick={handleAccept}
                    disabled={!!actionLoading}
                    className={`${acceptBtn} ${actionLoading ? "opacity-60 cursor-not-allowed" : ""}`}
                  >
                    {busy("accept") ? "Accepting…" : "Accept request"}
                  </button>
                )}
                {hasAccepted && (
                  <button
                    onClick={handleComplete}
                    disabled={!!actionLoading}
                    className={`${completeBtn} ${actionLoading ? "opacity-60 cursor-not-allowed" : ""}`}
                  >
                    {busy("complete") ? "Completing…" : "Mark donation complete"}
                  </button>
                )}
              </>
            )}

            {hasCompleted && (
              <span className="text-xs font-semibold text-[#16a34a] bg-[#16a34a]/10 px-3 py-2 rounded-full">
                ✓ You donated for this request
              </span>
            )}

            {/* REQUESTER / ADMIN (owner) actions */}
            {(isOwner || role === "ADMIN") && isOpen && (
              <>
                <button
                  onClick={() => navigate(`/requester/edit/${req.requestNumber}`)}
                  disabled={!!actionLoading}
                  className={editBtn}
                >
                  Edit
                </button>
                <button
                  onClick={handleClose}
                  disabled={!!actionLoading}
                  className={`${closeBtn} ${actionLoading ? "opacity-60 cursor-not-allowed" : ""}`}
                >
                  {busy("close") ? "Closing…" : "Close request"}
                </button>
                <button
                  onClick={handleDelete}
                  disabled={!!actionLoading}
                  className={`${deleteBtn} ${actionLoading ? "opacity-60 cursor-not-allowed" : ""}`}
                >
                  {busy("delete") ? "Deleting…" : "Delete"}
                </button>
              </>
            )}

            {/* ADMIN-only force close */}
            {role === "ADMIN" && !isOwner && isOpen && (
              <button
                onClick={handleForceClose}
                disabled={!!actionLoading}
                className={`${forceCloseBtn} ${actionLoading ? "opacity-60 cursor-not-allowed" : ""}`}
              >
                {busy("forceClose") ? "Closing…" : "Force close (Admin)"}
              </button>
            )}

          </div>
        )}

        {!isAuth && isOpen && (
          <div className="mt-6 bg-[#f4f4f4] rounded-xl px-5 py-4 text-sm text-[#6b6b6b]">
            <Link to="/login" className="text-[#c0152a] font-semibold hover:text-[#960f20]">
              Sign in as a donor
            </Link>{" "}
            to accept this request and help.
          </div>
        )}

        {/* ── Detail info grid ────────────────────── */}
        <div className={divider} />

        <h2 className="text-base font-bold text-[#1a1a1a] mb-4 tracking-tight">Request details</h2>

        <div className={detailGrid}>
          <div>
            <p className={detailLabel}>Hospital</p>
            <p className={detailValue}>{req.hospitalName}</p>
          </div>
          <div>
            <p className={detailLabel}>Hospital address</p>
            <p className={detailValue}>{req.hospitalAddress || "—"}</p>
          </div>
          <div>
            <p className={detailLabel}>State</p>
            <p className={detailValue}>{req.state}</p>
          </div>
          <div>
            <p className={detailLabel}>Blood group</p>
            <p className={detailValue}>{req.bloodGroup}</p>
          </div>
          <div>
            <p className={detailLabel}>Patient name</p>
            <p className={detailValue}>{req.patientName}</p>
          </div>
          <div>
            <p className={detailLabel}>Patient age</p>
            <p className={detailValue}>{req.patientAge} yrs · {req.patientGender || "—"}</p>
          </div>
          <div>
            <p className={detailLabel}>Contact person</p>
            <p className={detailValue}>{req.contactPerson || "—"}</p>
          </div>
          <div>
            <p className={detailLabel}>Contact number</p>
            <p className={detailValue}>{req.contactNumber || "—"}</p>
          </div>
          <div>
            <p className={detailLabel}>Required by date</p>
            <p className={detailValue}>{req.requiredByDate ? formatDate(req.requiredByDate) : "—"}</p>
          </div>
          <div>
            <p className={detailLabel}>Expires at</p>
            <p className={detailValue}>{req.expiresAt ? formatDate(req.expiresAt) : "—"}</p>
          </div>
          <div>
            <p className={detailLabel}>Accepted donors</p>
            <p className={detailValue}>{req.acceptedDonors?.length ?? 0}</p>
          </div>
          <div>
            <p className={detailLabel}>Completed donors</p>
            <p className={detailValue}>{req.completedDonors?.length ?? 0}</p>
          </div>
        </div>

        {/* ── Footer ─────────────────────────────── */}
        <div className={requestFooter}>
          <div className="flex items-center justify-between flex-wrap gap-2">
            <span>Posted {formatDateTime(req.createdAt)}</span>
            {req.updatedAt && req.updatedAt !== req.createdAt && (
              <span>Last updated {timeAgo(req.updatedAt)}</span>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}

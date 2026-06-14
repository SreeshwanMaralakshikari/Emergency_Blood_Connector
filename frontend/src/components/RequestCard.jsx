// src/components/RequestCard.jsx
// Reusable card shown on the Open Requests listing page.
// Clicking navigates to the full detail page.

import { useNavigate } from "react-router";
import {
  requestCardClass,
  requestNumberClass,
  requestTitle,
  requestMeta,
  bloodGroupBadge,
  progressTrack,
  progressFill,
  progressFillSuccess,
  getStatusClass,
  getAlertClass,
  timestampClass,
} from "../styles/common";
import { timeAgo } from "../utils/formatDate";

export default function RequestCard({ req }) {
  const navigate = useNavigate();

  const fulfilled  = req.unitsFulfilled ?? 0;
  const required   = req.unitsRequired  ?? 1;
  const pct        = Math.min(100, Math.round((fulfilled / required) * 100));
  const isDone     = fulfilled >= required;

  return (
    <div
      className={requestCardClass}
      onClick={() => navigate(`/requests/${req.requestNumber}`)}
    >
      {/* Top row — blood group + alert + status */}
      <div className="flex items-center gap-2 flex-wrap">
        <span className={bloodGroupBadge}>{req.bloodGroup}</span>
        <span className={getAlertClass(req.alertLevel)}>{req.alertLevel}</span>
        <span className={getStatusClass(req.status)}>{req.status}</span>
      </div>

      {/* Patient & hospital */}
      <p className={requestTitle}>
        {req.patientName}, {req.patientAge}
        {req.patientGender ? ` · ${req.patientGender}` : ""}
      </p>
      <p className={requestMeta}>
        {req.hospitalName} · {req.state}
      </p>

      {/* Units progress */}
      <div className="flex flex-col gap-1 mt-1">
        <div className="flex justify-between items-center">
          <span className="text-xs text-[#6b6b6b] font-medium">
            {fulfilled} / {required} units
          </span>
          <span className="text-xs text-[#9e9e9e]">{pct}%</span>
        </div>
        <div className={progressTrack}>
          <div
            className={isDone ? progressFillSuccess : progressFill}
            style={{ width: `${pct}%` }}
          />
        </div>
      </div>

      {/* Request number + time */}
      <div className="flex items-center justify-between mt-1">
        <span className={requestNumberClass}>{req.requestNumber}</span>
        <span className={timestampClass}>{timeAgo(req.createdAt)}</span>
      </div>
    </div>
  );
}

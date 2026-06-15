//shows all blood requests across status tabs — admin can force close any OPEN request

import { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router";
import axiosInstance from "../../api/axiosInstance";
import toast from "react-hot-toast";
import {
  pageBackground, pageWrapper, pageTitleClass, bodyText, mutedText,
  loadingClass, errorClass, emptyStateClass,
  tableWrapper, tableClass, tableHead, tableTh, tableTr, tableTd, tableTdMuted,
  getStatusClass, getAlertClass, bloodGroupBadge,
  requestNumberClass, inputClass,
} from "../../styles/common";
import { formatDate, timeAgo } from "../../utils/formatDate";

const TABS = [
  { key: "all",       label: "All",       endpoint: "/admin-api/requests"           },
  { key: "open",      label: "Open",      endpoint: "/admin-api/open-requests"      },
  { key: "fulfilled", label: "Fulfilled", endpoint: "/admin-api/fulfilled-requests" },
  { key: "deleted",   label: "Deleted",   endpoint: "/admin-api/deleted-requests"   },
];

function RequestRow({ req, onForceClose, forcing }) {
  const navigate   = useNavigate();
  const isOpen     = req.status === "OPEN";
  const isForcible = isOpen;

  return (
    <tr className={tableTr}>
      {/* Request number */}
      <td className={tableTd}>
        <button
          onClick={() => navigate(`/requests/${req.requestNumber}`)}
          className={`${requestNumberClass} cursor-pointer hover:text-[#c0152a] transition-colors`}
        >
          {req.requestNumber}
        </button>
      </td>

      {/* Blood group */}
      <td className={tableTd}>
        <span className={bloodGroupBadge} style={{ fontSize: "0.72rem", padding: "2px 8px" }}>
          {req.bloodGroup}
        </span>
      </td>

      {/* Patient */}
      <td className={tableTd}>
        <p className="text-sm font-semibold text-[#1a1a1a]">{req.patientName}</p>
        <p className="text-xs text-[#9e9e9e]">{req.hospitalName}</p>
      </td>

      {/* State */}
      <td className={tableTdMuted}>{req.state}</td>

      {/* Alert */}
      <td className={tableTd}>
        <span className={getAlertClass(req.alertLevel)}>{req.alertLevel}</span>
      </td>

      {/* Status */}
      <td className={tableTd}>
        <span className={getStatusClass(req.status)}>{req.status}</span>
      </td>

      {/* Units */}
      <td className={tableTdMuted}>
        {req.unitsFulfilled ?? 0} / {req.unitsRequired ?? 0}
      </td>

      {/* Created */}
      <td className={tableTdMuted}>{timeAgo(req.createdAt)}</td>

      {/* Actions */}
      <td className={tableTd}>
        <div className="flex items-center gap-2">
          <button
            onClick={() => navigate(`/requests/${req.requestNumber}`)}
            className="text-xs font-semibold text-[#0369a1] hover:text-[#075985]
                       transition-colors cursor-pointer"
          >
            View
          </button>
          {isForcible && (
            <button
              onClick={() => onForceClose(req.requestNumber)}
              disabled={forcing === req.requestNumber}
              className={`text-xs font-semibold text-[#dc2626] hover:text-[#b91c1c]
                          transition-colors cursor-pointer ${
                forcing === req.requestNumber ? "opacity-50 cursor-not-allowed" : ""
              }`}
            >
              {forcing === req.requestNumber ? "Closing…" : "Force close"}
            </button>
          )}
        </div>
      </td>
    </tr>
  );
}

export default function AdminRequests() {
  const [requests, setRequests]   = useState([]);
  const [filtered, setFiltered]   = useState([]);
  const [tab, setTab]             = useState("all");
  const [search, setSearch]       = useState("");
  const [loading, setLoading]     = useState(true);
  const [error, setError]         = useState("");
  const [forcing, setForcing]     = useState("");

  const fetchRequests = useCallback(async (endpoint) => {
    try {
      setLoading(true);
      setError("");
      const res = await axiosInstance.get(endpoint);
      setRequests(res.data?.payload || []);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load requests.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const t = TABS.find((t) => t.key === tab);
    if (t) fetchRequests(t.endpoint);
  }, [tab, fetchRequests]);

  //client-side search
  useEffect(() => {
    if (!search.trim()) { setFiltered(requests); return; }
    const q = search.toLowerCase();
    setFiltered(requests.filter((r) =>
      r.requestNumber?.toLowerCase().includes(q) ||
      r.patientName?.toLowerCase().includes(q)   ||
      r.hospitalName?.toLowerCase().includes(q)  ||
      r.state?.toLowerCase().includes(q)          ||
      r.bloodGroup?.toLowerCase().includes(q)
    ));
  }, [requests, search]);

  const handleForceClose = async (requestNumber) => {
    if (!window.confirm(`Force close request ${requestNumber}?`)) return;
    try {
      setForcing(requestNumber);
      await axiosInstance.patch("/admin-api/force-close-request", { requestNumber });
      toast.success("Request force closed.");
      //if on the open tab, remove it from the list; otherwise update status
      setRequests((prev) =>
        tab === "open"
          ? prev.filter((r) => r.requestNumber !== requestNumber)
          : prev.map((r) => r.requestNumber === requestNumber ? { ...r, status: "CLOSED" } : r)
      );
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to force close request.");
    } finally {
      setForcing("");
    }
  };

  return (
    <div className={pageBackground}>
      <div className={pageWrapper}>

        {/* Header */}
        <div className="mb-8">
          <p className="text-[#c0152a] text-xs font-bold uppercase tracking-widest mb-2">
            Admin · Requests
          </p>
          <h1 className={pageTitleClass}>Request management</h1>
          <p className={`${bodyText} mt-2`}>
            Browse all blood requests. Force close any open request if needed.
          </p>
        </div>

        {/* Tabs + search */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div className="flex gap-1 border-b border-[#e4e4e4] overflow-x-auto">
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
            placeholder="Search requests…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className={`${inputClass} max-w-xs`}
          />
        </div>

        {!loading && (
          <p className={`${mutedText} mb-4`}>
            {filtered.length} request{filtered.length !== 1 ? "s" : ""}
          </p>
        )}

        {loading && <p className={loadingClass}>Loading requests…</p>}
        {error   && <div className={errorClass}>{error}</div>}

        {!loading && !error && filtered.length === 0 && (
          <p className={emptyStateClass}>No requests found.</p>
        )}

        {/* Table */}
        {!loading && filtered.length > 0 && (
          <div className={tableWrapper}>
            <table className={tableClass}>
              <thead className={tableHead}>
                <tr>
                  {["Request no.", "Blood", "Patient · Hospital", "State",
                    "Alert", "Status", "Units", "Created", "Actions"].map((h) => (
                    <th key={h} className={tableTh}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map((r) => (
                  <RequestRow
                    key={r._id}
                    req={r}
                    onForceClose={handleForceClose}
                    forcing={forcing}
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

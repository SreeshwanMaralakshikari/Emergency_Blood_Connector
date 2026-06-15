//public page — no auth required
//shows all OPEN blood requests with blood group + alert level filters

import { useEffect, useState, useCallback } from "react";
import axiosInstance from "../../api/axiosInstance";
import RequestCard from "../../components/RequestCard";
import {
  pageBackground, pageWrapper, pageTitleClass, bodyText, mutedText,
  selectClass, inputClass, emptyStateClass, loadingClass, errorClass,
  requestGrid,
} from "../../styles/common";

const BLOOD_GROUPS = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"];
const ALERT_LEVELS = ["GREEN", "YELLOW", "RED", "BLACK"];

export default function OpenRequests() {
  const [requests, setRequests]     = useState([]);
  const [filtered, setFiltered]     = useState([]);
  const [loading, setLoading]       = useState(true);
  const [error, setError]           = useState("");

  //filters
  const [bloodGroup, setBloodGroup] = useState("");
  const [alertLevel, setAlertLevel] = useState("");
  const [search, setSearch]         = useState("");

  const fetchRequests = useCallback(async () => {
    try {
      setLoading(true);
      setError("");
      const res = await axiosInstance.get("/request-api/open-requests");
      setRequests(res.data?.payload || []);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load requests. Please try again.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchRequests();
  }, [fetchRequests]);

  //client-side filtering
  useEffect(() => {
    let list = [...requests];
    if (bloodGroup) list = list.filter((r) => r.bloodGroup === bloodGroup);
    if (alertLevel) list = list.filter((r) => r.alertLevel === alertLevel);
    if (search.trim()) {
      const q = search.trim().toLowerCase();
      list = list.filter(
        (r) =>
          r.patientName?.toLowerCase().includes(q) ||
          r.hospitalName?.toLowerCase().includes(q) ||
          r.state?.toLowerCase().includes(q) ||
          r.requestNumber?.toLowerCase().includes(q)
      );
    }
    setFiltered(list);
  }, [requests, bloodGroup, alertLevel, search]);

  const clearFilters = () => {
    setBloodGroup("");
    setAlertLevel("");
    setSearch("");
  };

  const hasFilters = bloodGroup || alertLevel || search;

  return (
    <div className={pageBackground}>
      <div className={pageWrapper}>

        {/* Header */}
        <div className="mb-8">
          <p className="text-[#c0152a] text-xs font-bold uppercase tracking-widest mb-2">
            Live requests
          </p>
          <h1 className={pageTitleClass}>Open blood requests</h1>
          <p className={`${bodyText} mt-2`}>
            These requests need donors right now. Filter by blood group or urgency to find where you can help.
          </p>
        </div>

        {/* Filters */}
        <div className="bg-[#f4f4f4] rounded-xl p-5 mb-8">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">

            {/* Search */}
            <input
              type="text"
              placeholder="Search by patient, hospital, or state…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className={inputClass}
            />

            {/* Blood group */}
            <select
              value={bloodGroup}
              onChange={(e) => setBloodGroup(e.target.value)}
              className={selectClass}
            >
              <option value="">All blood groups</option>
              {BLOOD_GROUPS.map((bg) => (
                <option key={bg} value={bg}>{bg}</option>
              ))}
            </select>

            {/* Alert level */}
            <select
              value={alertLevel}
              onChange={(e) => setAlertLevel(e.target.value)}
              className={selectClass}
            >
              <option value="">All alert levels</option>
              {ALERT_LEVELS.map((al) => (
                <option key={al} value={al}>{al}</option>
              ))}
            </select>

          </div>

          {/* Filter status */}
          <div className="flex items-center justify-between mt-3">
            <p className={mutedText}>
              {loading ? "Loading…" : `${filtered.length} request${filtered.length !== 1 ? "s" : ""} found`}
            </p>
            {hasFilters && (
              <button
                onClick={clearFilters}
                className="text-xs text-[#c0152a] font-semibold hover:text-[#960f20] transition-colors cursor-pointer"
              >
                Clear filters
              </button>
            )}
          </div>
        </div>

        {/* Error */}
        {error && (
          <div className={`${errorClass} mb-6`}>
            {error}{" "}
            <button onClick={fetchRequests} className="underline font-semibold ml-1 cursor-pointer">
              Retry
            </button>
          </div>
        )}

        {/* Loading */}
        {loading && <p className={loadingClass}>Loading open requests…</p>}

        {/* Empty */}
        {!loading && !error && filtered.length === 0 && (
          <div className={emptyStateClass}>
            {hasFilters
              ? "No requests match your filters. Try broadening your search."
              : "No open requests at the moment. Check back soon."}
          </div>
        )}

        {/* Grid */}
        {!loading && filtered.length > 0 && (
          <div className={requestGrid}>
            {filtered.map((req) => (
              <RequestCard key={req._id} req={req} />
            ))}
          </div>
        )}

      </div>
    </div>
  );
}

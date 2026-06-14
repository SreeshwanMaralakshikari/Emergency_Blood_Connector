// src/pages/requester/MyRequests.jsx

import { useEffect, useState, useCallback } from "react";
import { Link } from "react-router";
import axiosInstance from "../../api/axiosInstance";
import RequestCard from "../../components/RequestCard";
import {
  pageBackground, pageWrapper, pageTitleClass, bodyText, mutedText,
  loadingClass, errorClass, emptyStateClass,
  requestGrid, sectionHeader, sectionTitle,
  primaryBtn, selectClass,
} from "../../styles/common";

const STATUS_FILTERS = ["ALL", "OPEN", "FULFILLED", "CLOSED", "EXPIRED", "DELETED"];

export default function MyRequests() {
  const [requests, setRequests]   = useState([]);
  const [filtered, setFiltered]   = useState([]);
  const [status, setStatus]       = useState("ALL");
  const [loading, setLoading]     = useState(true);
  const [error, setError]         = useState("");

  const fetchRequests = useCallback(async () => {
    try {
      setLoading(true);
      setError("");
      const res = await axiosInstance.get("/request-api/my-requests");
      setRequests(res.data?.payload || []);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load your requests.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchRequests(); }, [fetchRequests]);

  // Client-side status filter
  useEffect(() => {
    setFiltered(
      status === "ALL"
        ? requests
        : requests.filter((r) => r.status === status)
    );
  }, [requests, status]);

  // Count by status for the tab badges
  const countBy = (s) => requests.filter((r) => r.status === s).length;

  return (
    <div className={pageBackground}>
      <div className={pageWrapper}>

        {/* Header */}
        <div className="flex items-start justify-between mb-8 flex-wrap gap-4">
          <div>
            <p className="text-[#c0152a] text-xs font-bold uppercase tracking-widest mb-2">
              My requests
            </p>
            <h1 className={pageTitleClass}>All blood requests</h1>
            <p className={`${bodyText} mt-2`}>
              Manage and track all the blood requests you've created.
            </p>
          </div>
          <Link to="/requester/create" className={primaryBtn}>
            + New request
          </Link>
        </div>

        {/* Status filter tabs */}
        <div className="flex gap-1 border-b border-[#e4e4e4] mb-8 overflow-x-auto">
          {STATUS_FILTERS.map((s) => {
            const count  = s === "ALL" ? requests.length : countBy(s);
            const active = status === s;
            return (
              <button
                key={s}
                onClick={() => setStatus(s)}
                className={`text-sm px-4 py-2.5 border-b-2 -mb-px cursor-pointer whitespace-nowrap transition-colors ${
                  active
                    ? "font-semibold text-[#c0152a] border-[#c0152a]"
                    : "font-medium text-[#6b6b6b] border-transparent hover:text-[#1a1a1a]"
                }`}
              >
                {s}
                {count > 0 && (
                  <span className={`ml-1.5 text-[10px] font-bold px-1.5 py-0.5 rounded-full ${
                    active ? "bg-[#c0152a]/10 text-[#c0152a]" : "bg-[#f4f4f4] text-[#9e9e9e]"
                  }`}>
                    {count}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* States */}
        {loading && <p className={loadingClass}>Loading your requests…</p>}
        {error   && (
          <div className={`${errorClass} mb-6`}>
            {error}{" "}
            <button onClick={fetchRequests} className="underline font-semibold ml-1 cursor-pointer">
              Retry
            </button>
          </div>
        )}

        {!loading && !error && filtered.length === 0 && (
          <div className={emptyStateClass}>
            {status === "ALL"
              ? <>No requests yet. <Link to="/requester/create" className="text-[#c0152a] font-semibold">Create one.</Link></>
              : `No ${status.toLowerCase()} requests.`}
          </div>
        )}

        {/* Grid */}
        {!loading && filtered.length > 0 && (
          <>
            <p className={`${mutedText} mb-4`}>
              {filtered.length} request{filtered.length !== 1 ? "s" : ""}
            </p>
            <div className={requestGrid}>
              {filtered.map((req) => (
                <RequestCard key={req._id} req={req} />
              ))}
            </div>
          </>
        )}

      </div>
    </div>
  );
}

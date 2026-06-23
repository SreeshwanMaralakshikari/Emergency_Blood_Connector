import { useEffect, useState } from "react";
import axiosInstance from "../../api/axiosInstance";
import {
  pageBackground, pageWrapper, pageTitleClass, bodyText, mutedText,
  loadingClass, errorClass, emptyStateClass,
  requestNumberClass, getAlertClass, pointsPill,
} from "../../styles/common";
import { formatDate } from "../../utils/formatDate";

function DonationRow({ donation }) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between
                    border-b border-[#f4f4f4] py-4 gap-3">
      <div className="flex flex-col gap-1">
        <div className="flex items-center gap-2 flex-wrap">
          <span className={requestNumberClass}>{donation.requestNumber}</span>
          <span className={getAlertClass(donation.alertLevel)}>{donation.alertLevel}</span>
        </div>
        <p className="text-sm text-[#6b6b6b] mt-0.5">
          {donation.unitsDonated} unit{donation.unitsDonated !== 1 ? "s" : ""} donated
          {donation.donationDate ? ` · ${formatDate(donation.donationDate)}` : ""}
        </p>
        {/* Only show next eligible date for CONFIRMED donations — cooldown is only active after confirmation */}
        {donation.status === "CONFIRMED" && donation.nextEligibleDonationDate && (
          <p className="text-xs text-[#9e9e9e]">
            Next eligible: {formatDate(donation.nextEligibleDonationDate)}
          </p>
        )}
      </div>
      <div className="flex items-center gap-3 shrink-0">
        {/* Only show points pill for confirmed donations — pending ones have not been awarded yet */}
        {donation.status === "CONFIRMED" && (
          <span className={pointsPill}>+{donation.pointsAwarded} pts</span>
        )}
        <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wide ${donation.status === "CONFIRMED" ? "bg-[#16a34a]/10 text-[#15803d]" : "bg-[#d97706]/10 text-[#d97706]"}`}>
          {donation.status === "PENDING" ? "Awaiting confirmation" : donation.status}
        </span>
      </div>
    </div>
  );
}

export default function DonationHistory() {
  const [donations, setDonations] = useState([]);
  const [loading, setLoading]     = useState(true);
  const [error, setError]         = useState("");

  useEffect(() => {
    const load = async () => {
      try {
        const res = await axiosInstance.get("/donor-api/donation-history");
        setDonations(res.data?.payload || []);
      } catch (err) {
        setError(err.response?.data?.message || "Failed to load donation history.");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  //totals
  //only count CONFIRMED donations for points and units (PENDING ones are not yet awarded)
  const totalPoints = donations.filter((d) => d.status === "CONFIRMED").reduce((s, d) => s + (d.pointsAwarded || 0), 0);
  const totalUnits  = donations.filter((d) => d.status === "CONFIRMED").reduce((s, d) => s + (d.unitsDonated  || 0), 0);

  return (
    <div className={pageBackground}>
      <div className={pageWrapper}>

        {/* Header */}
        <div className="mb-8">
          <p className="text-[#c0152a] text-xs font-bold uppercase tracking-widest mb-2">
            Donor activity
          </p>
          <h1 className={pageTitleClass}>Donation history</h1>
          <p className={`${bodyText} mt-2`}>
            Every donation you've completed, with points earned.
          </p>
        </div>

        {/* Summary strip */}
        {!loading && donations.length > 0 && (
          <div className="grid grid-cols-3 gap-4 mb-8">
            {[
              { label: "Confirmed donations", value: donations.filter((d) => d.status === "CONFIRMED").length },
              { label: "Units donated",   value: totalUnits },
              { label: "Points earned",   value: totalPoints },
            ].map((s) => (
              <div key={s.label} className="bg-[#f4f4f4] rounded-xl p-5">
                <p className="text-2xl font-bold text-[#1a1a1a] tracking-tight">{s.value}</p>
                <p className="text-[0.68rem] font-semibold text-[#9e9e9e] uppercase tracking-widest mt-0.5">
                  {s.label}
                </p>
              </div>
            ))}
          </div>
        )}

        {loading && <p className={loadingClass}>Loading history…</p>}
        {error   && <div className={errorClass}>{error}</div>}

        {!loading && !error && donations.length === 0 && (
          <p className={emptyStateClass}>
            No donations yet. Accept a blood request to get started.
          </p>
        )}

        {!loading && donations.length > 0 && (
          <div className="bg-white rounded-xl border border-[#e4e4e4] px-6">
            {donations.map((d) => (
              <DonationRow key={d._id} donation={d} />
            ))}
          </div>
        )}

      </div>
    </div>
  );
}

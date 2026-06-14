// src/pages/public/Home.jsx

import { Link } from "react-router";
import { useSelector } from "react-redux";
import { selectIsAuth, selectRole } from "../../store/authSlice";
import {
  primaryBtn,
  secondaryBtn,
  headingClass,
  bodyText,
  mutedText,
  divider,
  bloodGroupBadge,
} from "../../styles/common";

const BLOOD_GROUPS = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"];

const HOW_IT_WORKS = [
  {
    step: "01",
    title: "Request is created",
    body: "A requester submits a blood request with patient details, hospital, blood group, and urgency level. The request becomes visible to all donors immediately.",
  },
  {
    step: "02",
    title: "Donor accepts",
    body: "Available donors browse open requests filtered by blood group and location, and accept the one they can fulfil.",
  },
  {
    step: "03",
    title: "Donation is completed",
    body: "After donating at the hospital, the donor marks it complete. Points and badges are awarded automatically based on the alert level.",
  },
];

export default function Home() {
  const isAuth = useSelector(selectIsAuth);
  const role   = useSelector(selectRole);

  const ctaLink = isAuth
    ? role === "DONOR"      ? "/donor/dashboard"
    : role === "REQUESTER"  ? "/requester/dashboard"
    : role === "ADMIN"      ? "/admin/dashboard"
    : "/requests"
    : "/register";

  const ctaLabel = isAuth ? "Go to dashboard" : "Join as donor or requester";

  return (
    <div className="bg-[#fafafa] min-h-screen">

      {/* ── Hero ──────────────────────────────────────── */}
      <section className="max-w-5xl mx-auto px-6 pt-20 pb-16">
        <div className="max-w-2xl">
          <span className="inline-block text-[#c0152a] text-xs font-bold uppercase tracking-widest mb-4">
            Emergency Blood Connector
          </span>
          <h1 className="text-[3.25rem] font-bold text-[#1a1a1a] tracking-tighter leading-[1.1] mb-5">
            Every second counts.<br />
            Find blood, fast.
          </h1>
          <p className={`${bodyText} text-base max-w-lg mb-8`}>
            A platform connecting blood donors with patients in emergencies.
            Donors earn points and badges for every life they help save.
          </p>
          <div className="flex items-center gap-3 flex-wrap">
            <Link to={ctaLink} className={primaryBtn} style={{ fontSize: "0.9rem", padding: "0.65rem 1.4rem" }}>
              {ctaLabel}
            </Link>
            <Link to="/requests" className={secondaryBtn} style={{ fontSize: "0.9rem", padding: "0.65rem 1.4rem" }}>
              View open requests
            </Link>
          </div>
        </div>
      </section>

      {/* ── How it works ──────────────────────────────── */}
      <section className="max-w-5xl mx-auto px-6 py-16">
        <h2 className={`${headingClass} mb-10`}>How it works</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          {HOW_IT_WORKS.map((item) => (
            <div key={item.step} className="bg-[#f4f4f4] rounded-xl p-6 flex flex-col gap-3">
              <span className="text-4xl font-bold text-[#e4e4e4] tracking-tighter leading-none">
                {item.step}
              </span>
              <h3 className="text-base font-bold text-[#1a1a1a] tracking-tight">{item.title}</h3>
              <p className={`${bodyText} text-sm`}>{item.body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── Alert levels ──────────────────────────────── */}
      <section className="bg-white border-y border-[#e4e4e4]">
        <div className="max-w-5xl mx-auto px-6 py-14">
          <h2 className={`${headingClass} mb-2`}>Alert levels</h2>
          <p className={`${bodyText} mb-8`}>
            Requests are classified by urgency. Higher alert levels earn donors more points.
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {[
              { level: "GREEN",  points: 2,  desc: "Routine — can wait a few days" },
              { level: "YELLOW", points: 5,  desc: "Moderate — needed within 24–48 hrs" },
              { level: "RED",    points: 10, desc: "Critical — needed within hours" },
              { level: "BLACK",  points: 25, desc: "Catastrophic — immediate" },
            ].map((a) => (
              <div key={a.level} className="bg-[#f4f4f4] rounded-xl p-5 flex flex-col gap-2">
                <span className={`self-start text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wide ${
                  a.level === "GREEN"  ? "bg-[#16a34a]/10 text-[#15803d]" :
                  a.level === "YELLOW" ? "bg-[#d97706]/12 text-[#b45309]" :
                  a.level === "RED"    ? "bg-[#dc2626]/10 text-[#b91c1c]" :
                                         "bg-[#1a1a1a]/10 text-[#1a1a1a]"
                }`}>
                  {a.level}
                </span>
                <span className="text-xl font-bold text-[#c0152a]">{a.points} pts</span>
                <p className="text-xs text-[#6b6b6b] leading-relaxed">{a.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Blood groups ──────────────────────────────── */}
      <section className="max-w-5xl mx-auto px-6 py-14">
        <h2 className={`${headingClass} mb-2`}>All blood groups supported</h2>
        <p className={`${bodyText} mb-7`}>Requests and donor profiles cover all 8 ABO/Rh blood groups.</p>
        <div className="flex flex-wrap gap-3">
          {BLOOD_GROUPS.map((bg) => (
            <span key={bg} className={bloodGroupBadge} style={{ fontSize: "0.85rem" }}>
              {bg}
            </span>
          ))}
        </div>
      </section>

      {/* ── CTA bottom ────────────────────────────────── */}
      {!isAuth && (
        <section className="border-t border-[#e4e4e4] bg-[#f4f4f4]">
          <div className="max-w-5xl mx-auto px-6 py-14 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
            <div>
              <h2 className={`${headingClass} mb-1`}>Ready to make a difference?</h2>
              <p className={bodyText}>Join as a donor to start saving lives, or as a requester to post emergency needs.</p>
            </div>
            <div className="flex gap-3 shrink-0">
              <Link to="/register" className={primaryBtn}>Get started</Link>
              <Link to="/login" className={secondaryBtn}>Sign in</Link>
            </div>
          </div>
        </section>
      )}

    </div>
  );
}

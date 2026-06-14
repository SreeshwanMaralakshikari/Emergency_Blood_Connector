// src/components/Navbar.jsx

import { useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router";
import { useDispatch, useSelector } from "react-redux";
import toast from "react-hot-toast";

import { logoutUser, selectUser, selectRole, selectIsAuth } from "../store/authSlice";
import { fetchUnreadCount, selectUnreadCount }               from "../store/notifSlice";

import {
  navbarClass, navContainerClass, navBrandClass,
  navLinksClass, navLinkClass, navLinkActiveClass,
  primaryBtn, secondaryBtn, avatar,
} from "../styles/common";

const navLink = (path, current) =>
  current === path ? navLinkActiveClass : navLinkClass;

export default function Navbar() {
  const dispatch    = useDispatch();
  const navigate    = useNavigate();
  const location    = useLocation();
  const user        = useSelector(selectUser);
  const role        = useSelector(selectRole);
  const isAuth      = useSelector(selectIsAuth);
  const unreadCount = useSelector(selectUnreadCount);
  const path        = location.pathname;

  useEffect(() => {
    if (isAuth) dispatch(fetchUnreadCount());
  }, [isAuth, dispatch]);

  const handleLogout = async () => {
    try {
      await dispatch(logoutUser()).unwrap();
      toast.success("Logged out successfully.");
      navigate("/login");
    } catch {
      toast.error("Logout failed. Please try again.");
    }
  };

  const initials = user
    ? `${user.firstName?.[0] || ""}${user.lastName?.[0] || ""}`.toUpperCase()
    : "";

  return (
    <nav className={navbarClass}>
      <div className={navContainerClass}>

        {/* Brand */}
        <Link to="/" className={navBrandClass}>
          Emergency Blood Connector
        </Link>

        <div className={navLinksClass}>

          <Link to="/requests" className={navLink("/requests", path)}>
            Requests
          </Link>

          {/* DONOR links */}
          {isAuth && role === "DONOR" && (
            <>
              <Link to="/donor/dashboard"   className={navLink("/donor/dashboard",   path)}>Dashboard</Link>
              <Link to="/donor/leaderboard" className={navLink("/donor/leaderboard", path)}>Leaderboard</Link>
            </>
          )}

          {/* REQUESTER links */}
          {isAuth && role === "REQUESTER" && (
            <>
              <Link to="/requester/dashboard"   className={navLink("/requester/dashboard",   path)}>Dashboard</Link>
              <Link to="/requester/my-requests" className={navLink("/requester/my-requests", path)}>My requests</Link>
            </>
          )}

          {/* ADMIN links */}
          {isAuth && role === "ADMIN" && (
            <>
              <Link to="/admin/dashboard"   className={navLink("/admin/dashboard",   path)}>Dashboard</Link>
              <Link to="/admin/users"       className={navLink("/admin/users",       path)}>Users</Link>
              <Link to="/admin/requests"    className={navLink("/admin/requests",    path)}>Requests</Link>
              <Link to="/admin/statistics"  className={navLink("/admin/statistics",  path)}>Statistics</Link>
            </>
          )}

          {/* Bell */}
          {isAuth && (
            <Link to="/notifications" className={`${navLink("/notifications", path)} relative`}
                  aria-label="Notifications">
              <span className="relative inline-flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" width="17" height="17"
                     viewBox="0 0 24 24" fill="none" stroke="currentColor"
                     strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
                     aria-hidden="true">
                  <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
                  <path d="M13.73 21a2 2 0 0 1-3.46 0" />
                </svg>
                {unreadCount > 0 && (
                  <span className="absolute -top-1.5 -right-2 min-w-[14px] h-[14px]
                                   rounded-full bg-[#c0152a] text-white text-[9px]
                                   font-bold flex items-center justify-center px-0.5">
                    {unreadCount > 99 ? "99+" : unreadCount}
                  </span>
                )}
              </span>
            </Link>
          )}

          {/* Auth controls */}
          {isAuth ? (
            <div className="flex items-center gap-3 ml-2">
              <div className={avatar} title={`${user?.firstName} ${user?.lastName}`}>
                {initials}
              </div>
              <button onClick={handleLogout} className={secondaryBtn}>Logout</button>
            </div>
          ) : (
            <div className="flex items-center gap-3 ml-2">
              <Link to="/login"    className={navLinkClass}>Login</Link>
              <Link to="/register" className={primaryBtn}>Register</Link>
            </div>
          )}

        </div>
      </div>
    </nav>
  );
}

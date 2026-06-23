import { useEffect, useRef, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router";
import { useDispatch, useSelector } from "react-redux";
import toast from "react-hot-toast";

import { logoutUser, selectUser, selectRole, selectIsAuth } from "../store/authSlice";
import { fetchUnreadCount, selectUnreadCount }               from "../store/notifSlice";

import {
  navbarClass, navContainerClass, navBrandClass,
  navLinksClass, navLinkClass, navLinkActiveClass,
  primaryBtn, avatar,
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

  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [menuOpen,     setMenuOpen]     = useState(false);
  const dropdownRef   = useRef(null);
  const menuRef       = useRef(null);
  const menuButtonRef = useRef(null);

  useEffect(() => {
    if (isAuth) dispatch(fetchUnreadCount());
  }, [isAuth, dispatch]);

  //close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setDropdownOpen(false);
      }
      //close mobile drawer when tapping outside of it
      //exclude the hamburger button itself — it has its own onClick toggle
      const clickedHamburger = menuButtonRef.current && menuButtonRef.current.contains(e.target);
      if (!clickedHamburger && menuRef.current && !menuRef.current.contains(e.target)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  //close everything on route change
  useEffect(() => {
    setDropdownOpen(false);
    setMenuOpen(false);
  }, [path]);

  const handleLogout = async () => {
    setDropdownOpen(false);
    setMenuOpen(false);
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

  const dashboardLink =
    role === "DONOR"      ? "/donor/dashboard"
    : role === "REQUESTER"  ? "/requester/dashboard"
    : role === "ADMIN"      ? "/admin/dashboard"
    : "/";

  //shared nav link list — used in both desktop row and mobile drawer
  const NavLinks = ({ mobile = false }) => (
    <>
      <Link
        to="/requests"
        className={mobile ? mobileLink("/requests") : navLink("/requests", path)}
      >
        Requests
      </Link>

      {isAuth && role === "DONOR" && (
        <>
          <Link to="/donor/dashboard"   className={mobile ? mobileLink("/donor/dashboard")   : navLink("/donor/dashboard",   path)}>Dashboard</Link>
          <Link to="/donor/leaderboard" className={mobile ? mobileLink("/donor/leaderboard") : navLink("/donor/leaderboard", path)}>Leaderboard</Link>
        </>
      )}
      {isAuth && role === "REQUESTER" && (
        <>
          <Link to="/requester/dashboard"   className={mobile ? mobileLink("/requester/dashboard")   : navLink("/requester/dashboard",   path)}>Dashboard</Link>
          <Link to="/requester/my-requests" className={mobile ? mobileLink("/requester/my-requests") : navLink("/requester/my-requests", path)}>My requests</Link>
        </>
      )}
      {isAuth && role === "ADMIN" && (
        <>
          <Link to="/admin/dashboard"  className={mobile ? mobileLink("/admin/dashboard")  : navLink("/admin/dashboard",  path)}>Dashboard</Link>
          <Link to="/admin/users"      className={mobile ? mobileLink("/admin/users")      : navLink("/admin/users",      path)}>Users</Link>
          <Link to="/admin/requests"   className={mobile ? mobileLink("/admin/requests")   : navLink("/admin/requests",   path)}>Requests</Link>
          <Link to="/admin/statistics" className={mobile ? mobileLink("/admin/statistics") : navLink("/admin/statistics", path)}>Statistics</Link>
        </>
      )}
    </>
  );

  //mobile drawer link style
  const mobileLink = (href) =>
    `block px-4 py-3 text-sm font-medium rounded-lg transition-colors ${
      path === href
        ? "text-[#c0152a] bg-[#c0152a]/[0.06] font-semibold"
        : "text-[#1a1a1a] hover:bg-[#f4f4f4]"
    }`;

  return (
    <>
      <nav className={navbarClass}>
        <div className={navContainerClass}>

          {/* Brand */}
          <Link to="/" className={navBrandClass}>
            Emergency Blood Connector
          </Link>

          {/* Desktop nav links — hidden on mobile */}
          <div className={navLinksClass}>
            <NavLinks />

            {/* Bell — desktop */}
            {isAuth && (
              <Link to="/notifications"
                    className={`${navLink("/notifications", path)} relative`}
                    aria-label="Notifications">
                <span className="relative inline-flex items-center">
                  <svg xmlns="http://www.w3.org/2000/svg" width="17" height="17"
                       viewBox="0 0 24 24" fill="none" stroke="currentColor"
                       strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
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

            {/* Desktop profile dropdown */}
            {isAuth ? (
              <div className="relative ml-1" ref={dropdownRef}>
                <button
                  onClick={() => setDropdownOpen((v) => !v)}
                  className="flex items-center gap-1.5 cursor-pointer focus:outline-none"
                  aria-label="Profile menu"
                  aria-expanded={dropdownOpen}
                >
                  {user?.profileImageUrl ? (
                    <img
                      src={user.profileImageUrl}
                      alt={`${user?.firstName} ${user?.lastName}`}
                      className="w-8 h-8 rounded-full object-cover border border-[#e4e4e4] shrink-0"
                    />
                  ) : (
                    <div className={avatar}>{initials}</div>
                  )}
                  <svg xmlns="http://www.w3.org/2000/svg" width="11" height="11"
                       viewBox="0 0 24 24" fill="none" stroke="#9e9e9e"
                       strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"
                       className={`transition-transform duration-200 ${dropdownOpen ? "rotate-180" : ""}`}>
                    <polyline points="6 9 12 15 18 9" />
                  </svg>
                </button>

                {dropdownOpen && (
                  <div className="absolute right-0 top-full mt-2 w-52 bg-white border border-[#e4e4e4]
                                  rounded-xl shadow-lg py-1.5 z-50 overflow-hidden">
                    <div className="px-4 py-3 border-b border-[#f4f4f4]">
                      <p className="text-sm font-semibold text-[#1a1a1a] truncate">
                        {user?.firstName} {user?.lastName}
                      </p>
                      <p className="text-xs text-[#9e9e9e] truncate mt-0.5">{user?.email}</p>
                    </div>
                    <div className="py-1">
                      {[
                        { to: "/profile",                  icon: "person",    label: "View profile" },
                        { to: "/profile/edit",             icon: "edit",      label: "Edit profile" },
                        { to: dashboardLink,               icon: "dashboard", label: "Dashboard" },
                        { to: "/profile/change-password",  icon: "lock",      label: "Change password" },
                      ].map(({ to, label }) => (
                        <Link key={to} to={to}
                              className="flex items-center gap-3 px-4 py-2.5 text-sm text-[#1a1a1a]
                                         hover:bg-[#f4f4f4] transition-colors">
                          {label}
                        </Link>
                      ))}
                    </div>
                    <div className="border-t border-[#f4f4f4] py-1">
                      <button onClick={handleLogout}
                              className="w-full flex items-center gap-3 px-4 py-2.5 text-sm
                                         text-[#dc2626] hover:bg-[#dc2626]/[0.04] transition-colors cursor-pointer">
                        Logout
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-3 ml-2">
                <Link to="/login"    className={navLinkClass}>Login</Link>
                <Link to="/register" className={primaryBtn}>Register</Link>
              </div>
            )}
          </div>

          {/* Mobile right side — bell + avatar + hamburger */}
          <div className="flex items-center gap-3 md:hidden">

            {/* Bell — mobile */}
            {isAuth && (
              <Link to="/notifications" aria-label="Notifications"
                    className="relative text-[#6b6b6b]">
                <span className="relative inline-flex items-center">
                  <svg xmlns="http://www.w3.org/2000/svg" width="19" height="19"
                       viewBox="0 0 24 24" fill="none" stroke="currentColor"
                       strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
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

            {/* Hamburger */}
            <button
              ref={menuButtonRef}
              onClick={() => setMenuOpen((v) => !v)}
              className="p-1.5 rounded-lg text-[#1a1a1a] hover:bg-[#f4f4f4] transition-colors cursor-pointer"
              aria-label={menuOpen ? "Close menu" : "Open menu"}
            >
              {menuOpen ? (
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20"
                     viewBox="0 0 24 24" fill="none" stroke="currentColor"
                     strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              ) : (
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20"
                     viewBox="0 0 24 24" fill="none" stroke="currentColor"
                     strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="3" y1="6"  x2="21" y2="6"  />
                  <line x1="3" y1="12" x2="21" y2="12" />
                  <line x1="3" y1="18" x2="21" y2="18" />
                </svg>
              )}
            </button>
          </div>

        </div>
      </nav>

      {/* Mobile drawer — full-width panel below navbar */}
      {menuOpen && (
        <div ref={menuRef} className="md:hidden bg-white border-b border-[#e4e4e4] px-4 py-4 z-40
                        shadow-sm flex flex-col gap-1">

          {/* Nav links */}
          <NavLinks mobile />

          {/* Divider */}
          <div className="border-t border-[#f4f4f4] my-2" />

          {isAuth ? (
            <>
              {/* User identity */}
              <div className="flex items-center gap-3 px-4 py-3 bg-[#f4f4f4] rounded-xl mb-1">
                {user?.profileImageUrl ? (
                  <img src={user.profileImageUrl}
                       alt={initials}
                       className="w-10 h-10 rounded-full object-cover border border-[#e4e4e4] shrink-0" />
                ) : (
                  <div className="w-10 h-10 rounded-full bg-[#c0152a]/[0.08] text-[#c0152a]
                                  flex items-center justify-center text-sm font-bold shrink-0">
                    {initials}
                  </div>
                )}
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-[#1a1a1a] truncate">
                    {user?.firstName} {user?.lastName}
                  </p>
                  <p className="text-xs text-[#9e9e9e] truncate">{user?.email}</p>
                </div>
              </div>

              {/* Profile links */}
              <Link to="/profile"                 className={mobileLink("/profile")}>View profile</Link>
              <Link to="/profile/edit"            className={mobileLink("/profile/edit")}>Edit profile</Link>
              <Link to="/profile/change-password" className={mobileLink("/profile/change-password")}>Change password</Link>

              <div className="border-t border-[#f4f4f4] my-2" />

              <button
                onClick={handleLogout}
                className="w-full text-left px-4 py-3 text-sm font-medium rounded-lg
                           text-[#dc2626] hover:bg-[#dc2626]/[0.04] transition-colors cursor-pointer"
              >
                Logout
              </button>
            </>
          ) : (
            <div className="flex flex-col gap-2 pt-1">
              <Link to="/login"    className="block px-4 py-3 text-sm font-medium text-[#1a1a1a] hover:bg-[#f4f4f4] rounded-lg transition-colors">Login</Link>
              <Link to="/register" className={`${primaryBtn} text-center`}>Register</Link>
            </div>
          )}
        </div>
      )}
    </>
  );
}

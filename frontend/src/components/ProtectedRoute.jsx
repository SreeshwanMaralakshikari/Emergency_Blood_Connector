// src/components/ProtectedRoute.jsx
// Wraps any route that requires authentication and/or a specific role.
// Shows nothing (null) while checkAuth is still loading — avoids flash redirects.

import { useSelector } from "react-redux";
import { Navigate } from "react-router";
import { selectIsAuth, selectRole, selectAuthLoading } from "../store/authSlice";
import { loadingClass } from "../styles/common";

export default function ProtectedRoute({ children, allowedRoles = [] }) {
  const isAuth  = useSelector(selectIsAuth);
  const role    = useSelector(selectRole);
  const loading = useSelector(selectAuthLoading);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className={loadingClass}>Verifying session…</p>
      </div>
    );
  }

  if (!isAuth) return <Navigate to="/login" replace />;

  if (allowedRoles.length > 0 && !allowedRoles.includes(role)) {
    return <Navigate to="/unauthorized" replace />;
  }

  return children;
}

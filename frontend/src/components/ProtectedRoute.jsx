//wraps routes that need auth and/or a specific role
//shows a loading indicator while checkAuth is resolving — avoids flash redirects
import { useSelector } from "react-redux";
import { Navigate } from "react-router";
import { selectIsAuth, selectRole, selectAuthLoading } from "../store/authSlice";
import { loadingClass } from "../styles/common";

export default function ProtectedRoute({ children, allowedRoles = [] }) {
  //get auth state from store
  const isAuth  = useSelector(selectIsAuth);
  const role    = useSelector(selectRole);
  const loading = useSelector(selectAuthLoading);

  //loading state
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className={loadingClass}>Verifying session…</p>
      </div>
    );
  }

  //if user not logged in
  if (!isAuth) return <Navigate to="/login" replace />;

  //check role
  if (allowedRoles.length > 0 && !allowedRoles.includes(role)) {
    return <Navigate to="/unauthorized" replace />;
  }

  return children;
}

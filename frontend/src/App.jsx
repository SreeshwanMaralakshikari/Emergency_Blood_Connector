import { useEffect } from "react";
import { Routes, Route } from "react-router";
import { useDispatch, useSelector } from "react-redux";
import { Toaster } from "react-hot-toast";

import { checkAuth, selectIsAuth } from "./store/authSlice";
import { fetchUnreadCount }        from "./store/notifSlice";

import Navbar         from "./components/Navbar";
import ProtectedRoute from "./components/ProtectedRoute";

// Public
import Home          from "./pages/public/Home";
import OpenRequests  from "./pages/public/OpenRequests";
import RequestDetail from "./pages/public/RequestDetail";
import Notifications from "./pages/public/Notifications";
import Unauthorized  from "./pages/public/Unauthorized";

// Auth
import Login    from "./pages/auth/Login";
import Register from "./pages/auth/Register";

// Donor
import DonorDashboard  from "./pages/donor/DonorDashboard";
import DonationHistory from "./pages/donor/DonationHistory";
import Leaderboard     from "./pages/donor/Leaderboard";
import Badges          from "./pages/donor/Badges";
import Achievements    from "./pages/donor/Achievements";

// Requester
import RequesterDashboard from "./pages/requester/RequesterDashboard";
import CreateRequest      from "./pages/requester/CreateRequest";
import MyRequests         from "./pages/requester/MyRequests";
import EditRequest        from "./pages/requester/EditRequest";

// Admin
import AdminDashboard  from "./pages/admin/AdminDashboard";
import AdminUsers      from "./pages/admin/AdminUsers";
import AdminRequests   from "./pages/admin/AdminRequests";
import AdminStatistics from "./pages/admin/AdminStatistics";

export default function App() {
  const dispatch = useDispatch();
  const isAuth   = useSelector(selectIsAuth);

  //restore session on page load
  useEffect(() => {
    dispatch(checkAuth());
  }, [dispatch]);

  //fetch unread count when logged in
  useEffect(() => {
    if (isAuth) dispatch(fetchUnreadCount());
  }, [isAuth, dispatch]);

  return (
    <>
      <Toaster
        position="top-right"
        toastOptions={{
          style: {
            fontSize: "0.85rem",
            borderRadius: "10px",
            background: "#1a1a1a",
            color: "#fafafa",
          },
          success: { iconTheme: { primary: "#16a34a", secondary: "#fafafa" } },
          error:   { iconTheme: { primary: "#c0152a", secondary: "#fafafa" } },
        }}
      />

      <Navbar />

      <Routes>
        <Route path="/"                        element={<Home />} />
        <Route path="/requests"                element={<OpenRequests />} />
        <Route path="/requests/:requestNumber" element={<RequestDetail />} />
        <Route path="/donor/leaderboard"       element={<Leaderboard />} />
        <Route path="/unauthorized"            element={<Unauthorized />} />
        <Route path="/login"    element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/notifications" element={
          <ProtectedRoute><Notifications /></ProtectedRoute>
        } />
        <Route path="/donor/dashboard" element={
          <ProtectedRoute allowedRoles={["DONOR"]}>
            <DonorDashboard />
          </ProtectedRoute>
        } />
        <Route path="/donor/history" element={
          <ProtectedRoute allowedRoles={["DONOR"]}>
            <DonationHistory />
          </ProtectedRoute>
        } />
        <Route path="/donor/badges" element={
          <ProtectedRoute allowedRoles={["DONOR"]}>
            <Badges />
          </ProtectedRoute>
        } />
        <Route path="/donor/achievements" element={
          <ProtectedRoute allowedRoles={["DONOR"]}>
            <Achievements />
          </ProtectedRoute>
        } />
        <Route path="/requester/dashboard" element={
          <ProtectedRoute allowedRoles={["REQUESTER", "ADMIN"]}>
            <RequesterDashboard />
          </ProtectedRoute>
        } />
        <Route path="/requester/create" element={
          <ProtectedRoute allowedRoles={["REQUESTER", "ADMIN"]}>
            <CreateRequest />
          </ProtectedRoute>
        } />
        <Route path="/requester/my-requests" element={
          <ProtectedRoute allowedRoles={["REQUESTER", "ADMIN"]}>
            <MyRequests />
          </ProtectedRoute>
        } />
        <Route path="/requester/edit/:requestNumber" element={
          <ProtectedRoute allowedRoles={["REQUESTER", "ADMIN"]}>
            <EditRequest />
          </ProtectedRoute>
        } />
        <Route path="/admin/dashboard" element={
          <ProtectedRoute allowedRoles={["ADMIN"]}>
            <AdminDashboard />
          </ProtectedRoute>
        } />
        <Route path="/admin/users" element={
          <ProtectedRoute allowedRoles={["ADMIN"]}>
            <AdminUsers />
          </ProtectedRoute>
        } />
        <Route path="/admin/requests" element={
          <ProtectedRoute allowedRoles={["ADMIN"]}>
            <AdminRequests />
          </ProtectedRoute>
        } />
        <Route path="/admin/statistics" element={
          <ProtectedRoute allowedRoles={["ADMIN"]}>
            <AdminStatistics />
          </ProtectedRoute>
        } />
        <Route path="*" element={
          <div className="min-h-screen flex flex-col items-center justify-center gap-3">
            <p className="text-2xl font-bold text-[#1a1a1a]">404</p>
            <p className="text-[#6b6b6b] text-sm">Page not found.</p>
          </div>
        } />

      </Routes>
    </>
  );
}

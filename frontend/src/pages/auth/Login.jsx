import { useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router";
import { useDispatch, useSelector } from "react-redux";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";

import {
  loginUser,
  selectIsAuth,
  selectRole,
  selectAuthLoading,
  selectAuthError,
  clearError,
} from "../../store/authSlice";

import {
  pageBackground,
  formCard,
  formTitle,
  formGroup,
  labelClass,
  inputClass,
  submitBtn,
  errorClass,
  linkClass,
  mutedText,
} from "../../styles/common";

export default function Login() {
  const dispatch    = useDispatch();
  const navigate    = useNavigate();
  const isAuth      = useSelector(selectIsAuth);
  const role        = useSelector(selectRole);
  const loading     = useSelector(selectAuthLoading);
  const apiError    = useSelector(selectAuthError);
  const loginAttempted = useRef(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();

  //navigation logic — only run after a real login, not on checkAuth restore
  useEffect(() => {
    if (!loginAttempted.current || !isAuth) return;
    switch (role) {
      case "DONOR":
        toast.success("Welcome back! Redirecting to your dashboard.");
        navigate("/donor/dashboard", { replace: true });
        break;
      case "REQUESTER":
        toast.success("Welcome back! Redirecting to your dashboard.");
        navigate("/requester/dashboard", { replace: true });
        break;
      case "ADMIN":
        toast.success("Welcome back, Admin.");
        navigate("/admin/dashboard", { replace: true });
        break;
      default:
        navigate("/", { replace: true });
    }
  }, [isAuth, role, navigate]);

  const onLogin = async (data) => {
    dispatch(clearError());
    loginAttempted.current = true;
    try {
      await dispatch(loginUser(data)).unwrap();
    } catch {
      loginAttempted.current = false;
    }
  };

  return (
    <div className={`${pageBackground} flex items-center justify-center py-16 px-4`}>
      <div className="w-full max-w-md">

        {/* Header */}
        <div className="text-center mb-8">
          <p className="text-[#c0152a] text-xs font-bold uppercase tracking-widest mb-2">
            Emergency Blood Connector
          </p>
          <h1 className="text-3xl font-bold text-[#1a1a1a] tracking-tight">
            Sign in
          </h1>
          <p className={`${mutedText} mt-2`}>
            Don't have an account?{" "}
            <Link to="/register" className={linkClass}>
              Register
            </Link>
          </p>
        </div>

        {/* Form card */}
        <div className="bg-[#f4f4f4] rounded-2xl p-8">

          {/* API Error */}
          {apiError && (
            <div className={`${errorClass} mb-5`}>{apiError}</div>
          )}

          <form onSubmit={handleSubmit(onLogin)} noValidate>

            {/* Email */}
            <div className={formGroup}>
              <label className={labelClass}>Email address</label>
              <input
                type="email"
                placeholder="you@example.com"
                className={`${inputClass} ${errors.email ? "border-[#dc2626]" : ""}`}
                {...register("email", {
                  required: "Email is required",
                  pattern: {
                    value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                    message: "Enter a valid email address",
                  },
                })}
              />
              {errors.email && (
                <p className="text-[#dc2626] text-xs mt-1">{errors.email.message}</p>
              )}
            </div>

            {/* Password */}
            <div className={formGroup}>
              <label className={labelClass}>Password</label>
              <input
                type="password"
                placeholder="••••••••"
                className={`${inputClass} ${errors.password ? "border-[#dc2626]" : ""}`}
                {...register("password", {
                  required: "Password is required",
                  minLength: { value: 6, message: "Password must be at least 6 characters" },
                })}
              />
              {errors.password && (
                <p className="text-[#dc2626] text-xs mt-1">{errors.password.message}</p>
              )}
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className={`${submitBtn} ${loading ? "opacity-60 cursor-not-allowed" : ""}`}
            >
              {loading ? "Signing in…" : "Sign in"}
            </button>

          </form>
        </div>

        {/* Footer note */}
        <p className={`${mutedText} text-center mt-6 text-xs`}>
          View open blood requests without an account —{" "}
          <Link to="/requests" className={linkClass}>Browse requests</Link>
        </p>

      </div>
    </div>
  );
}

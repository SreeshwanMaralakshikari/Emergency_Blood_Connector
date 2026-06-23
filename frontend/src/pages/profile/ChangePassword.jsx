//change password — verifies current password before allowing new one

import { useState } from "react";
import { useNavigate } from "react-router";
import { useDispatch } from "react-redux";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";
import axiosInstance from "../../api/axiosInstance";
import { logoutUser } from "../../store/authSlice";
import {
  pageBackground, formGroup,
  labelClass, inputClass, submitBtn, secondaryBtn, errorClass,
} from "../../styles/common";

export default function ChangePassword() {
  const navigate              = useNavigate();
  const dispatch              = useDispatch();
  const [loading, setLoading] = useState(false);
  const [apiError, setApiError] = useState("");

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm();

  const onSubmit = async (data) => {
    setApiError("");
    try {
      setLoading(true);
      await axiosInstance.patch("/auth/change-password", {
        currentPassword: data.currentPassword,
        newPassword:     data.newPassword,
      });
      toast.success("Password changed. Please sign in with your new password.");
      //log out so the old JWT (which is still technically valid) is cleared
      //and the user must re-authenticate with the new password
      await dispatch(logoutUser());
      navigate("/login");
    } catch (err) {
      setApiError(err.response?.data?.message || "Failed to change password.");
    } finally {
      setLoading(false);
    }
  };

  const err = (field) => errors[field]?.message;
  const inputCls = (field) => `${inputClass} ${errors[field] ? "border-[#dc2626]" : ""}`;

  return (
    <div className={`${pageBackground} py-8 sm:py-14 px-4`}>
      <div className="bg-[#f4f4f4] rounded-2xl p-10 max-w-lg mx-auto">

        <div className="mb-8">
          <p className="text-[#c0152a] text-xs font-bold uppercase tracking-widest mb-1">
            Account security
          </p>
          <h1 className="text-2xl font-bold text-[#1a1a1a] tracking-tight">
            Change password
          </h1>
          <p className="text-sm text-[#9e9e9e] mt-1">
            Enter your current password to set a new one.
          </p>
        </div>

        {apiError && <div className={`${errorClass} mb-6`}>{apiError}</div>}

        <form onSubmit={handleSubmit(onSubmit)} noValidate>

          <div className={formGroup}>
            <label className={labelClass}>Current password</label>
            <input
              type="password"
              placeholder="••••••••"
              className={inputCls("currentPassword")}
              {...register("currentPassword", { required: "Current password is required" })}
            />
            {err("currentPassword") && (
              <p className="text-[#dc2626] text-xs mt-1">{err("currentPassword")}</p>
            )}
          </div>

          <div className={formGroup}>
            <label className={labelClass}>New password</label>
            <input
              type="password"
              placeholder="Minimum 6 characters"
              className={inputCls("newPassword")}
              {...register("newPassword", {
                required: "New password is required",
                minLength: { value: 6, message: "Password must be at least 6 characters" },
              })}
            />
            {err("newPassword") && (
              <p className="text-[#dc2626] text-xs mt-1">{err("newPassword")}</p>
            )}
          </div>

          <div className={formGroup}>
            <label className={labelClass}>Confirm new password</label>
            <input
              type="password"
              placeholder="Re-enter new password"
              className={inputCls("confirmPassword")}
              {...register("confirmPassword", {
                required: "Please confirm your new password",
                validate: (val) =>
                  val === watch("newPassword") || "Passwords do not match",
              })}
            />
            {err("confirmPassword") && (
              <p className="text-[#dc2626] text-xs mt-1">{err("confirmPassword")}</p>
            )}
          </div>

          <div className="flex flex-col sm:flex-row gap-3 mt-8">
            <button
              type="submit"
              disabled={loading}
              className={`${submitBtn} w-auto px-8 ${loading ? "opacity-60 cursor-not-allowed" : ""}`}
            >
              {loading ? "Saving…" : "Change password"}
            </button>
            <button
              type="button"
              onClick={() => navigate("/profile")}
              className={secondaryBtn}
            >
              Cancel
            </button>
          </div>

        </form>
      </div>
    </div>
  );
}

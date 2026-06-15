import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router";
import { useForm } from "react-hook-form";
import axiosInstance from "../../api/axiosInstance";
import toast from "react-hot-toast";

import {
  pageBackground,
  formGroup,
  formRow,
  labelClass,
  inputClass,
  selectClass,
  submitBtn,
  errorClass,
  linkClass,
  mutedText,
} from "../../styles/common";

const BLOOD_GROUPS = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"];

const STATES = [
  "Andhra Pradesh","Arunachal Pradesh","Assam","Bihar","Chhattisgarh",
  "Goa","Gujarat","Haryana","Himachal Pradesh","Jharkhand","Karnataka",
  "Kerala","Madhya Pradesh","Maharashtra","Manipur","Meghalaya","Mizoram",
  "Nagaland","Odisha","Punjab","Rajasthan","Sikkim","Tamil Nadu","Telangana",
  "Tripura","Uttar Pradesh","Uttarakhand","West Bengal",
  "Andaman and Nicobar Islands","Chandigarh","Dadra and Nagar Haveli",
  "Daman and Diu","Delhi","Lakshadweep","Puducherry","Jammu and Kashmir","Ladakh",
];

export default function Register() {
  const navigate              = useNavigate();
  const [loading, setLoading] = useState(false);
  const [apiError, setApiError] = useState("");
  const [role, setRole]       = useState("DONOR");

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm({ defaultValues: { role: "DONOR" } });

  const watchedRole = watch("role");

  useEffect(() => {
    setRole(watchedRole);
  }, [watchedRole]);

  const onRegister = async (data) => {
    setApiError("");
    try {
      setLoading(true);
      await axiosInstance.post("/auth/register", {
        firstName:   data.firstName,
        lastName:    data.lastName,
        email:       data.email,
        password:    data.password,
        phoneNumber: data.phoneNumber,
        bloodGroup:  data.bloodGroup,
        state:       data.state,
        role:        data.role,
      });
      toast.success("Account created! Please sign in.");
      navigate("/login");
    } catch (err) {
      setApiError(err.response?.data?.message || "Registration failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={`${pageBackground} flex items-center justify-center py-16 px-4`}>
      <div className="w-full max-w-2xl">

        {/* Header */}
        <div className="text-center mb-8">
          <p className="text-[#c0152a] text-xs font-bold uppercase tracking-widest mb-2">
            Emergency Blood Connector
          </p>
          <h1 className="text-3xl font-bold text-[#1a1a1a] tracking-tight">
            Create account
          </h1>
          <p className={`${mutedText} mt-2`}>
            Already have an account?{" "}
            <Link to="/login" className={linkClass}>Sign in</Link>
          </p>
        </div>

        {/* Form card */}
        <div className="bg-[#f4f4f4] rounded-2xl p-8">

          {apiError && (
            <div className={`${errorClass} mb-5`}>{apiError}</div>
          )}

          <form onSubmit={handleSubmit(onRegister)} noValidate>

            {/* Role selector — shown first, controls what fields show */}
            <div className={`${formGroup} mb-6`}>
              <label className={labelClass}>I am registering as</label>
              <div className="flex gap-3 mt-1">
                {["DONOR", "REQUESTER"].map((r) => (
                  <label
                    key={r}
                    className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl border text-sm font-semibold cursor-pointer transition-colors ${
                      role === r
                        ? "border-[#c0152a] bg-[#c0152a]/[0.06] text-[#c0152a]"
                        : "border-[#e4e4e4] bg-white text-[#6b6b6b] hover:bg-[#f4f4f4]"
                    }`}
                  >
                    <input
                      type="radio"
                      value={r}
                      className="sr-only"
                      {...register("role")}
                    />
                    {r === "DONOR" ? "🩸 Donor" : "🏥 Requester"}
                  </label>
                ))}
              </div>
              <p className="text-xs text-[#9e9e9e] mt-2">
                {role === "DONOR"
                  ? "Donors accept blood requests and complete donations."
                  : "Requesters create blood requests on behalf of patients or hospitals."}
              </p>
            </div>

            {/* Name row */}
            <div className={formRow}>
              <div className={formGroup}>
                <label className={labelClass}>First name</label>
                <input
                  type="text"
                  placeholder="Arjun"
                  className={`${inputClass} ${errors.firstName ? "border-[#dc2626]" : ""}`}
                  {...register("firstName", { required: "First name is required" })}
                />
                {errors.firstName && (
                  <p className="text-[#dc2626] text-xs mt-1">{errors.firstName.message}</p>
                )}
              </div>
              <div className={formGroup}>
                <label className={labelClass}>Last name</label>
                <input
                  type="text"
                  placeholder="Sharma"
                  className={`${inputClass} ${errors.lastName ? "border-[#dc2626]" : ""}`}
                  {...register("lastName", { required: "Last name is required" })}
                />
                {errors.lastName && (
                  <p className="text-[#dc2626] text-xs mt-1">{errors.lastName.message}</p>
                )}
              </div>
            </div>

            {/* Email */}
            <div className={formGroup}>
              <label className={labelClass}>Email address</label>
              <input
                type="email"
                placeholder="arjun@example.com"
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
                placeholder="Minimum 6 characters"
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

            {/* Phone */}
            <div className={formGroup}>
              <label className={labelClass}>Phone number</label>
              <input
                type="tel"
                placeholder="9876543210"
                className={`${inputClass} ${errors.phoneNumber ? "border-[#dc2626]" : ""}`}
                {...register("phoneNumber", {
                  required: "Phone number is required",
                  pattern: {
                    value: /^[6-9]\d{9}$/,
                    message: "Enter a valid 10-digit Indian mobile number",
                  },
                })}
              />
              {errors.phoneNumber && (
                <p className="text-[#dc2626] text-xs mt-1">{errors.phoneNumber.message}</p>
              )}
            </div>

            {/* Blood group + State row */}
            <div className={formRow}>
              <div className={formGroup}>
                <label className={labelClass}>Blood group</label>
                <select
                  className={`${selectClass} ${errors.bloodGroup ? "border-[#dc2626]" : ""}`}
                  {...register("bloodGroup", { required: "Blood group is required" })}
                >
                  <option value="">Select blood group</option>
                  {BLOOD_GROUPS.map((bg) => (
                    <option key={bg} value={bg}>{bg}</option>
                  ))}
                </select>
                {errors.bloodGroup && (
                  <p className="text-[#dc2626] text-xs mt-1">{errors.bloodGroup.message}</p>
                )}
              </div>
              <div className={formGroup}>
                <label className={labelClass}>State</label>
                <select
                  className={`${selectClass} ${errors.state ? "border-[#dc2626]" : ""}`}
                  {...register("state", { required: "State is required" })}
                >
                  <option value="">Select state</option>
                  {STATES.map((s) => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
                {errors.state && (
                  <p className="text-[#dc2626] text-xs mt-1">{errors.state.message}</p>
                )}
              </div>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className={`${submitBtn} ${loading ? "opacity-60 cursor-not-allowed" : ""}`}
            >
              {loading ? "Creating account…" : "Create account"}
            </button>

          </form>
        </div>

        <p className={`${mutedText} text-center mt-6 text-xs`}>
          By registering you agree to use this platform only for legitimate blood donation purposes.
        </p>

      </div>
    </div>
  );
}

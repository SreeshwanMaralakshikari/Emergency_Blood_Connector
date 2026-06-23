//edit profile — firstName, lastName, phoneNumber, state, profileImage
//not editable: email (unique identifier), role (security), bloodGroup (donation history integrity)

import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router";
import { useDispatch, useSelector } from "react-redux";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";
import axiosInstance from "../../api/axiosInstance";
import { selectUser } from "../../store/authSlice";
import { updateUser } from "../../store/authSlice";
import {
  pageBackground, formCard, formTitle, formGroup, formRow,
  labelClass, inputClass, selectClass, submitBtn,
  secondaryBtn, errorClass,
} from "../../styles/common";

const STATES = [
  "Andhra Pradesh","Arunachal Pradesh","Assam","Bihar","Chhattisgarh",
  "Goa","Gujarat","Haryana","Himachal Pradesh","Jharkhand","Karnataka",
  "Kerala","Madhya Pradesh","Maharashtra","Manipur","Meghalaya","Mizoram",
  "Nagaland","Odisha","Punjab","Rajasthan","Sikkim","Tamil Nadu","Telangana",
  "Tripura","Uttar Pradesh","Uttarakhand","West Bengal",
  "Andaman and Nicobar Islands","Chandigarh","Dadra and Nagar Haveli",
  "Daman and Diu","Delhi","Lakshadweep","Puducherry","Jammu and Kashmir","Ladakh",
];

export default function EditProfile() {
  const navigate              = useNavigate();
  const dispatch              = useDispatch();
  const user                  = useSelector(selectUser);
  const [loading, setLoading] = useState(false);
  const [apiError, setApiError] = useState("");
  const [preview, setPreview] = useState(user?.profileImageUrl || null);
  const previewUrlRef         = useRef(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm();

  //pre-fill form with current user data
  useEffect(() => {
    if (user) {
      reset({
        firstName:   user.firstName   || "",
        lastName:    user.lastName    || "",
        phoneNumber: user.phoneNumber || "",
        state:       user.state       || "",
      });
      setPreview(user.profileImageUrl || null);
    }
  }, [user, reset]);

  //revoke blob URL on unmount
  useEffect(() => {
    return () => {
      if (previewUrlRef.current) URL.revokeObjectURL(previewUrlRef.current);
    };
  }, []);

  //compose RHF onChange with preview handler
  const {
    onChange: rhfOnChange,
    ...profileImageRest
  } = register("profileImageUrl", {
    validate: {
      fileType: (files) =>
        !files?.[0] ||
        ["image/jpeg", "image/png"].includes(files[0].type) ||
        "Only JPG or PNG files are allowed",
      fileSize: (files) =>
        !files?.[0] ||
        files[0].size <= 2 * 1024 * 1024 ||
        "Image must be under 2 MB",
    },
  });

  const handleFileChange = (e) => {
    rhfOnChange(e);
    const file = e.target.files[0];
    if (file) {
      if (previewUrlRef.current) URL.revokeObjectURL(previewUrlRef.current);
      previewUrlRef.current = URL.createObjectURL(file);
      setPreview(previewUrlRef.current);
    } else {
      if (previewUrlRef.current) {
        URL.revokeObjectURL(previewUrlRef.current);
        previewUrlRef.current = null;
      }
      setPreview(user?.profileImageUrl || null);
    }
  };

  const onSubmit = async (data) => {
    setApiError("");
    try {
      setLoading(true);
      //build FormData for multipart (image upload)
      const formData = new FormData();
      formData.append("firstName",   data.firstName);
      formData.append("lastName",    data.lastName);
      formData.append("phoneNumber", data.phoneNumber);
      formData.append("state",       data.state);
      if (data.profileImageUrl?.[0]) {
        formData.append("profileImageUrl", data.profileImageUrl[0]);
      }

      const res = await axiosInstance.patch("/auth/update-profile", formData);
      //update Redux store so Navbar and dashboards reflect changes immediately
      dispatch(updateUser(res.data.payload));
      toast.success("Profile updated successfully.");
      navigate("/profile");
    } catch (err) {
      setApiError(err.response?.data?.error || err.response?.data?.message || "Failed to update profile.");
    } finally {
      setLoading(false);
    }
  };

  const err    = (field) => errors[field]?.message;
  const inputCls = (field) => `${inputClass} ${errors[field] ? "border-[#dc2626]" : ""}`;

  return (
    <div className={`${pageBackground} py-8 sm:py-14 px-4`}>
      <div className={formCard}>

        {/* Header */}
        <div className="mb-8">
          <p className="text-[#c0152a] text-xs font-bold uppercase tracking-widest mb-1">
            Account
          </p>
          <h1 className={formTitle} style={{ textAlign: "left", marginBottom: 0 }}>
            Edit profile
          </h1>
          <p className="text-sm text-[#9e9e9e] mt-1">
            Update your personal information below.
          </p>
        </div>

        {apiError && <div className={`${errorClass} mb-6`}>{apiError}</div>}

        <form onSubmit={handleSubmit(onSubmit)} noValidate>

          {/* Name row */}
          <div className={formRow}>
            <div className={formGroup}>
              <label className={labelClass}>First name</label>
              <input
                className={inputCls("firstName")}
                {...register("firstName", { required: "First name is required" })}
              />
              {err("firstName") && <p className="text-[#dc2626] text-xs mt-1">{err("firstName")}</p>}
            </div>
            <div className={formGroup}>
              <label className={labelClass}>Last name</label>
              <input
                className={inputCls("lastName")}
                {...register("lastName", { required: "Last name is required" })}
              />
              {err("lastName") && <p className="text-[#dc2626] text-xs mt-1">{err("lastName")}</p>}
            </div>
          </div>

          {/* Phone */}
          <div className={formGroup}>
            <label className={labelClass}>Phone number</label>
            <input
              type="tel"
              className={inputCls("phoneNumber")}
              {...register("phoneNumber", {
                required: "Phone number is required",
                pattern: {
                  value: /^[6-9]\d{9}$/,
                  message: "Enter a valid 10-digit Indian mobile number",
                },
              })}
            />
            {err("phoneNumber") && <p className="text-[#dc2626] text-xs mt-1">{err("phoneNumber")}</p>}
          </div>

          {/* State */}
          <div className={formGroup}>
            <label className={labelClass}>State</label>
            <select
              className={`${selectClass} ${errors.state ? "border-[#dc2626]" : ""}`}
              {...register("state", { required: "State is required" })}
            >
              <option value="">Select state</option>
              {STATES.map((s) => <option key={s} value={s}>{s}</option>)}
            </select>
            {err("state") && <p className="text-[#dc2626] text-xs mt-1">{err("state")}</p>}
          </div>

          {/* Profile image */}
          <div className={formGroup}>
            <label className={labelClass}>
              Profile image{" "}
              <span className="text-[#9e9e9e] normal-case font-normal">
                (optional · JPG or PNG · max 2 MB)
              </span>
            </label>
            <div className="flex items-center gap-4 mt-1">
              {/* Preview */}
              <div className="shrink-0">
                {preview ? (
                  <img
                    src={preview}
                    alt="Profile preview"
                    className="w-16 h-16 rounded-full object-cover border-2 border-[#c0152a]/30"
                  />
                ) : (
                  <div className="w-16 h-16 rounded-full bg-[#e4e4e4] flex items-center justify-center">
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24"
                         viewBox="0 0 24 24" fill="none" stroke="#9e9e9e"
                         strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                      <circle cx="12" cy="8" r="4" />
                      <path d="M4 20c0-4 3.6-7 8-7s8 3 8 7" />
                    </svg>
                  </div>
                )}
              </div>
              {/* File picker */}
              <div className="flex-1">
                <input
                  type="file"
                  accept="image/jpeg,image/png"
                  className="block w-full text-sm text-[#6b6b6b]
                             file:mr-4 file:py-2 file:px-4
                             file:rounded-full file:border-0
                             file:text-xs file:font-semibold
                             file:bg-[#c0152a] file:text-white
                             hover:file:bg-[#960f20] file:cursor-pointer cursor-pointer"
                  onChange={handleFileChange}
                  {...profileImageRest}
                />
                <p className="text-xs text-[#9e9e9e] mt-1">
                  Leave empty to keep your current image.
                </p>
              </div>
            </div>
            {errors.profileImageUrl && (
              <p className="text-[#dc2626] text-xs mt-2">{errors.profileImageUrl.message}</p>
            )}
          </div>

          {/* Non-editable fields — shown as read-only */}
          <div className="border-t border-[#e4e4e4] my-6" />
          <p className="text-xs font-bold text-[#9e9e9e] uppercase tracking-widest mb-4">
            Non-editable fields
          </p>
          <div className={formRow}>
            <div className={formGroup}>
              <label className={labelClass}>
                Email address
                <span className="ml-2 text-[#9e9e9e] normal-case font-normal">— cannot be changed</span>
              </label>
              <div className="w-full bg-[#f4f4f4] border border-[#e4e4e4] rounded-lg px-4 py-2.5 text-[#9e9e9e] text-sm cursor-not-allowed">
                {user?.email}
              </div>
            </div>
            <div className={formGroup}>
              <label className={labelClass}>
                Blood group
                <span className="ml-2 text-[#9e9e9e] normal-case font-normal">— cannot be changed</span>
              </label>
              <div className="w-full bg-[#f4f4f4] border border-[#e4e4e4] rounded-lg px-4 py-2.5 text-[#9e9e9e] text-sm cursor-not-allowed">
                {user?.bloodGroup}
              </div>
            </div>
          </div>
          <div className={formGroup}>
            <label className={labelClass}>
              Role
              <span className="ml-2 text-[#9e9e9e] normal-case font-normal">— cannot be changed</span>
            </label>
            <div className="w-full bg-[#f4f4f4] border border-[#e4e4e4] rounded-lg px-4 py-2.5 text-[#9e9e9e] text-sm cursor-not-allowed">
              {user?.role}
            </div>
          </div>

          {/* Actions */}
          <div className="flex flex-col sm:flex-row gap-3 mt-8">
            <button
              type="submit"
              disabled={loading}
              className={`${submitBtn} w-auto px-8 ${loading ? "opacity-60 cursor-not-allowed" : ""}`}
            >
              {loading ? "Saving…" : "Save changes"}
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

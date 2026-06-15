//pre-fills with current request data — only OPEN requests can be edited

import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";
import axiosInstance from "../../api/axiosInstance";
import {
  pageBackground, formCard, formTitle, formGroup, formRow,
  labelClass, inputClass, selectClass, submitBtn,
  secondaryBtn, errorClass, loadingClass,
} from "../../styles/common";

const BLOOD_GROUPS  = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"];
const ALERT_LEVELS  = ["GREEN", "YELLOW", "RED", "BLACK"];
const GENDERS       = ["MALE", "FEMALE", "OTHER"];
const STATES = [
  "Andhra Pradesh","Arunachal Pradesh","Assam","Bihar","Chhattisgarh",
  "Goa","Gujarat","Haryana","Himachal Pradesh","Jharkhand","Karnataka",
  "Kerala","Madhya Pradesh","Maharashtra","Manipur","Meghalaya","Mizoram",
  "Nagaland","Odisha","Punjab","Rajasthan","Sikkim","Tamil Nadu","Telangana",
  "Tripura","Uttar Pradesh","Uttarakhand","West Bengal",
  "Andaman and Nicobar Islands","Chandigarh","Dadra and Nagar Haveli",
  "Daman and Diu","Delhi","Lakshadweep","Puducherry","Jammu and Kashmir","Ladakh",
];

const today = new Date().toISOString().split("T")[0];

export default function EditRequest() {
  const { requestNumber }         = useParams();
  const navigate                  = useNavigate();
  const [fetching, setFetching]   = useState(true);
  const [fetchError, setFetchError] = useState("");
  const [loading, setLoading]     = useState(false);
  const [apiError, setApiError]   = useState("");
  const [request, setRequest]     = useState(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm();

  //load existing request and pre-fill form
  useEffect(() => {
    if (!requestNumber) return;
    const load = async () => {
      try {
        const res = await axiosInstance.get(`/request-api/request/${requestNumber}`);
        const req = res.data?.payload;
        if (!req) throw new Error("Request not found");
        if (req.status !== "OPEN") {
          setFetchError("Only OPEN requests can be edited.");
          return;
        }
        setRequest(req);
        //pre-fill form with existing values
        reset({
          patientName:     req.patientName     || "",
          patientAge:      req.patientAge      || "",
          patientGender:   req.patientGender   || "",
          bloodGroup:      req.bloodGroup      || "",
          unitsRequired:   req.unitsRequired   || "",
          hospitalName:    req.hospitalName    || "",
          hospitalAddress: req.hospitalAddress || "",
          state:           req.state           || "",
          contactPerson:   req.contactPerson   || "",
          contactNumber:   req.contactNumber   || "",
          alertLevel:      req.alertLevel      || "",
          requiredByDate:  req.requiredByDate
            ? req.requiredByDate.split("T")[0]
            : "",
        });
      } catch (err) {
        setFetchError(err.response?.data?.message || err.message || "Failed to load request.");
      } finally {
        setFetching(false);
      }
    };
    load();
  }, [requestNumber, reset]);

  const onSubmit = async (data) => {
    setApiError("");
    try {
      setLoading(true);
      await axiosInstance.put("/request-api/edit-request", {
        requestNumber,
        patientName:     data.patientName,
        patientAge:      Number(data.patientAge),
        patientGender:   data.patientGender,
        bloodGroup:      data.bloodGroup,
        unitsRequired:   Number(data.unitsRequired),
        hospitalName:    data.hospitalName,
        hospitalAddress: data.hospitalAddress,
        state:           data.state,
        contactPerson:   data.contactPerson,
        contactNumber:   data.contactNumber,
        alertLevel:      data.alertLevel,
        requiredByDate:  data.requiredByDate,
      });
      toast.success("Request updated successfully.");
      navigate(`/requests/${requestNumber}`);
    } catch (err) {
      setApiError(err.response?.data?.message || "Failed to update request.");
    } finally {
      setLoading(false);
    }
  };

  const err    = (field) => errors[field]?.message;
  const inputCls  = (field) => `${inputClass}  ${errors[field] ? "border-[#dc2626]" : ""}`;
  const selectCls = (field) => `${selectClass} ${errors[field] ? "border-[#dc2626]" : ""}`;

  if (fetching) return <div className={pageBackground}><p className={`${loadingClass} pt-32`}>Loading request…</p></div>;
  if (fetchError) return (
    <div className={pageBackground}>
      <div className={`${errorClass} max-w-xl mx-auto mt-20`}>
        {fetchError}
        <button onClick={() => navigate(-1)} className="underline ml-2 cursor-pointer">Go back</button>
      </div>
    </div>
  );

  return (
    <div className={`${pageBackground} py-14 px-4`}>
      <div className={formCard}>

        {/* Header */}
        <div className="mb-8">
          <p className="text-[#c0152a] text-xs font-bold uppercase tracking-widest mb-1">
            Edit request
          </p>
          <h1 className={formTitle} style={{ textAlign: "left", marginBottom: 0 }}>
            Update blood request
          </h1>
          <p className="text-sm text-[#9e9e9e] mt-1">
            Editing{" "}
            <span className="font-mono text-[0.7rem] font-semibold text-[#6b6b6b]">
              {requestNumber}
            </span>
          </p>
        </div>

        {apiError && <div className={`${errorClass} mb-6`}>{apiError}</div>}

        <form onSubmit={handleSubmit(onSubmit)} noValidate>
          <p className="text-xs font-bold text-[#9e9e9e] uppercase tracking-widest mb-4">
            Patient information
          </p>

          <div className={formRow}>
            <div className={formGroup}>
              <label className={labelClass}>Patient name</label>
              <input placeholder="Ravi Kumar" className={inputCls("patientName")}
                {...register("patientName", { required: "Patient name is required" })} />
              {err("patientName") && <p className="text-[#dc2626] text-xs mt-1">{err("patientName")}</p>}
            </div>
            <div className={formGroup}>
              <label className={labelClass}>Patient age</label>
              <input type="number" min="1" max="120" className={inputCls("patientAge")}
                {...register("patientAge", {
                  required: "Patient age is required",
                  min: { value: 1,   message: "Age must be at least 1" },
                  max: { value: 120, message: "Age must be at most 120" },
                })} />
              {err("patientAge") && <p className="text-[#dc2626] text-xs mt-1">{err("patientAge")}</p>}
            </div>
          </div>

          <div className={formRow}>
            <div className={formGroup}>
              <label className={labelClass}>Gender</label>
              <select className={selectCls("patientGender")}
                {...register("patientGender", { required: "Gender is required" })}>
                <option value="">Select gender</option>
                {GENDERS.map((g) => <option key={g} value={g}>{g}</option>)}
              </select>
              {err("patientGender") && <p className="text-[#dc2626] text-xs mt-1">{err("patientGender")}</p>}
            </div>
            <div className={formGroup}>
              <label className={labelClass}>Blood group needed</label>
              <select className={selectCls("bloodGroup")}
                {...register("bloodGroup", { required: "Blood group is required" })}>
                <option value="">Select blood group</option>
                {BLOOD_GROUPS.map((bg) => <option key={bg} value={bg}>{bg}</option>)}
              </select>
              {err("bloodGroup") && <p className="text-[#dc2626] text-xs mt-1">{err("bloodGroup")}</p>}
            </div>
          </div>

          <div className={formRow}>
            <div className={formGroup}>
              <label className={labelClass}>Units required</label>
              <input type="number" min="1" max="20" className={inputCls("unitsRequired")}
                {...register("unitsRequired", {
                  required: "Units required",
                  min: { value: 1,  message: "At least 1 unit" },
                  max: { value: 20, message: "Max 20 units" },
                })} />
              {err("unitsRequired") && <p className="text-[#dc2626] text-xs mt-1">{err("unitsRequired")}</p>}
            </div>
            <div className={formGroup}>
              <label className={labelClass}>Required by date</label>
              <input type="date" min={today} className={inputCls("requiredByDate")}
                {...register("requiredByDate", { required: "Required by date is needed" })} />
              {err("requiredByDate") && <p className="text-[#dc2626] text-xs mt-1">{err("requiredByDate")}</p>}
            </div>
          </div>
          <div className="border-t border-[#e4e4e4] my-6" />
          <p className="text-xs font-bold text-[#9e9e9e] uppercase tracking-widest mb-4">
            Hospital information
          </p>

          <div className={formGroup}>
            <label className={labelClass}>Hospital name</label>
            <input placeholder="Apollo Hospital" className={inputCls("hospitalName")}
              {...register("hospitalName", { required: "Hospital name is required" })} />
            {err("hospitalName") && <p className="text-[#dc2626] text-xs mt-1">{err("hospitalName")}</p>}
          </div>

          <div className={formRow}>
            <div className={formGroup}>
              <label className={labelClass}>Hospital address</label>
              <input className={inputCls("hospitalAddress")}
                {...register("hospitalAddress", { required: "Hospital address is required" })} />
              {err("hospitalAddress") && <p className="text-[#dc2626] text-xs mt-1">{err("hospitalAddress")}</p>}
            </div>
            <div className={formGroup}>
              <label className={labelClass}>State</label>
              <select className={selectCls("state")}
                {...register("state", { required: "State is required" })}>
                <option value="">Select state</option>
                {STATES.map((s) => <option key={s} value={s}>{s}</option>)}
              </select>
              {err("state") && <p className="text-[#dc2626] text-xs mt-1">{err("state")}</p>}
            </div>
          </div>
          <div className="border-t border-[#e4e4e4] my-6" />
          <p className="text-xs font-bold text-[#9e9e9e] uppercase tracking-widest mb-4">
            Contact & urgency
          </p>

          <div className={formRow}>
            <div className={formGroup}>
              <label className={labelClass}>Contact person</label>
              <input className={inputCls("contactPerson")}
                {...register("contactPerson", { required: "Contact person is required" })} />
              {err("contactPerson") && <p className="text-[#dc2626] text-xs mt-1">{err("contactPerson")}</p>}
            </div>
            <div className={formGroup}>
              <label className={labelClass}>Contact number</label>
              <input type="tel" className={inputCls("contactNumber")}
                {...register("contactNumber", {
                  required: "Contact number is required",
                  pattern: { value: /^[6-9]\d{9}$/, message: "Enter a valid 10-digit mobile number" },
                })} />
              {err("contactNumber") && <p className="text-[#dc2626] text-xs mt-1">{err("contactNumber")}</p>}
            </div>
          </div>

          <div className={formGroup}>
            <label className={labelClass}>Alert level</label>
            <select className={selectCls("alertLevel")}
              {...register("alertLevel", { required: "Alert level is required" })}>
              <option value="">Select alert level</option>
              {ALERT_LEVELS.map((al) => <option key={al} value={al}>{al}</option>)}
            </select>
            {err("alertLevel") && <p className="text-[#dc2626] text-xs mt-1">{err("alertLevel")}</p>}
            <p className="text-xs text-[#9e9e9e] mt-1.5">
              GREEN = routine · YELLOW = moderate · RED = critical · BLACK = catastrophic
            </p>
          </div>
          <div className="flex gap-3 mt-8">
            <button
              type="submit"
              disabled={loading}
              className={`${submitBtn} w-auto px-8 ${loading ? "opacity-60 cursor-not-allowed" : ""}`}
            >
              {loading ? "Saving…" : "Save changes"}
            </button>
            <button
              type="button"
              onClick={() => navigate(`/requests/${requestNumber}`)}
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

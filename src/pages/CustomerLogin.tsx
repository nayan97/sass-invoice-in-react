import React, { useState } from "react";
import { useNavigate, useParams } from "react-router";
import { useDispatch } from "react-redux";
import { Loader2, Mail, ShieldCheck, ArrowLeft } from "lucide-react";
import {
  useRequestCustomerOtpMutation,
  useVerifyCustomerOtpMutation,
} from "../store/customerAuthApi";
import { setCustomerCredentials } from "../store/customerAuthSlice";

const CustomerLogin: React.FC = () => {
  const { company } = useParams<{ company: string }>();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const [step, setStep] = useState<"email" | "otp">("email");
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  const [requestOtp, { isLoading: isRequesting }] = useRequestCustomerOtpMutation();
  const [verifyOtp, { isLoading: isVerifying }] = useVerifyCustomerOtpMutation();

  const handleRequestOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");
    if (!company) return;

    try {
      await requestOtp({ company, email }).unwrap();
      setStep("otp");
    } catch (err: any) {
      setErrorMsg(err?.data?.message || "Failed to send OTP. Please try again.");
    }
  };

const handleVerifyOtp = async (e: React.FormEvent) => {
  e.preventDefault();
  setErrorMsg("");
  if (!company) return;

  try {
    const res = await verifyOtp({ company, email, otp }).unwrap();
    dispatch(setCustomerCredentials({ token: res.token, email }));
    navigate(`/customer/${company}/profile`);
  } catch (err: any) {
    setErrorMsg(err?.data?.message || "Invalid or expired OTP.");
  }
};

  return (
    <div className="min-h-screen bg-[#F8F9FA] flex items-center justify-center px-4 py-10 font-sans text-[#333333]">
      <div className="w-full max-w-md">

        {/* Logo / Brand */}
        <div className="flex flex-col items-center mb-8">
          <div className="w-14 h-14 rounded-2xl bg-[#2D8A75] flex items-center justify-center mb-3 shadow-sm">
            <svg className="w-7 h-7 text-white" fill="currentColor" viewBox="0 0 24 24">
              <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
            </svg>
          </div>
          <h1 className="text-[22px] font-bold text-slate-800 tracking-tight">BusinessInvoice</h1>
          <p className="text-[11px] text-gray-400 font-medium uppercase tracking-widest mt-1">
            Customer Portal
          </p>
        </div>

        {/* Card */}
        <div className="bg-white rounded-lg border border-gray-100 shadow-sm px-8 py-8">

          <div className="mb-6">
            <h2 className="text-[15px] font-bold tracking-wide text-slate-800 uppercase">
              {step === "email" ? "Access Your Profile" : "Enter Verification Code"}
            </h2>
            <p className="text-xs text-gray-400 mt-1">
              {step === "email"
                ? "We'll email you a one-time code"
                : `Code sent to ${email}`}
            </p>
          </div>

          {errorMsg && (
            <div className="mb-4 text-xs text-red-600 bg-red-50 border border-red-100 rounded px-3 py-2">
              {errorMsg}
            </div>
          )}

          {step === "email" && (
            <form onSubmit={handleRequestOtp} className="space-y-5">
              <div>
                <label className="text-[11px] text-gray-400 font-medium uppercase tracking-wide block mb-1.5">
                  Email Address <span className="text-red-400">*</span>
                </label>
                <div className="relative">
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="emailaddress@mail.com"
                    required
                    autoFocus
                    className="w-full border border-gray-200 bg-white pl-9 pr-4 py-2.5 rounded text-sm focus:outline-none focus:ring-1 focus:ring-[#2D8A75] text-gray-700 placeholder-gray-400 transition-colors"
                  />
                  <Mail className="absolute left-3 top-2.5 text-gray-400" size={16} />
                </div>
              </div>

              <button
                type="submit"
                disabled={isRequesting}
                className="w-full bg-[#2D8A75] text-white py-2.5 rounded text-sm font-semibold uppercase tracking-widest hover:bg-[#256d5e] transition-colors disabled:opacity-50 flex items-center justify-center gap-2 mt-2"
              >
                {isRequesting ? <Loader2 className="w-4 h-4 animate-spin" /> : "Send OTP"}
              </button>
            </form>
          )}

          {step === "otp" && (
            <form onSubmit={handleVerifyOtp} className="space-y-5">
              <div>
                <label className="text-[11px] text-gray-400 font-medium uppercase tracking-wide block mb-1.5">
                  6-Digit Code <span className="text-red-400">*</span>
                </label>
                <div className="relative">
                  <input
                    type="text"
                    inputMode="numeric"
                    maxLength={6}
                    value={otp}
                    onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
                    placeholder="••••••"
                    required
                    autoFocus
                    className="w-full border border-gray-200 bg-white pl-9 pr-4 py-2.5 rounded text-sm text-center tracking-[0.5em] font-semibold focus:outline-none focus:ring-1 focus:ring-[#2D8A75] text-gray-700 placeholder-gray-400 transition-colors"
                  />
                  <ShieldCheck className="absolute left-3 top-2.5 text-gray-400" size={16} />
                </div>
              </div>

              <button
                type="submit"
                disabled={isVerifying || otp.length !== 6}
                className="w-full bg-[#2D8A75] text-white py-2.5 rounded text-sm font-semibold uppercase tracking-widest hover:bg-[#256d5e] transition-colors disabled:opacity-50 flex items-center justify-center gap-2 mt-2"
              >
                {isVerifying ? <Loader2 className="w-4 h-4 animate-spin" /> : "Verify & Continue"}
              </button>

              <button
                type="button"
                onClick={() => {
                  setStep("email");
                  setOtp("");
                  setErrorMsg("");
                }}
                className="w-full flex items-center justify-center gap-1.5 text-xs text-gray-500 hover:text-gray-700 transition-colors pt-1"
              >
                <ArrowLeft size={14} />
                Use a different email
              </button>
            </form>
          )}
        </div>

        <p className="text-center text-[11px] text-gray-400 mt-5">
          © {new Date().getFullYear()} BusinessInvoice. All rights reserved.
        </p>

      </div>
    </div>
  );
};

export default CustomerLogin;
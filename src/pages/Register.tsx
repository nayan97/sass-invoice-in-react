import React, { useState } from "react";
import { Link, useNavigate } from "react-router";
import { useDispatch } from "react-redux";
import { Loader2, Mail, Eye, EyeOff, User } from "lucide-react";
import { useRegisterMutation } from "../store/authApi";
import { setCredentials } from "../store/authSlice";

const Register: React.FC = () => {
  const [name, setName]                         = useState("");
  const [email, setEmail]                       = useState("");
  const [password, setPassword]                 = useState("");
  const [passwordConfirmation, setPasswordConfirmation] = useState("");
  const [showPassword, setShowPassword]         = useState(false);
  const [showConfirm, setShowConfirm]           = useState(false);

  const navigate  = useNavigate();
  const dispatch  = useDispatch();
  const [register, { isLoading }] = useRegisterMutation();

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();

    if (password !== passwordConfirmation) {
      alert("Passwords do not match.");
      return;
    }

    try {
      const userData = await register({
        name,
        email,
        password,
        password_confirmation: passwordConfirmation,
      }).unwrap();

      dispatch(setCredentials({
        user:         userData.user,
        access_token: userData.access_token,
        token_type:   userData.token_type,
        roles:        userData.roles,
        permissions:  userData.permissions,
        company_id:   userData.company_id,
      }));

      // Fresh registration → no company yet, send to onboarding / dashboard
      const params     = new URLSearchParams(window.location.search);
      const redirectTo = params.get("redirect") || "/dashboard";
      navigate(redirectTo);

    } catch (err: any) {
      alert(err?.data?.message || "Registration failed. Please try again.");
    }
  };

  return (
    <div className="min-h-screen bg-[#F8F9FA] flex items-center justify-center px-4 py-10 font-sans text-[#333333]">
      <div className="w-full max-w-md">

        {/* Brand */}
        <div className="flex flex-col items-center mb-8">
          <div className="w-14 h-14 rounded-2xl bg-[#2D8A75] flex items-center justify-center mb-3 shadow-sm">
            <svg className="w-7 h-7 text-white" fill="currentColor" viewBox="0 0 24 24">
              <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
            </svg>
          </div>
          <h1 className="text-[22px] font-bold text-slate-800 tracking-tight">BusinessInvoice</h1>
          <p className="text-[11px] text-gray-400 font-medium uppercase tracking-widest mt-1">
            Subscription Management
          </p>
        </div>

        {/* Card */}
        <div className="bg-white rounded-lg border border-gray-100 shadow-sm px-8 py-8">

          <div className="mb-6">
            <h2 className="text-[15px] font-bold tracking-wide text-slate-800 uppercase">
              Create Account
            </h2>
            <p className="text-xs text-gray-400 mt-1">Fill in the details below to get started</p>
          </div>

          <form onSubmit={handleRegister} className="space-y-5">

            {/* Name */}
            <div>
              <label className="text-[11px] text-gray-400 font-medium uppercase tracking-wide block mb-1.5">
                Full Name <span className="text-red-400">*</span>
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="John Doe"
                  required
                  className="w-full border border-gray-200 bg-white pl-9 pr-4 py-2.5 rounded text-sm focus:outline-none focus:ring-1 focus:ring-[#2D8A75] text-gray-700 placeholder-gray-400 transition-colors"
                />
                <User className="absolute left-3 top-2.5 text-gray-400" size={16} />
              </div>
            </div>

            {/* Email */}
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
                  className="w-full border border-gray-200 bg-white pl-9 pr-4 py-2.5 rounded text-sm focus:outline-none focus:ring-1 focus:ring-[#2D8A75] text-gray-700 placeholder-gray-400 transition-colors"
                />
                <Mail className="absolute left-3 top-2.5 text-gray-400" size={16} />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="text-[11px] text-gray-400 font-medium uppercase tracking-wide block mb-1.5">
                Password <span className="text-red-400">*</span>
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  minLength={8}
                  className="w-full border border-gray-200 bg-white pl-4 pr-10 py-2.5 rounded text-sm focus:outline-none focus:ring-1 focus:ring-[#2D8A75] text-gray-700 placeholder-gray-400 transition-colors"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((p) => !p)}
                  className="absolute right-3 top-2.5 text-gray-400 hover:text-gray-700 transition-colors"
                  aria-label="Toggle password visibility"
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {/* Confirm Password */}
            <div>
              <label className="text-[11px] text-gray-400 font-medium uppercase tracking-wide block mb-1.5">
                Confirm Password <span className="text-red-400">*</span>
              </label>
              <div className="relative">
                <input
                  type={showConfirm ? "text" : "password"}
                  value={passwordConfirmation}
                  onChange={(e) => setPasswordConfirmation(e.target.value)}
                  placeholder="••••••••"
                  required
                  minLength={8}
                  className={`w-full border bg-white pl-4 pr-10 py-2.5 rounded text-sm focus:outline-none focus:ring-1 text-gray-700 placeholder-gray-400 transition-colors ${
                    passwordConfirmation && password !== passwordConfirmation
                      ? "border-red-300 focus:ring-red-300"
                      : "border-gray-200 focus:ring-[#2D8A75]"
                  }`}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirm((p) => !p)}
                  className="absolute right-3 top-2.5 text-gray-400 hover:text-gray-700 transition-colors"
                  aria-label="Toggle confirm password visibility"
                >
                  {showConfirm ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              {passwordConfirmation && password !== passwordConfirmation && (
                <p className="text-[11px] text-red-400 mt-1">Passwords do not match.</p>
              )}
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={isLoading || (!!passwordConfirmation && password !== passwordConfirmation)}
              className="w-full bg-[#2D8A75] text-white py-2.5 rounded text-sm font-semibold uppercase tracking-widest hover:bg-[#256d5e] transition-colors disabled:opacity-50 flex items-center justify-center gap-2 mt-2"
            >
              {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Create Account"}
            </button>
          </form>

          {/* Divider */}
          <div className="border-t border-gray-100 mt-6 pt-5 text-center">
            <p className="text-xs text-gray-500">
              Already have an account?{" "}
              <Link
                to="/login"
                className="text-[#2D8A75] hover:text-[#256d5e] font-semibold transition-colors"
              >
                Sign In
              </Link>
            </p>
          </div>
        </div>

        {/* Footer */}
        <p className="text-center text-[11px] text-gray-400 mt-5">
          © {new Date().getFullYear()} BusinessInvoice. All rights reserved.
        </p>

      </div>
    </div>
  );
};

export default Register;
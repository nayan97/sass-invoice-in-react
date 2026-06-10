import React, { useState } from "react";
import { Link, useNavigate } from "react-router";
import { useDispatch } from "react-redux";
import { Loader2, Mail, Eye, EyeOff } from "lucide-react";
import { useLoginMutation } from "../store/authApi";
import { setCredentials } from "../store/authSlice";

const Login: React.FC = () => {
  const [email, setEmail] = useState("admin@gmail.com");
  const [password, setPassword] = useState("12345678");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [login, { isLoading }] = useLoginMutation();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const userData = await login({ email, password }).unwrap();
      dispatch(setCredentials({
        user: userData.user,
        access_token: userData.access_token,
        token_type: userData.token_type,
        roles: userData.roles,
        permissions: userData.permissions,
        company_id: userData.company_id,
      }));

      const params = new URLSearchParams(window.location.search);
      const redirectTo = params.get("redirect") || "/dashboard";
      navigate(redirectTo);
    } catch (err: any) {
      alert(err?.data?.message || "Login failed. Please check your credentials.");
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
            Subscription Management
          </p>
        </div>

        {/* Card */}
        <div className="bg-white rounded-lg border border-gray-100 shadow-sm px-8 py-8">

          <div className="mb-6">
            <h2 className="text-[15px] font-bold tracking-wide text-slate-800 uppercase">
              Sign In
            </h2>
            <p className="text-xs text-gray-400 mt-1">Enter your credentials to continue</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-5">

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
                  className="w-full border border-gray-200 bg-white pl-4 pr-10 py-2.5 rounded text-sm focus:outline-none focus:ring-1 focus:ring-[#2D8A75] text-gray-700 placeholder-gray-400 transition-colors"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((prev) => !prev)}
                  className="absolute right-3 top-2.5 text-gray-400 hover:text-gray-700 transition-colors"
                  aria-label="Toggle password visibility"
                >
                  {showPassword
                    ? <EyeOff size={16} />
                    : <Eye size={16} />}
                </button>
              </div>
            </div>

            {/* Remember me / Forgot */}
            <div className="flex items-center justify-between pt-1">
              <label className="flex items-center gap-2 text-xs text-gray-500 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="w-4 h-4 rounded border-gray-300 accent-[#2D8A75] cursor-pointer"
                />
                Remember me
              </label>
              <Link
                to="/forgot-password"
                className="text-xs text-[#2D8A75] hover:text-[#256d5e] font-medium transition-colors"
              >
                Forgot Password?
              </Link>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-[#2D8A75] text-white py-2.5 rounded text-sm font-semibold uppercase tracking-widest hover:bg-[#256d5e] transition-colors disabled:opacity-50 flex items-center justify-center gap-2 mt-2"
            >
              {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Sign In"}
            </button>
          </form>

          {/* Divider */}
          <div className="border-t border-gray-100 mt-6 pt-5 text-center">
            <p className="text-xs text-gray-500">
              Don't have an account?{" "}
              <Link
                to="/register"
                className="text-[#2D8A75] hover:text-[#256d5e] font-semibold transition-colors"
              >
                Register Here
              </Link>
            </p>
          </div>
        </div>

        {/* Footer note */}
        <p className="text-center text-[11px] text-gray-400 mt-5">
          © {new Date().getFullYear()} BusinessInvoice. All rights reserved.
        </p>

      </div>
    </div>
  );
};

export default Login;
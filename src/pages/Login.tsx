import React, { useState } from "react";
import { Link, useNavigate } from "react-router";
import { useDispatch } from "react-redux";
import { Loader2 } from "lucide-react";
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
      dispatch(setCredentials(userData));
      navigate("/dashboard");
    } catch (err: any) {
      alert(err?.data?.message || "Login failed. Please check your credentials.");
    }
  };

  return (
    <div className="min-h-screen grid lg:grid-cols-2 bg-[#05060a] text-gray-200">

      {/* Left side — branding */}
      <section className="hidden lg:flex items-center justify-center bg-[#05070d] relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-yellow-400/5 to-teal-400/5" />
        <div className="relative z-10 flex flex-col items-center gap-3">
          {/* Replace with <img src={logo} alt="BusinessInvoice Logo" className="max-w-[65%] object-contain" /> */}
          <div className="w-24 h-24 rounded-3xl bg-gradient-to-br from-yellow-400 to-teal-400 flex items-center justify-content-center items-center justify-center">
            <svg className="w-12 h-12 text-[#05060a]" fill="currentColor" viewBox="0 0 24 24">
              <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
            </svg>
          </div>
          <p className="text-2xl font-semibold text-yellow-400 tracking-widest mt-2">BusinessInvoice</p>
          <p className="text-xs text-teal-400 tracking-[3px] uppercase">Simply the best fitness &amp; wellness</p>
        </div>
      </section>

      {/* Right side — form */}
      <section className="flex items-center justify-center px-5 py-10 sm:px-8 lg:px-16 bg-[#05060a]">
        <div className="w-full max-w-md">

          {/* Mobile logo */}
          <div className="flex justify-center mb-10 lg:hidden">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-yellow-400 to-teal-400 flex items-center justify-center">
              <svg className="w-8 h-8 text-[#05060a]" fill="currentColor" viewBox="0 0 24 24">
                <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
              </svg>
            </div>
          </div>

          {/* Heading */}
          <div className="mb-8 text-center">
            <h1 className="text-3xl sm:text-4xl font-semibold text-white leading-tight">
              Welcome Back to
            </h1>
            <h2 className="text-4xl sm:text-5xl font-bold text-yellow-400 mt-2 tracking-tight">
              BusinessInvoice
            </h2>
            <p className="text-sm text-teal-400 mt-4 tracking-widest uppercase">
              Simply the best fitness and wellness
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleLogin} className="space-y-6">

            {/* Email */}
            <div>
              <label className="text-xs uppercase tracking-wider text-gray-400 font-medium">
                Email Address <span className="text-red-500">*</span>
              </label>
              <div className="mt-2 relative">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="emailaddress@mail.com"
                  required
                  className="w-full bg-transparent border-b border-gray-600 py-3 pr-10 text-sm text-white placeholder-gray-600 outline-none focus:border-teal-400 transition-colors"
                />
                <div className="absolute right-0 top-1/2 -translate-y-1/2 flex items-center justify-center w-8 h-8 text-gray-500 pointer-events-none">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
                  </svg>
                </div>
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="text-xs uppercase tracking-wider text-gray-400 font-medium">
                Password <span className="text-red-500">*</span>
              </label>
              <div className="mt-2 relative">
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  className="w-full bg-transparent border-b border-gray-600 py-3 pr-10 text-sm text-white placeholder-gray-600 outline-none focus:border-teal-400 transition-colors"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((prev) => !prev)}
                  className="absolute right-0 top-1/2 -translate-y-1/2 flex items-center justify-center w-8 h-8 text-gray-500 hover:text-white transition-colors"
                  aria-label="Toggle password visibility"
                >
                  {showPassword ? (
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88" />
                    </svg>
                  ) : (
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                  )}
                </button>
              </div>
            </div>

            {/* Remember me / Forgot */}
            <div className="flex items-center justify-between gap-4 pt-2">
              <label className="flex items-center gap-2 text-xs text-gray-400 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="w-4 h-4 rounded border-gray-600 bg-[#1f2937] accent-yellow-400 cursor-pointer"
                />
                Remember me
              </label>
              <Link
                to="/forgot-password"
                className="text-xs text-gray-500 hover:text-yellow-400 transition-colors"
              >
                Forgot Password?
              </Link>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-yellow-400 text-black py-3 rounded-xl text-sm font-bold uppercase tracking-widest hover:bg-yellow-500 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Login"}
            </button>
          </form>

        </div>
      </section>
    </div>
  );
};

export default Login;
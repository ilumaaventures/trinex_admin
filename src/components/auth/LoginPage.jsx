import { useState } from "react";
import { TechnicalIcon } from "../ui/TechnicalIcon";
import { api } from "../../services/api";

export function LoginPage({ onLoginSuccess }) {
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!identifier.trim()) {
      setError("Please enter your admin email or username.");
      return;
    }
    if (!password) {
      setError("Please enter your password.");
      return;
    }

    setIsLoading(true);
    setError("");

    try {
      const { user } = await api.login({
        emailOrUsername: identifier.trim(),
        password,
        rememberMe,
      });
      onLoginSuccess?.(user);
    } catch (err) {
      setError(err.message || "Invalid authentication credentials. Access denied.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#F5F8F4] via-[#EBF3EA] to-[#E2ECE0] text-[#202B25] flex flex-col justify-between items-center p-4 sm:p-6 relative overflow-hidden select-none">
      {/* Engineering Blueprint Grid Background */}
      <div className="absolute inset-0 bg-blueprint-grid opacity-70 pointer-events-none" />

      {/* Subtle Ambient Radial Glow Backdrops (Light Sage & Emerald) */}
      <div className="absolute w-[600px] h-[600px] bg-[#527C50]/10 rounded-full blur-[140px] pointer-events-none -top-32 -left-32" />
      <div className="absolute w-[550px] h-[550px] bg-[#A6C96A]/15 rounded-full blur-[140px] pointer-events-none -bottom-32 -right-32" />
      <div className="absolute w-[400px] h-[400px] bg-[#315C3C]/5 rounded-full blur-[100px] pointer-events-none top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />

      {/* Top Corporate Status Badge */}
      <div className="relative z-10 w-full max-w-[440px] flex items-center justify-between px-1 pt-2 sm:pt-4">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/80 border border-[#D5DED4] text-[#315C3C] font-sans font-medium text-[11px] shadow-2xs backdrop-blur-sm">
          <span className="w-2 h-2 rounded-full bg-[#527C50] animate-pulse" />
          <span>Trinex Systems Enterprise</span>
        </div>
        <div className="flex items-center gap-1.5 text-[11px] font-mono text-[#68736B]">
          <TechnicalIcon name="shield-check" className="w-3.5 h-3.5 text-[#527C50]" />
          <span>SSO &bull; Admin Portal</span>
        </div>
      </div>

      {/* Main Login Card */}
      <div className="relative z-10 w-full max-w-[440px] my-auto bg-white/95 border border-[#D5DED4] rounded-2xl shadow-[0_20px_50px_rgba(49,92,60,0.10),0_2px_8px_rgba(0,0,0,0.04)] backdrop-blur-xl overflow-hidden transition-all">
        {/* Top Gradient Accent Strip */}
        <div className="h-1.5 w-full bg-gradient-to-r from-[#315C3C] via-[#527C50] to-[#A6C96A]" />

        {/* Card Header with Trinex Logo */}
        <div className="pt-8 pb-6 px-6 sm:px-8 text-center border-b border-[#EEF3ED] space-y-3">
          <div className="flex justify-center mb-1">
            <img
              src="/assets/trinex-logo.png"
              alt="Trinex Systems LLP"
              onError={(e) => {
                e.currentTarget.onerror = null;
                e.currentTarget.src = "/assets/trinex-logo-light.png";
              }}
              className="h-12 sm:h-14 w-auto object-contain mx-auto filter drop-shadow-xs"
            />
          </div>

          <div>
            <h1 className="text-xl sm:text-2xl font-heading font-extrabold tracking-tight text-[#202B25]">
              TRINEX SYSTEMS LLP
            </h1>
            <div className="mt-1.5 flex items-center justify-center">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10.5px] font-mono font-semibold tracking-wider uppercase bg-[#EAF1E8] text-[#315C3C] border border-[#527C50]/20">
                <span className="w-1.5 h-1.5 rounded-full bg-[#527C50]" />
                Admin Portal &bull; Inventory Management
              </span>
            </div>
            <p className="text-xs font-sans text-[#68736B] mt-2">
              Sign in with your administrative credentials to continue
            </p>
          </div>
        </div>

        {/* Form Body */}
        <div className="p-6 sm:p-8 space-y-5">
          {error && (
            <div className="p-3.5 bg-red-50 border border-red-200/80 rounded-lg text-xs font-sans font-medium text-red-700 flex items-start gap-2.5 animate-shake shadow-2xs">
              <TechnicalIcon name="alert-triangle" className="w-4 h-4 text-red-600 flex-shrink-0 mt-0.5" />
              <span className="leading-relaxed">{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Email / Username Field */}
            <div className="space-y-1.5">
              <label className="block text-[11px] font-sans font-bold uppercase tracking-wider text-[#315C3C]">
                Email or Username
              </label>
              <div className="relative group">
                <TechnicalIcon
                  name="user"
                  className="w-4 h-4 text-[#869288] group-focus-within:text-[#527C50] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none transition-colors"
                />
                <input
                  type="text"
                  autoComplete="username"
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                  placeholder="admin@trinexsystems.in or admin"
                  disabled={isLoading}
                  className="w-full pl-10 pr-3.5 py-2.5 bg-[#F9FAF8] hover:bg-white focus:bg-white border border-[#D5DED4] focus:border-[#527C50] text-xs font-sans rounded-lg text-[#202B25] placeholder-[#9CA3AF] focus:outline-none focus:ring-2 focus:ring-[#527C50]/20 transition-all shadow-2xs"
                />
              </div>
            </div>

            {/* Password Field with Eye Toggle */}
            <div className="space-y-1.5">
              <label className="block text-[11px] font-sans font-bold uppercase tracking-wider text-[#315C3C]">
                Password
              </label>
              <div className="relative group">
                <TechnicalIcon
                  name="lock"
                  className="w-4 h-4 text-[#869288] group-focus-within:text-[#527C50] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none transition-colors"
                />
                <input
                  type={showPassword ? "text" : "password"}
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  disabled={isLoading}
                  className="w-full pl-10 pr-10 py-2.5 bg-[#F9FAF8] hover:bg-white focus:bg-white border border-[#D5DED4] focus:border-[#527C50] text-xs font-mono rounded-lg text-[#202B25] placeholder-[#9CA3AF] focus:outline-none focus:ring-2 focus:ring-[#527C50]/20 transition-all shadow-2xs"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1 text-[#869288] hover:text-[#202B25] hover:bg-[#EAF1E8] rounded-md transition-colors cursor-pointer"
                  title={showPassword ? "Hide password" : "Show password"}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  <TechnicalIcon name={showPassword ? "eye-off" : "eye"} className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Remember Me Checkbox & Session Info */}
            <div className="flex items-center justify-between pt-1">
              <label className="flex items-center gap-2 cursor-pointer text-xs font-sans text-[#4B5563] hover:text-[#202B25] transition-colors select-none">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="w-4 h-4 rounded border-[#D5DED4] text-[#315C3C] focus:ring-[#527C50] accent-[#315C3C] cursor-pointer"
                />
                <span>Remember me</span>
              </label>
              <span className="text-[11px] font-sans font-medium text-[#869288]">
                Session: 30 days
              </span>
            </div>

            {/* Submit Button */}
            <div className="pt-2">
              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3 px-4 bg-[#315C3C] hover:bg-[#274830] active:scale-[0.99] text-white font-sans font-semibold text-xs uppercase tracking-wider rounded-lg transition-all duration-150 flex items-center justify-center gap-2 shadow-md shadow-[#315C3C]/20 hover:shadow-lg hover:shadow-[#315C3C]/30 cursor-pointer disabled:opacity-60 disabled:cursor-wait"
              >
                {isLoading ? (
                  <>
                    <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Verifying Credentials...</span>
                  </>
                ) : (
                  <>
                    <span>Log-in</span>
                    <TechnicalIcon name="shield-check" className="w-4 h-4 text-[#A6C96A]" />
                  </>
                )}
              </button>
            </div>
          </form>

          {/* Security & Compliance Footer Inside Card */}
          <div className="pt-4 border-t border-[#EEF3ED] flex items-center justify-center gap-2 text-[11px] font-sans text-[#68736B]">
            <TechnicalIcon name="shield-check" className="w-3.5 h-3.5 text-[#527C50] flex-shrink-0" />
            <span>Enterprise 256-bit SSL encrypted &bull; Role-based access</span>
          </div>
        </div>
      </div>

      {/* Outer Corporate Footer */}
      <footer className="relative z-10 w-full text-center space-y-1 text-xs font-sans text-[#68736B] py-3 sm:py-4">
        <p className="font-medium text-[#4B5563]">
          &copy; {new Date().getFullYear()} Trinex Systems LLP. All rights reserved.
        </p>
        <p className="text-[11px] text-[#869288]">
          Authorized Enterprise Personnel Only &bull; Unauthorized access is strictly prohibited and monitored.
        </p>
      </footer>
    </div>
  );
}

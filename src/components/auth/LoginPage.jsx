import { useState } from "react";
import { TechnicalIcon } from "../ui/TechnicalIcon";
import { Button } from "../ui/Button";
import { api } from "../../services/api";

export function LoginPage({ onLoginSuccess }) {
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const handleAutofill = () => {
    setIdentifier("admin@trinexsystems.com");
    setPassword("admin@trinex2026");
    setError("");
  };

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
    <div className="min-h-screen bg-[#071522] text-[#FAF9F6] flex flex-col justify-center items-center p-4 relative overflow-hidden select-none">
      {/* Background Blueprint Grid Effect */}
      <div className="absolute inset-0 bg-blueprint-grid opacity-15 pointer-events-none" />

      {/* Ambient Radial Glow */}
      <div className="absolute w-[500px] h-[500px] bg-[#A77C3A]/10 rounded-full blur-3xl pointer-events-none -top-24 -left-24" />
      <div className="absolute w-[400px] h-[400px] bg-[#A77C3A]/10 rounded-full blur-3xl pointer-events-none -bottom-24 -right-24" />

      {/* Main Login Card */}
      <div className="relative z-10 w-full max-w-md bg-[#0D1E2E]/90 border border-[#A77C3A]/40 rounded-[4px] shadow-2xl backdrop-blur-md overflow-hidden">
        {/* Top Tactical Status Bar */}
        <div className="bg-[#050E17] px-5 py-2.5 border-b border-white/10 flex items-center justify-between text-[10px] font-mono">
          <div className="flex items-center gap-2 text-[#C29A58]">
            <span className="w-2 h-2 rounded-full bg-[#C29A58] animate-pulse" />
            <span className="font-bold tracking-wider">DEFENCE ACCESS PORTAL</span>
          </div>
          <span className="text-white/40">SEC-VER: 2.4.0</span>
        </div>

        {/* Card Header & Crest */}
        <div className="p-6 sm:p-8 text-center border-b border-white/10 space-y-2">
          <div className="w-14 h-14 mx-auto rounded-[3px] bg-[#A77C3A]/15 border-2 border-[#A77C3A] flex items-center justify-center text-[#C29A58] shadow-lg mb-3">
            <TechnicalIcon name="shield-check" className="w-7 h-7" />
          </div>

          <h1 className="text-lg sm:text-xl font-extrabold tracking-wider uppercase text-white font-mono">
            TRINEX SYSTEMS LLP
          </h1>
          <p className="text-[11px] font-mono text-[#C29A58] tracking-widest uppercase">
            Strategic Defence Inventory &bull; Admin Portal
          </p>
          <div className="pt-1">
            <span className="text-[9px] font-mono text-white/50 bg-white/5 px-2.5 py-0.5 rounded-[2px] border border-white/10 uppercase tracking-widest inline-block">
              Restricted Area &bull; Level-3 Authorization
            </span>
          </div>
        </div>

        {/* Form Body */}
        <div className="p-6 sm:p-8 space-y-5">
          {error && (
            <div className="p-3 bg-red-950/80 border border-red-500/50 rounded-[2px] text-xs text-red-200 flex items-start gap-2.5 animate-shake">
              <TechnicalIcon name="alert-triangle" className="w-4 h-4 text-red-400 flex-shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Email / Username Field */}
            <div className="space-y-1">
              <label className="block text-[11px] font-mono font-bold uppercase tracking-wider text-white/80">
                Authorized Identifier (Email or Username)
              </label>
              <div className="relative">
                <TechnicalIcon
                  name="user"
                  className="w-4 h-4 text-white/40 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none"
                />
                <input
                  type="text"
                  autoComplete="username"
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                  placeholder="admin@trinexsystems.com or admin"
                  disabled={isLoading}
                  className="w-full pl-9 pr-3 py-2.5 bg-[#050E17]/80 border border-white/20 text-xs font-mono rounded-[2px] text-white placeholder-white/30 focus:outline-none focus:border-[#A77C3A] focus:ring-1 focus:ring-[#A77C3A] transition-colors"
                />
              </div>
            </div>

            {/* Password Field with Eye Toggle */}
            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <label className="block text-[11px] font-mono font-bold uppercase tracking-wider text-white/80">
                  Security Passkey
                </label>
              </div>
              <div className="relative">
                <TechnicalIcon
                  name="lock"
                  className="w-4 h-4 text-white/40 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none"
                />
                <input
                  type={showPassword ? "text" : "password"}
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter administrator passkey"
                  disabled={isLoading}
                  className="w-full pl-9 pr-10 py-2.5 bg-[#050E17]/80 border border-white/20 text-xs font-mono rounded-[2px] text-white placeholder-white/30 focus:outline-none focus:border-[#A77C3A] focus:ring-1 focus:ring-[#A77C3A] transition-colors"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40 hover:text-white transition-colors cursor-pointer"
                  title={showPassword ? "Hide password" : "Show password"}
                >
                  <TechnicalIcon name={showPassword ? "eye-off" : "eye"} className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Remember Me Checkbox */}
            <div className="flex items-center justify-between pt-1">
              <label className="flex items-center gap-2 cursor-pointer text-[11px] font-mono text-white/70">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="w-3.5 h-3.5 rounded-[2px] accent-[#A77C3A] bg-[#050E17] border-white/20 cursor-pointer"
                />
                <span>Remember this terminal (30 days)</span>
              </label>
            </div>

            {/* Submit Button */}
            <div className="pt-2">
              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3 bg-[#A77C3A] hover:bg-[#C29A58] active:scale-[0.99] text-[#071522] font-mono font-extrabold text-xs uppercase tracking-wider rounded-[2px] transition-all duration-150 flex items-center justify-center gap-2 shadow-lg cursor-pointer disabled:opacity-50 disabled:cursor-wait"
              >
                {isLoading ? (
                  <>
                    <span className="w-3.5 h-3.5 border-2 border-[#071522] border-t-transparent rounded-full animate-spin" />
                    <span>AUTHENTICATING CREDENTIALS...</span>
                  </>
                ) : (
                  <>
                    <TechnicalIcon name="lock" className="w-3.5 h-3.5" />
                    <span>AUTHENTICATE &amp; ENTER ENGINE</span>
                  </>
                )}
              </button>
            </div>
          </form>

          {/* Quick Demo Credentials Autofill Helper */}
          <div className="pt-2 border-t border-white/10">
            <div className="p-2.5 bg-[#050E17]/60 border border-white/10 rounded-[2px] flex items-center justify-between gap-2 text-[10px] font-mono">
              <div className="min-w-0">
                <span className="text-[#C29A58] font-bold block">DEFAULT CREDENTIALS:</span>
                <span className="text-white/60 truncate block">admin@trinexsystems.com / admin@trinex2026</span>
              </div>
              <button
                type="button"
                onClick={handleAutofill}
                className="px-2 py-1 bg-white/10 hover:bg-[#A77C3A] hover:text-[#071522] text-white/90 rounded-[2px] font-bold uppercase transition-colors cursor-pointer flex-shrink-0"
              >
                AUTOFILL
              </button>
            </div>
          </div>
        </div>

        {/* Footer Security Badge */}
        <div className="bg-[#050E17] px-6 py-3 border-t border-white/10 text-center">
          <p className="text-[10px] font-mono text-white/40 tracking-wider">
            &bull; 256-BIT ENCRYPTED SESSION &bull; TRINEX SYSTEMS LLP &bull;
          </p>
        </div>
      </div>
    </div>
  );
}

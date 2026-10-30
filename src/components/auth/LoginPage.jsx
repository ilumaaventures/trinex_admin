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
    <div className="min-h-screen bg-[#071522] text-[#FAF9F6] flex flex-col justify-center items-center p-4 relative overflow-hidden select-none">
      {/* Subtle Radial Glow Backdrops */}
      <div className="absolute w-[600px] h-[600px] bg-[#A77C3A]/10 rounded-full blur-[140px] pointer-events-none -top-32 -left-32" />
      <div className="absolute w-[500px] h-[500px] bg-[#A77C3A]/8 rounded-full blur-[140px] pointer-events-none -bottom-32 -right-32" />

      {/* Main Login Card */}
      <div className="relative z-10 w-full max-w-[440px] bg-[#0D1E2E]/95 border border-[#A77C3A]/30 rounded-[6px] shadow-[0_20px_60px_rgba(0,0,0,0.65)] backdrop-blur-xl overflow-hidden">
        {/* Card Header with Trinex Logo */}
        <div className="pt-8 pb-6 px-6 sm:px-8 text-center border-b border-white/10 space-y-3">
          <div className="flex justify-center mb-1">
            <img
              src="/assets/trinex-logo-light.png"
              alt="Trinex Systems LLP"
              onError={(e) => {
                e.currentTarget.onerror = null;
                e.currentTarget.src = "/assets/trinex-logo.png";
              }}
              className="h-12 sm:h-14 w-auto object-contain mx-auto filter drop-shadow-md"
            />
          </div>

          <div>
            <h1 className="text-lg sm:text-xl font-bold tracking-wider uppercase text-white font-mono">
              TRINEX SYSTEMS LLP
            </h1>
            <p className="text-[11px] font-mono text-[#C29A58] tracking-widest uppercase mt-0.5">
              Admin Portal &bull; Inventory Management
            </p>
          </div>
        </div>

        {/* Form Body */}
        <div className="p-6 sm:p-8 space-y-5">
          {error && (
            <div className="p-3 bg-red-950/80 border border-red-500/50 rounded-[4px] text-xs text-red-200 flex items-start gap-2.5 animate-shake">
              <TechnicalIcon name="alert-triangle" className="w-4 h-4 text-red-400 flex-shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Email / Username Field */}
            <div className="space-y-1.5">
              <label className="block text-xs font-mono font-semibold uppercase tracking-wider text-white/80">
                Email or Username
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
                  className="w-full pl-9 pr-3 py-2.5 bg-[#050E17]/90 border border-white/15 text-xs font-mono rounded-[4px] text-white placeholder-white/30 focus:outline-none focus:border-[#A77C3A] focus:ring-1 focus:ring-[#A77C3A] transition-colors"
                />
              </div>
            </div>

            {/* Password Field with Eye Toggle */}
            <div className="space-y-1.5">
              <label className="block text-xs font-mono font-semibold uppercase tracking-wider text-white/80">
                Password
              </label>
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
                  placeholder="Enter your password"
                  disabled={isLoading}
                  className="w-full pl-9 pr-10 py-2.5 bg-[#050E17]/90 border border-white/15 text-xs font-mono rounded-[4px] text-white placeholder-white/30 focus:outline-none focus:border-[#A77C3A] focus:ring-1 focus:ring-[#A77C3A] transition-colors"
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
              <label className="flex items-center gap-2 cursor-pointer text-xs font-mono text-white/70 hover:text-white transition-colors">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="w-3.5 h-3.5 rounded-[2px] accent-[#A77C3A] bg-[#050E17] border-white/20 cursor-pointer"
                />
                <span>Remember me</span>
              </label>
            </div>

            {/* Submit Button */}
            <div className="pt-2">
              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3 bg-[#A77C3A] hover:bg-[#C29A58] active:scale-[0.99] text-[#071522] font-mono font-bold text-xs uppercase tracking-wider rounded-[4px] transition-all duration-150 flex items-center justify-center gap-2 shadow-lg cursor-pointer disabled:opacity-50 disabled:cursor-wait"
              >
                {isLoading ? (
                  <>
                    <span className="w-3.5 h-3.5 border-2 border-[#071522] border-t-transparent rounded-full animate-spin" />
                    <span>LOGGING IN...</span>
                  </>
                ) : (
                  <span>Log-in</span>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}


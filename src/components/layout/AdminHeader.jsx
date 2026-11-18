import { TechnicalIcon } from "../ui/TechnicalIcon";
import { Button } from "../ui/Button";

const defaultClientUrl =
  import.meta.env.VITE_CLIENT_URL ||
  (import.meta.env.DEV ? "http://localhost:5173" : "https://trinex-fe.vercel.app");

export function AdminHeader({
  onExportExcel,
  clientUrl = defaultClientUrl,
  currentUser,
  onLogout,
}) {
  return (
    <header className="bg-[#315C3C] text-white border-b border-white/10 sticky top-0 z-40 shadow-lg">
      <div className="max-w-[1820px] w-full mx-auto px-4 sm:px-6 lg:px-8 py-3 flex flex-wrap items-center justify-between gap-4">
        {/* Left Branding */}
        <div className="flex items-center gap-3">
          <span className="w-2.5 h-2.5 rounded-full bg-[#A6C96A] animate-pulse" />
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-sm font-heading font-bold uppercase tracking-wider text-white">
                TRINEX SYSTEMS LLP
              </h1>
            </div>
          </div>
        </div>

        {/* Right Actions */}
        <div className="flex items-center gap-2 sm:gap-3">
          {currentUser && (
            <div className="hidden sm:flex items-center gap-2 px-2.5 py-1 bg-white/5 border border-white/10 rounded-[2px] text-xs font-sans">
              <TechnicalIcon name="user" className="w-3.5 h-3.5 text-[#A6C96A]" />
              <span className="text-white/80 text-[11px] max-w-[140px] truncate" title={currentUser.email || currentUser.username}>
                {currentUser.email || currentUser.username || "ADMIN"}
              </span>
              <span className="text-[9px] px-1.5 py-0.5 bg-[#A6C96A]/20 text-[#A6C96A] font-semibold rounded-[2px] uppercase">
                {currentUser.role || "ADMIN"}
              </span>
            </div>
          )}

          <a
            href={clientUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 py-1.5 px-3 bg-white/5 hover:bg-white/10 border border-white/20 text-white text-[11px] font-sans font-semibold uppercase tracking-wider rounded-[2px] transition-colors"
          >
            <TechnicalIcon name="external-link" className="w-3.5 h-3.5 text-[#A6C96A]" />
            <span>OPEN CLIENT SITE</span>
          </a>

          {onExportExcel && (
            <Button
              variant="secondary"
              size="sm"
              onClick={onExportExcel}
              className="border-white/20 font-sans font-semibold text-[11px] hover:border-[#A6C96A]/50 hover:text-[#A6C96A]"
              title="Download inventory spreadsheet in Excel format"
            >
              <TechnicalIcon name="spreadsheet" className="w-3.5 h-3.5 mr-1.5 text-[#A6C96A]" />
              EXPORT EXCEL
            </Button>
          )}

          {onLogout && (
            <button
              type="button"
              onClick={onLogout}
              className="inline-flex items-center gap-1.5 py-1.5 px-3 bg-red-950/40 hover:bg-red-900/70 border border-red-500/40 hover:border-red-400 text-red-200 hover:text-white text-[11px] font-sans font-semibold uppercase tracking-wider rounded-[2px] transition-colors cursor-pointer shadow-xs"
              title="Terminate session and log out"
            >
              <TechnicalIcon name="log-out" className="w-3.5 h-3.5 text-red-400" />
              <span>LOGOUT</span>
            </button>
          )}
        </div>
      </div>
    </header>
  );
}

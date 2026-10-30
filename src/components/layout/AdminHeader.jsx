import { TechnicalIcon } from "../ui/TechnicalIcon";
import { Button } from "../ui/Button";

const defaultClientUrl =
  import.meta.env.VITE_CLIENT_URL ||
  (import.meta.env.DEV ? "http://localhost:5173" : "https://trinex-fe.vercel.app");

const defaultBackendUrl = (
  import.meta.env.VITE_API_URL ||
  (import.meta.env.DEV ? "http://localhost:5000" : "https://trinex-be.onrender.com")
).replace(/\/api\/?$/, "");

export function AdminHeader({
  onExportJson,
  onOpenCreateCategory,
  clientUrl = defaultClientUrl,
  currentUser,
  onLogout,
}) {
  const sitemapUrl = `${defaultBackendUrl}/sitemap.xml`;
  return (
    <header className="bg-[#071522] text-white border-b border-white/10 sticky top-0 z-40 shadow-lg">
      <div className="max-w-[1820px] w-full mx-auto px-4 sm:px-6 lg:px-8 py-3 flex flex-wrap items-center justify-between gap-4">
        {/* Left Branding */}
        <div className="flex items-center gap-3">
          <span className="w-2.5 h-2.5 rounded-full bg-[#A77C3A] animate-pulse" />
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-sm font-bold uppercase tracking-wider text-white">
                TRINEX SYSTEMS LLP
              </h1>
              <span className="text-[10px] font-mono px-2 py-0.5 bg-[#A77C3A] text-[#071522] font-black rounded-[2px]">
                SUBDOMAIN PORTAL
              </span>
            </div>
            <p className="text-[11px] text-white/50 font-mono">
              admin.trinexsystems.com &bull; MIL-SPEC INVENTORY &amp; SEO ENGINE
            </p>
          </div>
        </div>

        {/* Right Actions */}
        <div className="flex items-center gap-2 sm:gap-3">
          {currentUser && (
            <div className="hidden sm:flex items-center gap-2 px-2.5 py-1 bg-white/5 border border-white/10 rounded-[2px] text-xs font-mono">
              <TechnicalIcon name="user" className="w-3.5 h-3.5 text-[#C29A58]" />
              <span className="text-white/80 text-[11px] max-w-[140px] truncate" title={currentUser.email || currentUser.username}>
                {currentUser.email || currentUser.username || "ADMIN"}
              </span>
              <span className="text-[9px] px-1 py-0.5 bg-[#A77C3A]/30 text-[#E5C388] font-bold rounded-[2px] uppercase">
                {currentUser.role || "ADMIN"}
              </span>
            </div>
          )}

          {onOpenCreateCategory && (
            <button
              type="button"
              onClick={onOpenCreateCategory}
              className="inline-flex items-center gap-1.5 py-1.5 px-3 bg-[#A77C3A]/20 hover:bg-[#A77C3A]/30 border border-[#A77C3A]/50 text-[#E5C388] hover:text-white text-[11px] font-mono font-bold uppercase tracking-wider rounded-[2px] transition-colors cursor-pointer shadow-xs"
            >
              <TechnicalIcon name="folder-plus" className="w-3.5 h-3.5 text-[#A77C3A]" />
              <span>+ Create Category</span>
            </button>
          )}

          <a
            href={sitemapUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 py-1.5 px-3 bg-[#A77C3A]/20 hover:bg-[#A77C3A]/30 border border-[#A77C3A]/50 text-[#E5C388] hover:text-white text-[11px] font-mono uppercase tracking-wider rounded-[2px] transition-colors"
            title="View Google Search Console Sitemap XML"
          >
            <TechnicalIcon name="search" className="w-3.5 h-3.5 text-[#A77C3A]" />
            <span>SITEMAP.XML</span>
          </a>

          <a
            href={clientUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 py-1.5 px-3 bg-white/5 hover:bg-white/10 border border-white/20 text-white text-[11px] font-mono uppercase tracking-wider rounded-[2px] transition-colors"
          >
            <TechnicalIcon name="external-link" className="w-3.5 h-3.5 text-[#A77C3A]" />
            <span>OPEN CLIENT SITE</span>
          </a>

          <Button
            variant="secondary"
            size="sm"
            onClick={onExportJson}
            className="border-white/20 font-mono text-[11px]"
          >
            <TechnicalIcon name="download" className="w-3.5 h-3.5 mr-1.5 text-[#A77C3A]" />
            EXPORT JSON
          </Button>

          {onLogout && (
            <button
              type="button"
              onClick={onLogout}
              className="inline-flex items-center gap-1.5 py-1.5 px-3 bg-red-950/40 hover:bg-red-900/70 border border-red-500/40 hover:border-red-400 text-red-200 hover:text-white text-[11px] font-mono font-bold uppercase tracking-wider rounded-[2px] transition-colors cursor-pointer shadow-xs"
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

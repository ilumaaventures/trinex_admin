import { TechnicalIcon } from "../ui/TechnicalIcon";
import { Button } from "../ui/Button";

export function AdminHeader({ onExportJson, onOpenCreateCategory, clientUrl = "http://localhost:5173" }) {
  return (
    <header className="bg-[#071522] text-white border-b border-white/10 sticky top-0 z-40 shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex flex-wrap items-center justify-between gap-4">
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
            href="http://localhost:5000/sitemap.xml"
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
        </div>
      </div>
    </header>
  );
}

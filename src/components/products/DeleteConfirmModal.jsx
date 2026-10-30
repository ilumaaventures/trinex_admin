import { TechnicalIcon } from "../ui/TechnicalIcon";
import { Button } from "../ui/Button";

export function DeleteConfirmModal({ isOpen, product, onConfirm, onCancel }) {
  if (!isOpen || !product) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn"
      role="dialog"
      aria-modal="true"
    >
      <div className="bg-[#FAF9F6] border border-[#132333]/20 w-full max-w-md rounded-[3px] shadow-2xl overflow-hidden">
        {/* Header Strip */}
        <div className="bg-[#071522] text-white px-5 py-4 flex items-center justify-between border-b border-white/10">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-red-500/20 text-red-400 flex items-center justify-center">
              <TechnicalIcon name="alert-triangle" className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold tracking-wide uppercase">
                Confirm Product Removal
              </h3>
              <p className="text-[11px] text-white/50 font-mono">
                MIL-SPEC INVENTORY ACTION
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onCancel}
            className="text-white/60 hover:text-white transition-colors"
          >
            <TechnicalIcon name="x" className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4">
          <p className="text-sm text-[#132333] leading-relaxed">
            Are you sure you want to permanently delete part number:
          </p>

          <div className="p-3 bg-white border border-[#132333]/15 rounded-[2px] font-mono">
            <div className="text-xs text-[#A77C3A] font-bold">
              {product.partNumber}
            </div>
            <div className="text-xs text-[#68717A] truncate">
              {product.category} &bull; {product.description}
            </div>
          </div>

          <p className="text-xs text-[#68717A] leading-relaxed">
            This action will delete the item and its SEO configuration from the catalog database.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="bg-[#FAF9F6] px-6 py-4 border-t border-[#132333]/10 flex items-center justify-end gap-3">
          <Button variant="outline" onClick={onCancel}>
            CANCEL
          </Button>
          <Button variant="danger" onClick={() => onConfirm(product.id)}>
            <TechnicalIcon name="trash" className="w-4 h-4 mr-1.5" />
            CONFIRM DELETE
          </Button>
        </div>
      </div>
    </div>
  );
}

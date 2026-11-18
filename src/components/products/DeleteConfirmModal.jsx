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
      <div className="bg-white border border-[#E5EAE4] w-full max-w-md rounded-[3px] shadow-2xl overflow-hidden">
        {/* Header Strip */}
        <div className="bg-[#315C3C] text-white px-5 py-4 flex items-center justify-between border-b border-white/10">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-red-500/20 text-red-400 flex items-center justify-center">
              <TechnicalIcon name="alert-triangle" className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-heading font-bold tracking-wide uppercase">
                Confirm Product Removal
              </h3>
              <p className="text-[11px] text-white/70 font-sans">
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
          <p className="text-sm text-[#202B25] leading-relaxed">
            Are you sure you want to permanently delete part number:
          </p>

          <div className="p-3 bg-white border border-[#E5EAE4] rounded-[2px]">
            <div className="text-xs font-heading font-bold text-[#527C50]">
              {product.partNumber}
            </div>
            <div className="text-xs font-sans text-[#68736B] truncate mt-0.5">
              {product.category} &bull; {product.description}
            </div>
          </div>

          <p className="text-xs text-[#68736B] leading-relaxed">
            This action will delete the item and its SEO configuration from the catalog database.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="bg-[#F6F8F5] px-6 py-4 border-t border-[#E5EAE4] flex items-center justify-end gap-3">
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

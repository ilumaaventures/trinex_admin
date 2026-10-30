import { useMemo } from "react";
import { TechnicalIcon } from "../ui/TechnicalIcon";

export function ProductCardGrid({ products, categories = [], onEdit, onDelete, onToggleVisibility }) {
  const categoryMap = useMemo(() => {
    const map = new Map();
    (categories || []).forEach((c) => {
      if (c.id) {
        const id = String(c.id).toLowerCase();
        map.set(id, c);
        map.set(id.replace(/s$/, ""), c);
      }
      if (c.name) {
        const n = String(c.name).toLowerCase();
        map.set(n, c);
        map.set(n.replace(/s$/, ""), c);
      }
    });
    return map;
  }, [categories]);

  if (products.length === 0) {
    return (
      <div className="p-12 text-center bg-white border border-[#132333]/10 rounded-[3px] space-y-2">
        <TechnicalIcon name="search" className="w-8 h-8 text-gray-400 mx-auto" />
        <h3 className="text-sm font-bold uppercase tracking-wider text-[#071522]">
          No Products Found
        </h3>
        <p className="text-xs text-[#68717A]">
          Try clearing search filters or add a new product.
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-4">
      {products.map((product) => {
        const productId = product.id || product._id;
        const pKey = String(product.categoryKey || "").toLowerCase();
        const pCat = String(product.category || "").toLowerCase();
        const parentCat = categoryMap.get(pKey) || categoryMap.get(pCat);
        const isCategoryHidden = Boolean(parentCat?.isHidden);
        const isSelfHidden = Boolean(product.isHidden);
        const isEffectivelyHidden = isSelfHidden || isCategoryHidden;

        return (
          <div
            key={productId}
            className={`bg-white border rounded-[3px] p-4 flex flex-col justify-between shadow-sm hover:shadow-md transition-shadow group ${
              isEffectivelyHidden ? "border-amber-300 bg-amber-50/20" : "border-[#132333]/15"
            }`}
          >
            <div>
              <div className="h-36 bg-[#071522]/5 rounded-[2px] overflow-hidden mb-3 border border-[#132333]/10 flex items-center justify-center relative">
                {product.image ? (
                  <img
                    src={product.image}
                    alt={product.partNumber}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                ) : (
                  <TechnicalIcon name="box" className="w-8 h-8 text-gray-400" />
                )}

                {/* Status Badge */}
                <div className="absolute top-2 left-2">
                  {isSelfHidden ? (
                    <span className="text-[9px] font-mono font-bold px-1.5 py-0.5 bg-amber-500 text-white rounded-[2px] shadow-xs flex items-center gap-1" title="Individually hidden">
                      <TechnicalIcon name="eye-off" className="w-2.5 h-2.5" />
                      <span>HIDDEN</span>
                    </span>
                  ) : isCategoryHidden ? (
                    <span className="text-[9px] font-mono font-bold px-1.5 py-0.5 bg-amber-600 text-white rounded-[2px] shadow-xs flex items-center gap-1" title={`Category '${parentCat?.name}' is hidden on main website`}>
                      <TechnicalIcon name="eye-off" className="w-2.5 h-2.5" />
                      <span>HIDDEN (CATEGORY)</span>
                    </span>
                  ) : (
                    <span className="text-[9px] font-mono font-bold px-1.5 py-0.5 bg-emerald-600 text-white rounded-[2px] shadow-xs flex items-center gap-1">
                      <TechnicalIcon name="eye" className="w-2.5 h-2.5" />
                      <span>LIVE</span>
                    </span>
                  )}
                </div>
              </div>

              <div className="flex items-center justify-between mb-1">
                <span className="text-[10px] font-mono px-1.5 py-0.2 bg-[#A77C3A]/15 text-[#A77C3A] font-bold rounded-[2px]">
                  {product.category || product.categoryKey}
                </span>
                <span className="text-[11px] font-mono text-[#071522] font-bold">
                  Stock: {product.stock}
                </span>
              </div>

              <h4 className="text-xs font-mono font-bold text-[#071522] truncate">
                {product.partNumber}
              </h4>
              <p className="text-[11px] text-[#68717A] line-clamp-2 mt-1 leading-relaxed">
                {product.description}
              </p>
            </div>

            <div className="mt-4 pt-3 border-t border-[#132333]/10 flex items-center justify-between">
              {/* Hide / Unhide Toggle */}
              <button
                type="button"
                onClick={() => onToggleVisibility?.(productId, product.partNumber, isSelfHidden)}
                className={`text-[11px] font-bold uppercase inline-flex items-center gap-1 transition-all duration-150 ease-out active:scale-95 cursor-pointer select-none ${
                  isSelfHidden ? "text-emerald-700 hover:text-emerald-900" : "text-amber-700 hover:text-amber-900"
                }`}
                title={isSelfHidden ? "Unhide on main website" : "Hide from main website"}
              >
                <TechnicalIcon name={isSelfHidden ? "eye" : "eye-off"} className="w-3.5 h-3.5 transition-transform duration-150" />
                <span>{isSelfHidden ? "Unhide" : "Hide"}</span>
              </button>

              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => onEdit(product)}
                  className="px-2 py-1 bg-[#071522] text-[#A77C3A] hover:bg-[#0D1D2A] text-[11px] font-bold rounded-[2px] cursor-pointer"
                >
                  EDIT &amp; SEO
                </button>
                <button
                  type="button"
                  onClick={() => onDelete(product)}
                  className="p-1 text-gray-400 hover:text-red-600 cursor-pointer"
                >
                  <TechnicalIcon name="trash" className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

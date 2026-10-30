import { useMemo } from "react";
import { TechnicalIcon } from "../ui/TechnicalIcon";

export function ProductTable({ products, categories = [], onEdit, onDelete, onToggleVisibility }) {
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
    <div className="bg-white border border-[#132333]/15 rounded-[3px] shadow-sm overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-[#071522] text-white text-[11px] font-mono uppercase tracking-wider border-b border-white/10">
              <th className="py-3 px-4">Product / SKU</th>
              <th className="py-3 px-4">Image</th>
              <th className="py-3 px-4">Category</th>
              <th className="py-3 px-4">Website Visibility</th>
              <th className="py-3 px-4">Technical Details</th>
              <th className="py-3 px-4">Stock &amp; Location</th>
              <th className="py-3 px-4">SEO Health</th>
              <th className="py-3 px-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#132333]/10 text-xs">
            {products.map((product) => {
              const productId = product.id || product._id;
              const hasFullSeo =
                Boolean(product.metaTitle) &&
                Boolean(product.metaDescription) &&
                Boolean(product.slug);

              const pKey = String(product.categoryKey || "").toLowerCase();
              const pCat = String(product.category || "").toLowerCase();
              const parentCat = categoryMap.get(pKey) || categoryMap.get(pCat);
              const isCategoryHidden = Boolean(parentCat?.isHidden);
              const isSelfHidden = Boolean(product.isHidden);
              const isEffectivelyHidden = isSelfHidden || isCategoryHidden;

              return (
                <tr
                  key={productId}
                  className={`hover:bg-[#FAF9F6] transition-colors ${
                    isEffectivelyHidden ? "bg-amber-50/40" : ""
                  }`}
                >
                  {/* SKU */}
                  <td className="py-3.5 px-4 font-mono font-bold text-[#071522] whitespace-nowrap">
                    {product.partNumber}
                  </td>

                  {/* Image */}
                  <td className="py-3.5 px-4">
                    <div className="w-10 h-10 rounded-[2px] border border-[#132333]/15 overflow-hidden bg-gray-50 flex items-center justify-center flex-shrink-0 relative">
                      {product.image ? (
                        <img
                          src={product.image}
                          alt={product.partNumber}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <TechnicalIcon
                          name="box"
                          className="w-4 h-4 text-gray-400"
                        />
                      )}
                      {isEffectivelyHidden && (
                        <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                          <TechnicalIcon name="eye-off" className="w-3.5 h-3.5 text-amber-300" />
                        </div>
                      )}
                    </div>
                  </td>

                  {/* Category */}
                  <td className="py-3.5 px-4 whitespace-nowrap">
                    <span className="px-2 py-0.5 bg-[#FAF9F6] border border-[#132333]/15 text-[10px] font-mono uppercase font-semibold text-[#071522] rounded-[2px]">
                      {product.category || product.categoryKey}
                    </span>
                  </td>

                  {/* Website Visibility */}
                  <td className="py-3.5 px-4 whitespace-nowrap">
                    {isSelfHidden ? (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-amber-100 text-amber-900 border border-amber-300 text-[10px] font-mono font-bold rounded-[2px]" title="This product is individually hidden from the website">
                        <TechnicalIcon name="eye-off" className="w-2.5 h-2.5 text-amber-700" />
                        <span>HIDDEN</span>
                      </span>
                    ) : isCategoryHidden ? (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-amber-100 text-amber-900 border border-amber-300 text-[10px] font-mono font-bold rounded-[2px]" title={`Parent category '${parentCat?.name}' is hidden on main website`}>
                        <TechnicalIcon name="eye-off" className="w-2.5 h-2.5 text-amber-700" />
                        <span>HIDDEN (CATEGORY)</span>
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-emerald-100 text-emerald-900 border border-emerald-300 text-[10px] font-mono font-bold rounded-[2px]">
                        <TechnicalIcon name="eye" className="w-2.5 h-2.5 text-emerald-700" />
                        <span>LIVE</span>
                      </span>
                    )}
                  </td>

                  {/* Description */}
                  <td className="py-3.5 px-4 max-w-md xl:max-w-xl text-[#68717A] line-clamp-2 leading-relaxed">
                    {product.description}
                  </td>

                  {/* Stock & Location */}
                  <td className="py-3.5 px-4 whitespace-nowrap">
                    <div className="font-mono font-bold text-[#071522]">
                      {product.stock}{" "}
                      <span className="text-[10px] font-normal text-[#68717A]">
                        units
                      </span>
                    </div>
                    <div className="text-[11px] text-[#A77C3A] font-semibold">
                      {product.location}
                    </div>
                  </td>

                  {/* SEO Badge */}
                  <td className="py-3.5 px-4 whitespace-nowrap">
                    {hasFullSeo ? (
                      <span className="inline-flex items-center gap-1.5 px-2 py-0.5 bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] font-mono rounded-[2px]">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                        OPTIMIZED
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 px-2 py-0.5 bg-amber-50 text-amber-700 border border-amber-200 text-[10px] font-mono rounded-[2px]">
                        <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                        AUTO DEFAULT
                      </span>
                    )}
                  </td>

                  {/* Actions */}
                  <td className="py-3.5 px-4 text-right whitespace-nowrap">
                    <div className="flex items-center justify-end gap-1.5">
                      {/* Hide/Unhide Toggle Button */}
                      <button
                        type="button"
                        onClick={() => onToggleVisibility?.(productId, product.partNumber, isSelfHidden)}
                        className={`px-2 py-1 text-[11px] font-bold rounded-[2px] transition-all duration-150 ease-out active:scale-95 cursor-pointer flex items-center gap-1 select-none ${
                          isSelfHidden
                            ? "bg-emerald-600 hover:bg-emerald-700 text-white shadow-2xs"
                            : "bg-amber-100 hover:bg-amber-200 text-amber-900 border border-amber-300"
                        }`}
                        title={isSelfHidden ? "Unhide on main website" : "Hide from main website"}
                      >
                        <TechnicalIcon name={isSelfHidden ? "eye" : "eye-off"} className="w-3 h-3 transition-transform duration-150" />
                        <span>{isSelfHidden ? "Unhide" : "Hide"}</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => onEdit(product)}
                        className="px-2.5 py-1 bg-[#071522] hover:bg-[#0D1D2A] text-[#A77C3A] text-xs font-bold rounded-[2px] transition-colors cursor-pointer"
                        title="Edit product & SEO"
                      >
                        EDIT &amp; SEO
                      </button>
                      <button
                        type="button"
                        onClick={() => onDelete(product)}
                        className="p-1 text-gray-400 hover:text-red-600 transition-colors cursor-pointer"
                        title="Delete product"
                      >
                        <TechnicalIcon name="trash" className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      <div className="bg-[#FAF9F6] border-t border-[#132333]/10 px-4 py-2.5 flex items-center justify-between text-xs text-[#68717A] font-mono">
        <span>Showing {products.length} products registered</span>
        <span>admin.trinexsystems.com Subdomain Engine</span>
      </div>
    </div>
  );
}

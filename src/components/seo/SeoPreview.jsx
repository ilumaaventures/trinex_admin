export function SeoPreview({
  metaTitle,
  metaDescription,
  slug,
  canonicalUrl,
  ogTitle,
  ogDescription,
  ogImage,
  partNumber,
  category,
  stock,
}) {
  const displayTitle =
    metaTitle || `${partNumber || "Component"} - ${category || "Defence"} | Trinex Systems LLP`;
  const displayUrl =
    canonicalUrl ||
    `https://trinexsystems.com/products/${slug || "component"}`;
  const displayDesc =
    metaDescription ||
    "Precision defence and aerospace component. Available with immediate dispatch and mil-spec standard compliance from Trinex Systems LLP.";

  return (
    <div className="space-y-6">
      {/* 1. Google Search Result Preview */}
      <div className="p-4 rounded-[3px] bg-white border border-[#132333]/15 shadow-sm">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#34A853]" />
            <span className="text-[11px] font-mono uppercase tracking-wider text-[#68717A] font-semibold">
              Google Search Result (SERP) Preview
            </span>
          </div>
          <span className="text-[10px] font-mono px-2 py-0.5 bg-[#FAF9F6] border border-[#132333]/10 text-[#68717A] rounded-[2px]">
            Desktop &amp; Mobile
          </span>
        </div>

        <div className="font-sans max-w-xl space-y-1">
          {/* Breadcrumb URL */}
          <div className="flex items-center gap-1.5 text-xs text-[#202124]">
            <span className="w-4 h-4 rounded-full bg-[#071522] flex items-center justify-center text-[9px] text-[#A77C3A] font-bold">
              T
            </span>
            <span className="text-[12px] text-[#202124] truncate">
              trinexsystems.com &rsaquo; products &rsaquo; {slug || "part"}
            </span>
          </div>

          {/* Title */}
          <h4 className="text-[18px] text-[#1a0dab] hover:underline cursor-pointer font-normal leading-snug line-clamp-1">
            {displayTitle}
          </h4>

          {/* Description snippet */}
          <p className="text-[13px] text-[#4d5156] leading-relaxed line-clamp-2">
            <span className="text-[#70757a] text-[12px] mr-1">
              {new Date().toLocaleDateString("en-US", {
                month: "short",
                day: "numeric",
                year: "numeric",
              })} —{" "}
            </span>
            {displayDesc}
          </p>

          {/* Rich Snippets */}
          <div className="pt-1.5 flex flex-wrap gap-2 text-[11px] text-[#5f6368] font-mono">
            <span className="px-1.5 py-0.5 bg-[#F1F3F4] rounded-[2px]">
              Part: {partNumber || "N/A"}
            </span>
            <span className="px-1.5 py-0.5 bg-[#F1F3F4] rounded-[2px]">
              Category: {category || "Defence Electronics"}
            </span>
            <span className="px-1.5 py-0.5 bg-[#E6F4EA] text-[#137333] font-semibold rounded-[2px]">
              Stock: {stock > 0 ? `${stock} Available` : "On Request"}
            </span>
          </div>
        </div>
      </div>

      {/* 2. Open Graph Card Preview */}
      <div className="p-4 rounded-[3px] bg-white border border-[#132333]/15 shadow-sm">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#1877F2]" />
            <span className="text-[11px] font-mono uppercase tracking-wider text-[#68717A] font-semibold">
              Open Graph (LinkedIn / Social Media) Card
            </span>
          </div>
          <span className="text-[10px] font-mono text-[#68717A]">og:type: product</span>
        </div>

        <div className="max-w-md border border-gray-200 rounded-[4px] overflow-hidden bg-gray-50">
          <div className="h-40 bg-gray-200 relative overflow-hidden flex items-center justify-center">
            {ogImage ? (
              <img
                src={ogImage}
                alt={ogTitle || displayTitle}
                className="w-full h-full object-cover"
              />
            ) : (
              <span className="text-xs text-gray-400 font-mono">No Social Image</span>
            )}
            <span className="absolute bottom-2 left-2 bg-[#071522]/90 text-[#A77C3A] font-mono text-[9px] px-2 py-0.5 uppercase tracking-wider rounded-[2px]">
              TRINEX SYSTEMS
            </span>
          </div>

          <div className="p-3 bg-white space-y-1">
            <span className="text-[10px] uppercase font-mono tracking-wider text-gray-500 block truncate">
              {displayUrl.replace(/^https?:\/\//, "")}
            </span>
            <h5 className="text-[13px] font-semibold text-[#071522] line-clamp-1">
              {ogTitle || displayTitle}
            </h5>
            <p className="text-[11px] text-gray-600 line-clamp-2 leading-relaxed">
              {ogDescription || displayDesc}
            </p>
          </div>
        </div>
      </div>

      {/* 3. Schema.org JSON-LD Output */}
      <div className="p-4 rounded-[3px] bg-[#071522] text-[#FAF9F6] border border-white/10 font-mono text-xs">
        <div className="flex items-center justify-between mb-2">
          <span className="text-[11px] uppercase tracking-wider text-[#A77C3A] font-semibold">
            Schema.org JSON-LD (Search Rich Results)
          </span>
          <span className="text-[10px] text-white/50">schema.org/Product</span>
        </div>
        <pre className="overflow-x-auto text-[11px] text-white/80 p-2 bg-[#0D1D2A] rounded-[2px] leading-relaxed">
          {JSON.stringify(
            {
              "@context": "https://schema.org/",
              "@type": "Product",
              name: displayTitle,
              image: ogImage || [displayUrl + "/image.jpg"],
              description: displayDesc,
              sku: partNumber || "N/A",
              mpn: partNumber || "N/A",
              brand: {
                "@type": "Brand",
                name: "Trinex Systems LLP",
              },
              offers: {
                "@type": "Offer",
                url: displayUrl,
                priceCurrency: "INR",
                availability:
                  stock > 0
                    ? "https://schema.org/InStock"
                    : "https://schema.org/PreOrder",
                itemCondition: "https://schema.org/NewCondition",
              },
            },
            null,
            2
          )}
        </pre>
      </div>
    </div>
  );
}

export function slugify(text) {
  return String(text || "")
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_-]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function buildDefaultSeo(product) {
  const pn = (product.partNumber || "Component").trim();
  const cat = (product.category || "Defence Electronics").trim();
  const desc = (product.description || "Precision defence and aerospace component.").trim();
  const compliance = (product.compliance || "").trim();
  const complianceSuffix = compliance && compliance !== "Standard" ? ` (${compliance})` : "";
  const cleanSlug = product.slug ? slugify(product.slug) : slugify(`${pn}-${cat}`);

  return {
    metaTitle: product.metaTitle?.trim() || `${pn} - ${cat}${complianceSuffix} | Trinex Systems LLP`,
    metaDescription:
      product.metaDescription?.trim() ||
      `${pn} ${cat}${complianceSuffix}. ${desc.slice(0, 100)}. In stock with immediate dispatch from Trinex Systems LLP.`,
    metaKeywords:
      product.metaKeywords?.trim() ||
      `${pn}, ${cat}, ${compliance}, defence electronics, aerospace grade, mil-spec, Make in India, indigenous systems`,
    slug: cleanSlug,
    canonicalUrl:
      product.canonicalUrl?.trim() ||
      `https://trinexsystems.com/products/${cleanSlug}`,
    robots: product.robots || "index, follow",
    ogTitle: product.ogTitle?.trim() || product.metaTitle?.trim() || `${pn} (${cat}) - Trinex Systems`,
    ogDescription:
      product.ogDescription?.trim() ||
      product.metaDescription?.trim() ||
      desc.slice(0, 150),
    ogImage: product.ogImage || product.image || "/assets/products/transformers_chokes.jpg",
  };
}

export function computeSeoScore(product) {
  const checks = {
    hasTitle: Boolean(product.metaTitle && product.metaTitle.length >= 30 && product.metaTitle.length <= 65),
    hasDescription: Boolean(product.metaDescription && product.metaDescription.length >= 100 && product.metaDescription.length <= 165),
    hasSlug: Boolean(product.slug && product.slug.length >= 3),
    hasKeywords: Boolean(product.metaKeywords && product.metaKeywords.includes(",")),
    hasImage: Boolean(product.image || product.ogImage),
  };

  const scoreValues = Object.values(checks);
  const score = Math.round((scoreValues.filter(Boolean).length / scoreValues.length) * 100);

  return {
    score,
    checks,
    status: score >= 80 ? "EXCELLENT" : score >= 60 ? "GOOD" : "NEEDS_OPTIMIZATION",
  };
}

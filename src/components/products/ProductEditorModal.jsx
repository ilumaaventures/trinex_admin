import { useState, useEffect, useRef } from "react";
import { TechnicalIcon } from "../ui/TechnicalIcon";
import { Button } from "../ui/Button";
import { CATEGORIES, api } from "../../services/api";
import { slugify } from "../../services/seoService";

const PRESET_IMAGES = [
  { label: "Transformers & Chokes", path: "/assets/products/transformers_chokes.jpg" },
  { label: "Resistors", path: "/assets/products/resistors.jpg" },
  { label: "Capacitors", path: "/assets/products/capacitors.jpg" },
  { label: "Microcircuits & ICs", path: "/assets/products/microcircuits.jpg" },
  { label: "Diodes & Transistors", path: "/assets/products/diodes_transistors.jpg" },
  { label: "Connectors", path: "/assets/products/connectors.jpg" },
  { label: "Motors & Servos", path: "/assets/products/motors_generators.jpg" },
  { label: "Switches & Fuses", path: "/assets/products/switches_fuses.jpg" },
];

function getInitialFormData(product, categoryList = []) {
  if (product) {
    const pn = product.partNumber || "";
    let catKey = product.categoryKey || "";
    let cat = product.category || "";
    if (catKey && !cat && categoryList.length > 0) {
      const match = categoryList.find((c) => (c.id || c.key) === catKey);
      if (match) cat = match.name;
    }
    return {
      id: product.id || product._id,
      partNumber: pn,
      category: cat,
      categoryKey: catKey,
      description: product.description || "",
      stock: product.stock ?? 10,
      location: product.location || "Ready Stock (Delhi)",
      delivery: product.delivery || "Immediate Dispatch",
      compliance: product.compliance || "MIL-STD-883 / ISO 9001",
      image: product.image || "/assets/products/transformers_chokes.jpg",
      metaTitle: product.metaTitle || "",
      metaDescription: product.metaDescription || "",
      metaKeywords: product.metaKeywords || "",
      slug: product.slug || "",
      canonicalUrl: product.canonicalUrl || "",
      robots: product.robots || "index, follow",
      ogTitle: product.ogTitle || "",
      ogDescription: product.ogDescription || "",
      ogImage: product.ogImage || "",
    };
  }

  return {
    partNumber: "",
    category: "",
    categoryKey: "",
    description: "",
    stock: 10,
    location: "Ready Stock (Delhi)",
    delivery: "Immediate Dispatch",
    compliance: "MIL-STD-883 / ISO 9001",
    image: "/assets/products/transformers_chokes.jpg",
    metaTitle: "",
    metaDescription: "",
    metaKeywords: "",
    slug: "",
    canonicalUrl: "",
    robots: "index, follow",
    ogTitle: "",
    ogDescription: "",
    ogImage: "",
  };
}

export function ProductEditorModal({
  isOpen,
  product,
  categories = [],
  onSave,
  onClose,
  onOpenCreateCategory,
}) {
  const [activeTab, setActiveTab] = useState("basic");
  const [errors, setErrors] = useState({});
  const [isUploading, setIsUploading] = useState(false);

  const categoryList = categories && categories.length > 0 ? categories : CATEGORIES;
  const [formData, setFormData] = useState(() => getInitialFormData(product, categoryList));

  // Automatically select newly created category if none was selected
  const prevCategoriesLengthRef = useRef(categoryList.length);
  useEffect(() => {
    if (categoryList.length > prevCategoriesLengthRef.current && !formData.categoryKey) {
      const newestCategory = categoryList[categoryList.length - 1];
      if (newestCategory) {
        queueMicrotask(() => {
          setFormData((prev) => ({
            ...prev,
            categoryKey: newestCategory.id || newestCategory.key,
            category: newestCategory.name,
          }));
          setErrors((prev) => {
            const next = { ...prev };
            delete next.categoryKey;
            return next;
          });
        });
      }
    }
    prevCategoriesLengthRef.current = categoryList.length;
  }, [categoryList, formData.categoryKey]);

  if (!isOpen) return null;

  const handleChange = (e) => {
    const { name, value, type } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "number" ? (value === "" ? "" : Number(value)) : value,
    }));
    if (errors[name]) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next[name];
        return next;
      });
    }
  };

  const handleCategoryChange = (e) => {
    const selectedKey = e.target.value;
    const cat = categoryList.find((c) => (c.id || c.key) === selectedKey);
    setFormData((prev) => ({
      ...prev,
      categoryKey: selectedKey,
      category: cat ? cat.name : (selectedKey ? selectedKey.toUpperCase() : ""),
    }));
    if (errors.categoryKey) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next.categoryKey;
        return next;
      });
    }
  };

  // Image Upload Handler
  const handleImageUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      alert("File exceeds 5MB size limit.");
      return;
    }

    setIsUploading(true);
    try {
      const url = await api.uploadImage(file);
      setFormData((prev) => ({
        ...prev,
        image: url,
        ogImage: prev.ogImage || url,
      }));
    } catch (err) {
      console.error("Upload error:", err);
      alert("Failed to upload image.");
    } finally {
      setIsUploading(false);
    }
  };

  // Auto-fill SEO metadata
  const handleAutoFillSeo = () => {
    const pn = formData.partNumber || "Component";
    const cat = formData.category || "Defence Electronics";
    const desc = formData.description || "Mil-Spec precision defence component.";
    const compliance = (formData.compliance || "").trim();
    const complianceSuffix = compliance && compliance !== "Standard" ? ` (${compliance})` : "";
    const cleanSlug = slugify(`${pn}-${cat}`);

    setFormData((prev) => ({
      ...prev,
      slug: cleanSlug,
      metaTitle: `${pn} - ${cat}${complianceSuffix} | Trinex Systems LLP`,
      metaDescription: `${pn} ${cat}${complianceSuffix}. ${desc.slice(0, 100)}. In stock with immediate dispatch from Trinex Systems LLP.`,
      metaKeywords: `${pn}, ${cat}, ${compliance}, defence components, mil-spec, India defence electronics, aerospace parts, Make in India`,
      canonicalUrl: `https://trinexsystems.com/products/${cleanSlug}`,
      ogTitle: `${pn} (${cat}) - Trinex Systems Defence Stock`,
      ogDescription: desc.slice(0, 150),
      ogImage: prev.image,
    }));
  };

  const validate = () => {
    const errs = {};
    if (!formData.partNumber.trim()) errs.partNumber = "Part Number (SKU) is required";
    if (!formData.categoryKey || !formData.categoryKey.trim()) {
      errs.categoryKey = "Product category is required (mandatory field)";
    }
    if (!formData.description.trim()) errs.description = "Technical description is required";
    return errs;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      setActiveTab("basic");
      return;
    }

    const pn = formData.partNumber.trim();
    const cat = formData.category.trim();
    const compliance = (formData.compliance || "").trim();
    const complianceSuffix = compliance && compliance !== "Standard" ? ` (${compliance})` : "";
    const cleanSlug = formData.slug.trim() || slugify(`${pn}-${cat}`);

    const finalProduct = {
      ...formData,
      category: cat,
      categoryKey: formData.categoryKey.trim(),
      slug: cleanSlug,
      metaTitle:
        formData.metaTitle.trim() || `${pn} - ${cat}${complianceSuffix} | Trinex Systems LLP`,
      metaDescription:
        formData.metaDescription.trim() ||
        `${pn} ${cat}${complianceSuffix}. ${formData.description.slice(0, 100)}. In stock with immediate dispatch from Trinex Systems LLP.`,
      canonicalUrl:
        formData.canonicalUrl.trim() ||
        `https://trinexsystems.com/products/${cleanSlug}`,
      ogTitle: formData.ogTitle.trim() || formData.metaTitle.trim() || `${pn} (${cat}) - Trinex Systems`,
      ogDescription:
        formData.ogDescription.trim() ||
        formData.metaDescription.trim() ||
        formData.description.slice(0, 150),
      ogImage: formData.ogImage || formData.image,
    };

    onSave(finalProduct);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/80 backdrop-blur-sm animate-fadeIn overflow-y-auto"
      role="dialog"
      aria-modal="true"
    >
      <div className="bg-[#FAF9F6] border border-[#132333]/20 w-full max-w-5xl max-h-[92vh] flex flex-col rounded-[3px] shadow-2xl overflow-hidden my-auto">
        {/* Header */}
        <div className="bg-[#071522] text-white px-6 py-4 flex items-center justify-between border-b border-white/10 flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-[2px] bg-[#A77C3A]/20 border border-[#A77C3A]/40 flex items-center justify-center text-[#A77C3A]">
              <TechnicalIcon name="cpu" className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold tracking-wide uppercase">
                {product?.id ? "Edit Product & SEO Metadata" : "Add New Product with SEO Suite"}
              </h2>
              <p className="text-[11px] text-white/50 font-mono">
                SUBDOMAIN ENGINE &bull; admin.trinexsystems.com
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-white/60 hover:text-white transition-colors"
          >
            <TechnicalIcon name="x" className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="bg-white border-b border-[#132333]/10 px-6 flex items-center gap-1 sm:gap-4 overflow-x-auto flex-shrink-0">
          <button
            type="button"
            onClick={() => setActiveTab("basic")}
            className={`py-3 px-3 text-xs font-bold uppercase tracking-wider border-b-2 transition-colors whitespace-nowrap flex items-center gap-2 ${
              activeTab === "basic"
                ? "border-[#A77C3A] text-[#071522]"
                : "border-transparent text-[#68717A] hover:text-[#071522]"
            }`}
          >
            <TechnicalIcon name="layers" className="w-3.5 h-3.5" />
            <span>1. Product Details</span>
            {(errors.partNumber || errors.categoryKey || errors.description) && (
              <span className="w-2 h-2 rounded-full bg-red-500" />
            )}
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("image")}
            className={`py-3 px-3 text-xs font-bold uppercase tracking-wider border-b-2 transition-colors whitespace-nowrap flex items-center gap-2 ${
              activeTab === "image"
                ? "border-[#A77C3A] text-[#071522]"
                : "border-transparent text-[#68717A] hover:text-[#071522]"
            }`}
          >
            <TechnicalIcon name="box" className="w-3.5 h-3.5" />
            <span>2. Image Asset</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("seo")}
            className={`py-3 px-3 text-xs font-bold uppercase tracking-wider border-b-2 transition-colors whitespace-nowrap flex items-center gap-2 ${
              activeTab === "seo"
                ? "border-[#A77C3A] text-[#071522]"
                : "border-transparent text-[#68717A] hover:text-[#071522]"
            }`}
          >
            <TechnicalIcon name="search" className="w-3.5 h-3.5" />
            <span>3. SEO &amp; Meta Suite</span>
            <span className="text-[10px] px-1.5 py-0.2 bg-[#A77C3A]/20 text-[#A77C3A] rounded font-mono">
              REQUIRED
            </span>
          </button>
        </div>

        {/* Tab Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* TAB 1: BASIC COMPONENT SPECS */}
          {activeTab === "basic" && (
            <div className="space-y-5">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-[#071522] mb-1.5">
                    Part Number / SKU <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="partNumber"
                    value={formData.partNumber}
                    onChange={handleChange}
                    placeholder="e.g. TPP-95-40-400 or 2N2222A"
                    className={`w-full px-3.5 py-2.5 text-xs font-mono bg-white border ${
                      errors.partNumber ? "border-red-500" : "border-[#132333]/20"
                    } rounded-[2px] focus:outline-none focus:ring-1 focus:ring-[#A77C3A]`}
                  />
                  {errors.partNumber && (
                    <p className="text-[11px] text-red-500 mt-1 font-mono">
                      {errors.partNumber}
                    </p>
                  )}
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="block text-xs font-bold uppercase tracking-wider text-[#071522]">
                      Product Category <span className="text-red-500">*</span>
                    </label>
                    {onOpenCreateCategory && (
                      <button
                        type="button"
                        onClick={onOpenCreateCategory}
                        className="text-[11px] font-mono text-[#A77C3A] hover:underline font-bold flex items-center gap-1 cursor-pointer"
                      >
                        <TechnicalIcon name="plus" className="w-3 h-3" />
                        <span>Create Category</span>
                      </button>
                    )}
                  </div>
                  <select
                    name="categoryKey"
                    value={formData.categoryKey}
                    onChange={handleCategoryChange}
                    className={`w-full px-3.5 py-2.5 text-xs bg-white border ${
                      errors.categoryKey ? "border-red-500" : "border-[#132333]/20"
                    } rounded-[2px] focus:outline-none focus:ring-1 focus:ring-[#A77C3A]`}
                  >
                    <option value="">-- Select Category (Mandatory) --</option>
                    {categoryList.map((c) => (
                      <option key={c.id || c.key} value={c.id || c.key}>
                        {c.name} {c.subtitle ? `(${c.subtitle})` : ""}
                      </option>
                    ))}
                  </select>
                  {errors.categoryKey && (
                    <p className="text-[11px] text-red-500 mt-1 font-mono">
                      {errors.categoryKey}
                    </p>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[#071522] mb-1.5">
                  Technical Specification / Description <span className="text-red-500">*</span>
                </label>
                <textarea
                  name="description"
                  rows={3}
                  value={formData.description}
                  onChange={handleChange}
                  placeholder="Comprehensive technical details, tolerance, voltage, pin configuration, aerospace specs..."
                  className={`w-full px-3.5 py-2.5 text-xs bg-white border ${
                    errors.description ? "border-red-500" : "border-[#132333]/20"
                  } rounded-[2px] focus:outline-none focus:ring-1 focus:ring-[#A77C3A] leading-relaxed`}
                />
                {errors.description && (
                  <p className="text-[11px] text-red-500 mt-1 font-mono">
                    {errors.description}
                  </p>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-[#071522] mb-1.5">
                    Stock Quantity
                  </label>
                  <input
                    type="number"
                    name="stock"
                    min="0"
                    value={formData.stock}
                    onChange={handleChange}
                    className="w-full px-3 py-2 text-xs font-mono bg-white border border-[#132333]/20 rounded-[2px] focus:outline-none focus:ring-1 focus:ring-[#A77C3A]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-[#071522] mb-1.5">
                    Stock Location
                  </label>
                  <input
                    type="text"
                    name="location"
                    value={formData.location}
                    onChange={handleChange}
                    placeholder="e.g. Ready Stock (Delhi)"
                    className="w-full px-3 py-2 text-xs bg-white border border-[#132333]/20 rounded-[2px] focus:outline-none focus:ring-1 focus:ring-[#A77C3A]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-[#071522] mb-1.5">
                    Delivery Timeframe
                  </label>
                  <input
                    type="text"
                    name="delivery"
                    value={formData.delivery}
                    onChange={handleChange}
                    placeholder="e.g. Immediate Dispatch"
                    className="w-full px-3 py-2 text-xs bg-white border border-[#132333]/20 rounded-[2px] focus:outline-none focus:ring-1 focus:ring-[#A77C3A]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-[#071522] mb-1.5">
                    Mil-Spec Compliance
                  </label>
                  <input
                    type="text"
                    name="compliance"
                    value={formData.compliance}
                    onChange={handleChange}
                    placeholder="e.g. MIL-STD-883"
                    className="w-full px-3 py-2 text-xs bg-white border border-[#132333]/20 rounded-[2px] focus:outline-none focus:ring-1 focus:ring-[#A77C3A]"
                  />
                </div>
              </div>

              <div className="p-3.5 bg-[#FAF9F6] border border-[#A77C3A]/30 rounded-[2px] flex flex-col sm:flex-row items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <TechnicalIcon name="shield" className="w-4 h-4 text-[#A77C3A]" />
                  <span className="text-xs text-[#071522] font-semibold">
                    Quick Action: Auto-generate optimized SEO title, description &amp; tags
                  </span>
                </div>
                <button
                  type="button"
                  onClick={handleAutoFillSeo}
                  className="px-3 py-1.5 bg-[#A77C3A] hover:bg-[#C29A58] text-[#071522] text-xs font-bold uppercase tracking-wider rounded-[2px] transition-colors cursor-pointer"
                >
                  ⚡ Auto-Populate SEO Fields
                </button>
              </div>
            </div>
          )}

          {/* TAB 2: IMAGE ASSETS */}
          {activeTab === "image" && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-[#071522] mb-1.5">
                      Upload Product Photo
                    </label>
                    <label className="border-2 border-dashed border-[#132333]/20 hover:border-[#A77C3A] rounded-[3px] p-6 flex flex-col items-center justify-center cursor-pointer bg-white transition-colors group">
                      <TechnicalIcon
                        name="upload"
                        className="w-8 h-8 text-[#68717A] group-hover:text-[#A77C3A] transition-colors mb-2"
                      />
                      <span className="text-xs font-bold text-[#071522]">
                        {isUploading ? "Uploading to Server..." : "Click or drag image file here"}
                      </span>
                      <span className="text-[11px] text-[#68717A] mt-1">
                        PNG, JPG, WEBP up to 5MB
                      </span>
                      <input
                        type="file"
                        accept="image/*"
                        disabled={isUploading}
                        onChange={handleImageUpload}
                        className="hidden"
                      />
                    </label>
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-[#071522] mb-1.5">
                      Or Direct Image URL / Path
                    </label>
                    <input
                      type="text"
                      name="image"
                      value={formData.image}
                      onChange={handleChange}
                      placeholder="https://... or /assets/products/..."
                      className="w-full px-3 py-2 text-xs font-mono bg-white border border-[#132333]/20 rounded-[2px] focus:outline-none focus:ring-1 focus:ring-[#A77C3A]"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-[#071522] mb-1.5">
                    Image Live Preview
                  </label>
                  <div className="border border-[#132333]/15 rounded-[3px] overflow-hidden bg-white shadow-sm p-3">
                    <div className="h-52 bg-[#071522]/5 rounded-[2px] overflow-hidden flex items-center justify-center">
                      {formData.image ? (
                        <img
                          src={formData.image}
                          alt={formData.partNumber || "Product"}
                          className="w-full h-full object-contain"
                        />
                      ) : (
                        <span className="text-xs text-[#68717A] font-mono">
                          No Image Attached
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[#071522] mb-2">
                  Or Pick From High-Precision Pre-Packaged Defence Visuals
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                  {PRESET_IMAGES.map((preset) => (
                    <button
                      key={preset.path}
                      type="button"
                      onClick={() =>
                        setFormData((prev) => ({
                          ...prev,
                          image: preset.path,
                          ogImage: prev.ogImage || preset.path,
                        }))
                      }
                      className={`p-2 rounded-[2px] border text-left transition-all ${
                        formData.image === preset.path
                          ? "border-[#A77C3A] bg-[#A77C3A]/10"
                          : "border-[#132333]/10 bg-white hover:border-[#132333]/30"
                      }`}
                    >
                      <img
                        src={preset.path}
                        alt={preset.label}
                        className="w-full h-16 object-cover rounded-[1px] mb-1.5"
                      />
                      <span className="text-[10.5px] font-medium text-[#071522] block truncate">
                        {preset.label}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: SEO SUITE */}
          {activeTab === "seo" && (
            <div className="space-y-5">
              <div className="flex items-center justify-between border-b border-[#132333]/10 pb-3">
                <div>
                  <h3 className="text-sm font-bold text-[#071522] uppercase">
                    Search Engine Optimization (SEO) Metadata
                  </h3>
                  <p className="text-[11px] text-[#68717A]">
                    Target keywords, SERP meta tags, and OpenGraph social previews.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={handleAutoFillSeo}
                  className="px-3 py-1.5 bg-[#071522] hover:bg-[#0D1D2A] text-[#A77C3A] text-xs font-mono uppercase tracking-wider rounded-[2px] transition-colors cursor-pointer"
                >
                  ⚡ Auto-Generate
                </button>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-bold uppercase tracking-wider text-[#071522]">
                    SEO Meta Title (Title Tag)
                  </label>
                  <span
                    className={`text-[11px] font-mono ${
                      formData.metaTitle.length > 60
                        ? "text-amber-600 font-bold"
                        : "text-[#68717A]"
                    }`}
                  >
                    {formData.metaTitle.length}/60 chars (Recommended 50–60)
                  </span>
                </div>
                <input
                  type="text"
                  name="metaTitle"
                  value={formData.metaTitle}
                  onChange={handleChange}
                  placeholder="e.g. TPP-95-40-400 Precision Aerospace Transformer | Trinex Systems"
                  className="w-full px-3.5 py-2 text-xs bg-white border border-[#132333]/20 rounded-[2px] focus:outline-none focus:ring-1 focus:ring-[#A77C3A]"
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-bold uppercase tracking-wider text-[#071522]">
                    SEO Meta Description
                  </label>
                  <span
                    className={`text-[11px] font-mono ${
                      formData.metaDescription.length > 160
                        ? "text-amber-600 font-bold"
                        : "text-[#68717A]"
                    }`}
                  >
                    {formData.metaDescription.length}/160 chars (Recommended 140–160)
                  </span>
                </div>
                <textarea
                  name="metaDescription"
                  rows={2}
                  value={formData.metaDescription}
                  onChange={handleChange}
                  placeholder="e.g. Sourcing high-frequency 400Hz pulse coupling transformers with immediate dispatch from Trinex Systems LLP, Delhi..."
                  className="w-full px-3.5 py-2 text-xs bg-white border border-[#132333]/20 rounded-[2px] focus:outline-none focus:ring-1 focus:ring-[#A77C3A] leading-relaxed"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-[#071522] mb-1.5">
                    URL Slug (Permalinks)
                  </label>
                  <div className="flex">
                    <span className="inline-flex items-center px-2.5 bg-gray-100 border border-r-0 border-[#132333]/20 text-[11px] text-gray-500 font-mono rounded-l-[2px]">
                      /products/
                    </span>
                    <input
                      type="text"
                      name="slug"
                      value={formData.slug}
                      onChange={handleChange}
                      placeholder="tpp-95-aerospace-transformer"
                      className="w-full px-3 py-2 text-xs font-mono bg-white border border-[#132333]/20 rounded-r-[2px] focus:outline-none focus:ring-1 focus:ring-[#A77C3A]"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-[#071522] mb-1.5">
                    Robots Indexing Directive
                  </label>
                  <select
                    name="robots"
                    value={formData.robots}
                    onChange={handleChange}
                    className="w-full px-3 py-2 text-xs bg-white border border-[#132333]/20 rounded-[2px] focus:outline-none focus:ring-1 focus:ring-[#A77C3A]"
                  >
                    <option value="index, follow">index, follow (Default: Recommended)</option>
                    <option value="noindex, follow">noindex, follow (Hide from search)</option>
                    <option value="index, nofollow">index, nofollow (Index page, ignore links)</option>
                    <option value="noindex, nofollow">noindex, nofollow (Block completely)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[#071522] mb-1.5">
                  Meta Keywords (Comma separated)
                </label>
                <input
                  type="text"
                  name="metaKeywords"
                  value={formData.metaKeywords}
                  onChange={handleChange}
                  placeholder="mil-spec, transformers, 400Hz, aerospace, defence parts"
                  className="w-full px-3 py-2 text-xs bg-white border border-[#132333]/20 rounded-[2px] focus:outline-none focus:ring-1 focus:ring-[#A77C3A]"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2 border-t border-[#132333]/10">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-[#071522] mb-1.5">
                    Canonical URL Tag
                  </label>
                  <input
                    type="url"
                    name="canonicalUrl"
                    value={formData.canonicalUrl}
                    onChange={handleChange}
                    placeholder="https://trinexsystems.com/products/..."
                    className="w-full px-3 py-2 text-xs font-mono bg-white border border-[#132333]/20 rounded-[2px] focus:outline-none focus:ring-1 focus:ring-[#A77C3A]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-[#071522] mb-1.5">
                    Open Graph (og:image) URL
                  </label>
                  <input
                    type="text"
                    name="ogImage"
                    value={formData.ogImage}
                    onChange={handleChange}
                    placeholder="Defaults to Product Image"
                    className="w-full px-3 py-2 text-xs font-mono bg-white border border-[#132333]/20 rounded-[2px] focus:outline-none focus:ring-1 focus:ring-[#A77C3A]"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Modal Footer */}
          <div className="pt-4 border-t border-[#132333]/10 flex items-center justify-between gap-3">
            <div className="text-xs text-[#68717A] font-mono">
              Status: <span className="text-[#A77C3A] font-bold">READY TO PUBLISH</span>
            </div>
            <div className="flex items-center gap-3">
              <Button variant="outline" onClick={onClose}>
                CANCEL
              </Button>
              <Button variant="primary" type="submit">
                {product?.id ? "SAVE & UPDATE SEO" : "PUBLISH PRODUCT"}
              </Button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}

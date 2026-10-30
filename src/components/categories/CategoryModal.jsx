import { useState, useEffect } from "react";
import { TechnicalIcon } from "../ui/TechnicalIcon";
import { Button } from "../ui/Button";
import { api } from "../../services/api";
import { slugify } from "../../services/seoService";

const PRESET_CATEGORY_IMAGES = [
  { label: "Transformers", path: "/assets/products/transformers_chokes.jpg" },
  { label: "Resistors", path: "/assets/products/resistors.jpg" },
  { label: "Capacitors", path: "/assets/products/capacitors.jpg" },
  { label: "Microcircuits", path: "/assets/products/microcircuits.jpg" },
  { label: "Transistors", path: "/assets/products/diodes_transistors.jpg" },
  { label: "Connectors", path: "/assets/products/connectors.jpg" },
  { label: "Motors", path: "/assets/products/motors_generators.jpg" },
  { label: "Switches", path: "/assets/products/switches_fuses.jpg" },
];

export function CategoryModal({
  isOpen,
  categoryToEdit = null,
  categories = [],
  onCategoryCreated,
  onCategoryUpdated,
  onCategoryDeleted,
  onCategoryToggled,
  onClose,
}) {
  const isEditMode = Boolean(categoryToEdit);

  const [name, setName] = useState("");
  const [subtitle, setSubtitle] = useState("");
  const [description, setDescription] = useState("");
  const [image, setImage] = useState("/assets/products/transformers_chokes.jpg");
  const [customSlug, setCustomSlug] = useState("");
  const [isHidden, setIsHidden] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState("");

  // Sync state whenever modal opens or categoryToEdit changes
  useEffect(() => {
    if (!isOpen) return;

    if (categoryToEdit) {
      setName(categoryToEdit.name || "");
      setSubtitle(categoryToEdit.subtitle || "");
      setDescription(categoryToEdit.description || "");
      setImage(categoryToEdit.image || "/assets/products/transformers_chokes.jpg");
      setCustomSlug(categoryToEdit.id || "");
      setIsHidden(Boolean(categoryToEdit.isHidden));
      setError("");
    } else {
      setName("");
      setSubtitle("");
      setDescription("");
      setImage("/assets/products/transformers_chokes.jpg");
      setCustomSlug("");
      setIsHidden(false);
      setError("");
    }
  }, [isOpen, categoryToEdit]);

  if (!isOpen) return null;

  const currentSlug = customSlug.trim()
    ? slugify(customSlug)
    : isEditMode
    ? categoryToEdit?.id || slugify(name)
    : slugify(name);

  // Cloudinary image upload for category
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
      setImage(url);
    } catch (err) {
      console.error("Category image upload error:", err);
      alert("Failed to upload image.");
    } finally {
      setIsUploading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim()) {
      setError("Category Name is required");
      return;
    }

    setIsSubmitting(true);
    setError("");

    try {
      const payload = {
        name: name.trim().toUpperCase(),
        id: currentSlug || slugify(name),
        subtitle: subtitle.trim(),
        description: description.trim(),
        image: image.trim() || "/assets/products/transformers_chokes.jpg",
        isHidden: Boolean(isHidden),
      };

      if (isEditMode) {
        const targetId = categoryToEdit.id || categoryToEdit._id;
        const updated = await api.updateCategory(targetId, payload);
        onCategoryUpdated?.(updated || { ...categoryToEdit, ...payload });
      } else {
        const newCat = await api.createCategory(payload);
        onCategoryCreated?.(newCat);
      }
      onClose();
    } catch (err) {
      setError(err.message || (isEditMode ? "Failed to update category" : "Failed to create category"));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!categoryToEdit) return;
    const catName = categoryToEdit.name || name;
    const count = categoryToEdit.count ?? 0;
    const targetId = categoryToEdit.id || categoryToEdit._id;

    const msg =
      count > 0
        ? `WARNING: Category "${catName}" currently contains ${count} components.\n\nAre you sure you want to permanently delete this category?`
        : `Are you sure you want to permanently delete category "${catName}"?`;

    if (!window.confirm(msg)) return;

    setIsDeleting(true);
    try {
      await api.deleteCategory(targetId);
      onCategoryDeleted?.(targetId, catName);
      onClose();
    } catch (err) {
      setError(err.message || "Failed to delete category");
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center p-3 sm:p-6 bg-black/80 backdrop-blur-sm animate-fadeIn overflow-y-auto"
      role="dialog"
      aria-modal="true"
    >
      <div className="bg-[#FAF9F6] border border-[#132333]/20 w-full max-w-4xl max-h-[92vh] flex flex-col rounded-[3px] shadow-2xl overflow-hidden my-auto">
        {/* Header */}
        <div className="bg-[#071522] text-white px-6 py-4 flex items-center justify-between border-b border-white/10 flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-[2px] bg-[#A77C3A]/20 border border-[#A77C3A]/40 flex items-center justify-center text-[#A77C3A]">
              <TechnicalIcon name={isEditMode ? "edit" : "folder-plus"} className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold tracking-wide uppercase">
                  {isEditMode ? `Edit Category: ${categoryToEdit.name}` : "Create New Strategic Category"}
                </h2>
                {isEditMode && (
                  <span
                    className={`text-[9px] font-mono font-bold px-2 py-0.5 rounded ${
                      isHidden ? "bg-amber-500/20 text-amber-300 border border-amber-500/30" : "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
                    }`}
                  >
                    {isHidden ? "HIDDEN FROM SITE" : "LIVE ON SITE"}
                  </span>
                )}
              </div>
              <p className="text-[11px] text-white/50 font-mono">
                {isEditMode
                  ? "EDIT SPECIFICATIONS • BANNER ASSET • TOGGLE WEBSITE VISIBILITY • DELETE"
                  : "CREATE CATEGORIES • CLOUDINARY ASSETS • CONTROL MAIN WEBSITE VISIBILITY"}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-white/60 hover:text-white rounded-[2px] hover:bg-white/10 transition-colors cursor-pointer"
            aria-label="Close dialog"
          >
            <TechnicalIcon name="x" className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto flex-1 space-y-6">
          <form onSubmit={handleSubmit} className="bg-white p-5 border border-[#132333]/15 rounded-[3px] space-y-5 shadow-sm">
            <div className="flex items-center justify-between border-b border-[#132333]/10 pb-2">
              <h3 className="text-xs font-bold uppercase tracking-wider text-[#071522] flex items-center gap-2">
                <TechnicalIcon name={isEditMode ? "edit" : "plus"} className="w-3.5 h-3.5 text-[#A77C3A]" />
                <span>{isEditMode ? "Category Specifications & Controls" : "Category Details"}</span>
              </h3>
              {currentSlug && (
                <span className="text-[10px] font-mono text-[#132333]/60 bg-[#FAF9F6] px-2 py-0.5 rounded border border-[#132333]/10">
                  SYSTEM KEY: {currentSlug}
                </span>
              )}
            </div>

            {error && (
              <div className="p-2.5 text-xs text-red-700 bg-red-50 border border-red-200 rounded-[2px] flex items-center gap-2">
                <TechnicalIcon name="alert-triangle" className="w-4 h-4 flex-shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {/* Website Visibility Toggle Bar */}
            <div className="p-3.5 bg-[#FAF9F6] border border-[#132333]/15 rounded-[3px] flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-2xs">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold uppercase tracking-wider text-[#071522]">
                    Website Visibility Status:
                  </span>
                  {isHidden ? (
                    <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-amber-100 text-amber-900 border border-amber-300 inline-flex items-center gap-1">
                      <TechnicalIcon name="eye-off" className="w-3 h-3 text-amber-700" />
                      <span>HIDDEN FROM WEBSITE</span>
                    </span>
                  ) : (
                    <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-emerald-100 text-emerald-900 border border-emerald-300 inline-flex items-center gap-1">
                      <TechnicalIcon name="eye" className="w-3 h-3 text-emerald-700" />
                      <span>LIVE ON WEBSITE</span>
                    </span>
                  )}
                </div>
                <p className="text-[11px] text-[#132333]/60 mt-1">
                  {isHidden
                    ? "This category and all its products are hidden from public website visitors."
                    : "This category and its products are publicly visible on the main website."}
                </p>
              </div>

              <div className="flex items-center gap-2 flex-shrink-0">
                <button
                  type="button"
                  onClick={() => setIsHidden(false)}
                  className={`px-3 py-1.5 text-xs font-bold uppercase tracking-wider rounded-[2px] border transition-all duration-150 active:scale-95 select-none flex items-center gap-1.5 cursor-pointer ${
                    !isHidden
                      ? "bg-emerald-600 border-emerald-700 text-white shadow-xs"
                      : "bg-white border-[#132333]/20 text-[#132333]/70 hover:bg-emerald-50 hover:text-emerald-800"
                  }`}
                >
                  <TechnicalIcon name="eye" className="w-3.5 h-3.5" />
                  <span>Live (Visible)</span>
                </button>
                <button
                  type="button"
                  onClick={() => setIsHidden(true)}
                  className={`px-3 py-1.5 text-xs font-bold uppercase tracking-wider rounded-[2px] border transition-all duration-150 active:scale-95 select-none flex items-center gap-1.5 cursor-pointer ${
                    isHidden
                      ? "bg-amber-600 border-amber-700 text-white shadow-xs"
                      : "bg-white border-[#132333]/20 text-[#132333]/70 hover:bg-amber-50 hover:text-amber-800"
                  }`}
                >
                  <TechnicalIcon name="eye-off" className="w-3.5 h-3.5" />
                  <span>Hide from Site</span>
                </button>
              </div>
            </div>

            {/* Category Name & Subtitle */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[#132333]/80 mb-1">
                  Category Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. TRANSFORMERS, RESISTORS, RF & MICROWAVE"
                  className="w-full px-3 py-2 bg-[#FAF9F6] border border-[#132333]/20 text-xs font-semibold rounded-[2px] focus:outline-none focus:ring-1 focus:ring-[#A77C3A]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[#132333]/80 mb-1">
                  Subtitle / Specialization
                </label>
                <input
                  type="text"
                  value={subtitle}
                  onChange={(e) => setSubtitle(e.target.value)}
                  placeholder="e.g. High-Frequency Pulse Transformers & Chokes"
                  className="w-full px-3 py-2 bg-[#FAF9F6] border border-[#132333]/20 text-xs rounded-[2px] focus:outline-none focus:ring-1 focus:ring-[#A77C3A]"
                />
              </div>
            </div>

            {/* Custom Category Key & Description */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[#132333]/80 mb-1">
                  Category Key / Slug
                </label>
                <input
                  type="text"
                  value={customSlug}
                  onChange={(e) => setCustomSlug(e.target.value)}
                  placeholder={currentSlug || "Auto-generated from name"}
                  className="w-full px-3 py-2 bg-[#FAF9F6] border border-[#132333]/20 text-xs font-mono rounded-[2px] focus:outline-none focus:ring-1 focus:ring-[#A77C3A]"
                />
                <p className="text-[10px] text-[#132333]/50 mt-1 font-mono">
                  Used for product matching and URL deep-linking (e.g. #/products?category={currentSlug || "slug"})
                </p>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[#132333]/80 mb-1">
                  Description / Strategic Scope
                </label>
                <textarea
                  rows={2}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="High-reliability military-spec electronic assemblies for tactical applications."
                  className="w-full px-3 py-2 bg-[#FAF9F6] border border-[#132333]/20 text-xs rounded-[2px] focus:outline-none focus:ring-1 focus:ring-[#A77C3A] resize-none"
                />
              </div>
            </div>

            {/* Representative Image Asset */}
            <div className="space-y-3 border-t border-[#132333]/10 pt-4">
              <div className="flex items-center justify-between">
                <label className="block text-xs font-bold uppercase tracking-wider text-[#132333]/80">
                  Category Banner Image Asset
                </label>
                <span className="text-[10px] font-mono text-[#A77C3A]">
                  Upload custom asset, paste URL, or select preset
                </span>
              </div>

              <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
                {/* Image preview */}
                <div className="w-28 h-20 rounded-[3px] border border-[#132333]/20 overflow-hidden bg-[#071522]/5 flex-shrink-0 relative group shadow-2xs">
                  <img
                    src={image}
                    alt="Category banner"
                    onError={(e) => {
                      e.currentTarget.onerror = null;
                      e.currentTarget.src = "/assets/products/transformers_chokes.jpg";
                    }}
                    className="w-full h-full object-cover"
                  />
                  {image.startsWith("https://res.cloudinary.com") && (
                    <span className="absolute bottom-0 inset-x-0 bg-black/70 text-[8px] font-mono text-emerald-300 text-center py-0.5">
                      Cloudinary
                    </span>
                  )}
                </div>

                {/* Upload & URL input */}
                <div className="flex-1 space-y-2 w-full">
                  <div className="flex flex-wrap items-center gap-2">
                    <label className="inline-flex items-center gap-1.5 px-3 py-2 bg-[#FAF9F6] hover:bg-[#F2EFE9] border border-[#132333]/20 rounded-[2px] text-xs font-bold text-[#071522] cursor-pointer transition-colors shadow-2xs">
                      <TechnicalIcon name="upload" className="w-3.5 h-3.5 text-[#A77C3A]" />
                      <span>{isUploading ? "Uploading to Cloudinary..." : "Upload New Image"}</span>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleImageUpload}
                        disabled={isUploading}
                        className="hidden"
                      />
                    </label>
                    <span className="text-[11px] text-[#132333]/40">or enter image URL:</span>
                  </div>

                  <input
                    type="text"
                    value={image}
                    onChange={(e) => setImage(e.target.value)}
                    placeholder="https://... or /assets/products/..."
                    className="w-full px-3 py-1.5 bg-[#FAF9F6] border border-[#132333]/20 text-xs font-mono rounded-[2px] focus:outline-none focus:ring-1 focus:ring-[#A77C3A]"
                  />
                </div>
              </div>

              {/* Preset Image Options */}
              <div className="pt-2">
                <span className="text-[10px] font-mono text-[#132333]/60 uppercase block mb-1.5">
                  Or Select a Preset Image:
                </span>
                <div className="grid grid-cols-4 sm:grid-cols-8 gap-2">
                  {PRESET_CATEGORY_IMAGES.map((preset) => (
                    <button
                      key={preset.path}
                      type="button"
                      onClick={() => setImage(preset.path)}
                      className={`p-1 border rounded-[2px] transition-all text-center cursor-pointer ${
                        image === preset.path
                          ? "border-[#A77C3A] ring-2 ring-[#A77C3A] bg-amber-50/40"
                          : "border-[#132333]/15 hover:border-[#A77C3A]/50 opacity-75 hover:opacity-100 bg-[#FAF9F6]"
                      }`}
                    >
                      <div className="w-full h-8 bg-[#071522]/10 rounded-[2px] overflow-hidden">
                        <img
                          src={preset.path}
                          alt={preset.label}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <span className="text-[9px] font-mono block truncate mt-0.5">
                        {preset.label}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Bottom Actions Row */}
            <div className="flex flex-col-reverse sm:flex-row sm:items-center justify-between gap-3 pt-4 border-t border-[#132333]/10">
              {/* Delete Button (Available in Edit Mode) */}
              {isEditMode ? (
                <button
                  type="button"
                  onClick={handleDelete}
                  disabled={isDeleting || isSubmitting}
                  className="px-3.5 py-2 bg-red-50 hover:bg-red-100 text-red-700 border border-red-300 rounded-[2px] text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-1.5 cursor-pointer transition-colors shadow-2xs"
                >
                  <TechnicalIcon name="trash" className="w-3.5 h-3.5 text-red-600" />
                  <span>{isDeleting ? "Deleting..." : "Delete Category"}</span>
                </button>
              ) : (
                <div />
              )}

              <div className="flex items-center justify-end gap-2.5">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={onClose}
                  disabled={isSubmitting || isDeleting}
                  className="text-xs uppercase font-mono cursor-pointer"
                >
                  Cancel
                </Button>

                <Button
                  type="submit"
                  variant="primary"
                  size="sm"
                  disabled={isSubmitting || isUploading || isDeleting}
                  className="text-xs uppercase font-bold shadow-sm"
                >
                  <TechnicalIcon name={isEditMode ? "check" : "plus"} className="w-3.5 h-3.5 mr-1" />
                  <span>
                    {isSubmitting
                      ? isEditMode
                        ? "Saving Changes..."
                        : "Creating Category..."
                      : isEditMode
                      ? "Save Changes"
                      : "Save & Publish Category"}
                  </span>
                </Button>
              </div>
            </div>
          </form>

          {/* Directory of All Categories (Shown in Create Mode or below form) */}
          {!isEditMode && categories.length > 0 && (
            <div className="space-y-3 pt-2">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-bold uppercase tracking-wider text-[#071522] flex items-center gap-2">
                  <TechnicalIcon name="tag" className="w-3.5 h-3.5 text-[#A77C3A]" />
                  <span>All Categories Directory ({categories.length})</span>
                </h3>
                <span className="text-[11px] text-[#132333]/60 font-mono">
                  Select a category to view or modify
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {categories.map((cat) => {
                  const catIsHidden = Boolean(cat.isHidden);
                  return (
                    <div
                      key={cat.id}
                      className={`p-3 border rounded-[3px] flex items-start justify-between gap-3 shadow-2xs transition-colors ${
                        catIsHidden ? "bg-amber-50/50 border-amber-300" : "bg-white border-[#132333]/15"
                      }`}
                    >
                      <div className="flex items-start gap-2.5 min-w-0">
                        <div className="w-10 h-10 rounded-[2px] overflow-hidden bg-[#071522]/5 flex-shrink-0 border border-[#132333]/10 relative">
                          <img
                            src={cat.image || "/assets/products/transformers_chokes.jpg"}
                            alt={cat.name}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div className="min-w-0">
                          <h4 className="font-bold text-xs text-[#071522] truncate uppercase">
                            {cat.name}
                          </h4>
                          <span className="text-[10px] font-mono text-[#132333]/60">
                            {cat.count ?? 0} items &bull; KEY: {cat.id}
                          </span>
                        </div>
                      </div>

                      <span
                        className={`text-[9px] font-mono font-bold px-1.5 py-0.5 rounded flex-shrink-0 ${
                          catIsHidden ? "bg-amber-100 text-amber-900 border border-amber-300" : "bg-emerald-100 text-emerald-900 border border-emerald-300"
                        }`}
                      >
                        {catIsHidden ? "HIDDEN" : "LIVE"}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

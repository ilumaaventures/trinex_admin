import { useState } from "react";
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
  categories = [],
  onCategoryCreated,
  onCategoryDeleted,
  onCategoryToggled,
  onClose,
}) {
  const [name, setName] = useState("");
  const [subtitle, setSubtitle] = useState("");
  const [description, setDescription] = useState("");
  const [image, setImage] = useState("/assets/products/transformers_chokes.jpg");
  const [customSlug, setCustomSlug] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState("");

  if (!isOpen) return null;

  const currentSlug = customSlug.trim() ? slugify(customSlug) : slugify(name);

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
      alert("Failed to upload image to Cloudinary.");
    } finally {
      setIsUploading(false);
    }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!name.trim()) {
      setError("Category Name is required");
      return;
    }

    setIsSubmitting(true);
    setError("");

    try {
      const newCat = await api.createCategory({
        name: name.trim().toUpperCase(),
        id: currentSlug || slugify(name),
        subtitle: subtitle.trim(),
        description: description.trim(),
        image,
      });

      onCategoryCreated?.(newCat);
      setName("");
      setSubtitle("");
      setDescription("");
      setCustomSlug("");
      setImage("/assets/products/transformers_chokes.jpg");
    } catch (err) {
      setError(err.message || "Failed to create category");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleToggle = async (id, catName, currentHidden) => {
    try {
      await api.toggleCategoryVisibility(id);
      onCategoryToggled?.(id, catName, currentHidden);
    } catch (err) {
      alert("Failed to toggle category visibility: " + err.message);
    }
  };

  const handleDelete = async (id, catName, count) => {
    const msg =
      count > 0
        ? `Category '${catName}' contains ${count} components. Are you sure you want to delete this category?`
        : `Delete category '${catName}'?`;
    if (!window.confirm(msg)) return;

    try {
      await api.deleteCategory(id);
      onCategoryDeleted?.(id, catName);
    } catch (err) {
      alert("Failed to delete category: " + err.message);
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
              <TechnicalIcon name="folder-plus" className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold tracking-wide uppercase">
                Strategic Categories Management
              </h2>
              <p className="text-[11px] text-white/50 font-mono">
                CREATE CATEGORIES &bull; CLOUDINARY ASSETS &bull; CONTROL MAIN WEBSITE VISIBILITY
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
          {/* Create Category Form */}
          <form
            onSubmit={handleCreate}
            className="bg-white p-5 border border-[#132333]/15 rounded-[3px] space-y-4 shadow-sm"
          >
            <div className="flex items-center justify-between border-b border-[#132333]/10 pb-2">
              <h3 className="text-xs font-bold uppercase tracking-wider text-[#071522] flex items-center gap-2">
                <TechnicalIcon name="plus" className="w-3.5 h-3.5 text-[#A77C3A]" />
                <span>Create New Category</span>
              </h3>
              {currentSlug && (
                <span className="text-[10px] font-mono text-[#132333]/60 bg-[#FAF9F6] px-2 py-0.5 rounded border border-[#132333]/10">
                  SYSTEM ID: {currentSlug}
                </span>
              )}
            </div>

            {error && (
              <div className="p-2.5 text-xs text-red-700 bg-red-50 border border-red-200 rounded-[2px]">
                {error}
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[#132333]/80 mb-1">
                  Category Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. RF & Microwave, Antennas, Optoelectronics"
                  className="w-full px-3 py-2 bg-[#FAF9F6] border border-[#132333]/20 text-xs rounded-[2px] focus:outline-none focus:ring-1 focus:ring-[#A77C3A]"
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
                  placeholder="e.g. Radar & High-Gain Tactical Arrays"
                  className="w-full px-3 py-2 bg-[#FAF9F6] border border-[#132333]/20 text-xs rounded-[2px] focus:outline-none focus:ring-1 focus:ring-[#A77C3A]"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[#132333]/80 mb-1">
                  Custom Category Key (Slug)
                </label>
                <input
                  type="text"
                  value={customSlug}
                  onChange={(e) => setCustomSlug(e.target.value)}
                  placeholder={currentSlug || "Auto-generated from name"}
                  className="w-full px-3 py-2 bg-[#FAF9F6] border border-[#132333]/20 text-xs font-mono rounded-[2px] focus:outline-none focus:ring-1 focus:ring-[#A77C3A]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[#132333]/80 mb-1">
                  Description / Strategic Scope
                </label>
                <input
                  type="text"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="High-reliability military-spec electronic assemblies for tactical applications."
                  className="w-full px-3 py-2 bg-[#FAF9F6] border border-[#132333]/20 text-xs rounded-[2px] focus:outline-none focus:ring-1 focus:ring-[#A77C3A]"
                />
              </div>
            </div>

            {/* Representative Image Asset */}
            <div className="space-y-2 border-t border-[#132333]/10 pt-3">
              <div className="flex items-center justify-between">
                <label className="block text-[11px] font-bold uppercase tracking-wider text-[#132333]/70">
                  Category Banner Image
                </label>
                {/* <span className="text-[10px] font-mono text-[#A77C3A]">
                  Saved to Cloudinary trinix folder
                </span> */}
              </div>

              <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
                {/* Image preview */}
                <div className="w-24 h-16 rounded-[2px] border border-[#132333]/20 overflow-hidden bg-[#071522]/5 flex-shrink-0 relative group">
                  <img
                    src={image}
                    alt="Category banner"
                    className="w-full h-full object-cover"
                  />
                  {image.startsWith("https://res.cloudinary.com") && (
                    <span className="absolute bottom-0 inset-x-0 bg-black/60 text-[8px] font-mono text-emerald-300 text-center py-0.5">
                      Cloudinary
                    </span>
                  )}
                </div>

                {/* Upload custom image */}
                <div className="flex-1 space-y-1">
                  <label className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#FAF9F6] hover:bg-[#F2EFE9] border border-[#132333]/20 rounded-[2px] text-xs font-bold text-[#071522] cursor-pointer transition-colors shadow-xs">
                    <TechnicalIcon name="upload" className="w-3.5 h-3.5 text-[#A77C3A]" />
                    <span>{isUploading ? "Uploading to Cloudinary..." : "Upload Custom Image"}</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      disabled={isUploading}
                      className="hidden"
                    />
                  </label>
                  <p className="text-[10px] text-[#132333]/50">
                    Supports JPG, PNG, WEBP (Max 5MB). Automatically stored in Cloudinary &bull; trinix
                  </p>
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
                      className={`p-1 border rounded-[2px] transition-all text-center cursor-pointer ${image === preset.path
                          ? "border-[#A77C3A] ring-2 ring-[#A77C3A] bg-amber-50/40"
                          : "border-[#132333]/15 hover:border-[#A77C3A]/50 opacity-70 hover:opacity-100 bg-[#FAF9F6]"
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

            <div className="flex justify-end pt-2 border-t border-[#132333]/10">
              <Button
                type="submit"
                variant="primary"
                size="sm"
                disabled={isSubmitting || isUploading}
                className="text-xs uppercase font-bold shadow-sm"
              >
                <TechnicalIcon name="plus" className="w-3.5 h-3.5 mr-1" />
                <span>{isSubmitting ? "Creating Category..." : "Save & Publish Category"}</span>
              </Button>
            </div>
          </form>

          {/* Current Categories Directory */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold uppercase tracking-wider text-[#071522] flex items-center gap-2">
                <TechnicalIcon name="tag" className="w-3.5 h-3.5 text-[#A77C3A]" />
                <span>All Strategic Categories ({categories.length})</span>
              </h3>
              <span className="text-[11px] text-[#132333]/60 font-mono">
                Click Hide/Unhide to control visibility on the main website
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {categories.map((cat) => {
                const isHidden = Boolean(cat.isHidden);
                return (
                  <div
                    key={cat.id}
                    className={`p-3.5 border rounded-[3px] flex items-start gap-3 shadow-xs transition-colors ${isHidden
                        ? "bg-amber-50/50 border-amber-300"
                        : "bg-white border-[#132333]/15 hover:border-[#A77C3A]/40"
                      }`}
                  >
                    <div className="w-12 h-12 rounded-[2px] overflow-hidden bg-[#071522]/5 flex-shrink-0 border border-[#132333]/10 relative">
                      <img
                        src={cat.image || "/assets/products/transformers_chokes.jpg"}
                        alt={cat.name}
                        className="w-full h-full object-cover"
                      />
                      {isHidden && (
                        <div
                          className="absolute inset-0 bg-black/40 flex items-center justify-center text-white"
                          title="Hidden from public site"
                        >
                          <TechnicalIcon name="eye-off" className="w-4 h-4 text-amber-300" />
                        </div>
                      )}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-1">
                        <h4 className="font-bold text-xs text-[#071522] truncate uppercase">
                          {cat.name}
                        </h4>
                        <span className="text-[10px] font-mono font-bold px-1.5 py-0.2 bg-[#071522]/5 text-[#071522] rounded flex-shrink-0">
                          {cat.count ?? 0} items
                        </span>
                      </div>

                      {cat.subtitle && (
                        <p className="text-[11px] text-[#132333]/60 truncate">{cat.subtitle}</p>
                      )}

                      <div className="flex items-center gap-2 mt-1.5">
                        {/* Visibility Status Badge */}
                        {isHidden ? (
                          <span className="text-[9px] font-mono font-bold px-1.5 py-0.5 rounded bg-amber-100 text-amber-900 border border-amber-300 inline-flex items-center gap-1">
                            <TechnicalIcon name="eye-off" className="w-2.5 h-2.5 text-amber-700" />
                            <span>HIDDEN FROM SITE</span>
                          </span>
                        ) : (
                          <span className="text-[9px] font-mono font-bold px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-900 border border-emerald-300 inline-flex items-center gap-1">
                            <TechnicalIcon name="eye" className="w-2.5 h-2.5 text-emerald-700" />
                            <span>LIVE ON SITE</span>
                          </span>
                        )}

                        <span className="text-[9px] font-mono text-[#A77C3A] truncate">
                          KEY: {cat.id}
                        </span>
                      </div>
                    </div>

                    {/* Action buttons */}
                    <div className="flex flex-col items-end gap-1.5 flex-shrink-0">
                      {/* Hide / Unhide Button */}
                      <button
                        type="button"
                        onClick={() => handleToggle(cat.id, cat.name, isHidden)}
                        title={
                          isHidden
                            ? "Show category on main site"
                            : "Hide category from main site"
                        }
                        className={`px-2 py-1 text-[10px] font-mono font-bold uppercase rounded-[2px] transition-colors flex items-center gap-1 cursor-pointer ${isHidden
                            ? "bg-emerald-600 hover:bg-emerald-700 text-white"
                            : "bg-amber-100 hover:bg-amber-200 text-amber-900 border border-amber-300"
                          }`}
                      >
                        <TechnicalIcon
                          name={isHidden ? "eye" : "eye-off"}
                          className="w-3 h-3"
                        />
                        <span>{isHidden ? "Unhide" : "Hide"}</span>
                      </button>

                      {/* Delete Button */}
                      <button
                        type="button"
                        onClick={() => handleDelete(cat.id, cat.name, cat.count)}
                        title="Delete Category"
                        className="p-1 text-[#132333]/40 hover:text-red-600 transition-colors cursor-pointer"
                      >
                        <TechnicalIcon name="trash" className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 bg-[#FAF9F6] border-t border-[#132333]/10 flex justify-end">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={onClose}
            className="text-xs uppercase font-mono cursor-pointer"
          >
            Close
          </Button>
        </div>
      </div>
    </div>
  );
}

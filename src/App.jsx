import { useState, useEffect, useMemo } from "react";
import { api, CATEGORIES } from "./services/api";
import { AdminHeader } from "./components/layout/AdminHeader";
import { ProductTable } from "./components/products/ProductTable";
import { ProductCardGrid } from "./components/products/ProductCardGrid";
import { ProductEditorModal } from "./components/products/ProductEditorModal";
import { CategoryModal } from "./components/categories/CategoryModal";
import { DeleteConfirmModal } from "./components/products/DeleteConfirmModal";
import { TechnicalIcon } from "./components/ui/TechnicalIcon";
import { Toast } from "./components/ui/Toast";

export default function App() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [stockFilter, setStockFilter] = useState("all");
  const [viewMode, setViewMode] = useState("table");

  // Modals state
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [deletingProduct, setDeletingProduct] = useState(null);

  // Toast state
  const [toastMessage, setToastMessage] = useState(null);

  // Load products and categories on mount
  useEffect(() => {
    async function load() {
      setIsLoading(true);
      try {
        const [productsData, categoriesData] = await Promise.all([
          api.getProducts(),
          api.getCategories(),
        ]);
        setProducts(productsData);
        if (Array.isArray(categoriesData)) setCategories(categoriesData);
      } catch (err) {
        console.error("Failed to fetch products/categories:", err);
      } finally {
        setIsLoading(false);
      }
    }
    load();
  }, []);

  // Filtered products list
  const filteredProducts = useMemo(() => {
    return products.filter((item) => {
      if (selectedCategory !== "all" && item.categoryKey !== selectedCategory) {
        return false;
      }
      if (
        stockFilter === "delhi" &&
        !item.location?.toLowerCase().includes("delhi")
      ) {
        return false;
      }
      if (stockFilter === "low" && item.stock > 5) {
        return false;
      }

      const q = searchQuery.trim().toLowerCase();
      if (!q) return true;

      return (
        item.partNumber?.toLowerCase().includes(q) ||
        item.category?.toLowerCase().includes(q) ||
        item.description?.toLowerCase().includes(q) ||
        item.metaTitle?.toLowerCase().includes(q) ||
        item.metaKeywords?.toLowerCase().includes(q)
      );
    });
  }, [products, selectedCategory, stockFilter, searchQuery]);

  // Actions
  const handleOpenCreate = () => {
    setEditingProduct(null);
    setIsEditorOpen(true);
  };

  const handleOpenEdit = (product) => {
    setEditingProduct(product);
    setIsEditorOpen(true);
  };

  const handleSaveProduct = async (productData) => {
    try {
      if (productData.id) {
        await api.updateProduct(productData.id, productData);
        setToastMessage(`Product "${productData.partNumber}" updated with SEO.`);
      } else {
        await api.createProduct(productData);
        setToastMessage(`Product "${productData.partNumber}" created & published.`);
      }
      const refreshed = await api.getProducts();
      setProducts(refreshed);
      setIsEditorOpen(false);
      setEditingProduct(null);
    } catch (err) {
      console.error("Save failed:", err);
      alert("Failed to save product.");
    }
  };

  const handleOpenDelete = (product) => {
    setDeletingProduct(product);
    setIsDeleteOpen(true);
  };

  const handleConfirmDelete = async (id) => {
    try {
      await api.deleteProduct(id);
      const refreshed = await api.getProducts();
      setProducts(refreshed);
      setIsDeleteOpen(false);
      setDeletingProduct(null);
      setToastMessage("Product removed from inventory.");
    } catch (err) {
      console.error("Delete failed:", err);
      alert("Failed to delete product.");
    }
  };

  const handleToggleProductVisibility = async (id, partNumber, currentHidden) => {
    try {
      await api.toggleProductVisibility(id);
      const isNowHidden = !currentHidden;
      setProducts((prev) =>
        prev.map((p) =>
          String(p.id) === String(id) || String(p._id) === String(id)
            ? { ...p, isHidden: isNowHidden }
            : p
        )
      );
      setToastMessage(
        isNowHidden
          ? `Part "${partNumber}" is now HIDDEN from the main website.`
          : `Part "${partNumber}" is now PUBLISHED and visible on the main website.`
      );
    } catch (err) {
      console.error("Failed to toggle visibility:", err);
      alert("Failed to toggle visibility: " + err.message);
    }
  };

  const handleToggleCategoryVisibility = async (catId, catName, currentHidden) => {
    try {
      await api.toggleCategoryVisibility(catId);
      const isNowHidden = !currentHidden;
      setCategories((prev) =>
        prev.map((c) => (c.id === catId ? { ...c, isHidden: isNowHidden } : c))
      );
      setToastMessage(
        isNowHidden
          ? `Category "${catName}" & its products are now HIDDEN from the main website.`
          : `Category "${catName}" is now PUBLISHED and visible on the main website.`
      );
    } catch (err) {
      console.error("Failed to toggle category visibility:", err);
      alert("Failed to toggle category visibility: " + err.message);
    }
  };

  const handleCategoryCreated = async (newCat) => {
    try {
      const refreshedCats = await api.getCategories();
      if (Array.isArray(refreshedCats)) setCategories(refreshedCats);
      setToastMessage(`Category "${newCat.name}" created & published successfully.`);
    } catch (err) {
      console.error("Error refreshing categories:", err);
    }
  };

  const handleCategoryDeleted = async (id, catName) => {
    try {
      const refreshedCats = await api.getCategories();
      if (Array.isArray(refreshedCats)) setCategories(refreshedCats);
      setToastMessage(`Category "${catName}" removed.`);
    } catch (err) {
      console.error("Error refreshing categories:", err);
    }
  };

  const handleResetCatalog = async () => {
    if (
      window.confirm(
        "Reset the entire inventory back to factory defaults? Custom items will be replaced."
      )
    ) {
      const reset = await api.resetCatalog();
      setProducts(reset);
      setToastMessage("Catalog restored to factory defaults.");
    }
  };

  const handleExportJson = () => {
    const jsonStr = JSON.stringify(products, null, 2);
    const blob = new Blob([jsonStr], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `trinex-products-inventory-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
    setToastMessage("Exported inventory JSON catalog.");
  };

  return (
    <div className="min-h-screen bg-[#FAF9F6] text-[#132333] flex flex-col antialiased">
      {/* 1. Subdomain Header */}
      <AdminHeader
        onExportJson={handleExportJson}
        onOpenCreateCategory={() => setIsCategoryModalOpen(true)}
      />

      {/* 2. Main Dashboard Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        {/* Category Visibility Control Bar */}
        <div className="bg-white p-4 sm:p-5 rounded-[3px] border border-[#132333]/15 shadow-sm space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#132333]/10 pb-2.5">
            <div className="flex items-center gap-2">
              <TechnicalIcon name="tag" className="w-4 h-4 text-[#A77C3A]" />
              <h2 className="text-xs font-bold uppercase tracking-wider text-[#071522]">
                Strategic Categories &amp; Website Visibility Control
              </h2>
              <span className="text-[10px] font-mono text-[#132333]/50 hidden md:inline">
                &bull; Click Hide/Unhide to toggle entire category &amp; all its components from the main website
              </span>
            </div>
            <div className="flex items-center gap-2.5">
              <button
                type="button"
                onClick={() => setIsCategoryModalOpen(true)}
                className="px-2.5 py-1 bg-[#A77C3A]/20 hover:bg-[#A77C3A]/30 text-[#A77C3A] hover:text-[#071522] border border-[#A77C3A]/40 text-xs font-bold uppercase tracking-wider rounded-[2px] transition-colors flex items-center gap-1.5 cursor-pointer shadow-xs"
              >
                <TechnicalIcon name="folder-plus" className="w-3.5 h-3.5" />
                <span>Create Category</span>
              </button>
              <span className="text-[11px] font-mono text-[#A77C3A] font-bold">
                {categories.filter((c) => !c.isHidden).length} / {categories.length} LIVE ON WEBSITE
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-2.5">
            {categories.map((cat) => {
              const isHidden = Boolean(cat.isHidden);
              const isSelected = selectedCategory === cat.id;
              const productCount = products.filter((p) => p.categoryKey === cat.id).length;
              return (
                <div
                  key={cat.id}
                  className={`p-2.5 rounded-[3px] border transition-all flex items-center justify-between gap-2 ${
                    isHidden
                      ? "bg-amber-50/70 border-amber-300"
                      : "bg-[#FAF9F6] border-[#132333]/12 hover:border-[#A77C3A]/50"
                  }`}
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="w-9 h-9 rounded-[2px] overflow-hidden bg-[#071522]/5 flex-shrink-0 border border-[#132333]/10 relative">
                      <img
                        src={cat.image || "/assets/products/transformers_chokes.jpg"}
                        alt={cat.name}
                        className="w-full h-full object-cover"
                      />
                      {isHidden && (
                        <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                          <TechnicalIcon name="eye-off" className="w-3 h-3 text-amber-300" />
                        </div>
                      )}
                    </div>
                    <div className="min-w-0">
                      <button
                        type="button"
                        onClick={() => setSelectedCategory(isSelected ? "all" : cat.id)}
                        className={`font-bold text-xs uppercase truncate block text-left hover:text-[#A77C3A] transition-colors cursor-pointer ${
                          isSelected ? "text-[#A77C3A] underline" : "text-[#071522]"
                        }`}
                        title={`Filter by ${cat.name}`}
                      >
                        {cat.name}
                      </button>
                      <div className="flex items-center gap-1.5 mt-0.5">
                        <span className="text-[10px] font-mono text-[#132333]/60">
                          {productCount} items
                        </span>
                        <span>&bull;</span>
                        {isHidden ? (
                          <span className="text-[9px] font-mono font-bold text-amber-800">
                            HIDDEN
                          </span>
                        ) : (
                          <span className="text-[9px] font-mono font-bold text-emerald-700">
                            LIVE
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* 1-Click Hide/Unhide Button */}
                  <button
                    type="button"
                    onClick={() => handleToggleCategoryVisibility(cat.id, cat.name, isHidden)}
                    title={isHidden ? "Unhide category on main website" : "Hide category from main website"}
                    className={`px-2 py-1 text-[10px] font-mono font-bold uppercase rounded-[2px] transition-colors flex items-center gap-1 cursor-pointer flex-shrink-0 ${
                      isHidden
                        ? "bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs"
                        : "bg-amber-100 hover:bg-amber-200 text-amber-900 border border-amber-300"
                    }`}
                  >
                    <TechnicalIcon name={isHidden ? "eye" : "eye-off"} className="w-3 h-3" />
                    <span>{isHidden ? "Unhide" : "Hide"}</span>
                  </button>
                </div>
              );
            })}
          </div>
        </div>

        {/* Toolbar & Filters */}
        <div className="bg-white p-4 sm:p-5 rounded-[3px] border border-[#132333]/15 shadow-sm space-y-4">
          <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4">
            {/* Search Bar */}
            <div className="relative flex-1">
              <TechnicalIcon
                name="search"
                className="w-4 h-4 text-[#68717A] absolute left-3 top-1/2 -translate-y-1/2"
              />
              <input
                type="text"
                placeholder="Search SKU, category, specs, meta keywords..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-2.5 text-xs bg-[#FAF9F6] border border-[#132333]/20 rounded-[2px] focus:outline-none focus:ring-1 focus:ring-[#A77C3A]"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 cursor-pointer"
                >
                  <TechnicalIcon name="x" className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* Quick Action Buttons */}
            <div className="flex flex-wrap items-center gap-2 sm:gap-3">
              <button
                type="button"
                onClick={() => setIsCategoryModalOpen(true)}
                className="px-3.5 py-2.5 bg-[#071522] hover:bg-[#132333] text-[#A77C3A] border border-[#A77C3A]/40 text-xs font-bold uppercase tracking-wider rounded-[2px] transition-colors flex items-center gap-2 shadow-sm font-mono cursor-pointer"
              >
                <TechnicalIcon name="folder-plus" className="w-4 h-4 text-[#A77C3A]" />
                <span>CREATE CATEGORY</span>
              </button>

              <button
                type="button"
                onClick={handleOpenCreate}
                className="px-4 py-2.5 bg-[#A77C3A] hover:bg-[#C29A58] text-[#071522] text-xs font-bold uppercase tracking-wider rounded-[2px] transition-colors flex items-center gap-2 shadow-sm font-mono cursor-pointer"
              >
                <TechnicalIcon name="plus" className="w-4 h-4" />
                <span>ADD PRODUCT</span>
              </button>

              <button
                type="button"
                onClick={handleResetCatalog}
                className="px-3 py-2.5 border border-[#132333]/20 hover:border-red-400 text-xs text-[#68717A] hover:text-red-600 font-bold uppercase tracking-wider rounded-[2px] transition-colors font-mono cursor-pointer"
                title="Restore factory catalog defaults"
              >
                RESET CATALOG
              </button>
            </div>
          </div>

          {/* Category Filter Pills & View Toggle */}
          <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-[#132333]/10">
            <div className="flex flex-wrap items-center gap-1.5 text-xs">
              <button
                type="button"
                onClick={() => setSelectedCategory("all")}
                className={`px-2.5 py-1 rounded-[2px] font-mono uppercase text-[11px] transition-colors cursor-pointer ${
                  selectedCategory === "all"
                    ? "bg-[#071522] text-[#A77C3A] font-bold"
                    : "bg-[#FAF9F6] text-[#68717A] hover:text-[#071522] border border-[#132333]/10"
                }`}
              >
                All ({products.length})
              </button>

              {(categories.length > 0 ? categories : CATEGORIES).map((cat) => {
                const count = products.filter((p) => p.categoryKey === cat.id).length;
                return (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => setSelectedCategory(cat.id)}
                    className={`px-2.5 py-1 rounded-[2px] font-mono uppercase text-[11px] transition-colors cursor-pointer ${
                      selectedCategory === cat.id
                        ? "bg-[#071522] text-[#A77C3A] font-bold"
                        : "bg-[#FAF9F6] text-[#68717A] hover:text-[#071522] border border-[#132333]/10"
                    }`}
                  >
                    {cat.name} ({count})
                  </button>
                );
              })}
            </div>

            {/* View Mode & Location Filter */}
            <div className="flex items-center gap-2">
              <select
                value={stockFilter}
                onChange={(e) => setStockFilter(e.target.value)}
                className="px-2.5 py-1 text-xs bg-[#FAF9F6] border border-[#132333]/20 rounded-[2px] text-[#071522] font-mono"
              >
                <option value="all">All Locations</option>
                <option value="delhi">Delhi Stock Only</option>
                <option value="low">Low Stock (&le; 5)</option>
              </select>

              <div className="flex items-center border border-[#132333]/20 rounded-[2px] overflow-hidden">
                <button
                  type="button"
                  onClick={() => setViewMode("table")}
                  className={`p-1.5 cursor-pointer ${
                    viewMode === "table"
                      ? "bg-[#071522] text-[#A77C3A]"
                      : "bg-white text-[#68717A]"
                  }`}
                  title="Table view"
                >
                  <TechnicalIcon name="layers" className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => setViewMode("cards")}
                  className={`p-1.5 cursor-pointer ${
                    viewMode === "cards"
                      ? "bg-[#071522] text-[#A77C3A]"
                      : "bg-white text-[#68717A]"
                  }`}
                  title="Card grid view"
                >
                  <TechnicalIcon name="grid" className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* 3. Product Catalog Presentation */}
        {isLoading ? (
          <div className="p-12 text-center bg-white border border-[#132333]/10 rounded-[3px] text-xs font-mono text-[#68717A]">
            Loading product registry...
          </div>
        ) : viewMode === "table" ? (
          <ProductTable
            products={filteredProducts}
            onEdit={handleOpenEdit}
            onDelete={handleOpenDelete}
            onToggleVisibility={handleToggleProductVisibility}
          />
        ) : (
          <ProductCardGrid
            products={filteredProducts}
            onEdit={handleOpenEdit}
            onDelete={handleOpenDelete}
            onToggleVisibility={handleToggleProductVisibility}
          />
        )}
      </main>

      {/* 4. Product Editor Modal with full SEO suite */}
      <ProductEditorModal
        key={editingProduct ? `edit-${editingProduct.id}` : (isEditorOpen ? "new-product" : "closed")}
        isOpen={isEditorOpen}
        product={editingProduct}
        categories={categories}
        onSave={handleSaveProduct}
        onClose={() => setIsEditorOpen(false)}
        onOpenCreateCategory={() => setIsCategoryModalOpen(true)}
      />

      {/* 4B. Category Manager & Creation Modal */}
      <CategoryModal
        isOpen={isCategoryModalOpen}
        categories={categories}
        onCategoryCreated={handleCategoryCreated}
        onCategoryDeleted={handleCategoryDeleted}
        onCategoryToggled={handleToggleCategoryVisibility}
        onClose={() => setIsCategoryModalOpen(false)}
      />

      {/* 5. Delete Confirm Modal */}
      <DeleteConfirmModal
        isOpen={isDeleteOpen}
        product={deletingProduct}
        onConfirm={handleConfirmDelete}
        onCancel={() => setIsDeleteOpen(false)}
      />

      {/* 6. Notification Feedback Toast */}
      {toastMessage && (
        <Toast message={toastMessage} onClose={() => setToastMessage(null)} />
      )}
    </div>
  );
}

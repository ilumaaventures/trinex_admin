import { useState, useEffect, useMemo, useRef, useCallback } from "react";
import { api, CATEGORIES } from "./services/api";
import { AdminHeader } from "./components/layout/AdminHeader";
import { ProductTable } from "./components/products/ProductTable";
import { ProductCardGrid } from "./components/products/ProductCardGrid";
import { ProductEditorModal } from "./components/products/ProductEditorModal";
import { CategoryModal } from "./components/categories/CategoryModal";
import { DeleteConfirmModal } from "./components/products/DeleteConfirmModal";
import { LoginPage } from "./components/auth/LoginPage";
import { TechnicalIcon } from "./components/ui/TechnicalIcon";
import { Toast } from "./components/ui/Toast";

// Helper for resilient category matching (handles singular/plural and slug differences)
export function matchCategory(product, catId) {
  if (!catId || catId === "all") return true;
  if (!product) return false;
  const cKey = String(catId).trim().toLowerCase();
  const pKey = String(product.categoryKey || "").trim().toLowerCase();
  if (pKey) {
    if (pKey === cKey || pKey.replace(/s$/, "") === cKey.replace(/s$/, "")) return true;
  }
  const pCat = String(product.category || "").trim().toLowerCase();
  if (pCat) {
    if (pCat === cKey || pCat.replace(/s$/, "") === cKey.replace(/s$/, "")) return true;
    const pSlug = (product.slug || "").toLowerCase();
    if (pSlug.includes(cKey)) return true;
  }
  return false;
}

export default function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(() => api.isAuthenticated());
  const [currentUser, setCurrentUser] = useState(() => api.getCurrentUser());
  const [isAuthChecking, setIsAuthChecking] = useState(true);

  // Products and Infinite Scroll State
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [totalCount, setTotalCount] = useState(0);

  // Filters & Views
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [stockFilter, setStockFilter] = useState("all");
  const [viewMode, setViewMode] = useState("table");

  // Sentinel ref for IntersectionObserver
  const sentinelRef = useRef(null);
  const loadingMoreRef = useRef(false);

  // Modals state
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [deletingProduct, setDeletingProduct] = useState(null);

  // Toast state
  const [toastMessage, setToastMessage] = useState(null);

  // Debounce search query by 250ms for smooth server-side searching
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(searchQuery);
    }, 250);
    return () => clearTimeout(handler);
  }, [searchQuery]);

  // 1. Session verification on mount
  useEffect(() => {
    let isMounted = true;

    async function checkAuthSession() {
      try {
        const { authenticated, user } = await api.verifyAuth();
        if (isMounted) {
          setIsAuthenticated(authenticated);
          setCurrentUser(user);
        }
      } catch (err) {
        console.warn("Auth session verification error:", err);
      } finally {
        if (isMounted) {
          setIsAuthChecking(false);
        }
      }
    }

    checkAuthSession();

    const handleAuthChanged = () => {
      setIsAuthenticated(api.isAuthenticated());
      setCurrentUser(api.getCurrentUser());
    };
    window.addEventListener("auth-changed", handleAuthChanged);

    return () => {
      isMounted = false;
      window.removeEventListener("auth-changed", handleAuthChanged);
    };
  }, []);

  // Build query params for backend pagination and filtering
  const buildQueryParams = useCallback(
    (targetPage) => {
      const params = {
        page: targetPage,
        limit: 25,
      };
      if (selectedCategory && selectedCategory !== "all") {
        params.category = selectedCategory;
      }
      if (stockFilter === "delhi") {
        params.location = "delhi";
      } else if (stockFilter === "low") {
        params.maxStock = 5;
      }
      if (debouncedSearch.trim()) {
        params.search = debouncedSearch.trim();
      }
      return params;
    },
    [selectedCategory, stockFilter, debouncedSearch]
  );

  // 2. Load page 1 of products and categories whenever filters change or authenticated
  useEffect(() => {
    if (!isAuthenticated) return;
    let isMounted = true;

    async function loadFirstPage() {
      setIsLoading(true);
      try {
        const [productsData, categoriesData] = await Promise.all([
          api.getProducts(buildQueryParams(1)),
          api.getCategories(),
        ]);
        if (isMounted) {
          if (Array.isArray(productsData)) {
            setProducts(productsData);
            setPage(1);
            if (productsData.pagination) {
              setHasMore(Boolean(productsData.pagination.hasNextPage));
              setTotalCount(productsData.pagination.totalItems);
            } else {
              setHasMore(false);
              setTotalCount(productsData.length);
            }
          }
          if (Array.isArray(categoriesData) && categoriesData.length > 0) {
            setCategories(categoriesData);
          }
        }
      } catch (err) {
        console.error("Failed to fetch products/categories:", err);
      } finally {
        if (isMounted) setIsLoading(false);
      }
    }

    loadFirstPage();

    return () => {
      isMounted = false;
    };
  }, [isAuthenticated, buildQueryParams]);

  // 3. Load next page for on-scroll infinite pagination
  const loadNextPage = useCallback(async () => {
    if (loadingMoreRef.current || !hasMore || isLoading || isLoadingMore) return;
    loadingMoreRef.current = true;
    setIsLoadingMore(true);

    try {
      const nextPage = page + 1;
      const res = await api.getProducts(buildQueryParams(nextPage));
      if (Array.isArray(res) && res.length > 0) {
        setProducts((prev) => {
          const existingIds = new Set(prev.map((p) => String(p.id || p._id)));
          const uniqueNew = res.filter((p) => !existingIds.has(String(p.id || p._id)));
          return [...prev, ...uniqueNew];
        });
        setPage(nextPage);
        if (res.pagination) {
          setHasMore(Boolean(res.pagination.hasNextPage));
          setTotalCount(res.pagination.totalItems);
        } else {
          setHasMore(false);
        }
      } else {
        setHasMore(false);
      }
    } catch (err) {
      console.warn("Failed to load more products:", err);
    } finally {
      loadingMoreRef.current = false;
      setIsLoadingMore(false);
    }
  }, [page, hasMore, isLoading, isLoadingMore, buildQueryParams]);

  // 4. Attach IntersectionObserver to sentinel element at bottom of table
  useEffect(() => {
    if (!sentinelRef.current || !hasMore || isLoading) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const [entry] = entries;
        if (entry.isIntersecting) {
          loadNextPage();
        }
      },
      {
        root: null,
        rootMargin: "300px",
        threshold: 0.1,
      }
    );

    observer.observe(sentinelRef.current);
    return () => observer.disconnect();
  }, [hasMore, isLoading, loadNextPage]);

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
        const updated = await api.updateProduct(productData.id, productData);
        setProducts((prev) =>
          prev.map((p) =>
            String(p.id || p._id) === String(productData.id) ? { ...p, ...updated } : p
          )
        );
        setToastMessage(`Product "${productData.partNumber}" updated with SEO.`);
      } else {
        const created = await api.createProduct(productData);
        setProducts((prev) => [created, ...prev]);
        setTotalCount((prev) => prev + 1);
        setToastMessage(`Product "${productData.partNumber}" created & published.`);
      }
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
      setProducts((prev) => prev.filter((p) => String(p.id || p._id) !== String(id)));
      setTotalCount((prev) => Math.max(0, prev - 1));
      setIsDeleteOpen(false);
      setDeletingProduct(null);
      setToastMessage("Product removed from inventory.");
    } catch (err) {
      console.error("Delete failed:", err);
      alert("Failed to delete product.");
    }
  };

  const handleToggleProductVisibility = (id, partNumber, currentHidden) => {
    const key = String(id);
    const newHiddenState = !currentHidden;

    // 1. Instant optimistic UI update (0ms latency, butter-smooth)
    setProducts((prev) =>
      prev.map((p) =>
        String(p.id) === key || String(p._id) === key
          ? { ...p, isHidden: newHiddenState }
          : p
      )
    );

    setToastMessage(
      newHiddenState
        ? `Part "${partNumber}" is now HIDDEN from the main website.`
        : `Part "${partNumber}" is now PUBLISHED and visible on the main website.`
    );

    // 2. Background sync with automatic rollback on network failure
    api.toggleProductVisibility(id).catch((err) => {
      console.error("Failed to toggle visibility:", err);
      setProducts((prev) =>
        prev.map((p) =>
          String(p.id) === key || String(p._id) === key
            ? { ...p, isHidden: currentHidden }
            : p
        )
      );
      setToastMessage(`Error: Could not toggle visibility for "${partNumber}".`);
    });
  };

  const handleToggleCategoryVisibility = (catId, catName, currentHidden) => {
    if (!catId || catId === "undefined" || catId === "null") {
      setToastMessage("Invalid category identifier.");
      return;
    }

    const key = String(catId);
    const newHiddenState = !currentHidden;

    // 1. Instant optimistic UI update (0ms latency, butter-smooth)
    setCategories((prev) =>
      prev.map((c) =>
        String(c.id || c._id) === key ? { ...c, isHidden: newHiddenState } : c
      )
    );

    setToastMessage(
      newHiddenState
        ? `Category "${catName}" is now HIDDEN from the main website.`
        : `Category "${catName}" is now PUBLISHED and visible on the main website.`
    );

    // 2. Background sync with automatic rollback on network failure
    api.toggleCategoryVisibility(catId).catch((err) => {
      console.error("Failed to toggle category visibility:", err);
      setCategories((prev) =>
        prev.map((c) =>
          String(c.id || c._id) === key ? { ...c, isHidden: currentHidden } : c
        )
      );
      setToastMessage(`Error: Could not toggle visibility for "${catName}".`);
    });
  };

  const handleOpenCreateCategory = () => {
    setEditingCategory(null);
    setIsCategoryModalOpen(true);
  };

  const handleOpenEditCategory = (cat) => {
    setEditingCategory(cat);
    setIsCategoryModalOpen(true);
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

  const handleCategoryUpdated = async (updatedCat) => {
    try {
      const refreshedCats = await api.getCategories();
      if (Array.isArray(refreshedCats)) setCategories(refreshedCats);
      const refreshedProds = await api.getProducts();
      if (Array.isArray(refreshedProds)) setProducts(refreshedProds);
      setToastMessage(`Category "${updatedCat.name || updatedCat.id}" updated successfully.`);
    } catch (err) {
      console.error("Error refreshing categories/products:", err);
    }
  };

  const handleCategoryDeleted = async (id, catName) => {
    try {
      const refreshedCats = await api.getCategories();
      if (Array.isArray(refreshedCats)) setCategories(refreshedCats);
      const refreshedProds = await api.getProducts();
      if (Array.isArray(refreshedProds)) setProducts(refreshedProds);
      if (selectedCategory === id) setSelectedCategory("all");
      setToastMessage(`Category "${catName}" removed successfully.`);
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
      await api.resetCatalog();
      const res = await api.getProducts(buildQueryParams(1));
      setProducts(res);
      setPage(1);
      setHasMore(Boolean(res.pagination?.hasNextPage));
      setTotalCount(res.pagination?.totalItems || res.length);
      setToastMessage("Catalog restored to factory defaults.");
    }
  };

  const handleExportExcel = () => {
    if (!products || products.length === 0) {
      setToastMessage("No inventory items found to export.");
      return;
    }

    // Generate Excel-compatible CSV with UTF-8 BOM so MS Excel renders all characters cleanly
    const BOM = "\uFEFF";
    const headers = [
      "Category",
      "Product Name",
      "Quantity",
      "Stock Place",
      "Technical Details",
      "Delivery Timeline",
      "Compliance Standard",
      "Website Visibility",
    ];

    const escapeCsv = (val) => {
      if (val === null || val === undefined) return '""';
      const clean = String(val).replace(/"/g, '""').replace(/[\r\n]+/g, " ");
      return `"${clean}"`;
    };

    const rows = products.map((item) => {
      const categoryName = item.category || item.categoryKey || "UNSPECIFIED";
      const productName = item.partNumber || item.name || item.title || "";
      const quantity = item.stock ?? 0;
      const stockPlace = item.location || "Ready Stock (Delhi)";
      const description = item.description || "";
      const delivery = item.delivery || "Immediate Dispatch";
      const compliance = item.compliance || "MIL-STD-883 / ISO 9001";
      const visibility = item.isHidden ? "Hidden from Website" : "Live on Website";

      return [
        escapeCsv(categoryName),
        escapeCsv(productName),
        escapeCsv(quantity),
        escapeCsv(stockPlace),
        escapeCsv(description),
        escapeCsv(delivery),
        escapeCsv(compliance),
        escapeCsv(visibility),
      ].join(",");
    });

    const csvContent = BOM + [headers.map(escapeCsv).join(","), ...rows].join("\r\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    const dateStr = new Date().toISOString().slice(0, 10);
    a.href = url;
    a.download = `trinex-inventory-${dateStr}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    setToastMessage(`Exported ${products.length} products to Excel spreadsheet.`);
  };

  const handleLoginSuccess = (user) => {
    setIsAuthenticated(true);
    setCurrentUser(user);
    setToastMessage(`Welcome back, ${user?.name || user?.email || "Administrator"}! Access granted.`);
  };

  const handleLogout = async () => {
    try {
      await api.logout();
    } catch (err) {
      console.warn("Logout error:", err);
    }
    setIsAuthenticated(false);
    setCurrentUser(null);
    setToastMessage("You have been logged out securely.");
  };

  // Auth Checking Loading Screen
  if (isAuthChecking) {
    return (
      <div className="min-h-screen bg-[#071522] text-[#FAF9F6] flex flex-col justify-center items-center font-mono select-none">
        <div className="w-9 h-9 border-2 border-[#A77C3A] border-t-transparent rounded-full animate-spin mb-4" />
        <span className="text-xs tracking-widest text-[#C29A58] uppercase font-bold">
          Verifying Security Credentials...
        </span>
        <span className="text-[10px] text-white/40 mt-1 uppercase tracking-wider">
          Trinex Systems Defence Portal
        </span>
      </div>
    );
  }

  // Unauthenticated: Present High-Security Defense Login Gate
  if (!isAuthenticated) {
    return (
      <>
        <LoginPage onLoginSuccess={handleLoginSuccess} />
        {toastMessage && (
          <Toast message={toastMessage} onClose={() => setToastMessage(null)} />
        )}
      </>
    );
  }

  return (
    <div className="min-h-screen bg-[#FAF9F6] text-[#132333] flex flex-col antialiased">
      {/* 1. Subdomain Header */}
      <AdminHeader
        onExportExcel={handleExportExcel}
        currentUser={currentUser}
        onLogout={handleLogout}
      />

      {/* 2. Main Dashboard Area */}
      <main className="flex-1 max-w-[1820px] w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-6">
        {/* Category Visibility Control Bar */}
        <div className="bg-white p-4 sm:p-5 rounded-[3px] border border-[#132333]/15 shadow-sm space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#132333]/10 pb-2.5">
            <div className="flex items-center gap-2">
              <TechnicalIcon name="tag" className="w-4 h-4 text-[#A77C3A]" />
              <h2 className="text-xs font-bold uppercase tracking-wider text-[#071522]">
                Strategic Categories &amp; Website Visibility Control
              </h2>
              <span className="text-[10px] font-mono text-[#132333]/50 hidden md:inline">
                &bull; Click any category card to edit details &amp; delete, or click Hide/Unhide for 1-click toggle
              </span>
            </div>
            <div className="flex items-center gap-2.5">
              <button
                type="button"
                onClick={handleOpenCreateCategory}
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
              const catIdentifier = cat.id || cat._id;
              const isHidden = Boolean(cat.isHidden);
              const productCount = products.filter((p) => matchCategory(p, catIdentifier)).length;
              return (
                <div
                  key={catIdentifier}
                  onClick={(e) => {
                    if (e.target.closest("button")) return;
                    handleOpenEditCategory(cat);
                  }}
                  className={`group p-2.5 rounded-[3px] border transition-all duration-200 ease-in-out flex items-center justify-between gap-2 cursor-pointer shadow-2xs hover:shadow-md select-none ${isHidden
                    ? "bg-amber-50/70 border-amber-300 hover:border-amber-400"
                    : "bg-[#FAF9F6] border-[#132333]/12 hover:border-[#A77C3A] hover:bg-white"
                    }`}
                  title="Click to edit category details or delete"
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="w-9 h-9 rounded-[2px] overflow-hidden bg-[#071522]/5 flex-shrink-0 border border-[#132333]/10 relative group-hover:scale-105 transition-transform duration-200">
                      <img
                        src={cat.image || "/assets/products/transformers_chokes.jpg"}
                        alt={cat.name}
                        className="w-full h-full object-cover"
                      />
                      {isHidden && (
                        <div className="absolute inset-0 bg-black/40 flex items-center justify-center transition-opacity duration-200">
                          <TechnicalIcon name="eye-off" className="w-3 h-3 text-amber-300" />
                        </div>
                      )}
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-1">
                        <span className="font-bold text-xs uppercase truncate block text-[#071522] group-hover:text-[#A77C3A] transition-colors">
                          {cat.name}
                        </span>
                        <TechnicalIcon name="edit" className="w-2.5 h-2.5 text-[#A77C3A] opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0" />
                      </div>
                      <div className="flex items-center gap-1.5 mt-0.5">
                        <span className="text-[10px] font-mono text-[#132333]/60">
                          {productCount} items
                        </span>
                        <span>&bull;</span>
                        <span
                          className={`text-[9px] font-mono font-bold px-1 py-0.2 rounded border transition-colors duration-200 ${
                            isHidden
                              ? "text-amber-800 bg-amber-100/70 border-amber-200"
                              : "text-emerald-800 bg-emerald-100/70 border-emerald-200"
                          }`}
                        >
                          {isHidden ? "HIDDEN" : "LIVE"}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Actions Column: Edit & Hide/Unhide */}
                  <div className="flex flex-col items-end gap-1 flex-shrink-0">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        e.preventDefault();
                        handleOpenEditCategory(cat);
                      }}
                      title="Edit Category Details & Banner"
                      className="px-2 py-0.5 text-[9px] font-mono font-bold uppercase rounded-[2px] bg-white hover:bg-[#A77C3A] hover:text-white text-[#071522] border border-[#132333]/15 transition-all duration-150 active:scale-95 flex items-center gap-1 cursor-pointer shadow-2xs"
                    >
                      <TechnicalIcon name="edit" className="w-2.5 h-2.5" />
                      <span>Edit</span>
                    </button>

                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        e.preventDefault();
                        handleToggleCategoryVisibility(catIdentifier, cat.name, isHidden);
                      }}
                      title={isHidden ? "Unhide category on main website" : "Hide category from main website"}
                      className={`px-2 py-0.5 text-[9px] font-mono font-bold uppercase rounded-[2px] transition-all duration-150 ease-out active:scale-95 flex items-center gap-1 cursor-pointer select-none ${
                        isHidden
                          ? "bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs"
                          : "bg-amber-100 hover:bg-amber-200 text-amber-900 border border-amber-300"
                      }`}
                    >
                      <TechnicalIcon
                        name={isHidden ? "eye" : "eye-off"}
                        className="w-2.5 h-2.5 transition-transform duration-150"
                      />
                      <span>{isHidden ? "Unhide" : "Hide"}</span>
                    </button>
                  </div>
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
                className={`px-2.5 py-1 rounded-[2px] font-mono uppercase text-[11px] transition-colors cursor-pointer ${selectedCategory === "all"
                  ? "bg-[#071522] text-[#A77C3A] font-bold"
                  : "bg-[#FAF9F6] text-[#68717A] hover:text-[#071522] border border-[#132333]/10"
                  }`}
              >
                All ({totalCount || products.length})
              </button>

              {(categories.length > 0 ? categories : CATEGORIES).map((cat) => {
                const catIdentifier = cat.id || cat._id;
                const count = cat.count !== undefined ? cat.count : products.filter((p) => matchCategory(p, catIdentifier)).length;
                const isSelected = selectedCategory === catIdentifier;
                const isHidden = Boolean(cat.isHidden);
                return (
                  <button
                    key={catIdentifier}
                    type="button"
                    onClick={() => setSelectedCategory(isSelected ? "all" : catIdentifier)}
                    className={`px-2.5 py-1 rounded-[2px] font-mono uppercase text-[11px] transition-colors cursor-pointer flex items-center gap-1.5 ${
                      isSelected
                        ? "bg-[#071522] text-[#A77C3A] font-bold"
                        : isHidden
                        ? "bg-amber-50 text-amber-900 border border-amber-300 hover:border-amber-400"
                        : "bg-[#FAF9F6] text-[#68717A] hover:text-[#071522] border border-[#132333]/10"
                    }`}
                  >
                    <span>{cat.name}</span>
                    <span className="opacity-70">({count})</span>
                    {isHidden && (
                      <span className="text-[9px] text-amber-700 font-bold ml-0.5">
                        [HIDDEN]
                      </span>
                    )}
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
                  className={`p-1.5 cursor-pointer ${viewMode === "table"
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
                  className={`p-1.5 cursor-pointer ${viewMode === "cards"
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
            <div className="w-6 h-6 border-2 border-[#A77C3A] border-t-transparent rounded-full animate-spin mx-auto mb-2" />
            Loading product registry...
          </div>
        ) : viewMode === "table" ? (
          <ProductTable
            products={products}
            categories={categories}
            onEdit={handleOpenEdit}
            onDelete={handleOpenDelete}
            onToggleVisibility={handleToggleProductVisibility}
          />
        ) : (
          <ProductCardGrid
            products={products}
            categories={categories}
            onEdit={handleOpenEdit}
            onDelete={handleOpenDelete}
            onToggleVisibility={handleToggleProductVisibility}
          />
        )}

        {/* 3B. Infinite On-Scroll Sentinel & Status Indicator */}
        {!isLoading && (
          <div ref={sentinelRef} className="py-6 flex flex-col items-center justify-center gap-2 select-none">
            {isLoadingMore && (
              <div className="flex items-center gap-2.5 px-4 py-2 bg-white border border-[#132333]/15 rounded-[3px] shadow-xs text-xs font-mono text-[#A77C3A]">
                <div className="w-3.5 h-3.5 border-2 border-[#A77C3A] border-t-transparent rounded-full animate-spin" />
                <span>Loading more components...</span>
              </div>
            )}
            {!hasMore && products.length > 0 && (
              <div className="flex items-center gap-2 text-xs font-mono text-[#68717A]/80 py-2">
                <span className="w-1.5 h-1.5 rounded-full bg-[#A77C3A]/60" />
                <span>Showing all {totalCount || products.length} components &bull; End of catalog</span>
                <span className="w-1.5 h-1.5 rounded-full bg-[#A77C3A]/60" />
              </div>
            )}
          </div>
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
        onOpenCreateCategory={handleOpenCreateCategory}
      />

      {/* 4B. Category Manager & Creation/Edit Modal */}
      <CategoryModal
        isOpen={isCategoryModalOpen}
        categoryToEdit={editingCategory}
        categories={categories}
        onCategoryCreated={handleCategoryCreated}
        onCategoryUpdated={handleCategoryUpdated}
        onCategoryDeleted={handleCategoryDeleted}
        onCategoryToggled={handleToggleCategoryVisibility}
        onClose={() => {
          setIsCategoryModalOpen(false);
          setEditingCategory(null);
        }}
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

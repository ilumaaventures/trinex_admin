import { buildDefaultSeo } from "./seoService";

const rawApiUrl = (import.meta.env?.VITE_API_URL || "").trim().replace(/\/+$/, "");
export const API_BASE = rawApiUrl
  ? rawApiUrl.endsWith("/api")
    ? rawApiUrl
    : `${rawApiUrl}/api`
  : (import.meta.env?.DEV ? "/api" : "https://trinex-be.onrender.com/api");
const LOCAL_STORAGE_KEY = "trinex_inventory_products_v1";
const AUTH_TOKEN_KEY = "trinex_admin_token";
const AUTH_USER_KEY = "trinex_admin_user";

export function getAuthToken() {
  try {
    return (
      localStorage.getItem(AUTH_TOKEN_KEY) ||
      sessionStorage.getItem(AUTH_TOKEN_KEY) ||
      ""
    );
  } catch {
    return "";
  }
}

export function getCurrentUser() {
  try {
    const raw =
      localStorage.getItem(AUTH_USER_KEY) ||
      sessionStorage.getItem(AUTH_USER_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function setAuthSession(token, user, rememberMe = true) {
  try {
    if (rememberMe) {
      localStorage.setItem(AUTH_TOKEN_KEY, token);
      localStorage.setItem(AUTH_USER_KEY, JSON.stringify(user));
      sessionStorage.removeItem(AUTH_TOKEN_KEY);
      sessionStorage.removeItem(AUTH_USER_KEY);
    } else {
      sessionStorage.setItem(AUTH_TOKEN_KEY, token);
      sessionStorage.setItem(AUTH_USER_KEY, JSON.stringify(user));
      localStorage.removeItem(AUTH_TOKEN_KEY);
      localStorage.removeItem(AUTH_USER_KEY);
    }
  } catch (err) {
    console.warn("Storage write failed for auth session:", err);
  }
}

export function clearAuthSession() {
  try {
    localStorage.removeItem(AUTH_TOKEN_KEY);
    localStorage.removeItem(AUTH_USER_KEY);
    sessionStorage.removeItem(AUTH_TOKEN_KEY);
    sessionStorage.removeItem(AUTH_USER_KEY);
  } catch (err) {
    console.warn("Storage clear failed for auth session:", err);
  }
}

function getAuthHeaders(extra = {}) {
  const token = getAuthToken();
  const headers = { ...extra };
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }
  return headers;
}

const INITIAL_SEED_PRODUCTS = [
  {
    id: 1,
    partNumber: "TPP--95-40-400",
    category: "TRANSFORMER",
    categoryKey: "transformers",
    image: "/assets/products/transformers_chokes.jpg",
    description: "Precision aerospace transformer, high-frequency 400Hz pulse coupling module",
    stock: 2,
    location: "Ready Stock (Delhi)",
    delivery: "Immediate Dispatch",
    compliance: "MIL-STD-883 / ISO 9001",
  },
  {
    id: 2,
    partNumber: "TPP-21-40-400",
    category: "TRANSFORMER",
    categoryKey: "transformers",
    image: "/assets/products/transformers_chokes.jpg",
    description: "Compact military pulse transformer for aerospace electronic subsystems",
    stock: 2,
    location: "Central Stock",
    delivery: "4–7 Days Delivery",
    compliance: "MIL-STD-883",
  },
  {
    id: 3,
    partNumber: "249KP1",
    category: "MICRO CIRCUIT",
    categoryKey: "microcircuits",
    image: "/assets/products/microcircuits.jpg",
    description: "Hermetic ceramic multi-channel optoelectronic switch / driver IC",
    stock: 150,
    location: "Ready Stock (Delhi)",
    delivery: "Immediate Dispatch",
    compliance: "MIL-STD-883 Class B",
  },
  {
    id: 4,
    partNumber: "530TV9",
    category: "MICRO CIRCUIT",
    categoryKey: "microcircuits",
    image: "/assets/products/microcircuits.jpg",
    description: "Military-grade ceramic dual JK flip-flop digital logic IC",
    stock: 35,
    location: "Ready Stock (Delhi)",
    delivery: "Immediate Dispatch",
    compliance: "MIL-STD-883",
  },
  {
    id: 5,
    partNumber: "2N2222A",
    category: "TRANSISTOR",
    categoryKey: "transistors-diodes",
    image: "/assets/products/diodes_transistors.jpg",
    description: "High-reliability NPN switching transistor in hermetic metal TO-18 can",
    stock: 500,
    location: "Ready Stock (Delhi)",
    delivery: "Immediate Dispatch",
    compliance: "MIL-PRF-19500",
  },
  {
    id: 6,
    partNumber: "2N3055",
    category: "POWER TRANSISTOR",
    categoryKey: "transistors-diodes",
    image: "/assets/products/diodes_transistors.jpg",
    description: "Complementary silicon high-power audio/linear switching transistor in TO-3 can",
    stock: 120,
    location: "Central Stock",
    delivery: "2–4 Days Delivery",
    compliance: "JANTX Standard",
  },
  {
    id: 7,
    partNumber: "SMR-100K-0.1%",
    category: "RESISTOR",
    categoryKey: "resistors",
    image: "/assets/products/resistors.jpg",
    description: "Ultra-precision metal film resistor, 0.1% tolerance, ultra-low temperature coefficient",
    stock: 850,
    location: "Ready Stock (Delhi)",
    delivery: "Immediate Dispatch",
    compliance: "MIL-PRF-55342",
  },
  {
    id: 8,
    partNumber: "CSR13-100UF-50V",
    category: "CAPACITOR",
    categoryKey: "capacitors",
    image: "/assets/products/capacitors.jpg",
    description: "Hermetically sealed solid tantalum electrolytic capacitor for high-reliability radar circuits",
    stock: 75,
    location: "Ready Stock (Delhi)",
    delivery: "Immediate Dispatch",
    compliance: "MIL-PRF-39003",
  },
  {
    id: 9,
    partNumber: "D38999/20WJ35PN",
    category: "CONNECTOR",
    categoryKey: "connectors",
    image: "/assets/products/connectors.jpg",
    description: "Series III circular receptacle connector, 128-pin gold plated contacts, olive drab cadmium",
    stock: 14,
    location: "Ready Stock (Delhi)",
    delivery: "Immediate Dispatch",
    compliance: "MIL-DTL-38999",
  },
  {
    id: 10,
    partNumber: "D38999/26WJ61SN",
    category: "CONNECTOR",
    categoryKey: "connectors",
    image: "/assets/products/connectors.jpg",
    description: "Hermetic high-density circular plug with EMI ground spring, 61 socket pins",
    stock: 8,
    location: "Central Stock",
    delivery: "3–5 Days Delivery",
    compliance: "MIL-DTL-38999 Series III",
  },
];

const LOCAL_STORAGE_CATEGORIES_KEY = "trinex_inventory_categories_v1";

export const CATEGORIES = [
  {
    id: "transformers",
    name: "TRANSFORMER",
    subtitle: "Transformers, Power Units & Chokes",
    image: "/assets/products/transformers_chokes.jpg",
  },
  {
    id: "resistors",
    name: "RESISTOR",
    subtitle: "Precision & Power Resistors",
    image: "/assets/products/resistors.jpg",
  },
  {
    id: "capacitors",
    name: "CAPACITOR",
    subtitle: "Tantalum, Ceramic & Film",
    image: "/assets/products/capacitors.jpg",
  },
  {
    id: "microcircuits",
    name: "MICRO CIRCUIT",
    subtitle: "Logic & Digital ICs",
    image: "/assets/products/microcircuits.jpg",
  },
  {
    id: "transistors-diodes",
    name: "DIODES & TRANSISTORS",
    subtitle: "Power Transistors & Zener Diodes",
    image: "/assets/products/diodes_transistors.jpg",
  },
  {
    id: "connectors",
    name: "CONNECTOR",
    subtitle: "Mil-Spec Multi-Pin Connectors",
    image: "/assets/products/connectors.jpg",
  },
  {
    id: "motors",
    name: "MOTORS & GENERATORS",
    subtitle: "Precision Servo Motors",
    image: "/assets/products/motors_generators.jpg",
  },
  {
    id: "switches-fuses",
    name: "SWITCHES & FUSES",
    subtitle: "Switches, Fuses & Indicators",
    image: "/assets/products/switches_fuses.jpg",
  },
  {
    id: "demo",
    name: "DEMO",
    subtitle: "Demonstration Components",
    image: "https://res.cloudinary.com/dtzxn6wrm/image/upload/v1793192093/trinix/file_jntkgs.png",
  },
];

/**
 * LocalStorage Fallback Helpers
 */
function getLocalCategories() {
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_CATEGORIES_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    }
  } catch (err) {
    console.warn("LocalStorage categories read failed:", err);
  }

  const seeded = CATEGORIES.map((c) => ({
    id: c.id,
    name: c.name,
    subtitle: c.subtitle || "",
    image: c.image || "/assets/products/transformers_chokes.jpg",
    isHidden: false,
  }));
  try {
    localStorage.setItem(LOCAL_STORAGE_CATEGORIES_KEY, JSON.stringify(seeded));
  } catch {
    // Ignore
  }
  return seeded;
}

function setLocalCategories(categories) {
  try {
    if (Array.isArray(categories) && categories.length > 0) {
      localStorage.setItem(LOCAL_STORAGE_CATEGORIES_KEY, JSON.stringify(categories));
      window.dispatchEvent(new Event("categories-updated"));
      window.dispatchEvent(new Event("storage"));
    }
  } catch (err) {
    console.warn("LocalStorage categories write failed:", err);
  }
}

/**
 * LocalStorage Fallback Helper
 */
function getLocalProducts() {
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed.map((item) => ({
          ...buildDefaultSeo(item),
          ...item,
        }));
      }
    }
  } catch (err) {
    console.warn("LocalStorage read failed:", err);
  }

  const seeded = INITIAL_SEED_PRODUCTS.map((item) => ({
    ...buildDefaultSeo(item),
    ...item,
  }));
  try {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(seeded));
  } catch {
    // Ignore
  }
  return seeded;
}

function setLocalProducts(products) {
  try {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(products));
    window.dispatchEvent(new Event("storage"));
  } catch (err) {
    console.warn("LocalStorage write failed:", err);
  }
}

/**
 * API Service with dual-mode (backend API + localStorage fallback)
 */
export const api = {
  // 1. Fetch Products
  async getProducts() {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 4000);
      const res = await fetch(`${API_BASE}/products?_t=${Date.now()}`, {
        signal: controller.signal,
        headers: { "Cache-Control": "no-cache" },
      });
      clearTimeout(timeoutId);
      if (res.ok) {
        const json = await res.json();
        if (json.success && Array.isArray(json.data) && json.data.length > 0) {
          setLocalProducts(json.data);
          return json.data;
        }
      }
    } catch {
      // Fallback to local
    }
    return getLocalProducts();
  },

  // 2. Create Product
  async createProduct(productData) {
    const seoDecorated = {
      ...buildDefaultSeo(productData),
      ...productData,
      id: Date.now(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    try {
      const res = await fetch(`${API_BASE}/products`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(seoDecorated),
      });
      if (res.ok) {
        const json = await res.json();
        if (json.success) return json.data;
      }
    } catch {
      // Fallback
    }

    const current = getLocalProducts();
    const updated = [seoDecorated, ...current];
    setLocalProducts(updated);
    return seoDecorated;
  },

  // 3. Update Product
  async updateProduct(id, productData) {
    const seoDecorated = {
      ...buildDefaultSeo(productData),
      ...productData,
      id,
      updatedAt: new Date().toISOString(),
    };

    try {
      const res = await fetch(`${API_BASE}/products/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(seoDecorated),
      });
      if (res.ok) {
        const json = await res.json();
        if (json.success) return json.data;
      }
    } catch {
      // Fallback
    }

    const current = getLocalProducts();
    const updated = current.map((p) => (String(p.id) === String(id) ? { ...p, ...seoDecorated } : p));
    setLocalProducts(updated);
    return seoDecorated;
  },

  // 4. Delete Product
  async deleteProduct(id) {
    try {
      const res = await fetch(`${API_BASE}/products/${id}`, { method: "DELETE" });
      if (res.ok) {
        const json = await res.json();
        if (json.success) return true;
      }
    } catch {
      // Fallback
    }

    const current = getLocalProducts();
    const updated = current.filter((p) => String(p.id) !== String(id));
    setLocalProducts(updated);
    return true;
  },

  // 4B. Toggle Product Visibility (Hide / Unhide from main website)
  async toggleProductVisibility(id) {
    try {
      const res = await fetch(`${API_BASE}/products/${id}/visibility`, {
        method: "PATCH",
      });
      if (res.ok) {
        const json = await res.json();
        if (json.success) return json.data;
      }
    } catch {
      // Fallback
    }

    const current = getLocalProducts();
    let updatedProduct = null;
    const updated = current.map((p) => {
      if (String(p.id) === String(id) || String(p._id) === String(id)) {
        updatedProduct = { ...p, isHidden: !p.isHidden };
        return updatedProduct;
      }
      return p;
    });
    setLocalProducts(updated);
    return updatedProduct;
  },

  // 4C. Get Categories
  async getCategories() {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 4000);
      const res = await fetch(`${API_BASE}/categories?_t=${Date.now()}`, {
        signal: controller.signal,
        headers: { "Cache-Control": "no-cache" },
      });
      clearTimeout(timeoutId);
      if (res.ok) {
        const json = await res.json();
        if (json.success && Array.isArray(json.data) && json.data.length > 0) {
          setLocalCategories(json.data);
          return json.data;
        }
      }
    } catch (err) {
      console.warn("Failed to fetch live categories, falling back to local cache:", err.message);
    }
    return getLocalCategories();
  },

  // 4D. Toggle Category Visibility
  async toggleCategoryVisibility(id) {
    if (!id || id === "undefined" || id === "null") {
      throw new Error("Invalid Category ID");
    }
    try {
      const res = await fetch(`${API_BASE}/categories/${encodeURIComponent(id)}/visibility`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
      });
      if (res.ok) {
        const json = await res.json();
        if (json.success && json.data) {
          const current = getLocalCategories();
          const updated = current.map((c) =>
            String(c.id || c._id) === String(id) ? { ...c, isHidden: json.data.isHidden } : c
          );
          setLocalCategories(updated);
          return json.data;
        }
      }
      const errJson = await res.json().catch(() => ({}));
      throw new Error(errJson.message || `Server returned ${res.status}`);
    } catch (err) {
      console.error("Toggle category visibility error:", err);
      throw err;
    }
  },

  // 4E. Create Category
  async createCategory(categoryData) {
    try {
      const res = await fetch(`${API_BASE}/categories`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(categoryData),
      });
      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.message || "Failed to create category");
      }
      const current = getLocalCategories();
      const updated = [...current, json.data];
      setLocalCategories(updated);
      return json.data;
    } catch (err) {
      console.error("Create category error:", err);
      throw err;
    }
  },

  // 4F. Update Category
  async updateCategory(id, categoryData) {
    try {
      const res = await fetch(`${API_BASE}/categories/${encodeURIComponent(id)}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(categoryData),
      });
      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.message || "Failed to update category");
      }
      const current = getLocalCategories();
      const updated = current.map((c) =>
        String(c.id || c._id) === String(id) ? { ...c, ...json.data } : c
      );
      setLocalCategories(updated);
      return json.data;
    } catch (err) {
      console.error("Update category error:", err);
      throw err;
    }
  },

  // 4G. Delete Category
  async deleteCategory(id) {
    try {
      const res = await fetch(`${API_BASE}/categories/${encodeURIComponent(id)}`, {
        method: "DELETE",
      });
      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.message || "Failed to delete category");
      }
      const current = getLocalCategories();
      const updated = current.filter((c) => String(c.id || c._id) !== String(id));
      setLocalCategories(updated);
      return true;
    } catch (err) {
      console.error("Delete category error:", err);
      throw err;
    }
  },

  // 5. Upload Image
  async uploadImage(file) {
    try {
      const formData = new FormData();
      formData.append("image", file);
      const res = await fetch(`${API_BASE}/upload`, {
        method: "POST",
        body: formData,
      });
      if (res.ok) {
        const json = await res.json();
        if (json.success) return json.imageUrl;
      }
    } catch {
      // Fallback to Base64
    }

    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  },

  // 6. Reset Catalog
  async resetCatalog() {
    try {
      const res = await fetch(`${API_BASE}/products/reset`, { method: "POST" });
      if (res.ok) {
        const json = await res.json();
        if (json.success) {
          setLocalProducts(json.data);
          return json.data;
        }
      }
    } catch {
      // Fallback
    }

    const seeded = INITIAL_SEED_PRODUCTS.map((item) => ({
      ...buildDefaultSeo(item),
      ...item,
    }));
    setLocalProducts(seeded);
    return seeded;
  },

  // 7. Authentication Suite
  getAuthToken,
  getCurrentUser,
  isAuthenticated() {
    return Boolean(getAuthToken());
  },

  async login({ emailOrUsername, password, rememberMe = true }) {
    const res = await fetch(`${API_BASE}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ emailOrUsername, password, rememberMe }),
    });
    const json = await res.json().catch(() => ({}));
    if (!res.ok || !json.success) {
      throw new Error(json.message || "Invalid credentials. Access denied.");
    }
    setAuthSession(json.token, json.user, rememberMe);
    window.dispatchEvent(new Event("auth-changed"));
    return json;
  },

  async verifyAuth() {
    const token = getAuthToken();
    if (!token) {
      return { authenticated: false, user: null };
    }
    try {
      const res = await fetch(`${API_BASE}/auth/verify`, {
        method: "GET",
        headers: getAuthHeaders(),
      });
      const json = await res.json().catch(() => ({}));
      if (res.ok && json.success) {
        if (json.user) {
          const isRemembered = Boolean(localStorage.getItem(AUTH_TOKEN_KEY));
          setAuthSession(token, json.user, isRemembered);
        }
        return { authenticated: true, user: json.user || getCurrentUser() };
      } else {
        clearAuthSession();
        window.dispatchEvent(new Event("auth-changed"));
        return { authenticated: false, user: null };
      }
    } catch (err) {
      console.warn("Auth verify network check failed:", err);
      // In offline / network glitch fallback, keep existing session if cached user exists
      const currentUser = getCurrentUser();
      if (currentUser) {
        return { authenticated: true, user: currentUser };
      }
      return { authenticated: false, user: null };
    }
  },

  async logout() {
    const token = getAuthToken();
    try {
      if (token) {
        await fetch(`${API_BASE}/auth/logout`, {
          method: "POST",
          headers: getAuthHeaders(),
        }).catch(() => {});
      }
    } finally {
      clearAuthSession();
      window.dispatchEvent(new Event("auth-changed"));
    }
    return true;
  },
};

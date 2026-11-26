import { buildDefaultSeo } from "./seoService";

/**
 * Environment-Driven API Configuration
 * Resolves the backend API base URL from Vite environment variables (VITE_API_URL).
 * Never hardcodes any remote backend URLs, credentials, or mock datasets.
 */
const rawApiUrl = (
  (typeof import.meta !== "undefined" && import.meta.env?.VITE_API_URL) ||
  ""
).trim().replace(/\/+$/, "");

export const API_BASE = rawApiUrl
  ? rawApiUrl.endsWith("/api")
    ? rawApiUrl
    : `${rawApiUrl}/api`
  : "/api";

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

export function getAuthHeaders(extra = {}) {
  const token = getAuthToken();
  const headers = { ...extra };
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }
  return headers;
}

/**
 * Initial empty categories list (pure backend driven)
 */
export const CATEGORIES = [];

/**
 * Resilient Category Matcher utility
 */
export function matchLocalCategory(product, catId) {
  if (!catId || catId === "all") return true;
  if (!product) return false;
  const cKey = String(catId).trim().toLowerCase();
  const pKey = String(product.categoryKey || "").trim().toLowerCase();
  if (pKey && (pKey === cKey || pKey.replace(/s$/, "") === cKey.replace(/s$/, ""))) return true;
  const pCat = String(product.category || "").trim().toLowerCase();
  if (pCat && (pCat === cKey || pCat.replace(/s$/, "") === cKey.replace(/s$/, ""))) return true;
  const pSlug = String(product.slug || "").toLowerCase();
  if (pSlug.includes(cKey)) return true;
  return false;
}

/**
 * Live API Service connected to the configured Backend
 */
export const api = {
  // 1. Fetch Products
  async getProducts(queryParams = {}) {
    const cleanParams = new URLSearchParams();
    Object.entries(queryParams).forEach(([key, val]) => {
      if (val !== undefined && val !== null && val !== "" && val !== "all") {
        cleanParams.append(key, val);
      }
    });
    cleanParams.append("_t", String(Date.now()));

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000);
      const res = await fetch(`${API_BASE}/products?${cleanParams.toString()}`, {
        signal: controller.signal,
        headers: getAuthHeaders({ "Cache-Control": "no-cache" }),
      });
      clearTimeout(timeoutId);
      if (res.status === 401) {
        clearAuthSession();
        window.dispatchEvent(new Event("auth-changed"));
      } else if (res.ok) {
        const json = await res.json();
        if (json.success && Array.isArray(json.data)) {
          const list = json.data;
          list.pagination = json.pagination || null;
          return list;
        }
      }
    } catch (err) {
      console.warn("[API] getProducts network error:", err.message);
    }
    const emptyList = [];
    emptyList.pagination = null;
    return emptyList;
  },

  // 1B. Fetch Single Product
  async getProductById(id) {
    try {
      const res = await fetch(`${API_BASE}/products/${encodeURIComponent(id)}`, {
        headers: getAuthHeaders({ "Cache-Control": "no-cache" }),
      });
      if (res.ok) {
        const json = await res.json();
        if (json.success && json.data) return json.data;
      }
    } catch (err) {
      console.warn("[API] getProductById error:", err.message);
    }
    return null;
  },

  // 2. Create Product
  async createProduct(productData) {
    const seoDecorated = {
      ...buildDefaultSeo(productData),
      ...productData,
    };

    const res = await fetch(`${API_BASE}/products`, {
      method: "POST",
      headers: getAuthHeaders({ "Content-Type": "application/json" }),
      body: JSON.stringify(seoDecorated),
    });
    const json = await res.json().catch(() => ({}));
    if (!res.ok || !json.success) {
      throw new Error(json.message || "Failed to create product");
    }
    return json.data;
  },

  // 3. Update Product
  async updateProduct(id, productData) {
    const seoDecorated = {
      ...buildDefaultSeo(productData),
      ...productData,
    };

    const res = await fetch(`${API_BASE}/products/${encodeURIComponent(id)}`, {
      method: "PUT",
      headers: getAuthHeaders({ "Content-Type": "application/json" }),
      body: JSON.stringify(seoDecorated),
    });
    const json = await res.json().catch(() => ({}));
    if (!res.ok || !json.success) {
      throw new Error(json.message || "Failed to update product");
    }
    return json.data;
  },

  // 4. Delete Product
  async deleteProduct(id) {
    const res = await fetch(`${API_BASE}/products/${encodeURIComponent(id)}`, {
      method: "DELETE",
      headers: getAuthHeaders(),
    });
    const json = await res.json().catch(() => ({}));
    if (!res.ok || !json.success) {
      throw new Error(json.message || "Failed to delete product");
    }
    return true;
  },

  // 4B. Toggle Product Visibility
  async toggleProductVisibility(id) {
    if (!id || id === "undefined" || id === "null") {
      throw new Error("Valid Product ID is required");
    }
    const res = await fetch(`${API_BASE}/products/${encodeURIComponent(id)}/visibility`, {
      method: "PATCH",
      headers: getAuthHeaders(),
    });
    const json = await res.json().catch(() => ({}));
    if (!res.ok || !json.success) {
      throw new Error(json.message || "Failed to toggle product visibility");
    }
    return json.data;
  },

  // 4C. Get Categories
  async getCategories() {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000);
      const res = await fetch(`${API_BASE}/categories?_t=${Date.now()}`, {
        signal: controller.signal,
        headers: getAuthHeaders({ "Cache-Control": "no-cache" }),
      });
      clearTimeout(timeoutId);
      if (res.status === 401) {
        clearAuthSession();
        window.dispatchEvent(new Event("auth-changed"));
      } else if (res.ok) {
        const json = await res.json();
        if (json.success && Array.isArray(json.data)) {
          return json.data;
        }
      }
    } catch (err) {
      console.warn("[API] getCategories network error:", err.message);
    }
    return [];
  },

  // 4D. Toggle Category Visibility
  async toggleCategoryVisibility(id) {
    if (!id || id === "undefined" || id === "null") {
      throw new Error("Invalid Category ID");
    }
    const res = await fetch(`${API_BASE}/categories/${encodeURIComponent(id)}/visibility`, {
      method: "PATCH",
      headers: getAuthHeaders({ "Content-Type": "application/json" }),
    });
    const json = await res.json().catch(() => ({}));
    if (!res.ok || !json.success) {
      throw new Error(json.message || "Failed to toggle category visibility");
    }
    return json.data;
  },

  // 4E. Create Category
  async createCategory(categoryData) {
    const res = await fetch(`${API_BASE}/categories`, {
      method: "POST",
      headers: getAuthHeaders({ "Content-Type": "application/json" }),
      body: JSON.stringify(categoryData),
    });
    const json = await res.json().catch(() => ({}));
    if (!res.ok || !json.success) {
      throw new Error(json.message || "Failed to create category");
    }
    return json.data;
  },

  // 4F. Update Category
  async updateCategory(id, categoryData) {
    const res = await fetch(`${API_BASE}/categories/${encodeURIComponent(id)}`, {
      method: "PUT",
      headers: getAuthHeaders({ "Content-Type": "application/json" }),
      body: JSON.stringify(categoryData),
    });
    const json = await res.json().catch(() => ({}));
    if (!res.ok || !json.success) {
      throw new Error(json.message || "Failed to update category");
    }
    return json.data;
  },

  // 4G. Delete Category
  async deleteCategory(id) {
    const res = await fetch(`${API_BASE}/categories/${encodeURIComponent(id)}`, {
      method: "DELETE",
      headers: getAuthHeaders(),
    });
    const json = await res.json().catch(() => ({}));
    if (!res.ok || !json.success) {
      throw new Error(json.message || "Failed to delete category");
    }
    return true;
  },

  // 5. Upload Image
  async uploadImage(file) {
    const formData = new FormData();
    formData.append("image", file);
    const res = await fetch(`${API_BASE}/upload`, {
      method: "POST",
      headers: getAuthHeaders(),
      body: formData,
    });
    const json = await res.json().catch(() => ({}));
    if (!res.ok || !json.success || !json.imageUrl) {
      throw new Error(json.message || "Failed to upload image to server");
    }
    return json.imageUrl;
  },

  // 6. Reset Catalog
  async resetCatalog() {
    const res = await fetch(`${API_BASE}/products/reset`, {
      method: "POST",
      headers: getAuthHeaders(),
    });
    const json = await res.json().catch(() => ({}));
    if (!res.ok || !json.success) {
      throw new Error(json.message || "Failed to reset catalog");
    }
    return json.data;
  },

  // 7. Authentication Suite
  getAuthToken,
  getCurrentUser,
  isAuthenticated() {
    return Boolean(getAuthToken());
  },

  async login({ emailOrUsername, password, rememberMe = true }) {
    const normId = String(emailOrUsername || "").trim();
    const normPw = String(password || "");

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 15000);
    try {
      const res = await fetch(`${API_BASE}/auth/login`, {
        signal: controller.signal,
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ emailOrUsername: normId, password: normPw, rememberMe }),
      });
      clearTimeout(timeoutId);
      const json = await res.json().catch(() => ({}));
      if (!res.ok || !json.success) {
        throw new Error(json.message || "Invalid credentials. Access denied.");
      }
      setAuthSession(json.token, json.user, rememberMe);
      window.dispatchEvent(new Event("auth-changed"));
      return json;
    } catch (err) {
      clearTimeout(timeoutId);
      if (err.name === "AbortError") {
        throw new Error("Login request timed out. Please check your network connection.");
      }
      throw err;
    }
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
      console.warn("Auth verify network check failed:", err.message);
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

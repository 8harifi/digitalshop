import axios from "axios";

export const API_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api";

const ACCESS_KEY = "kh_access";
const REFRESH_KEY = "kh_refresh";

export const tokenStore = {
  get access(): string | null {
    if (typeof window === "undefined") return null;
    return window.localStorage.getItem(ACCESS_KEY);
  },
  get refresh(): string | null {
    if (typeof window === "undefined") return null;
    return window.localStorage.getItem(REFRESH_KEY);
  },
  set(access: string, refresh?: string | null) {
    if (typeof window === "undefined") return;
    window.localStorage.setItem(ACCESS_KEY, access);
    if (refresh) window.localStorage.setItem(REFRESH_KEY, refresh);
  },
  clear() {
    if (typeof window === "undefined") return;
    window.localStorage.removeItem(ACCESS_KEY);
    window.localStorage.removeItem(REFRESH_KEY);
  },
};

const api = axios.create({ baseURL: API_URL });

api.interceptors.request.use((config) => {
  const token = tokenStore.access;
  if (token) config.headers.Authorization = `Bearer ${token}`;
  if (typeof document !== "undefined" && document.documentElement.lang) {
    config.headers["Accept-Language"] = document.documentElement.lang;
  }
  return config;
});

let refreshPromise: Promise<string> | null = null;

async function refreshAccessToken(): Promise<string> {
  const { data } = await axios.post(`${API_URL}/token/refresh/`, {
    refresh: tokenStore.refresh,
  });
  tokenStore.set(data.access, data.refresh ?? null);
  return data.access;
}

function onUnauthorized() {
  tokenStore.clear();
  if (typeof window !== "undefined") {
    window.dispatchEvent(new Event("kh-unauthorized"));
  }
}

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const original = error.config;
    const status = error.response?.status;
    if (status === 401 && original && !original._retry) {
      original._retry = true;
      if (!tokenStore.refresh) {
        onUnauthorized();
        return Promise.reject(error);
      }
      try {
        // Share one refresh across concurrent 401s and persist a rotated token.
        refreshPromise = refreshPromise ?? refreshAccessToken();
        const access = await refreshPromise;
        refreshPromise = null;
        original.headers.Authorization = `Bearer ${access}`;
        return api(original);
      } catch {
        refreshPromise = null;
        onUnauthorized();
      }
    }
    return Promise.reject(error);
  },
);

export default api;

// DRF may return either a bare array or a paginated { results } envelope.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const unwrapList = (data: any): any[] =>
  Array.isArray(data) ? data : (data?.results ?? []);

/* ---------------------------------- Public --------------------------------- */

export const getCarpets = async (params: Record<string, unknown> = {}) => {
  const response = await api.get("/products/", { params });
  return unwrapList(response.data);
};

export const getCarpet = async (slug: string) => {
  const response = await api.get(`/products/by-slug/${slug}/`);
  return response.data;
};

export const getProduct = async (id: number | string) => {
  const response = await api.get(`/products/${id}/`);
  return response.data;
};

export const getCategories = async () => {
  const response = await api.get("/categories/");
  return unwrapList(response.data);
};

export const submitInquiry = async (data: Record<string, unknown>) => {
  const response = await api.post("/inquiry/", data);
  return response.data;
};

/* ------------------------------- Auth / stats ------------------------------ */

export const getStats = async () => {
  const response = await api.get("/stats/");
  return response.data;
};

/* -------------------------------- Products -------------------------------- */

export const createProduct = async (data: Record<string, unknown>) => {
  const response = await api.post("/products/", data);
  return response.data;
};

export const updateProduct = async (
  id: number | string,
  data: Record<string, unknown>,
) => {
  const response = await api.put(`/products/${id}/`, data);
  return response.data;
};

export const deleteProduct = async (id: number | string) => {
  await api.delete(`/products/${id}/`);
};

export const uploadCarpetImage = async (
  productId: number | string,
  file: File,
  isPrimary = false,
) => {
  const form = new FormData();
  form.append("image", file);
  form.append("is_primary", String(isPrimary));
  const response = await api.post(`/products/${productId}/images/`, form);
  return response.data;
};

export const setPrimaryImage = async (imageId: number | string) => {
  const response = await api.patch(`/carpet-images/${imageId}/`, {
    is_primary: true,
  });
  return response.data;
};

export const deleteCarpetImage = async (imageId: number | string) => {
  await api.delete(`/carpet-images/${imageId}/`);
};

/* ------------------------------- Categories ------------------------------- */

export const createCategory = async (data: Record<string, unknown>) => {
  const response = await api.post("/categories/", data);
  return response.data;
};

export const updateCategory = async (
  id: number | string,
  data: Record<string, unknown>,
) => {
  const response = await api.put(`/categories/${id}/`, data);
  return response.data;
};

export const deleteCategory = async (id: number | string) => {
  await api.delete(`/categories/${id}/`);
};

/* -------------------------------- Inquiries ------------------------------- */

export const getInquiries = async (params: Record<string, unknown> = {}) => {
  const response = await api.get("/inquiry/", { params });
  return unwrapList(response.data);
};

export const deleteInquiry = async (id: number | string) => {
  await api.delete(`/inquiry/${id}/`);
};

/* ---------------------------------- Users --------------------------------- */

export const getUsers = async (params: Record<string, unknown> = {}) => {
  const response = await api.get("/users/", { params });
  return unwrapList(response.data);
};

export const createUser = async (data: Record<string, unknown>) => {
  const response = await api.post("/users/", data);
  return response.data;
};

export const updateUser = async (
  id: number | string,
  data: Record<string, unknown>,
) => {
  const response = await api.patch(`/users/${id}/`, data);
  return response.data;
};

export const deleteUser = async (id: number | string) => {
  await api.delete(`/users/${id}/`);
};

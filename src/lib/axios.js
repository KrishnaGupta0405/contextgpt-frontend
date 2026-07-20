import axios from "axios";

// Create an axios instance
const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_BACKEND_API_URL,
  withCredentials: true,
});

// ── Logout callback (set by AuthContext so interceptor can trigger logout) ──
let _logoutCallback = null;

export function registerLogoutCallback(fn) {
  _logoutCallback = fn;
}

function triggerLogout() {
  if (_logoutCallback) _logoutCallback();
}

// ── Refresh-token queue ─────────────────────────────────────────────────────
// Prevents multiple concurrent refresh requests when several API calls fail
// at the same time with 401.
let isRefreshing = false;
let failedQueue = []; // { resolve, reject } promises waiting for the refresh

function processQueue(error, token = null) {
  failedQueue.forEach(({ resolve, reject }) => {
    if (error) reject(error);
    else resolve(token);
  });
  failedQueue = [];
}

// ── Request interceptor ─────────────────────────────────────────────────────
api.interceptors.request.use(
  (config) => {
    console.log(
      `%c[Axios Request] ${config.method?.toUpperCase()} ${config.baseURL ?? ""}${config.url}`,
      "color: #4fc3f7; font-weight: bold;",
      {
        params: config.params,
        data: config.data,
        headers: config.headers,
      },
    );
    return config;
  },
  (error) => Promise.reject(error),
);

// Notify useToolUsage hook whenever a tool API call settles
function notifyToolUsageChanged(url) {
  if (typeof window !== "undefined" && url?.includes("/api/v1/tools/") && !url?.includes("/usage-remaining")) {
    window.dispatchEvent(new Event("tool-usage-changed"));
  }
}

// ── Response interceptor ────────────────────────────────────────────────────
api.interceptors.response.use(
  (response) => {
    notifyToolUsageChanged(response.config?.url);
    return response;
  },
  async (error) => {
    const originalRequest = error.config;

    // For any tool endpoint error (including 429, cancellation, network errors),
    // notify the usage hook to refetch — the middleware already inserted a DB row
    // before the controller ran, so the count may have changed regardless of outcome.
    notifyToolUsageChanged(originalRequest?.url);

    // Only handle 401 errors, skip if this is already a retry or an auth request
    // Also skip endpoints that are intentionally called without auth (e.g. pricing page
    // checks subscription silently — a 401 there should not trigger a logout redirect)
    if (
      error.response?.status !== 401 ||
      originalRequest._retry ||
      originalRequest.url === "/auth/refresh-token" ||
      originalRequest.url === "/auth/login" ||
      originalRequest.url === "/auth/logout" ||
      originalRequest.url === "/auth/google/one-tap" ||
      originalRequest.url === "/users/current-user" ||
      originalRequest.url === "/billing/subscription/current"
    ) {
      return Promise.reject(error);
    }

    // If a refresh is already in progress, queue this request
    if (isRefreshing) {
      return new Promise((resolve, reject) => {
        failedQueue.push({ resolve, reject });
      })
        .then(() => {
          // Retry the original request (cookies are updated automatically)
          return api(originalRequest);
        })
        .catch((err) => Promise.reject(err));
    }

    // Attempt to refresh the token
    originalRequest._retry = true;
    isRefreshing = true;

    try {
      await api.post("/auth/refresh-token");
      // Refresh succeeded — cookies are now updated by the browser
      processQueue(null);
      // Retry the original request
      return api(originalRequest);
    } catch (refreshError) {
      // Refresh token is also invalid/expired → force logout
      processQueue(refreshError);
      triggerLogout();
      return Promise.reject(refreshError);
    } finally {
      isRefreshing = false;
    }
  },
);

export default api;

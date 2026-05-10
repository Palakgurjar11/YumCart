import axios from 'axios';
import toast from 'react-hot-toast';

let interceptorsInstalled = false;

/** Axios instance — dev uses relative /api proxied by Vite */
const api = axios.create({
  baseURL:
    `${(import.meta.env.VITE_API_URL || '').replace(/\/$/, '')}/api`,
  headers: {
    'Content-Type': 'application/json',
  },
});

/** Attach JWT from browser storage — replace with HttpOnly cookie flow for hardened prod */
export function attachAuthInterceptors(getToken, onUnauthorized) {
  if (interceptorsInstalled) return;
  interceptorsInstalled = true;

  api.interceptors.request.use((config) => {
    const t = getToken();
    if (t) config.headers.Authorization = `Bearer ${t}`;
    return config;
  });

  api.interceptors.response.use(
    (r) => r,
    (err) => {
      const msg =
        err.response?.data?.message ||
        err.message ||
        'Something went wrong. Please try again.';
      if (
        err.response?.status === 401 &&
        onUnauthorized &&
        err.config?.skipAuthLogout !== true
      )
        onUnauthorized();
      if (msg && err.config?.skipErrorToast !== true) {
        toast.error(Array.isArray(msg) ? msg[0] : msg);
      }
      return Promise.reject(err);
    }
  );
}

export default api;

/** Build absolute URLs for uploads when VITE_API_URL is set (production deployments). */

const API_BASE =
  typeof import.meta !== 'undefined'
    ? (import.meta.env.VITE_API_URL || '').replace(/\/$/, '')
    : '';

export function assetUrl(path) {
  if (!path) return '';
  if (path.startsWith('http://') || path.startsWith('https://')) return path;
  return `${API_BASE}${path}`;
}

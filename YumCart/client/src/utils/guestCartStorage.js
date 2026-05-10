/** Local fallback cart for guests — merged into MongoDB cart after login */
const STORAGE_KEY = 'yumcart_guest_cart_v1';

export function loadGuestCart() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function saveGuestCart(items) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
}

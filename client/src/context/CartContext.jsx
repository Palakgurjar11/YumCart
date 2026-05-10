import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import api from '../api/client.js';
import { loadGuestCart, saveGuestCart } from '../utils/guestCartStorage.js';
import { useAuth } from './AuthContext.jsx';

const CartContext = createContext(null);

/**
 * Bridges guest localStorage carts with Mongo-backed carts for signed-in diners.
 */
export function CartProvider({ children }) {
  const { token } = useAuth();

  /** null when logged-out or errored fetch */
  const [remoteCart, setRemoteCart] = useState(null);
  const [guestItems, setGuestItems] = useState(() => loadGuestCart());

  const persistGuests = useCallback((next) => {
    setGuestItems(next);
    saveGuestCart(next);
  }, []);

  useEffect(() => {
    /** Logged-out: surface whatever is cached locally */
    if (!token) {
      setRemoteCart(null);
      setGuestItems(loadGuestCart());
      return undefined;
    }

    let disposed = false;

    /** Hydrate authoritative cart whenever JWT changes accounts */
    async function hydrate() {
      try {
        /**
         * React Strict Mode re-runs effects in dev — clearing guest stash synchronously
         * AFTER snapshotting avoids double merges. Restore on merge failure keeps UX honest.
         */
        const claimedGuestStash = loadGuestCart();

        if (claimedGuestStash.length) {
          saveGuestCart([]);
          setGuestItems([]);
          try {
            await api.post(
              '/cart/merge',
              {
                items: claimedGuestStash.map(({ foodId, quantity }) => ({
                  foodId,
                  quantity,
                })),
              },
              { skipErrorToast: true }
            );
          } catch {
            saveGuestCart(claimedGuestStash);
            persistGuests(claimedGuestStash);
          }
        }

        const { data } = await api.get('/cart');
        if (!disposed) {
          setRemoteCart(data.cart);
          setGuestItems([]);
        }
      } catch {
        if (!disposed) setRemoteCart(null);
      }
    }

    hydrate();
    return () => {
      disposed = true;
    };
  }, [token, persistGuests]);

  const addToCart = useCallback(
    async (food, qty = 1) => {
      if (!food?._id) return;

      const bump = typeof qty === 'number' && qty > 0 ? qty : 1;

      if (!token) {
        persistGuests(addGuestLine(loadGuestCart(), food, bump));
        return;
      }

      try {
        const { data } = await api.post('/cart/items', { foodId: food._id, quantity: bump });
        setRemoteCart(data.cart);
      } catch (_err) {
        void _err;
      }
    },
    [persistGuests, token]
  );

  const setQty = useCallback(
    async (foodId, quantity) => {
      const q = Math.max(1, Math.min(99, quantity));
      if (!token) {
        persistGuests(loadGuestCart().map((row) =>
          row.foodId === foodId ? { ...row, quantity: q } : row
        ));
        return;
      }

      try {
        const { data } = await api.patch(`/cart/items/${foodId}`, { quantity: q });
        setRemoteCart(data.cart);
      } catch (_err) {
        void _err;
      }
    },
    [persistGuests, token]
  );

  const removeLine = useCallback(
    async (foodId) => {
      if (!token) {
        persistGuests(loadGuestCart().filter((row) => row.foodId !== foodId));
        return;
      }

      try {
        const { data } = await api.delete(`/cart/items/${foodId}`);
        setRemoteCart(data.cart);
      } catch (_err) {
        void _err;
      }
    },
    [persistGuests, token]
  );

  const cartCount = useMemo(() => {
    if (!token)
      return guestItems.reduce((sum, row) => sum + Number(row.quantity || 0), 0);
    if (!remoteCart?.items) return 0;
    return remoteCart.items.reduce((sum, row) => sum + Number(row.quantity || 0), 0);
  }, [guestItems, remoteCart?.items, token]);

  /** Subtotal for cart UI summaries */
  const subtotal = useMemo(() => {
    if (!token) {
      return guestItems.reduce(
        (sum, row) => sum + Number(row.preview?.price || 0) * Number(row.quantity || 0),
        0
      );
    }
    return (remoteCart?.items || []).reduce((sum, row) => {
      const price =
        typeof row.priceAtAdd === 'number'
          ? row.priceAtAdd
          : typeof row?.food?.price === 'number'
            ? row.food.price
            : 0;
      return sum + price * Number(row.quantity || 0);
    }, 0);
  }, [guestItems, remoteCart?.items, token]);

  const refreshRemoteCart = useCallback(async () => {
    if (!token) return;
    const { data } = await api.get('/cart');
    setRemoteCart(data.cart);
  }, [token]);

  const value = useMemo(
    () => ({
      guestItems,
      remoteCart,
      cartCount,
      subtotal,
      addToCart,
      setQty,
      removeLine,
      refreshRemoteCart,
    }),
    [addToCart, cartCount, guestItems, refreshRemoteCart, remoteCart, removeLine, setQty, subtotal]
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

function addGuestLine(list, food, bump = 1) {
  const next = [...list];
  const idx = next.findIndex((row) => row.foodId === food._id);
  if (idx >= 0) {
    next[idx] = {
      ...next[idx],
      quantity: next[idx].quantity + bump,
      preview: {
        name: food.name,
        price: food.price,
        image: food.image,
        category: food.category,
        rating: food.rating,
      },
    };
  } else {
    next.push({
      foodId: food._id,
      quantity: bump,
      preview: {
        name: food.name,
        price: food.price,
        image: food.image,
        category: food.category,
        rating: food.rating,
      },
    });
  }
  return next;
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart requires CartProvider');
  return ctx;
}

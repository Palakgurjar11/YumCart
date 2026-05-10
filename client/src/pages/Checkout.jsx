import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

import api from '../api/client.js';
import { useCart } from '../context/CartContext.jsx';
import { useAuth } from '../context/AuthContext.jsx';

/** Checkout summarizes cart lines + persists `/orders` documents */
export default function Checkout() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { remoteCart, subtotal, refreshRemoteCart } = useCart();

  const [address, setAddress] = useState(user?.address || '');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (user?.address) setAddress((prev) => (prev.trim() ? prev : user.address));
  }, [user?.address]);

  const items = remoteCart?.items || [];
  const total = typeof subtotal === 'number' ? subtotal.toFixed(2) : Number(subtotal || 0).toFixed(2);

  async function placeOrder(evt) {
    evt.preventDefault();

    if (!items.length) {
      toast.error('Cart is empty');
      navigate('/menu');
      return;
    }

    const trimmed = address.trim();
    if (trimmed.length < 14) {
      toast.error('Add a fuller delivery landmark (≥ 14 characters)');
      return;
    }

    setSubmitting(true);
    try {
      await api.post('/orders', { deliveryAddress: trimmed });
      toast.success('Order placed successfully');
      await refreshRemoteCart();
      navigate('/orders');
    } catch (_err) {
      void _err;
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <section className="mx-auto grid max-w-5xl gap-10 lg:grid-cols-[1.15fr,_0.9fr]">
      <header className="space-y-3 lg:col-span-2">
        <h1 className="font-[family-name:var(--font-display)] text-4xl text-white">Checkout</h1>
        <p className="max-w-2xl text-[15px] leading-relaxed text-slate-400">
          Demo flow stops at simulated payment — integrate Razorpay, Stripe, etc., when leveling up beyond portfolio scope.
        </p>
      </header>

      <section className="rounded-[28px] border border-slate-800 bg-slate-900 p-8">
        <h2 className="font-[family-name:var(--font-display)] text-xl text-white sm:text-2xl">Deliver to</h2>
        <form className="mt-8 space-y-6" onSubmit={placeOrder}>
          <label className="flex flex-col gap-2 text-xs font-semibold uppercase tracking-[0.2em] text-orange-400">
            Landmark + tower / gate details
            <textarea
              className="min-h-[160px] rounded-2xl border border-slate-800 bg-slate-950/80 px-4 py-3 text-[15px] font-normal lowercase tracking-normal text-slate-200 outline-none focus:border-orange-600"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              spellCheck={false}
              placeholder="Tower B, YumCart Arcade, MG Road — 411001"
            />
          </label>
          <button
            disabled={submitting}
            type="submit"
            className="w-full rounded-2xl bg-gradient-to-br from-orange-600 to-orange-500 py-4 text-[13px] font-bold uppercase tracking-[0.3em] text-white shadow-lg shadow-orange-900/40 transition hover:brightness-105 disabled:opacity-50"
          >
            {submitting ? 'Placing…' : 'Place order'}
          </button>
          <button
            type="button"
            className="w-full text-xs font-semibold uppercase tracking-[0.2em] text-slate-500 hover:text-orange-400"
            onClick={() => navigate('/cart')}
          >
            Adjust cart ←
          </button>
        </form>
      </section>

      <aside className="rounded-[28px] border border-orange-500/60 bg-gradient-to-br from-orange-950 via-[#431407] to-orange-950 p-8 shadow-xl shadow-orange-900/55">
        <h3 className="font-[family-name:var(--font-display)] text-xl text-white sm:text-2xl">Summary</h3>
        {!items.length && (
          <p className="mt-4 text-sm text-orange-200">Nothing to summarise — redirects usually guard earlier.</p>
        )}
        <ul className="mt-8 space-y-4 text-[15px] text-slate-100">
          {items.map((item) => (
            <li key={item.food?._id || `${item.quantity}-${item.priceAtAdd}`} className="flex justify-between gap-4">
              <span className="truncate">{item.food?.name ?? 'Chef special'}</span>
              <span className="shrink-0 text-orange-200">
                ×{item.quantity} · ₹
                {(item.priceAtAdd ?? item.food?.price ?? 0).toFixed?.(2)}
              </span>
            </li>
          ))}
        </ul>

        <div className="mt-8 flex justify-between border-t border-white/20 pt-6 text-xl text-white">
          <strong>Estimated total</strong>
          <strong className="text-orange-300">₹{total}</strong>
        </div>

        <p className="mt-6 text-[11px] uppercase tracking-[0.22em] text-orange-400">
          Payments mocked as Paid — swap with real gateway callbacks for prod.
        </p>
      </aside>
    </section>
  );
}

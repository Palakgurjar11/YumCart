import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

import { assetUrl } from '../utils/assetUrl.js';
import Spinner from '../components/Spinner.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import { useCart } from '../context/CartContext.jsx';

/** Cart merges guest previews with populated Mongo carts for richer hiring narratives */
export default function Cart() {
  const { isAuthenticated } = useAuth();
  const { guestItems, remoteCart, subtotal, setQty, removeLine } = useCart();
  const navigate = useNavigate();

  const lines =
    !isAuthenticated
      ? guestItems.map((line) => ({
          id: line.foodId,
          name: line.preview?.name,
          img: assetUrl(line.preview?.image),
          category: line.preview?.category,
          rating: line.preview?.rating,
          unit: line.preview?.price,
          qty: line.quantity,
        }))
      : (remoteCart?.items || []).map((line) => ({
          id: line.food?._id ?? line._id,
          name: line.food?.name,
          img: assetUrl(line.food?.image),
          category: line.food?.category,
          rating: line.food?.rating,
          unit:
            typeof line.priceAtAdd === 'number'
              ? line.priceAtAdd
              : typeof line.food?.price === 'number'
                ? line.food.price
                : 0,
          qty: line.quantity,
        }));

  /** Remote cart hydrating after login still shows spinner gracefully */
  if (isAuthenticated && remoteCart === null) {
    return <Spinner className="mx-auto mt-[22vh] h-16 w-16 border-[3px]" />;
  }

  function goCheckoutOrLogin() {
    if (!isAuthenticated) {
      toast.error('Login to proceed with checkout');
      navigate('/login', { state: { from: '/checkout' } });
      return;
    }
    navigate('/checkout');
  }

  const totalDisplay = typeof subtotal === 'number' ? subtotal.toFixed(2) : Number(subtotal || 0).toFixed(2);

  return (
    <section className="space-y-9">
      <header className="flex flex-wrap items-end justify-between gap-6 pb-12">
        <div>
          <h1 className="font-[family-name:var(--font-display)] text-4xl text-white">Cart</h1>
          <p className="mt-4 max-w-xl text-[15px] leading-relaxed text-slate-400">
            YumCart merges guest-session picks into Mongo carts after JWT issuance — helpful when narrating portfolios.
          </p>
        </div>
        <Link
          to="/menu"
          className="text-sm font-semibold uppercase tracking-[0.3em] text-orange-600 hover:text-orange-300"
        >
          ← Back to cravings
        </Link>
      </header>

      {lines.length === 0 ? (
        <div className="rounded-3xl border border-dashed border-orange-950/95 bg-orange-950/25 px-[30px] py-24 text-center shadow-inner shadow-orange-950/40">
          <p className="mb-11 text-4xl" aria-hidden="true">
            👜
          </p>
          <p className="text-2xl font-bold text-orange-950">Your cart awaits inspiration.</p>
          <button
            type="button"
            className="mt-12 rounded-xl border border-orange-500 bg-orange-600 px-14 py-3 font-bold uppercase tracking-[0.35em] text-white shadow-lg shadow-orange-900/35 transition hover:bg-orange-500"
            onClick={() => navigate('/menu')}
          >
            Discover menu
          </button>
        </div>
      ) : (
        <div className="grid gap-10 lg:grid-cols-[1.06fr,_0.6fr]">
          <div className="space-y-5">
            {lines.map((line, idx) => (
              <article
                key={line.id ?? idx}
                className="group flex gap-6 rounded-[32px] border border-slate-800/95 bg-slate-900/93 p-[22px] transition hover:border-orange-500 hover:bg-slate-900"
              >
                <img
                  className="h-28 w-36 shrink-0 rounded-2xl object-cover ring-4 ring-orange-950 transition group-hover:ring-orange-500/60"
                  src={line.img || 'https://via.placeholder.com/400x300'}
                  alt={line.name}
                />
                <div className="flex min-w-0 flex-1 flex-col gap-3">
                  <div className="flex flex-wrap items-start justify-between gap-4">
                    <div className="min-w-0 max-w-xl">
                      <h2 className="font-[family-name:var(--font-display)] text-xl text-white sm:text-2xl">
                        {line.name}
                      </h2>
                      <p className="mt-1 text-xs uppercase tracking-[0.28em] text-orange-950">
                        {line.category} · ★{' '}
                        {typeof line.rating === 'number'
                          ? line.rating.toFixed(1)
                          : line.rating ?? '–'}
                      </p>
                    </div>
                    <p className="text-lg font-semibold text-orange-400">
                      ₹{line.unit ?? 0} <span className="text-[11px] font-normal text-slate-500">each</span>
                    </p>
                  </div>

                  <div className="flex flex-wrap items-center justify-between gap-4">
                    <div className="flex items-center gap-3 rounded-2xl border border-slate-800/95 px-5 py-2 text-lg">
                      <button
                        type="button"
                        aria-label={`Decrease ${line.name}`}
                        className="text-xl transition hover:text-orange-400"
                        onClick={() =>
                          Number(line.qty) > 1
                            ? setQty(line.id, Number(line.qty) - 1)
                            : removeLine(line.id)
                        }
                      >
                        –
                      </button>
                      <span className="w-9 text-center text-base font-semibold">{line.qty}</span>
                      <button
                        type="button"
                        aria-label={`Increase ${line.name}`}
                        className="text-xl transition hover:text-orange-400"
                        onClick={() => setQty(line.id, Number(line.qty) + 1)}
                      >
                        +
                      </button>
                    </div>

                    <button
                      type="button"
                      className="text-[11px] font-bold uppercase tracking-[0.36em] text-red-900 hover:text-red-400"
                      onClick={() => {
                        removeLine(line.id);
                        toast.success(`${line.name} removed`);
                      }}
                    >
                      Remove
                    </button>
                  </div>
                </div>
              </article>
            ))}
          </div>

          <aside className="space-y-6 self-start rounded-[32px] border border-orange-600/95 bg-orange-950/93 p-[30px] text-sm shadow-xl shadow-orange-950/65">
            <header>
              <h3 className="font-[family-name:var(--font-display)] text-2xl text-white">Order recap</h3>
              <p className="mt-3 text-xs uppercase tracking-[0.24em] text-orange-200">
                Taxes illustrative — demo shows ₹0 for clarity.
              </p>
            </header>

            <div className="space-y-4 text-white">
              <div className="flex items-center justify-between text-lg">
                <span className="text-slate-200">Subtotal</span>
                <span className="font-semibold">₹{totalDisplay}</span>
              </div>
              <div className="flex items-center justify-between text-xl">
                <span>Estimated total</span>
                <strong className="text-orange-300">₹{totalDisplay}</strong>
              </div>
              <button
                type="button"
                disabled={lines.length === 0}
                onClick={goCheckoutOrLogin}
                className="w-full rounded-2xl bg-gradient-to-br from-orange-600 to-orange-500 px-6 py-4 text-[13px] font-bold uppercase tracking-[0.3em] text-white shadow-lg shadow-orange-900/55 transition hover:brightness-105 disabled:opacity-55"
              >
                {isAuthenticated ? 'Proceed to Checkout' : 'Login to Checkout'}
              </button>
              {!isAuthenticated && (
                <p className="text-[11px] leading-relaxed text-orange-100/90">
                  Guests can roam freely — persistent carts hydrate after JWT session creation.
                </p>
              )}
            </div>
          </aside>
        </div>
      )}
    </section>
  );
}

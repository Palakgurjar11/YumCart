import { memo } from 'react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { assetUrl } from '../utils/assetUrl.js';
import { useCart } from '../context/CartContext.jsx';

function FoodCardInner({ food }) {
  const { addToCart } = useCart();

  const handleCart = async () => {
    await addToCart(food, 1);
    toast.success(`${food.name} added to cart`, { icon: '🍛' });
  };

  const img = assetUrl(food.image);

  return (
    <article className="group relative flex flex-col overflow-hidden rounded-2xl border border-slate-800/80 bg-slate-900/60 backdrop-blur transition duration-300 hover:-translate-y-1 hover:border-orange-400/35 hover:shadow-[0_20px_50px_-26px_rgba(249,115,22,.55)]">
      <div className="relative h-48 overflow-hidden">
        <Link to={`/menu?id=${food._id}`}>
          <img
            loading="lazy"
            src={img}
            alt={food.name}
            className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
          />
          <span className="pointer-events-none absolute inset-0 bg-gradient-to-t from-slate-950/90 via-transparent to-transparent" />
        </Link>
        <span className="absolute left-3 top-3 rounded-full bg-orange-500/90 px-2.5 py-0.5 text-xs font-semibold shadow-md ring-2 ring-orange-900/70">
          {food.category}
        </span>
        <span className="absolute right-3 top-3 rounded-full bg-slate-950/70 px-2 py-1 text-[11px] font-semibold text-amber-200 ring-1 ring-amber-500/35">
          ⭐ {food.rating?.toFixed?.(1) ?? food.rating}
        </span>
      </div>

      <div className="flex flex-1 flex-col gap-2 p-4">
        <div className="flex items-start justify-between gap-3">
          <Link to={`/menu?id=${food._id}`}>
            <h3 className="font-[family-name:var(--font-display)] text-lg leading-tight text-white transition-colors group-hover:text-orange-300">
              {food.name}
            </h3>
          </Link>
          <span className="shrink-0 rounded-lg bg-orange-600/85 px-2.5 py-1 text-xs font-semibold uppercase tracking-[0.10em] text-white shadow-orange-950/70 ring-2 ring-orange-800/65">
            ₹{food.price}
          </span>
        </div>
        <p className="line-clamp-2 text-sm leading-relaxed text-slate-400">{food.description}</p>
        <div className="mt-auto flex gap-3 pt-1">
          <button
            type="button"
            onClick={handleCart}
            className="relative inline-flex flex-1 items-center justify-center overflow-hidden rounded-xl bg-gradient-to-br from-orange-500 via-orange-600 to-orange-700 px-3 py-2.5 text-sm font-semibold text-white shadow-lg shadow-orange-900/55 transition hover:brightness-[1.05] active:translate-y-px cursor-pointer disabled:cursor-not-allowed disabled:opacity-60"
          >
            <span className="relative z-[1]">Add to Cart</span>
            <span className="pointer-events-none absolute inset-0 opacity-35 mix-blend-screen bg-[radial-gradient(circle_at_20%_0,#fff,_transparent)]" />
          </button>
        </div>
      </div>
    </article>
  );
}

/** Memo avoids expensive re-render when unrelated menu filters change */
export const FoodCard = memo(FoodCardInner);

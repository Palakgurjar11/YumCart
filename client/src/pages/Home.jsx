import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';

import api from '../api/client.js';
import Spinner from '../components/Spinner.jsx';
import { FoodCard } from '../components/FoodCard.jsx';

/** Showcase hero + curated carousel of foods for first impressions */
export default function Home() {
  const [featured, setFeatured] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let canceled = false;
    (async () => {
      try {
        const { data } = await api.get('/foods', { params: { limit: 8, page: 1 }, skipAuthLogout: true });
        if (!canceled && data.success) setFeatured(data.foods ?? []);
      } catch {
        if (!canceled) setFeatured([]);
      } finally {
        if (!canceled) setLoading(false);
      }
    })();
    return () => {
      canceled = true;
    };
  }, []);

  const heroStats = useMemo(
    () => [
      { label: 'Chef curated', value: '120+ cravings' },
      { label: 'Lightning ETA', value: '20–35 mins' },
      { label: 'Trust score', value: '4.7 ★ diners' },
    ],
    []
  );

  return (
    <section className="space-y-20">
      {/* Hero */}
      <div className="relative isolate overflow-hidden rounded-[32px] border border-orange-500/75 bg-[radial-gradient(circle_at_10%_-10%,rgba(251,146,60,.52),transparent_62%),linear-gradient(120deg,#050b17_0%,#101b32_62%,#0d1830_100%)] px-6 py-14 shadow-[0_40px_80px_-50px_rgb(251_146_60_/_0.55)] lg:grid lg:grid-cols-[1.07fr,_0.95fr] lg:gap-12 lg:p-14">
        <div className="relative z-[1] max-w-xl space-y-10">
          <span className="inline-flex rounded-full bg-orange-500/15 px-4 py-[5px] text-[11px] font-bold uppercase tracking-[0.4em] text-orange-400 ring-2 ring-orange-600/52">
            Swiggy / Zomato inspired
          </span>
          <h1 className="font-[family-name:var(--font-display)] text-4xl font-semibold tracking-tighter text-white sm:text-6xl xl:text-[3.72rem]">
            Order bold flavors with a <span className="text-transparent bg-[linear-gradient(120deg,#f97316_5%,#facc15_85%)] bg-clip-text">premium</span> cart experience.
          </h1>
          <p className="leading-relaxed text-slate-300 sm:text-[17px]">
            YumCart is a modern full-stack food ordering platform featuring secure JWT authentication, dynamic cart management, seamless order processing, responsive UI design, and admin dashboard analytics for an enhanced user experience.

          </p>
          <div className="flex flex-wrap items-center gap-4">
            <Link
              to="/menu"
              className="group relative inline-flex cursor-pointer items-center justify-center overflow-hidden rounded-xl bg-gradient-to-br from-orange-600 via-orange-500 to-orange-700 px-[22px] py-3 font-bold text-[15px] uppercase tracking-[0.18em] text-white shadow-xl shadow-orange-600/35 transition hover:brightness-[1.08] hover:shadow-orange-600/55 ring-4 ring-orange-900/92"
            >
              <span className="relative z-[1]">Browse menu</span>
              <span className="pointer-events-none absolute inset-0 opacity-[0.24] bg-[radial-gradient(circle_at_12%_-10%,#fff,_transparent)] group-hover:opacity-40 transition" />
            </Link>

            <Link
              className="inline-flex items-center rounded-xl border border-orange-950/93 bg-transparent px-[22px] py-3 text-[13px] font-semibold uppercase tracking-[0.2em] text-orange-400 transition hover:border-orange-500/93 hover:bg-orange-950/64"
              to="/signup"
            >
              Create account →
            </Link>
          </div>

          <dl className="grid gap-4 sm:grid-cols-3">
            {heroStats.map((chip) => (
              <div
                key={chip.label}
                className="rounded-2xl border border-slate-800/95 bg-black/42 px-5 py-[14px] text-xs text-slate-400 shadow-inner shadow-orange-950/35"
              >
                <dt className="uppercase tracking-[0.22em] text-[11px] text-orange-900/93">{chip.label}</dt>
                <dd className="mt-1 font-[family-name:var(--font-display)] text-lg tracking-tighter text-orange-400">
                  {chip.value}
                </dd>
              </div>
            ))}
          </dl>
        </div>

        <aside className="relative z-[2] mx-auto mt-12 flex w-full max-w-md flex-col gap-9 lg:mt-6">
          {/* Floating cards animation */}
          <div className="relative h-[332px] w-full">
            {[0.75, 0.55].map((op, idx) => (
              <figure
                key={idx}
                className={`absolute flex h-[256px] w-[72%] flex-col rounded-[36px] border border-orange-600/93 bg-orange-950/70 p-7 shadow-xl shadow-orange-600/35 transition-[transform,_opacity,_filter] hover:-rotate-2`}
                style={{
                  top: `${idx === 0 ? 0 : 52}px`,
                  left: `${idx === 0 ? 0 : 78}px`,
                  opacity: `${op}`,
                  backdropFilter: 'blur(34px)',
                }}
              >
                <figcaption className="flex flex-col gap-[10px]">
                  <div className="text-[13px] font-semibold uppercase tracking-[0.42em] text-orange-950/93">Live ETA</div>
                  <span className="font-[family-name:var(--font-display)] text-4xl text-white">{idx === 0 ? '24 min' : '₹379'}</span>
                  <p className="text-xs text-orange-950/93">
                    {idx === 0 ? 'Courier just picked-up your ramen bowl.' : 'Premium sushi combo platter.'}
                  </p>
                </figcaption>
              </figure>
            ))}
            <figure className="absolute bottom-[-16px] right-3 flex aspect-square w-[38%] min-w-[154px] items-center justify-center rounded-[50%] border border-orange-400/93 bg-orange-950/65 text-center text-orange-950/94 shadow-xl shadow-orange-700/35">
              <span className="text-[52px]" aria-hidden="true">
                🍜
              </span>
              <figcaption className="sr-only">Yum emoji highlight</figcaption>
            </figure>
          </div>

          <div className="rounded-3xl border border-slate-800/95 bg-slate-900/73 p-8">
            <h2 className="mb-7 font-[family-name:var(--font-display)] text-2xl text-white">Tonight’s Yum picks</h2>
            {loading ? (
              <Spinner className="h-16 w-16 border-[3px] mx-auto mt-14" />
            ) : featured.length === 0 ? (
              <p className="text-sm text-orange-950/93">Populate Mongo with `npm run seed` 🌱.</p>
            ) : (
              <ul className="space-y-5 text-sm leading-relaxed text-slate-50">
                {featured.slice(0, 5).map((food) => (
                  <li
                    key={food._id}
                    className="flex items-start justify-between gap-4 rounded-2xl border border-slate-800/95 px-5 py-[14px] transition hover:bg-orange-950/93"
                  >
                    <Link to={`/menu?id=${food._id}`}>
                      <p className="font-semibold text-[15px] text-white">{food.name}</p>
                      <p className="text-[12px] text-slate-500">{food.category}</p>
                    </Link>
                    <span className="font-bold text-orange-400">₹{food.price}</span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </aside>
      </div>

      <div className="space-y-6">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div className="max-w-lg">
            <h2 className="font-[family-name:var(--font-display)] text-3xl text-white lg:text-[2.72rem]">Trending YumCart staples</h2>
            <p className="mt-4 text-[15px] leading-relaxed text-slate-400">
              Cards mirror production UI states — loaders, shimmer-friendly borders, badges, gradients, contextual CTAs for hiring managers scrolling your portfolio repo.
            </p>
          </div>
          <Link to="/menu" className="text-sm font-bold uppercase tracking-[0.42em] text-orange-600 hover:text-orange-300">
            See full catalogue →
          </Link>
        </div>

        <div className="grid gap-7 sm:grid-cols-2 xl:grid-cols-4">
          {featured.map((food) => (
            <FoodCard key={food._id} food={food} />
          ))}
        </div>
      </div>
    </section>
  );
}

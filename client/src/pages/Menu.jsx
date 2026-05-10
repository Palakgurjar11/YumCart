import { useCallback, useEffect, useMemo, useState } from 'react';
import { useOutletContext, useSearchParams } from 'react-router-dom';

import api from '../api/client.js';
import Spinner from '../components/Spinner.jsx';
import { FoodCard } from '../components/FoodCard.jsx';

/** Menu aggregates category chips + textual search synced with Navbar query parameters */
export default function Menu() {
  const outlet = useOutletContext();
  const [params, setParams] = useSearchParams();

  const [foods, setFoods] = useState([]);
  const [categories, setCategories] = useState(['All']);
  const [category, setCategory] = useState('All');
  const [loadingCatalogue, setLoadingCatalogue] = useState(false);

  /** Shared text field so Navbar desktop + `/menu` stay in lockstep */
  const searchDraft = outlet?.searchDraft ?? '';
  const updateSearchDraft = outlet?.setSearchDraft;

  const fetchCategories = useCallback(async () => {
    try {
      const { data } = await api.get('/foods/categories', { skipAuthLogout: true });
      const raw = data.success ? data.categories ?? ['All'] : ['All'];
      const unique = [...new Set(raw.includes('All') ? raw.filter((z) => z !== 'All') : raw)].sort();
      setCategories(['All', ...unique]);
    } catch {
      setCategories(['All']);
    }
  }, []);

  const fetchFoods = useCallback(async () => {
    setLoadingCatalogue(true);
    try {
      const qs = { category };
      const trimmed = searchDraft.trim();
      if (trimmed) qs.search = trimmed;

      const { data } = await api.get('/foods', {
        params: qs,
        skipAuthLogout: true,
      });
      setFoods(data.success ? data.foods || [] : []);
    } catch {
      setFoods([]);
    } finally {
      setLoadingCatalogue(false);
    }
  }, [category, searchDraft]);

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  useEffect(() => {
    fetchFoods();
  }, [fetchFoods]);

  /** Highlight deep-linked IDs from homepage “Tonight’s Yum picks” */
  useEffect(() => {
    const id = params.get('id');
    if (id && foods.length) {
      const el = document.getElementById(`food-anchor-${id}`);
      requestAnimationFrame(() => el?.scrollIntoView?.({ behavior: 'smooth', block: 'center' }));
    }
  }, [foods, params]);

  const filteredCount = foods.length;
  const heading = useMemo(() => `Discover ${filteredCount}+ dishes`, [filteredCount]);

  function applyFilters(event) {
    event.preventDefault();
    const trimmed = searchDraft.trim();
    const next = new URLSearchParams();
    if (!trimmed) next.delete('search');
    else next.set('search', trimmed);
    setParams(next.toString(), { replace: true });
  }

  function resetFilters() {
    setCategory('All');
    updateSearchDraft?.('');
    setParams({}, { replace: true });
  }

  return (
    <section className="space-y-8">
      <header className="flex flex-wrap items-start justify-between gap-6 pb-8">
        <div className="max-w-xl">
          <h1 className="font-[family-name:var(--font-display)] text-4xl text-white">{heading}</h1>
          <p className="mt-5 text-[15px] leading-relaxed text-slate-400">
             Built a full-stack food ordering platform with secure authentication, dynamic cart management, real-time order flow, and responsive UI designed for seamless user experience across all devices.
          </p>
          <div className="mt-9 flex gap-7 text-xs uppercase tracking-[0.36em] text-orange-950/93">
            <span>⚡ MERN Stack</span>
            <span>🛒 Cart System</span>
            <span>🔐 JWT Auth</span>
          </div>
        </div>

        <form
          className="relative w-full max-w-md lg:sticky lg:top-28 lg:self-start"
          onSubmit={applyFilters}
        >
          <label htmlFor="menu-search-inline" className="sr-only">
            Search YumCart catalogue
          </label>
          <input
            id="menu-search-inline"
            value={searchDraft}
            onChange={(e) => updateSearchDraft?.(e.target.value)}
            className="w-full rounded-2xl border border-slate-800/95 bg-slate-900/93 py-4 pl-[18px] pr-[120px] text-sm outline-none shadow-inner shadow-orange-950/35 transition hover:border-orange-700/93 focus:border-orange-600 placeholder:text-slate-500"
            placeholder='Try “biryani”, “coffee”, vegan…'
            spellCheck={false}
          />

          <button
            type="submit"
            className="absolute right-2 top-2 bottom-2 rounded-xl bg-orange-700/92 px-[18px] text-[13px] font-bold uppercase tracking-[0.38em] text-white shadow-lg shadow-orange-600/40 transition hover:bg-orange-500"
          >
            Go
          </button>
        </form>
      </header>

      <nav className="flex flex-wrap gap-3 pb-10" aria-label="Category chips">
        {categories.map((c) => (
          <button
            key={c}
            type="button"
            onClick={() => setCategory(c)}
            className={`rounded-full px-6 py-[9px] text-[13px] font-semibold uppercase tracking-[0.08em] transition ${
              c === category
                ? 'bg-gradient-to-br from-orange-700 to-orange-500 text-[15px] text-white shadow-lg shadow-orange-600/40'
                : 'border border-orange-950/92 bg-transparent text-orange-950/93 hover:border-orange-500 hover:bg-orange-950/93'
            }`}
          >
            {c}
          </button>
        ))}
      </nav>

      {loadingCatalogue ? (
        <Spinner className="mx-auto mb-52 mt-52 h-[60px] w-[60px] border-[3px]" />
      ) : foods.length === 0 ? (
        <div className="mx-auto mb-72 mt-52 max-w-md rounded-[32px] border border-orange-950/93 bg-orange-950/24 px-[26px] py-[62px] text-center text-slate-200">
          <span className="text-5xl" aria-hidden="true">
            🛎️
          </span>
          <p className="mt-11 text-[21px] font-bold">No dishes matched that craving.</p>
          <button
            type="button"
            className="mt-10 rounded-2xl border border-orange-500/93 bg-orange-600/93 px-8 py-3 text-orange-950"
            onClick={resetFilters}
          >
            Reset filters ✨
          </button>
        </div>
      ) : (
        <div className="grid gap-8 sm:grid-cols-2 xl:grid-cols-4">
          {foods.map((food) => (
            <div key={food._id} id={`food-anchor-${food._id}`} className="scroll-mt-[110px]">
              <FoodCard food={food} />
            </div>
          ))}
        </div>
      )}
    </section>
  );
}

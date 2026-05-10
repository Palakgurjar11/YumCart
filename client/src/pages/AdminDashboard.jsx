import { useCallback, useEffect, useMemo, useState } from 'react';

import api from '../api/client.js';
import Spinner from '../components/Spinner.jsx';
import { assetUrl } from '../utils/assetUrl.js';

const STATUS_OPTS = ['pending', 'preparing', 'out_for_delivery', 'delivered', 'cancelled'];

function StatusSelect({ value, disabled, onChange }) {
  return (
    <select
      className="rounded-xl border border-slate-700 bg-black px-3 py-2 text-xs font-semibold uppercase tracking-[0.12em] text-white"
      disabled={disabled}
      value={value}
      onChange={(event) => onChange(event.target.value)}
    >
      {STATUS_OPTS.map((status) => (
        <option key={status} value={status}>
          {status.replace(/_/g, ' ')}
        </option>
      ))}
    </select>
  );
}

/** Admin tooling — KPIs, Multer uploads, order routing */
export default function AdminDashboard() {
  const [foods, setFoods] = useState([]);
  const [orders, setOrders] = useState([]);
  const [stats, setStats] = useState(null);
  const [tab, setTab] = useState('foods');

  /** Pull latest Mongo-derived aggregates anytime parent triggers hydrate */
  const [loading, setLoading] = useState(true);

  const [foodForm, setFoodForm] = useState({
    editingId: null,
    name: '',
    description: '',
    price: '',
    category: '',
    rating: '4.5',
    isAvailable: 'true',
  });
  const [imageFile, setImageFile] = useState(null);
  const [mutatingFood, setMutatingFood] = useState(false);

  const hydrate = useCallback(async () => {
    setLoading(true);

    try {
      const [{ data: statsPayload }, { data: foodsPayload }, { data: ordersPayload }] =
        await Promise.all([api.get('/admin/stats'), api.get('/admin/foods'), api.get('/admin/orders')]);

      setStats(statsPayload.success ? statsPayload.stats ?? null : null);

      setFoods(foodsPayload.success ? foodsPayload.foods ?? [] : []);
      setOrders(ordersPayload.success ? ordersPayload.orders ?? [] : []);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    hydrate();
  }, [hydrate]);

  const statCards = useMemo(
    () => [
      { title: 'Users registered', value: stats?.totalUsers ?? '—' },
      { title: 'Orders placed', value: stats?.totalOrders ?? '—' },
      {
        title: 'Revenue ₹',
        value:
          stats?.totalSales !== undefined ? Number(stats.totalSales ?? 0).toFixed(2) : '—',
      },
    ],
    [stats?.totalOrders, stats?.totalSales, stats?.totalUsers]
  );

  async function submitFood(ev) {
    ev.preventDefault();
    setMutatingFood(true);

    const fd = new FormData();

    fd.append('name', foodForm.name.trim());

    fd.append('description', foodForm.description.trim());
    fd.append('price', String(Number(foodForm.price)));
    fd.append('category', foodForm.category.trim());
    fd.append('rating', String(Number(foodForm.rating || 4.5)));

    fd.append('isAvailable', foodForm.isAvailable === 'false' ? 'false' : 'true');
    if (imageFile) fd.append('image', imageFile);

    try {
      if (foodForm.editingId) {
        await api.patch(`/admin/foods/${foodForm.editingId}`, fd);
      } else {
        await api.post(`/admin/foods`, fd);
      }

      resetFoodDraft();
      await hydrate();
    } finally {
      setMutatingFood(false);
    }
  }

  function resetFoodDraft() {
    setFoodForm({
      editingId: null,
      name: '',
      description: '',
      price: '',
      category: '',
      rating: '4.5',
      isAvailable: 'true',
    });
    setImageFile(null);
  }

  /** Prefill PATCH form whenever admin taps “edit” chips */
  function editFood(snapshot) {
    setTab('foods');
    window.scrollTo({ top: 0, behavior: 'smooth' });
    setFoodForm({
      editingId: snapshot._id,
      name: snapshot.name ?? '',
      description: snapshot.description ?? '',
      price: String(snapshot.price ?? ''),
      category: snapshot.category ?? '',
      rating: String(snapshot.rating ?? ''),
      isAvailable: String(snapshot.isAvailable ?? true),
    });
    setImageFile(null);
  }

  /** Hard delete — recruiter demo warns about cascading uploads */
  async function removeFood(id) {
    if (!confirm('Delete this Mongoose Food document permanently?')) return;
    try {
      await api.delete(`/admin/foods/${id}`);
      await hydrate();
    } catch {
      /** axios interceptor toast */
    }
  }

  /** Update logistics status for hiring-manager storytelling */

  async function reviseOrder(orderId, nextStatus) {
    await api.patch(`/admin/orders/${orderId}/status`, { status: nextStatus });
    await hydrate();
  }

  /** Guard admin UI hydration before rendering heavy tables */

  if (loading) return <Spinner className="mx-auto mt-32 h-14 w-14 border-[3px]" />;

  /** Shared typography tokens reused across densely packed ergonomics */

  const fieldCls =
    'mt-2 w-full rounded-2xl border border-slate-800 bg-black px-4 py-3 text-[15px] text-white outline-none focus:border-orange-600';

  return (
    <section className="space-y-11">
      <header className="space-y-[18px]">
        <span className="inline-flex rounded-full bg-orange-500/15 px-4 py-[3px] text-[11px] font-bold uppercase tracking-[0.43em] text-orange-600">
          Role gated · YumCart cockpit
        </span>
        <div className="flex flex-wrap items-start justify-between gap-8">
          <div className="max-w-xl space-y-6">
            <h1 className="font-[family-name:var(--font-display)] text-4xl text-white">Operational pulse</h1>
            <p className="text-sm leading-relaxed text-slate-400">
              Express admin routes hydrate aggregated Mongo stats plus catalogue/order collections. Axios stays consistent with shopper tooling — only JWT payloads differ via `role: admin`.
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-3">
            {statCards.map((card) => (
              <article key={card.title} className="rounded-2xl border border-slate-800 bg-black/93 p-6">
                <span className="text-[13px] font-bold uppercase tracking-[0.43em] text-orange-600">
                  {card.title}
                </span>

                <p className="mt-4 font-[family-name:var(--font-display)] text-3xl text-white">{card.value}</p>
              </article>
            ))}
          </div>
        </div>

        {/* Tab strip echoes partner-console mental models */}
        <div className="flex gap-4 border-b border-slate-800 text-sm font-semibold uppercase tracking-[0.14em] text-slate-500">
          <button
            type="button"
            className={`border-b-2 px-4 pb-3 ${
              tab === 'foods' ? 'border-orange-400 text-orange-300' : 'border-transparent'
            }`}
            onClick={() => setTab('foods')}
          >
            Catalogue uploads
          </button>
          <button
            type="button"
            className={`border-b-2 px-4 pb-3 ${
              tab === 'orders' ? 'border-orange-400 text-orange-300' : 'border-transparent'
            }`}
            onClick={() => setTab('orders')}
          >
            Lifecycle orders
          </button>
        </div>
      </header>

      {tab === 'foods' && (
        <div className="grid gap-10 lg:grid-cols-[0.95fr,_1fr]">
          <form className="space-y-4 rounded-[28px] border border-slate-800 bg-black/90 p-8" onSubmit={submitFood}>
            <div className="flex items-center justify-between gap-4">
              <div>
                <h2 className="text-xl text-white">{foodForm.editingId ? 'Update dish' : 'Create dish'}</h2>
                <p className="text-xs text-slate-500">Images route through Multer into `/uploads/foods/`.</p>
              </div>
              {foodForm.editingId && (
                <button type="button" className="text-xs font-semibold text-orange-400 hover:text-orange-200" onClick={resetFoodDraft}>
                  Cancel edit
                </button>
              )}
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <label className="text-xs font-semibold uppercase tracking-[0.12em] text-orange-600" htmlFor="f-name">
                Name *
                <input id="f-name" required value={foodForm.name} onChange={(e) => setFoodForm({ ...foodForm, name: e.target.value })} className={fieldCls} />
              </label>

              <label className="text-xs font-semibold uppercase tracking-[0.12em] text-orange-600" htmlFor="f-price">
                Price ₹ *
                <input id="f-price" required min="0" step="0.01" type="number" value={foodForm.price} onChange={(e) => setFoodForm({ ...foodForm, price: e.target.value })} className={fieldCls} />
              </label>
            </div>

            <label className="text-xs font-semibold uppercase tracking-[0.12em] text-orange-600" htmlFor="f-desc">
              Description
              <textarea id="f-desc" rows={3} value={foodForm.description} onChange={(e) => setFoodForm({ ...foodForm, description: e.target.value })} className={fieldCls} />
            </label>

            <div className="grid gap-4 md:grid-cols-3">
              <label className="text-xs font-semibold uppercase tracking-[0.12em] text-orange-600" htmlFor="f-category">
                Category *
                <input id="f-category" required value={foodForm.category} onChange={(e) => setFoodForm({ ...foodForm, category: e.target.value })} className={fieldCls} />
              </label>
              <label className="text-xs font-semibold uppercase tracking-[0.12em] text-orange-600" htmlFor="f-rating">
                Rating
                <input id="f-rating" type="number" min="0" max="5" step="0.1" value={foodForm.rating} onChange={(e) => setFoodForm({ ...foodForm, rating: e.target.value })} className={fieldCls} />
              </label>
              <label className="text-xs font-semibold uppercase tracking-[0.12em] text-orange-600" htmlFor="f-available">
                Available
                <select id="f-available" className={`${fieldCls} appearance-none`} value={foodForm.isAvailable} onChange={(e) => setFoodForm({ ...foodForm, isAvailable: e.target.value })}>
                  <option value="true">Yes</option>
                  <option value="false">No</option>
                </select>
              </label>
            </div>

            <label className="text-xs font-semibold uppercase tracking-[0.12em] text-orange-600" htmlFor="f-photo">
              Image (webp/jpg/png)
              <input id="f-photo" type="file" accept="image/*" className="mt-3 text-sm text-slate-400" onChange={(e) => setImageFile(e.target.files?.[0] ?? null)} />
            </label>

            <button
              disabled={mutatingFood}
              type="submit"
              className="w-full rounded-2xl bg-gradient-to-br from-orange-600 to-orange-500 py-4 text-[13px] font-bold uppercase tracking-[0.32em] text-white shadow-lg shadow-orange-950/95 disabled:cursor-not-allowed disabled:opacity-50 hover:brightness-105 cursor-pointer"
            >
              {mutatingFood ? 'Saving…' : foodForm.editingId ? 'Update dish' : 'Publish dish'}
            </button>
          </form>

          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-white">Catalogue</h3>

            <div className="max-h-[760px] space-y-3 overflow-auto pr-2">
              {foods.map((food) => (
                <article key={food._id} className="flex gap-4 rounded-2xl border border-slate-800 bg-black/93 p-4">
                  <img src={assetUrl(food.image)} alt="" className="h-28 w-32 rounded-xl object-cover" />

                  <div className="min-w-0 flex-1 space-y-2">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <p className="truncate font-semibold text-[17px] text-white">{food.name}</p>
                      <p className="text-sm font-semibold text-orange-400">₹{food.price}</p>
                    </div>

                    <p className="text-[11px] uppercase tracking-[0.14em] text-slate-500">
                      {food.category} · {food.isAvailable ? 'Listed' : 'Hidden'} · ★ {food.rating}
                    </p>

                    <p className="line-clamp-2 text-sm text-slate-400">{food.description}</p>

                    <div className="flex gap-5 pt-1 text-[11px] font-semibold uppercase tracking-[0.18em]">
                      <button type="button" className="text-orange-300 hover:text-white" onClick={() => editFood(food)}>
                        Edit
                      </button>
                      <button type="button" className="text-red-500 hover:text-red-300" onClick={() => removeFood(food._id)}>
                        Delete
                      </button>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </div>
      )}

      {tab === 'orders' && (
        <div className="space-y-4">
          <h2 className="text-xl text-white">All platform orders</h2>

          <div className="overflow-x-auto rounded-2xl border border-slate-800">
            <table className="min-w-full divide-y divide-slate-800 text-xs">
              <thead className="bg-black/93 text-[11px] uppercase tracking-[0.18em] text-slate-500">
                <tr>
                  <th className="px-6 py-3 text-left font-semibold">Order</th>
                  <th className="px-6 py-3 text-left font-semibold">Guest</th>
                  <th className="px-6 py-3 text-left font-semibold">Totals</th>
                  <th className="px-6 py-3 text-left font-semibold">Status</th>
                  <th className="px-6 py-3 text-left font-semibold">Timeline</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800 text-sm">
                {orders.map((order) => (
                  <tr key={order._id} className="bg-slate-900/93">
                    <td className="px-6 py-[15px] text-white">#{order._id.slice(-6)}</td>
                    <td className="px-6 py-[15px] text-slate-300">
                      <span className="block font-semibold text-white">{order.user?.name ?? 'Chef'}</span>
                      <span className="text-[11px] text-slate-500">{order.user?.email ?? '—'}</span>
                    </td>
                    <td className="px-6 py-[15px] font-semibold text-orange-300">₹{Number(order.totalAmount ?? 0).toFixed(2)}</td>
                    <td className="px-6 py-[15px]">
                      <StatusSelect
                        key={`${order._id}-${order.status}`}
                        disabled={loading}
                        value={order.status}
                        onChange={(next) => reviseOrder(order._id, next)}
                      />
                    </td>
                    <td className="px-6 py-[15px] text-xs text-slate-500">{new Date(order.createdAt).toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </section>
  );
}

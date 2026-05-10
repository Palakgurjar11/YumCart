import { useEffect, useMemo, useState } from 'react';

import api from '../api/client.js';
import Spinner from '../components/Spinner.jsx';
import { assetUrl } from '../utils/assetUrl.js';

const BADGES = {
  pending: 'bg-amber-500 text-black',
  preparing: 'bg-orange-950 text-orange-300',
  out_for_delivery: 'bg-sky-950 text-sky-200',
  delivered: 'bg-emerald-950 text-emerald-300',
  cancelled: 'bg-red-950 text-red-300',
};

function formatMoney(n) {
  return `₹${Number(n ?? 0).toFixed(2)}`;
}

export default function Orders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let disposed = false;
    (async () => {
      try {
        const { data } = await api.get('/orders/my');
        if (!disposed) setOrders(Array.isArray(data.orders) ? data.orders : []);
      } catch {
        if (!disposed) setOrders([]);
      } finally {
        if (!disposed) setLoading(false);
      }
    })();
    return () => {
      disposed = true;
    };
  }, []);

  const chronological = useMemo(
    () => [...orders].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)),
    [orders]
  );

  return (
    <section className="space-y-10">
      <header className="space-y-2">
        <h1 className="font-[family-name:var(--font-display)] text-4xl text-white">Your orders</h1>
        <p className="text-sm text-slate-400">
          Each shipment stores immutable line-item clones so portfolio reviewers can inspect historical pricing.
        </p>
      </header>

      {loading ? (
        <Spinner className="mx-auto mt-32 h-16 w-16 border-[3px]" />
      ) : chronological.length === 0 ? (
        <div className="rounded-3xl border border-dashed border-orange-950/95 bg-orange-950/35 p-16 text-center text-slate-200">
          Nothing yet — hungry?
        </div>
      ) : (
        <div className="space-y-8">
          {chronological.map((order) => (
            <article key={order._id} className="rounded-[28px] border border-slate-800 bg-slate-900/93 p-6">
              <div className="flex flex-wrap items-start justify-between gap-4 pb-6">
                <div>
                  <div className="text-xs uppercase tracking-[0.24em] text-slate-500">Order #{order._id.slice(-8)}</div>
                  <p className="mt-3 text-xl font-semibold text-white">{formatMoney(order.totalAmount)}</p>
                  <p className="text-xs text-slate-400">
                    {new Date(order.createdAt).toLocaleString()}
                  </p>
                </div>
                <span
                  className={`rounded-full px-4 py-1 text-[11px] font-bold uppercase tracking-[0.24em] ${
                    BADGES[order.status] || 'bg-slate-900 text-white'
                  }`}
                >
                  {order.status?.replace(/_/g, ' ')}
                </span>
              </div>

              {order.deliveryAddress && (
                <p className="mb-5 rounded-2xl bg-black/93 px-4 py-3 text-sm text-slate-300">
                  {order.deliveryAddress}
                </p>
              )}

              <div className="grid gap-4 md:grid-cols-3">
                {order.items?.map((line) => (
                  <figure
                    key={`${order._id}-${line.name}-${line.unitPrice}-${line.quantity}`}
                    className="flex gap-3 rounded-2xl border border-slate-800 bg-black/93 p-3"
                  >
                    <img
                      src={assetUrl(line.image)}
                      alt={line.name}
                      className="h-14 w-16 rounded-xl object-cover"
                    />
                    <figcaption className="min-w-0">
                      <p className="truncate font-semibold text-white">{line.name}</p>
                      <p className="text-[11px] uppercase tracking-[0.18em] text-slate-500">
                        {line.quantity}x @ {formatMoney(line.unitPrice)}
                      </p>
                    </figcaption>
                  </figure>
                ))}
              </div>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}

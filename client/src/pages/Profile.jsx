import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';

import api from '../api/client.js';
import { useAuth } from '../context/AuthContext.jsx';

export default function Profile() {
  const { user, refreshUser } = useAuth();
  const [form, setForm] = useState({
    name: '',
    phone: '',
    address: '',
    avatar: '',
  });

  useEffect(() => {
    if (!user) return;
    setForm({
      name: user.name || '',
      phone: user.phone || '',
      address: user.address || '',
      avatar: user.avatar || '',
    });
  }, [user]);

  async function submit(e) {
    e.preventDefault();

    await api.patch('/auth/me', {
      name: form.name.trim(),
      phone: form.phone.trim(),
      address: form.address.trim(),
      avatar: form.avatar.trim(),
    });
    await refreshUser();
    toast.success('Profile updated');
  }

  const input =
    'mt-2 w-full rounded-2xl border border-slate-800 bg-slate-950 px-4 py-3 text-[15px] text-white outline-none focus:border-orange-600';

  return (
    <section className="mx-auto max-w-3xl space-y-8">
      <header className="space-y-2">
        <h1 className="font-[family-name:var(--font-display)] text-4xl text-white">Your profile</h1>
        <p className="text-sm text-slate-400">
          {user?.email} · {user?.role === 'admin' ? 'Administrator' : 'Customer'}
        </p>
      </header>

      <div className="rounded-3xl border border-slate-800 bg-black/90 p-8">
        <form className="space-y-6" onSubmit={submit}>
          <div className="grid gap-6 md:grid-cols-2">
            <label className="text-xs font-semibold uppercase tracking-[0.22em] text-orange-400" htmlFor="name">
              Name
              <input
                autoComplete="name"
                required
                className={input}
                id="name"
                value={form.name}
                onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
              />
            </label>
            <label className="text-xs font-semibold uppercase tracking-[0.22em] text-orange-400" htmlFor="phone">
              Phone
              <input
                autoComplete="tel"
                className={input}
                id="phone"
                value={form.phone}
                placeholder="Optional"
                onChange={(e) => setForm((p) => ({ ...p, phone: e.target.value }))}
              />
            </label>
          </div>

          <label className="text-xs font-semibold uppercase tracking-[0.22em] text-orange-400" htmlFor="avatar">
            Avatar URL (optional)
            <input
              className={input}
              id="avatar"
              value={form.avatar}
              onChange={(e) => setForm((p) => ({ ...p, avatar: e.target.value }))}
              placeholder="https://..."
            />
          </label>

          <label className="text-xs font-semibold uppercase tracking-[0.22em] text-orange-400" htmlFor="addr">
            Default delivery landmark
            <textarea
              className={`${input} min-h-[120px]`}
              placeholder="Reuse this line at checkout for faster placements."
              id="addr"
              value={form.address}
              onChange={(e) => setForm((p) => ({ ...p, address: e.target.value }))}
            />
          </label>

          <button
            type="submit"
            className="w-full rounded-2xl bg-gradient-to-br from-orange-600 to-orange-500 py-4 font-bold uppercase tracking-[0.3em] text-white shadow-lg shadow-orange-900/35 hover:brightness-105 md:w-auto md:px-10"
          >
            Save profile
          </button>
        </form>
      </div>
    </section>
  );
}

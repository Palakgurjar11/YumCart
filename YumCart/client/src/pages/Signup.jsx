import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

import { useAuth } from '../context/AuthContext.jsx';

export default function Signup() {
  const navigate = useNavigate();
  const { register } = useAuth();

  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ name: '', email: '', password: '', confirmPassword: '' });
  const [errors, setErrors] = useState({});

  function validate() {
    const nextErrors = {};
    if (form.name.trim().length < 2) nextErrors.name = 'Enter your full name';
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) nextErrors.email = 'Valid email required';
    if (form.password.length < 6) nextErrors.password = 'Password must be ≥ 6 characters';
    if (form.password !== form.confirmPassword) nextErrors.confirmPassword = 'Passwords do not match';
    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  }

  async function submit(e) {
    e.preventDefault();
    if (!validate()) return;

    setLoading(true);
    try {
      await register({
        name: form.name.trim(),
        email: form.email.trim().toLowerCase(),
        password: form.password,
      });
      toast.success('Account ready — Yum away!');
      navigate('/', { replace: true });
    } catch (err) {
      const msg = err?.response?.data?.message || err?.message || 'Registration failed';
      toast.error(Array.isArray(msg) ? msg[0] : msg);
    } finally {
      setLoading(false);
    }
  }

  const fieldCls =
    'mt-3 w-full rounded-2xl border border-slate-800 bg-slate-950 px-4 py-3 text-[15px] text-white outline-none focus:border-orange-600';

  return (
    <section className="mx-auto max-w-lg space-y-10 rounded-[28px] border border-slate-800 bg-black/92 p-8 sm:p-10">
      <header className="space-y-3">
        <h1 className="font-[family-name:var(--font-display)] text-3xl text-white sm:text-4xl">Create YumCart</h1>
        <p className="text-sm text-slate-400">
          After sign-up your guest selections merge into your server cart automatically.
        </p>
      </header>

      <form className="space-y-7" noValidate onSubmit={submit}>
        <fieldset disabled={loading} className="space-y-7">
          <legend className="sr-only">Account details</legend>

          <div>
            <label className="text-xs font-semibold uppercase tracking-[0.2em] text-orange-400" htmlFor="name">
              Name
            </label>
            <input
              autoComplete="name"
              required
              className={fieldCls}
              id="name"
              value={form.name}
              placeholder="Ada Lovelace"
              onChange={(e) => setForm((prev) => ({ ...prev, name: e.target.value }))}
            />
            {errors.name && <p className="mt-2 text-xs text-red-500">{errors.name}</p>}
          </div>

          <div>
            <label className="text-xs font-semibold uppercase tracking-[0.2em] text-orange-400" htmlFor="email">
              Email
            </label>
            <input
              autoComplete="email"
              required
              className={fieldCls}
              id="email"
              type="email"
              placeholder="chef@kitchen.dev"
              value={form.email}
              onChange={(e) => setForm((prev) => ({ ...prev, email: e.target.value }))}
            />
            {errors.email && <p className="mt-2 text-xs text-red-500">{errors.email}</p>}
          </div>

          <div className="grid gap-7 sm:grid-cols-2">
            <div>
              <label className="text-xs font-semibold uppercase tracking-[0.2em] text-orange-400" htmlFor="pwd">
                Password
              </label>
              <input
                autoComplete="new-password"
                required
                minLength={6}
                className={fieldCls}
                id="pwd"
                type="password"
                value={form.password}
                onChange={(e) => setForm((prev) => ({ ...prev, password: e.target.value }))}
              />
              {errors.password && <p className="mt-2 text-xs text-red-500">{errors.password}</p>}
            </div>
            <div>
              <label className="text-xs font-semibold uppercase tracking-[0.2em] text-orange-400" htmlFor="confirm">
                Confirm
              </label>
              <input
                autoComplete="new-password"
                required
                className={fieldCls}
                id="confirm"
                type="password"
                value={form.confirmPassword}
                onChange={(e) => setForm((prev) => ({ ...prev, confirmPassword: e.target.value }))}
              />
              {errors.confirmPassword && <p className="mt-2 text-xs text-red-500">{errors.confirmPassword}</p>}
            </div>
          </div>

          <button
            type="submit"
            className="w-full rounded-2xl bg-gradient-to-br from-orange-600 to-orange-500 py-4 text-[13px] font-bold uppercase tracking-[0.28em] text-white shadow-lg shadow-orange-900/40 hover:brightness-105"
          >
            {loading ? 'Creating…' : 'Sign up'}
          </button>
        </fieldset>
      </form>

      <p className="text-center text-sm text-slate-400">
        Already registered?
        <Link className="ml-2 font-semibold text-orange-400 hover:text-orange-300" to="/login">
          Login
        </Link>
      </p>
    </section>
  );
}

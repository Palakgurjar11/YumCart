import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

import { useAuth } from '../context/AuthContext.jsx';

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from || '/';

  const [form, setForm] = useState({ email: '', password: '' });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  function validate(payload) {
    const nextErrors = {};
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(payload.email)) nextErrors.email = 'Valid email required';
    if (payload.password.length < 6) nextErrors.password = 'Password minimum 6 characters';
    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  }

  async function submit(e) {
    e.preventDefault();
    if (!validate(form)) return;

    setLoading(true);
    try {
      await login(form);
      toast.success('Signed in successfully');
      navigate(from, { replace: true });
    } catch (err) {
      const msg = err?.response?.data?.message || err?.message || 'Invalid credentials';
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
        <h1 className="font-[family-name:var(--font-display)] text-3xl text-white sm:text-4xl">
          Welcome back
        </h1>
        <p className="text-sm leading-relaxed text-slate-400">
          Local guest carts merge into your Mongo-backed cart automatically after JWT login.
        </p>
      </header>

      <form className="space-y-8" onSubmit={submit} noValidate>
        <fieldset className="space-y-8" disabled={loading}>
          <legend className="sr-only">Email and password</legend>

          <div>
            <label className="text-xs font-semibold uppercase tracking-[0.2em] text-orange-400" htmlFor="email">
              Email
            </label>
            <input
              autoComplete="email"
              required
              className={fieldCls}
              placeholder="chef@kitchen.dev"
              type="email"
              id="email"
              value={form.email}
              onChange={(e) => setForm((p) => ({ ...p, email: e.target.value }))}
            />
            {errors.email && <p className="mt-2 text-xs text-red-500">{errors.email}</p>}
          </div>

          <div>
            <label className="text-xs font-semibold uppercase tracking-[0.2em] text-orange-400" htmlFor="pwd">
              Password
            </label>
            <input
              autoComplete="current-password"
              required
              minLength={6}
              className={fieldCls}
              placeholder="At least 6 characters"
              id="pwd"
              type="password"
              value={form.password}
              onChange={(e) => setForm((p) => ({ ...p, password: e.target.value }))}
            />
            {errors.password && <p className="mt-2 text-xs text-red-500">{errors.password}</p>}
          </div>

          <button
            type="submit"
            className="w-full rounded-2xl bg-gradient-to-br from-orange-600 to-orange-500 py-4 text-[13px] font-bold uppercase tracking-[0.32em] text-white shadow-lg shadow-orange-900/40 hover:brightness-105"
          >
            {loading ? 'Signing you in…' : 'Login'}
          </button>
        </fieldset>
      </form>

      <p className="text-center text-sm text-slate-400">
        New here?
        <Link className="ml-2 font-semibold text-orange-400 hover:text-orange-300" to="/signup">
          Sign up
        </Link>
      </p>

      <p className="text-center">
        <Link className="text-xs uppercase tracking-[0.24em] text-slate-500 hover:text-orange-400" to="/menu">
          ← Back to browse
        </Link>
      </p>
    </section>
  );
}

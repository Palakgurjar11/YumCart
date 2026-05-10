import { Link } from 'react-router-dom';

export default function NotFound() {
  return (
    <section className="flex min-h-[60vh] flex-col items-center justify-center gap-8 text-center">
      <span className="text-8xl leading-none opacity-95" aria-hidden="true">
        🌀
      </span>
      <div className="space-y-2">
        <h1 className="font-[family-name:var(--font-display)] text-4xl text-white">Fresh 404 plating</h1>
        <p className="text-sm text-slate-400">
          YumCart routed you somewhere off-menu — use the Navbar to hop back safely.
        </p>
      </div>
      <Link
        to="/"
        className="rounded-2xl border border-orange-500 bg-orange-600 px-10 py-4 text-white font-semibold uppercase tracking-[0.2em] hover:bg-orange-500"
      >
        Return home
      </Link>
    </section>
  );
}

import { Link } from 'react-router-dom';

/** Portfolio-friendly footer stripe */
export default function Footer() {
  return (
    <footer className="mt-24 border-t border-slate-800/90 bg-[#070e1b]/93">
      <div className="mx-auto grid max-w-7xl gap-8 px-4 py-14 text-sm text-slate-400 lg:grid-cols-4">
        <div className="space-y-3">
          <div className="flex items-center gap-2 font-[family-name:var(--font-display)] text-xl text-white">
            <span className="rounded-lg bg-orange-600 px-2 py-[2px] text-sm font-black">Y</span> YumCart
          </div>
          <p>A modern playground app for mastering MERN ergonomics.</p>
        </div>
        <div>
          <div className="mb-4 text-[11px] font-bold uppercase tracking-[0.34em] text-orange-600/92">Explore</div>
          <ul className="space-y-3">
            <li>
              <Link className="transition hover:text-orange-300" to="/menu">
                Explore Menu
              </Link>
            </li>
            <li>
              <Link className="transition hover:text-orange-300" to="/cart">
                View Cart
              </Link>
            </li>
            <li>
              <Link className="transition hover:text-orange-300" to="/orders">
                Order History
              </Link>
            </li>
          </ul>
        </div>
        <div>
          <div className="mb-4 text-[11px] font-bold uppercase tracking-[0.34em] text-orange-600/92">Credits</div>
          <p>
            Styled with ❤️ for placement portfolios. Images via{' '}
            <a href="https://unsplash.com" className="text-orange-400 hover:underline" target="_blank" rel="noreferrer">
              Unsplash
            </a>
          </p>
        </div>
        <div>
          <div className="mb-4 text-[11px] font-bold uppercase tracking-[0.34em] text-orange-600/92">Stacks</div>
          <p>React • Vite • Tailwind • Node • Express • MongoDB • JWT</p>
          <span className="mt-6 inline-flex rounded-xl border border-slate-800/95 bg-orange-950/35 px-3 py-[6px] text-[11px] font-semibold text-orange-200">
            ⚡ YumCart MVP — deploy friendly
          </span>
        </div>
      </div>
      <div className="mx-auto mb-14 max-w-7xl border-t border-slate-800/95 px-4 pt-6 text-center text-[11px] text-slate-600">
        © {new Date().getFullYear()} YumCart. Built for demos & recruiter walkthroughs.
      </div>
    </footer>
  );
}

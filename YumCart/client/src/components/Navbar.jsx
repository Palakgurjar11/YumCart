import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { useCart } from '../context/CartContext.jsx';

function blendNavLink(navProps, ...extra) {
  const chip = navProps?.isActive
    ? 'text-orange-400 after:pointer-events-none after:absolute after:-bottom-[2px] after:left-2 after:right-2 after:h-[2px] after:rounded-full after:bg-orange-500/95'
    : 'text-slate-300 hover:text-white';
  const base =
    'relative inline-flex rounded-lg px-3 py-1.5 text-sm font-semibold tracking-tight transition';
  return [base, chip, ...extra].filter(Boolean).join(' ');
}

/** Top navigation mirrors popular food-marketplace chrome (search-first, badges, gestures) */
export default function Navbar({ searchDraft, setSearchDraft, mobileOpen, setMobileOpen }) {
  const { user, isAuthenticated, logout } = useAuth();
  const { cartCount } = useCart();
  const navigate = useNavigate();

  function submitSearch(e) {
    e.preventDefault();
    const params = new URLSearchParams();
    const q = (searchDraft || '').trim();
    if (q) params.set('search', q);
    navigate({ pathname: '/menu', search: params.toString() });
    setMobileOpen?.(false);
  }

  const mobileNavigate = () => setMobileOpen(false);

  return (
    <header className="sticky top-0 z-40 border-b border-slate-800/85 bg-gradient-to-r from-[#081020]/95 via-[#0b172b]/93 to-[#111827]/93 backdrop-blur-xl">
      <div className="mx-auto flex max-w-7xl items-center gap-4 px-4 py-4">
        <Link to="/" className="flex shrink-0 items-center gap-2">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-orange-600 text-lg font-black text-white shadow-lg shadow-orange-900/65 ring-[3px] ring-orange-500/85">
            Y
          </div>
          <div className="hidden min-[460px]:flex min-[460px]:flex-col">
            <span className="font-[family-name:var(--font-display)] text-lg tracking-tighter text-white">
              Yum<span className="text-orange-400">Cart</span>
            </span>
            <span className="-mt-0.5 hidden text-[10px] font-semibold uppercase tracking-[0.22em] text-slate-500 sm:inline">
              food in minutes
            </span>
          </div>
        </Link>

        <form className="hidden flex-1 md:block md:max-w-xl" role="search" onSubmit={submitSearch}>
          <div className="relative">
            <span className="pointer-events-none absolute inset-y-0 left-3 flex items-center text-slate-400">
              🔎
            </span>
            <input
              value={searchDraft ?? ''}
              onChange={(e) => setSearchDraft?.(e.target.value)}
              className="w-full rounded-2xl border border-slate-800/95 bg-gradient-to-br from-[#071224]/85 to-[#0c192c]/92 py-3 pl-10 pr-3 text-xs text-white shadow-inner shadow-orange-950/40 outline-none ring-orange-600/65 transition placeholder:text-slate-500 focus:border-orange-700/95 focus:text-sm sm:text-[15px]"
              placeholder="Search for biryani, pizza…"
              aria-label="Search food"
            />
          </div>
        </form>

        <nav className="ml-auto flex shrink-0 items-center gap-1 md:gap-2">
          <NavLink className={(p) => blendNavLink(p, 'hidden', 'lg:inline-flex')} to="/">
            Home
          </NavLink>
          <NavLink className={(p) => blendNavLink(p, 'hidden', 'lg:inline-flex')} to="/menu">
            Menu
          </NavLink>

          <button
            type="button"
            className="flex h-9 w-9 items-center justify-center rounded-xl border border-slate-700/95 bg-[#081020]/90 text-xl transition hover:bg-slate-800 md:hidden"
            onClick={() => {
              const q = searchDraft?.trim?.() || '';
              navigate({ pathname: '/menu', search: q ? `search=${encodeURIComponent(q)}` : '' });
              setMobileOpen(false);
            }}
            aria-label="Open search on menu page"
          >
            🔎
          </button>

          <NavLink className={(p) => blendNavLink(p)} to="/cart" title="Cart" onClick={() => setMobileOpen(false)}>
            <span className="relative flex h-9 w-10 items-center justify-center rounded-xl border border-slate-700/95 bg-[#081020]/90 text-lg hover:bg-orange-900/65">
              🛒
              {cartCount > 0 && (
                <span className="absolute -right-1 -top-1 flex min-h-[18px] min-w-[18px] translate-x-[2px] items-center justify-center rounded-full bg-orange-600 px-[5px] text-[11px] font-bold text-white ring-2 ring-slate-950">
                  {cartCount > 9 ? '9+' : cartCount}
                </span>
              )}
            </span>
          </NavLink>

          {user?.role === 'admin' && (
            <NavLink className={(p) => blendNavLink(p)} to="/admin" onClick={() => setMobileOpen(false)}>
              Admin
            </NavLink>
          )}

          {isAuthenticated ? (
            <>
              <NavLink className={(p) => blendNavLink(p, 'hidden', 'sm:inline-flex')} to="/orders">
                Orders
              </NavLink>
              <NavLink className={(p) => blendNavLink(p, 'hidden', 'sm:inline-flex')} to="/profile">
                Profile
              </NavLink>
              <button
                type="button"
                onClick={() => {
                  logout();
                  setMobileOpen(false);
                }}
                className="ml-2 hidden rounded-xl border border-slate-700/95 bg-transparent px-3 py-2 text-xs font-semibold text-slate-200 transition hover:border-orange-900/95 hover:bg-orange-950/70 md:inline"
              >
                Logout
              </button>
            </>
          ) : (
            <>
              <NavLink
                className="hidden rounded-xl border border-orange-800/95 bg-orange-600/92 px-3 py-2 text-xs font-bold text-white shadow-md shadow-orange-950/95 transition hover:bg-orange-500 xs:inline-flex"
                to="/login"
              >
                Login
              </NavLink>
              <NavLink
                className="hidden rounded-xl border border-transparent bg-slate-800/92 px-3 py-2 text-xs font-bold text-orange-400 ring-orange-950/95 transition hover:bg-slate-700/94 lg:inline-flex"
                to="/signup"
              >
                Sign Up
              </NavLink>
            </>
          )}
        </nav>

        <button
          type="button"
          className="ml-1 flex h-10 w-10 shrink-0 flex-col justify-center gap-1.5 rounded-lg border border-slate-700 lg:hidden"
          aria-expanded={mobileOpen}
          aria-label={mobileOpen ? 'Close navigation' : 'Open navigation'}
          onClick={() => setMobileOpen(!mobileOpen)}
        >
          <span
            className={`mx-auto block h-[2px] w-5 rounded bg-slate-200 transition-all ${mobileOpen ? 'translate-y-[5px] rotate-45' : ''}`}
          />
          <span className={`mx-auto block h-[2px] w-5 rounded bg-slate-200 transition-all ${mobileOpen ? 'opacity-0' : ''}`} />
          <span
            className={`mx-auto block h-[2px] w-5 rounded bg-slate-200 transition-all ${mobileOpen ? '-translate-y-[5px] -rotate-45' : ''}`}
          />
        </button>
      </div>

      {mobileOpen && (
        <nav className="mx-4 mb-3 grid gap-1 rounded-xl border border-slate-700/92 bg-[#050b17]/94 p-4 text-sm shadow-[0_22px_50px_-20px_rgb(251_146_60_/_0.35)] backdrop-blur lg:hidden">
          <NavLink className="rounded-xl px-2 py-2 hover:bg-orange-950/75" onClick={mobileNavigate} to="/">
            Home
          </NavLink>
          <NavLink className="rounded-xl px-2 py-2 hover:bg-orange-950/75" onClick={mobileNavigate} to="/menu">
            Menu
          </NavLink>
          {!isAuthenticated && (
            <NavLink className="rounded-xl px-2 py-2 hover:bg-orange-950/75" onClick={mobileNavigate} to="/login">
              Login / Sign Up
            </NavLink>
          )}
          {isAuthenticated && (
            <>
              <NavLink className="rounded-xl px-2 py-2 hover:bg-orange-950/75" onClick={mobileNavigate} to="/orders">
                Orders
              </NavLink>
              <NavLink className="rounded-xl px-2 py-2 hover:bg-orange-950/75" onClick={mobileNavigate} to="/profile">
                Profile
              </NavLink>
              <button
                type="button"
                className="rounded-xl px-2 py-2 text-left hover:bg-orange-950/75"
                onClick={() => {
                  logout();
                  mobileNavigate();
                }}
              >
                Logout
              </button>
            </>
          )}
          {!isAuthenticated && (
            <NavLink className="rounded-xl px-2 py-2 hover:bg-orange-950/75" onClick={mobileNavigate} to="/signup">
              Create YumCart account
            </NavLink>
          )}
        </nav>
      )}
    </header>
  );
}

import { useEffect, useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';

import Navbar from '../components/Navbar.jsx';
import Footer from '../components/Footer.jsx';

/**
 * Shared chrome for customer-facing flows — Navbar search drafts sync with `/menu?s=`.
 */
export default function MainLayout() {
  const location = useLocation();
  const [searchDraft, setSearchDraft] = useState('');
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    setMobileOpen(false);
    /** Off `/menu`, clear Navbar draft — on `/menu`, mirror `?search=` for shareable catalogue URLs */
    if (location.pathname !== '/menu') {
      setSearchDraft('');
      return;
    }
    const qs = new URLSearchParams(location.search);
    const q = qs.get('search') || '';
    setSearchDraft(q);
  }, [location.pathname, location.search]);

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar
        searchDraft={searchDraft}
        setSearchDraft={setSearchDraft}
        mobileOpen={mobileOpen}
        setMobileOpen={setMobileOpen}
      />
      <main className="mx-auto mt-10 w-full max-w-7xl flex-1 px-4 pb-16">
        <Outlet context={{ searchDraft, setSearchDraft }} />
      </main>
      <Footer />
    </div>
  );
}

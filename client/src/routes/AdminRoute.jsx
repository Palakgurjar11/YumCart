import { Navigate } from 'react-router-dom';

import { useAuth } from '../context/AuthContext.jsx';

/** Chef console — rejects non-admin JWT claims */
export default function AdminRoute({ children }) {
  const { user, isAuthenticated } = useAuth();

  if (!isAuthenticated) return <Navigate to="/login" replace state={{ from: '/admin' }} />;
  if (user?.role !== 'admin') return <Navigate to="/" replace />;
  return children;
}

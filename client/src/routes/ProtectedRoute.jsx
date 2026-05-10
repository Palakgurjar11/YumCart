import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';

/** Redirects authenticated-only sections to `/login` with return path preserved */
export default function ProtectedRoute({ children }) {
  const { isAuthenticated } = useAuth();
  const location = useLocation();

  const returnTo = `${location.pathname}${location.search}`;

  if (!isAuthenticated) return <Navigate to="/login" replace state={{ from: returnTo }} />;
  return children;
}

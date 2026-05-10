import { Route, Routes } from 'react-router-dom';

import MainLayout from './layouts/MainLayout.jsx';
import Home from './pages/Home.jsx';
import Menu from './pages/Menu.jsx';
import Cart from './pages/Cart.jsx';
import Login from './pages/Login.jsx';
import Signup from './pages/Signup.jsx';
import Checkout from './pages/Checkout.jsx';
import Profile from './pages/Profile.jsx';
import Orders from './pages/Orders.jsx';
import AdminDashboard from './pages/AdminDashboard.jsx';
import NotFound from './pages/NotFound.jsx';

import ProtectedRoute from './routes/ProtectedRoute.jsx';
import AdminRoute from './routes/AdminRoute.jsx';

/** YumCart SPA router — guarded slices wrap diner + chef consoles alike */
export default function App() {
  return (
    <Routes>
      <Route element={<MainLayout />}>
        <Route index element={<Home />} />
        <Route path="menu" element={<Menu />} />
        <Route path="cart" element={<Cart />} />
        <Route path="login" element={<Login />} />
        <Route path="signup" element={<Signup />} />

        <Route
          path="checkout"
          element={
            <ProtectedRoute>
              <Checkout />
            </ProtectedRoute>
          }
        />

        <Route
          path="profile"
          element={
            <ProtectedRoute>
              <Profile />
            </ProtectedRoute>
          }
        />

        <Route
          path="orders"
          element={
            <ProtectedRoute>
              <Orders />
            </ProtectedRoute>
          }
        />

        <Route
          path="admin"
          element={
            <AdminRoute>
              <AdminDashboard />
            </AdminRoute>
          }
        />

        <Route path="*" element={<NotFound />} />
      </Route>
    </Routes>
  );
}

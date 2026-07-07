import { Navigate, Route, Routes } from 'react-router-dom';

import AppLayout from '../layout/AppLayout';
import DashboardPage from '../pages/dashboard';
import LoginPage from '../pages/login';
import MenuPage from '../pages/menu';
import { useAuthStore } from '../store/useAuthStore';

function RequireAuth() {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return <AppLayout />;
}

function LoginRoute() {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  return <LoginPage />;
}

export default function AppRouter() {
  return (
    <Routes>
      <Route path="/login" element={<LoginRoute />} />
      <Route element={<RequireAuth />}>
        <Route index element={<Navigate to="/dashboard" replace />} />
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route
          path="/menu-a"
          element={
            <MenuPage
              title="菜单 A"
              description="管理菜单 A 下的内容列表与状态信息。"
            />
          }
        />
        <Route
          path="/menu-b"
          element={
            <MenuPage
              title="菜单 B"
              description="管理菜单 B 下的内容列表与状态信息。"
            />
          }
        />
      </Route>
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
}

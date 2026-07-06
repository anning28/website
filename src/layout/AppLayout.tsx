import { NavLink, Outlet, useNavigate } from 'react-router-dom';

import { useAuth } from '../auth/AuthContext';

const menuItems = [
  { label: '首页概览', path: '/dashboard' },
  { label: '菜单 A', path: '/menu-a' },
  { label: '菜单 B', path: '/menu-b' },
];

export default function AppLayout() {
  const { logout, username } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login', { replace: true });
  };

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="sidebar__brand">
          <span className="sidebar__brand-mark">W</span>
          <span>Website</span>
        </div>

        <nav className="sidebar__nav" aria-label="主菜单">
          {menuItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                isActive ? 'sidebar__link sidebar__link--active' : 'sidebar__link'
              }
            >
              {item.label}
            </NavLink>
          ))}
        </nav>
      </aside>

      <main className="content-shell">
        <header className="topbar">
          <div>
            <p className="topbar__eyebrow">管理后台</p>
            <h1 className="topbar__title">内容管理</h1>
          </div>

          <div className="topbar__actions">
            <span className="topbar__user">{username}</span>
            <button className="button button--secondary" type="button" onClick={handleLogout}>
              退出登录
            </button>
          </div>
        </header>

        <section className="page-content">
          <Outlet />
        </section>
      </main>
    </div>
  );
}

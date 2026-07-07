import { NavLink, Outlet, useNavigate } from 'react-router-dom';

import { useAuthStore } from '../../store/useAuthStore';

import styles from './index.module.scss';

const menuItems = [
  { label: '首页概览', path: '/dashboard' },
  { label: '菜单 A', path: '/menu-a' },
  { label: '菜单 B', path: '/menu-b' },
];

function getClassName(...classNames: Array<string | false>) {
  return classNames.filter(Boolean).join(' ');
}

export default function AppLayout() {
  const logout = useAuthStore((state) => state.logout);
  const username = useAuthStore((state) => state.username);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login', { replace: true });
  };

  return (
    <div className={styles.appShell}>
      <aside className={styles.sidebar}>
        <div className={styles.sidebarBrand}>
          <span className={styles.sidebarBrandMark}>W</span>
          <span>Website</span>
        </div>

        <nav className={styles.sidebarNav} aria-label="主菜单">
          {menuItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                getClassName(styles.sidebarLink, isActive && styles.sidebarLinkActive)
              }
            >
              {item.label}
            </NavLink>
          ))}
        </nav>
      </aside>

      <main className={styles.contentShell}>
        <header className={styles.topbar}>
          <div>
            <p className={styles.topbarEyebrow}>管理后台</p>
            <h1 className={styles.topbarTitle}>内容管理</h1>
          </div>

          <div className={styles.topbarActions}>
            <span className={styles.topbarUser}>{username}</span>
            <button
              className={getClassName(styles.button, styles.buttonSecondary)}
              type="button"
              onClick={handleLogout}
            >
              退出登录
            </button>
          </div>
        </header>

        <section className={styles.pageContent}>
          <Outlet />
        </section>
      </main>
    </div>
  );
}

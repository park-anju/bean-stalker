import { Outlet } from 'react-router-dom';
import { FavoritePersistenceNotice } from '../favorites/FavoritePersistenceNotice.js';
import { Header } from './Header';

export function AppShell() {
  return (
    <div className="app-shell">
      <a href="#main-content" className="skip-link">
        Skip to main content
      </a>
      <Header />
      <main id="main-content" className="app-main">
        <FavoritePersistenceNotice />
        <Outlet />
      </main>
    </div>
  );
}

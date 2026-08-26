import { Link, NavLink } from 'react-router-dom';

function navLinkClassName({ isActive }: { isActive: boolean }): string {
  return isActive ? 'nav-link nav-link--active' : 'nav-link';
}

export function Header() {
  return (
    <header className="app-header">
      <div className="app-header__inner">
        <Link to="/" className="app-header__brand">
          Bean Stalker
        </Link>
        <nav aria-label="Primary" className="app-nav">
          <NavLink to="/" end className={navLinkClassName}>
            Discover
          </NavLink>
          <NavLink to="/favorites" className={navLinkClassName}>
            Favorites
          </NavLink>
        </nav>
      </div>
    </header>
  );
}

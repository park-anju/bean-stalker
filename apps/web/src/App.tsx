import { Link, Route, Routes } from 'react-router-dom';
import { DiscoveryPage } from './routes/DiscoveryPage';
import { FavoritesPage } from './routes/FavoritesPage';

export function App() {
  return (
    <>
      <nav>
        <Link to="/">Discover</Link>
        <Link to="/favorites">Favorites</Link>
      </nav>
      <main>
        <Routes>
          <Route path="/" element={<DiscoveryPage />} />
          <Route path="/favorites" element={<FavoritesPage />} />
        </Routes>
      </main>
    </>
  );
}

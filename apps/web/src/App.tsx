import { Route, Routes } from 'react-router-dom';
import { AppShell } from './components/AppShell';
import { DiscoveryPage } from './routes/DiscoveryPage';
import { FavoritesPage } from './routes/FavoritesPage';
import { NotFoundPage } from './routes/NotFoundPage';

export function App() {
  return (
    <Routes>
      <Route element={<AppShell />}>
        <Route path="/" element={<DiscoveryPage />} />
        <Route path="/favorites" element={<FavoritesPage />} />
        <Route path="*" element={<NotFoundPage />} />
      </Route>
    </Routes>
  );
}

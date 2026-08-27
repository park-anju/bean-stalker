import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { QueryClientProvider } from '@tanstack/react-query';
import { App } from './App';
import { FavoritesProvider } from './favorites/FavoritesProvider';
import { queryClient } from './query-client';
import './env';
import './styles/app.css';

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error('Root element #root was not found.');
}

createRoot(rootElement).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <FavoritesProvider>
        <BrowserRouter>
          <App />
        </BrowserRouter>
      </FavoritesProvider>
    </QueryClientProvider>
  </StrictMode>,
);

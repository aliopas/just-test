import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { App } from './App';
import { LanguageProvider } from './context/LanguageContext';
import { ToastProvider } from './context/ToastContext';
import { ToastStack } from './components/ToastStack';
import { applyTheme, theme } from './styles/theme';

const container = document.getElementById('root');

if (!container) {
  throw new Error('Root element with id="root" was not found');
}

const faviconHref = new URL('./assets/logo.jpg', import.meta.url).href;
const existingFavicon = document.querySelector<HTMLLinkElement>('link[rel="icon"]');
const favicon = existingFavicon ?? document.createElement('link');
favicon.rel = 'icon';
favicon.type = 'image/jpeg';
favicon.href = faviconHref;
if (!existingFavicon) {
  document.head.appendChild(favicon);
}

applyTheme(theme);

const queryClient = new QueryClient();

ReactDOM.createRoot(container).render(
  <React.StrictMode>
    <BrowserRouter>
      <QueryClientProvider client={queryClient}>
        <LanguageProvider>
          <ToastProvider>
            <App />
            <ToastStack />
          </ToastProvider>
        </LanguageProvider>
      </QueryClientProvider>
    </BrowserRouter>
  </React.StrictMode>
);



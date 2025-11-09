import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { AdminRequestDetailPage } from '../../pages/AdminRequestDetailPage';

function bootstrap() {
  const container = document.getElementById('root');
  if (!container) {
    throw new Error('Root container with id="root" not found');
  }

  const root = createRoot(container);
  root.render(
    <StrictMode>
      <AdminRequestDetailPage />
    </StrictMode>
  );
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', bootstrap);
} else {
  bootstrap();
}



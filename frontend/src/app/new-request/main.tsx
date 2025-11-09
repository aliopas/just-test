import { createRoot } from 'react-dom/client';
import { StrictMode } from 'react';
import { NewRequestPage } from '../../pages/NewRequestPage';

function bootstrap() {
  const container = document.getElementById('root');
  if (!container) {
    throw new Error('Root container with id="root" not found');
  }

  const root = createRoot(container);
  root.render(
    <StrictMode>
      <NewRequestPage />
    </StrictMode>
  );
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', bootstrap);
} else {
  bootstrap();
}



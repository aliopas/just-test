import { createRoot } from 'react-dom/client';
import { StrictMode } from 'react';
import { ProfilePage } from '../../pages/ProfilePage';

function bootstrap() {
  const container = document.getElementById('root');
  if (!container) {
    throw new Error('Root container not found. Ensure <div id="root"></div> exists.');
  }

  const root = createRoot(container);
  root.render(
    <StrictMode>
      <ProfilePage />
    </StrictMode>
  );
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', bootstrap);
} else {
  bootstrap();
}




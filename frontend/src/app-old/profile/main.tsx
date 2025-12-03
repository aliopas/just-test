import React, { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { ProfilePage } from '../../pages/ProfilePage';

function bootstrap() {
  const container = document.getElementById('root');
  if (!container) {
    throw new Error('Root container not found. Ensure <div id="root"></div> exists.');
  }

  const root = createRoot(container);
  root.render(
    React.createElement(StrictMode, null, React.createElement(ProfilePage))
  );
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', bootstrap);
} else {
  bootstrap();
}




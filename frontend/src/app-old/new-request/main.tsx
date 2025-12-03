import React, { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { NewRequestPage } from '../../pages/NewRequestPage';

function bootstrap() {
  const container = document.getElementById('root');
  if (!container) {
    throw new Error('Root container with id="root" not found');
  }

  const root = createRoot(container);
  root.render(
    React.createElement(StrictMode, null, React.createElement(NewRequestPage))
  );
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', bootstrap);
} else {
  bootstrap();
}



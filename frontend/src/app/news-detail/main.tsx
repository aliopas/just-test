import React, { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { InvestorNewsDetailPage } from '../../pages/InvestorNewsDetailPage';

function bootstrap() {
  const container = document.getElementById('root');
  if (!container) {
    throw new Error('Root container with id="root" not found');
  }

  const root = createRoot(container);
  root.render(
    React.createElement(StrictMode, null, React.createElement(InvestorNewsDetailPage))
  );
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', bootstrap);
} else {
  bootstrap();
}



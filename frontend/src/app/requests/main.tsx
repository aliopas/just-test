import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { MyRequestsPage } from '../../pages/MyRequestsPage';

function bootstrap() {
  const container = document.getElementById('root');
  if (!container) {
    throw new Error('Root container with id="root" not found');
  }

  const drawerRoot = document.getElementById('drawer-root');
  if (!drawerRoot) {
    const created = document.createElement('div');
    created.id = 'drawer-root';
    document.body.appendChild(created);
  }

  const root = createRoot(container);
  root.render(
    <StrictMode>
      <MyRequestsPage />
    </StrictMode>
  );
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', bootstrap);
} else {
  bootstrap();
}



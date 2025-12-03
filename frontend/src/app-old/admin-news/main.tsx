import { createRoot } from 'react-dom/client';
import { AdminNewsPage } from '../../pages/AdminNewsPage';

function bootstrap() {
  const container = document.getElementById('root');
  if (!container) {
    throw new Error('Root container with id="root" not found');
  }

  const root = createRoot(container);
  // React 19 type definitions can conflict across multiple React entrypoints.
  // This legacy bootstrap does not need StrictMode, so we render the page directly.
  root.render(<AdminNewsPage />);
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', bootstrap);
} else {
  bootstrap();
}



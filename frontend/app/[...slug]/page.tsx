'use client';

import { App } from '@/App';
import { ClientOnly } from '../components/ClientOnly';

export const dynamic = 'force-dynamic';

/**
 * Catch-all Next.js App Router page that mounts the legacy React Router app.
 * This ensures that routes like /home, /admin/dashboard, etc. are handled
 * entirely on the client by React Router inside <App />.
 */
export default function CatchAllAppPage() {
  return (
    <ClientOnly>
      <App />
    </ClientOnly>
  );
}
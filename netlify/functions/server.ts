import serverless from 'serverless-http';
// Import from source TypeScript file
// Netlify's esbuild will handle the compilation
import app from '../../backend/src/app';

// Wrap Express app with serverless-http
export const handler = serverless(app, {
  binary: ['image/*', 'application/pdf'],
});


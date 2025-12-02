import serverless from 'serverless-http';
// Import from source TypeScript file
// Netlify's esbuild will handle the compilation
import app from '../../backend/src/app';

// Wrap Express app with serverless-http
// Netlify redirects: /api/v1/* -> /.netlify/functions/server/:splat
// The :splat contains the path after /api/v1/
// serverless-http automatically maps event.path to request.url
// But we need to ensure the /api/v1 prefix is preserved for Express routes
export const handler = async (event: any, context: any) => {
  // When Netlify redirects /api/v1/* to /.netlify/functions/server/:splat
  // The event.path will be something like: /.netlify/functions/server/investor/profile
  // We need to reconstruct it to /api/v1/investor/profile for Express
  if (event.path && event.path.startsWith('/.netlify/functions/server')) {
    // Extract the splat part (everything after /.netlify/functions/server)
    const splat = event.path.replace('/.netlify/functions/server', '');
    // Reconstruct the original /api/v1 path
    event.path = `/api/v1${splat}`;
    // Also update rawPath if it exists
    if (event.rawPath) {
      event.rawPath = event.path;
    }
  }

  // Use serverless-http to wrap the Express app
  const serverlessHandler = serverless(app, {
    binary: ['image/*', 'application/pdf', 'application/octet-stream'],
  });

  return serverlessHandler(event, context);
};

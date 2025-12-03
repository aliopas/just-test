import serverless from 'serverless-http';
// Import from source TypeScript file
// Netlify's esbuild will handle the compilation
import app from '../../backend/src/app';

// Wrap Express app with serverless-http
// Netlify redirects: /api/v1/* -> /.netlify/functions/server/:splat
// The :splat contains the path after /api/v1/
// serverless-http automatically maps event.path to request.url
// But we need to ensure the /api/v1 prefix is preserved for Express routes
//
// Note: We use the legacy Lambda event/context format because serverless-http
// requires it. This is a known limitation when wrapping Express apps.
// For pure Netlify functions, use Request/Context from @netlify/functions instead.
export default async (event: any, context: any) => {
  try {
    // When Netlify redirects /api/v1/* to /.netlify/functions/server/:splat
    // The event.path will be something like: /.netlify/functions/server/auth/login
    // We need to reconstruct it to /api/v1/auth/login for Express
    if (event.path && event.path.startsWith('/.netlify/functions/server')) {
      // Extract the splat part (everything after /.netlify/functions/server)
      const splat = event.path.replace('/.netlify/functions/server', '');
      // Reconstruct the original /api/v1 path
      event.path = `/api/v1${splat || ''}`;
      // Also update rawPath if it exists
      if (event.rawPath) {
        event.rawPath = event.path;
      }
      // Update queryStringParameters path if needed
      if (event.requestContext && event.requestContext.http) {
        event.requestContext.http.path = event.path;
      }
    }

    // Use serverless-http to wrap the Express app
    const serverlessHandler = serverless(app, {
      binary: ['image/*', 'application/pdf', 'application/octet-stream'],
    });

    return await serverlessHandler(event, context);
  } catch (error) {
    console.error('Server function error:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({
        error: {
          code: 'INTERNAL_ERROR',
          message: error instanceof Error ? error.message : 'An unexpected error occurred',
        },
      }),
      headers: {
        'Content-Type': 'application/json',
      },
    };
  }
};

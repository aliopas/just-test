import serverless from 'serverless-http';
// Load environment variables first - CRITICAL: Must load before importing backend app
// In Netlify, environment variables should be set in Netlify Dashboard
// For local development, we load from .env file
import dotenv from 'dotenv';
import path from 'path';

// Load .env from root directory (relative to netlify/functions/)
// In Netlify production, environment variables are automatically available from Netlify Dashboard
// But we still try to load .env as fallback
const envPath = path.resolve(__dirname, '../../.env');
dotenv.config({ path: envPath });

// Log environment variable status for debugging
console.log('[Server Function] Environment check:', {
  hasSupabaseUrl: !!process.env.SUPABASE_URL,
  hasSupabaseAnonKey: !!process.env.SUPABASE_ANON_KEY,
  hasSupabaseServiceRoleKey: !!process.env.SUPABASE_SERVICE_ROLE_KEY,
  nodeEnv: process.env.NODE_ENV,
  envPath,
});

// Warn if critical environment variables are missing
if (!process.env.SUPABASE_URL || !process.env.SUPABASE_ANON_KEY) {
  console.error('[Server Function] WARNING: Missing critical Supabase environment variables!');
  console.error('[Server Function] Please ensure SUPABASE_URL and SUPABASE_ANON_KEY are set in Netlify Dashboard');
}

// Import from source TypeScript file
// Netlify's esbuild will handle the compilation
// Note: If environment variables are missing, the backend will throw an error
// during import, which we'll catch and handle gracefully
let app: any = null;
let appLoadError: Error | null = null;

try {
  app = require('../../backend/src/app').default;
  console.log('[Server Function] Backend app loaded successfully');
} catch (error) {
  appLoadError = error instanceof Error ? error : new Error(String(error));
  console.error('[Server Function] Failed to load backend app:', appLoadError);
  console.error('[Server Function] Error message:', appLoadError.message);
  console.error('[Server Function] This is likely due to missing environment variables');
}

// Wrap Express app with serverless-http
// Netlify redirects: /api/v1/* -> /.netlify/functions/server/:splat
// The :splat contains the path after /api/v1/
// serverless-http automatically maps event.path to request.url
// But we need to ensure the /api/v1 prefix is preserved for Express routes
//
// Note: We use the legacy Lambda event/context format because serverless-http
// requires it. This is a known limitation when wrapping Express apps.
// For pure Netlify functions, use Request/Context from @netlify/functions instead.
// Initialize handler once at module load time
let serverlessHandler: any = null;

if (app) {
  try {
    serverlessHandler = serverless(app, {
      binary: ['image/*', 'application/pdf', 'application/octet-stream'],
    });
    console.log('[Server Function] Serverless handler initialized successfully');
  } catch (error) {
    console.error('[Server Function] Failed to initialize serverless handler:', error);
  }
}

export default async (event: any, context: any) => {
  try {
    console.log('[Server Function] Invoked:', {
      path: event.path,
      rawPath: event.rawPath,
      httpMethod: event.httpMethod || event.requestContext?.http?.method,
    });

    // Check if backend app failed to load (likely due to missing environment variables)
    if (!app || appLoadError) {
      const errorMessage = appLoadError?.message || 'Backend application failed to load';
      console.error('[Server Function] Backend not available:', errorMessage);
      
      return {
        statusCode: 503,
        body: JSON.stringify({
          error: {
            code: 'SERVICE_UNAVAILABLE',
            message: 'Backend service is not available. Please check server logs.',
            details: errorMessage.includes('Supabase') 
              ? 'Missing Supabase environment variables. Please add SUPABASE_URL, SUPABASE_ANON_KEY, and SUPABASE_SERVICE_ROLE_KEY in Netlify Dashboard.'
              : errorMessage,
            help: 'See netlify/QUICK-FIX.md for setup instructions',
          },
        }),
        headers: {
          'Content-Type': 'application/json',
        },
      };
    }

    // When Netlify redirects /api/v1/* to /.netlify/functions/server/:splat
    // The event.path will be something like: /.netlify/functions/server/auth/login
    // We need to reconstruct it to /api/v1/auth/login for Express
    if (event.path && event.path.startsWith('/.netlify/functions/server')) {
      // Extract the splat part (everything after /.netlify/functions/server)
      const splat = event.path.replace('/.netlify/functions/server', '') || '';
      
      // Reconstruct the original /api/v1 path
      // Preserve query string if it exists in the original path
      event.path = `/api/v1${splat}`;
      
      // Also update rawPath if it exists
      if (event.rawPath) {
        event.rawPath = event.path;
      }
      
      // Update requestContext path if it exists
      if (event.requestContext && event.requestContext.http) {
        event.requestContext.http.path = event.path;
      }
      
      console.log('[Server Function] Path reconstructed to:', event.path);
    }

    if (!serverlessHandler) {
      return {
        statusCode: 503,
        body: JSON.stringify({
          error: {
            code: 'HANDLER_NOT_INITIALIZED',
            message: 'Serverless handler not initialized. Please check server logs.',
          },
        }),
        headers: {
          'Content-Type': 'application/json',
        },
      };
    }

    const result = await serverlessHandler(event, context);
    console.log('[Server Function] Handler returned:', result?.statusCode);
    return result;
  } catch (error) {
    console.error('[Server Function] Error:', error);
    console.error('[Server Function] Error stack:', error instanceof Error ? error.stack : 'No stack trace');
    return {
      statusCode: 500,
      body: JSON.stringify({
        error: {
          code: 'INTERNAL_ERROR',
          message: error instanceof Error ? error.message : 'An unexpected error occurred',
          stack: process.env.NODE_ENV === 'development' && error instanceof Error ? error.stack : undefined,
        },
      }),
      headers: {
        'Content-Type': 'application/json',
      },
    };
  }
};

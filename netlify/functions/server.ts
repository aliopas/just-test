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
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

console.log('[Server Function] Environment check:', {
  hasSupabaseUrl: !!supabaseUrl,
  hasSupabaseAnonKey: !!supabaseAnonKey,
  hasSupabaseServiceRoleKey: !!supabaseServiceRoleKey,
  nodeEnv: process.env.NODE_ENV,
  envPath,
  // Log first few characters to verify format (not full values for security)
  supabaseUrlPrefix: supabaseUrl?.substring(0, 20) || 'missing',
  supabaseAnonKeyPrefix: supabaseAnonKey?.substring(0, 20) || 'missing',
  supabaseServiceRoleKeyPrefix: supabaseServiceRoleKey?.substring(0, 20) || 'missing',
});

// Warn if critical environment variables are missing
if (!supabaseUrl || !supabaseAnonKey) {
  const missing: string[] = [];
  if (!supabaseUrl) missing.push('SUPABASE_URL');
  if (!supabaseAnonKey) missing.push('SUPABASE_ANON_KEY');
  
  console.error('[Server Function] ❌ CRITICAL: Missing Supabase environment variables:', missing.join(', '));
  console.error('[Server Function] Please ensure these are set in Netlify Dashboard:');
  console.error('[Server Function]   1. Go to Site Settings > Environment Variables');
  console.error('[Server Function]   2. Add SUPABASE_URL (your Supabase project URL)');
  console.error('[Server Function]   3. Add SUPABASE_ANON_KEY (your Supabase anon/public key)');
  console.error('[Server Function]   4. Add SUPABASE_SERVICE_ROLE_KEY (your Supabase service_role key)');
  console.error('[Server Function]   5. Redeploy the site');
}

// Warn if service role key is missing (needed for admin operations)
if (!supabaseServiceRoleKey) {
  console.warn('[Server Function] ⚠️  WARNING: SUPABASE_SERVICE_ROLE_KEY is missing!');
  console.warn('[Server Function] Some operations (like company-profile queries) require service role key.');
  console.warn('[Server Function] Public endpoints may fail. Please add SUPABASE_SERVICE_ROLE_KEY in Netlify Dashboard.');
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

    let result: any;
    try {
      result = await serverlessHandler(event, context);
    } catch (handlerError) {
      console.error('[Server Function] Handler threw an error:', handlerError);
      return {
        statusCode: 500,
        body: JSON.stringify({
          error: {
            code: 'INTERNAL_ERROR',
            message: 'Handler execution failed',
            details: handlerError instanceof Error ? handlerError.message : 'Unknown error',
          },
        }),
        headers: {
          'Content-Type': 'application/json',
        },
      };
    }
    
    console.log('[Server Function] Handler returned:', {
      hasResult: !!result,
      statusCode: result?.statusCode,
      hasBody: !!result?.body,
      hasHeaders: !!result?.headers,
    });
    
    // Ensure we always return a proper response object
    if (!result || result === undefined || result === null) {
      console.error('[Server Function] Handler returned undefined/null');
      return {
        statusCode: 500,
        body: JSON.stringify({
          error: {
            code: 'INTERNAL_ERROR',
            message: 'Handler returned an invalid response',
          },
        }),
        headers: {
          'Content-Type': 'application/json',
        },
      };
    }
    
    // Ensure result has required properties
    if (!result || typeof result !== 'object') {
      console.error('[Server Function] Handler returned invalid result type:', typeof result);
      return {
        statusCode: 500,
        body: JSON.stringify({
          error: {
            code: 'INTERNAL_ERROR',
            message: 'Handler returned an invalid response type',
          },
        }),
        headers: {
          'Content-Type': 'application/json',
        },
      };
    }
    
    if (!result.statusCode || typeof result.statusCode !== 'number') {
      console.error('[Server Function] Handler returned response without valid statusCode:', result.statusCode);
      return {
        statusCode: 500,
        body: JSON.stringify({
          error: {
            code: 'INTERNAL_ERROR',
            message: 'Handler returned an invalid response format',
          },
        }),
        headers: {
          'Content-Type': 'application/json',
        },
      };
    }
    
    // HTTP status codes that don't require a body (or allow empty body)
    const statusCodesWithoutBody = [204, 304];
    const statusCode = result.statusCode;
    const allowsEmptyBody = statusCodesWithoutBody.includes(statusCode);
    
    // For 204 No Content, handle immediately without JSON validation
    if (allowsEmptyBody) {
      // Force empty body and remove Content-Type header
      result.body = '';
      if (!result.headers || typeof result.headers !== 'object') {
        result.headers = {};
      }
      delete result.headers['Content-Type'];
      delete result.headers['content-type'];
    } else {
      // For other status codes, ensure body is a valid JSON string
    if (result.body !== undefined && result.body !== null) {
      try {
        // Validate that body is valid JSON if it's a string
        if (typeof result.body === 'string') {
            // Only validate JSON if body is not empty
            if (result.body.trim() !== '') {
            JSON.parse(result.body);
            } else {
            // Empty body is not allowed for this status code
            console.error('[Server Function] Empty body not allowed for status code:', statusCode);
            return {
              statusCode: 500,
              body: JSON.stringify({
                error: {
                  code: 'INTERNAL_ERROR',
                  message: 'Response body is empty but required for this status code',
                },
              }),
              headers: {
                'Content-Type': 'application/json',
              },
            };
          }
        } else if (typeof result.body === 'object') {
          // If body is an object, stringify it
          result.body = JSON.stringify(result.body);
        }
      } catch (parseError) {
        console.error('[Server Function] Invalid JSON in response body:', parseError);
        return {
          statusCode: 500,
          body: JSON.stringify({
            error: {
              code: 'INTERNAL_ERROR',
              message: 'Response body contains invalid JSON',
            },
          }),
          headers: {
            'Content-Type': 'application/json',
          },
        };
      }
    } else {
        // If body is missing, ensure we have a valid JSON body
        result.body = JSON.stringify({
          error: {
            code: 'INTERNAL_ERROR',
            message: 'Response body is missing',
          },
        });
      }
    }
    
    // Ensure headers object exists
    if (!result.headers || typeof result.headers !== 'object') {
      result.headers = {};
    }
    
    // For non-204 responses, set Content-Type if not already set
    if (!allowsEmptyBody && !result.headers['Content-Type'] && !result.headers['content-type']) {
        result.headers['Content-Type'] = 'application/json';
    }
    
    // Ensure we return a proper response object
    // For 204 No Content, ensure body is empty string (not undefined/null)
    const responseBody = allowsEmptyBody
      ? ''
      : (result.body || '');
    
    const response = {
      statusCode: result.statusCode,
      body: responseBody,
      headers: result.headers || {},
    };
    
    console.log('[Server Function] Returning response:', {
      statusCode: response.statusCode,
      hasBody: !!response.body,
      bodyLength: typeof response.body === 'string' ? response.body.length : 0,
      allowsEmptyBody,
      headers: Object.keys(response.headers),
    });
    
    return response;
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

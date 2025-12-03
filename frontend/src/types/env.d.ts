export {};

declare global {
  interface Window {
    __ENV__?: {
      API_BASE_URL?: string;
      SUPABASE_STORAGE_URL?: string;
      SUPABASE_URL?: string;
      SUPABASE_ANON_KEY?: string;
      SUPABASE_PUBLISHABLE_DEFAULT_KEY?: string;
    };
  }

  namespace NodeJS {
    interface ProcessEnv {
      NEXT_PUBLIC_API_BASE_URL?: string;
      NEXT_PUBLIC_SUPABASE_STORAGE_URL?: string;
      NEXT_PUBLIC_SUPABASE_URL?: string;
      NEXT_PUBLIC_SUPABASE_ANON_KEY?: string;
    }
  }
}



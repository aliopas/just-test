export {};

declare global {
  interface Window {
    __ENV__?: {
      API_BASE_URL?: string;
      SUPABASE_STORAGE_URL?: string;
      SUPABASE_URL?: string;
      SUPABASE_ANON_KEY?: string;
    };
  }
}



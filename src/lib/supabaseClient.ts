import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string;

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    flowType: 'pkce',
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
  },
});

// Broadcast session changes to extension (best effort)
try {
  supabase.auth.onAuthStateChange(async (_event, session) => {
    try {
      if (session?.access_token && session?.refresh_token) {
        window.postMessage({ type: 'pl-link-session', payload: { access_token: session.access_token, refresh_token: session.refresh_token } }, '*');
      } else {
        window.postMessage({ type: 'pl-clear-session' }, '*');
      }
    } catch {}
  });
} catch {}

import { createClient } from '@supabase/supabase-js';

import type { Database } from '@/types/supabase';

// Server-only client using the service-role key: bypasses RLS for privileged
// operations in API routes and scripts. Never import this from client-side code.
export function createAdminClient() {
  return createClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    }
  );
}

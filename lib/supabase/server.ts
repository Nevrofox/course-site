import { createServerClient, serializeCookieHeader } from '@supabase/ssr';
import type {
  GetServerSidePropsContext,
  NextApiRequest,
  NextApiResponse,
} from 'next';

import type { Database } from '@/types/supabase';

type Req = NextApiRequest | GetServerSidePropsContext['req'];
type Res = NextApiResponse | GetServerSidePropsContext['res'];

// Pages Router client: reads/writes auth cookies via req/res (no `next/headers`, App Router only).
export function createClient(req: Req, res: Res) {
  return createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    {
      cookies: {
        getAll() {
          return Object.entries(req.cookies || {}).map(([name, value]) => ({
            name,
            value: value ?? '',
          }));
        },
        setAll(cookiesToSet) {
          res.setHeader(
            'Set-Cookie',
            cookiesToSet.map(({ name, value, options }) =>
              serializeCookieHeader(name, value, options)
            )
          );
        },
      },
    }
  );
}

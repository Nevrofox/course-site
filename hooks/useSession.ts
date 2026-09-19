import { useEffect, useState } from 'react';

import { createClient } from '@/lib/supabase/client';

export type SessionUser = {
  id: string;
  email: string;
  name: string | null;
  image: string | null;
};

type SessionStatus = 'loading' | 'authenticated' | 'unauthenticated';

// Minimal drop-in replacement for NextAuth's `useSession()`, backed by Supabase Auth.
export function useSession() {
  const [status, setStatus] = useState<SessionStatus>('loading');
  const [user, setUser] = useState<SessionUser | null>(null);

  useEffect(() => {
    const supabase = createClient();
    let active = true;

    const load = async () => {
      try {
        const {
          data: { user: authUser },
        } = await supabase.auth.getUser();

        if (!active) {
          return;
        }

        if (!authUser) {
          setUser(null);
          setStatus('unauthenticated');
          return;
        }

        const { data: profile } = await supabase
          .from('user')
          .select('name, image')
          .eq('id', authUser.id)
          .single();

        setUser({
          id: authUser.id,
          email: authUser.email ?? '',
          name: profile?.name ?? null,
          image: profile?.image ?? null,
        });
        setStatus('authenticated');
      } catch {
        // Invalid/expired session (e.g. the user was deleted server-side): treat as signed out.
        if (active) {
          setUser(null);
          setStatus('unauthenticated');
        }
      }
    };

    load();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(() => load());

    return () => {
      active = false;
      subscription.unsubscribe();
    };
  }, []);

  return { status, data: user ? { user } : null };
}

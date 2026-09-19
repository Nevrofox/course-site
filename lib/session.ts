import type {
  GetServerSidePropsContext,
  NextApiRequest,
  NextApiResponse,
} from 'next';

import { createClient } from '@/lib/supabase/server';

export type Session = {
  user: {
    id: string;
    email: string;
    name: string;
    image: string | null;
  };
};

// Returns the current authenticated user (from Supabase Auth) plus their profile,
// or null if there is no session. Mirrors the old NextAuth `Session` shape used
// throughout the API routes so call sites didn't need to change.
export const getSession = async (
  req: NextApiRequest | GetServerSidePropsContext['req'],
  res: NextApiResponse | GetServerSidePropsContext['res']
): Promise<Session | null> => {
  const supabase = createClient(req, res);

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return null;
  }

  const { data: profile } = await supabase
    .from('user')
    .select('id, name, image')
    .eq('id', user.id)
    .single();

  return {
    user: {
      id: user.id,
      email: user.email ?? '',
      name: profile?.name ?? user.email ?? '',
      image: profile?.image ?? null,
    },
  };
};

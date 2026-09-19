import { useRouter } from 'next/router';

import { createClient } from '@/lib/supabase/client';

export function useCustomSignOut() {
  const router = useRouter();

  const signOut = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push('/auth/login');
  };

  return signOut;
}

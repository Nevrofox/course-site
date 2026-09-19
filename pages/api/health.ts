import { NextApiRequest, NextApiResponse } from 'next';
import { createAdminClient } from '@/lib/supabase/admin';

import packageInfo from '../../package.json';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  try {
    if (req.method !== 'GET') {
      throw new Error('Method not allowed');
    }

    const supabase = createAdminClient();
    const { error } = await supabase.from('team').select('id').limit(1);

    if (error) {
      throw error;
    }

    res.status(200).json({
      version: packageInfo.version,
    });
  } catch (err: any) {
    const { statusCode = 503 } = err;
    res.status(statusCode).json({});
  }
}

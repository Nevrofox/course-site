import { getSession } from '@/lib/session';
import type { NextApiRequest, NextApiResponse } from 'next';
import { recordMetric } from '@/lib/metrics';
import { createAdminClient } from '@/lib/supabase/admin';
import { validateWithSchema, updatePasswordSchema } from '@/lib/zod';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { method } = req;

  try {
    switch (method) {
      case 'PUT':
        await handlePUT(req, res);
        break;
      default:
        res.setHeader('Allow', 'PUT');
        res.status(405).json({
          error: { message: `Method ${method} Not Allowed` },
        });
    }
  } catch (error: any) {
    const message = error.message || 'Something went wrong';
    const status = error.status || 500;

    res.status(status).json({ error: { message } });
  }
}

const handlePUT = async (req: NextApiRequest, res: NextApiResponse) => {
  const session = await getSession(req, res);

  const { newPassword } = validateWithSchema(updatePasswordSchema, req.body);

  const supabase = createAdminClient();

  const { error } = await supabase.auth.admin.updateUserById(
    session!.user.id,
    { password: newPassword }
  );

  if (error) {
    throw new Error(error.message);
  }

  recordMetric('user.password.updated');

  res.status(200).json({ data: {} });
};

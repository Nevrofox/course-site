import { AuthLayout } from '@/components/layouts';
import { InputWithLabel } from '@/components/shared';
import { maxLengthPolicies } from '@/lib/common';
import { useFormik } from 'formik';
import type {
  GetServerSidePropsContext,
  InferGetServerSidePropsType,
} from 'next';
import { useTranslation } from 'next-i18next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import Head from 'next/head';
import Link from 'next/link';
import { type ReactElement } from 'react';
import { Button } from 'react-daisyui';
import toast from 'react-hot-toast';
import type { NextPageWithLayout } from 'types';
import * as Yup from 'yup';
import env from '@/lib/env';
import { createClient } from '@/lib/supabase/client';

const ForgotPassword: NextPageWithLayout<
  InferGetServerSidePropsType<typeof getServerSideProps>
> = () => {
  const { t } = useTranslation('common');

  const formik = useFormik({
    initialValues: {
      email: '',
    },
    validationSchema: Yup.object().shape({
      email: Yup.string().required().email().max(maxLengthPolicies.email),
    }),
    onSubmit: async (values) => {
      const supabase = createClient();

      const { error } = await supabase.auth.resetPasswordForEmail(
        values.email,
        { redirectTo: `${env.appUrl}/auth/reset-password` }
      );

      formik.resetForm();

      if (error) {
        toast.error(error.message);
        return;
      }

      toast.success(t('password-reset-link-sent'));
    },
  });

  return (
    <>
      <Head>
        <title>{t('forgot-password-title')}</title>
      </Head>
      <div className="rounded p-6 border">
        <form onSubmit={formik.handleSubmit}>
          <div className="space-y-2">
            <InputWithLabel
              type="email"
              label="Email"
              name="email"
              placeholder="Email"
              value={formik.values.email}
              error={formik.touched.email ? formik.errors.email : undefined}
              onChange={formik.handleChange}
            />
          </div>
          <div className="mt-4">
            <Button
              type="submit"
              color="primary"
              loading={formik.isSubmitting}
              active={formik.dirty}
              fullWidth
              size="md"
            >
              {t('email-password-reset-link')}
            </Button>
          </div>
        </form>
      </div>
      <p className="text-center text-sm text-gray-600 mt-3">
        {t('already-have-an-account')}
        <Link
          href="/auth/login"
          className="font-medium text-primary hover:text-[color-mix(in_oklab,oklch(var(--p)),black_7%)]"
        >
          &nbsp;{t('sign-in')}
        </Link>
      </p>
    </>
  );
};

ForgotPassword.getLayout = function getLayout(page: ReactElement) {
  return <AuthLayout heading="reset-password">{page}</AuthLayout>;
};

export const getServerSideProps = async (
  context: GetServerSidePropsContext
) => {
  const { locale }: GetServerSidePropsContext = context;

  return {
    props: {
      ...(locale ? await serverSideTranslations(locale, ['common']) : {}),
    },
  };
};

export default ForgotPassword;

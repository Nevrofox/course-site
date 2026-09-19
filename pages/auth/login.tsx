import type {
  GetServerSidePropsContext,
  InferGetServerSidePropsType,
} from 'next';

import * as Yup from 'yup';
import Link from 'next/link';
import { useFormik } from 'formik';
import { Button } from 'react-daisyui';
import { useRouter } from 'next/router';
import { useTranslation } from 'next-i18next';
import React, { type ReactElement, useEffect, useState } from 'react';
import type { ComponentStatus } from 'react-daisyui/dist/types';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';

import env from '@/lib/env';
import type { NextPageWithLayout } from 'types';
import { AuthLayout } from '@/components/layouts';
import { Alert, InputWithLabel, Loading } from '@/components/shared';
import Head from 'next/head';
import TogglePasswordVisibility from '@/components/shared/TogglePasswordVisibility';
import AgreeMessage from '@/components/auth/AgreeMessage';
import { maxLengthPolicies } from '@/lib/common';
import { createClient } from '@/lib/supabase/client';
import { useSession } from '@/hooks/useSession';

interface Message {
  text: string | null;
  status: ComponentStatus | null;
}

const Login: NextPageWithLayout<
  InferGetServerSidePropsType<typeof getServerSideProps>
> = () => {
  const router = useRouter();
  const { status } = useSession();
  const { t } = useTranslation('common');
  const [message, setMessage] = useState<Message>({ text: null, status: null });
  const [isPasswordVisible, setIsPasswordVisible] = useState<boolean>(false);

  const { error, success, token } = router.query as {
    error: string;
    success: string;
    token: string;
  };

  const handlePasswordVisibility = () => {
    setIsPasswordVisible((prev) => !prev);
  };

  useEffect(() => {
    if (error) {
      setMessage({ text: error, status: 'error' });
    }

    if (success) {
      setMessage({ text: success, status: 'success' });
    }
  }, [error, success]);

  const redirectUrl = token
    ? `/invitations/${token}`
    : env.redirectIfAuthenticated;

  const formik = useFormik({
    initialValues: {
      email: '',
      password: '',
    },
    validationSchema: Yup.object().shape({
      email: Yup.string().required().email().max(maxLengthPolicies.email),
      password: Yup.string().required().max(maxLengthPolicies.password),
    }),
    onSubmit: async (values) => {
      const { email, password } = values;

      setMessage({ text: null, status: null });

      const supabase = createClient();
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      formik.resetForm();

      if (error) {
        setMessage({ text: error.message, status: 'error' });
        return;
      }

      router.push(redirectUrl);
    },
  });

  if (status === 'loading') {
    return <Loading />;
  }

  if (status === 'authenticated') {
    router.push(redirectUrl);
  }

  const params = token ? `?token=${token}` : '';

  return (
    <>
      <Head>
        <title>{t('login-title')}</title>
      </Head>
      {message.text && message.status && (
        <Alert status={message.status} className="mb-5">
          {t(message.text)}
        </Alert>
      )}
      <div className="rounded p-6 border">
        <form onSubmit={formik.handleSubmit}>
          <div className="space-y-3">
            <InputWithLabel
              type="email"
              label="Email"
              name="email"
              placeholder={t('email')}
              value={formik.values.email}
              error={formik.touched.email ? formik.errors.email : undefined}
              onChange={formik.handleChange}
            />
            <div className="relative flex">
              <InputWithLabel
                type={isPasswordVisible ? 'text' : 'password'}
                name="password"
                placeholder={t('password')}
                value={formik.values.password}
                label={
                  <label className="label">
                    <span className="label-text">{t('password')}</span>
                    <span className="label-text-alt">
                      <Link
                        href="/auth/forgot-password"
                        className="text-sm text-primary hover:text-[color-mix(in_oklab,oklch(var(--p)),black_7%)]"
                      >
                        {t('forgot-password')}
                      </Link>
                    </span>
                  </label>
                }
                error={
                  formik.touched.password ? formik.errors.password : undefined
                }
                onChange={formik.handleChange}
              />
              <TogglePasswordVisibility
                isPasswordVisible={isPasswordVisible}
                handlePasswordVisibility={handlePasswordVisibility}
              />
            </div>
          </div>
          <div className="mt-3 space-y-3">
            <Button
              type="submit"
              color="primary"
              loading={formik.isSubmitting}
              active={formik.dirty}
              fullWidth
              size="md"
            >
              {t('sign-in')}
            </Button>
            <AgreeMessage text={t('sign-in')} />
          </div>
        </form>
      </div>
      <p className="text-center text-sm text-gray-600 mt-3">
        {t('dont-have-an-account')}
        <Link
          href={`/auth/join${params}`}
          className="font-medium text-primary hover:text-[color-mix(in_oklab,oklch(var(--p)),black_7%)]"
        >
          &nbsp;{t('create-a-free-account')}
        </Link>
      </p>
    </>
  );
};

Login.getLayout = function getLayout(page: ReactElement) {
  return (
    <AuthLayout heading="welcome-back" description="log-in-to-account">
      {page}
    </AuthLayout>
  );
};

export const getServerSideProps = async (
  context: GetServerSidePropsContext
) => {
  const { locale } = context;

  return {
    props: {
      ...(locale ? await serverSideTranslations(locale, ['common']) : {}),
    },
  };
};

export default Login;

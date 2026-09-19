import { InputWithLabel } from '@/components/shared';
import { passwordPolicies } from '@/lib/common';
import { useFormik } from 'formik';
import { useTranslation } from 'next-i18next';
import { useRouter } from 'next/router';
import { useState } from 'react';
import { Button } from 'react-daisyui';
import toast from 'react-hot-toast';
import * as Yup from 'yup';
import TogglePasswordVisibility from '../shared/TogglePasswordVisibility';
import AgreeMessage from './AgreeMessage';
import { maxLengthPolicies } from '@/lib/common';
import { createClient } from '@/lib/supabase/client';
import env from '@/lib/env';

const JoinUserSchema = Yup.object().shape({
  name: Yup.string().required().max(maxLengthPolicies.name),
  email: Yup.string().required().email().max(maxLengthPolicies.email),
  password: Yup.string()
    .required()
    .min(passwordPolicies.minLength)
    .max(maxLengthPolicies.password),
});

const Join = () => {
  const router = useRouter();
  const { t } = useTranslation('common');
  const [isPasswordVisible, setIsPasswordVisible] = useState<boolean>(false);

  const handlePasswordVisibility = () => {
    setIsPasswordVisible((prev) => !prev);
  };

  const formik = useFormik({
    initialValues: {
      name: '',
      email: '',
      password: '',
    },
    validationSchema: JoinUserSchema,
    validateOnChange: false,
    validateOnBlur: false,
    onSubmit: async (values) => {
      const supabase = createClient();

      const { data, error } = await supabase.auth.signUp({
        email: values.email,
        password: values.password,
        options: {
          data: { name: values.name },
          emailRedirectTo: `${env.appUrl}/teams?newTeam=1`,
        },
      });

      if (error) {
        toast.error(error.message);
        return;
      }

      formik.resetForm();

      if (data.session) {
        toast.success(t('successfully-joined'));
        router.push('/teams?newTeam=1');
      } else {
        router.push('/auth/verify-email');
      }
    },
  });

  return (
    <form onSubmit={formik.handleSubmit}>
      <div className="space-y-1">
        <InputWithLabel
          type="text"
          label={t('name')}
          name="name"
          placeholder={t('your-name')}
          value={formik.values.name}
          error={formik.touched.name ? formik.errors.name : undefined}
          onChange={formik.handleChange}
        />
        <InputWithLabel
          type="email"
          label={t('email')}
          name="email"
          placeholder={t('email-placeholder')}
          value={formik.values.email}
          error={formik.errors.email}
          onChange={formik.handleChange}
        />
        <div className="relative flex">
          <InputWithLabel
            type={isPasswordVisible ? 'text' : 'password'}
            label={t('password')}
            name="password"
            placeholder={t('password')}
            value={formik.values.password}
            error={formik.errors.password}
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
          {t('create-account')}
        </Button>
        <AgreeMessage text={t('create-account')} />
      </div>
    </form>
  );
};

export default Join;

const env = {
  appUrl: `${process.env.APP_URL}`,
  redirectIfAuthenticated: '/dashboard',
  securityHeadersEnabled: process.env.SECURITY_HEADERS_ENABLED ?? false,

  // SMTP configuration (used for team invite emails)
  smtp: {
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT),
    user: process.env.SMTP_USER,
    password: process.env.SMTP_PASSWORD,
    from: process.env.SMTP_FROM,
  },

  // Supabase
  supabase: {
    url: `${process.env.NEXT_PUBLIC_SUPABASE_URL}`,
    publishableKey: `${process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY}`,
    serviceRoleKey: `${process.env.SUPABASE_SERVICE_ROLE_KEY}`,
  },

  // Svix
  svix: {
    url: `${process.env.SVIX_URL}`,
    apiKey: `${process.env.SVIX_API_KEY}`,
  },

  // Retraced configuration
  retraced: {
    url: process.env.RETRACED_URL
      ? `${process.env.RETRACED_URL}/auditlog`
      : undefined,
    apiKey: process.env.RETRACED_API_KEY,
    projectId: process.env.RETRACED_PROJECT_ID,
  },

  // Mixpanel configuration
  mixpanel: {
    token: process.env.NEXT_PUBLIC_MIXPANEL_TOKEN,
  },

  disableNonBusinessEmailSignup:
    process.env.DISABLE_NON_BUSINESS_EMAIL_SIGNUP === 'true',

  otel: {
    prefix: process.env.OTEL_PREFIX || 'boxyhq.saas',
  },

  hideLandingPage: process.env.HIDE_LANDING_PAGE === 'true',

  darkModeEnabled: process.env.NEXT_PUBLIC_DARK_MODE !== 'false',

  teamFeatures: {
    webhook: process.env.FEATURE_TEAM_WEBHOOK !== 'false',
    auditLog: process.env.FEATURE_TEAM_AUDIT_LOG !== 'false',
    deleteTeam: process.env.FEATURE_TEAM_DELETION !== 'false',
  },

  slackWebhookUrl: process.env.SLACK_WEBHOOK_URL,
};

export default env;

import * as Sentry from "@sentry/nextjs";

Sentry.init({
  dsn: "https://b3db3aeb701708f76b52680049ac1d59@o4511165590667264.ingest.de.sentry.io/4511165599449168",

  tracesSampleRate: 1.0,

  environment: process.env.NODE_ENV,
  release: process.env.NEXT_PUBLIC_VERCEL_GIT_COMMIT_SHA,
});

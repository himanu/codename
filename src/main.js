import * as Sentry from "@sentry/browser";
import App from "./App.svelte";

if (process.env.APP_ENV === "prod") {
  Sentry.init({
    dsn: "https://290aaec6fb37438eaa9f8f2fa34ccd18@o422923.ingest.sentry.io/5884399",
    // Set tracesSampleRate to 1.0 to capture 100%
    // of transactions for performance monitoring.
    // We recommend adjusting this value in production
    tracesSampleRate: 1.0,
  });
}

const app = new App({
  target: document.body,
});

export default app;

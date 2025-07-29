import * as Sentry from "@sentry/react-native";
import { isAxiosError } from "axios";
import { isRunningInExpoGo } from "expo";
import { Logger } from "../logger";

export const navigationIntegration = Sentry.reactNavigationIntegration({
  enableTimeToInitialDisplay: !isRunningInExpoGo(),
});

Sentry.init({
  dsn: process.env.EXPO_PUBLIC_SENTRY_DSN,
  tracesSampleRate: 1.0,
  integrations: [navigationIntegration],
  enableNativeFramesTracking: !isRunningInExpoGo(),
  environment: process.env.NODE_ENV,
  beforeSend: (event, hint) => {
    // TEMP : Hide splash screen error
    if ((hint.originalException as Error).message.includes("SplashModule")) {
      return null;
    }

    if (process.env.NODE_ENV === "development") {
      if (isAxiosError(hint.originalException)) {
        Logger.error("Axios error:", hint.originalException.request);
      } else if (hint.originalException instanceof Error) {
        Logger.error(
          "Sentry event:",
          hint.originalException,
          " - Context: ",
          hint.captureContext,
        );
        Logger.error(
          "Sentry error stack:",
          (hint.originalException as Error).stack,
        );
      } else {
        Logger.info("Sentry message:", hint.originalException);
      }
      return null;
    }
    return event;
  },
});

export const capturePrettyException = (message: string, error: unknown) => {
  Sentry.captureException(error, {
    extra: {
      message,
    },
  });
};

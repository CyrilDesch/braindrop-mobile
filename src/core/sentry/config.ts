import { logger, consoleTransport } from "react-native-logs";
import * as Sentry from "@sentry/react-native";
import { isAxiosError } from "axios";
import { isRunningInExpoGo } from "expo";

export const navigationIntegration = Sentry.reactNavigationIntegration({
  enableTimeToInitialDisplay: !isRunningInExpoGo(),
});

const log = logger.createLogger({
  levels: {
    debug: 0,
    info: 1,
    warn: 2,
    error: 3,
  },
  severity: "debug",
  transport: consoleTransport,
  transportOptions: {
    colors: {
      info: "blueBright",
      warn: "yellowBright",
      error: "redBright",
    },
  },
  async: true,
  dateFormat: "time",
  printLevel: true,
  printDate: true,
  fixedExtLvlLength: false,
  enabled: true,
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
        log.error("Axios error:", hint.originalException.request);
      } else if (hint.originalException instanceof Error) {
        log.error(
          "Sentry event:",
          hint.originalException,
          " - Context: ",
          hint.captureContext,
        );
        log.error(
          "Sentry error stack:",
          (hint.originalException as Error).stack,
        );
      } else {
        log.info("Sentry message:", hint.originalException);
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

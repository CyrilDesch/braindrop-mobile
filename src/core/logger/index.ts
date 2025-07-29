import { logger, consoleTransport } from "react-native-logs";

// Determine if we're in development mode
const isDevelopment = process.env.NODE_ENV === "development";

// Create logger with appropriate configuration
const log = logger.createLogger({
  levels: {
    debug: 0,
    info: 1,
    warn: 2,
    error: 3,
  },
  // Only show debug logs in development
  severity: isDevelopment ? "debug" : "info",
  transport: consoleTransport,
  transportOptions: {
    colors: {
      debug: "grey",
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

// Export logger methods
export const Logger = {
  debug: (message: string, ...args: any[]) => {
    if (isDevelopment) {
      log.debug(message, ...args);
    }
  },

  info: (message: string, ...args: any[]) => {
    log.info(message, ...args);
  },

  warn: (message: string, ...args: any[]) => {
    log.warn(message, ...args);
  },

  error: (message: string, ...args: any[]) => {
    log.error(message, ...args);
  },
};

// Export the raw logger for advanced use cases
export { log };

// Export environment check
export const isDev = isDevelopment;

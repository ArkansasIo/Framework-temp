import { err, ok, type Result } from "./result.js";

export interface AppConfig {
  readonly appName: string;
  readonly environment: "development" | "test" | "production";
  readonly port: number;
  readonly logLevel: "debug" | "info" | "warn" | "error";
}

const ENVIRONMENTS = ["development", "test", "production"] as const;
const LOG_LEVELS = ["debug", "info", "warn", "error"] as const;

function isEnvironment(value: string): value is AppConfig["environment"] {
  return (ENVIRONMENTS as readonly string[]).includes(value);
}

function isLogLevel(value: string): value is AppConfig["logLevel"] {
  return (LOG_LEVELS as readonly string[]).includes(value);
}

export function loadConfig(
  input: Readonly<Record<string, string | undefined>>,
): Result<AppConfig> {
  const rawAppName = input.APP_NAME;
  const appName = rawAppName === undefined ? "application" : rawAppName.trim();
  const environment = input.NODE_ENV ?? "development";
  const rawPort = input.PORT ?? "3000";
  const logLevel = input.LOG_LEVEL ?? "info";

  // Require a decimal integer string rather than relying on Number(), which accepts
  // whitespace, hexadecimal, and exponent notation that are surprising in env files.
  if (!/^\d+$/.test(rawPort)) {
    return err({
      code: "VALIDATION_ERROR",
      message: "PORT must be a decimal integer from 1 to 65535.",
    });
  }

  const port = Number(rawPort);
  if (!Number.isSafeInteger(port) || port < 1 || port > 65535) {
    return err({
      code: "VALIDATION_ERROR",
      message: "PORT must be a decimal integer from 1 to 65535.",
    });
  }

  if (appName.length === 0 || appName.length > 100) {
    return err({
      code: "VALIDATION_ERROR",
      message: "APP_NAME must contain 1 to 100 characters.",
    });
  }
  if (!isEnvironment(environment)) {
    return err({ code: "VALIDATION_ERROR", message: "NODE_ENV is invalid." });
  }
  if (!isLogLevel(logLevel)) {
    return err({ code: "VALIDATION_ERROR", message: "LOG_LEVEL is invalid." });
  }

  return ok({ appName, environment, port, logLevel });
}

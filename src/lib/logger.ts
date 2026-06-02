export type LogLevel = "debug" | "info" | "warn" | "error";

export interface LogContextInterface {
  /** Optional namespace for grouping related log lines (e.g. "api", "auth"). */
  namespace?: string;
  /** Structured metadata attached to the log entry. */
  meta?: Record<string, unknown>;
}

export interface LogEntryInterface {
  /** ISO timestamp when the log was emitted. */
  timestamp: string;
  /** Severity level of the log entry. */
  level: LogLevel;
  /** Human-readable log message. */
  message: string;
  /** Optional grouping namespace. */
  namespace?: string;
  /** Optional structured metadata. */
  meta?: Record<string, unknown>;
}

type WriteLogInput = {
  level: LogLevel;
  message: string;
  context?: LogContextInterface;
};

type FormatLogOutput = LogEntryInterface;

function formatLog(input: WriteLogInput): FormatLogOutput {
  return {
    timestamp: new Date().toISOString(),
    level: input.level,
    message: input.message,
    namespace: input.context?.namespace,
    meta: input.context?.meta,
  };
}

function writeLog(input: WriteLogInput): void {
  const entry = formatLog(input);
  const prefix = entry.namespace ? `[${entry.namespace}]` : "";
  const payload = entry.meta ? ` ${JSON.stringify(entry.meta)}` : "";
  const line = `${entry.timestamp} ${entry.level.toUpperCase()} ${prefix} ${entry.message}${payload}`;

  switch (input.level) {
    case "debug":
      console.debug(line);
      break;
    case "info":
      console.info(line);
      break;
    case "warn":
      console.warn(line);
      break;
    case "error":
      console.error(line);
      break;
  }
}

export interface LoggerInterface {
  debug(message: string, context?: LogContextInterface): void;
  info(message: string, context?: LogContextInterface): void;
  warn(message: string, context?: LogContextInterface): void;
  error(message: string, context?: LogContextInterface): void;
}

export const logger: LoggerInterface = {
  debug(message: string, context?: LogContextInterface): void {
    writeLog({ level: "debug", message, context });
  },
  info(message: string, context?: LogContextInterface): void {
    writeLog({ level: "info", message, context });
  },
  warn(message: string, context?: LogContextInterface): void {
    writeLog({ level: "warn", message, context });
  },
  error(message: string, context?: LogContextInterface): void {
    writeLog({ level: "error", message, context });
  },
};

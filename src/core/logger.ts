export type LogLevel = "debug" | "info" | "warn" | "error";
export interface LogEntry { readonly time: string; readonly level: LogLevel; readonly message: string; readonly data?: unknown; }
export interface LoggerSink { write(entry: LogEntry): void; }
export class ConsoleSink implements LoggerSink { write(e: LogEntry): void { const line = `[${e.time}] ${e.level.toUpperCase()} ${e.message}`; if (e.level === "error") console.error(line, e.data ?? ""); else if (e.level === "warn") console.warn(line, e.data ?? ""); else console.log(line, e.data ?? ""); } }
export class Logger {
  public constructor(private readonly min: LogLevel = "info", private readonly sinks: LoggerSink[] = [new ConsoleSink()]) {}
  private rank(level: LogLevel): number { return ["debug","info","warn","error"].indexOf(level); }
  log(level: LogLevel, message: string, data?: unknown): void { if (this.rank(level) < this.rank(this.min)) return; const entry={time:new Date().toISOString(),level,message,data}; for(const sink of this.sinks) sink.write(entry); }
  debug(m:string,d?:unknown){this.log("debug",m,d)} info(m:string,d?:unknown){this.log("info",m,d)} warn(m:string,d?:unknown){this.log("warn",m,d)} error(m:string,d?:unknown){this.log("error",m,d)}
}

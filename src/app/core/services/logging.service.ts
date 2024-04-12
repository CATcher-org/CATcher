import { Injectable } from '@angular/core';
import { AppConfig } from '../../../environments/environment';
import { downloadAsTextFile } from '../../shared/lib/file-download';

@Injectable({
  providedIn: 'root'
})

/**
 * Responsible for logging events and errors while the application is
 * running to ease debugging for CATcher developers and maintainers.
 */
export class LoggingService {
  private logger: Console;
  private isInSession = false;
  private readonly LOG_KEY = 'CATcher-Log';
  private readonly LOG_FILE_NAME = 'CATcher-log.txt';
  public readonly LOG_START_HEADER = `====== New CATcher v${AppConfig.version} Session Log ======`;
  public readonly LOG_COUNT_LIMIT = 4;
  public readonly SESSION_LOG_SEPARATOR = '\n'.repeat(2); // More new-lines added for clarity.

  constructor() {
    this.logger = console;

    this.startSession();
  }

  reset() {
    this.isInSession = false;
  }

  /**
   * Configures loggging Session if Logging Service is not
   * in session.
   */
  startSession() {
    // Prevents the OAuth Pop-up window from being able to
    // start a session.
    if (window.opener && window.opener !== window) {
      return;
    }
    if (!this.isInSession) {
      this.isInSession = true;
      this.initializeLogCache();
    }
  }

  private initializeLogCache() {
    this.setCachedLog(this.getTrimmedLogCache(this.getCachedLog(), this.LOG_COUNT_LIMIT));
  }

  /**
   * Trims the existing Log in the browser's cache to a select number
   * of Sessions if necessary.
   * @param sessionCount The number of Session Logs to preserve in the cache
   */
  private getTrimmedLogCache(currentLog: string, sessionCount: number): string {
    const currentDateTime = new Date().toLocaleString();
    const logHeaderWithDateTime = `${this.LOG_START_HEADER}\n${currentDateTime}`;

    // Check if Trimming is Necessary
    const numberOfSessions: number =
      currentLog == null
        ? 0
        : currentLog.split('\n').filter((currentLogLine: string) => currentLogLine.includes(this.LOG_START_HEADER)).length;

    if (numberOfSessions === 0) {
      return logHeaderWithDateTime;
    }

    if (numberOfSessions < sessionCount) {
      return `${currentLog}${this.SESSION_LOG_SEPARATOR}${logHeaderWithDateTime}`;
    }

    const separatedSessionLogs: string[] = currentLog
      .split(`${this.LOG_START_HEADER}`)
      .filter((line: string) => !!line)
      .map((line: string) => `${this.LOG_START_HEADER}\n${line.trim()}`);

    separatedSessionLogs.splice(0, separatedSessionLogs.length - sessionCount + 1);
    separatedSessionLogs.push(`${logHeaderWithDateTime}`);

    return separatedSessionLogs.join(this.SESSION_LOG_SEPARATOR);
  }

  getCachedLog(): string {
    return localStorage.getItem(this.LOG_KEY);
  }

  private setCachedLog(updatedLog: string): void {
    localStorage.setItem(this.LOG_KEY, updatedLog);
  }

  private updateLog(...updatedLog: any[]): void {
    this.setCachedLog(`${this.getCachedLog()}\n${updatedLog.toString()}`);
  }

  exportLogFile() {
    const log: string = this.getCachedLog();
    downloadAsTextFile(this.LOG_FILE_NAME, log);
  }

  info(...params: any[]) {
    this.updateLog(params);
    this.logger.info(params);
  }

  error(...params: any[]) {
    this.updateLog(params);
    this.logger.error(params);
  }

  warn(...params: any[]) {
    this.updateLog(params);
    this.logger.warn(params);
  }

  debug(...params: any[]) {
    if (AppConfig.production) {
      return;
    }
    // Log file will not be updated to keep log messages short
    this.logger.debug(params);
  }
}

import { Injectable } from '@angular/core';
import { ElectronService } from './electron.service';
import { ElectronLog } from 'electron-log';

@Injectable({
  providedIn: 'root'
})
export class LoggingService {
  private logger: ElectronLog | Console;
  private readonly LOG_KEY = 'CATcher-Log';
  private readonly LOG_FILE_NAME = 'CATcher-log.txt';
  private readonly LOG_START_HEADER = '====== Initializing CATcher Log ======'
  private readonly LOG_COUNT_LIMIT = 4;

  constructor(electronService: ElectronService) {
    if (electronService.isElectron()) {
      this.logger = window.require('electron-log');
    } else {
      this.logger = console;
    }

    this.initializeLogCache();
  }

  initializeLogCache() {
    this.setCachedLog(this.getTrimmedLogCache(this.getCachedLog(), this.LOG_COUNT_LIMIT));
  }

  /**
   * Trims the existing Log in the browser's cache to a select number
   * of Sessions if necessary.
   * @param sessionCount The number of Session Logs to preserve in the cache
   */
  getTrimmedLogCache(currentLog: string, sessionCount: number): string {
    // Check if Trimming is Necessary
    const numberOfSessions: number = currentLog.split('\n')
      .filter((currentLogLine: string) => currentLogLine.includes(this.LOG_START_HEADER))
      .length;

    if(numberOfSessions < sessionCount) {
      return `${currentLog}\n${this.LOG_START_HEADER}`;
    }

    const seperatedSessionLogs: string[] = [''];
    currentLog.split('\n')
      .forEach((currentLogLine: string) => {
        if(currentLogLine === this.LOG_START_HEADER) {
          seperatedSessionLogs.push(currentLogLine);
        } else {
          seperatedSessionLogs[seperatedSessionLogs.length - 1] += `\n${currentLogLine}`;
        }
      });
    
    seperatedSessionLogs.push(this.LOG_START_HEADER);
    seperatedSessionLogs.splice(0, seperatedSessionLogs.length - sessionCount);
    return seperatedSessionLogs.reduce((mergedLog: string, currentSessionLog: string) => {
      return `${mergedLog}\n${currentSessionLog}`;
    })
  }

  getCachedLog(): string {
    return localStorage.getItem(this.LOG_KEY);
  }

  setCachedLog(updatedLog: string): void {
    localStorage.setItem(this.LOG_KEY, updatedLog);
  }

  updateLog(... updatedLog: any[]): void {
    this.setCachedLog(`${this.getCachedLog()}\n${updatedLog.toString()}`);
  }

  exportLogFile() {
    const log: string = this.getCachedLog();
    const blob: Blob = new Blob([log], {type: 'file/txt'});
    const blobUrl: string = window.URL.createObjectURL(blob);

    const hiddenElement: HTMLAnchorElement = document.createElement('a');
    hiddenElement.setAttribute('style', 'display: none;');
    hiddenElement.href = blobUrl;
    hiddenElement.download = this.LOG_FILE_NAME;

    // Add to DOM and Click to prompt download.
    document.body.appendChild(hiddenElement);
    hiddenElement.click();

    // Remove URL + Created Attached Element
    window.URL.revokeObjectURL(blobUrl);
    document.body.removeChild(hiddenElement);
    hiddenElement.remove();
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
    this.updateLog(params);
    this.logger.debug(params);
  }
}

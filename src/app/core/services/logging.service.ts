import { Injectable } from '@angular/core';
import { ElectronService } from './electron.service';
import { ElectronLog } from 'electron-log';

@Injectable({
  providedIn: 'root'
})
export class LoggingService {
  private logger: ElectronLog | Console;
  private readonly LOG_KEY = 'CATcher-Log';
  private readonly LOG_FILE_NAME = 'CATcher-log.txt'

  constructor(electronService: ElectronService) {
    if (electronService.isElectron()) {
      this.logger = window.require('electron-log');
    } else {
      this.logger = console;
    }
  }

  getCachedLog(): string {
    return localStorage.getItem(this.LOG_KEY);
  }

  setCachedLog(updatedLog: string): void {
    localStorage.setItem(this.LOG_KEY, updatedLog);
  }

  saveToLocalStorage(...params: any[]) {
    const oldestSessionLogRegex = /(AppConfig,.*\n[\S\s]*)(?=AppConfig,.*)/g;
    const existingLog = this.getCachedLog();
    const newLog = `${existingLog ? `${existingLog}\n` : ''}${params.toString()}`.replace(oldestSessionLogRegex, '');
    this.setCachedLog(newLog);
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
    this.saveToLocalStorage(params);
    this.logger.info(params);
  }

  error(...params: any[]) {
    this.saveToLocalStorage(params);
    this.logger.error(params);
  }

  warn(...params: any[]) {
    this.saveToLocalStorage(params);
    this.logger.warn(params);
  }

  debug(...params: any[]) {
    this.saveToLocalStorage(params);
    this.logger.debug(params);
  }
}

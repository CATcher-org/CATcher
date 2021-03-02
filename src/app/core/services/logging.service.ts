import { Injectable } from '@angular/core';
import { ElectronService } from './electron.service';
import { ElectronLog } from 'electron-log';

@Injectable({
  providedIn: 'root'
})
export class LoggingService {
  private logger: ElectronLog | Console;
  private readonly LOG_KEY = 'CATcher-Log';

  constructor(electronService: ElectronService) {
    if (electronService.isElectron()) {
      this.logger = window.require('electron-log');
    } else {
      this.logger = console;
    }
  }

  saveToLocalStorage(...params: any[]) {
    const oldestSessionLogRegex = /(AppConfig,.*\n[\S\s]*)(?=AppConfig,.*)/g;
    const existingLog = localStorage.getItem(this.LOG_KEY);
    const newLog = `${existingLog ? `${existingLog}\n` : ''}${params.toString()}`.replace(oldestSessionLogRegex, '');
    localStorage.setItem(this.LOG_KEY, newLog);
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

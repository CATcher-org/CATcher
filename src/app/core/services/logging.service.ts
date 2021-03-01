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
    console.log('incoming params');
    console.log(params);
    const existingLog = localStorage.getItem(this.LOG_KEY);
    localStorage.setItem(this.LOG_KEY, params.toString());
    console.log('existing params');
    console.log(existingLog);
  }

  info(...params: any[]) {
    this.saveToLocalStorage(params);
    this.logger.info(params);
    this.saveToLocalStorage(params);
  }

  error(...params: any[]) {
    this.logger.error(params);
  }

  warn(...params: any[]) {
    this.logger.warn(params);
  }

  debug(...params: any[]) {
    this.logger.debug(params);
  }
}

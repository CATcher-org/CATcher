import { Injectable } from '@angular/core';
import { ElectronService } from './electron.service';
import { ElectronLog } from 'electron-log';

@Injectable({
  providedIn: 'root'
})
export class LoggingService {
  private logger: ElectronLog | Console;

  constructor(electronService: ElectronService) {
    if (electronService.isElectron()) {
      this.logger = window.require('electron-log');
    } else {
      this.logger = console;
    }
  }

  info(...params: any[]) {
    this.logger.info(params);
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

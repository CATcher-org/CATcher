import { Injectable } from '@angular/core';
import { ipcRenderer } from 'electron';

declare var window: Window;
declare global {
  interface Window {
    process: any;
    require: any;
  }
}

@Injectable({
  providedIn: 'root',
})
export class ElectronService {
  ipcRenderer: typeof ipcRenderer;

  constructor() {
    if (this.isElectron()) {
      this.ipcRenderer = window.require('electron').ipcRenderer;
    }
  }

  isElectron(): boolean {
    return window && window.process && window.process.type;
  }


  clearCookies() {
    if (this.isElectron()) {
      this.ipcRenderer.invoke('clear-cookies');
    }
  }

  registerIpcListener(channel: string, callback: (...params) => void) {
    if (this.isElectron()) {
      this.ipcRenderer.on(channel, callback);
    }
  }

  sendIpcMessage(channel: string, ...messages: any) {
    if (this.isElectron()) {
      this.ipcRenderer.send(channel, messages);
    }
  }

  removeIpcListeners(channel: string) {
    if (this.isElectron()) {
      this.ipcRenderer.removeAllListeners(channel);
    }
  }

  openLink(address: string) {
    if (this.isElectron()) {
      this.ipcRenderer.invoke('open-link', address);
    } else {
      window.open(address);
    }
  }
}

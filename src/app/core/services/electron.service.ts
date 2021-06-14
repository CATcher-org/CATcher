import { Injectable } from '@angular/core';
import { ipcRenderer, remote, clipboard, Menu, MenuItem } from 'electron';
import * as fs from 'fs';
import { AppConfig } from '../../../environments/environment';

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
  remote: typeof remote;
  clipboard: typeof clipboard;
  fs: typeof fs;

  constructor() {
    if (this.isElectron()) {
      this.ipcRenderer = window.require('electron').ipcRenderer;
      this.remote = window.require('electron').remote;
      this.clipboard = window.require('electron').clipboard;
      this.fs = window.require('fs');

    }
  }

  isElectron(): boolean {
    return window && window.process && window.process.type;
  }


  clearCookies() {
    if (this.isElectron()) {
      this.remote.getCurrentWebContents().session.clearStorageData();
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
      this.remote.shell.openExternal(address);
    } else {
      window.open(address);
    }
  }
}

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
  readonly INSPECT_MENU_ITEM: MenuItem;
  rightClickPosition = null;
  rightClickMenu: Menu;

  ipcRenderer: typeof ipcRenderer;
  remote: typeof remote;
  clipboard: typeof clipboard;
  fs: typeof fs;

  constructor() {
    if (ElectronService.isElectron()) {
      this.ipcRenderer = window.require('electron').ipcRenderer;
      this.remote = window.require('electron').remote;
      this.clipboard = window.require('electron').clipboard;
      this.fs = window.require('fs');

      this.INSPECT_MENU_ITEM = new this.remote.MenuItem({
        label: 'Inspect Element',
        click: () => {
          this.remote.getCurrentWindow().webContents.inspectElement(this.rightClickPosition.x, this.rightClickPosition.y);
        }
      });
      this.rightClickMenu = new this.remote.Menu();
      this.rightClickMenu.append(this.INSPECT_MENU_ITEM);

      if (!AppConfig.production) {
        this.enableRightClickInspectElement();
      }
    }
  }

  static isElectron(): boolean {
    return window && window.process && window.process.type;
  }

  enableRightClickInspectElement(): void {
    window.addEventListener('contextmenu', (e) => {
      e.preventDefault();
      this.rightClickPosition = {x: e.x, y: e.y};
      this.rightClickMenu.popup({window: this.remote.getCurrentWindow()});
    }, false);
  }

  clearCookies() {
    if (ElectronService.isElectron()) {
      this.remote.getCurrentWebContents().session.clearStorageData();
    }
  }

  registerIpcListener(channel: string, callback: (...params) => void) {
    if (ElectronService.isElectron()) {
      this.ipcRenderer.on(channel, callback);
    }
  }

  sendIpcMessage(channel: string, ...messages: any) {
    if (ElectronService.isElectron()) {
      this.ipcRenderer.send(channel, messages);
    }
  }

  removeIpcListeners(channel: string) {
    if (ElectronService.isElectron()) {
      this.ipcRenderer.removeAllListeners(channel);
    }
  }

  openLink(address: string) {
    if (ElectronService.isElectron()) {
      this.remote.shell.openExternal(address);
    } else {
      window.open(address);
    }
  }
}

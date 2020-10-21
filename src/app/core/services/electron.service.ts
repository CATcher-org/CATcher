import { Injectable } from '@angular/core';
import { ipcRenderer, remote, clipboard, Menu, MenuItem } from 'electron';
import * as fs from 'fs';
import { AppConfig } from '../../../environments/environment';
import * as moment from 'moment';

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
    if (this.isElectron()) {
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

  isElectron(): boolean {
    return window && window.process && window.process.type;
  }

  enableRightClickInspectElement(): void {
    window.addEventListener('contextmenu', (e) => {
      e.preventDefault();
      this.rightClickPosition = {x: e.x, y: e.y};
      this.rightClickMenu.popup({window: this.remote.getCurrentWindow()});
    }, false);
  }

  setCookie(url: string, domain: string, key: string, value: string) {
    if (this.isElectron()) {
      this.remote.getCurrentWebContents().session.cookies.set({
        url: url,
        name: key,
        value: value,
        domain: domain,
        expirationDate: moment().add(7, 'days').unix()
      });
    }
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

  sendIpcSycMessage(channel: string, ...args: any): any {
    if (this.isElectron()) {
      return this.ipcRenderer.sendSync(channel, args);
    }
    return '';
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

  readFile(filePath: string): string {
    if (this.isElectron()) {
      return this.fs.readFileSync(filePath, 'utf8');
    } else {
      return null;
    }
  }

  fileExists(filePath: string): boolean {
    if (this.isElectron()) {
      return this.fs.existsSync(filePath);
    } else {
      return false;
    }
  }

  retrieveClipboardImageFileTypes(event: ClipboardEvent): string[] {
    if (this.isElectron()) {
      return this.clipboard.availableFormats().filter(type => type.includes('image'));
    }
    const result = [];
    const items = event.clipboardData.items;
    for (let i = 0; i < items.length; i++) {
      if (items[i].type.indexOf('image') === 0) {
        result.push(items[i]);
      }
    }
  }

  readClipboardImage(): string {
    if (this.isElectron()) {
      return this.clipboard.readImage().toDataURL();
    } else {
      return '';
    }
  }
}

import { Injectable } from '@angular/core';
import { ipcRenderer, webFrame, remote } from 'electron';
const { Menu, MenuItem } = remote;
import * as childProcess from 'child_process';
import * as fs from 'fs';
import { AppConfig } from '../../../environments/environment';
import { from, Observable } from 'rxjs';
import Cookie = Electron.Cookie;
import * as moment from 'moment';

@Injectable({
  providedIn: 'root',
})
export class ElectronService {
  readonly INSPECT_MENU_ITEM = new MenuItem({
    label: 'Inspect Element',
    click: () => {
      remote.getCurrentWindow().webContents.inspectElement(this.rightClickPosition.x, this.rightClickPosition.y);
    }
  });

  ipcRenderer: typeof ipcRenderer;
  webFrame: typeof webFrame;
  remote: typeof remote;
  childProcess: typeof childProcess;
  fs: typeof fs;
  rightClickPosition = null;
  rightClickMenu = new Menu();

  constructor() {
    // Conditional imports
    if (this.isElectron()) {
      this.ipcRenderer = window.require('electron').ipcRenderer;
      this.webFrame = window.require('electron').webFrame;
      this.remote = window.require('electron').remote;

      this.childProcess = window.require('child_process');
      this.fs = window.require('fs');

      if (!AppConfig.production) {
        this.enableRightClickInspectElement();
      }
    }
  }

  isElectron(): boolean {
    return window && window.process && window.process.type;
  }

  enableRightClickInspectElement(): void {
    this.rightClickMenu.append(this.INSPECT_MENU_ITEM);
    window.addEventListener('contextmenu', (e) => {
      e.preventDefault();
      this.rightClickPosition = {x: e.x, y: e.y};
      this.rightClickMenu.popup({window: remote.getCurrentWindow()});
    }, false);
  }

  cookieFor(url: string, name: string): Observable<string> {
    return from(remote.getCurrentWebContents().session.cookies.get({url: url, name: name})
      .then((cookies: Cookie[]) => {
        if (cookies.length < 1) {
          return '';
        } else {
          return cookies[0].value;
        }
      })
    );
  }

  setCookie(url: string, domain: string, key: string, value: string) {
    remote.getCurrentWebContents().session.cookies.set({
      url: url,
      name: key,
      value: value,
      domain: domain,
      expirationDate: moment().add(7, 'days').unix()
    });
  }

  clearCookies() {
    remote.getCurrentWebContents().session.clearStorageData();
  }
}

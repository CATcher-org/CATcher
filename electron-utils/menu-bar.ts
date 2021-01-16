import { app } from 'electron';

// Edited version of a template menu-bar provided by the electron API,
// refer to https://electronjs.org/docs/api/menu for more information.
const fileMenu: Electron.MenuItemConstructorOptions = {
  label: 'File',
  submenu: [
    {
      label: 'Quit CATcher', accelerator: 'CmdOrCtrl+Q', click() { app.quit(); }
    }
  ]
};

const editMenu: Electron.MenuItemConstructorOptions = {
  label: 'Edit',
  submenu: [
    { role: 'undo' },
    { role: 'redo' },
    { type: 'separator' },
    { role: 'selectAll' },
    { role: 'cut' },
    { role: 'copy' },
    { role: 'paste' },
    { role: 'delete' },
  ]
};

const viewMenu: Electron.MenuItemConstructorOptions = {
  label: 'View',
  submenu: [
    { role: 'resetZoom' },
    { role: 'zoomIn' },
    { role: 'zoomOut' },
    { type: 'separator' },
    { role: 'togglefullscreen' }
  ]
};

export const mainMenuTemplate: Electron.MenuItemConstructorOptions[] = [fileMenu, editMenu, viewMenu];

export function createDevModeMenuOptions(isDevMode: boolean): void {
  if (isDevMode) {
    let viewSubMenu: Electron.MenuItemConstructorOptions[];
    viewSubMenu = mainMenuTemplate[2].submenu as Electron.MenuItemConstructorOptions[];
    viewSubMenu.push(
      { type: 'separator' },
      { role: 'toggleDevTools'}
    );
  }
}

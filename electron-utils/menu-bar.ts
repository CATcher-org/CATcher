import { app, MenuItemConstructorOptions } from 'electron';

// Edited version of a template menu-bar provided by the electron API,
// refer to https://electronjs.org/docs/api/menu for more information.
const fileMenu: MenuItemConstructorOptions = {
  label: 'File',
  submenu: [
    {
      label: 'Quit CATcher', accelerator: 'CmdOrCtrl+Q', click() { app.quit(); }
    }
  ]
};

const editMenu: MenuItemConstructorOptions = {
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

const viewMenu: MenuItemConstructorOptions = {
  label: 'View',
  submenu: [
    { role: 'resetZoom' },
    { role: 'zoomIn' },
    { role: 'zoomOut' },
    { type: 'separator' },
    { role: 'togglefullscreen' }
  ]
};

export function createMenuOptions(isDevMode: boolean): MenuItemConstructorOptions[] {
  const mainMenuTemplate: MenuItemConstructorOptions[] = [fileMenu, editMenu, viewMenu];

  if (isDevMode) {
    let viewSubMenu: MenuItemConstructorOptions[];
    viewSubMenu = mainMenuTemplate[2].submenu as MenuItemConstructorOptions[];
    viewSubMenu.push(
      { type: 'separator' },
      { role: 'toggleDevTools'}
    );
  }
  return mainMenuTemplate;
}

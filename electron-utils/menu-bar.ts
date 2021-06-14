import { app, MenuItemConstructorOptions, MenuItem, Menu, BrowserWindow } from 'electron';

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

export function createContextMenu(window: BrowserWindow) {
  const point = {x:null, y:null};
  const INSPECT_MENU_ITEM = new MenuItem({
    label: 'Inspect Element',
    click:  (menuItem, window, e) => {
      window.webContents.inspectElement(point.x, point.y);
    }
  });

  const contextMenu = new Menu();
  contextMenu.append(INSPECT_MENU_ITEM);
  
  window.webContents.on('context-menu',  (e, click) => {
    point.x = click.x;
    point.y = click.y;
    contextMenu.popup({window: window});
  });
}

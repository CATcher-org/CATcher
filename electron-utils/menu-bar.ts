import { app } from 'electron';

// Edited version of a template menu-bar provided by the electron API,
// refer to https://electronjs.org/docs/api/menu for more information.
export const mainMenuTemplate: Electron.MenuItemConstructorOptions[] = [
    {
      label: 'File',
      submenu: [
        {
          label: 'Quit CATcher', accelerator: 'CmdOrCtrl+Q', click() { app.quit(); }
        }
      ]
    },
    {
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
    },
    {
      label: 'View',
      submenu: [
        { role: 'resetZoom' },
        { role: 'zoomIn' },
        { role: 'zoomOut' },
        { type: 'separator' },
        { role: 'togglefullscreen' }
      ]
    },
    // ,
    // {
    //   role: 'help',
    //   submenu: [
    //     {
    //       label: 'User Guide',
    //       click () { require('electron').shell.openExternal('https://catcher-org.github.io/'); }
    //     }
    //   ]
    // }
  ];
  
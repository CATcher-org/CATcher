import { app, BrowserWindow, screen, Menu, nativeTheme, MenuItemConstructorOptions, ipcMain } from 'electron';
import * as path from 'path';
import * as url from 'url';
import { createMenuOptions } from './electron-utils/menu-bar';
import { isDeveloperMode, isLinuxOs, isMacOs, isWindowsOs, appTitle } from './electron-utils/supporting-logic';
import { getAccessToken } from './oauth';

const Logger = require('electron-log');
const ICON_PATH = path.join(__dirname, 'dist/favicon.512x512.png');

let win: BrowserWindow = null;
const isDevMode = isDeveloperMode();

ipcMain.on('synchronous-message', (event) => {
  event.returnValue = isWindowsOs()
    ? isDevMode
        ? app.getAppPath()
        : process.env.PORTABLE_EXECUTABLE_FILE
    : app.getAppPath();
});

/**
 * Will start the OAuth Web Flow and obtain the access token from Github.
 */
ipcMain.on('github-oauth', (event, repoPermissionLevel) => {
  getAccessToken(win, repoPermissionLevel).then((data) => {
    event.sender.send('github-oauth-reply', {token: data.token});
  }).catch(error => {
    event.sender.send('github-oauth-reply', {
      error: error.message,
      isWindowClosed: error.message === 'WINDOW_CLOSED'});
  });
});


function createWindow() {
  Logger.info('Creating primary window.');
  const size = screen.getPrimaryDisplay().workAreaSize;
  const windowOptions = {
    x: 0,
    y: 0,
    width: size.width,
    height: size.height,
    webPreferences: {
      nodeIntegration: true,
      allowRunningInsecureContent: !isDevMode,
    },
  };

  if (isLinuxOs()) {
    // app icon needs to be set manually on Linux platforms
    windowOptions['icon'] = ICON_PATH;
  }

  // Create the browser window.
  win = new BrowserWindow(windowOptions);

  nativeTheme.themeSource = 'light';

  win.setTitle(appTitle);
  if (isDevMode) {
    require('electron-reload')(__dirname, {
      electron: require(`${__dirname}/node_modules/electron`)
    });
    win.loadURL('http://localhost:4200');
  } else {
    win.loadURL(url.format({
      pathname: path.join(__dirname, 'dist/index.html'),
      protocol: 'file:',
      slashes: true
    }));
  }

  if (isDevMode) {
    win.webContents.openDevTools();
  }

  // Emitted when the window is closed.
  win.on('closed', () => {
    // Dereference the window object, usually you would store window
    // in an array if your app supports multi windows, this is the time
    // when you should delete the corresponding element.
    win = null;
  });

}

try {
  Logger.info('Initializing Electron app.');
  // This method will be called when Electron has finished
  // initialization and is ready to create browser windows.
  // Some APIs can only be used after this event occurs.
  app.on('ready', () => {
    Logger.info('Electron app in ready state.');
    // Build and Attach Menu-bar template to application.
    const mainMenuTemplate: MenuItemConstructorOptions[] = createMenuOptions(isDevMode);
    const mainMenu = Menu.buildFromTemplate(mainMenuTemplate);
    Menu.setApplicationMenu(mainMenu);

    createWindow();
  });

  // Quit when all windows are closed.
  app.on('window-all-closed', () => {
    Logger.info('Closing all windows in Electron.');
    // On OS X it is common for applications and their menu bar
    // to stay active until the user quits explicitly with Cmd + Q
    if (!isMacOs()) {
      app.quit();
    }
  });

  app.on('activate', () => {
    Logger.info('Electron app is activated.');
    // On OS X it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (win === null) {
      createWindow();
    }
  });

} catch (e) {
  Logger.error('Something went wrong in Electron.', e);
}

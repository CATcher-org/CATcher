import { app, BrowserWindow, screen, Menu, nativeTheme, MenuItemConstructorOptions, ipcMain } from 'electron';
import * as path from 'path';
import * as url from 'url';
const nodeUrl = require('url');
const fetch = require('node-fetch');

let win: BrowserWindow = null;
const args = process.argv.slice(1),
  serve = args.some(val => val === '--serve');

const isDevMode = !!serve;

ipcMain.on('synchronous-message', (event, arg) => {
  event.returnValue = process.platform === 'win32'
    ? isDevMode
        ? app.getAppPath()
        : process.env.PORTABLE_EXECUTABLE_FILE
    : app.getAppPath();
});

/**
 * Will start the OAuth Web Flow and obtain the access token from Github.
 */
ipcMain.on('github-oauth', (event, clearAuthState) => {
  getAccessToken(win, clearAuthState).then((data) => {
    event.sender.send('github-oauth-reply', {token: data.token, isChangingAccount: clearAuthState});
  }).catch(error => {
    event.sender.send('github-oauth-reply', {
      error: error.message,
      isChangingAccount: clearAuthState,
      isWindowClosed: error.message === 'WINDOW_CLOSED'});
  });
});


function createWindow() {

  const electronScreen = screen;
  const size = screen.getPrimaryDisplay().workAreaSize;

  // Create the browser window.
  win = new BrowserWindow({
    x: 0,
    y: 0,
    width: size.width,
    height: size.height,
    webPreferences: {
      nodeIntegration: true,
      allowRunningInsecureContent: !isDevMode,
    },
  });

  nativeTheme.themeSource = 'light';

  win.setTitle(require('./package.json').name + ' ' + require('./package.json').version);
  if (serve) {
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

// Edited version of a template menu-bar provided by the electron API,
// refer to https://electronjs.org/docs/api/menu for more information.
const mainMenuTemplate: Electron.MenuItemConstructorOptions[] = [
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

if (isDevMode) {
  let viewSubMenu: MenuItemConstructorOptions[];
  viewSubMenu = mainMenuTemplate[2].submenu as MenuItemConstructorOptions[];
  viewSubMenu.push(
    { type: 'separator' },
    { role: 'toggleDevTools'}
  );
}

try {

  // This method will be called when Electron has finished
  // initialization and is ready to create browser windows.
  // Some APIs can only be used after this event occurs.
  app.on('ready', () => {

    // Build and Attach Menu-bar template to application.
    const mainMenu = Menu.buildFromTemplate(mainMenuTemplate);
    Menu.setApplicationMenu(mainMenu);

    createWindow();
  });

  // Quit when all windows are closed.
  app.on('window-all-closed', () => {
    // On OS X it is common for applications and their menu bar
    // to stay active until the user quits explicitly with Cmd + Q
    if (process.platform !== 'darwin') {
      app.quit();
    }
  });

  app.on('activate', () => {
    // On OS X it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (win === null) {
      createWindow();
    }
  });

} catch (e) {
  // Catch Error
  // throw e;
}

const CLIENT_ID = '6750652c0c9001314434';
const BASE_URL = 'https://github.com';
const ACCESS_TOKEN_URL = 'https://catcher-proxy.herokuapp.com/authenticate';
const CALLBACK_URL = 'http://localhost:4200';

let authWindow;

/**
 * Will retrieve the access token from a proxy server which acts as a intermediary to retrieve the tokens from Github.
 * @param window - The main window of CATcher.
 * @param toClearAuthState - A boolean to define whether to clear any auth cookies so prevent auto login.
 */
function getAccessToken(window: BrowserWindow, toClearAuthState: boolean): Promise<any> {
  return getAuthorizationCode(window, toClearAuthState).then((code) => {
    const accessTokenUrl = `${ACCESS_TOKEN_URL}/${code}`;
    return fetch(accessTokenUrl).then(res => res.json()).then(data => {
      if (data.error) {
        throw(new Error(data.error));
      }
      return data;
    });
  }).catch(error => {
    throw(error);
  });
}

/**
 * Get the authorization code from Github after success login.
 * @param parentWindow - The main window of CATcher
 * @param toClearAuthState - A boolean to define whether to clear any auth cookies so prevent auto login.
 */
function getAuthorizationCode(parentWindow: BrowserWindow, toClearAuthState: boolean) {
  const oauthUrl = encodeURI(`${BASE_URL}/login/oauth/authorize?client_id=${CLIENT_ID}&scope=repo,read:user`);

  return new Promise(function (resolve, reject) {
    const windowParams = {
      autoHideMenuBar: true,
      alwaysOnTop: true,
      movable: false,
      fullscreenable: false,
      parent: parentWindow,
      webPreferences: {
        nodeIntegration: true
      }
    };
    authWindow = new BrowserWindow(windowParams);

    if (toClearAuthState) {
      authWindow.webContents.session.clearStorageData();
    }
    authWindow.loadURL(oauthUrl);
    authWindow.show();

    authWindow.on('closed', (event) => {
      reject(new Error('WINDOW_CLOSED'));
    });

    authWindow.webContents.on('will-navigate', (event, newUrl) => {
      if (newUrl.startsWith(CALLBACK_URL)) {
        onCallback(newUrl);
      }
    });

    authWindow.webContents.on('will-redirect', (event, newUrl) => {
      if (newUrl.startsWith(CALLBACK_URL)) {
        onCallback(newUrl);
      }
    });

    function onCallback(callbackUrl: string) {
      const url_parts = nodeUrl.parse(callbackUrl, true);
      const query = url_parts.query;
      const code = query.code;
      const error = query.error;
      const state = query.state;

      if (error !== undefined && state !== undefined) {
        reject(error);
      } else if (code) {
        resolve(code);
      }
      setImmediate(function () {
        authWindow.close();
        authWindow.on('closed', () => {
          authWindow = null;
        });
      });
    }
  });
}

import { BrowserWindow, shell } from 'electron';

const nodeUrl = require('url');
const fetch = require('node-fetch');
const Logger = require('electron-log');

const CLIENT_ID = '6750652c0c9001314434';
const BASE_URL = 'https://github.com';
const ACCESS_TOKEN_URL = 'https://catcher-proxy.herokuapp.com/authenticate';
const CALLBACK_URL = 'http://localhost:4200';

let authWindow;

/**
 * Will retrieve the access token from a proxy server which acts as a intermediary to retrieve the tokens from Github.
 * @param window - The main window of CATcher.
 * @param repoPermissionLevel - The level of permission required to be granted by the user to use CATcher.
 */
export function getAccessToken(window: BrowserWindow, repoPermissionLevel: string): Promise<any> {
  return getAuthorizationCode(window, repoPermissionLevel).then((code) => {
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
 * @param repoPermissionLevel - The level of permission required to be granted by the user to use CATcher.
 */
function getAuthorizationCode(parentWindow: BrowserWindow, repoPermissionLevel: string) {
  const oauthUrl = encodeURI(`${BASE_URL}/login/oauth/authorize?client_id=${CLIENT_ID}&scope=${repoPermissionLevel},read:user`);

  return new Promise(function (resolve, reject) {
    const windowParams = {
      autoHideMenuBar: true,
      alwaysOnTop: false,
      fullscreenable: false,
      parent: parentWindow,
      webPreferences: {
        nodeIntegration: true
      }
    };
    authWindow = new BrowserWindow(windowParams);
    authWindow.loadURL(oauthUrl);
    authWindow.show();

    authWindow.on('closed', (event) => {
      reject(new Error('WINDOW_CLOSED'));
    });

    authWindow.webContents.on('will-navigate', (event, newUrl) => {
      if (newUrl.startsWith(CALLBACK_URL)) {
        onCallback(newUrl);
      } else {
        event.preventDefault();
        shell.openExternal(newUrl).then(() => Logger.info('External link is clicked on auth window, opening system browser...'));
      }
    });

    authWindow.webContents.on('new-window', (event, url, frameName, disposition, options) => {
      event.preventDefault();
      shell.openExternal(url).then(() => Logger.info('External link is clicked on auth window, opening system browser...'));
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

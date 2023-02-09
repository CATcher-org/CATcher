import { BrowserWindow, shell } from 'electron';
import { v4 as uuid } from 'uuid';

const nodeUrl = require('url');
const Logger = require('electron-log');
const fetch = require('node-fetch');

const CLIENT_ID = '6750652c0c9001314434';
const BASE_URL = 'https://github.com';
const ACCESS_TOKEN_URL = 'https://catcher-auth.herokuapp.com/authenticate';
const CALLBACK_URL = 'http://localhost:4200';

let authWindow;

/**
 * Will retrieve the access token from a proxy server which acts as a intermediary to retrieve the tokens from Github.
 * @param window - The main window of CATcher.
 * @param repoPermissionLevel - The level of permission required to be granted by the user to use CATcher.
 */
export function getAccessToken(window: BrowserWindow, repoPermissionLevel: string): Promise<any> {
  return getAuthorizationCode(window, repoPermissionLevel)
    .then((code) => {
      Logger.info('Obtained authorization code from Github');
      const accessTokenUrl = `${ACCESS_TOKEN_URL}/${code}`;
      return fetch(accessTokenUrl)
        .then((res) => res.json())
        .then((data: { error }) => {
          if (data.error) {
            throw new Error(data.error);
          }
          return data;
        });
    })
    .catch((error) => {
      throw error;
    });
}

/**
 * Get the authorization code from Github after success login.
 * @param parentWindow - The main window of CATcher
 * @param repoPermissionLevel - The level of permission required to be granted by the user to use CATcher.
 */
function getAuthorizationCode(parentWindow: BrowserWindow, repoPermissionLevel: string) {
  let state: string;
  state = generateStateString();
  const oauthUrl = encodeURI(
    `${BASE_URL}/login/oauth/authorize?client_id=${CLIENT_ID}&scope=${repoPermissionLevel},read:user&state=${state}`
  );

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
    Logger.info('Opening authentication window');

    authWindow.on('closed', (event) => {
      reject(new Error('WINDOW_CLOSED'));
    });

    authWindow.webContents.on('will-navigate', (event, newUrl) => {
      if (newUrl.startsWith(CALLBACK_URL)) {
        onCallback(newUrl);
      } else if (newUrl.startsWith(`${BASE_URL}/session`) || newUrl.startsWith(`${BASE_URL}/login`)) {
        // continue navigation within the auth window
        return;
      } else {
        // do not navigate to external links in the auth window
        // instead, navigate to them in the user's browser
        event.preventDefault();
        shell.openExternal(newUrl).then(() => Logger.info('External link is clicked on auth window, opening system browser...'));
      }
    });

    authWindow.webContents.on('new-window', (event, url, frameName, disposition, options) => {
      event.preventDefault();
      shell.openExternal(url).then(() => Logger.info('External link is clicked on auth window, opening system browser...'));
    });

    authWindow.webContents.on('will-redirect', (event, newUrl) => {
      Logger.info('Received redirect in auth window');
      if (newUrl.startsWith(CALLBACK_URL)) {
        onCallback(newUrl);
      }
    });

    function onCallback(callbackUrl: string) {
      const url_parts = nodeUrl.parse(callbackUrl, true);
      const query = url_parts.query;
      const code = query.code;
      const error = query.error;
      const returnedState = query.state;

      if (error !== undefined) {
        reject(error);
      } else if (isReturnedStateSame(state, returnedState) && code) {
        resolve(code);
      }
      setImmediate(function () {
        authWindow.close();
        authWindow.on('closed', () => {
          Logger.info('Closing authentication window');
          authWindow = null;
        });
      });
    }
  });
}

/**
 * Generates and assigns an unguessable random 'state' string to pass to Github for protection against cross-site request forgery attacks
 */
function generateStateString(): string {
  return uuid();
}

function isReturnedStateSame(state: string, returnedState: string): boolean {
  return state === returnedState;
}

import { BrowserWindow } from 'electron';
const nodeUrl = require('url');
const fetch = require('node-fetch');
import { randomBytes as nodeCryptoGetRandomBytes } from 'crypto';

// https://github.com/kelektiv/node-uuid#version-4
const guid = require('uuid/v4') as (options?: { random?: Buffer }) => string;

const CLIENT_ID = 'Iv1.1c0eb539036890b0';
const BASE_URL = 'https://github.com';

let authWindow;

/**
 * Will retrieve the access token from another local server which acts as a intermediary to retrieve the tokens from Github.
 * Refer to https://github.com/prose/gatekeeper on steps to set up the local server.
 * See https://github.com/isaacs/github/issues/330
 */
export function getAccessToken(win): Promise<any> {
  return getAuthorizationCode(win).then((code) => {
    const url = `http://localhost:9999/authenticate/${code}`;
    return fetch(url).then(res => res.json())
      .catch((error) => {
        throw new Error('Server response: invalid code.');
      });
  }).catch((error) => {
    throw new Error(error);
  });
}

function getAuthorizationCode(win): Promise<any> {
  const expectedState = uuid();
  const url = getOAuthAuthorizationURL(expectedState);

  return new Promise(function (resolve, reject) {
    const windowParams = {
      alwaysOnTop: true,
      autoHideMenuBar: true,
      parent: win,
      webPreferences: {
        nodeIntegration: false
      }
    };
    authWindow = new BrowserWindow(windowParams);

    authWindow.loadURL(url);
    authWindow.show();

    authWindow.on('closed', () => {
      reject(new Error('window was closed by user'));
    });

    authWindow.webContents.on('will-navigate', (event, newUrl) => {
      onCallback(newUrl);
    });

    authWindow.webContents.on('will-redirect', (event, newUrl) => {
      onCallback(newUrl);
    });

    function onCallback(callbackUrl: string) {
      const url_parts = nodeUrl.parse(callbackUrl, true);
      const query = url_parts.query;
      const code = query.code;
      const error = query.error;
      const state = query.state;

      if (error !== undefined) {
        reject(error);
      } else if (state !== undefined && expectedState !== state) {
        reject('Uninitialized OAuth process detected.');
      } else if (!code) {
        reject('Unable to obtain OAuth code.');
      }

      resolve(code);

      setImmediate(function () {
        authWindow.close();
        authWindow.on('closed', () => {
          authWindow = null;
        });
      });
    }
  });
}

function getOAuthAuthorizationURL(state: string): string {
  return `${BASE_URL}/login/oauth/authorize?client_id=${CLIENT_ID}&state=${state}`;
}

function uuid() {
  return guid({ random: nodeCryptoGetRandomBytes(16) });
}

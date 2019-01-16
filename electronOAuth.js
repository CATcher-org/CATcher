"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var electron_1 = require("electron");
var nodeUrl = require('url');
var fetch = require('node-fetch');
var crypto_1 = require("crypto");
// Work around synchronously seeding of random buffer in the v1
// version of uuid by explicitly only requiring v4. As far as I'm
// aware we cannot use an import statement here without causing webpack
// to load the v1 version as well.
//
// See
//  https://github.com/kelektiv/node-uuid/issues/189
var guid = require('uuid/v4');
var CLIENT_ID = 'Iv1.1c0eb539036890b0';
var BASE_URL = 'https://github.com';
var authWindow;
/**
 * Will retrieve the access token from another local server which acts as a intermediary to retrieve the tokens from Github.
 * Refer to https://github.com/prose/gatekeeper on steps to set up the local server.
 * See https://github.com/isaacs/github/issues/330
 */
function getAccessToken(win) {
    return getAuthorizationCode(win).then(function (code) {
        var url = "http://localhost:9999/authenticate/" + code;
        return fetch(url).then(function (res) { return res.json(); });
    });
}
exports.getAccessToken = getAccessToken;
function getAuthorizationCode(win) {
    var expectedState = uuid();
    var url = getOAuthAuthorizationURL(expectedState);
    return new Promise(function (resolve, reject) {
        var windowParams = {
            alwaysOnTop: true,
            autoHideMenuBar: true,
            parent: win,
            webPreferences: {
                nodeIntegration: false
            }
        };
        authWindow = new electron_1.BrowserWindow(windowParams);
        authWindow.loadURL(url);
        authWindow.show();
        authWindow.on('closed', function () {
            reject(new Error('window was closed by user'));
        });
        authWindow.webContents.on('will-navigate', function (event, newUrl) {
            onCallback(newUrl);
        });
        authWindow.webContents.on('will-redirect', function (event, newUrl) {
            onCallback(newUrl);
        });
        function onCallback(callbackUrl) {
            var url_parts = nodeUrl.parse(callbackUrl, true);
            var query = url_parts.query;
            var code = query.code;
            var error = query.error;
            var state = query.state;
            if (error !== undefined && state !== undefined && expectedState !== state) {
                reject(error);
            }
            else if (code) {
                resolve(code);
            }
            setImmediate(function () {
                authWindow.close();
                authWindow.on('closed', function () {
                    authWindow = null;
                });
            });
        }
    });
}
function getOAuthAuthorizationURL(state) {
    return BASE_URL + "/login/oauth/authorize?client_id=" + CLIENT_ID + "&state=" + state;
}
function uuid() {
    return guid({ random: crypto_1.randomBytes(16) });
}
//# sourceMappingURL=electronOAuth.js.map
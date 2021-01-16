"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var electron_1 = require("electron");
// Edited version of a template menu-bar provided by the electron API,
// refer to https://electronjs.org/docs/api/menu for more information.
var fileMenu = {
    label: 'File',
    submenu: [
        {
            label: 'Quit CATcher', accelerator: 'CmdOrCtrl+Q', click: function () { electron_1.app.quit(); }
        }
    ]
};
var editMenu = {
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
var viewMenu = {
    label: 'View',
    submenu: [
        { role: 'resetZoom' },
        { role: 'zoomIn' },
        { role: 'zoomOut' },
        { type: 'separator' },
        { role: 'togglefullscreen' }
    ]
};
exports.mainMenuTemplate = [fileMenu, editMenu, viewMenu];
function createDevModeMenuOptions(isDevMode) {
    if (isDevMode) {
        var viewSubMenu = void 0;
        viewSubMenu = exports.mainMenuTemplate[2].submenu;
        viewSubMenu.push({ type: 'separator' }, { role: 'toggleDevTools' });
    }
}
exports.createDevModeMenuOptions = createDevModeMenuOptions;
//# sourceMappingURL=menu-bar.js.map
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
function isDeveloperMode() {
    var args = process.argv.slice(1), serve = args.some(function (val) { return val === '--serve'; });
    return !!serve;
}
exports.isDeveloperMode = isDeveloperMode;
function isWindowsOs() {
    return process.platform === 'win32';
}
exports.isWindowsOs = isWindowsOs;
function isMacOs() {
    return process.platform === 'darwin';
}
exports.isMacOs = isMacOs;
function isLinuxOs() {
    return process.platform === 'linux';
}
exports.isLinuxOs = isLinuxOs;
exports.appTitle = require('../package.json').name + ' ' + require('../package.json').version;
//# sourceMappingURL=supporting-logic.js.map
import { app } from 'electron';

export function isDeveloperMode(): boolean {
  const args = process.argv.slice(1),
    serve = args.some((val) => val === '--serve');
  return !!serve;
}

export function isWindowsOs(): boolean {
  return process.platform === 'win32';
}

export function isMacOs(): boolean {
  return process.platform === 'darwin';
}

export function isLinuxOs(): boolean {
  return process.platform === 'linux';
}

export function getCurrentDirectory(isWindowsOs: boolean, isDevMode: boolean): string {
  return isWindowsOs ? (isDevMode ? app.getAppPath() : process.env.PORTABLE_EXECUTABLE_FILE) : app.getAppPath();
}

export const appTitle: string = require('../package.json').name + ' ' + require('../package.json').version;

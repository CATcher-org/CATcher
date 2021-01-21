export function isDeveloperMode(): boolean {
    const args = process.argv.slice(1),
    serve = args.some(val => val === '--serve');
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

export const appTitle: string = require('../package.json').name + ' ' + require('../package.json').version;

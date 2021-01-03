const log = require('electron-log');

const Logger = {
  info(...params: any[]) {
    log.info(params);
  },

  error(...params: any[]) {
    log.error(params);
  },

  warn(...params: any[]) {
    log.warn(params);
  },

  debug(...params: any[]) {
    log.debug(params);
  },
};

export default Logger;

export const BaseConfig = {
  githubUrl: 'https://github.com',
  accessTokenUrl: 'https://catcher-auth.herokuapp.com/authenticate',
  clientDataUrl: 'https://raw.githubusercontent.com/CATcher-org/client_data/master/profiles-dev.json'
};

const appSetting = require('../../package.json');

export function generateDefaultEnv() {
  return {
    ...BaseConfig,
    version: appSetting.version,
    production: false,
    test: false,
    clientId: '0cbc5e651d8b01e36687',
    origin: 'http://localhost:4200'
  };
}

export function generateTestEnv() {
  return {
    ...generateDefaultEnv(),
    test: true,
    role: 'student',
    username: 'CAT-Tester',
    team: 'CS2103T-W12-3'
  };
}

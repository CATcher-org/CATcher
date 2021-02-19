// Protractor configuration file, see link for more information
// https://github.com/angular/protractor/blob/master/lib/config.ts
// Browser Setup information can be found in the link below
// https://github.com/angular/protractor/blob/master/docs/browser-setup.md

// Used to run E2E tests with GH Actions (in Headless Mode)

protractorBaseConfig = require('./protractor.base.conf');
const config = protractorBaseConfig.config;

config.multiCapabilities = [
  {
    browserName: 'chrome',
    chromeOptions: {
      args: ['--headless', '--no-sandbox', '--disable-gpu']
    }
  },
  {
    browserName: 'firefox',
    'moz:firefoxOptions': {
      args: ['--headless']
    }
  }
];

exports.config = config;

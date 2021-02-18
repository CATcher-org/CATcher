// Protractor configuration file, see link for more information
// https://github.com/angular/protractor/blob/master/lib/config.ts
// Used to run E2E tests with Firefox (in headless mode)

protractorBaseConfig = require('./protractor.base.conf');
const config = protractorBaseConfig.config;
config.capabilities = {
  browserName: 'firefox',
  'moz:firefoxOptions': {
    args: ['--headless']
  }
};

exports.config = config;

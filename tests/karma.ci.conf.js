let ciProperties;
let baseConfigs = require('./karma.conf.js');
baseConfigs({
  set: function (arg) {
    ciProperties = arg;
  }
});

// Set CI specific settings
// Include Firefox as a testing environment
ciProperties.plugins.push(require('karma-firefox-launcher'));
ciProperties.browsers.push('FirefoxHeadless');

module.exports = function (config) {
  config.set(ciProperties);
};

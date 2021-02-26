// Protractor configuration file, see link for more information
// https://github.com/angular/protractor/blob/master/lib/config.ts

const { SpecReporter } = require('jasmine-spec-reporter');

exports.config = {
  allScriptsTimeout: 25000,
  delayBrowserTimeInSeconds: 0,
  suites: {
    login: './spec/login/*.e2e-spec.ts',
    bugReporting: './spec/bugReporting/*.e2e-spec.ts'
  },
  directConnect: true,
  baseUrl: 'http://localhost:4200/',
  framework: 'jasmine2',
  jasmineNodeOpts: {
    showColors: true,
    defaultTimeoutInterval: 30000,
    print: function () { },
    realtimeFailure: true
  },
  useAllAngular2AppRoots: true,
  random: false,
  onPrepare() {
    jasmine.getEnv().addReporter(new SpecReporter({ spec: { displayStacktrace: true } }));
    require('ts-node').register({
      project: 'e2e/tsconfig.e2e.json'
    });
  }
};

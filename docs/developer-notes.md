# Setting up 
This section guides you through the steps required to set up your computer for developing CATcher.

## Prerequisites
You need Node 12 to develop this project. 
Run `node -v` in your OS terminal to check the version of Node on your computer. 

If you do not have Node 12 installed in your computer, click on [this link](https://nodejs.org/en/blog/release/v12.20.0/) to download Node 12. 

## Getting Started
1. Fork this repository into your Github account.

2. Clone the forked repository into your computer.

3. Install dependencies with npm: Run `npm install`.

4. Compile and start the application: Run `npm start`.

## Debugging with Visual Studio Code
You can use Visual Studio Code to debug CATcher with Chrome, Firefox or Edge.
Refer to the `Debugging Angular` section of [this guide](https://code.visualstudio.com/docs/nodejs/angular-tutorial#_debugging-angular) for a step-by-step walkthrough of the debugger setup.

In summary, the following steps are needed:

1. Install the `Debugger for Chrome` extension for VS Code. You can also install debugger extensions for Firefox and Edge.

2. Create VS Code's debugger config file (`launch.json` ) as shown in [the guide](https://code.visualstudio.com/docs/nodejs/angular-tutorial#_debugging-angular). Particularly, set the `url` attribute to `http://localhost:4200` (reason: CATcher app is served locally on port 4200, by default.)

3. In the root project folder, run `npm run ng:serve:web`.

4. In VS Code's Debug View, launch the debugger by clicking the green arrow (or F5). You should see the CATcher app loading within a new browser window.

# Commands
This section shows you different commands you can run to build the application in different operating systems.

|Command|Description|
|--|--|
|`npm start`| Start the app from Electron in development mode. |
|`npm run ng:serve:web`| Start the app from the browser in development mode. |
|`npm run build`| Build the app. Your built files are in the /dist folder. |
|`npm run build:prod`| Build the app with Angular aot. Your built files are in the /dist folder. |
|`npm run electron:local`| Builds your application and start electron
|`npm run electron:linux`| Builds your application and creates an app consumable on linux system |
|`npm run electron:windows`| On a Windows OS, builds your application and creates an app consumable in windows 32/64 bit systems |
|`npm run electron:mac`|  On a MAC OS, builds your application and generates a `.app` file of your application that can be run on Mac |
|`npm run deploy:web`| Will deploy the app onto the Github's `gh-pages` branch. <br/> Prerequisites:<br/> 1. Add Environment variable of `GH_TOKEN=<Github Personal Access Token>` with the permission of `repo`. <br/>2. `build:prod:web` command's `--base-href` argument in `package.json` must have the following format `https://<OrgName or Username>.github.io/CATcher/`. <br/> 3. If you are deploying outside of CATcher-org then it would be necessary to create a new OAuth application and change the `clientId` in `environment.prod.ts` <br/> 4. If you are deploying outside of CATcher-org, you would also need to deploy your own instance of proxy server using [gatekeeper](https://github.com/CATcher-org/gatekeeper) and change the appropriate variables in `environment.prod.ts`. |
| `npm run lint` | Runs the linter (TSLint) |
| `npm run test` | Runs the tests           |
| `npm run test -- "--code-coverage"` | Runs the tests and generates code coverage report under `tests/coverage` folder |

# Workflow

The following is the workflow that contributors need to follow when proposing changes to CATcher.

## Submitting PRs

When a pull request is merged, it should be accompanied by a helpful commit message. Hence, contributors are recommended to propose a commit message for their pull requests.
[Here](https://oss-generic.github.io/process/docs/FormatsAndConventions.html#commit-message) are
some good guidelines for crafting the commit message.

## Testing

We use [Scuri](https://github.com/gparlakov/scuri) to generate spec files for unit tests.
Scuri uses [Jasmine's spy feature](https://jasmine.github.io/2.0/introduction.html#section-Spies) to stub dependencies.

### Generating Spec Files

- To generate spec files for files that have none:
    Run `npm run ng g scuri:spec --name src/app/app.component.ts`

- To generate spec files for files that have existing spec files:  
    Run `npm run ng g scuri:spec --name src/app/app.component.ts --force`

### Style Guide 

We loosely follow the [Jasmine Style Guide](https://github.com/CareMessagePlatform/jasmine-styleguide) when writing tests. 
One main guideline is that a `describe` block should be created for each method / scenario under test, and an `it` block should be created for each property being verified.

# E2E Testing

## Running E2E Tests

E2E Tests can be executed using `npm run e2e`. You should see CATcher launch in an instance of Google Chrome, with some automated actions occurring on it. Note: Google Chrome needs to be installed on the machine.

Unlike the production version of CATcher, we do not use the actual GitHub API in the E2E tests. Mock data is used to simulate the GitHub API. You can run `npm run ng:serve:test` to run CATcher in this "offline" mode (to further develop or debug the E2E tests).
The following additional parameters would allow for further customisation,

| Additional Parameter | Default | Description | Full Command Example | Command Explanation
| :---: | :---: | :-----: | :-------: | :------: |
| `--protractor-config=e2e/protractor.*.conf.js` | `protractor.conf.js` | Allows selection of the Protractor configuration file | `npm run e2e -- --protractor-config=e2e/protractor.firefox.conf.js` | Runs E2E Tests on the Firefox Browser |
| `--suite=*` | All Suites | Runs E2E Tests for specific suites | `npm run e2e -- --suite=login,bugReporting` | Run E2E Tests from Login and BugReporting Suites only |

**TO NOTE:**
- Relevant Browsers must be installed prior to running tests (i.e. Chrome, Firefox).

## Troubleshooting conflicts between the versions of the browser and browser driver

If tests fail on your machine due to mismatches between the versions of the browser and the browser driver, you can use the [`webdriver-manager`](https://github.com/angular/webdriver-manager#readme) tool to install the right version of the driver.  By default, running `webdriver-manager update` updates all drivers to the latest version, but particular versions can be specified as options.

## Protractor Configuration

E2E Tests are run using [Protractor](http://www.protractortest.org/#/) testing framework.

- Protractor primarily requires the `*.conf.js` files to define E2E Testing Environments (this includes Browser Details, Base URL, etc...)
- The base configuration data is stored in `protractor.base.conf.js` which is then extended by separate configuration files for individual browsers as well as the CI/CD pipeline.
- E2E Tests are typically split into `Page-Objects Files` and `Test Files` in accordance with the [Protractor Style Guide](http://www.protractortest.org/#/style-guide) (more information regarding the interaction between the aforementioned filetypes can be found there).
- E2E Tests are also grouped into suites based on the Application's Phase (i.e. Login, Bug-Reporting). Currently defined suite information is located in the `protractor.base.conf.js` file as well.

## How the E2E tests work

E2E Tests are run with the following stages:
1. Build CATcher using `test` architecture
   - Using `test` build configuration located in `angular.json` under `projects.catcher.architect.configurations` we build a version of CATcher within a test environment that replaces `src/environments/environment.ts` with `src/environments/environment.test.ts` on runtime. This file provides data that allows CATcher to switch into "E2E test" mode.
2. Provide Test Environment Information
   - The Test Environment (in `src/environments/environment.test.ts`) provides information such as,
     - Login Credentials (Username).
     - User Role and Team Information.
     - A `test` flag that is set to `true`, so that CATcher switches into "E2E test mode"
3. Mock Service Injections
   - Once CATcher switches to E2E test mode, it creates mocks of some services, in order to simulate behaviour that is outside the scope of E2E Testing. This includes authentication, and communication with GitHub (via its APIs).
   - These Service Injections are carried out in the respective `*-module.ts` files with the help of Factories (located in `/src/app/core/services/factories`) that check the current build environment and make the Service Replacements accordingly.
4. Browser Action Automation using Protractor
   - With the application ready for testing, we then utilize `Protractor` to run test cases that are located in the `/e2e` directory.

# Implementation

## Overview
To understand how the various types of users (software testers, developers, tutors) interact with CATcher, refer to the README at the [templates](https://github.com/CATcher-org/templates) repository. This document also provides the formats that must be followed in order for GitHub comments to be successfully parsed by CATcher.

## User authentication

CATcher uses the OAuth 2.0 protocol to authenticate users. Below is a summary of the authentication process:

1. A user launches CATcher, and is prompted to log into GitHub. This is a direct interaction between the user and GitHub. Once the user has logged in, GitHub provides CATcher with an authorization code meant for this user.

2. CATcher sends this authorization code and its own client secret to GitHub's authorization server - in exchange for an access token.

3. Authentication is complete, and CATcher can now use the access token when it uses the GitHub API for its logic (e.g. submitting new issues, editing existing issues)

The authentication process is kicked off in the `AuthComponent`, but the code that co-ordinates steps 1 and 2 can be found in [`oauth.ts`](../oauth.ts)(For Electron) or `AuthService`(For Web). Step 2 requires a client secret granted to CATcher. To protect this, we run a web service, [gatekeeper](https://github.com/CATcher-org/gatekeeper) that executes step 2 on behalf of the client CATcher app.

## Logging

CATcher caches log data in `localStorage` within the browser, and these logs can be downloaded as a text file. The app's `LoggingService` exposes methods for logging error, warning or informational messages, and uses the `localStorage` API  under-the-hood. `LoggingService` can be used in any component / service, as needed for the app's logging purposes. `LoggingService` stores the logs for each session together, in sequence.

To ensure that all runtime errors are logged, CATcher's `ErrorHandlingService` implements the [ErrorHandler class](https://angular.io/api/core/ErrorHandler) and then invokes `LoggingService` in its `handleError` method.

# Releasing a new version of CATcher

Releasing a new version of CATcher involves the following steps:
  - Update CATcher's version number in `package.json`
  - Build the CATcher desktop application's executables for Linux, MacOS and Windows
  - Build the CATcher web app, and then deploy it onto our GitHub Pages site (https://catcher-org.github.io/CATcher/)
  - Create a release on GitHub, upload the desktop app's executables and write a changelog that describes any new features or bug fixes.

We have a GitHub Actions' workflow that can perform many of the tasks above in a single-click.

Follow these steps to create a release using this workflow:
  - Create and Merge a Pull Request that updates the version of the application in the `package.json` file.
  - Navigate to the 'Actions' Tab of the `CATcher` repository and start the `Draft Deployment` Workflow. This workflow deploys the web app and creates a Draft Release containing the desktop app's executables
  - Edit the Draft Release and update the description with a changelog of recently merged Pull Requests.
  - Publish the release.


# Future Developments
Here are a few suggestions that future developers can work on to improve this application!

## Support Commenting
Currently, the application only support 1 response for each phase. So a commenting section would be good to allow discussions between team members as well as between tutors and admins. 

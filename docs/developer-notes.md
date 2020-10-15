# Getting started
1. Fork this repository into your Github account.

2. Clone the forked repository into your computer.

3. Make sure you are using Node 12 for this project.

4. Install dependencies with npm: `npm install` 

5. Compile and start the application: `npm start`

# Commands
Before building the application using the build commands below, go to `index.html` and comment out the necessary `base href` as explained in the file. 
|Command|Description|
|--|--|
|`npm run build`| Build the app. Your built files are in the /dist folder. |
|`npm run build:prod`| Build the app with Angular aot. Your built files are in the /dist folder. |
|`npm run electron:local`| Builds your application and start electron
|`npm run electron:linux`| Builds your application and creates an app consumable on linux system |
|`npm run electron:windows`| On a Windows OS, builds your application and creates an app consumable in windows 32/64 bit systems |
|`npm run electron:mac`|  On a MAC OS, builds your application and generates a `.app` file of your application that can be run on Mac |
| `npm run lint` | Runs the linter (TSLint) |

# Workflow
When a pull request is merged, it should be accompanied by a helpful commit message.
[Here](https://oss-generic.github.io/process/docs/FormatsAndConventions.html#commit-message) are
some good guidelines for crafting the commit message.

Contributors can propose a commit message for their pull requests.

# Testing

We use [Scuri](https://github.com/gparlakov/scuri) to generate spec files for unit tests.

To generate spec files for files that have none.
`npm run ng g scuri:spec --name src/app/app.component.ts`

To generate spec files for files that have existing spec files.
`npm run ng g scuri:spec --name src/app/app.component.ts --force`

Scuri uses [Jasmine's spy feature](https://jasmine.github.io/2.0/introduction.html#section-Spies) to stub dependencies.

We loosely follow [this style guide](https://github.com/CareMessagePlatform/jasmine-styleguide) when writing tests. One main guideline is that a `describe` block should be created for each method / scenario under test, and an `it` block should be created for each property being verified.

# Implementation

## Overview
To understand how the various types of users (software testers, developers, tutors) interact with CATcher, refer to the README at the [templates](https://github.com/CATcher-org/templates) repository. This document also provides the formats that must be followed in order for GitHub comments to be successfully parsed by CATcher.

## User authentication

CATcher uses the OAuth 2.0 protocol to authenticate users. Below is a summary of the authentication process:

1. A user launches CATcher, and is prompted to log into GitHub. This is a direct interaction between the user and GitHub. Once the user has logged in, GitHub provides CATcher with an authorization code meant for this user.

2. CATcher sends this authorization code and its own client secret to GitHub's authorization server - in exchange for an access token.

3. Authentication is complete, and CATcher can now use the access token when it uses the GitHub API for its logic (e.g. submitting new issues, editing existing issues)

The authentication process is kicked off in the `AuthComponent`, but the code that co-ordinates steps 1 and 2 can be found in [`oauth.ts`](../oauth.ts). Step 2 requires a client secret granted to CATcher. To protect this, we run a web service, [gatekeeper](https://github.com/CATcher-org/gatekeeper) that executes step 2 on behalf of the client CATcher app.


# Future Developments
Here are a few suggestions that future developers can work on to improve this application!

## Support Commenting
Currently, the application only support 1 response for each phase. So a commenting section would be good to allow discussions between team members as well as between tutors and admins. 

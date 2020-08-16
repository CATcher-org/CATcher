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

# Future Developments
Here are a few suggestions that future developers can work on to improve this application!

## Support Commenting
Currently, the application only support 1 response for each phase. So a commenting section would be good to allow discussions between team members as well as between tutors and admins. 

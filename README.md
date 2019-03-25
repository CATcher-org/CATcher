# Introduction

CATcher is an online application for peer-testing of software projects.

Project structure cloned and modified from https://github.com/maximegris/angular-electron.

Currently runs with:

- Angular v7.2.10
- Electron v4.0.0
- Electron Builder v20.28.1

## Getting Started

1. Clone this repository locally.

2. Install dependencies with npm :

``` bash
npm install
```

## Setting up Github Repositories
This application assumes 4 repositories will be created (Note that the naming of repository must follow **exactly** as what is specified below.
### `public_data` Repository
This repository must contain 1 file called `data.json`. In this JSON file, it will contain the following information:
1. Roles of users. (Student, Tutor, Admin)
2. Team structure. For each team, the JSON must specify which student is in that team.
3. Student's team allocation. For each student, the JSON must specify which team the student is in.
4. Tutor's team allocation. For each tutor, the JSON must specify which team the tutor is responsible for.
5. Admin's team allocation. For each admin, the JSON must specify which team the admin is responsible for. (The application will still give admin full access to the repository.)
### `pe` Repository
This repository will be used for the bug reporting where students can report bugs of the team which they are testing.

All the issues that are posted from the application will be posted into this repository. In addition, the files that are uploaded from the application will be uploaded into the `/file` folder of this repository.

### `pe-results` Repository
After bug reporting phase is completed, the issues posted during that stage will be transferred over to this repository (Note that the poster of the issue will be anonymized).

This repository will then be used by the application for individual teams to respond to the bugs that are discovered by the testers testing their application.

### `pe-evaluation` Repository
After the teams have responded to the bugs reported by their testers. The issues and their respective responses from `pe-results` will be transferred over to this repository. 

The application will then use this repository to post tutor's or admin's evaluation of each team's response and their respective bug report.


## To build for development

- **in a terminal window** -> npm start

The application code is managed by `main.ts`. In this sample, the app runs with a simple Angular App (http://localhost:4200) and an Electron window.
The Angular component contains an example of Electron and NodeJS native lib import.
You can disable "Developer Tools" by commenting `win.webContents.openDevTools();` in `main.ts`.

## Commands

|Command|Description|
|--|--|
|`npm run build`| Build the app. Your built files are in the /dist folder. |
|`npm run build:prod`| Build the app with Angular aot. Your built files are in the /dist folder. |
|`npm run electron:local`| Builds your application and start electron
|`npm run electron:linux`| Builds your application and creates an app consumable on linux system |
|`npm run electron:windows`| On a Windows OS, builds your application and creates an app consumable in windows 32/64 bit systems |
|`npm run electron:mac`|  On a MAC OS, builds your application and generates a `.app` file of your application that can be run on Mac |

# 1. Introduction

**CAT**cher is a desktop application for **C**rowed-sourced **A**nonymous **T**esting software. It uses GitHub as the backend for hosting bug reports.

Project structure is adapted from, https://angular.io/guide/styleguide#overall-structural-guidelines and https://github.com/maximegris/angular-electron.

Currently runs with:

- Angular v7.2.10
- Electron v4.0.0
- Electron Builder v20.28.1

This application will support the following order of workflow:
1. **Bug Reporting**: Testers will be informed of the teams they will be testing. Following which, they will be able to start creating new bug reports during this phase.
2. **Team's Response**: Teams will be able to respond to the bugs that are reported during the bug _reporting phase_.
3. **Evaluation**: Tutors and Admins will be able to view the bug reports and their respective teams' response. They can evaluate the responses, change the severity and status of the bug reports if needed.

# 2. Getting Started

## 2.1. Set up Organization
A Github organization must be created first. The organization must have the following settings:
1. Set `Base Permissions` to `None`.
    1. Under `Settings` page of your organization, click on `Member privileges` navigation tab.
    2. Under `Base permissions`, select `None`.
2. Create `admins` team.
3. Create `students` team.
4. Create `tutors` team.
5. Invite github users into their respective teams.


## 2.2. Set up Github Repositories
This application assumes 4 repositories will be created under the above organization.

For each phase, users with write access will be able to upload files (e.g. screenshots, .txt files, etc...) onto the repository's `/file` folder. These files are used in conjuction with issue description and comments in a form of a link. As for images, the actual image will be displayed.

### 2.2.1. `public_data` Repository
The name of this repository must be **exactly** `public_data`. This repository must contain 1 file called `data.json`. In this JSON file, it will contain the following information:
1. Roles of users. (Student, Tutor, Admin)
2. Team structure. For each team, the JSON must specify which student is in that team.
3. Student's team allocation. For each student, the JSON must specify which team the student is in.
4. Tutor's team allocation. For each tutor, the JSON must specify which team the tutor is assigned to.
5. Admin's team allocation. For each admin, the JSON must specify which team the admin is responsible for. (The application will still give admin full access to the repository.)

An example of `data.json`: https://github.com/CATcher-org/public_data/blob/master/data.json

### 2.2.2. Bug Reporting Repository
All the bug reports that are created from the application will be posted into this repository.

This repository must include the following issue tags:
1. **Severity**: `severity.High`, `severity.Medium`, `severity.Low`
2. **Type**: `type.DocumentationBug`, `type.FunctionalityBug`

### 2.2.3. Team's Response Repository
After the bug reporting phase, the issues posted during that phase will be transferred over to this repository, with the identity of the poster anonymized.

This repository will then be used by the application for individual teams to respond to the bugs that are discovered by the testers testing their application.

This repository must include the following issue tags:
1. **Severity**: `severity.High`, `severity.Medium`, `severity.Low`
2. **Type**: `type.DocumentationBug`, `type.FunctionalityBug`
3. **Response**: `response.Accepted`, `response.CannotReproduce`, `response.IssueUnclear`, `response.Rejected`
4. **Status**: `status.Done`, `status.Incomplete`
5. **Team**: `team.*`, with the star representing the team number.
7. **Tutorial**: `tutorial.*`, with the star representing tutorial name.
8. **Duplicate**: `duplicate`

**Team** and **Tutorial** tags are compulsory tags for each issue.

### 2.2.4. Evaluation Repository
After the teams have responded to the bugs reported by their testers. The issues and their respective responses from `pe-results` will be transferred over to this repository. 

The application will then use this repository to post tutor's or admin's evaluation of each team's response and their respective bug report.

This repository must include the following issue tags:
1. **Severity**: `severity.High`, `severity.Medium`, `severity.Low`
2. **Type**: `type.DocumentationBug`, `type.FunctionalityBug`
3. **Response**: `response.Accepted`, `response.CannotReproduce`, `response.IssueUnclear`, `response.Rejected`
4. **Team**: `team.*`,  with the star representing the team number.
5. **Tutorial**: `tutorial.*`, with the star representing tutorial name.
6. **Duplicate**: `duplicate`

**Team** and **Tutorial** tags are compulsory for each issue.

## 2.3. Set up access rights
For each of the teams, follow the steps below to assign the right access level to the repositories. 
1. Go to their respective team page on Github.
2. Click on `Repositories` navigation tab.
3. Add the following repositories with the respective access right level as desribed below.
    1. For `admins` team.
        1. pe: `Admin`
        2. pe-results: `Admin`
        3. pe-evaluation: `Admin`
    2. For `students` team.
        1. pe: `Write`
        2. pe-results: `Write`
    3. For `tutors` team.
        1. pe: `Read`
        2. pe-results: `Read`
        3. pe-evaluation: `Write`

## 2.4. The Application
You can download the latest release from https://github.com/CATcher-org/CATcher/releases

Start the application by clicking on the executable file, no installation is required.

The login page will be displayed.
![login](https://i.imgur.com/zb1tN2k.png)

Use your Github credentials for username and password.

**Encoded Text** will contain the urls of the 3 different repositories that are created in Section 2.2.2, 2.2.3 and 2.2.4.

# 3. Development
1. Clone this repository locally.

2. Install dependencies with npm: `npm install` 

3. Compile and start the application: `npm start`

After compilation, an application window will start up which runs on localhost:4200. You can disable "Developer Tools" by commenting `win.webContents.openDevTools();` in `main.ts`.

# 4. Commands

|Command|Description|
|--|--|
|`npm run build`| Build the app. Your built files are in the /dist folder. |
|`npm run build:prod`| Build the app with Angular aot. Your built files are in the /dist folder. |
|`npm run electron:local`| Builds your application and start electron
|`npm run electron:linux`| Builds your application and creates an app consumable on linux system |
|`npm run electron:windows`| On a Windows OS, builds your application and creates an app consumable in windows 32/64 bit systems |
|`npm run electron:mac`|  On a MAC OS, builds your application and generates a `.app` file of your application that can be run on Mac |

# 5. Future Developments
Here are a few suggestions that future developers can work on to improve this application!

## 5.1. Support Commenting
Currently, the application only support 1 response for each phase. So a commenting section would be good to allow discussions between team members as well as between tutors and admins. 

## 5.2. Poll for updates
The state of the application is based on the initial log-in in which the data will be pulled from Github. However, this state is not updated as the user uses the application. This might lead to problems where the user is shown an outdated version of an issue.

## 5.3. Add Tester's response phase (Right after the Team's Response)
The rational for this phase is to ease the workload of tutors and admins during the evaluation phase. In this phase, testers who reported the bug will be able to look at the team's response to their bug report. If they think that the response is unjust, they can object it.

During the evaluation phase, the tutors and admins just need focus on those bug reports with objections. Those without objections will not be moderated.


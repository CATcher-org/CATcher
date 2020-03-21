# 1. Introduction

[![Build Status](https://travis-ci.org/CATcher-org/CATcher.svg?branch=master)](https://travis-ci.org/CATcher-org/CATcher)

**CAT**cher is a desktop application for **C**rowd-sourced **A**nonymous **T**esting software. It uses GitHub as the backend for hosting bug reports.

This application will support the following order of workflow:
1. **Bug Reporting**: Testers will be informed of the teams they will be testing. Following which, they will be able to start creating new bug reports during this phase.
2. **Team's Response**: Teams will be able to respond to the bugs that are reported during the bug _reporting phase_.
3. **Tester's Response**: Testers will be able to respond to the team's acknowledgement / rejection of the bugs submitted.
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
6. Start CATcher app and log in by clicking on the OAuth button. Authorize OAuth app access to your account.
7. **Request access** to your organization as shown in this [tutorial](https://help.github.com/en/github/setting-up-and-managing-your-github-user-account/requesting-organization-approval-for-oauth-apps).
8. **Grant** CATcher OAuth App access into the organization as shown in this [tutorial](https://help.github.com/en/github/setting-up-and-managing-organizations-and-teams/approving-oauth-apps-for-your-organization).


## 2.2. Set up Github Repositories
This application requires 4 separate repositories.
1. Settings Repository
2. Bug Testing Phase / Tester's Response Phase Repository (**Both** phases utilize the same repository)
3. Team's Response Phase Repository
4. Moderation Phase Repository

For each phase, users with write access will be able to upload files (e.g. screenshots, .txt files, etc...) onto the repository's `/file` folder. These files are used in conjuction with issue description and comments in a form of a link. As for images, the actual image will be displayed.

**NOTE**: The repositories used in the *Bug Reporting Phase* and *Tester's Response Phase* are to be located in the individual User's Repository.

### 2.2.1. Settings Repository
The name of this repository must be stated in the application during login. This repository must contain a **`data.csv`** and a **`settings.json`** file. 

The `data.csv` file, must contain the following information:
1. Roles of users. (Student, Tutor, Admin)
2. Student's team allocation. For each student, the `.csv` file must specify which team the student is in.
3. Tutor's team allocation. For each tutor, the `.csv` must specify which teams the tutor is assigned to.

An example of `data.csv`: https://github.com/CATcher-org/public_data/blob/master/data.csv

The `settings.json` file must contain the following information:
1. The list of open phases represented by `"openPhases": []`.
2. The name of the repository that each phase is to utilize.

An example of `settings.json`: https://github.com/CATcher-org/public_data/blob/master/settings.json

### 2.2.2. Bug Reporting Repository
All the bug reports that are created from the application will be posted into this repository.

### 2.2.3. Team's Response Repository
After the bug reporting phase, the issues posted during that phase will be transferred over to this repository, with the identity of the poster anonymized.

This repository will then be used by the application for individual teams to respond to the bugs that are discovered by the testers testing their application.

### 2.2.4 Tester's Response Repository
After the teams have responded to the bugs reported by their testers, the issues posted during that phase will be transferred over to this repository, with the identity of the poster anonymized.

This repository will then be used by the application for individual tester to respond to the team's assessment of the bug they had reported initially.

### 2.2.5. Evaluation Repository
After the testers have responded to the bug report responses. The issues and their respective information from the Tester's Response Phase will be transferred over to this repository. 

The application will then use this repository to post tutor's or admin's evaluation of each team's response and their respective bug report.

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

A page prompting you to enter the session you are participating in using the dropdown.
![session_select](https://imgur.com/nBOy7zH.png)

### 2.4.1. For Mac Users
To run CATcher on MacOS, go to "Security & Privacy" and select "Open Anyway" for CATcher.

<img width="1208" alt="Screenshot 2020-01-19 at 11 05 57 AM" src="https://user-images.githubusercontent.com/22557857/72704060-90461f00-3b92-11ea-97ad-5d8fbbbd5bf0.png">

### 2.4.2 For Linux Users
After downloading the AppImage file, you should be able to run CATcher by clicking on the
AppImage file.
If this does not work, you may need to allow the file to be executed.
There are 2 methods to achieve this:
- From the GUI: Right click on the file icon, select `Properties`, select `Permissions`
  and enable the `Allow executing file as program` option. The exact steps may vary based
  on the Linux distribution.
- From the command line: Use `chmod +x CATcher-x.y.z.AppImage`

### 2.4.2. Troubleshooting
1. Copy and pasting images into the text editor for Mac Users

    You may find you are not able to copy (Cmd+c) and paste (Cmd+v) an image from the "Preview" application. As a workaround,     there are other ways to paste stuff into the text editor such as dragging and dropping a screenshot image or a file.

# 3. Development
1. Fork this repository into your Github account.

2. Clone the forked repository into your computer.

3. Make sure you are using Node 12 for this project.

4. Install dependencies with npm: `npm install` 

5. Compile and start the application: `npm start`

# 4. Commands
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

# 5. Future Developments
Here are a few suggestions that future developers can work on to improve this application!

## 5.1. Support Commenting
Currently, the application only support 1 response for each phase. So a commenting section would be good to allow discussions between team members as well as between tutors and admins. 


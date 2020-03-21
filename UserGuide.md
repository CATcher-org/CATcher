# CATcher - User Guide

* [Running CATcher on your computer](#running-catcher-on-your-computer)

* [Setting up the required GitHub organisation and repositories](./UserGuide.md#setting-up-the-required-github-organisation-and-repositories) (for **admin** users)

## Running CATcher on your computer
You can download the latest release from https://github.com/CATcher-org/CATcher/releases

Start the application by clicking on the executable file, no installation is required.

A page prompting you to enter the session you are participating in using the dropdown.
![session_select](https://imgur.com/nBOy7zH.png)

### For Mac Users
To run CATcher on MacOS, go to "Security & Privacy" and select "Open Anyway" for CATcher.

<img width="1208" alt="Screenshot 2020-01-19 at 11 05 57 AM" src="https://user-images.githubusercontent.com/22557857/72704060-90461f00-3b92-11ea-97ad-5d8fbbbd5bf0.png">

#### Troubleshooting
1. Copy and pasting images into the text editor for Mac Users

    You may find you are not able to copy (Cmd+c) and paste (Cmd+v) an image from the "Preview" application. As a workaround,     there are other ways to paste stuff into the text editor such as dragging and dropping a screenshot image or a file.

### For Linux Users
After downloading the AppImage file, you should be able to run CATcher by clicking on the
AppImage file.
If this does not work, you may need to allow the file to be executed.
There are 2 methods to achieve this:
- From the GUI: Right click on the file icon, select `Properties`, select `Permissions`
  and enable the `Allow executing file as program` option. The exact steps may vary based
  on the Linux distribution.
- From the command line: Use `chmod +x CATcher-x.y.z.AppImage`

## Setting up the required GitHub organisation and repositories
This section is not relevant for bug reporters or developers.
It is only for admin users.

### Set up Organization
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


### Set up Github Repositories
This application requires 4 separate repositories.
1. Settings Repository
2. Bug Testing Phase / Tester's Response Phase Repository (**Both** phases utilize the same repository)
3. Team's Response Phase Repository
4. Moderation Phase Repository

For each phase, users with write access will be able to upload files (e.g. screenshots, .txt files, etc...) onto the repository's `/file` folder. These files are used in conjuction with issue description and comments in a form of a link. As for images, the actual image will be displayed.

**NOTE**: The repositories used in the *Bug Reporting Phase* and *Tester's Response Phase* are to be located in the individual User's Repository.

#### Settings Repository
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

#### Bug Reporting Repository
All the bug reports that are created from the application will be posted into this repository.

#### Team's Response Repository
After the bug reporting phase, the issues posted during that phase will be transferred over to this repository, with the identity of the poster anonymized.

This repository will then be used by the application for individual teams to respond to the bugs that are discovered by the testers testing their application.

#### Tester's Response Repository
After the teams have responded to the bugs reported by their testers, the issues posted during that phase will be transferred over to this repository, with the identity of the poster anonymized.

This repository will then be used by the application for individual tester to respond to the team's assessment of the bug they had reported initially.

#### Evaluation Repository
After the testers have responded to the bug report responses. The issues and their respective information from the Tester's Response Phase will be transferred over to this repository. 

The application will then use this repository to post tutor's or admin's evaluation of each team's response and their respective bug report.

### Set up access rights
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
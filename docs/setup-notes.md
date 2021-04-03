# Notes on setting up the required GitHub organisation and repositories

This document is only relevant for admin users.

## Set up Organization
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


## Set up Github Repositories
This application requires 4 separate repositories.
1. Settings Repository
2. Bug Reporting Phase / Tester's Response Phase Repository (**Both** phases utilize the same repository)
3. Team's Response Phase Repository
4. Moderation Phase Repository

For each phase, users with write access will be able to upload files (e.g. screenshots, .txt files, etc...) onto the repository's `/file` folder. These files are used in conjuction with issue description and comments in a form of a link. As for images, the actual image will be displayed.

**NOTE**: The repositories used in the *Bug Reporting Phase* and *Tester's Response Phase* are to be located in the individual User's Repository.

### Settings Repository
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

### Bug Reporting Repository
All the bug reports that are created from the application will be posted into this repository.

### Team's Response Repository
After the bug reporting phase, the issues posted during that phase will be transferred over to this repository, with the identity of the poster anonymized.

This repository will then be used by the application for individual teams to respond to the bugs that are discovered by the testers testing their application.

### Tester's Response Repository
After the teams have responded to the bugs reported by their testers, the issues posted during that phase will be transferred over to this repository, with the identity of the poster anonymized.

This repository will then be used by the application for individual tester to respond to the team's assessment of the bug they had reported initially.

### Evaluation Repository
After the testers have responded to the bug report responses. The issues and their respective information from the Tester's Response Phase will be transferred over to this repository.

The application will then use this repository to post tutor's or admin's evaluation of each team's response and their respective bug report.

## Set up access rights
For each of the teams, follow the steps below to assign the right access level to the repositories.
1. Go to their respective team page on Github.
2. Click on `Repositories` navigation tab.
3. Add the following repositories with the respective access right level as desribed below.
    1. For `admins` team.
        1. Bug Reporting Phase / Tester's Response Phase Repository: `Admin`
        2. Team's Response Phase Repository: `Admin`
        3. Moderation Phase Repository: `Admin`
    2. For `students` team.
        1. Bug Reporting Phase / Tester's Response Phase Repository: `Write`
        2. Team's Response Phase Repository: `Write`
    3. For `tutors` team.
        1. Bug Reporting Phase / Tester's Response Phase Repository: `Read`
        2. Team's Response Phase Repository: `Read`
        3. Moderation Phase Repository: `Write`
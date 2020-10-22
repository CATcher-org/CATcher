import { GithubComment } from '../../src/app/core/models/github/github-comment.model';
import { IssueDispute } from '../../src/app/core/models/issue-dispute.model';
import { Issue } from '../../src/app/core/models/issue.model';
import { Team } from '../../src/app/core/models/team.model';
import { TesterResponse } from '../../src/app/core/models/tester-response.model';
import { Phase } from '../../src/app/core/services/phase.service';

import { ISSUE_WITH_EMPTY_DESCRIPTION, ISSUE_WITH_ASSIGNEES } from '../constants/githubissue.constants';

describe('Issue model class', () => {
    describe('.createPhaseBugReportIssue(githubIssue)', () => {
        it('correctly creates a bug reporting issue that has an empty description', async () => {
            const issue = Issue.createPhaseBugReportingIssue(ISSUE_WITH_EMPTY_DESCRIPTION);
            expect(issue.title).toBe('App starts to lag when given large amount of input');
            expect(issue.description).toBe('No details provided by bug reporter.');
            expect(issue.severity).toBe('Medium');
            expect(issue.type).toBe('FunctionalityBug');
        });
    });
    describe('.createPhaseTeamResponseIssue(githubIssue, githubComment)', () => {
        it('correctly creates a team response issue that has an empty team response', async() => {
            const dummyTeam = null;
            const issue = Issue.createPhaseTeamResponseIssue(ISSUE_WITH_ASSIGNEES, dummyTeam);
            expect(issue.title).toBe('Screen freezes');
            expect(issue.teamResponse).toBe('No details provided by team.');
            expect(issue.severity).toBe('Medium');
            expect(issue.assignees).toContain('anubh-v');
            expect(issue.assignees.length).toBe(1);
        });
    });
    describe('.updateDescription(description) and .updateTeamResponse(teamResponse)', () => {
        it('correctly clean strings obtained from users', () => {
            const noDetailsFromBugReporter = 'No details provided by bug reporter.';
            const noDetailsFromTeam = 'No details provided by team.';
            expect(Issue.updateDescription('')).toBe(noDetailsFromBugReporter);
            expect(Issue.updateTeamResponse('')).toBe(noDetailsFromTeam);
            expect(Issue.updateDescription(null)).toBe(noDetailsFromBugReporter);
            expect(Issue.updateTeamResponse(undefined)).toBe(noDetailsFromTeam);

            const typicalDescription = 'The app crashes after parsing config files.';
            const typicalTeamResponse = 'Cannot replicate the bug.';
            expect(Issue.updateDescription(typicalDescription)).toBe(typicalDescription);
            expect(Issue.updateTeamResponse(typicalTeamResponse)).toBe(typicalTeamResponse);

            const inputWithSpecialChars = '$%^!@&-_test';
            expect(Issue.updateDescription(inputWithSpecialChars)).toBe(inputWithSpecialChars);
            expect(Issue.updateTeamResponse(inputWithSpecialChars)).toBe(inputWithSpecialChars);
        });
    });
});

describe('Issue', () => {
    let dummyTeam: Team;
    let dummyIssue: Issue;
    let otherDummyIssue: Issue;
    let dummyIssueWithTeam: Issue;

    let githubComment: GithubComment;
    let newIssueDispute: IssueDispute;
    let newTesterResponse: TesterResponse;

    const noReportedDescriptionString = 'No details provided by bug reporter.\n';
    const tutorResponseStringHeader = '# Tutor Moderation\n\n';

    beforeEach(() => {
        dummyTeam = new Team({
            id: 'F09-2',
            teamMembers: []
        });
        dummyIssue = Issue.createPhaseBugReportingIssue(ISSUE_WITH_EMPTY_DESCRIPTION);
        otherDummyIssue = Issue.createPhaseBugReportingIssue(ISSUE_WITH_ASSIGNEES);
        dummyIssueWithTeam = Issue.createPhaseTeamResponseIssue(ISSUE_WITH_EMPTY_DESCRIPTION, dummyTeam);

        githubComment = new GithubComment();
        githubComment.body = 'Sample Text';

        newIssueDispute = new IssueDispute('Cannot Work', 'Help Please');
        newTesterResponse = new TesterResponse('Cannot Work', 'Help Please', '- [ ] Not Done', 'Reason');
    });

    it('should be initialized with the correct phase and team with clone()', () => {
        const phaseBugReportingIssue = dummyIssue.clone(Phase.phaseBugReporting);
        expect(phaseBugReportingIssue).toEqual(dummyIssue);

        const phaseTeamResponseIssue = dummyIssueWithTeam.clone(Phase.phaseTeamResponse);
        expect(phaseTeamResponseIssue.githubComments).toEqual(dummyIssueWithTeam.githubComments);
        expect(phaseTeamResponseIssue.teamAssigned).toEqual(dummyTeam);

        const phaseTesterResponseIssue = dummyIssueWithTeam.clone(Phase.phaseTesterResponse);
        expect(phaseTesterResponseIssue.githubComments).toEqual(dummyIssueWithTeam.githubComments);

        const phaseModerationIssue = dummyIssueWithTeam.clone(Phase.phaseModeration);
        expect(phaseModerationIssue.githubComments).toEqual(dummyIssueWithTeam.githubComments);
        expect(phaseModerationIssue.teamAssigned).toEqual(dummyTeam);
    });

    it('should be able to get the proper Github Issue descriptions', () => {
        const phaseBugReportingIssue = dummyIssue.clone(Phase.phaseBugReporting);
        expect(phaseBugReportingIssue.createGithubIssueDescription()).toEqual(noReportedDescriptionString);

        const phaseBugReportingIssueWithDescription = otherDummyIssue.clone(Phase.phaseBugReporting);
        expect(phaseBugReportingIssueWithDescription.createGithubIssueDescription())
            .toEqual(`${phaseBugReportingIssueWithDescription.description}\n`);
    });

    it('should be able to get the proper Team Response', () => {
        const phaseTeamResponseIssue = dummyIssue.clone(Phase.phaseTeamResponse);
        phaseTeamResponseIssue.teamResponse = 'Sample Text';
        expect(phaseTeamResponseIssue.createGithubTeamResponse())
            .toEqual(`# Team\'s Response\n${phaseTeamResponseIssue.teamResponse}\n ## Duplicate status (if any):\n--`);

        const phaseTeamResponseIssue2 = dummyIssue.clone(Phase.phaseTeamResponse);
        phaseTeamResponseIssue2.teamResponse = 'Sample Text';
        phaseTeamResponseIssue2.duplicateOf = 10;
        expect(phaseTeamResponseIssue2.createGithubTeamResponse())
            .toEqual(`# Team\'s Response\n${phaseTeamResponseIssue2.teamResponse}\n `
                + `## Duplicate status (if any):\nDuplicate of #${phaseTeamResponseIssue2.duplicateOf}`);
    });

    it ('should be able to get the proper Tutor Response', () => {
        const phaseModerationIssue = dummyIssueWithTeam.clone(Phase.phaseModeration);
        expect(phaseModerationIssue.createGithubTutorResponse()).toEqual(tutorResponseStringHeader);

        const phaseModerationIssue2 = dummyIssueWithTeam.clone(Phase.phaseModeration);
        phaseModerationIssue2.issueDisputes = [newIssueDispute];
        expect(phaseModerationIssue2.createGithubTutorResponse()).toEqual(tutorResponseStringHeader
            + newIssueDispute.toTutorResponseString());
    });

    it ('should be able to get the proper Tester Response', () => {
        const phaseTesterResponseIssue = dummyIssueWithTeam.clone(Phase.phaseTesterResponse);
        phaseTesterResponseIssue.teamResponse = 'Sample Text';
        phaseTesterResponseIssue.testerResponses = [];
        expect(phaseTesterResponseIssue.createGithubTesterResponse()).toEqual(
            `# Team\'s Response\n${phaseTesterResponseIssue.teamResponse}\n ` +
        `# Items for the Tester to Verify\n${''}`);

        const phaseTesterResponseIssue2 = dummyIssueWithTeam.clone(Phase.phaseTesterResponse);
        phaseTesterResponseIssue2.teamResponse = 'Sample Text';
        phaseTesterResponseIssue2.testerResponses = [newTesterResponse];
        expect(phaseTesterResponseIssue2.createGithubTesterResponse()).toEqual(
            `# Team\'s Response\n${phaseTesterResponseIssue.teamResponse}\n ` +
        `# Items for the Tester to Verify\n${newTesterResponse.toString()}`);
    });

    it ('returns the correct number of issue disputes', () => {
        const phaseModerationIssue = dummyIssueWithTeam.clone(Phase.phaseModeration);
        expect(phaseModerationIssue.numOfUnresolvedDisputes()).toEqual(0);

        const phaseModerationIssue2 = dummyIssueWithTeam.clone(Phase.phaseModeration);
        phaseModerationIssue2.issueDisputes = [newIssueDispute];
        expect(phaseModerationIssue2.numOfUnresolvedDisputes()).toEqual(1);

        const phaseModerationIssue3 = dummyIssueWithTeam.clone(Phase.phaseModeration);
        phaseModerationIssue3.issueDisputes = [newIssueDispute];
        newIssueDispute.todo = '- [x] Done' ;
        expect(phaseModerationIssue3.numOfUnresolvedDisputes()).toEqual(0);
    });
});

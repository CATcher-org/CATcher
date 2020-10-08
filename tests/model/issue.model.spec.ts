import { Issue } from '../../src/app/core/models/issue.model';
import { Team } from '../../src/app/core/models/team.model';
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

    beforeEach(() => {
        dummyTeam = new Team({
            id: 'F09-2',
            teamMembers: []
        });
        dummyIssue = Issue.createPhaseBugReportingIssue(ISSUE_WITH_EMPTY_DESCRIPTION);
        otherDummyIssue = Issue.createPhaseBugReportingIssue(ISSUE_WITH_ASSIGNEES);
        dummyIssueWithTeam = Issue.createPhaseTeamResponseIssue(ISSUE_WITH_EMPTY_DESCRIPTION, dummyTeam);
    });

    it('should be initialized with the correct phase and team with clone()', () => {
        const phaseBugReportingIssue = dummyIssue.clone(Phase.phaseBugReporting);
        expect(phaseBugReportingIssue).toEqual(dummyIssue);

        const phaseTeamResponseIssue = dummyIssueWithTeam.clone(Phase.phaseTeamResponse);
        expect(phaseTeamResponseIssue.githubComments).toEqual(dummyIssueWithTeam.githubComments);
        expect(phaseTeamResponseIssue.teamAssigned).toEqual(dummyTeam);

        const phaseTesterResponseIssue = dummyIssue.clone(Phase.phaseTesterResponse);
        expect(phaseTesterResponseIssue.githubComments).toEqual(dummyIssue.githubComments);

        const phaseModerationIssue = dummyIssueWithTeam.clone(Phase.phaseModeration);
        expect(phaseModerationIssue.githubComments).toEqual(dummyIssueWithTeam.githubComments);
        expect(phaseModerationIssue.teamAssigned).toEqual(dummyTeam);
    });

});

import { Issue } from '../../src/app/core/models/issue.model'
import { ISSUE_WITH_EMPTY_DESCRIPTION, ISSUE_WITH_ASSIGNEES } from '../constants/githubissue.constants'
import { EMPTY_TEAM_RESPONSE } from '../constants/githubcomment.constants';

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
            const issue = Issue.createPhaseTeamResponseIssue(ISSUE_WITH_ASSIGNEES, [EMPTY_TEAM_RESPONSE], dummyTeam);
            expect(issue.title).toBe('Screen freezes');
            expect(issue.teamResponse).toBe('No details provided by team.');
            expect(issue.severity).toBe('Medium');
            expect(issue.assignees).toContain('anubh-v');
            expect(issue.assignees.length).toBe(1);
        });
    });
});

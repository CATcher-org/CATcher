import { Issue } from '../../src/app/core/models/issue.model'
import { ISSUE_WITH_EMPTY_DESCRIPTION, ISSUE_WITH_ASSIGNEES } from '../constants/githubissue.constants'
import { TEAM_RESPONSE } from '../constants/githubcomment.constants';

describe("Test whether issue instances are correctly created from GitHubIssue instances", () => {
    it('Create a bug reporting issue with an empty description', async () => {
        const issue = Issue.createPhaseBugReportingIssue(ISSUE_WITH_EMPTY_DESCRIPTION);
        expect(issue.title).toBe('App starts to lag when given large amount of input');
        expect(issue.description).toBe('No details provided by bug reporter.');
        expect(issue.severity).toBe('Medium');
        expect(issue.type).toBe('FunctionalityBug');
    });

    it('Create a team response issue that has an empty team response', async() => {
        const dummyTeam = null;
        const issue = Issue.createPhaseTeamResponseIssue(ISSUE_WITH_ASSIGNEES, [TEAM_RESPONSE], dummyTeam);
        expect(issue.title).toBe('Screen freezes');
        expect(issue.teamResponse).toBe('No details provided by team.');
        expect(issue.assignees).toContain('anubh-v');
    })
});

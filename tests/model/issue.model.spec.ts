import { GithubService } from '../../src/app/core/services/github.service'
import { IssueCommentService } from '../../src/app/core/services/issue-comment.service'
import { Issue } from '../../src/app/core/models/issue.model'

const githubService = new GithubService(null);
githubService.storePhaseDetails('CATcher-org', 'pe-results');
const issueCommentService = new IssueCommentService(githubService);

describe("Test whether issue instances are correctly created from GitHubIssue instances", () => {
    it('Create a bug reporting issue with an empty description', async () => {
        const issueId = 92;
        const ghIssue = await githubService.fetchIssue(issueId).toPromise();
        const issue = Issue.createPhaseBugReportingIssue(ghIssue);
        expect(issue.title).toBe('App starts to lag when given large amount of input');
        expect(issue.description).toBe('No details provided by bug reporter.');
        expect(issue.severity).toBe('Medium');
        expect(issue.type).toBe('FunctionalityBug');
    });

    it('Create a team response issue', async() => {
        const issueId = 91;
        const ghIssue = await githubService.fetchIssue(issueId).toPromise();
        const ghComments = await issueCommentService.getGithubComments(issueId).toPromise();
        const dummyTeam = null;
        const issue = Issue.createPhaseTeamResponseIssue(ghIssue, ghComments, dummyTeam);
        expect(issue.title).toBe('Screen freezes');
        expect(issue.teamResponse).toBe('No details provided by team.');
        expect(issue.assignees).toContain('anubh-v');
    })
});

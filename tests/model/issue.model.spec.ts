import { GithubService } from '../../src/app/core/services/github.service'
import { Issue } from '../../src/app/core/models/issue.model'

const githubService = new GithubService(null);
githubService.storePhaseDetails('CATcher-org', 'pe-results');

describe("Test whether issue instances are correctly created from GitHubIssue instances", () => {
    it('Test creation of a bug reporting issue that has an empty description', async () => {
        const issueId = 92;
        const ghIssue = await githubService.fetchIssue(issueId).toPromise();
        const issue = Issue.createPhaseBugReportingIssue(ghIssue);
        expect(issue.title).toBe('App starts to lag when given large amount of input');
        expect(issue.description).toBe('No details provided by bug reporter.');
        expect(issue.severity).toBe('Medium');
    });
});

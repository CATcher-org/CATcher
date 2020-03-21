import { GithubService } from '../../src/app/core/services/github.service'
import { Issue } from '../../src/app/core/models/issue.model'
import { ISSUE_EMPTY_DESCRIPTION } from '../constants/githubissue.constants'

const githubService = new GithubService(null);
githubService.storePhaseDetails('CATcher-org', 'pe-results');

describe("Test whether issue instances are correctly created from GitHubIssue instances", () => {
    it('Create a bug reporting issue with an empty description', async () => {
        const issue = Issue.createPhaseBugReportingIssue(ISSUE_EMPTY_DESCRIPTION);
        expect(issue.title).toBe('App starts to lag when given large amount of input');
        expect(issue.description).toBe('No details provided by bug reporter.');
        expect(issue.severity).toBe('Medium');
        expect(issue.type).toBe('FunctionalityBug');
    });
});

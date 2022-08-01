import { GithubService } from '../../src/app/core/services/github.service';
import { ISSUE_WITH_EMPTY_DESCRIPTION } from '../constants/githubissue.constants';
import {
  GITHUB_LABEL_FUNCTIONALITY_BUG,
  GITHUB_LABEL_MEDIUM_SEVERITY,
  GITHUB_LABEL_TEAM_LABEL,
  GITHUB_LABEL_TUTORIAL_LABEL
} from '../constants/githublabel.constants';
const nock = require('nock');

describe('GithubService', () => {
  afterEach(() => {
    nock.cleanAll();
  });
  it('sucessfully returns a GitHub Issue upon issue creation', () => {
    const githubService = new GithubService(null, null, null, null);
    const scope = nock('https://api.github.com')
      .post('/repos/CATcher-org/pe-results/issues')
      .reply(201, {
        url: ISSUE_WITH_EMPTY_DESCRIPTION.url,
        id: ISSUE_WITH_EMPTY_DESCRIPTION.id,
        number: ISSUE_WITH_EMPTY_DESCRIPTION.number,
        title: ISSUE_WITH_EMPTY_DESCRIPTION.title,
        body: ISSUE_WITH_EMPTY_DESCRIPTION.body,
        user: ISSUE_WITH_EMPTY_DESCRIPTION.user,
        labels: [GITHUB_LABEL_TEAM_LABEL, GITHUB_LABEL_TUTORIAL_LABEL, GITHUB_LABEL_FUNCTIONALITY_BUG, GITHUB_LABEL_MEDIUM_SEVERITY],
        state: ISSUE_WITH_EMPTY_DESCRIPTION.state,
        assignees: [],
        comments: [],
        created_at: ISSUE_WITH_EMPTY_DESCRIPTION.created_at,
        updated_at: ISSUE_WITH_EMPTY_DESCRIPTION.updated_at
      });
    githubService
      .createIssue(ISSUE_WITH_EMPTY_DESCRIPTION.title, ISSUE_WITH_EMPTY_DESCRIPTION.body, [
        GITHUB_LABEL_TEAM_LABEL.name,
        GITHUB_LABEL_TUTORIAL_LABEL.name,
        GITHUB_LABEL_FUNCTIONALITY_BUG.name,
        GITHUB_LABEL_MEDIUM_SEVERITY.name
      ])
      .subscribe((result) => {
        expect(result).toBe(ISSUE_WITH_EMPTY_DESCRIPTION);
      });
  });

  it('throws an error upon github API returning an error', () => {
    const githubService = new GithubService(null, null, null, null);
    const scope = nock('https://api.github.com').post('/repos/CATcher-org/pe-results/issues').reply(404);
    githubService
      .createIssue(ISSUE_WITH_EMPTY_DESCRIPTION.title, ISSUE_WITH_EMPTY_DESCRIPTION.body, [
        GITHUB_LABEL_TEAM_LABEL.name,
        GITHUB_LABEL_TUTORIAL_LABEL.name,
        GITHUB_LABEL_FUNCTIONALITY_BUG.name,
        GITHUB_LABEL_MEDIUM_SEVERITY.name
      ])
      .subscribe({
        next: () => fail(),
        error: (err) => expect(err.status).toEqual(404)
      });
  });
});

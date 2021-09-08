import { GithubComment } from '../../../src/app/core/models/github/github-comment.model';
import { TeamResponseTemplate } from '../../../src/app/core/models/templates/team-response-template.model';

const EMPTY_BODY_GITHUB_COMMENT = {
  body: ''
} as GithubComment;
const EXPECTED_TEAM_RESPONSE_HEADER = "# Team's Response";
const EXPECTED_TEAM_RESPONSE_TEMPLATE_CONTENT = 'This is a simple response';
const DUPLICATE_ISSUE_NUMBER = 100;

const TEAM_RESPONSE_WITH_EXTRA_NEWLINES_AND_WHITESPACE =
  EXPECTED_TEAM_RESPONSE_HEADER + '\r\n  \n ' + EXPECTED_TEAM_RESPONSE_TEMPLATE_CONTENT + '\r\n \n\n ' + '## Duplicate status (if any): --';
const TEAM_RESPONSE_WITH_DUPLICATE =
  EXPECTED_TEAM_RESPONSE_HEADER +
  '\r\n' +
  EXPECTED_TEAM_RESPONSE_TEMPLATE_CONTENT +
  '\r\n' +
  '## Duplicate status (if any): Duplicate of #' +
  DUPLICATE_ISSUE_NUMBER;

describe('TeamResponseTemplate', () => {
  it('parses the teamResponse correctly', () => {
    EMPTY_BODY_GITHUB_COMMENT.body = TEAM_RESPONSE_WITH_EXTRA_NEWLINES_AND_WHITESPACE;
    const template = new TeamResponseTemplate([EMPTY_BODY_GITHUB_COMMENT]);

    expect(template.teamResponse.content).toBe(EXPECTED_TEAM_RESPONSE_TEMPLATE_CONTENT);
    expect(template.teamResponse.header.toString()).toBe(EXPECTED_TEAM_RESPONSE_HEADER);
    expect(template.duplicateOf.issueNumber).toEqual(null);
  });
  it('parses the duplicateOf value correctly', () => {
    EMPTY_BODY_GITHUB_COMMENT.body = TEAM_RESPONSE_WITH_DUPLICATE;
    const template = new TeamResponseTemplate([EMPTY_BODY_GITHUB_COMMENT]);

    expect(template.duplicateOf.issueNumber).toBe(DUPLICATE_ISSUE_NUMBER);
  });
});

import {
  TutorModerationIssueParser,
  TutorModerationIssueTemplate
} from '../../../src/app/core/models/templates/tutor-moderation-issue-template.model';

import { ISSUE_PENDING_MODERATION } from '../../constants/githubissue.constants';

const EXPECTED_ISSUE_DESCRIPTION = '{original issue description}';
const EXPECTED_TEAM_RESPONSE = "{team's response}";
const EXPECTED_DISPUTE_DESCRIPTION =
  "### Team says:\r\n{the team's action that is being disputed}\r\n\r\n" + "### Tester says:\r\n{tester's objection}";
const TYPE_TITLE = 'Issue Type';
const SEVERITY_TITLE = 'Issue Severity';
const NOT_RELATED_TITLE = 'Not Related Question';

describe('TutorModerationIssueParser', () => {
  it('parses the issue description and team response correctly', () => {
    const result = TutorModerationIssueParser.run(ISSUE_PENDING_MODERATION.body).result;

    expect(result.description).toBe(EXPECTED_ISSUE_DESCRIPTION);
    expect(result.teamResponse).toBe(EXPECTED_TEAM_RESPONSE);
  });
  it('parses the issue disputes correctly', () => {
    const result = TutorModerationIssueParser.run(ISSUE_PENDING_MODERATION.body).result;

    expect(result.issueDisputes[0].title).toBe(TYPE_TITLE);
    expect(result.issueDisputes[0].description).toBe(EXPECTED_DISPUTE_DESCRIPTION);

    expect(result.issueDisputes[1].title).toBe(SEVERITY_TITLE);
    expect(result.issueDisputes[1].description).toBe(EXPECTED_DISPUTE_DESCRIPTION);

    expect(result.issueDisputes[2].title).toBe(NOT_RELATED_TITLE);
    expect(result.issueDisputes[2].description).toBe(EXPECTED_DISPUTE_DESCRIPTION);
  });
});

describe('TutorModerationIssueTemplate class', () => {
  it('parses a tutor moderation issue successfully', () => {
    const template = new TutorModerationIssueTemplate(ISSUE_PENDING_MODERATION);

    expect(template.description.content).toBe(EXPECTED_ISSUE_DESCRIPTION);
    expect(template.teamResponse.content).toBe(EXPECTED_TEAM_RESPONSE);
  });
});

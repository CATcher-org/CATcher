import { IssueDisputeSectionParser } from '../../../../src/app/core/models/templates/sections/issue-dispute-section-parser.model';

const TYPE_DISPUTE =
  '## :question: Issue Type\n\n' +
  '### Team says:\n\n' +
  "{the team's action that is being disputed}\n\n" +
  '### Tester says:\n\n' +
  "{tester's objection}\n\n" +
  '-------------------';

const EXPECTED_TITLE = 'Issue Type';
const EXPECTED_DESCRIPTION =
  '### Team says:\n\n' + "{the team's action that is being disputed}\n\n" + '### Tester says:\n\n' + "{tester's objection}";

describe('IssueDisputeSectionParser', () => {
  it('parses type dispute correctly', () => {
    const result = IssueDisputeSectionParser.run(TYPE_DISPUTE).result;

    expect(result.title).toBe(EXPECTED_TITLE);
    expect(result.description).toBe(EXPECTED_DESCRIPTION);
  });
});

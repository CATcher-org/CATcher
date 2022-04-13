import {
  DisagreeCheckboxParser,
  TesterResponseSectionParser
} from '../../../../src/app/core/models/templates/sections/tester-response-section-parser.model';

const EMPTY_DISAGREE_CHECKBOX = '- [ ] I disagree';
const FILLED_DISAGREE_CHECKBOX = '- [x] I disagree';
const DEFAULT_DISAGREEMENT_REASON = '[replace this with your reason]';
const USER_DISAGREEMENT_REASON = 'I disagree!';

const RESPONSE_TITLE = 'response';
const RESPONSE_DESCRIPTION = 'Team chose [`response.Rejected`]';
const RESPONSE_TEAM_CHOSE = 'Rejected';

const SEVERITY_TITLE = 'severity';
const SEVERITY_DESCRIPTION = 'Team chose [`severity.Low`]\nOriginally [`severity.High`]';
const SEVERITY_TEAM_CHOSE = 'Low';
const SEVERITY_TESTER_CHOSE = 'High';

const TYPE_TITLE = 'type';
const TYPE_DESCRIPTION = 'Team chose [`type.DocumentationBug`]\nOriginally [`type.FunctionalityBug`]';
const TYPE_TEAM_CHOSE = 'DocumentationBug';
const TYPE_TESTER_CHOSE = 'FunctionalityBug';

const DUPLICATE_TITLE = 'duplicate status';
const DUPLICATE_DESCRIPTION =
  "Team chose to mark this issue as a duplicate of another issue (as explained in the _**Team's response**_ above)";

export const RESPONSE_DISAGREEMENT =
  '## :question: Issue response\n\n' +
  'Team chose [`response.Rejected`]\n\n' +
  '- [ ] I disagree\n\n' +
  '**Reason for disagreement:** [replace this with your reason]\n\n' +
  '-------------------';

export const SEVERITY_DISAGREEMENT =
  '## :question: Issue severity\n\n' +
  'Team chose [`severity.Low`]\n' +
  'Originally [`severity.High`]\n\n' +
  '- [x] I disagree\n\n' +
  '**Reason for disagreement:** I disagree!\n\n' +
  '-------------------';

export const TYPE_DISAGREEMENT =
  '## :question: Issue type\n\n' +
  'Team chose [`type.DocumentationBug`]\n' +
  'Originally [`type.FunctionalityBug`]\n\n' +
  '- [ ] I disagree\n\n' +
  '**Reason for disagreement:** [replace this with your reason]\n\n' +
  '-------------------';

export const DUPLICATE_DISAGREEMENT =
  '## :question: Issue duplicate status\n\n' +
  "Team chose to mark this issue as a duplicate of another issue (as explained in the _**Team's response**_ above)\n\n" +
  '- [ ] I disagree\n\n' +
  '**Reason for disagreement:** [replace this with your reason]\n\n' +
  '-------------------';

describe('DisagreeCheckboxParser', () => {
  it('parses empty checkbox correctly', () => {
    const result = DisagreeCheckboxParser.run(EMPTY_DISAGREE_CHECKBOX).result;

    expect(result).toBe(false);
  });
  it('parses filled checkbox correctly', () => {
    const result = DisagreeCheckboxParser.run(FILLED_DISAGREE_CHECKBOX).result;

    expect(result).toBe(true);
  });
});

describe('TesterResponseSectionParser', () => {
  it('parses response disagreement correctly', () => {
    const result = TesterResponseSectionParser.run(RESPONSE_DISAGREEMENT).result;

    expect(result.title).toBe(RESPONSE_TITLE);
    expect(result.description).toBe(RESPONSE_DESCRIPTION);
    expect(result.teamChose).toBe(RESPONSE_TEAM_CHOSE);
    expect(result.testerChose).toBe(null);
    expect(result.disagreeCheckboxValue).toBe(false);
    expect(result.reasonForDisagreement).toBe(DEFAULT_DISAGREEMENT_REASON);
  });
  it('parses severity disagreement correctly', () => {
    const result = TesterResponseSectionParser.run(SEVERITY_DISAGREEMENT).result;

    expect(result.title).toBe(SEVERITY_TITLE);
    expect(result.description).toBe(SEVERITY_DESCRIPTION);
    expect(result.teamChose).toBe(SEVERITY_TEAM_CHOSE);
    expect(result.testerChose).toBe(SEVERITY_TESTER_CHOSE);
    expect(result.disagreeCheckboxValue).toBe(true);
    expect(result.reasonForDisagreement).toBe(USER_DISAGREEMENT_REASON);
  });
  it('parses type disagreement correctly', () => {
    const result = TesterResponseSectionParser.run(TYPE_DISAGREEMENT).result;

    expect(result.title).toBe(TYPE_TITLE);
    expect(result.description).toBe(TYPE_DESCRIPTION);
    expect(result.teamChose).toBe(TYPE_TEAM_CHOSE);
    expect(result.testerChose).toBe(TYPE_TESTER_CHOSE);
    expect(result.disagreeCheckboxValue).toBe(false);
    expect(result.reasonForDisagreement).toBe(DEFAULT_DISAGREEMENT_REASON);
  });
  it('parses duplicate status disagreement correctly', () => {
    const result = TesterResponseSectionParser.run(DUPLICATE_DISAGREEMENT).result;

    expect(result.title).toBe(DUPLICATE_TITLE);
    expect(result.description).toBe(DUPLICATE_DESCRIPTION);
    expect(result.teamChose).toBe(null);
    expect(result.testerChose).toBe(null);
    expect(result.disagreeCheckboxValue).toBe(false);
    expect(result.reasonForDisagreement).toBe(DEFAULT_DISAGREEMENT_REASON);
  });
});

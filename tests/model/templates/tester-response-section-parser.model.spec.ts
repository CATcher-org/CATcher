import {
  DisagreeCheckboxParser,
  TesterResponseSectionParser
} from '../../../src/app/core/models/templates/sections/tester-response-section-parser.model';

const SECTION_TITLE_PREFIX = '## :question: Issue ';
const EMPTY_DISAGREE_CHECKBOX = '- [ ] I disagree';
const FILLED_DISAGREE_CHECKBOX = '- [x] I disagree';
const DISAGREEMENT_REASON_PREFIX = '**Reason for disagreement:** ';
const DEFAULT_DISAGREEMENT_REASON = '[replace this with your reason]';
const USER_DISAGREEMENT_REASON = 'I disagree!';
const LINE_SEPARATOR = '-------------------';
const DUPLICATE_STATUS_MESSAGE =
  "Team chose to mark this issue as a duplicate of another issue (as explained in the _**Team's response**_ above)";

export const RESPONSE_DISAGREEMENT =
  SECTION_TITLE_PREFIX +
  'response\n\n' +
  'Team chose [`response.Rejected`]\n\n' +
  EMPTY_DISAGREE_CHECKBOX +
  '\n\n' +
  DISAGREEMENT_REASON_PREFIX +
  DEFAULT_DISAGREEMENT_REASON +
  '\n\n' +
  LINE_SEPARATOR;

export const SEVERITY_DISAGREEMENT =
  SECTION_TITLE_PREFIX +
  'severity\n\n' +
  'Team chose [`severity.Low`]\n' +
  'Originally [`severity.High`]\n\n' +
  FILLED_DISAGREE_CHECKBOX +
  '\n\n' +
  DISAGREEMENT_REASON_PREFIX +
  USER_DISAGREEMENT_REASON +
  '\n\n' +
  LINE_SEPARATOR;

export const TYPE_DISAGREEMENT =
  SECTION_TITLE_PREFIX +
  'type\n\n' +
  'Team chose [`type.DocumentationBug`]\n' +
  'Originally [`type.FunctionalityBug`]\n\n' +
  EMPTY_DISAGREE_CHECKBOX +
  '\n\n' +
  DISAGREEMENT_REASON_PREFIX +
  DEFAULT_DISAGREEMENT_REASON +
  '\n\n' +
  LINE_SEPARATOR;

export const DUPLICATE_DISAGREEMENT =
  SECTION_TITLE_PREFIX +
  'duplicate status\n\n' +
  DUPLICATE_STATUS_MESSAGE +
  '\n\n' +
  EMPTY_DISAGREE_CHECKBOX +
  '\n\n' +
  DISAGREEMENT_REASON_PREFIX +
  DEFAULT_DISAGREEMENT_REASON +
  '\n\n' +
  LINE_SEPARATOR;

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

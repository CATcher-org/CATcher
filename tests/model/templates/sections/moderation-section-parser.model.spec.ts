import {
  DoneCheckboxParser,
  ModerationSectionParser
} from '../../../../src/app/core/models/templates/sections/moderation-section-parser.model';

const TYPE_DISPUTE = '## :question: Issue Type\n\n' + '- [ ] Done\n\n' + '[replace this with your explanation]\n\n' + '-------------------';

const EMPTY_DONE_CHECKBOX = '- [ ] Done';
const FILLED_DONE_CHECKBOX = '- [x] Done';

const EXPECTED_TITLE = 'Issue Type';
const EXPECTED_DESCRIPTION = '- [ ] Done\n\n[replace this with your explanation]';
const EXPECTED_TUTOR_RESPONSE = '[replace this with your explanation]';

describe('DoneCheckboxParser', () => {
  it('parses empty checkbox correctly', () => {
    const result = DoneCheckboxParser.run(EMPTY_DONE_CHECKBOX).result;

    expect(result).toBe(false);
  });
  it('parses filled checkbox correctly', () => {
    const result = DoneCheckboxParser.run(FILLED_DONE_CHECKBOX).result;

    expect(result).toBe(true);
  });
});

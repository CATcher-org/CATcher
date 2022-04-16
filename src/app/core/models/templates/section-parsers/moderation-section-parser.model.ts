import { Checkbox } from '../../checkbox.model';
import { IssueDispute } from '../../issue-dispute.model';
import { buildCheckboxParser } from './common-parsers.model';

const { coroutine, everyCharUntil, lookAhead, optionalWhitespace, str, whitespace } = require('arcsecond');

const SECTION_TITLE_PREFIX = '## :question: ';
const DONE_CHECKBOX_DESCRIPTION = 'Done';
const LINE_SEPARATOR = '-------------------';

export const DoneCheckboxParser = buildCheckboxParser(DONE_CHECKBOX_DESCRIPTION);

export const ModerationSectionParser = coroutine(function* () {
  yield str(SECTION_TITLE_PREFIX);
  const title = yield everyCharUntil(str('- [')); // every char until the done checkbox

  const description = yield lookAhead(everyCharUntil(str(LINE_SEPARATOR)));

  const doneCheckboxValue = yield DoneCheckboxParser;
  yield whitespace;
  const tutorResponse = yield everyCharUntil(str(LINE_SEPARATOR));
  yield str(LINE_SEPARATOR);
  yield optionalWhitespace;

  const dispute = new IssueDispute(title.trim(), description.trim());
  dispute.todo = new Checkbox(DONE_CHECKBOX_DESCRIPTION, doneCheckboxValue);
  dispute.tutorResponse = tutorResponse.trim();

  return dispute;
});

import { IssueDispute } from '../../issue-dispute.model';

const { coroutine, everyCharUntil, optionalWhitespace, str } = require('arcsecond');

const SECTION_TITLE_PREFIX = '## :question: ';
const TEAM_SAYS_HEADER = '### Team says:';
const LINE_SEPARATOR = '-------------------';

export const IssueDisputeSectionParser = coroutine(function* () {
  yield str(SECTION_TITLE_PREFIX);
  const title = yield everyCharUntil(str(TEAM_SAYS_HEADER));

  const description = yield everyCharUntil(str(LINE_SEPARATOR));
  yield str(LINE_SEPARATOR);
  yield optionalWhitespace;

  return new IssueDispute(title.trim(), description.trim());
});

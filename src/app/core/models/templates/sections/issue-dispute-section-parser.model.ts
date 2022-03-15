const { coroutine, everyCharUntil, str, whitespace } = require('arcsecond');

const SECTION_TITLE_PREFIX = '## :question: ';
const TEAM_SAYS_HEADER = '### Team says:';
const LINE_SEPARATOR = '-------------------';

export const IssueDisputeSectionParser = coroutine(function* () {
  yield str(SECTION_TITLE_PREFIX);
  const title = yield everyCharUntil(str(TEAM_SAYS_HEADER));

  const description = yield everyCharUntil(str(LINE_SEPARATOR));
  return {
    title: title.trim(),
    description: description.trim()
  };
});

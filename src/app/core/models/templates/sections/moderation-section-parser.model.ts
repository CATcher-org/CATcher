const { char, choice, coroutine, everyCharUntil, lookAhead, str, whitespace } = require('arcsecond');

const SECTION_TITLE_PREFIX = '## :question: ';
const LINE_SEPARATOR = '-------------------';

export const DoneCheckboxParser = coroutine(function* () {
  yield str('- [');
  const disagreeCheckboxChar = yield choice([char('x'), whitespace]);
  yield str('] Done');

  return disagreeCheckboxChar === 'x';
});

export const ModerationSectionParser = coroutine(function* () {
  yield str(SECTION_TITLE_PREFIX);
  const title = yield everyCharUntil(str('- [')); // every char until the done checkbox

  const description = yield lookAhead(everyCharUntil(LINE_SEPARATOR));

  const doneCheckboxValue = yield DoneCheckboxParser;
  yield whitespace;
  const tutorResponse = yield everyCharUntil(LINE_SEPARATOR);

  return {
    title: title.trim(),
    description: description.trim(),
    doneCheckboxValue: doneCheckboxValue,
    tutorResponse: tutorResponse
  };
});

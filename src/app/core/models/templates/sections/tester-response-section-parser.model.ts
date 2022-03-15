const {
  between,
  char,
  choice,
  coroutine,
  everyCharUntil,
  letters,
  lookAhead,
  optionalWhitespace,
  possibly,
  str,
  whitespace
} = require('arcsecond');

const SECTION_TITLE_PREFIX = '## :question: Issue ';
const TEAM_CHOSE_PREFIX = 'Team chose ';
const TESTER_CHOSE_PREFIX = 'Originally ';
const DISAGREEMENT_REASON_PREFIX = '**Reason for disagreement:** ';
const LINE_SEPARATOR = '-------------------';
const DUPLICATE_STATUS_MESSAGE =
  "Team chose to mark this issue as a duplicate of another issue (as explained in the _**Team's response**_ above)";

function buildExtractResponseParser(category: string) {
  return coroutine(function* () {
    yield str('[`' + category + '.');
    const response = yield letters;
    yield str('`]');
    return response;
  });
}

function buildTeamResponseParser(category: string) {
  const extractResponseParser = buildExtractResponseParser(category);

  return coroutine(function* () {
    yield str(TEAM_CHOSE_PREFIX);
    const teamChose = yield extractResponseParser;
    return teamChose;
  });
}

function buildTesterResponseParser(category: string) {
  const extractResponseParser = buildExtractResponseParser(category);

  return coroutine(function* () {
    yield str(TESTER_CHOSE_PREFIX);
    const testerChose = yield extractResponseParser;
    return testerChose;
  });
}

export const DisagreeCheckboxParser = coroutine(function* () {
  yield str('- [');
  const disagreeCheckboxChar = yield choice([char('x'), whitespace]);
  yield str('] I disagree');

  return disagreeCheckboxChar === 'x';
});

export const DisagreeReasonParser = coroutine(function* () {
  yield str(DISAGREEMENT_REASON_PREFIX);
  const reasonForDisagreement = yield everyCharUntil(str(LINE_SEPARATOR));
  yield str(LINE_SEPARATOR);

  return reasonForDisagreement.trim();
});

// Issue duplicate section has a different format than the other three
const DuplicateSectionParser = coroutine(function* () {
  yield str('status');
  yield whitespace;
  yield str(DUPLICATE_STATUS_MESSAGE);
  yield whitespace;

  const disagreeCheckboxValue = yield DisagreeCheckboxParser;
  const reasonForDisagreement = yield DisagreeReasonParser;

  return {
    disagreeCheckboxValue: disagreeCheckboxValue,
    reasonForDisagreement: reasonForDisagreement
  };
});

export const TesterResponseSectionParser = coroutine(function* () {
  // section title
  yield str(SECTION_TITLE_PREFIX);
  const title = yield letters;
  yield whitespace;

  const description = yield lookAhead(everyCharUntil(DisagreeCheckboxParser));

  if (title === 'duplicate') {
    const dupSectionResult = yield DuplicateSectionParser;
    yield optionalWhitespace;

    return {
      title: title + ' status',
      description: description.trim(),
      teamChose: null,
      testerChose: null,
      disagreeCheckboxValue: dupSectionResult.disagreeCheckboxValue,
      reasonForDisagreement: dupSectionResult.reasonForDisagreement
    };
  }

  // team and tester response
  const teamResponseParser = buildTeamResponseParser(title);
  const testerResponseParser = buildTesterResponseParser(title);

  const teamChose = yield teamResponseParser;
  yield whitespace;
  // response section does not have tester response
  const testerChose = yield possibly(testerResponseParser);
  yield optionalWhitespace;

  const disagreeCheckboxValue = yield DisagreeCheckboxParser;
  yield whitespace;
  const reasonForDisagreement = yield DisagreeReasonParser;
  yield optionalWhitespace;

  return {
    title: title,
    description: description.trim(),
    teamChose: teamChose,
    testerChose: testerChose,
    disagreeCheckboxValue: disagreeCheckboxValue,
    reasonForDisagreement: reasonForDisagreement
  };
});

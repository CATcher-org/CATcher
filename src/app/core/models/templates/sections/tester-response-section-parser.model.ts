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
const DISAGREEMENT_REASON_PREFIX = '**Reason for disagreement:**';
const LINE_SEPARATOR = '-------------------';
const DUPLICATE_STATUS_MESSAGE =
  "Team chose to mark this issue as a duplicate of another issue (as explained in the _**Team's response**_ above)";

function buildExtractResponseParser(category: string) {
  return coroutine(function* () {
    yield str('[' + category + '.');
    const response = yield letters;
    yield str(']');
    return response;
  });
}

function buildTesterResponseParser(extractResponseParser) {
  return coroutine(function* () {
    yield str(TESTER_CHOSE_PREFIX);
    const testerChose = yield extractResponseParser;
    return testerChose;
  });
}

const DisagreeCheckboxParser = coroutine(function* () {
  yield str('- [');
  const disagreeCheckboxChar = choice([char('x'), whitespace]);
  yield str('] I disagree');
  yield whitespace;

  return disagreeCheckboxChar === 'x';
});

const DisagreeReasonParser = coroutine(function* () {
  yield str(DISAGREEMENT_REASON_PREFIX);
  const reasonForDisagreement = everyCharUntil(str(LINE_SEPARATOR));
  yield str(LINE_SEPARATOR);

  return reasonForDisagreement.trim();
});

// Issue duplicate section has a different format than the other three
const DuplicateSectionParser = coroutine(function* () {
  yield str('status');
  yield whitespace;
  yield str(DUPLICATE_STATUS_MESSAGE);

  const disagreeCheckboxValue = yield DisagreeCheckboxParser;
  const reasonForDisagreement = yield DisagreeReasonParser;

  return {
    disagreeCheckboxValue: disagreeCheckboxValue,
    reasonForDisagreement: reasonForDisagreement
  };
});

const TesterResponseSectionParser = coroutine(function* () {
  // section title
  yield str(SECTION_TITLE_PREFIX);
  const title = yield letters;
  yield whitespace;

  const description = yield lookAhead(everyCharUntil(DisagreeCheckboxParser));

  if (title === 'duplicate') {
    const dupSectionResult = yield DuplicateSectionParser;

    return {
      title: title,
      description: description,
      teamChose: null,
      testerChose: null,
      disagreeCheckboxValue: dupSectionResult.disagreeCheckboxValue,
      reasonForDisagreement: dupSectionResult.reasonForDisagreement
    };
  }

  // team and tester response
  const extractResponseParser = buildExtractResponseParser(title);
  const testerResponseParser = buildTesterResponseParser(extractResponseParser);

  yield str(TEAM_CHOSE_PREFIX);
  const teamChose = yield extractResponseParser;
  yield whitespace;
  // response section does not have tester response
  const testerChose = yield possibly(testerResponseParser);
  yield optionalWhitespace;

  const disagreeCheckboxValue = yield DisagreeCheckboxParser;
  const reasonForDisagreement = yield DisagreeReasonParser;

  return {
    title: title,
    description: description,
    teamChose: teamChose,
    testerChose: testerChose,
    disagreeCheckboxValue: disagreeCheckboxValue,
    reasonForDisagreement: reasonForDisagreement
  };
});

import { buildCheckboxParser } from './common-parsers.model';

const {
  between,
  coroutine,
  everyCharUntil,
  letters,
  lookAhead,
  optionalWhitespace,
  pipeParsers,
  possibly,
  str,
  whitespace
} = require('arcsecond');

const SECTION_TITLE_PREFIX = '## :question: Issue ';
const TEAM_CHOSE_PREFIX = 'Team chose ';
const TESTER_CHOSE_PREFIX = 'Originally ';
const DISAGREE_CHECKBOX_DESCRIPTION = 'I disagree';
const DISAGREEMENT_REASON_PREFIX = '**Reason for disagreement:** ';
const LINE_SEPARATOR = '-------------------';
const DUPLICATE_STATUS_MESSAGE =
  "Team chose to mark this issue as a duplicate of another issue (as explained in the _**Team's response**_ above)";

export const DisagreeCheckboxParser = buildCheckboxParser(DISAGREE_CHECKBOX_DESCRIPTION);

function buildExtractResponseParser(category: string) {
  return between(str('[`' + category + '.'))(str('`]'))(letters);
}

function buildTeamResponseParser(category: string) {
  const extractResponseParser = buildExtractResponseParser(category);

  return pipeParsers([str(TEAM_CHOSE_PREFIX), extractResponseParser]);
}

function buildTesterResponseParser(category: string) {
  const extractResponseParser = buildExtractResponseParser(category);

  return pipeParsers([str(TESTER_CHOSE_PREFIX), extractResponseParser]);
}

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
  yield whitespace;
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

  if (title === 'duplicate') {
    const dupSectionResult = yield DuplicateSectionParser;
    yield optionalWhitespace;

    return {
      title: title + ' status',
      description: DUPLICATE_STATUS_MESSAGE,
      teamChose: null,
      testerChose: null,
      disagreeCheckboxValue: dupSectionResult.disagreeCheckboxValue,
      reasonForDisagreement: dupSectionResult.reasonForDisagreement
    };
  }

  const description = yield lookAhead(everyCharUntil(DisagreeCheckboxParser));

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

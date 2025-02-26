/**
 * A tester response section generally has this format (apart from the duplicate issue section)
 *
 * ## :question: Issue {type of verification}
 *
 * Team chose [{ team response }].
 * Originally [{ tester response }].
 *
 * - [ ] I disagree
 *
 * **Reason for disagreement:** { disagreement reason }
 *
 * <catcher-end-of-segment><hr>
 *
 * A concrete example would be:
 *
 * ## :question: Issue severity
 *
 * Team chose [`severity.Low`]
 * Originally [`severity.Medium`]
 *
 * - [x] I disagree
 *
 * **Reason for disagreement:** The team is silly and doesn't understand how bad this bug is!!!
 *
 * <catcher-end-of-segment><hr>
 */

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
const LINE_SEPARATOR = '<catcher-end-of-segment><hr>';
const DUPLICATE_STATUS_MESSAGE =
  "Team chose to mark this issue as a duplicate of another issue (as explained in the _**Team's response**_ above)";

export const DisagreeCheckboxParser = buildCheckboxParser(DISAGREE_CHECKBOX_DESCRIPTION);

/**
 * This parser extracts the response for the item disagreed on.
 * E.g. for [`severity.Low`], the category is 'severity' and the parser would return 'Low'
 * @param category
 * @returns a string indicating the response in that category
 */
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

/**
 * The duplicate issue section has a different format than the other three, which is below:
 *
 * ## :question: Issue duplicate status
 *
 * Team chose to mark this issue as a duplicate of another issue (as explained in the _**Team's response**_ above)
 *
 *
 *
 * - [ ] I disagree
 *
 * **Reason for disagreement:** [replace this with your explanation]
 *
 * <catcher-end-of-segment><hr>
 */
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
  // response section does not have tester response, i.e. no "Originally [`response.Something`]"
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

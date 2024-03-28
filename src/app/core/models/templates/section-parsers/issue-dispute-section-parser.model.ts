/**
 * An issue dispute section has the following format:
 *
 * ## :question: Issue { type of verification }
 *
 * ### Team says:
 *
 * { team's action that is being disputed }
 *
 * ### Tester says:
 *
 * { tester's objection }
 *
 * <catcher-end-of-segment><hr>
 *
 * A concrete example would be:
 *
 * ## :question: Issue type
 *
 * ### Team says:
 *
 * Team chose [`type.DocumentationBug`].
 * Originally [`type.FunctionalityBug`].
 *
 * This use case is just not in the docs.
 *
 * ### Tester says:
 *
 * It's not a use case, it's a bug! This has nothing to do with the docs.
 *
 * <catcher-end-of-segment><hr>
 *
 */

import { IssueDispute } from '../../issue-dispute.model';

const { coroutine, everyCharUntil, optionalWhitespace, str } = require('arcsecond');

const SECTION_TITLE_PREFIX = '## :question: ';
const TEAM_SAYS_HEADER = '### Team says:';
const LINE_SEPARATOR = '<catcher-end-of-segment><hr>';

export const IssueDisputeSectionParser = coroutine(function* () {
  yield str(SECTION_TITLE_PREFIX);
  const title = yield everyCharUntil(str(TEAM_SAYS_HEADER));

  const description = yield everyCharUntil(str(LINE_SEPARATOR));
  yield str(LINE_SEPARATOR);
  yield optionalWhitespace;

  return new IssueDispute(title.trim(), description.trim());
});

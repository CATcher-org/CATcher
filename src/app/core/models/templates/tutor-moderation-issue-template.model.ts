/**
 * A Tutor Moderation Issue comment has this format:
 *
 * # Issue Description
 * { original issue description }
 *
 * # Team's Response
 * { team's response}
 *
 * # Disputes
 *
 * { 1 or more Issue Dispute sections, see issue-dispute-section-parser.model.ts }
 *
 * A concrete example would be:
 *
 * # Issue Description
 * This feature doesn't work when I enter this input!
 *
 * # Team's Response
 * This is not a bug, it is a feature
 *
 * # Disputes
 *
 * ## :question: Issue type
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
 * ## :question: Issue severity
 *
 * Team chose [`severity.VeryLow`].
 * Originally [`severity.High`].
 *
 * This only affects users a tiny little bit.
 *
 * ### Tester says:
 * You don't understand how frustrating this bug is!!
 *
 * <catcher-end-of-segment><hr>
 */

import { GithubIssue } from '../github/github-issue.model';
import { IssueDispute } from '../issue-dispute.model';
import { buildTeamResponseSectionParser } from './section-parsers/common-parsers.model';
import { IssueDisputeSectionParser } from './section-parsers/issue-dispute-section-parser.model';
import { Template } from './template.model';

const { coroutine, everyCharUntil, many1, str, whitespace } = require('arcsecond');

interface TutorModerationIssueParseResult {
  description: string;
  teamResponse: string;
  issueDisputes: IssueDispute[];
}

const DESCRIPTION_HEADER = '# Issue Description';
const TEAM_RESPONSE_HEADER = "# Team's Response";
const DISPUTES_HEADER = '# Disputes';

const TeamResponseSectionParser = buildTeamResponseSectionParser(DISPUTES_HEADER);

export const TutorModerationIssueParser = coroutine(function* () {
  yield str(DESCRIPTION_HEADER);
  yield whitespace;
  const description = yield everyCharUntil(str(TEAM_RESPONSE_HEADER));

  const teamResponse = yield TeamResponseSectionParser;

  // parse disputes
  yield str(DISPUTES_HEADER);
  yield whitespace;
  const disputes = yield many1(IssueDisputeSectionParser);

  const result: TutorModerationIssueParseResult = {
    description: description.trim(),
    teamResponse: teamResponse,
    issueDisputes: disputes
  };
  return result;
});

export class TutorModerationIssueTemplate extends Template {
  description: string;
  teamResponse: string;
  disputes: IssueDispute[];

  constructor(githubIssue: GithubIssue) {
    super(TutorModerationIssueParser);

    const parsed = TutorModerationIssueParser.run(githubIssue.body);

    if (parsed.isError) {
      this.parseFailure = true;
      return;
    }

    this.parseResult = parsed.result;
    this.description = this.parseResult.description;
    this.teamResponse = this.parseResult.teamResponse;
    this.disputes = this.parseResult.issueDisputes;
  }
}

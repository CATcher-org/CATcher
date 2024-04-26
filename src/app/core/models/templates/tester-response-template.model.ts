/**
 * A Tester Response comment has the following format:
 *
 * [IMPORTANT!: Please do not edit or reply to this comment using the GitHub UI. \
      You can respond to it using CATcher during the next phase of the PE]
 *
 * # Team's response
 *
 * { team's response }
 *
 * # Items for the Tester to Verify
 *
 * { 1 or more Tester Response sections, see tester-response-section-parser.model.ts }
 *
 * A concrete example would be:
 *
 * [IMPORTANT!: Please do not edit or reply to this comment using the GitHub UI. \
      You can respond to it using CATcher during the next phase of the PE]
 *
 * # Team's response
 *
 * This is not a bug, it's a feature
 *
 * # Items for the Tester to Verify
 *
 * ## :question: Issue type
 *
 * Team chose [`type.DocumentationBug`].
 * Originally [`type.FunctionalityBug`].
 *
 * [x] - I disagree
 *
 * **Reason for disagreement:**
 * It's not a use case, it's a bug! This has nothing to do with the docs.
 *
 * <catcher-end-of-segment><hr>
 *
 * ## :question: Issue severity
 *
 * Team chose [`severity.VeryLow`].
 * Originally [`severity.High`].
 *
 * [x] - I disagree
 *
 * **Reason for disagreement:**
 * You don't understand how frustrating this bug is!!
 *
 * <catcher-end-of-segment><hr>
 */

import { IssueComment } from '../comment.model';
import { GithubComment } from '../github/github-comment.model';
import { TesterResponse } from '../tester-response.model';
import { buildTeamResponseSectionParser } from './section-parsers/common-parsers.model';
import { TesterResponseSectionParser } from './section-parsers/tester-response-section-parser.model';
import { Template } from './template.model';

const { coroutine, many1, str, optionalWhitespace, possibly, whitespace } = require('arcsecond');

interface TesterResponseParseResult {
  teamResponse: string;
  testerResponses: TesterResponse[];
  testerDisagree: boolean;
  teamChosenSeverity: string;
  teamChosenType: string;
}

const GITHUB_UI_EDIT_WARNING =
  // eslint-disable-next-line max-len
  '[IMPORTANT!: Please do not edit or reply to this comment using the GitHub UI. You can respond to it using CATcher during the next phase of the PE]';
const TESTER_RESPONSES_HEADER = '# Items for the Tester to Verify';
const DISAGREE_CHECKBOX_DESCRIPTION = 'I disagree';

const TeamResponseSectionParser = buildTeamResponseSectionParser(TESTER_RESPONSES_HEADER);

export const TesterResponseParser = coroutine(function* () {
  yield possibly(str(GITHUB_UI_EDIT_WARNING));
  yield optionalWhitespace;

  const teamResponse = yield TeamResponseSectionParser;

  // parse tester responses from comment
  yield str(TESTER_RESPONSES_HEADER);
  yield whitespace;
  const responses = yield many1(TesterResponseSectionParser);

  // build array of TesterResponse
  let testerDisagree = false;
  let teamChosenSeverity: string;
  let teamChosenType: string;
  const testerResponses: TesterResponse[] = [];

  for (const response of responses) {
    if (response.disagreeCheckboxValue) {
      testerDisagree = true;
    }

    if (response.title === 'severity') {
      teamChosenSeverity = response.teamChose;
    } else if (response.title === 'type') {
      teamChosenType = response.teamChose;
    }

    testerResponses.push(
      new TesterResponse(
        'Issue ' + response.title,
        response.description,
        DISAGREE_CHECKBOX_DESCRIPTION,
        response.disagreeCheckboxValue,
        response.reasonForDisagreement
      )
    );
  }

  const result: TesterResponseParseResult = {
    teamResponse: teamResponse,
    testerResponses: testerResponses,
    testerDisagree: testerDisagree,
    teamChosenSeverity: teamChosenSeverity,
    teamChosenType: teamChosenType
  };
  return result;
});

export class TesterResponseTemplate extends Template {
  teamResponse: string;
  testerResponses: TesterResponse[];
  testerDisagree: boolean;
  comment: IssueComment;
  teamChosenSeverity?: string;
  teamChosenType?: string;

  constructor(githubComments: GithubComment[]) {
    super(TesterResponseParser);

    const templateConformingComment = this.findConformingComment(githubComments);

    if (this.parseFailure) {
      return;
    }

    this.comment = <IssueComment>{
      ...templateConformingComment,
      description: templateConformingComment.body
    };

    this.teamResponse = this.parseResult.teamResponse;
    this.testerResponses = this.parseResult.testerResponses;
    this.testerDisagree = this.parseResult.testerDisagree;
    this.teamChosenSeverity = this.parseResult.teamChosenSeverity;
    this.teamChosenType = this.parseResult.teamChosenType;
  }
}

import { IssueComment } from '../comment.model';
import { GithubComment } from '../github/github-comment.model';
import { TesterResponse } from '../tester-response.model';
import { TesterResponseSectionParser } from './sections/tester-response-section-parser.model';
import { Header, Template } from './template.model';

const { coroutine, everyCharUntil, many1, str, whitespace } = require('arcsecond');

export const TesterResponseHeaders = {
  teamResponse: new Header("Team's Response", 1),
  testerResponses: new Header('Items for the Tester to Verify', 1)
};

const TEAM_RESPONSE_HEADER = "# Team's Response";
const TESTER_RESPONSES_HEADER = '# Items for the Tester to Verify';
const DISAGREE_CHECKBOX_DESCRIPTION = 'I disagree';

export const TesterResponseParser = coroutine(function* () {
  yield str(TEAM_RESPONSE_HEADER); // parse and ignore header
  yield whitespace;
  let teamResponse = yield everyCharUntil(str(TESTER_RESPONSES_HEADER));

  // parse tester responses from comment
  yield str(TESTER_RESPONSES_HEADER);
  yield whitespace;
  const testerReponses = yield many1(TesterResponseSectionParser);

  teamResponse = teamResponse.trim();
  if (teamResponse === '') {
    teamResponse = null;
  }

  // build array of TesterResponse
  let testerDisagree = false;
  let teamChosenSeverity: string;
  let teamChosenType: string;
  const testerResponses: TesterResponse[] = [];

  for (const response of testerReponses) {
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

  return {
    teamResponse: teamResponse,
    testerResponses: testerResponses,
    testerDisagree: testerDisagree,
    teamChosenSeverity: teamChosenSeverity,
    teamChosenType: teamChosenType
  };
});

export class TesterResponseTemplate extends Template {
  teamResponse: string;
  testerResponses: TesterResponse[];
  testerDisagree: boolean;
  comment: IssueComment;
  teamChosenSeverity?: string;
  teamChosenType?: string;

  constructor(githubComments: GithubComment[]) {
    super(TesterResponseParser, Object.values(TesterResponseHeaders));

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

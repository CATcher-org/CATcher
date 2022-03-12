import { IssueComment } from '../comment.model';
import { GithubComment } from '../github/github-comment.model';
import { TesterResponse } from '../tester-response.model';
import { Section } from './sections/section.model';
import { TesterResponseSectionParser } from './sections/tester-response-section-parser.model';
import { TesterResponseSection } from './sections/tester-response-section.model';
import { FAIL_PARSER, Header, Template } from './template.model';

const { coroutine, everyCharUntil, many1, str, whitespace } = require('arcsecond');

export const TesterResponseHeaders = {
  teamResponse: new Header("Team's Response", 1),
  testerResponses: new Header('Items for the Tester to Verify', 1)
};

const TEAM_RESPONSE_HEADER = "# Team's Response";
const TESTER_RESPONSES_HEADER = '# Items for the Tester to Verify';
const DISAGREE_CHECKBOX_DESCRIPTION = 'I disagree';

const TesterResponseParser = coroutine(function* () {
  yield str(TEAM_RESPONSE_HEADER); // parse and ignore header
  yield whitespace;
  const teamResponse = yield everyCharUntil(str(TESTER_RESPONSES_HEADER));

  yield str(TESTER_RESPONSES_HEADER);
  yield whitespace;
  const testerReponses = yield many1(TesterResponseSectionParser);

  let testerDisagree: boolean;
  let teamChosenSeverity: string;
  let teamChosenType: string;
  let testerResponses: TesterResponse[];

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
        response.title,
        response.description,
        DISAGREE_CHECKBOX_DESCRIPTION,
        response.disagreeCheckboxValue,
        response.reasonForDisagreement
      )
    );
  }

  return {
    teamResponse: teamResponse.trim(),
    testerReponses: testerReponses,
    testerDisagree: testerDisagree,
    teamChosenSeverity: teamChosenSeverity,
    teamChosenType: teamChosenType
  };
});

export class TesterResponseTemplate extends Template {
  teamResponse: Section;
  testerResponse: TesterResponseSection;
  testerDisagree: boolean;
  comment: IssueComment;
  teamChosenSeverity?: string;
  teamChosenType?: string;

  constructor(githubComments: GithubComment[]) {
    super(FAIL_PARSER, Object.values(TesterResponseHeaders));

    const templateConformingComment = this.findConformingComment(githubComments);

    if (this.parseFailure) {
      return;
    }

    this.comment = <IssueComment>{
      ...templateConformingComment,
      description: templateConformingComment.body
    };
    this.teamResponse = this.parseTeamResponse(this.comment.description);
    this.testerResponse = this.parseTesterResponse(this.comment.description);
    this.testerDisagree = this.testerResponse.getTesterDisagree();
    this.teamChosenSeverity = this.testerResponse.getTeamChosenSeverity();
    this.teamChosenType = this.testerResponse.getTeamChosenType();
  }

  parseTeamResponse(toParse: string): Section {
    return new Section(this.getSectionalDependency(TesterResponseHeaders.teamResponse), toParse);
  }

  parseTesterResponse(toParse: string): TesterResponseSection {
    return new TesterResponseSection(this.getSectionalDependency(TesterResponseHeaders.testerResponses), toParse);
  }
}

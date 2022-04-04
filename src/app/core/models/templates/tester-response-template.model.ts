import { IssueComment } from '../comment.model';
import { GithubComment } from '../github/github-comment.model';
import { TesterResponse } from '../tester-response.model';
import { buildTeamResponseSectionParser } from './sections/common-parsers.model';
import { Section } from './sections/section.model';
import { TesterResponseSectionParser } from './sections/tester-response-section-parser.model';
import { TesterResponseSection } from './sections/tester-response-section.model';
import { Header, Template } from './template.model';

const { coroutine, many1, str, whitespace } = require('arcsecond');

export const TesterResponseHeaders = {
  teamResponse: new Header("Team's Response", 1),
  testerResponses: new Header('Items for the Tester to Verify', 1)
};

interface TesterResponseParseResult {
  teamResponse: string;
  testerResponses: TesterResponse[];
  testerDisagree: boolean;
  teamChosenSeverity: string;
  teamChosenType: string;
}

const TESTER_RESPONSES_HEADER = '# Items for the Tester to Verify';
const DISAGREE_CHECKBOX_DESCRIPTION = 'I disagree';

const TeamResponseSectionParser = buildTeamResponseSectionParser(TESTER_RESPONSES_HEADER);

export const TesterResponseParser = coroutine(function* () {
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
  teamResponse: Section;
  testerResponse: TesterResponseSection;
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

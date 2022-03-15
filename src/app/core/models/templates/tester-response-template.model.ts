import { IssueComment } from '../comment.model';
import { GithubComment } from '../github/github-comment.model';
import { Section } from './sections/section.model';
import { TesterResponseSection } from './sections/tester-response-section.model';
import { Header, Template } from './template.model';

const { everyCharUntil, str, sequenceOf, whitespace } = require('arcsecond');

export const TesterResponseHeaders = {
  teamResponse: new Header("Team's Response", 1),
  testerResponses: new Header('Items for the Tester to Verify', 1)
};

const TEAM_RESPONSE_HEADER = "# Team's Response";
const TESTER_RESPONSES_HEADER = '# Items for the Tester to Verify';

const TesterResponseParser = sequenceOf([
  str(TEAM_RESPONSE_HEADER),
  whitespace,
  everyCharUntil(str(TESTER_RESPONSES_HEADER)),
  str(TESTER_RESPONSES_HEADER)
]);

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

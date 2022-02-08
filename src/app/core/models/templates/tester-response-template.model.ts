import { IssueComment } from '../comment.model';
import { GithubComment } from '../github/github-comment.model';
import { Section } from './sections/section.model';
import { TesterResponseSection } from './sections/tester-response-section.model';
import { Header, Template } from './template.model';

export const TesterResponseHeaders = {
  teamResponse: new Header("Team's Response", 1),
  testerResponses: new Header('Items for the Tester to Verify', 1)
};
export const TeamAcceptedMessage = 'Your response not required for this bug as the team has accepted the bug as it is.';
const TeamAcceptedRegex = new RegExp(TeamAcceptedMessage);

export class TesterResponseTemplate extends Template {
  teamResponse: Section;
  testerResponse: TesterResponseSection;
  comment: IssueComment;
  teamChosenSeverity?: string;
  teamChosenType?: string;
  teamAccepted?: boolean;

  constructor(githubIssueComments: GithubComment[]) {
    super(Object.values(TesterResponseHeaders));

    const templateConformingComment = githubIssueComments.find((comment) => this.test(comment.body));
    const teamAcceptedComment = githubIssueComments.find((comment) => this.testTeamAccepted(comment.body));

    if (teamAcceptedComment) {
      this.teamAccepted = true;
      return;
    }

    this.comment = <IssueComment>{
      ...templateConformingComment,
      description: templateConformingComment.body
    };
    this.teamResponse = this.parseTeamResponse(this.comment.description);
    this.testerResponse = this.parseTesterResponse(this.comment.description);
    this.teamChosenSeverity = this.testerResponse.getTeamChosenSeverity();
    this.teamChosenType = this.testerResponse.getTeamChosenType();
  }

  parseTeamResponse(toParse: string): Section {
    return new Section(this.getSectionalDependency(TesterResponseHeaders.teamResponse), toParse);
  }

  parseTesterResponse(toParse: string): TesterResponseSection {
    return new TesterResponseSection(this.getSectionalDependency(TesterResponseHeaders.testerResponses), toParse);
  }

  testTeamAccepted(toTest: string): boolean {
    return TeamAcceptedRegex.exec(toTest) != null;
  }
}

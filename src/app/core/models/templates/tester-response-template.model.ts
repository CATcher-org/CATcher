import { IssueComment } from '../comment.model';
import { GithubComment } from '../github/github-comment.model';
import { Section } from './sections/section.model';
import { TesterResponseSection } from './sections/tester-response-section.model';
import { Header, Template } from './template.model';

export const TesterResponseHeaders = {
  teamResponse: new Header("Team's Response", 1),
  testerResponses: new Header('Items for the Tester to Verify', 1)
};

export class TesterResponseTemplate extends Template {
  teamResponse: Section;
  testerResponse: TesterResponseSection;
  testerDisagree: boolean;
  comment: IssueComment;
  teamChosenSeverity?: string;
  teamChosenType?: string;

  constructor(githubComments: GithubComment[]) {
    super(Object.values(TesterResponseHeaders));

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

import { Header, Template } from './template.model';
import { TesterResponseSection } from './sections/test-response-section.model';
import { Section } from './sections/section.model';
import { GithubComment } from '../github-comment.model';


const testerResponseHeaders = {
  teamResponse: new Header('Team\'s Response', 1),
  testerResponses: new Header('Items for the Tester to Verify', 1),
};

export class TesterResponseTemplate extends Template {
  teamResponse: Section;
  testerResponse: TesterResponseSection;

  constructor(githubIssueComments: GithubComment[]) {
    super(Object.values(testerResponseHeaders));

    const templateConformingComment = githubIssueComments.find(comment => this.test(comment.body)).body;
    this.teamResponse = this.parseTeamResponse(templateConformingComment);
    this.testerResponse = this.parseTesterResponse(templateConformingComment);
  }

  parseTeamResponse(toParse: string): Section {
    return new Section(this.getSectionalDependency(testerResponseHeaders.teamResponse), toParse);
  }

  parseTesterResponse(toParse: string): TesterResponseSection {
    return new TesterResponseSection(this.getSectionalDependency(testerResponseHeaders.testerResponses), toParse);
  }
}

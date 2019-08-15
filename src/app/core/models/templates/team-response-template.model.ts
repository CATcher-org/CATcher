import { DuplicateOfSection } from './sections/duplicate-of-section.model';
import { Header, Template } from './template.model';
import { Section } from './sections/section.model';
import { GithubIssue } from '../github-issue.model';

const teamResponseHeaders = {
  description: new Header('Description', 1),
  teamResponse: new Header('Team\'s Response', 1),
  duplicateOf: new Header('State the duplicated issue here, if any', 2),
};

export class TeamResponseTemplate extends Template {
  description: Section;
  teamResponse: Section;
  duplicateOf: DuplicateOfSection;

  constructor(githubIssue: GithubIssue) {
    super(Object.values(teamResponseHeaders));

    const issueContent = githubIssue.body;
    this.description = this.parseDescription(issueContent);
    this.teamResponse = this.parseTeamResponse(issueContent);
    this.duplicateOf = this.parseDuplicateOf(issueContent);
  }

  parseDescription(toParse: string): Section {
    return new Section(this.getSectionalDependency(teamResponseHeaders.description), toParse);
  }

  parseTeamResponse(toParse: string): Section {
    return new Section(this.getSectionalDependency(teamResponseHeaders.teamResponse), toParse);
  }

  parseDuplicateOf(toParse: string): DuplicateOfSection {
    return new DuplicateOfSection(this.getSectionalDependency(teamResponseHeaders.duplicateOf), toParse);
  }
}

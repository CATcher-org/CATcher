import { DuplicateOfSection } from './sections/duplicate-of-section.model';
import { Header, Template } from './template.model';
import { Section } from './sections/section.model';
import { GithubIssue } from '../github-issue.model';
import { GithubComment } from '../github-comment.model';

const teamResponseHeaders = {
  teamResponse: new Header('Team\'s Response', 1),
  duplicateOf: new Header('Duplicate status (if any):', 2),
};

export class TeamResponseTemplate extends Template {
  teamResponse: Section;
  duplicateOf: DuplicateOfSection;

  constructor(githubComments: GithubComment[]) {
    super(Object.values(teamResponseHeaders));

    const commentsContent = githubComments.find((githubComment: GithubComment) => this.test(githubComment.body)).body;
    this.teamResponse = this.parseTeamResponse(commentsContent);
    this.duplicateOf = this.parseDuplicateOf(commentsContent);
  }

  parseTeamResponse(toParse: string): Section {
    return new Section(this.getSectionalDependency(teamResponseHeaders.teamResponse), toParse);
  }

  parseDuplicateOf(toParse: string): DuplicateOfSection {
    return new DuplicateOfSection(this.getSectionalDependency(teamResponseHeaders.duplicateOf), toParse);
  }
}

import { IssueComment } from '../comment.model';
import { GithubComment } from '../github/github-comment.model';
import { DuplicateOfSection } from './sections/duplicate-of-section.model';
import { Section } from './sections/section.model';
import { Header, Template } from './template.model';

const { everyCharUntil, str, sequenceOf, whitespace } = require('arcsecond');

export const TeamResponseHeaders = {
  teamResponse: new Header("Team's Response", 1),
  duplicateOf: new Header('Duplicate status \\(if any\\):', 2)
};

const TEAM_RESPONSE_HEADER = "# Team's Response";
const DUPLICATE_OF_HEADER = '## Duplicate status (if any):';

const TeamResponseParser = sequenceOf([
  str(TEAM_RESPONSE_HEADER),
  whitespace,
  everyCharUntil(str(DUPLICATE_OF_HEADER)),
  str(DUPLICATE_OF_HEADER)
]);

export class TeamResponseTemplate extends Template {
  teamResponse: Section;
  duplicateOf: DuplicateOfSection;
  comment: IssueComment;
  parseError: boolean;

  constructor(githubComments: GithubComment[]) {
    super(TeamResponseParser, Object.values(TeamResponseHeaders));

    const comment = githubComments.find((githubComment: GithubComment) => this.test(githubComment.body));
    if (comment === undefined) {
      this.parseError = true;
      return;
    }
    this.comment = <IssueComment>{
      ...comment,
      description: comment.body,
      createdAt: comment.created_at,
      updatedAt: comment.updated_at
    };
    const commentsContent: string = comment.body;
    this.teamResponse = this.parseTeamResponse(commentsContent);
    this.duplicateOf = this.parseDuplicateOf(commentsContent);
  }

  parseTeamResponse(toParse: string): Section {
    return new Section(this.getSectionalDependency(TeamResponseHeaders.teamResponse), toParse);
  }

  parseDuplicateOf(toParse: string): DuplicateOfSection {
    return new DuplicateOfSection(this.getSectionalDependency(TeamResponseHeaders.duplicateOf), toParse);
  }
}

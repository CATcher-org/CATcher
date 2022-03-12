import { IssueComment } from '../comment.model';
import { GithubComment } from '../github/github-comment.model';
import { DuplicateOfSection } from './sections/duplicate-of-section.model';
import { Section } from './sections/section.model';
import { Header, Template } from './template.model';

const { choice, coroutine, digits, everyCharUntil, str, whitespace } = require('arcsecond');

export const TeamResponseHeaders = {
  teamResponse: new Header("Team's Response", 1),
  duplicateOf: new Header('Duplicate status \\(if any\\):', 2)
};

const TEAM_RESPONSE_HEADER = "# Team's Response";
const DUPLICATE_OF_HEADER = '## Duplicate status (if any):';

const DuplicateNumberParser = coroutine(function* () {
  yield str('Duplicate of #'); // parse and ignore
  const issueNumber = yield digits; // parse and store duplicate issue number
  return parseInt(issueNumber, 10); // issueNumber is a string, radix added to pass linting
});

const TeamResponseParser = coroutine(function* () {
  yield str(TEAM_RESPONSE_HEADER); // parse and ignore header
  yield whitespace; // parse and ignore newline character
  const teamResponse = yield everyCharUntil(str(DUPLICATE_OF_HEADER)); // parse and store team's response

  yield str(DUPLICATE_OF_HEADER);
  yield whitespace;
  let issueNumber = yield choice([
    // either parse duplicate issue number or '--' if no duplicates
    DuplicateNumberParser,
    str('--')
  ]);

  if (issueNumber === '--') {
    issueNumber = null;
  }

  return {
    teamResponse: teamResponse.trim(), // remove trailing whitespace
    issueNumber: issueNumber
  };
});

export class TeamResponseTemplate extends Template {
  teamResponse: Section;
  duplicateOf: DuplicateOfSection;
  comment: IssueComment;

  constructor(githubComments: GithubComment[]) {
    super(TeamResponseParser, Object.values(TeamResponseHeaders));

    const templateConformingComment = this.findConformingComment(githubComments);

    if (this.parseFailure) {
      return;
    }

    this.comment = <IssueComment>{
      ...templateConformingComment,
      description: templateConformingComment.body,
      createdAt: templateConformingComment.created_at,
      updatedAt: templateConformingComment.updated_at
    };
    const commentsContent: string = templateConformingComment.body;
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

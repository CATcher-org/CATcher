import { IssueComment } from '../comment.model';
import { GithubComment } from '../github/github-comment.model';
import { buildTeamResponseSectionParser } from './section-parsers/common-parsers.model';
import { Template } from './template.model';

const { choice, coroutine, digits, str, whitespace } = require('arcsecond');

interface TeamResponseParseResult {
  teamResponse: string;
  issueNumber: number;
}

const DUPLICATE_OF_HEADER = '## Duplicate status (if any):';

const TeamResponseSectionParser = buildTeamResponseSectionParser(DUPLICATE_OF_HEADER);

const DuplicateNumberParser = coroutine(function* () {
  yield str('Duplicate of #'); // parse and ignore
  const issueNumber = yield digits; // parse and store duplicate issue number
  return parseInt(issueNumber, 10); // issueNumber is a string, radix added to pass linting
});

export const TeamResponseParser = coroutine(function* () {
  const teamResponse = yield TeamResponseSectionParser;

  yield str(DUPLICATE_OF_HEADER);
  yield whitespace;
  const issueNumber = yield choice([
    // either parse duplicate issue number or '--' if no duplicates
    DuplicateNumberParser,
    str('--')
  ]).map((num) => (num === '--' ? null : num));

  const result: TeamResponseParseResult = {
    teamResponse: teamResponse,
    issueNumber: issueNumber
  };
  return result;
});

export class TeamResponseTemplate extends Template {
  teamResponse: string;
  duplicateOf: number;
  comment: IssueComment;

  constructor(githubComments: GithubComment[]) {
    super(TeamResponseParser);

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

    this.teamResponse = this.parseResult.teamResponse;
    this.duplicateOf = this.parseResult.issueNumber;
  }
}

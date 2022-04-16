import { GithubIssue } from '../github/github-issue.model';
import { IssueDispute } from '../issue-dispute.model';
import { buildTeamResponseSectionParser } from './section-parsers/common-parsers.model';
import { IssueDisputeSectionParser } from './section-parsers/issue-dispute-section-parser.model';
import { Template } from './template.model';

const { coroutine, everyCharUntil, many1, str, whitespace } = require('arcsecond');

interface TutorModerationIssueParseResult {
  description: string;
  teamResponse: string;
  issueDisputes: IssueDispute[];
}

const DESCRIPTION_HEADER = '# Issue Description';
const TEAM_RESPONSE_HEADER = "# Team's Response";
const DISPUTES_HEADER = '# Disputes';

const TeamResponseSectionParser = buildTeamResponseSectionParser(DISPUTES_HEADER);

export const TutorModerationIssueParser = coroutine(function* () {
  yield str(DESCRIPTION_HEADER);
  yield whitespace;
  const description = yield everyCharUntil(str(TEAM_RESPONSE_HEADER));

  const teamResponse = yield TeamResponseSectionParser;

  // parse disputes
  yield str(DISPUTES_HEADER);
  yield whitespace;
  const disputes = yield many1(IssueDisputeSectionParser);

  const result: TutorModerationIssueParseResult = {
    description: description.trim(),
    teamResponse: teamResponse,
    issueDisputes: disputes
  };
  return result;
});

export class TutorModerationIssueTemplate extends Template {
  description: string;
  teamResponse: string;
  disputes: IssueDispute[];

  constructor(githubIssue: GithubIssue) {
    super(TutorModerationIssueParser);

    const parsed = TutorModerationIssueParser.run(githubIssue.body);

    if (parsed.isError) {
      this.parseFailure = true;
      return;
    }

    this.parseResult = parsed.result;
    this.description = this.parseResult.description;
    this.teamResponse = this.parseResult.teamResponse;
    this.disputes = this.parseResult.issueDisputes;
  }
}

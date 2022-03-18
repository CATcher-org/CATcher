import { GithubIssue } from '../github/github-issue.model';
import { IssueDispute } from '../issue-dispute.model';
import { IssueDisputeSectionParser } from './sections/issue-dispute-section-parser.model';
import { Template } from './template.model';

const { coroutine, everyCharUntil, many1, str, whitespace } = require('arcsecond');

const DESCRIPTION_HEADER = '# Issue Description';
const TEAM_RESPONSE_HEADER = "# Team's Response";
const DISPUTES_HEADER = '# Disputes';

export const TutorModerationIssueParser = coroutine(function* () {
  yield str(DESCRIPTION_HEADER);
  yield whitespace;
  const description = yield everyCharUntil(str(TEAM_RESPONSE_HEADER));

  yield str(TEAM_RESPONSE_HEADER);
  yield whitespace;
  let teamResponse = yield everyCharUntil(str(DISPUTES_HEADER));

  // parse disputes
  yield str(DISPUTES_HEADER);
  yield whitespace;
  const disputes = yield many1(IssueDisputeSectionParser);

  teamResponse = teamResponse.trim();
  if (teamResponse === '') {
    teamResponse = null;
  }

  // build array of IssueDisputes
  const issueDisputes: IssueDispute[] = [];

  for (const dispute of disputes) {
    issueDisputes.push(new IssueDispute(dispute.title, dispute.description));
  }

  return {
    description: description.trim(),
    teamResponse: teamResponse,
    issueDisputes: issueDisputes
  };
});

export class TutorModerationIssueTemplate extends Template {
  description: string;
  teamResponse: string;
  issueDisputes: IssueDispute[];

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
    this.issueDisputes = this.parseResult.issueDisputes;
  }
}

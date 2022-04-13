import { GithubIssue } from '../github/github-issue.model';
import { IssueDispute } from '../issue-dispute.model';
import { buildTeamResponseSectionParser } from './sections/common-parsers.model';
import { IssueDisputeSectionParser } from './sections/issue-dispute-section-parser.model';
import { IssueDisputeSection } from './sections/issue-dispute-section.model';
import { Section } from './sections/section.model';
import { Header, Template } from './template.model';

const { coroutine, everyCharUntil, many1, str, whitespace } = require('arcsecond');

const tutorModerationIssueDescriptionHeaders = {
  description: new Header('Issue Description', 1),
  teamResponse: new Header("Team's Response", 1),
  disputes: new Header('Disputes', 1)
};

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
  description: Section;
  teamResponse: Section;
  dispute: IssueDisputeSection;

  constructor(githubIssue: GithubIssue) {
    super(TutorModerationIssueParser, Object.values(tutorModerationIssueDescriptionHeaders));

    const issueContent = githubIssue.body;
    this.description = this.parseDescription(issueContent);
    this.teamResponse = this.parseTeamResponse(issueContent);
    this.dispute = this.parseDisputes(issueContent);
  }

  parseDescription(toParse: string): Section {
    return new Section(this.getSectionalDependency(tutorModerationIssueDescriptionHeaders.description), toParse);
  }

  parseTeamResponse(toParse: string): Section {
    return new Section(this.getSectionalDependency(tutorModerationIssueDescriptionHeaders.teamResponse), toParse);
  }

  parseDisputes(toParse: string): IssueDisputeSection {
    return new IssueDisputeSection(this.getSectionalDependency(tutorModerationIssueDescriptionHeaders.disputes), toParse);
  }
}

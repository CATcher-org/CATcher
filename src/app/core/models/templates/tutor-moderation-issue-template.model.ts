import { GithubIssue } from '../github/github-issue.model';
import { IssueDispute } from '../issue-dispute.model';
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

const DESCRIPTION_HEADER = '# Issue Description';
const TEAM_RESPONSE_HEADER = "# Team's Response";
const DISPUTES_HEADER = '# Disputes';

export const TutorModerationIssueParser = coroutine(function* () {
  yield str(DESCRIPTION_HEADER);
  yield whitespace;
  const description = yield everyCharUntil(str(TEAM_RESPONSE_HEADER));

  yield str(TEAM_RESPONSE_HEADER);
  yield whitespace;
  const teamResponse = yield everyCharUntil(str(DISPUTES_HEADER));

  // parse disputes
  yield str(DISPUTES_HEADER);
  yield whitespace;
  const disputes = yield many1(IssueDisputeSectionParser);

  // build array of IssueDisputes
  const issueDisputes: IssueDispute[] = [];

  for (const dispute of disputes) {
    issueDisputes.push(new IssueDispute(dispute.title, dispute.description));
  }

  return {
    description: description.trim(),
    teamResponse: teamResponse.trim(),
    issueDisputes: issueDisputes
  };
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

import { GithubIssue } from '../github/github-issue.model';
import { IssueDisputeSection } from './sections/issue-dispute-section.model';
import { Section } from './sections/section.model';
import { Header, Template } from './template.model';

const { everyCharUntil, str, sequenceOf, whitespace } = require('arcsecond');

const tutorModerationIssueDescriptionHeaders = {
  description: new Header('Issue Description', 1),
  teamResponse: new Header("Team's Response", 1),
  disputes: new Header('Disputes', 1)
};

const DESCRIPTION_HEADER = '# Issue Description';
const TEAM_RESPONSE_HEADER = "# Team's Response";
const DISPUTES_HEADER = '# Disputes';

const TutorModerationIssueParser = sequenceOf([
  str(DESCRIPTION_HEADER),
  whitespace,
  everyCharUntil(str(TEAM_RESPONSE_HEADER)),
  str(TEAM_RESPONSE_HEADER),
  whitespace,
  everyCharUntil(str(DISPUTES_HEADER)),
  str(DISPUTES_HEADER)
]);

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

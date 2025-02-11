import { PhaseTesterResponseComponent } from './../../../../src/app/phase-tester-response/phase-tester-response.component';
import { Issue } from '../../../../src/app/core/models/issue.model';
import { Team } from '../../../../src/app/core/models/team.model';
import { getTitleColumnHTML, getTitleColumnContent } from '../../../../src/app/shared/issue-tables/issue-title-column';
import { ISSUE_WITH_ASSIGNEES } from '../../../constants/githubissue.constants';

describe('issue-title-column', () => {
  describe('getTitleColumnHTML', () => {
    const dummyTeam: Team = new Team({
      id: 'dummyId',
      teamMembers: []
    });
    const phaseBugReportingIssue: Issue = Issue.createPhaseBugReportingIssue(ISSUE_WITH_ASSIGNEES);
    const phaseTeamResponseIssue: Issue = Issue.createPhaseTeamResponseIssue(ISSUE_WITH_ASSIGNEES, dummyTeam);
    const phaseTesterResponseIssue: Issue = Issue.createPhaseTesterResponseIssue(ISSUE_WITH_ASSIGNEES);
    const phaseModerationIssue: Issue = Issue.createPhaseModerationIssue(ISSUE_WITH_ASSIGNEES, dummyTeam);
    const expectedTitleHTML: string =
      ISSUE_WITH_ASSIGNEES.title + ' <span style="color: #a3aab1">#' + ISSUE_WITH_ASSIGNEES.number + '</span>';
    it('should return a formatted HTML string with title and ID for Bug Reporting Phase', () => {
      const result = getTitleColumnHTML(phaseBugReportingIssue);
      expect(result).toBe(expectedTitleHTML);
    });

    it('should return a formatted HTML string with title and ID for Team Response Phase', () => {
      const result = getTitleColumnHTML(phaseTeamResponseIssue);
      expect(result).toBe(expectedTitleHTML);
    });

    it('should return a formatted HTML string with title and ID for Tester Response Phase', () => {
      const result = getTitleColumnHTML(phaseTesterResponseIssue);
      expect(result).toBe(expectedTitleHTML);
    });

    it('should return a formatted HTML string with title and ID for Moderation Phase', () => {
      const result = getTitleColumnHTML(phaseModerationIssue);
      expect(result).toBe(expectedTitleHTML);
    });
  });

  describe('getTitleColumnContent', () => {
    const dummyTeam: Team = new Team({
      id: 'dummyId',
      teamMembers: []
    });
    const phaseBugReportingIssue: Issue = Issue.createPhaseBugReportingIssue(ISSUE_WITH_ASSIGNEES);
    const phaseTeamResponseIssue: Issue = Issue.createPhaseTeamResponseIssue(ISSUE_WITH_ASSIGNEES, dummyTeam);
    const phaseTesterResponseIssue: Issue = Issue.createPhaseTesterResponseIssue(ISSUE_WITH_ASSIGNEES);
    const phaseModerationIssue: Issue = Issue.createPhaseModerationIssue(ISSUE_WITH_ASSIGNEES, dummyTeam);
    const expectedTitleContent: string = ISSUE_WITH_ASSIGNEES.title + ' #' + ISSUE_WITH_ASSIGNEES.number;
    it('can return a plain text string with title and ID for Bug Reporting Phase table', () => {
      const result = getTitleColumnContent(phaseBugReportingIssue);
      expect(result).toBe(expectedTitleContent);
    });

    it('can return a plain text string with title and ID for Team Response Phase table', () => {
      const result = getTitleColumnContent(phaseTeamResponseIssue);
      expect(result).toBe(expectedTitleContent);
    });

    it('can return a plain text string with title and ID for Tester Response Phase table', () => {
      const result = getTitleColumnContent(phaseTesterResponseIssue);
      expect(result).toBe(expectedTitleContent);
    });

    it('can return a plain text string with title and ID for Moderation Phase table', () => {
      const result = getTitleColumnContent(phaseModerationIssue);
      expect(result).toBe(expectedTitleContent);
    });
  });
});

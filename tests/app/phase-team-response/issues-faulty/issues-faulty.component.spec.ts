import { IssuesFaultyComponent } from '../../../../src/app/phase-team-response/issues-faulty/issues-faulty.component';
import { Issue, STATUS } from '../../../../src/app/core/models/issue.model';
import { ISSUE_WITH_EMPTY_DESCRIPTION } from '../../../constants/githubissue.constants';
import { IssueService } from '../../../../src/app/core/services/issue.service';
import { UserService } from '../../../../src/app/core/services/user.service';
import { USER_Q, TEAM_4 } from '../../../constants/data.constants';

describe('IssuesFaultyComponent', () => {
  describe('.ngOnInit()', () => {
    const dummyTeam = TEAM_4;
    const dummyIssue = Issue.createPhaseTeamResponseIssue(ISSUE_WITH_EMPTY_DESCRIPTION, dummyTeam);
    const issueService = new IssueService(null, null, null, null, null, null, null);
    issueService.updateLocalStore(dummyIssue);
    const userService = new UserService(null, null);
    userService.currentUser = USER_Q;
    const issuesFaultyComponent = new IssuesFaultyComponent(issueService, userService, null);
    issuesFaultyComponent.ngOnInit();
    const DUMMY_DUPLICATE_ISSUE_ID = 1;
    const DUMMY_RESPONSE = 'dummy response';

    it('should set filter to return false for an issue with no team response', () => {
      const testIssue = { ...dummyIssue, teamResponse: undefined } as Issue;
      issueService.updateLocalStore(testIssue);

      expect(issuesFaultyComponent.filter(testIssue)).toBeFalse();
    });

    it('should set filter to return false for a non-duplicate issue with responses', () => {
      const testIssue = { ...dummyIssue, teamResponse: DUMMY_RESPONSE, duplicateOf: undefined } as Issue;
      issueService.updateLocalStore(testIssue);

      expect(issuesFaultyComponent.filter(testIssue)).toBeFalse();
    });

    it('should set filter to return false for a duplicate issue with responses that is not duplicated by other issues', () => {
      const testIssue = {
        ...dummyIssue,
        teamResponse: DUMMY_RESPONSE,
        duplicateOf: DUMMY_DUPLICATE_ISSUE_ID
      } as Issue;
      issueService.updateLocalStore(testIssue);

      expect(issuesFaultyComponent.filter(testIssue)).toBeFalse();
    });

    it('should set filter to return true for a duplicate issue with responses that is duplicated by other issues', () => {
      const testIssue = {
        ...dummyIssue,
        teamResponse: DUMMY_RESPONSE,
        duplicateOf: dummyIssue.id
      } as Issue;
      issueService.updateLocalStore(testIssue);

      expect(issuesFaultyComponent.filter(testIssue)).toBeTrue();
    });
  });
});

import { IssuesFaultyComponent } from '../../../../src/app/phase-team-response/issues-faulty/issues-faulty.component';
import { Issue, STATUS } from '../../../../src/app/core/models/issue.model';
import { ISSUE_WITH_EMPTY_DESCRIPTION } from '../../../constants/githubissue.constants';
import { Team } from '../../../../src/app/core/models/team.model';
import { IssueService } from '../../../../src/app/core/services/issue.service';
import { UserService } from '../../../../src/app/core/services/user.service';
import { USER_Q, TEAM_4 } from '../../../constants/data.constants';

describe('IssuesFaultyComponent', () => {
  describe('.ngOnInit()', () => {
    const dummyTeam: Team = TEAM_4;
    let dummyIssue: Issue;
    let issuesFaultyComponent: IssuesFaultyComponent;
    const issueService: IssueService = new IssueService(null, null, null, null, null, null, null);
    const userService: UserService = new UserService(null, null);
    userService.currentUser = USER_Q;
    const DUMMY_DUPLICATE_ISSUE_ID = 1;
    const DUMMY_RESPONSE = 'dummy response';

    beforeEach(() => {
      dummyIssue = Issue.createPhaseTeamResponseIssue(ISSUE_WITH_EMPTY_DESCRIPTION, dummyTeam);
      issueService.updateLocalStore(dummyIssue);
      issuesFaultyComponent = new IssuesFaultyComponent(issueService, userService, null);
      issuesFaultyComponent.ngOnInit();
    });

    it('should set filter to return false for an issue with no team response', () => {
      issueService.issues[dummyIssue.id].teamResponse = undefined;

      expect(issuesFaultyComponent.filter(dummyIssue)).toBeFalse();
    });

    it('should set filter to return false for a non-duplicate issue with responses', () => {
      issueService.issues[dummyIssue.id].teamResponse = DUMMY_RESPONSE;
      dummyIssue.duplicateOf = undefined;

      expect(issuesFaultyComponent.filter(dummyIssue)).toBeFalse();
    });

    it('should set filter to return false for a duplicate issue with responses that is not duplicated by other issues', () => {
      issueService.issues[dummyIssue.id].teamResponse = DUMMY_RESPONSE;
      dummyIssue.duplicateOf = DUMMY_DUPLICATE_ISSUE_ID;

      expect(issuesFaultyComponent.filter(dummyIssue)).toBeFalse();
    });

    it('should set filter to return true for a duplicate issue with responses that is duplicated by other issues', () => {
      dummyIssue.duplicateOf = dummyIssue.id;
      issueService.updateLocalStore(dummyIssue);
      issueService.issues[dummyIssue.id].teamResponse = DUMMY_RESPONSE;

      expect(issuesFaultyComponent.filter(dummyIssue)).toBeTrue();
    });
  });
});

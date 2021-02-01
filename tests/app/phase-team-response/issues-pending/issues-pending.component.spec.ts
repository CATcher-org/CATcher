import { IssuesPendingComponent } from '../../../../src/app/phase-team-response/issues-pending/issues-pending.component';
import { Issue } from '../../../../src/app/core/models/issue.model';
import { ISSUE_WITH_EMPTY_DESCRIPTION } from '../../../constants/githubissue.constants';
import { Team } from '../../../../src/app/core/models/team.model';
import { IssueService } from '../../../../src/app/core/services/issue.service';
import { UserService } from '../../../../src/app/core/services/user.service';
import { USER_Q } from '../../../constants/data.constants';

fdescribe('IssuesPendingComponent', () => {
    describe('.ngOnInit', () => {
        const dummyTeam: Team = new Team({
            id: 'dummyId',
            teamMembers: [],
          });
        const dummyIssue: Issue = Issue.createPhaseTeamResponseIssue(ISSUE_WITH_EMPTY_DESCRIPTION, dummyTeam);
        const issueService: IssueService = new IssueService(null, null, null, null, null, null);
        issueService.updateLocalStore(dummyIssue);
        const userService: UserService = new UserService(null, null);
        userService.currentUser = USER_Q;
        const issuesPendingComponent: IssuesPendingComponent = new IssuesPendingComponent(issueService, null, userService);
        const DUMMY_DUPLICATE_ISSUE_ID = 1;
        const DUMMY_RESPONSE = 'dummy response';

        beforeEach(() => {
            issuesPendingComponent.ngOnInit();
        });

        it('should set default filter to return false for duplicate issues with no team response', () => {
            dummyIssue.duplicateOf = DUMMY_DUPLICATE_ISSUE_ID;
            issueService.issues[dummyIssue.id].teamResponse = undefined;

            expect(issuesPendingComponent.filter(dummyIssue)).toBeFalse();
        });

        it('should set default filter to return false for non-duplicate issues with responses', () => {
            dummyIssue.duplicateOf = undefined;
            issueService.issues[dummyIssue.id].teamResponse = DUMMY_RESPONSE;
            dummyIssue.status = 'Done';

            expect(issuesPendingComponent.filter(dummyIssue)).toBeFalse();
        });

        it('should set default filter to return false for duplicate issues with responses', () => {
            dummyIssue.duplicateOf = DUMMY_DUPLICATE_ISSUE_ID;
            issueService.issues[dummyIssue.id].teamResponse = DUMMY_RESPONSE;
            dummyIssue.status = 'Done';

            expect(issuesPendingComponent.filter(dummyIssue)).toBeFalse();
        });

        it('should set default filter to return true for non-duplicate issues with no responses', () => {
            dummyIssue.duplicateOf = undefined;
            issueService.issues[dummyIssue.id].teamResponse = undefined;

            expect(issuesPendingComponent.filter(dummyIssue)).toBeTrue();
        });
    });
});

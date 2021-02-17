import { IssuePendingComponent } from '../../../../src/app/phase-tester-response/issue-pending/issue-pending.component';
import { Issue, STATUS } from '../../../../src/app/core/models/issue.model';
import { ISSUE_WITH_EMPTY_DESCRIPTION } from '../../../constants/githubissue.constants';
import { Team } from '../../../../src/app/core/models/team.model';
import { IssueComment } from '../../../../src/app/core/models/comment.model';
import { EMPTY_TEAM_RESPONSE, PENDING_TUTOR_MODERATION } from '../../../constants/githubcomment.constants';
import { TutorModerationTodoTemplate } from '../../../../src/app/core/models/templates/tutor-moderation-todo-template.model';

describe('IssuePendingComponent', () => {
    describe('.ngOnInit()', () => {
        const dummyTeam: Team = new Team({
            id: 'dummyId',
            teamMembers: [],
          });
        let dummyIssue: Issue;
        let issuePendingComponent: IssuePendingComponent;
        const issueComment: IssueComment = new TutorModerationTodoTemplate([PENDING_TUTOR_MODERATION]).comment;

        beforeEach(() => {
            dummyIssue = Issue.createPhaseTeamResponseIssue(ISSUE_WITH_EMPTY_DESCRIPTION, dummyTeam);
            issuePendingComponent = new IssuePendingComponent();
            issuePendingComponent.ngOnInit();
        });

        it('should set filter to return false for an issue that is done and has a comment', () => {
            dummyIssue.status = STATUS.Done;
            dummyIssue.issueComment = issueComment;

            expect(issuePendingComponent.filter(dummyIssue)).toBeFalse();
        });

        it('should set filter to return false for an issue that is not done and has no comment', () => {
            // Issue with no status
            expect(issuePendingComponent.filter(dummyIssue)).toBeFalse();

            // Issue with incomplete status
            dummyIssue.status = STATUS.Incomplete;
            expect(issuePendingComponent.filter(dummyIssue)).toBeFalse();
        });

        it('should set filter to return false for an issue that is done and has no comment', () => {
            dummyIssue.status = STATUS.Done;
            expect(issuePendingComponent.filter(dummyIssue)).toBeFalse();
        });

        it('should set filter to return true for an issue that is not done and has a comment', () => {
            dummyIssue.status = STATUS.Incomplete;
            dummyIssue.issueComment = issueComment;

            expect(issuePendingComponent.filter(dummyIssue)).toBeTrue();
        });
    });
});

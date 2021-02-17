import { IssueRespondedComponent } from '../../../../src/app/phase-tester-response/issue-responded/issue-responded.component';
import { Issue, STATUS } from '../../../../src/app/core/models/issue.model';
import { ISSUE_WITH_EMPTY_DESCRIPTION } from '../../../constants/githubissue.constants';
import { IssueComment } from '../../../../src/app/core/models/comment.model';
import { USER_JUNWEI } from '../../../constants/data.constants';

describe('IssuesPendingComponent', () => {
  describe('.ngOnInit()', () => {
    const issuesRespondedComponent = new IssueRespondedComponent();
    issuesRespondedComponent.ngOnInit();
    const DUMMY_TEAM = USER_JUNWEI.team;
    const DUMMY_COMMENT: IssueComment = {
      id: 1,
      description: 'This is some description of an issue comment',
    };
    let dummyIssue: Issue;

    beforeEach(() => {
      // generate a well-formed dummy-issue
      dummyIssue = Issue.createPhaseTeamResponseIssue(
        ISSUE_WITH_EMPTY_DESCRIPTION,
        DUMMY_TEAM
      );
      dummyIssue.status = STATUS.Done;
      dummyIssue.issueComment = DUMMY_COMMENT;
    });

    it('should set filter to return true for an issue with comment and is done', () => {
      expect(issuesRespondedComponent.filter(dummyIssue)).toBeTrue();
    });

    it('should set filter to return false for issues that are not done', () => {
      dummyIssue.status = STATUS.Incomplete;
      expect(issuesRespondedComponent.filter(dummyIssue)).toBeFalse();

      dummyIssue.status = undefined;
      expect(issuesRespondedComponent.filter(dummyIssue)).toBeFalse();
    });

    it('should set filter to return false for issues without comments', () => {
      dummyIssue.issueComment = undefined;
      expect(issuesRespondedComponent.filter(dummyIssue)).toBeFalse();
    });
  });
});

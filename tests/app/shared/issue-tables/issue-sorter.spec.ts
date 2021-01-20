import { getSortedData } from '../../../../src/app/shared/issue-tables/issue-sorter';
import { MatSort } from '@angular/material';
import { Issue } from '../../../../src/app/core/models/issue.model';
import { ISSUE_WITH_ASSIGNEES, ISSUE_WITH_EMPTY_DESCRIPTION, ISSUE_PENDING_MODERATION } from '../../../constants/githubissue.constants';
import { Team } from '../../../../src/app/core/models/team.model';

describe('issuer-sorter', () => {
  describe('getSortedData()', () => {
    const dummyTeam = new Team({
      id: 'F09-2',
      teamMembers: [],
    });
    const dummyIssue: Issue = Issue.createPhaseTeamResponseIssue(ISSUE_WITH_EMPTY_DESCRIPTION, dummyTeam);
    const otherDummyIssue: Issue = Issue.createPhaseTeamResponseIssue(ISSUE_WITH_ASSIGNEES, dummyTeam);
    const issuesList: Issue[] = [dummyIssue, otherDummyIssue];

    const dummyTodoIssue: Issue = Issue.createPhaseModerationIssue(ISSUE_WITH_EMPTY_DESCRIPTION, dummyTeam);
    const otherDummTodoIssue: Issue = Issue.createPhaseModerationIssue(ISSUE_PENDING_MODERATION, dummyTeam);
    const todoIssuesList: Issue[] = [dummyTodoIssue, otherDummTodoIssue];
    const matSort: MatSort = new MatSort();

    it('sorts issues based on their assignees correctly', () => {
      matSort.active = 'assignees';
      matSort.direction = 'asc';
      const sortedIssuesByTitleAsc = getSortedData(matSort, issuesList);
      expect(sortedIssuesByTitleAsc[0].id).toBe(dummyIssue.id);
      expect(sortedIssuesByTitleAsc[1].id).toBe(otherDummyIssue.id);

      matSort.direction = 'desc';
      const sortedIssuesByTitleDesc = getSortedData(matSort, issuesList);
      expect(sortedIssuesByTitleDesc[0].id).toBe(otherDummyIssue.id);
      expect(sortedIssuesByTitleDesc[1].id).toBe(dummyIssue.id);
    });

    it('sorts issues based on their string fields correctly', () => {
        matSort.active = 'title';
        matSort.direction = 'asc';
        const sortedIssuesByTitleAsc = getSortedData(matSort, issuesList);
        expect(sortedIssuesByTitleAsc[0].id).toBe(dummyIssue.id);
        expect(sortedIssuesByTitleAsc[1].id).toBe(otherDummyIssue.id);

        matSort.direction = 'desc';
        const sortedIssuesByTitleDesc = getSortedData(matSort, issuesList);
        expect(sortedIssuesByTitleDesc[0].id).toBe(otherDummyIssue.id);
        expect(sortedIssuesByTitleDesc[1].id).toBe(dummyIssue.id);
    });

    it('sorts issues based on their integer fields correctly', () => {
        matSort.active = 'id';
        matSort.direction = 'asc';
        const sortedIssuedByIdAsc = getSortedData(matSort, issuesList);
        expect(sortedIssuedByIdAsc[0].id).toBe(otherDummyIssue.id);
        expect(sortedIssuedByIdAsc[1].id).toBe(dummyIssue.id);

        matSort.direction = 'desc';
        const sortedIssuedByIdDesc = getSortedData(matSort, issuesList);
        expect(sortedIssuedByIdDesc[0].id).toBe(dummyIssue.id);
        expect(sortedIssuedByIdDesc[1].id).toBe(otherDummyIssue.id);
    });

    it('sorts issues based on their todos left correctly', () => {
      matSort.active = 'Todo Remaining';
      matSort.direction = 'asc';
      const sortedIssuesByTitleAsc = getSortedData(matSort, todoIssuesList);
      expect(sortedIssuesByTitleAsc[0].id).toBe(otherDummTodoIssue.id);
      expect(sortedIssuesByTitleAsc[1].id).toBe(dummyTodoIssue.id);

      matSort.direction = 'desc';
      const sortedIssuesByTitleDesc = getSortedData(matSort, todoIssuesList);
      expect(sortedIssuesByTitleDesc[0].id).toBe(dummyTodoIssue.id);
      expect(sortedIssuesByTitleDesc[1].id).toBe(otherDummTodoIssue.id);
    });
  });
});

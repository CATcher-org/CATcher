import { getSortedData } from '../../../../src/app/shared/issue-tables/issue-sorter';
import { MatSort } from '@angular/material';
import { Issue } from '../../../../src/app/core/models/issue.model';
import { ISSUE_WITH_ASSIGNEES, ISSUE_WITH_EMPTY_DESCRIPTION } from '../../../constants/githubissue.constants';

describe('issuer-sorter', () => {
  describe('getSortedData()', () => {
    const dummyIssue: Issue = Issue.createPhaseBugReportingIssue(ISSUE_WITH_EMPTY_DESCRIPTION);
    const otherDummyIssue: Issue = Issue.createPhaseBugReportingIssue(ISSUE_WITH_ASSIGNEES);
    const issuesList: Issue[] = [dummyIssue, otherDummyIssue];
    const matSort: MatSort = new MatSort();

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

    it('sorts issues based on their string fields correctly', () => {
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
  });
});

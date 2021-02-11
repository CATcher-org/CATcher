import { IssueService } from '../../core/services/issue.service';
import { Issue } from '../../core/models/issue.model';
import { MatPaginator } from '@angular/material';
import { TABLE_COLUMNS } from './issue-tables.component';

export function applySearchFilter(filter: string, displayedColumn: string[], issueService: IssueService, paginator: MatPaginator, data: Issue[]): Issue[] {
    const searchKey = filter.toLowerCase();
    const result = data.slice().filter((issue: Issue) => {
      for (const column of displayedColumn) {
        switch (column) {
          case TABLE_COLUMNS.ASSIGNEE:
            for (const assignee of issue.assignees) {
              const lowerCaseAssignee = assignee.toLowerCase();
              if (containsSearchKey(lowerCaseAssignee, searchKey)) {
                return true;
              }
            }
            break;
          case TABLE_COLUMNS.DUPLICATED_ISSUES:
            const duplicatedIssues = issueService.issues$.getValue().filter(el => el.duplicateOf === issue.id);
            if (duplicatedIssuesContainsSearchKey(duplicatedIssues, searchKey)) {
              return true;
            }
            break;
          default:
            const searchStr = String(issue[column]).toLowerCase();
            if (containsSearchKey(searchStr, searchKey)) {
              return true;
            }
            break;
        }
      }
      return false;
    });
    paginator.length = result.length;
    return result;
}

function containsSearchKey(item: string, searchKey: string): boolean {
  return item.indexOf(searchKey) !== -1;
}

function duplicatedIssuesContainsSearchKey(duplicatedIssues: Issue[], searchKey: string): boolean {
  return duplicatedIssues.filter(el => `#${String(el.id)}`.includes(searchKey)).length !== 0;
}
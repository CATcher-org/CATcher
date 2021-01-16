import { Issue, ISSUE_TYPE_ORDER, SEVERITY_ORDER } from '../../core/models/issue.model';
import { MatSort, SortDirection } from '@angular/material';

export function getSortedData(sort: MatSort, data: Issue[]): Issue[] {
    if (!sort.active) {
      return data;
    }
    return data.sort((a, b) => {
      switch (sort.active) {
        case 'type':
          return compareValue(sort.direction, ISSUE_TYPE_ORDER[a.type], ISSUE_TYPE_ORDER[b.type]);
        case 'severity':
          return compareValue(sort.direction, SEVERITY_ORDER[a.severity], SEVERITY_ORDER[b.severity]);
        case 'assignees':
          return compareValue(sort.direction, a.assignees.join(', '), b.assignees.join(', '));
        case 'teamAssigned':
          return compareValue(sort.direction, a.teamAssigned.id, b.teamAssigned.id);
        case 'Todo Remaining':
          return -compareValue(sort.direction, a.numOfUnresolvedDisputes(), b.numOfUnresolvedDisputes());
        default: // id, title, responseTag
          return compareValue(sort.direction, a[sort.active], b[sort.active]);
      }
    });
}


function compareValue(sortDirection: SortDirection, valueA: string | number, valueB: string | number): number {
    if (typeof valueA === 'number' && typeof valueB === 'number') {
      return compareIntegerValue(sortDirection, valueA, valueB);
    }

    const a = String(valueA || '').toUpperCase();
    const b = String(valueB || '').toUpperCase();
    return (a < b ? -1 : 1) * (sortDirection === 'asc' ? 1 : -1);
}

function compareIntegerValue(sortDirection: SortDirection, valueA: number, valueB: number): number {
    return (valueA < valueB ? -1 : 1) * (sortDirection === 'asc' ? 1 : -1);
}

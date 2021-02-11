import { MatPaginator } from '@angular/material';
import { Issue } from '../../core/models/issue.model';

export function getPaginatedData(paginator: MatPaginator, data: Issue[]): Issue[] {
    let startIndex = paginator.pageIndex * paginator.pageSize;
    const result = data.splice(startIndex, paginator.pageSize);
    if (result.length === 0) {
        paginator.pageIndex -= 1;
        startIndex = paginator.pageIndex * paginator.pageSize;
        return data.splice(startIndex, paginator.pageSize);
    }
    return result;
}

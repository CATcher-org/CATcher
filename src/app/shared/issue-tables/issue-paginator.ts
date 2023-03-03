import { MatPaginator } from '@angular/material/paginator';
import { Issue } from '../../core/models/issue.model';

export function paginateData(paginator: MatPaginator, data: Issue[]): Issue[] {
  paginator.length = data.length;
  let result = getDataForPage(paginator.pageIndex, paginator.pageSize, data);
  if (result.length === 0) {
    paginator.pageIndex -= 1;
    result = getDataForPage(paginator.pageIndex, paginator.pageSize, data);
  }
  return result;
}

function getDataForPage(pageIndex: number, pageSize: number, data: Issue[]): Issue[] {
  const startIndex = pageIndex * pageSize;
  return data.splice(startIndex, pageSize);
}

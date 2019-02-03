import {BehaviorSubject, merge, Observable} from 'rxjs';
import {DataSource} from '@angular/cdk/table';
import {IssueService} from '../../core/services/issue.service';
import {Issue, ISSUE_TYPE_ORDER, SEVERITY_ORDER} from '../../core/models/issue.model';
import {MatPaginator, MatSort} from '@angular/material';
import {map} from 'rxjs/operators';

export class IssuesDataTable extends DataSource<Issue> {
  private filterChange = new BehaviorSubject('');

  constructor(private issueService: IssueService, private sort: MatSort,
              private paginator: MatPaginator, private displayedColumn: string[]) {
    super();
  }

  connect(): Observable<Issue[]> {
    const displayDataChanges = [
      this.issueService.getAllIssues(),
      this.paginator.page,
      this.sort.sortChange,
      this.filterChange
    ];

    return merge(...displayDataChanges).pipe(map(() => {
      let data = <Issue[]>Object.values(this.issueService.issues$.getValue());

      data = this.getSortedData(data);
      data = this.getFilteredData(data);
      data = this.getPaginatedData(data);

      return data;
    }));
  }

  disconnect() {}

  get filter(): string {
    return this.filterChange.value;
  }

  set filter(filter: string) {
    this.filterChange.next(filter);
  }

  private getSortedData(data: Issue[]): Issue[] {
    return data.sort((a, b) => {
      let valueA: number | string = '';
      let valueB: number | string = '';

      switch (this.sort.active) {
        case 'id':
          [valueA, valueB] = [a.id, b.id];
          return this.compareValue(valueA, valueB);
        case 'title':
          [valueA, valueB] = [a.title, b.title];
          return this.compareValue(valueA, valueB);
        case 'type':
          [valueA, valueB] = [a.type, b.type];
          return this.compareValue(ISSUE_TYPE_ORDER[a.type], ISSUE_TYPE_ORDER[b.type]);
        case 'severity':
          [valueA, valueB] = [a.severity, b.severity];
          return this.compareValue(SEVERITY_ORDER[a.severity], SEVERITY_ORDER[b.severity]);
        default:
          break;
      }
    });
  }

  private getPaginatedData(data: Issue[]): Issue[] {
    let startIndex = this.paginator.pageIndex * this.paginator.pageSize;
    const result = data.splice(startIndex, this.paginator.pageSize);
    if (result.length === 0) {
      this.paginator.pageIndex -= 1;
      startIndex = this.paginator.pageIndex * this.paginator.pageSize;
      return data.splice(startIndex, this.paginator.pageSize);
    }
    return result;
  }

  private getFilteredData(data: Issue[]): Issue[] {
    const result = data.slice().filter((issue: Issue) => {
      for (const column of this.displayedColumn) {
        const searchStr = String(issue[column]).toLowerCase();
        if (searchStr.indexOf(this.filter.toLowerCase()) !== -1) {
          return true;
        }
      }
      return false;
    });
    this.paginator.length = result.length;
    return result;
  }

  private compareValue(valueA, valueB): number {
    return (valueA < valueB ? -1 : 1) * (this.sort.direction === 'asc' ? 1 : -1);
  }
}

import {BehaviorSubject, merge, Observable, Subscription} from 'rxjs';
import {DataSource} from '@angular/cdk/table';
import {IssueService} from '../../core/services/issue.service';
import {Issue, ISSUE_TYPE_ORDER, SEVERITY_ORDER} from '../../core/models/issue.model';
import {MatPaginator, MatSort} from '@angular/material';
import {delay, flatMap, map, tap} from 'rxjs/operators';
import {ErrorHandlingService} from '../../core/services/error-handling.service';

export class IssuesDataTable extends DataSource<Issue> {
  private filterChange = new BehaviorSubject('');
  private teamFilterChange = new BehaviorSubject('');
  private issuesSubject = new BehaviorSubject<Issue[]>([]);
  private loadingSubject = new BehaviorSubject<boolean>(false);
  private issueSubscription: Subscription;

  public isLoading$ = this.loadingSubject.asObservable();

  constructor(private issueService: IssueService, private errorHandlingService: ErrorHandlingService, private sort: MatSort,
              private paginator: MatPaginator, private displayedColumn: string[],
              private defaultFilter?: (issue: Issue) => boolean) {
    super();
  }

  connect(): Observable<Issue[]> {
    return this.issuesSubject.asObservable();
  }

  disconnect() {
    this.filterChange.complete();
    this.teamFilterChange.complete();
    this.issuesSubject.complete();
    this.loadingSubject.complete();
    this.issueSubscription.unsubscribe();
  }

  loadIssues() {
    const displayDataChanges = [
      this.issueService.issues$,
      this.paginator.page,
      this.sort.sortChange,
      this.filterChange,
      this.teamFilterChange,
    ];

    this.loadingSubject.next(true);

    this.issueSubscription = this.issueService.getAllIssues().pipe(
      delay(0),
      tap(() => {
        this.loadingSubject.next(false);
      }),
      flatMap(() => {
        return merge(...displayDataChanges).pipe(
          map(() => {
            let data = <Issue[]>Object.values(this.issueService.issues$.getValue()).reverse();
            if (this.defaultFilter) {
              data = data.filter(this.defaultFilter);
            }
            data = this.getSortedData(data);
            data = this.getFilteredTeamData(data);
            data = this.getFilteredData(data);
            data = this.getPaginatedData(data);

            return data;
          })
        );
      })
    ).subscribe((issues) => {
      this.issuesSubject.next(issues);
    },
      (error) => this.errorHandlingService.handleHttpError(error, () => this.issueService.getAllIssues())
    );
  }

  get filter(): string {
    return this.filterChange.value;
  }

  set filter(filter: string) {
    this.filterChange.next(filter);
  }

  get teamFilter(): string {
    return this.teamFilterChange.value;
  }

  set teamFilter(teamFilter: string) {
    this.teamFilterChange.next(teamFilter);
    this.issueService.setIssueTeamFilter(this.teamFilterChange.value);
  }

  private getFilteredTeamData(data: Issue[]): Issue[] {
    return data.filter((issue) => {
      if (!this.teamFilter || this.teamFilter === 'All Teams') {
        return true;
      }
      return issue.teamAssigned.id === this.teamFilter;
    });
  }

  private getSortedData(data: Issue[]): Issue[] {
    if (!this.sort.active) {
      return data;
    }
    return data.sort((a, b) => {
      switch (this.sort.active) {
        case 'type':
          return this.compareValue(ISSUE_TYPE_ORDER[a.type], ISSUE_TYPE_ORDER[b.type]);
        case 'severity':
          return this.compareValue(SEVERITY_ORDER[a.severity], SEVERITY_ORDER[b.severity]);
        case 'assignees':
          return this.compareValue(a.assignees.join(', '), b.assignees.join(', '));
        case 'teamAssigned':
          return this.compareValue(a.teamAssigned.id, b.teamAssigned.id);
        default: // id, title, responseTag
          return this.compareValue(a[this.sort.active], b[this.sort.active]);
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
    const searchKey = this.filter.toLowerCase();
    const result = data.slice().filter((issue: Issue) => {
      for (const column of this.displayedColumn) {
        switch (column) {
          case 'assignees':
            for (const assignee of issue.assignees) {
              if (assignee.toLowerCase().indexOf(searchKey) !== -1) {
                return true;
              }
            }
            break;
          case 'duplicatedIssues':
            const duplicatedIssues = this.issueService.issues$.getValue().filter(el => el.duplicateOf === issue.id);
            if (duplicatedIssues.filter(el => `#${String(el.id)}`.includes(searchKey)).length !== 0) {
              return true;
            }
            break;
          default:
            const searchStr = String(issue[column]).toLowerCase();
            if (searchStr.indexOf(searchKey) !== -1) {
              return true;
            }
            break;
        }
      }
      return false;
    });
    this.paginator.length = result.length;
    return result;
  }

  private compareValue(valueA, valueB): number {
    var a: string | number;
    var b: string | number;
    if (typeof valueA === 'string') {
      a = valueA.toUpperCase();
    } else {
      a = valueA || '';
    }
    if (typeof valueB === 'string') {
      b = valueB.toUpperCase();
    } else {
      b = valueB || '';
    }
    return (a < b ? -1 : 1) * (this.sort.direction === 'asc' ? 1 : -1);
  }
}

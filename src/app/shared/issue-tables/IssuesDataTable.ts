import { BehaviorSubject, merge, Observable, Subscription } from 'rxjs';
import { DataSource } from '@angular/cdk/table';
import { IssueService } from '../../core/services/issue.service';
import { Issue, ISSUE_TYPE_ORDER, SEVERITY_ORDER } from '../../core/models/issue.model';
import { MatPaginator, MatSort } from '@angular/material';
import { delay, flatMap, map, startWith, tap } from 'rxjs/operators';
import { ErrorHandlingService } from '../../core/services/error-handling.service';
import { getSortedData } from './issue-sorter';
import { applySearchFilter } from './search-filter';

export class IssuesDataTable extends DataSource<Issue> {
  private filterChange = new BehaviorSubject('');
  private teamFilterChange = new BehaviorSubject('');
  private issuesSubject = new BehaviorSubject<Issue[]>([]);
  private issueSubscription: Subscription;

  public isLoading$ = this.issueService.isLoading.asObservable();

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
    this.issueSubscription.unsubscribe();
    this.issueService.stopPollIssues();
  }

  loadIssues() {
    const displayDataChanges = [
      this.issueService.issues$,
      this.paginator.page,
      this.sort.sortChange,
      this.filterChange,
      this.teamFilterChange,
    ];

    this.issueService.startPollIssues();
    this.issueSubscription = this.issueService.issues$.pipe(
      flatMap(() => {
        return merge(...displayDataChanges).pipe(
          map(() => {
            let data = <Issue[]>Object.values(this.issueService.issues$.getValue()).reverse();
            if (this.defaultFilter) {
              data = data.filter(this.defaultFilter);
            }
            data = getSortedData(this.sort, data);
            data = this.getFilteredTeamData(data);
            data = applySearchFilter(this.filter, this.displayedColumn, this.issueService, data);
            data = this.getPaginatedData(data);

            return data;
          })
        );
      })
    ).subscribe((issues) => {
      this.issuesSubject.next(issues);
    }
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

  private getPaginatedData(data: Issue[]): Issue[] {
    this.paginator.length = data.length;
    let startIndex = this.paginator.pageIndex * this.paginator.pageSize;
    const result = data.splice(startIndex, this.paginator.pageSize);
    if (result.length === 0) {
      this.paginator.pageIndex -= 1;
      startIndex = this.paginator.pageIndex * this.paginator.pageSize;
      return data.splice(startIndex, this.paginator.pageSize);
    }
    return result;
  }
}

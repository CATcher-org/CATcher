import {Component, Input, OnChanges, OnInit, SimpleChanges, ViewChild} from '@angular/core';
import {IssueService} from '../../core/services/issue.service';
import {MatPaginator, MatSort} from '@angular/material';
import {ErrorHandlingService} from '../../core/services/error-handling.service';
import {IssuesDataTable} from '../../shared/data-tables/IssuesDataTable';
import {Issue, STATUS} from '../../core/models/issue.model';
import {RespondType} from '../../core/models/comment.model';
import {PermissionService} from '../../core/services/permission.service';

@Component({
  selector: 'app-issues-pending',
  templateUrl: './issues-pending.component.html',
  styleUrls: ['./issues-pending.component.css']
})
export class IssuesPendingComponent implements OnInit, OnChanges {
  issuesDataSource: IssuesDataTable;

  displayedColumns;

  @Input() teamFilter: string;

  @ViewChild(MatSort) sort: MatSort;
  @ViewChild(MatPaginator) paginator: MatPaginator;

  constructor(private issueService: IssueService, private errorHandlingService: ErrorHandlingService,
              public permissions: PermissionService) {
    if (permissions.canCRUDTeamResponse()) {
      this.displayedColumns = ['id', 'title', 'type', 'severity', 'duplicatedIssues', 'actions'];
    } else {
      this.displayedColumns = ['id', 'title', 'type', 'severity', 'duplicatedIssues'];
    }
  }

  ngOnChanges(changes: SimpleChanges) {
    if (!changes.teamFilter.isFirstChange()) {
      this.issuesDataSource.teamFilter = changes.teamFilter.currentValue;
    }
  }

  ngOnInit() {
    const filter = (issue: Issue) => {
      return !this.issueService.hasResponse(issue.id, RespondType.teamResponse) || (!issue.status || issue.status === 'Incomplete');
    };
    this.issuesDataSource = new IssuesDataTable(this.issueService, this.errorHandlingService, this.sort,
      this.paginator, this.displayedColumns, filter);
    this.issuesDataSource.loadIssues();
  }

  applyFilter(filterValue: string) {
    this.issuesDataSource.filter = filterValue;
  }

  getDuplicateIssuesFor(issueId: number) {
    return this.issueService.issues$.getValue().filter(issue => {
      return issue.duplicateOf === issueId;
    });
  }

  markAsResponded(issue: Issue) {
    this.issueService.updateIssue({
      ...issue,
      status: STATUS.Done
    }).subscribe((updatedIssue) => {
      this.issueService.updateLocalStore(updatedIssue);
    }, error => {
      this.errorHandlingService.handleHttpError(error);
    });
  }
}

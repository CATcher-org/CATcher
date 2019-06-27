import { Component, Input, OnChanges, OnInit, SimpleChanges, ViewChild } from '@angular/core';
import { IssueService } from '../../core/services/issue.service';
import { MatPaginator, MatSort } from '@angular/material';
import { ErrorHandlingService } from '../../core/services/error-handling.service';
import { IssuesDataTable } from '../../shared/issue-tables/IssuesDataTable';
import { Issue, STATUS } from '../../core/models/issue.model';
import { PermissionService } from '../../core/services/permission.service';
import { UserService } from '../../core/services/user.service';
import { UserRole } from '../../core/models/user.model';
import { LabelService } from '../../core/services/label.service';
import { GithubService } from '../../core/services/github.service';

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

  constructor(public issueService: IssueService, private errorHandlingService: ErrorHandlingService,
              public permissions: PermissionService, public userService: UserService, private labelService: LabelService,
              private githubService: GithubService) {
    if (userService.currentUser.role !== UserRole.Student) {
      this.displayedColumns = ['id', 'title', 'teamAssigned', 'type', 'severity', 'duplicatedIssues', 'actions'];
    } else {
      this.displayedColumns = ['id', 'title', 'type', 'severity', 'duplicatedIssues', 'actions'];
    }
  }

  ngOnChanges(changes: SimpleChanges) {
    if (!changes.teamFilter.isFirstChange()) {
      this.issuesDataSource.teamFilter = changes.teamFilter.currentValue;
    }
  }

  ngOnInit() {
    const filter = (issue: Issue) => {
      return (!this.issueService.hasResponse(issue.id) || (!issue.status || issue.status === 'Incomplete')) &&
        !issue.duplicateOf;
    };
    this.issuesDataSource = new IssuesDataTable(this.issueService, this.errorHandlingService, this.sort,
      this.paginator, this.displayedColumns, filter);
    this.issuesDataSource.loadIssues();
  }

  applyFilter(filterValue: string) {
    this.issuesDataSource.filter = filterValue;
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

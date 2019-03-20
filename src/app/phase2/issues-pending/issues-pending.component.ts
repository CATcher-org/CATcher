import {Component, OnInit, ViewChild} from '@angular/core';
import {IssueService} from '../../core/services/issue.service';
import {MatPaginator, MatSort} from '@angular/material';
import {ErrorHandlingService} from '../../core/services/error-handling.service';
import {IssuesDataTable} from '../../shared/data-tables/IssuesDataTable';
import {Issue} from '../../core/models/issue.model';
import {RespondType} from '../../core/models/comment.model';
import {PermissionService} from '../../core/services/permission.service';

@Component({
  selector: 'app-issues-pending',
  templateUrl: './issues-pending.component.html',
  styleUrls: ['./issues-pending.component.css']
})
export class IssuesPendingComponent implements OnInit {
  issuesDataSource: IssuesDataTable;

  displayedColumns = ['id', 'title', 'type', 'severity', 'actions'];

  @ViewChild(MatSort) sort: MatSort;
  @ViewChild(MatPaginator) paginator: MatPaginator;

  constructor(private issueService: IssueService, private errorHandlingService: ErrorHandlingService,
              public permissions: PermissionService) {
  }

  ngOnInit() {
    const filter = (issue: Issue) => {
      return !this.issueService.hasResponse(issue.id, RespondType.teamResponse);
    };
    this.issuesDataSource = new IssuesDataTable(this.issueService, this.errorHandlingService, this.sort,
      this.paginator, this.displayedColumns, filter);
    this.issuesDataSource.loadIssues();
  }

  applyFilter(filterValue: string) {
    this.issuesDataSource.filter = filterValue;
  }
}

import {Component, OnInit, ViewChild} from '@angular/core';
import {IssueService} from '../../core/services/issue.service';
import {MatPaginator, MatSort} from '@angular/material';
import {ErrorHandlingService} from '../../core/services/error-handling.service';
import {IssuesDataTable} from '../../shared/data-tables/IssuesDataTable';
import {Issue} from '../../core/models/issue.model';
import {RespondType} from '../../core/models/comment.model';

@Component({
  selector: 'app-issues-responded',
  templateUrl: './issues-responded.component.html',
  styleUrls: ['./issues-responded.component.css']
})
export class IssuesRespondedComponent implements OnInit {
  issuesDataSource: IssuesDataTable;

  displayedColumns = ['id', 'title', 'type', 'severity', 'responseTag', 'assignees', 'actions'];

  @ViewChild(MatSort) sort: MatSort;
  @ViewChild(MatPaginator) paginator: MatPaginator;

  constructor(private issueService: IssueService, private errorHandlingService: ErrorHandlingService) {
  }

  ngOnInit() {
    const filter = (issue: Issue): boolean => {
      return this.issueService.hasResponse(issue.id, RespondType.teamResponse);
    };
    this.issuesDataSource = new IssuesDataTable(this.issueService, this.errorHandlingService, this.sort,
      this.paginator, this.displayedColumns, filter);
    this.issuesDataSource.loadIssues();
  }

  applyFilter(filterValue: string) {
    this.issuesDataSource.filter = filterValue;
  }
}

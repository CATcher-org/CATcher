import { Component, OnInit, ViewChild } from '@angular/core';
import { MatPaginator, MatSort } from '@angular/material';
import { IssueService } from '../core/services/issue.service';
import { IssuesDataTable } from '../shared/data-tables/IssuesDataTable';
import { ErrorHandlingService } from '../core/services/error-handling.service';
import { finalize } from 'rxjs/operators';
import { BehaviorSubject } from 'rxjs';
import { Issue } from '../core/models/issue.model';
import { PermissionService } from '../core/services/permission.service';
import { UserService } from '../core/services/user.service';
import { LabelService } from '../core/services/label.service';

@Component({
  selector: 'app-phase1',
  templateUrl: './phase1.component.html',
  styleUrls: ['./phase1.component.css']
})
export class Phase1Component implements OnInit {
  issues: BehaviorSubject<Issue[]>;
  issuesDataSource: IssuesDataTable;
  displayedColumns = ['id', 'title', 'type', 'severity', 'actions'];
  issuesPendingDeletion: {[id: number]: boolean};

  @ViewChild(MatSort) sort: MatSort;
  @ViewChild(MatPaginator) paginator: MatPaginator;

  constructor(private issueService: IssueService, private errorHandlingService: ErrorHandlingService,
              public permissions: PermissionService, private labelService: LabelService,
              public userService: UserService) {
  }

  ngOnInit() {
    this.issuesDataSource = new IssuesDataTable(this.issueService, this.errorHandlingService, this.sort,
      this.paginator, this.displayedColumns);
    this.issuesDataSource.loadIssues();
    this.issuesPendingDeletion = {};
  }

  applyFilter(filterValue: string) {
    this.issuesDataSource.filter = filterValue;
  }

  deleteIssue(id: number) {
    this.issuesPendingDeletion = {
      ...this.issuesPendingDeletion,
      [id]: true,
    };
    this.issueService.deleteIssue(id).pipe(finalize(() => {
      const { [id]: issueRemoved, ...theRest } = this.issuesPendingDeletion;
      this.issuesPendingDeletion = theRest;
    })).subscribe((removedIssue) => {
    }, (error) => {
      this.errorHandlingService.handleHttpError(error);
    });
  }
}

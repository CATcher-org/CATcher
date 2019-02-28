import {Component, OnInit, ViewChild} from '@angular/core';
import {BehaviorSubject} from 'rxjs';
import {Issue} from '../core/models/issue.model';
import {IssuesDataTable} from '../shared/data-tables/IssuesDataTable';
import {MatPaginator, MatSort} from '@angular/material';
import {IssueService} from '../core/services/issue.service';
import {ErrorHandlingService} from '../core/services/error-handling.service';
import {finalize} from 'rxjs/operators';

@Component({
  selector: 'app-phase2',
  templateUrl: './phase2.component.html',
  styleUrls: ['./phase2.component.css']
})
export class Phase2Component implements OnInit {
  issues: BehaviorSubject<Issue[]>;
  issuesDataSource: IssuesDataTable;
  displayedColumns = ['id', 'title', 'type', 'severity', 'actions'];
  issuesPendingDeletion = {};

  @ViewChild(MatSort) sort: MatSort;
  @ViewChild(MatPaginator) paginator: MatPaginator;

  constructor(private issueService: IssueService, private errorHandlingService: ErrorHandlingService) {
  }

  ngOnInit() {
    this.issuesDataSource = new IssuesDataTable(this.issueService, this.errorHandlingService, this.sort,
      this.paginator, this.displayedColumns);
    this.issuesDataSource.loadIssues();
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
      this.issueService.deleteFromLocalStore(removedIssue);
    }, (error) => {
      this.errorHandlingService.handleHttpError(error);
    });
  }
}

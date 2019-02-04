import {Component, OnInit, ViewChild} from '@angular/core';
import {MatPaginator, MatSort} from '@angular/material';
import {Issue} from '../core/models/issue.model';
import {IssueService} from '../core/services/issue.service';
import {BehaviorSubject} from 'rxjs';
import {IssuesDataTable} from '../shared/data-tables/IssuesDataTable';
import {ErrorHandlingService} from '../core/services/error-handling.service';
import {finalize} from 'rxjs/operators';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit {
  issues: BehaviorSubject<Issue[]>;
  issuesDataSource: IssuesDataTable;
  displayedColumns = ['id', 'title', 'type', 'severity', 'actions'];
  issuesPendingDeletion = {};

  @ViewChild(MatSort) sort: MatSort;
  @ViewChild(MatPaginator) paginator: MatPaginator;

  constructor(private issueService: IssueService, private errorHandlingService: ErrorHandlingService) {
  }

  ngOnInit() {
    this.issues = this.issueService.issues$;
    this.issuesDataSource = new IssuesDataTable(this.issueService, this.sort, this.paginator, this.displayedColumns);
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

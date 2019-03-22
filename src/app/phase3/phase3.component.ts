import {Component, OnInit, ViewChild} from '@angular/core';
import {BehaviorSubject} from 'rxjs';
import {Issue} from '../core/models/issue.model';
import {IssuesDataTable} from '../shared/data-tables/IssuesDataTable';
import {MatPaginator, MatSort} from '@angular/material';
import {IssueService} from '../core/services/issue.service';
import {ErrorHandlingService} from '../core/services/error-handling.service';
import {finalize} from 'rxjs/operators';

@Component({
  selector: 'app-phase3',
  templateUrl: './phase3.component.html',
  styleUrls: ['./phase3.component.css']
})
export class Phase3Component implements OnInit {
  issues: BehaviorSubject<Issue[]>;
  issuesDataSource: IssuesDataTable;
  displayedColumns = ['id', 'title', 'type', 'severity'];

  @ViewChild(MatSort) sort: MatSort;
  @ViewChild(MatPaginator) paginator: MatPaginator;

  constructor(private issueService: IssueService, private errorHandlingService: ErrorHandlingService) { }

  ngOnInit() {
    this.issuesDataSource = new IssuesDataTable(this.issueService, this.errorHandlingService, this.sort,
      this.paginator, this.displayedColumns);
    this.issuesDataSource.loadIssues();
  }

  applyFilter(filterValue: string) {
    this.issuesDataSource.filter = filterValue;
  }

}

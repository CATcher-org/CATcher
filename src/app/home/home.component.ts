import {Component, OnInit, ViewChild} from '@angular/core';
import {MatPaginator, MatSort} from '@angular/material';
import {Issue} from '../core/models/issue.model';
import {IssueService} from '../core/services/issue.service';
import {BehaviorSubject} from 'rxjs';
import {IssuesDataTable} from '../shared/data-tables/IssuesDataTable';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit {
  issues: BehaviorSubject<Issue[]>;
  issuesDataSource;
  displayedColumns = ['id', 'title', 'type', 'severity', 'actions'];

  @ViewChild(MatSort) sort: MatSort;
  @ViewChild(MatPaginator) paginator: MatPaginator;

  constructor(private issueService: IssueService) {
  }

  ngOnInit() {
    this.issues = this.issueService.issues$;
    this.issuesDataSource = new IssuesDataTable(this.issueService, this.sort, this.paginator, this.displayedColumns);
  }

  applyFilter(filterValue: string) {
    this.issuesDataSource.filter = filterValue;
  }

  deleteIssue(id: number) {
    this.issueService.deleteIssue(id);
  }
}

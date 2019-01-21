import {Component, ElementRef, OnInit, ViewChild} from '@angular/core';
import {MatPaginator, MatSort, MatTableDataSource} from '@angular/material';
import {Issue, ISSUE_TYPE_ORDER, SEVERITY_ORDER} from '../core/models/issue.model';
import {IssueService} from '../core/services/issue.service';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit {
  isPageLoaded = false;
  issues: any;
  displayedColumns = ['id', 'title', 'type', 'severity', 'actions'];

  sort: ElementRef;
  @ViewChild(MatSort) set sortContent(content: ElementRef) {
    this.sort = content;
    if (this.sort) {
      this.issues.sort = this.sort;
    }
  }

  @ViewChild(MatPaginator) paginator: MatPaginator;

  constructor(private issueService: IssueService) { }

  ngOnInit() {
    this.issueService.getAllIssues().subscribe((issues: Issue[]) => {
      this.issues = new MatTableDataSource(issues);
      this.isPageLoaded = true;
      this.issues.sort = this.sort;
      this.issues.paginator = this.paginator;
      this.issues.sortingDataAccessor = (issue, property) => {
        switch (property) {
          case 'severity': return SEVERITY_ORDER[issue.severity];
          case 'type': return ISSUE_TYPE_ORDER[issue.type];
          default: return issue[property];
        }
      };
    });
  }

  applyFilter(filterValue: string) {
    this.issues.filter = filterValue.trim().toLowerCase();
  }

  deleteIssue(id: number) {
    this.issueService.deleteIssue(id);
  }
}

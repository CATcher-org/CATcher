import {Component, ElementRef, OnInit, ViewChild} from '@angular/core';
import {GithubService} from '../core/services/github.service';
import {MatPaginator, MatSort, MatTableDataSource, Sort} from '@angular/material';
import {first} from 'rxjs/operators';
import {Issue, ISSUE_TYPE_ORDER, SEVERITY_ORDER} from '../core/models/issue.model';

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

  constructor(private githubService: GithubService) { }

  ngOnInit() {
    this.githubService.getIssues().pipe(first()).subscribe((issues: Issue[]) => {
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
}

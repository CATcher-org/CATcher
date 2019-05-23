import {Component, OnInit, ViewChild} from '@angular/core';
import {MatPaginator, MatSort, MatTable} from '@angular/material';
import {IssueService} from '../core/services/issue.service';
import {IssuesDataTable} from '../shared/data-tables/IssuesDataTable';
import {ErrorHandlingService} from '../core/services/error-handling.service';
import {finalize, delay} from 'rxjs/operators';
import {BehaviorSubject} from 'rxjs';
import {Issue} from '../core/models/issue.model';
import {PermissionService} from '../core/services/permission.service';
import {UserService} from '../core/services/user.service';
import { Router, NavigationEnd, ActivationEnd } from '@angular/router';

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
  private navigationSubscription;
  private runOnce = false;

  @ViewChild(MatSort) sort: MatSort;
  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild(MatTable) table: MatTable<any>;

  constructor(private issueService: IssueService, private errorHandlingService: ErrorHandlingService,
              public permissions: PermissionService, private router: Router,
              public userService: UserService) {
              this.navigationSubscription = this.router.events.subscribe((e: any) => {
                // If it is a NavigationEnd event re-initalise the data
                if (e instanceof NavigationEnd) {
                  if (this.runOnce) {
                    this.issueService.reset();
                    this.initialiseData();
                    this.table.renderRows();
                  }
                }
              });
    }

  ngOnInit() {
    this.initialiseData();
    this.runOnce = true;
  }

  initialiseData() {
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

  ngOnDestroy() {
    if (this.navigationSubscription) {
       this.navigationSubscription.unsubscribe();
    }
  }
}

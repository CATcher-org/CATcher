import {Component, Input, OnChanges, OnInit, SimpleChanges, ViewChild, OnDestroy} from '@angular/core';
import {IssueService} from '../../core/services/issue.service';
import {MatPaginator, MatSort, MatTable} from '@angular/material';
import {ErrorHandlingService} from '../../core/services/error-handling.service';
import {IssuesDataTable} from '../../shared/data-tables/IssuesDataTable';
import {Issue, STATUS} from '../../core/models/issue.model';
import {PermissionService} from '../../core/services/permission.service';
import {UserService} from '../../core/services/user.service';
import {UserRole} from '../../core/models/user.model';
import { NavigationEnd, Router } from '@angular/router';

@Component({
  selector: 'app-issues-pending',
  templateUrl: './issues-pending.component.html',
  styleUrls: ['./issues-pending.component.css']
})
export class IssuesPendingComponent implements OnInit, OnChanges, OnDestroy {
  issuesDataSource: IssuesDataTable;

  displayedColumns;
  private navigationSubscription;
  private runOnce = false;

  @Input() teamFilter: string;

  @ViewChild(MatSort) sort: MatSort;
  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild(MatTable) table: MatTable<any>;

  constructor(public issueService: IssueService, private errorHandlingService: ErrorHandlingService,
              public permissions: PermissionService, public userService: UserService, private router: Router) {
    if (permissions.canCRUDTeamResponse()) {
      if (userService.currentUser.role !== UserRole.Student) {
        this.displayedColumns = ['id', 'title', 'teamAssigned', 'type', 'severity', 'duplicatedIssues', 'actions'];
      } else {
        this.displayedColumns = ['id', 'title', 'type', 'severity', 'duplicatedIssues', 'actions'];
      }
    } else {
      this.displayedColumns = ['id', 'title', 'type', 'severity', 'duplicatedIssues'];
    }

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

  ngOnChanges(changes: SimpleChanges) {
    if (!changes.teamFilter.isFirstChange()) {
      this.issuesDataSource.teamFilter = changes.teamFilter.currentValue;
    }
  }

  ngOnInit() {
    this.initialiseData();
    this.runOnce = true;
  }

  initialiseData() {
    const filter = (issue: Issue) => {
      return (!this.issueService.hasResponse(issue.id) || (!issue.status || issue.status === 'Incomplete')) &&
        !issue.duplicateOf;
    };
    this.issuesDataSource = new IssuesDataTable(this.issueService, this.errorHandlingService, this.sort,
      this.paginator, this.displayedColumns, filter);
    this.issuesDataSource.loadIssues();
  }

  applyFilter(filterValue: string) {
    this.issuesDataSource.filter = filterValue;
  }

  markAsResponded(issue: Issue) {
    this.issueService.updateIssue({
      ...issue,
      status: STATUS.Done
    }).subscribe((updatedIssue) => {
      this.issueService.updateLocalStore(updatedIssue);
    }, error => {
      this.errorHandlingService.handleHttpError(error);
    });
  }

  ngOnDestroy() {
    if (this.navigationSubscription) {
       this.navigationSubscription.unsubscribe();
    }
  }
}

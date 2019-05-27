import {Component, OnChanges, OnInit, SimpleChanges, ViewChild, OnDestroy} from '@angular/core';
import {BehaviorSubject} from 'rxjs';
import {Issue, IssuesFilter} from '../core/models/issue.model';
import {IssuesDataTable} from '../shared/data-tables/IssuesDataTable';
import {MatPaginator, MatSort, MatTable} from '@angular/material';
import {IssueService} from '../core/services/issue.service';
import {ErrorHandlingService} from '../core/services/error-handling.service';
import {finalize} from 'rxjs/operators';
import {UserService} from '../core/services/user.service';
import {Phase} from '../core/services/phase.service';
import {DataService} from '../core/services/data.service';
import { Router, NavigationEnd } from '@angular/router';

@Component({
  selector: 'app-phase3',
  templateUrl: './phase3.component.html',
  styleUrls: ['./phase3.component.css']
})
export class Phase3Component implements OnInit, OnDestroy {
  issues: BehaviorSubject<Issue[]>;
  issuesDataSource: IssuesDataTable;
  displayedColumns = ['id', 'title', 'type', 'severity', 'Todo Remaining'];
  public teamFilter = 'All Teams';
  private navigationSubscription;
  private runOnce = false;

  @ViewChild(MatSort) sort: MatSort;
  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild(MatTable) table: MatTable<any>;

  constructor(private issueService: IssueService,
              private errorHandlingService: ErrorHandlingService,
              public userService: UserService,
              private router: Router,
              private dataService: DataService) {
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
  }

  applyFilter(filterValue: string) {
    this.issuesDataSource.filter = filterValue;
  }

  get teamList(): string[] {
    const teams = this.dataService.getTeams();
    switch (IssuesFilter[Phase.phase3][this.userService.currentUser.role]) {
      case 'FILTER_BY_TEAM_ASSIGNED':
        return ['All Teams', ...this.userService.currentUser.allocatedTeams.map(team => team.id)];
      case 'NO_FILTER':
        return ['All Teams', ...teams];
      default:
        break;
    }
  }

  updateDisplayedTeam(newTeam: string) {
    this.teamFilter = newTeam;
    this.issuesDataSource.teamFilter = this.teamFilter;
  }

  isTodoListExists(issue): boolean {
    return issue.todoList.length !== 0;
  }

  todoFinished(issue): number {
    let count = 0;
    if (!this.isTodoListExists(issue)) {
      return count;
    }

    for (const todo of issue.todoList) {
      if (todo.charAt(3) === 'x') {
        count += 1;
      }
    }
    return count;
  }

  isTodoListChecked(issue): boolean {
    if (!this.isTodoListExists(issue)) {
      return true;
    }

    if (this.todoFinished(issue) === issue.todoList.length) {
      return true;
    }
    return false;
  }

  ngOnDestroy() {
    if (this.navigationSubscription) {
       this.navigationSubscription.unsubscribe();
    }
  }
}

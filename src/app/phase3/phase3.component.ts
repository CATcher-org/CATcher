import {Component, OnChanges, OnInit, SimpleChanges, ViewChild} from '@angular/core';
import {BehaviorSubject} from 'rxjs';
import {Issue, IssuesFilter} from '../core/models/issue.model';
import {IssuesDataTable} from '../shared/data-tables/IssuesDataTable';
import {MatPaginator, MatSort} from '@angular/material';
import {IssueService} from '../core/services/issue.service';
import {ErrorHandlingService} from '../core/services/error-handling.service';
import {finalize} from 'rxjs/operators';
import {UserService} from '../core/services/user.service';
import {Phase} from '../core/services/phase.service';
import {DataService} from '../core/services/data.service';

@Component({
  selector: 'app-phase3',
  templateUrl: './phase3.component.html',
  styleUrls: ['./phase3.component.css']
})
export class Phase3Component implements OnInit {
  issues: BehaviorSubject<Issue[]>;
  issuesDataSource: IssuesDataTable;
  displayedColumns = ['id', 'title', 'type', 'severity', 'Todo Remaining'];
  public teamFilter = 'All Teams';

  @ViewChild(MatSort) sort: MatSort;
  @ViewChild(MatPaginator) paginator: MatPaginator;

  constructor(private issueService: IssueService,
              private errorHandlingService: ErrorHandlingService,
              public userService: UserService,
              private dataService: DataService) {}

  ngOnInit() {
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

}

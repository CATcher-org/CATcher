import { Component, OnInit, ViewChild } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { Issue, IssuesFilter } from '../core/models/issue.model';
import { IssuesDataTable } from '../shared/issue-tables/IssuesDataTable';
import { IssueService } from '../core/services/issue.service';
import { ErrorHandlingService } from '../core/services/error-handling.service';
import { UserService } from '../core/services/user.service';
import { Phase } from '../core/services/phase.service';
import { DataService } from '../core/services/data.service';
import { LabelService } from '../core/services/label.service';
import { GithubService } from '../core/services/github.service';
import { ACTION_BUTTONS, IssueTablesComponent, TABLE_COLUMNS } from '../shared/issue-tables/issue-tables.component';

@Component({
  selector: 'app-phase3',
  templateUrl: './phase3.component.html',
  styleUrls: ['./phase3.component.css']
})
export class Phase3Component implements OnInit {
  displayedColumns = [
    TABLE_COLUMNS.ID,
    TABLE_COLUMNS.TITLE,
    TABLE_COLUMNS.TYPE,
    TABLE_COLUMNS.SEVERITY,
    TABLE_COLUMNS.TODO,
    TABLE_COLUMNS.ACTIONS
  ];
  public teamFilter = 'All Teams';

  readonly actionButtons: ACTION_BUTTONS[] = [ACTION_BUTTONS.VIEW_IN_WEB];

  @ViewChild(IssueTablesComponent) table: IssueTablesComponent;

  constructor(private issueService: IssueService,
              private errorHandlingService: ErrorHandlingService,
              public userService: UserService, private labelService: LabelService, private githubService: GithubService,
              private dataService: DataService) { }

  ngOnInit() {
    this.issueService.setIssueTeamFilter(this.teamFilter);
  }

  applyFilter(filterValue: string) {
    this.table.issues.filter = filterValue;
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
    this.table.issues.teamFilter = this.teamFilter;
  }

}

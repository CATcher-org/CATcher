import { Component, OnInit } from '@angular/core';
import { FILTER, IssuesFilter } from '../core/models/issue.model';
import { Phase } from '../core/models/phase.model';
import { DataService } from '../core/services/data.service';
import { IssueService } from '../core/services/issue.service';
import { UserService } from '../core/services/user.service';

@Component({
  selector: 'app-phase-team-response',
  templateUrl: './phase-team-response.component.html',
  styleUrls: ['./phase-team-response.component.css']
})
export class PhaseTeamResponseComponent implements OnInit {
  public teamFilter = 'All Teams';

  constructor(public userService: UserService, private dataService: DataService, private issueService: IssueService) {}

  ngOnInit() {
    this.issueService.setIssueTeamFilter(this.teamFilter);
  }

  get teamList(): string[] {
    const teams = this.dataService.getTeams();
    switch (IssuesFilter[Phase.phaseTeamResponse][this.userService.currentUser.role]) {
      case FILTER.FilterByTeamAssigned:
        return ['All Teams', ...this.userService.currentUser.allocatedTeams.map((team) => team.id)];
      case FILTER.NoFilter:
        return ['All Teams', ...teams];
      default:
        break;
    }
  }

  updateDisplayedTeam(newTeam: string) {
    this.teamFilter = newTeam;
  }
}

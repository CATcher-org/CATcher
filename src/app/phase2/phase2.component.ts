import {Component, OnInit} from '@angular/core';
import {UserService} from '../core/services/user.service';
import { Issue, IssuesFilter } from '../core/models/issue.model';
import {Phase} from '../core/services/phase.service';
import {DataService} from '../core/services/data.service';
import { IssueService } from '../core/services/issue.service';

@Component({
  selector: 'app-phase2',
  templateUrl: './phase2.component.html',
  styleUrls: ['./phase2.component.css']
})
export class Phase2Component implements OnInit {
  public teamFilter = 'All Teams';

  private issues: Issue[];
  private headers: string[] = ['id', 'title', 'type', 'severity',];
  constructor(public userService: UserService, private dataService: DataService, private issueService: IssueService) {}

  ngOnInit() {
    this.issueService.setIssueTeamFilter(this.teamFilter);
    this.issueService.getAllIssues().subscribe(issues => {
      this.issues = issues;
    });
  }

  get teamList(): string[] {
    const teams = this.dataService.getTeams();
    switch (IssuesFilter[Phase.phase2][this.userService.currentUser.role]) {
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
  }
}

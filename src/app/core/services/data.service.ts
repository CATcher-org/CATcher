import {Injectable} from '@angular/core';
import {GithubService} from './github.service';
import {map} from 'rxjs/operators';
import {DataFile} from '../models/data-file.model';
import {Team} from '../models/team.model';
import {User, UserRole} from '../models/user.model';
import {Observable} from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class DataService {
  public dataFile: DataFile;

  constructor(private githubService: GithubService) {}

  getDataFile(): Observable<{}> {
    return this.githubService.fetchDataFile().pipe(map((jsonData: {}) => {
      this.dataFile = <DataFile>{teamStructure: this.extractTeamStructure(jsonData)};
      return jsonData;
    }));
  }

  getTeam(teamId: string): Team {
    return this.dataFile.teamStructure.get(teamId);
  }

  getTeams(): string[] {
    return Array.from(this.dataFile.teamStructure.keys());
  }

  // returns a mapping from teamId to their respective team structure.
  private extractTeamStructure(jsonData: {}): Map<string, Team> {
    const teamStructure = new Map<string, Team>();
    const jsonTeamStructure = jsonData['team-structure'];
    const teamIds = Object.keys(jsonTeamStructure);
    for (const teamId of teamIds) {
      const teamMembers = new Array<User>();
      const teamMemberIds = Object.keys(jsonTeamStructure[teamId]);
      for (const teamMemberId of teamMemberIds) {
        teamMembers.push(<User>{loginId: teamMemberId, role: UserRole.Student});
      }
      teamStructure.set(teamId, <Team>{id: teamId, teamMembers: teamMembers});
    }
    return teamStructure;
  }

  reset() {
    this.dataFile = undefined;
  }
}

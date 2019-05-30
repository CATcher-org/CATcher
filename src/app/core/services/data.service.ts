import {Injectable} from '@angular/core';
import {GithubService} from './github.service';
import {map} from 'rxjs/operators';
import {DataFile} from '../models/data-file.model';
import {Team} from '../models/team.model';
import {User, UserRole} from '../models/user.model';
import {forkJoin, Observable, Subject} from 'rxjs';
const parse = require('csv-parse/lib/sync');

@Injectable({
  providedIn: 'root',
})
export class DataService {
  public dataFile: DataFile;

  constructor(private githubService: GithubService) {}

  getDataFile(): Observable<{}> {
    return this.githubService.fetchDataFile().pipe(
      map(allCsvData => {

        let roles: {};
        let teams: {};
        let studentAllocations: {};
        let tutorsAllocations: {};
        let adminsAllocations: {};
        roles = this.parseRolesData(allCsvData['first']);
        teams = this.parseTeamStructureData(allCsvData['second']);
        studentAllocations = this.parseStudentAllocation(allCsvData['second']);
        tutorsAllocations = this.parseTutorAllocation(allCsvData['third']);
        adminsAllocations = this.parseAdminAllocation(allCsvData['fourth']);

        return [roles, teams, studentAllocations, tutorsAllocations, adminsAllocations];
      }),
      map(([first, second, third, fourth, fifth]) => {
        return {first, second, third, fourth, fifth};
      }),
      map(outputData => {
        const jsonData = {};

        jsonData['roles'] = outputData['first'];
        jsonData['team-structure'] = outputData['second'];
        jsonData['students-allocation'] = outputData['third'];
        jsonData['tutors-allocation'] = outputData['fourth'];
        jsonData['admins-allocation'] = outputData['fifth'];

        return jsonData;
      }),
      map((jsonData: {}) => {
        this.dataFile = <DataFile>{teamStructure: this.extractTeamStructure(jsonData)};
        return jsonData;
      })
    );
  }

  /**
   *
   * @param csvInput - string containing csv data.
   * @return Subject<{}> - that tracks the changes to admin data
   *                       in JSON format.
   */
  parseAdminAllocation(csvInput: string): {} {
    const NAME = 'name';
    const TEAM = 'team';

    const admins = {};
    let parsedCSV: [{}];
    parsedCSV = this.csvParser(csvInput);

    parsedCSV.forEach(entry => {
      if (entry[NAME] in admins) {
        const currAdmin = admins[entry[NAME]];
        currAdmin[entry[TEAM]] = 'true';
        admins[entry[NAME]] = currAdmin;
      } else {
        const newAdmin = {};
        newAdmin[entry[TEAM]] = 'true';
        admins[entry[NAME]] = newAdmin;
      }
    });

    return admins;
  }

  /**
   *
   * @param csvInput - string containing csv data.
   * @return Subject<{}> - that tracks the changes to student data
   *                       in JSON format.
   */
  parseTutorAllocation(csvInput: string): {} {
    const NAME = 'name';
    const TEAM = 'team';

    const tutors = {};
    let parsedCSV: [{}];
    parsedCSV = this.csvParser(csvInput);

    parsedCSV.forEach(entry => {
      if (entry[NAME] in tutors) {
        const currTutor = tutors[entry[NAME]];
        currTutor[entry[TEAM]] = 'true';
        tutors[entry[NAME]] = currTutor;
      } else {
        const newTutor = {};
        newTutor[entry[TEAM]] = 'true';
        tutors[entry[NAME]] = newTutor;
      }
    });

    return tutors;
  }

  /**
   *
   * @param csvInput - string containing csv data.
   * @return Subject<{}> - that tracks the changes to student data
   *                       in JSON format.
   */
  parseStudentAllocation(csvInput: string): {} {
    const TEAM = 'team';
    const TEAM_ID = 'teamId';
    const NAME = 'member';

    const students = {};
    let parsedCSV: [{}];
    parsedCSV = this.csvParser(csvInput);

    parsedCSV.forEach(entry => {
      const newStudent = {};
      newStudent[TEAM_ID] = entry[TEAM];
      students[entry[NAME]] = newStudent;
    });

    return students;
  }

  /**
   *
   * @param csvInput - string containing csv data.
   * @return Subject<{}> - that tracks the changes to team data
   *                       in JSON format.
   */
  parseTeamStructureData(csvInput: string): {} {
    const TEAM = 'team';
    const NAME = 'member';

    const teams = {};
    let parsedCSV: [{}];
    parsedCSV = this.csvParser(csvInput);

    parsedCSV.forEach(entry => {
      if (entry[TEAM] in teams) {
        const currTeam = teams[entry[TEAM]];
        currTeam[entry[NAME]] = 'true';
        teams[entry[TEAM]] = currTeam;
      } else {
        const newTeam = {};
        newTeam[entry[NAME]] = 'true';
        teams[entry[TEAM]] = newTeam;
      }
    });

    return teams;
  }

  /**
   * Parses the csv data containing information on
   * user roles into a readable json format.
   * @param csvInput - string containing csv data.
   * @return Subject<{}> - that tracks the changes to roles data
   *                       in JSON format.
   */
  parseRolesData(csvInput: string): {} {
    const ROLE = 'role';
    const NAME = 'member';
    const ROLE_STUDENT = 'student';
    const ROLE_TUTOR = 'tutor';
    const ROLE_ADMIN = 'admin';

    const roles = {
      'students': {},
      'tutors' : {},
      'admins' : {}
    };
    const students = {};
    const tutors = {};
    const admins = {};
    let parsedCSV: [{}];
    parsedCSV = this.csvParser(csvInput);

    parsedCSV.forEach(entry => {
      if (entry[ROLE] === ROLE_STUDENT) {
        students[entry[NAME]] = 'true';
      } else if (entry[ROLE] === ROLE_TUTOR) {
        tutors[entry[NAME]] = 'true';
      } else if (entry[ROLE] === ROLE_ADMIN) {
        admins[entry[NAME]] = 'true';
      }
    });

    roles['students'] = students;
    roles['tutors'] = tutors;
    roles['admins'] = admins;

    return roles;
  }

  /**
   * Converts the input csv information to an array of
   * objects syncrhonously. Each object's values are
   * marked by the respective csv table headers.
   * @param csvText - csv information.
   * @return - Subjects that tracks the parsed data.
   */
  csvParser(csvText: string): [{}] {
    return parse(csvText, {
      columns: true
    });
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

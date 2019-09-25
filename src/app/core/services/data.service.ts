import { Injectable } from '@angular/core';
import { GithubService } from './github.service';
import { map } from 'rxjs/operators';
import { DataFile } from '../models/data-file.model';
import { Team } from '../models/team.model';
import { User, UserRole } from '../models/user.model';
import { Observable } from 'rxjs';
const parse = require('csv-parse/lib/sync');

@Injectable({
  providedIn: 'root',
})
export class DataService {
  public dataFile: DataFile;

  constructor(private githubService: GithubService) {}

  getDataFile(): Observable<{}> {
    return this.githubService.fetchDataFile().pipe(
      map((allCsvDataWrapper: {}) => {
        return this.constructData(allCsvDataWrapper);
      }),
      map((jsonData: {}) => {
        this.dataFile = <DataFile>{
          teamStructure: this.extractTeamStructure(jsonData)
        };
        return jsonData;
      })
    );
  }

  /**
   * Merges all parsed Csv Data into a single readable JSON
   * format.
   * @param allCsvDataWrapper - Object containing strings of csv data.
   * @return jsonData - Object representing merged data file.
   */
  constructData(allCsvDataWrapper: {}): {} {
    const jsonData: {} = {};
    const allCsvData: string = allCsvDataWrapper['data'];

    jsonData['roles'] = this.parseRolesData(allCsvData);
    jsonData['team-structure'] = this.parseTeamStructureData(allCsvData);
    jsonData['students-allocation'] = this.parseStudentAllocation(allCsvData);
    jsonData['tutors-allocation'] = this.parseTutorAllocation(allCsvData);
    jsonData['admins-allocation'] = this.parseAdminAllocation(allCsvData);

    return jsonData;
  }

  /**
   * Parses the input string containing admin allocation information
   * into application readable Object.
   * @param csvInput - string containing csv data.
   * @return admins - object that represents parsed csv data.
   */
  parseAdminAllocation(csvInput: string): {} {
    // CSV Headers
    const NAME = 'name';
    const ROLE = 'role';

    const admins = {};
    let parsedCSV: [{}];
    parsedCSV = this.csvParser(csvInput);

    // Formats the parsed information for easier app reading
    parsedCSV.forEach(entry => {
      if (entry[ROLE] === UserRole.Admin.toLowerCase()) {
        admins[entry[NAME].toLowerCase()] = {};
      }
    });

    return admins;
  }

  /**
   * Parses the input string containing tutor allocation information
   * into application readable Object.
   * @param csvInput - string containing csv data.
   * @return admins - object that represents parsed csv data.
   */
  parseTutorAllocation(csvInput: string): {} {
    // CSV Headers
    const NAME = 'name';
    const TEAM = 'team';
    const ROLE = 'role';

    const tutors = {};
    let parsedCSV: [{}];
    parsedCSV = this.csvParser(csvInput);

    // Formats the parsed information for easier app reading
    parsedCSV.forEach(entry => {
      if (!(entry[ROLE] === UserRole.Tutor.toLowerCase())) {
        return;
      }
      const tutor = entry[NAME] in tutors ? tutors[entry[NAME]] : {};
      tutor[entry[TEAM]] = 'true';
      tutors[entry[NAME].toLowerCase()] = tutor;
    });

    return tutors;
  }

  /**
   * Parses the input string containing student allocation information
   * into application readable Object.
   * @param csvInput - string containing csv data.
   * @return admins - object that represents parsed csv data.
   */
  parseStudentAllocation(csvInput: string): {} {
    // CSV Headers
    const TEAM = 'team';
    const NAME = 'name';
    const ROLE = 'role';
    // Team Notation
    const TEAM_ID = 'teamId';

    const students = {};
    let parsedCSV: [{}];
    parsedCSV = this.csvParser(csvInput);

    // Formats the parsed information for easier app reading
    parsedCSV.forEach(entry => {
      if (!(entry[ROLE] === UserRole.Student.toLowerCase())) {
        return;
      }
      const newStudent = {};
      newStudent[TEAM_ID] = entry[TEAM];
      students[entry[NAME].toLowerCase()] = newStudent;
    });

    return students;
  }

  /**
   * Parses the input string containing team structure information
   * into application readable Object.
   * @param csvInput - string containing csv data.
   * @return admins - object that represents parsed csv data.
   */
  parseTeamStructureData(csvInput: string): {} {
    // CSV Headers
    const TEAM = 'team';
    const NAME = 'name';
    const ROLE = 'role';

    const teams = {};
    let parsedCSV: [{}];
    parsedCSV = this.csvParser(csvInput);

    // Formats the parsed information for easier app reading
    parsedCSV.forEach(entry => {
      if (!(entry[ROLE] === UserRole.Student.toLowerCase())) {
        return;
      }
      const team = entry[TEAM] in teams ? teams[entry[TEAM]] : {};
      team[entry[NAME].toLowerCase()] = 'true';
      teams[entry[TEAM]] = team;
    });

    return teams;
  }

  /**
   * Parses the input string containing roles information
   * into application readable Object.
   * @param csvInput - string containing csv data.
   * @return admins - object that represents parsed csv data.
   */
  parseRolesData(csvInput: string): {} {
    // CSV Headers
    const ROLE = 'role';
    const NAME = 'name';

    const roles = {};
    const students = {};
    const tutors = {};
    const admins = {};
    let parsedCSV: [{}];
    parsedCSV = this.csvParser(csvInput);

    // Formats the parsed information for easier app reading
    parsedCSV.forEach(entry => {
      if (entry[ROLE] === UserRole.Student.toLowerCase()) {
        students[entry[NAME].toLowerCase()] = 'true';
      } else if (entry[ROLE] === UserRole.Tutor.toLowerCase()) {
        tutors[entry[NAME].toLowerCase()] = 'true';
      } else if (entry[ROLE] === UserRole.Admin.toLowerCase()) {
        admins[entry[NAME].toLowerCase()] = 'true';
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

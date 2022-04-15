import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { DataFile } from '../models/data-file.model';
import { Team } from '../models/team.model';
import { User, UserRole } from '../models/user.model';
import { Admins } from '../models/users/admins.model';
import { ParsedUserData } from '../models/users/parsed-user-data.model';
import { Roles } from '../models/users/roles.model';
import { Students } from '../models/users/students.model';
import { TabulatedUserData } from '../models/users/tabulated-user-data.model';
import { Teams } from '../models/users/teams.model';
import { Tutors } from '../models/users/tutors.model';
import { GithubService } from './github.service';

@Injectable({
  providedIn: 'root'
})

/**
 * Responsible for retrieving and parsing data related to staff
 * and student information for the current session in CATcher.
 */
export class DataService {
  public static ROLES = 'roles';
  public static TEAM_STRUCTURE = 'team-structure';
  public static STUDENTS_ALLOCATION = 'students-allocation';
  public static TUTORS_ALLOCATION = 'tutors-allocation';
  public static ADMINS_ALLOCATION = 'admins-allocation';

  // CSV Headers
  public static NAME = 'name';
  public static TEAM = 'team';
  public static ROLE = 'role';

  // Team Notation
  public static TEAM_ID = 'teamId';

  public static STUDENTS = 'students';
  public static TUTORS = 'tutors';
  public static ADMINS = 'admins';

  public dataFile: DataFile;

  constructor(private githubService: GithubService) {}

  /**
   * Retrieves the csv file from the settings repo and constructs
   * the required data file for the app.
   */
  getDataFile(): Observable<{}> {
    return this.githubService.fetchDataFile().pipe(
      map((allCsvDataWrapper: {}) => {
        return this.constructData(allCsvDataWrapper);
      }),
      map((jsonData: TabulatedUserData) => {
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
   * @return jsonData - CSV Data Object the tabulated information of the different users
   */
  private constructData(allCsvDataWrapper: {}): TabulatedUserData {
    const jsonData: TabulatedUserData = {};
    const allCsvData: string = allCsvDataWrapper['data'];

    jsonData[DataService.ROLES] = this.parseRolesData(allCsvData);
    jsonData[DataService.TEAM_STRUCTURE] = this.parseTeamStructureData(allCsvData);
    jsonData[DataService.STUDENTS_ALLOCATION] = this.parseStudentAllocation(allCsvData);
    jsonData[DataService.TUTORS_ALLOCATION] = this.parseTutorAllocation(allCsvData);
    jsonData[DataService.ADMINS_ALLOCATION] = this.parseAdminAllocation(allCsvData);

    return jsonData;
  }

  /**
   * Parses the input string containing admin allocation information
   * into application readable Object.
   * @param csvInput - string containing csv data.
   * @return admins - object that represents parsed csv data.
   */
  private parseAdminAllocation(csvInput: string): Admins {
    const admins: Admins = {};
    const parsedCSV: ParsedUserData[] = this.parseUsersData(csvInput);

    // Formats the parsed information for easier app reading
    parsedCSV.forEach((entry) => {
      if (entry[DataService.ROLE] === UserRole.Admin.toLowerCase()) {
        admins[entry[DataService.NAME].toLowerCase()] = {};
      }
    });

    return admins;
  }

  /**
   * Parses the input string containing tutor allocation information
   * into application readable Object.
   * @param csvInput - string containing csv data.
   * @return tutors- object that represents parsed csv data.
   */
  private parseTutorAllocation(csvInput: string): Tutors {
    const tutors: Tutors = {};
    const parsedCSV: ParsedUserData[] = this.parseUsersData(csvInput);

    // Formats the parsed information for easier app reading
    parsedCSV.forEach((entry) => {
      if (!(entry[DataService.ROLE] === UserRole.Tutor.toLowerCase())) {
        return;
      }
      const tutor = tutors[entry[DataService.NAME].toLowerCase()] || {};

      tutor[entry[DataService.TEAM]] = 'true';
      tutors[entry[DataService.NAME].toLowerCase()] = tutor;
    });

    return tutors;
  }

  /**
   * Parses the input string containing student allocation information
   * into a Student Object
   * @param csvInput - string containing csv data.
   * @return students - object that represents parsed csv data about the students' team allocation
   */
  private parseStudentAllocation(csvInput: string): Students {
    const students: Students = {};
    const parsedCSV: ParsedUserData[] = this.parseUsersData(csvInput);

    // Formats the parsed information for easier app reading
    parsedCSV.forEach((entry) => {
      if (!(entry[DataService.ROLE] === UserRole.Student.toLowerCase())) {
        return;
      }
      const newStudent = {};
      newStudent[DataService.TEAM_ID] = entry[DataService.TEAM];
      students[entry[DataService.NAME].toLowerCase()] = newStudent;
    });

    return students;
  }

  /**
   * Parses the input string containing team structure information
   * into a Teams Object
   * @param csvInput - string containing csv data.
   * @return teams - object that represents parsed csv data containing the team structures.
   */
  private parseTeamStructureData(csvInput: string): Teams {
    const teams: Teams = {};
    const parsedCSV: ParsedUserData[] = this.parseUsersData(csvInput);

    // Formats the parsed information for easier app reading
    parsedCSV.forEach((entry) => {
      if (!(entry[DataService.ROLE] === UserRole.Student.toLowerCase())) {
        return;
      }
      const team = teams[entry[DataService.TEAM]] || {};

      team[entry[DataService.NAME].toLowerCase()] = entry[DataService.NAME];
      teams[entry[DataService.TEAM]] = team;
    });

    return teams;
  }

  /**
   * Parses the input string containing roles information
   * into a Roles object which indicates their allocated roles
   * @param csvInput - string containing csv data.
   * @return roles - object that represents parsed csv data regarding the allocated user roles.
   */
  private parseRolesData(csvInput: string): Roles {
    const roles: Roles = {};
    const students = {};
    const tutors = {};
    const admins = {};
    const parsedCSV: ParsedUserData[] = this.parseUsersData(csvInput);

    // Formats the parsed information for easier app reading
    parsedCSV.forEach((entry) => {
      if (entry[DataService.ROLE] === UserRole.Student.toLowerCase()) {
        students[entry[DataService.NAME].toLowerCase()] = 'true';
      } else if (entry[DataService.ROLE] === UserRole.Tutor.toLowerCase()) {
        tutors[entry[DataService.NAME].toLowerCase()] = 'true';
      } else if (entry[DataService.ROLE] === UserRole.Admin.toLowerCase()) {
        admins[entry[DataService.NAME].toLowerCase()] = 'true';
      }
    });

    roles[DataService.STUDENTS] = students;
    roles[DataService.TUTORS] = tutors;
    roles[DataService.ADMINS] = admins;

    return roles;
  }

  /**
   * Converts the input csv information to an array of
   * parsed user data. Each object's values are
   * marked by the respective csv table headers.
   * @param csvText - csv information.
   * @return - Subjects that tracks the parsed data.
   */
  private parseUsersData(csvText: string): ParsedUserData[] {
    const lines = csvText.split('\n').filter((v) => v.trim());
    const headers = lines[0].split(',').map((h) => h.trim());
    const result: ParsedUserData[] = [];
    for (let i = 1; i < lines.length; i++) {
      const line = lines[i].trim();
      const lineValues = line.split(',').map((v) => v.trim());
      const lineObj: ParsedUserData = {};
      for (let j = 0; j < headers.length; j++) {
        if (!lineValues[j]) {
          lineObj[headers[j]] = null;
        } else {
          lineObj[headers[j]] = lineValues[j];
        }
      }
      result.push(lineObj);
    }

    return result;
  }

  getTeam(teamId: string): Team {
    return this.dataFile.teamStructure.get(teamId);
  }

  getTeams(): string[] {
    return Array.from(this.dataFile.teamStructure.keys());
  }

  // returns a mapping from teamId to their respective team structure.
  private extractTeamStructure(jsonData: TabulatedUserData): Map<string, Team> {
    const teamStructure = new Map<string, Team>();
    const jsonTeamStructure = jsonData[DataService.TEAM_STRUCTURE];
    const teamIds = Object.keys(jsonTeamStructure);

    teamIds.forEach((teamId: string) => {
      const teamMemberIds = Object.values(jsonTeamStructure[teamId]);
      const teamMembers: Array<User> = teamMemberIds.map((teamMemberId: string) => <User>{ loginId: teamMemberId, role: UserRole.Student });

      teamStructure.set(teamId, new Team({ id: teamId, teamMembers: teamMembers }));
    });

    return teamStructure;
  }

  reset() {
    this.dataFile = undefined;
  }
}

import { Injectable } from '@angular/core';
import { forkJoin, Observable, of } from 'rxjs';
import { filter, map, switchMap, tap, throwIfEmpty } from 'rxjs/operators';
import { GithubUser } from '../models/github-user.model';
import { Team } from '../models/team.model';
import { User, UserRole } from '../models/user.model';
import { DataService } from './data.service';
import { ErrorHandlingService } from './error-handling.service';
import { GithubService } from './github.service';

@Injectable({
  providedIn: 'root'
})

/**
 * Responsible for creation of users and teams within the CATcher application.
 */
export class UserService {
  public currentUser: User;

  constructor(private githubService: GithubService, private dataService: DataService, private errorHandlingService: ErrorHandlingService) {}

  /**
   * Get the authenticated user if it exist.
   */
  getAuthenticatedUser(): Observable<GithubUser> {
    return this.githubService.fetchAuthenticatedUser().pipe(
      map((data: GithubUser) => {
        return data;
      })
    );
  }

  createUserModel(userLoginId: string, teamResponseOrg?: string, teamResponseRepo?: string): Observable<User> {
    return this.dataService.getDataFile().pipe(
      switchMap((jsonData: {}) => this.createUser(jsonData, userLoginId, teamResponseOrg, teamResponseRepo)),
      tap((user: User) => {
        this.currentUser = user;
      }),
      filter((user) => user !== null),
      throwIfEmpty(() => new Error('Unauthorized user.'))
    );
  }

  reset() {
    this.currentUser = undefined;
  }

  private createUser(data: {}, userLoginId: string, teamResponseOrg?: string, teamResponseRepo?: string): Observable<User> {
    const lowerCaseUserLoginId = userLoginId.toLowerCase();

    const userRole = this.parseUserRole(data, lowerCaseUserLoginId);
    switch (userRole) {
      case UserRole.Student:
        const teamId = data[DataService.STUDENTS_ALLOCATION][lowerCaseUserLoginId][DataService.TEAM_ID];

        return this.createTeamModel(data[DataService.TEAM_STRUCTURE], teamId, teamResponseOrg, teamResponseRepo).pipe(
          map((studentTeam: Team) => <User>{ loginId: userLoginId, role: userRole, team: studentTeam })
        );

      case UserRole.Tutor:
        const tutorTeams: Array<Observable<Team>> = Object.keys(
          data[DataService.TUTORS_ALLOCATION][lowerCaseUserLoginId]
        ).map((allocatedTeamId: string) =>
          this.createTeamModel(data[DataService.TEAM_STRUCTURE], allocatedTeamId, teamResponseOrg, teamResponseRepo)
        );

        return tutorTeams.length === 0
          ? of(<User>{ loginId: userLoginId, role: userRole, allocatedTeams: [] })
          : forkJoin(tutorTeams).pipe(map((teams: Team[]) => <User>{ loginId: userLoginId, role: userRole, allocatedTeams: teams }));

      case UserRole.Admin:
        const studentTeams: Array<Observable<Team>> = Object.keys(
          data[DataService.ADMINS_ALLOCATION][lowerCaseUserLoginId]
        ).map((allocatedTeamId: string) =>
          this.createTeamModel(data[DataService.TEAM_STRUCTURE], allocatedTeamId, teamResponseOrg, teamResponseRepo)
        );

        return studentTeams.length === 0
          ? of(<User>{ loginId: userLoginId, role: userRole, allocatedTeams: [] })
          : forkJoin(studentTeams).pipe(map((teams: Team[]) => <User>{ loginId: userLoginId, role: userRole, allocatedTeams: teams }));

      default:
        return of(null);
    }
  }

  private createTeamModel(teamData: {}, teamId: string, teamResponseOrg?: string, teamResponseRepo?: string): Observable<Team> {
    const teammatesUserIds: string[] = Object.values(teamData[teamId]);
    if (teamResponseOrg) {
      // If we need to check for assignees
      return this.githubService.areUsersAssignable(teammatesUserIds, teamResponseOrg, teamResponseRepo).pipe(
        map((unauthorized: string[]) => {
          if (unauthorized.length !== 0) {
            this.errorHandlingService.handleError(new Error(`Unauthorized teammates: ${unauthorized.join(', ')}`));
          }
          const teammates: Array<User> = Object.values(teamData[teamId]).map(
            (teammate: string) => <User>{ loginId: teammate, role: UserRole.Student }
          );

          return new Team({ id: teamId, teamMembers: teammates });
        })
      );
    } else {
      const teammates: Array<User> = Object.values(teamData[teamId]).map(
        (teammate: string) => <User>{ loginId: teammate, role: UserRole.Student }
      );

      return of(new Team({ id: teamId, teamMembers: teammates }));
    }
  }

  /**
   * To be used to parse the JSON data containing data pertaining to the user role.
   *
   * @return NULL if user is unauthorized, meaning that no role is specified for the user.
   *         else the the role with the highest access rights will be returned.
   */
  private parseUserRole(data: {}, userLoginId: string): UserRole {
    let userRole: UserRole;
    if (data[DataService.ROLES][DataService.STUDENTS] && data[DataService.ROLES][DataService.STUDENTS][[userLoginId]]) {
      userRole = UserRole.Student;
    }
    if (data[DataService.ROLES][DataService.TUTORS] && data[DataService.ROLES][DataService.TUTORS][[userLoginId]]) {
      userRole = UserRole.Tutor;
    }
    if (data[DataService.ROLES][DataService.ADMINS] && data[DataService.ROLES][DataService.ADMINS][[userLoginId]]) {
      userRole = UserRole.Admin;
    }
    return userRole;
  }
}

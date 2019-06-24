import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Router } from '@angular/router';
import { BehaviorSubject, Observable, throwError } from 'rxjs';
import { NgZone } from '@angular/core';
import { ElectronService } from './electron.service';
import { UserService } from './user.service';
import { SessionData, PhaseService } from './phase.service';
import { ErrorHandlingService } from './error-handling.service';
import { GithubService} from './github.service';
import { flatMap } from 'rxjs/operators';
import { IssueService } from './issue.service';
import { IssueCommentService } from './issue-comment.service';
import { DataService } from './data.service';
import { LabelService } from './label.service';
import { Title } from '@angular/platform-browser';
import { GithubEventService } from './githubevent.service';
import { User } from '../models/user.model';

export enum AuthState { 'NotAuthenticated', 'AwaitingAuthentication', 'Authenticated' }

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  authStateSource = new BehaviorSubject(AuthState.NotAuthenticated);
  currentAuthState = this.authStateSource.asObservable();

  constructor(private electronService: ElectronService, private router: Router, private ngZone: NgZone,
              private http: HttpClient,  private errorHandlingService: ErrorHandlingService,
              private githubService: GithubService,
              private userService: UserService,
              private issueService: IssueService,
              private phaseService: PhaseService,
              private issueCommentService: IssueCommentService,
              private labelService: LabelService,
              private dataService: DataService,
              private githubEventService: GithubEventService,
              private titleService: Title) {
  }

  private getOrgDetails(sessionsRepo: string) {
    return sessionsRepo.split('/')[0];
  }
  private getDataRepoDetails(sessionsRepo: string) {
    return sessionsRepo.split('/')[1];
  }

  startAuthentication(username: string, password: string, sessionInformation: string): Observable<any> {

    this.changeAuthState(AuthState.AwaitingAuthentication);
    const header = new HttpHeaders().set('Authorization', 'Basic ' + btoa(username + ':' + password));

    const org: string = this.getOrgDetails(sessionInformation);
    const dataRepo: string = this.getDataRepoDetails(sessionInformation);
    this.githubService.storeCredentials(username, password);
    this.githubService.storeOrganizationDetails(org, dataRepo);
    this.phaseService.setPhaseOwners(this.getOrgDetails(sessionInformation), username);

    return this.http.get('https://api.github.com/user', { headers: header }).pipe(
      flatMap(() => {
        return this.userService.createUserModel(username);
      }),
      flatMap((user: User) => {
        this.phaseService.setPhaseOwners(org, user.loginId);
        return this.phaseService.fetchSessionData();
      }),
      flatMap((sessionData: SessionData) => {
        if (sessionData === undefined) {
          return throwError('Session Data Unavailable.');
        } else if (this.phaseService.isSessionDataCorrupt(sessionData)) {
          return throwError('Session Data is Incorrectly Defined');
        } else if (sessionData.openPhases.length === 0) {
          return throwError('There are no accessible phases.');
        }

        this.phaseService.updateSessionData(sessionData);
        return this.phaseService.setupPhaseData();
      }),
      flatMap(() => {
        // Initialise last modified time for this repo
        return this.githubEventService.setLatestChangeEvent();
      })
    );
  }

  logOut(): void {
    this.userService.reset();
    this.issueService.reset();
    this.issueCommentService.reset();
    this.phaseService.reset();
    this.dataService.reset();
    this.githubEventService.reset();
    this.labelService.reset();
    this.titleService.setTitle('CATcher');
    this.issueService.setIssueTeamFilter('All Teams');

    this.changeAuthState(AuthState.NotAuthenticated);
    this.ngZone.run(() => this.router.navigate(['']));
  }

  isAuthenticated(): boolean {
    return !!(this.authStateSource.getValue() === AuthState.Authenticated);
  }

  changeAuthState(newAuthState: AuthState) {
    this.authStateSource.next(newAuthState);
  }

}

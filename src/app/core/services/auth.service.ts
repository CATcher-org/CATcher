import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Router } from '@angular/router';
import { BehaviorSubject, throwError } from 'rxjs';
import { NgZone } from '@angular/core';
import { ElectronService } from './electron.service';
import { UserService } from './user.service';
import {EncodedData, PhaseService} from './phase.service';
import { ErrorHandlingService } from './error-handling.service';
import { GithubService} from './github.service';
import { flatMap } from 'rxjs/operators';
import { IssueService } from './issue.service';
import { IssueCommentService } from './issue-comment.service';
import { DataService } from './data.service';
import { LabelService } from './label.service';
import { Title } from '@angular/platform-browser';
import { GithubEventService } from './githubevent.service';

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

  startAuthentication(username: String, password: String, encodedText: String) {
    this.changeAuthState(AuthState.AwaitingAuthentication);
    const header = new HttpHeaders().set('Authorization', 'Basic ' + btoa(username + ':' + password));
    let userLoginId;
    let encodedData: EncodedData;

    return this.http.get('https://api.github.com/user', { headers: header }).pipe(
      flatMap((githubResponse) => {
        userLoginId = githubResponse['login'];
        encodedData = this.phaseService.parseEncodedPhases(encodedText);
        this.githubService.storeCredentials(username, password);
        this.githubService.storeOrganizationDetails(encodedData.organizationName);

        const array = this.phaseService.parseEncodedPhase(encodedText);
        return (this.phaseService.checkIfReposAccessible(array));
      }),
      flatMap((phaseResponse) => {
        const phase = this.phaseService.determinePhaseNumber(phaseResponse);
        if (phase === 'not accessible') {
          return throwError('Repo is not ready.');
        } else {
          return this.userService.createUserModel(userLoginId);
        }
      }),
      flatMap((userResponse) => {
        return this.labelService.getAllLabels(userResponse);
      }),
      flatMap((labelResponse) =>  {
        // Initialise last modified time for this repo
        return this.githubEventService.setLatestChangeEvent(labelResponse);
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

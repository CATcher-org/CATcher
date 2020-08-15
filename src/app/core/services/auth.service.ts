import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Router } from '@angular/router';
import { BehaviorSubject, Observable } from 'rxjs';
import { NgZone } from '@angular/core';
import { ElectronService } from './electron.service';
import { UserService } from './user.service';
import { PhaseService } from './phase.service';
import { ErrorHandlingService } from './error-handling.service';
import { GithubService} from './github.service';
import { IssueService } from './issue.service';
import { IssueCommentService } from './issue-comment.service';
import { DataService } from './data.service';
import { LabelService } from './label.service';
import { Title } from '@angular/platform-browser';
import { GithubEventService } from './githubevent.service';
import { map } from 'rxjs/operators';

export enum AuthState { 'NotAuthenticated', 'AwaitingAuthentication', 'Authenticated', 'ConfirmOAuthUser'}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  readonly githubUrl = 'http://www.github.com';
  readonly githubDomain = 'github.com';
  readonly githubLoginCacheName = 'is_logged_in';

  authStateSource = new BehaviorSubject(AuthState.NotAuthenticated);
  currentAuthState = this.authStateSource.asObservable();
  oauthToken: String;

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
              private titleService: Title) {}

  /**
   * Authenticates the user to the github api and stores the necessary credentials in
   * all remote services.
   * @param username - User's Username
   * @param password - User's Password
   */
  authenticate(username: string, password: string): Observable<any> {
    this.changeAuthState(AuthState.AwaitingAuthentication);
    const header = new HttpHeaders().set('Authorization', 'Basic ' + btoa(username + ':' + password));
    this.githubService.storeCredentials(username, password);
    return this.http.get('https://api.github.com/user', { headers: header });
  }

  /**
   * Will store the OAuth token.
   */
  storeOAuthAccessToken(token: string) {
    this.oauthToken = token;
  }

  reset(): void {
    this.oauthToken = undefined;
    this.changeAuthState(AuthState.NotAuthenticated);
    this.ngZone.run(() => this.router.navigate(['']));
  }

  logOut(): void {
    this.githubService.reset();
    this.userService.reset();
    this.issueService.reset();
    this.issueCommentService.reset();
    this.phaseService.reset();
    this.dataService.reset();
    this.githubEventService.reset();
    this.titleService.setTitle(
      require('../../../../package.json').name
      .concat(' ')
      .concat(require('../../../../package.json').version)
    );
    this.issueService.setIssueTeamFilter('All Teams');
    this.reset();
  }

  isAuthenticated(): boolean {
    return this.authStateSource.getValue() === AuthState.Authenticated;
  }

  hasExistingAuthWithGithub(): Observable<boolean> {
    return this.electronService.cookieFor(this.githubUrl, this.githubLoginCacheName).pipe(
      map((value) => {
        return value === 'yes';
      })
    );
  }

  setLoginStatusWithGithub(isLoggedIn: boolean) {
    if (!isLoggedIn) {
      this.electronService.clearCookies();
    } else {
      this.electronService.setCookie(this.githubUrl, this.githubDomain, this.githubLoginCacheName, 'yes');
    }
  }

  changeAuthState(newAuthState: AuthState) {
    this.authStateSource.next(newAuthState);
  }

  /**
   * Will start the Github OAuth web flow process.
   * @param clearAuthState - A boolean to define whether to clear any auth cookies so prevent auto login.
   */
  startOAuthProcess(clearAuthState: boolean = false) {
    const githubRepoPermission = this.phaseService.githubRepoPermissionLevel();
    this.changeAuthState(AuthState.AwaitingAuthentication);
    this.electronService.ipcRenderer.send('github-oauth', clearAuthState, githubRepoPermission);
  }
}

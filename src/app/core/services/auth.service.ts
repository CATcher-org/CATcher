import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders} from '@angular/common/http';
import { Router } from '@angular/router';
import {BehaviorSubject, of, throwError} from 'rxjs';
import { NgZone } from '@angular/core';
import { ElectronService } from './electron.service';
import {UserService} from './user.service';
import {ErrorHandlingService} from './error-handling.service';
import {GithubService} from './github.service';
import {flatMap} from 'rxjs/operators';
import {IssueService} from './issue.service';

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
              private issueService: IssueService) {
  }

  startAuthentication(username: String, password: String) {
    this.changeAuthState(AuthState.AwaitingAuthentication);
    const header = new HttpHeaders().set('Authorization', 'Basic ' + btoa(username + ':' + password));

    return this.http.get('https://api.github.com/user', { headers: header }).pipe(
      flatMap((githubResponse) => {
        this.githubService.storeCredentials(username, password);
        return this.userService.createUserModel(githubResponse);
      }),
      flatMap((user) => {
        if (user) {
          this.changeAuthState(AuthState.Authenticated);
          return of(user);
        } else {
          return throwError('Unauthorized user.');
        }
      }));
  }

  logOut(): void {
    this.userService.reset();
    this.issueService.reset();

    this.changeAuthState(AuthState.NotAuthenticated);
    this.ngZone.run(() => this.router.navigate(['/login']));
  }

  isAuthenticated(): boolean {
    return !!(this.authStateSource.getValue() === AuthState.Authenticated);
  }

  private changeAuthState(newAuthState: AuthState) {
    this.authStateSource.next(newAuthState);
  }
}

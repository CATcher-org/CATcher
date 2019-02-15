import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders} from '@angular/common/http';
import { Router } from '@angular/router';
import {BehaviorSubject, Observable, of, throwError, from, forkJoin} from 'rxjs';
import { NgZone } from '@angular/core';
import { ElectronService } from './electron.service';
import {UserService} from './user.service';
import {ErrorHandlingService} from './error-handling.service';
import {GithubService} from './github.service';
import {catchError, flatMap, map} from 'rxjs/operators';
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

  parseEncodedPhase(encodedText: String): string[] {
      const phase = encodedText.split('@', 2);
      const phaseOneUrl = phase[0].split('=', 2)[1];
      const phaseTwoUrl = phase[1].split('=', 2)[1];

      let separator = phaseOneUrl.lastIndexOf('/');
      const repoName = phaseOneUrl.substring(separator + 1);

      let separatorOrg = phaseOneUrl.indexOf('.com');
      const orgName = phaseOneUrl.substring(separatorOrg + 5, separator);

      separator = phaseTwoUrl.lastIndexOf('/');
      const repoNameSecond = phaseTwoUrl.substring(separator + 1);
      separatorOrg = phaseTwoUrl.indexOf('.com');
      const orgNameSecond = phaseTwoUrl.substring(separatorOrg + 5, separator);

      return new Array(repoName, orgName, repoNameSecond, orgNameSecond);
  }

  checkIfReposAccessible(array: any): any {

    const url1 = 'https://api.github.com/repos/' + array[1] + '/' + array[0];
    const url2 = 'https://api.github.com/repos/' + array[3] + '/' + array[2];

    const value = forkJoin(
      this.http.get(url1).pipe(map((res) => res), catchError(e => of('Oops!'))),
      this.http.get(url2).pipe(map((res) => res), catchError(e => of('Oops!')))
    ).pipe(
      map(([first, second]) => {
        return {first, second};
      })
    );
    return value;
  }

  startAuthentication(username: String, password: String, encodedText: String) {
    this.changeAuthState(AuthState.AwaitingAuthentication);
    const header = new HttpHeaders().set('Authorization', 'Basic ' + btoa(username + ':' + password));

    return this.http.get('https://api.github.com/user', { headers: header }).pipe(
      flatMap((githubResponse) => {
        this.githubService.storeCredentials(username, password);
        return this.userService.createUserModel(githubResponse);
      }),
      flatMap((user) => {
        if (user) {
          const array = this.parseEncodedPhase(encodedText);
          this.changeAuthState(AuthState.Authenticated);
          return (this.checkIfReposAccessible(array));
        } else {
          return throwError('Unauthorized user.');
        }
      }),
    );
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

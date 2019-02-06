import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders} from '@angular/common/http';
import { Router } from '@angular/router';
import { BehaviorSubject } from 'rxjs';
import { NgZone } from '@angular/core';
import { ElectronService } from './electron.service';
import {ErrorHandlingService} from './error-handling.service';
import {GithubService} from './github.service';

export enum AuthState { 'NotAuthenticated', 'AwaitingAuthentication', 'Authenticated' }

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private accessToken: string;
  authStateSource = new BehaviorSubject(AuthState.NotAuthenticated);
  currentAuthState = this.authStateSource.asObservable();

  constructor(private electronService: ElectronService, private router: Router, private ngZone: NgZone,
              private http: HttpClient,  private errorHandlingService: ErrorHandlingService,
              private githubService: GithubService) {
  }

  startAuthentication(username: String, password: String, encodedText: String) {
    this.changeAuthState(AuthState.AwaitingAuthentication);
    const header = new HttpHeaders().set('Authorization', 'Basic ' + btoa(username + ':' + password));
    this.http.get('https://api.github.com/user', { headers: header })
      .subscribe(
        response => {
          this.changeAuthState(AuthState.Authenticated);
          this.githubService.storeCredentials(username, password);
          this.ngZone.run(() => this.router.navigate(['']));
        },
        error => {
          this.errorHandlingService.handleHttpError(error.error);
        }
      );
  }

  logOut(): void {
    this.accessToken = null;
    this.changeAuthState(AuthState.NotAuthenticated);
    this.ngZone.run(() => this.router.navigate(['/login']));
  }

  isAuthenticated(): boolean {
    return !!(this.authStateSource.getValue() === 2);
  }

  private changeAuthState(newAuthState: AuthState) {
    this.authStateSource.next(newAuthState);
  }
}

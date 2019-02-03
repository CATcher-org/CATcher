import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders} from '@angular/common/http';
import { Router } from '@angular/router';
import { BehaviorSubject } from 'rxjs';
import { NgZone } from '@angular/core';
import { ElectronService } from './electron.service';
import { ErrorHandlingService } from '../../core/services/error-handling.service';
import { GithubService } from '../../core/services/github.service';

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
    // When OAuth process is completed ipcMain from electron will send the access_token through this channel.
    this.electronService.ipcRenderer.on('github-oauth-reply', (event, access_token) => {
      this.changeAuthState(AuthState.Authenticated);
      this.initializeLoggedInUser(access_token);
    });
  }

  startOAuthProcess() {
    this.changeAuthState(AuthState.AwaitingAuthentication);
    this.electronService.ipcRenderer.send('github-oauth');
  }

  startAuthentication(username: String, password: String) {
    this.changeAuthState(AuthState.AwaitingAuthentication);
    const header = new HttpHeaders().set('Authorization', 'Basic ' + btoa(username + ':' + password));
    this.http.get('https://api.github.com/user', { headers: header })
      .subscribe(
        response => {
          console.log(response);
          this.changeAuthState(AuthState.Authenticated);
          console.log(this.isAuthenticated());
          this.githubService.storeCredentials(username, password);
          this.ngZone.run(() => this.router.navigate(['']));
        },
        error => {
          console.log(error);
          this.errorHandlingService.handleHttpError(error);
        }
      );
  }

  logOut(): void {
    this.accessToken = null;
    this.changeAuthState(AuthState.NotAuthenticated);
    this.ngZone.run(() => this.router.navigate(['/login']));
  }

  isAuthenticated(): boolean {
    console.log(this.authStateSource.getValue().toString());
    return !!(this.authStateSource.getValue() === 2);
  }

  private initializeLoggedInUser(access_token: string): void {
    this.accessToken = access_token;
    this.ngZone.run(() => this.router.navigate(['/']));
  }

  private changeAuthState(newAuthState: AuthState) {
    this.authStateSource.next(newAuthState);
  }
}

import { Injectable } from '@angular/core';
import {ElectronService} from '../electron.service';
import {Router} from '@angular/router';
import {BehaviorSubject} from 'rxjs';
import {NgZone} from '@angular/core';

export enum AuthState { 'NotAuthenticated', 'AwaitingAuthentication', 'Authenticated' }

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private accessToken: string;
  authStateSource = new BehaviorSubject(AuthState.NotAuthenticated);
  currentAuthState = this.authStateSource.asObservable();

  constructor(private electronService: ElectronService, private router: Router, private ngZone: NgZone) {
    this.electronService.ipcRenderer.on('github-oauth-reply', (event, access_token) => {
      this.changeAuthState(AuthState.Authenticated);
      this.initializeLoggedInUser(access_token);
    });
  }

  initializeLoggedInUser(access_token: string): void {
    this.accessToken = access_token;
    this.ngZone.run(() => this.router.navigate(['/']));
  }

  logOut(): void {
    this.accessToken = null;
    this.changeAuthState(AuthState.NotAuthenticated);
    this.ngZone.run(() => this.router.navigate(['/login']));
  }

  startOAuthProcess() {
    this.changeAuthState(AuthState.AwaitingAuthentication);
    this.electronService.ipcRenderer.send('github-oauth');
  }

  isAuthenticated(): boolean {
    return !!this.accessToken;
  }

  changeAuthState(newAuthState: AuthState) {
    this.authStateSource.next(newAuthState);
  }
}

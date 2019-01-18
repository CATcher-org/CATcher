import { Injectable } from '@angular/core';
import {Router} from '@angular/router';
import {BehaviorSubject} from 'rxjs';
import {NgZone} from '@angular/core';
import {ElectronService} from './electron.service';

export enum AuthState { 'NotAuthenticated', 'AwaitingAuthentication', 'Authenticated' }

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private accessToken: string;
  authStateSource = new BehaviorSubject(AuthState.NotAuthenticated);
  currentAuthState = this.authStateSource.asObservable();

  constructor(private electronService: ElectronService, private router: Router, private ngZone: NgZone) {
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

  logOut(): void {
    this.accessToken = null;
    this.changeAuthState(AuthState.NotAuthenticated);
    this.ngZone.run(() => this.router.navigate(['/login']));
  }

  isAuthenticated(): boolean {
    return !!this.accessToken;
  }

  private initializeLoggedInUser(access_token: string): void {
    this.accessToken = access_token;
    this.ngZone.run(() => this.router.navigate(['/']));
  }

  private changeAuthState(newAuthState: AuthState) {
    this.authStateSource.next(newAuthState);
  }
}

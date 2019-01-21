import {Component, OnDestroy, OnInit} from '@angular/core';
import {AuthService, AuthState} from '../core/services/auth.service';
import {Subscription} from 'rxjs';

@Component({
  selector: 'app-auth',
  templateUrl: './auth.component.html',
  styleUrls: ['./auth.component.css']
})
export class AuthComponent implements OnInit, OnDestroy {
  authState: AuthState;
  authStateSubscription: Subscription;
  username: string;
  password: string;

  constructor(private auth: AuthService) { }

  ngOnInit() {
    this.authStateSubscription = this.auth.currentAuthState.subscribe((state) => {
      this.authState = state;
    });
  }

  ngOnDestroy() {
    this.authStateSubscription.unsubscribe();
  }

  logInWithGithub() {
    this.auth.startOAuthProcess();
  }

  get isNotLoggedIn(): boolean {
    return this.authState === AuthState.NotAuthenticated;
  }

  signIn() {
    console.log('Works');
  }
}

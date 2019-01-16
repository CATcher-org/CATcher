import {Component, OnDestroy, OnInit} from '@angular/core';
import {AuthService, AuthState} from '../../services/auth/auth.service';
import {Subscription} from 'rxjs';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit, OnDestroy {
  authState: AuthState;
  authStateSubscription: Subscription;

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
}

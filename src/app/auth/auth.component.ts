import { Component, OnDestroy, OnInit } from '@angular/core';
import { AuthService, AuthState } from '../core/services/auth.service';
import { Subscription } from 'rxjs';
import { FormBuilder, FormGroup, NgForm, Validators } from '@angular/forms';
import { HttpErrorResponse } from '@angular/common/http';
import { ErrorHandlingService } from '../core/services/error-handling.service';
import { Router } from '@angular/router';
import { GithubService } from '../core/services/github.service';
import { PhaseService } from '../core/services/phase.service';
import { Title } from '@angular/platform-browser';
import { Profile } from './profiles/profiles.component';


@Component({
  selector: 'app-auth',
  templateUrl: './auth.component.html',
  styleUrls: ['./auth.component.css']
})
export class AuthComponent implements OnInit, OnDestroy {
  authState: AuthState;
  authStateSubscription: Subscription;
  loginForm: FormGroup;

  constructor(private auth: AuthService,
              private github: GithubService,
              private formBuilder: FormBuilder,
              private errorHandlingService: ErrorHandlingService,
              private router: Router,
              private phaseService: PhaseService,
              private authService: AuthService,
              private titleService: Title) { }

  ngOnInit() {
    this.authStateSubscription = this.auth.currentAuthState.subscribe((state) => {
      this.authState = state;
    });
    this.loginForm = this.formBuilder.group({
      username: ['', Validators.required],
      password: ['', Validators.required],
      encodedText: ['', Validators.required],
    });
  }

  ngOnDestroy() {
    this.authStateSubscription.unsubscribe();
  }

  /**
   * Fills the login form with data from the given Profile.
   * @param profile - Profile selected by the user.
   */
  onProfileSelect(profile: Profile): void {
    this.loginForm.get('username').setValue(profile.username);
    this.loginForm.get('password').setValue(profile.password);
    this.loginForm.get('encodedText').setValue(profile.encodedText);
  }

  login(form: NgForm) {
    if (this.loginForm.invalid) {
      return;
    } else {
      this.auth.startAuthentication(this.loginForm.get('username').value, this.loginForm.get('password').value,
        this.loginForm.get('encodedText').value)
        .subscribe(
          (user) => {
            this.authService.changeAuthState(AuthState.Authenticated);
            form.resetForm();
            this.titleService.setTitle('CATcher '.concat(this.phaseService.getPhaseDetail()));
            this.router.navigateByUrl(this.phaseService.currentPhase);
          },
          (error) => {
          if (error instanceof HttpErrorResponse) {
            this.errorHandlingService.handleHttpError(error.error);
          } else {
            this.errorHandlingService.handleGeneralError(error);
          }
      });
    }
  }
}

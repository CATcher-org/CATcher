import {Component, OnDestroy, OnInit} from '@angular/core';
import {AuthService, AuthState} from '../core/services/auth.service';
import {Subscription} from 'rxjs';
import {FormBuilder, FormGroup, NgForm, Validators} from '@angular/forms';
import {HttpErrorResponse} from '@angular/common/http';
import {ErrorHandlingService} from '../core/services/error-handling.service';
import {Router} from '@angular/router';
import {GithubService} from '../core/services/github.service';

@Component({
  selector: 'app-auth',
  templateUrl: './auth.component.html',
  styleUrls: ['./auth.component.css']
})
export class AuthComponent implements OnInit, OnDestroy {
  authState: AuthState;
  authStateSubscription: Subscription;
  loginForm: FormGroup;
  phaseUrl: string;
  org: string;
  repo: string;

  constructor(private auth: AuthService,
              private github: GithubService,
              private formBuilder: FormBuilder,
              private errorHandlingService: ErrorHandlingService,
              private router: Router) { }

  ngOnInit() {
    this.authStateSubscription = this.auth.currentAuthState.subscribe((state) => {
      this.authState = state;
    });
    this.loginForm = this.formBuilder.group({
      username: ['testathorStudent', Validators.required],
      password: ['studPwd1', Validators.required],
      encodedText: ['phase1=https://github.com/testathor/pe@phase2=https://github.com/testathor/p1' +
      '@phase3=https://github.com/testathor/p3', Validators.required],
    });
  }

  ngOnDestroy() {
    this.authStateSubscription.unsubscribe();
  }

  login(form: NgForm) {
    const full_url = 'full_name';
    if (this.loginForm.invalid) {
      return;
    } else {
      this.auth.startAuthentication(this.loginForm.get('username').value, this.loginForm.get('password').value,
        this.loginForm.get('encodedText').value).subscribe((res) => {
        let phase;
        if (res['first']['id'] != null) {
          this.phaseUrl = '';
          phase = 'first';
        } else if (res['second']['id'] != null) {
          this.phaseUrl = 'phase2';
          phase = 'second';
        } else if (res['third']['id'] != null) {
          this.phaseUrl = 'phase3';
          phase = 'third';
        }
        if (this.phaseUrl == null) {
          this.errorHandlingService.handleGeneralError('Repo is not ready');
        } else {
          this.org = res[phase][full_url].split('/', 2)[0];
          this.repo = res[phase][full_url].split('/', 2)[1];
          this.github.updatePhaseDetails(this.repo, this.org);
          this.router.navigateByUrl(this.phaseUrl);
        }
      }, (error) => {
        if (error instanceof HttpErrorResponse) {
          this.errorHandlingService.handleHttpError(error.error);
        } else {
          this.errorHandlingService.handleGeneralError(error);
        }
      });
    }
    form.resetForm();
  }
}

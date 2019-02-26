import {Component, OnDestroy, OnInit} from '@angular/core';
import {AuthService, AuthState} from '../core/services/auth.service';
import {Subscription} from 'rxjs';
import {FormBuilder, FormGroup, NgForm, Validators} from '@angular/forms';
import {HttpErrorResponse} from '@angular/common/http';
import {ErrorHandlingService} from '../core/services/error-handling.service';
import {Router} from '@angular/router';
import {GithubService} from '../core/services/github.service';
import {PhaseService} from '../core/services/phase.service';

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
              private phaseService: PhaseService) { }

  ngOnInit() {
    this.authStateSubscription = this.auth.currentAuthState.subscribe((state) => {
      this.authState = state;
    });
    this.loginForm = this.formBuilder.group({
      username: ['testathorStudent', Validators.required],
      password: ['studPwd1', Validators.required],
      encodedText: ['phase1=https://github.com/testathor/aa@phase2=https://github.com/testathor/pe-results' +
      '@phase3=https://github.com/testathor/p3', Validators.required],
    });
  }

  ngOnDestroy() {
    this.authStateSubscription.unsubscribe();
  }

  login(form: NgForm) {
    if (this.loginForm.invalid) {
      return;
    } else {
      this.auth.startAuthentication(this.loginForm.get('username').value, this.loginForm.get('password').value,
        this.loginForm.get('encodedText').value).subscribe((res) => {
        const phase = this.phaseService.determinePhaseNumber(res);
        this.router.navigateByUrl(phase);
        form.resetForm();
        if (phase !== 'not accesible') {
          this.router.navigateByUrl(phase);
        }
      }, (error) => {
        if (error instanceof HttpErrorResponse) {
          this.errorHandlingService.handleHttpError(error.error);
        } else {
          this.errorHandlingService.handleGeneralError(error);
        }
      });
    }
  }
}

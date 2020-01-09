import { Component, NgZone, OnDestroy, OnInit } from '@angular/core';
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
import { flatMap } from 'rxjs/operators';
import { UserService } from '../core/services/user.service';
import { GithubEventService } from '../core/services/githubevent.service';
import { ElectronService } from '../core/services/electron.service';
import { ApplicationService } from '../core/services/application.service';

const appSetting = require('../../../package.json');

@Component({
  selector: 'app-auth',
  templateUrl: './auth.component.html',
  styleUrls: ['./auth.component.css']
})
export class AuthComponent implements OnInit, OnDestroy {
  isReady: boolean;
  isAppOutdated: boolean;
  versionCheckingError: boolean;
  authState: AuthState;
  authStateSubscription: Subscription;
  loginForm: FormGroup;
  profileForm: FormGroup;
  profileLocationPrompt: string;
  currentUserName: string;

  constructor(private auth: AuthService,
              private githubService: GithubService,
              private githubEventService: GithubEventService,
              private userService: UserService,
              private formBuilder: FormBuilder,
              private errorHandlingService: ErrorHandlingService,
              private router: Router,
              private phaseService: PhaseService,
              private electronService: ElectronService,
              private authService: AuthService,
              private titleService: Title,
              private ngZone: NgZone,
              private appService: ApplicationService) {
    this.electronService.ipcRenderer.on('github-oauth-reply',
      (event, {token, isChangingAccount, error, isWindowClosed}) => {
      this.ngZone.run(() => {
        if (error && !isWindowClosed) {
          this.errorHandlingService.handleGeneralError(error);
        }
        if (error && isChangingAccount) {
          this.authService.changeAuthState(AuthState.PartialOAuthenticated);
          return;
        }
        if (error && !isChangingAccount) {
          this.authService.changeAuthState(AuthState.NotAuthenticated);
          return;
        }
        this.githubService.storeOAuthAccessToken(token);
        this.userService.getAuthenticatedUser().subscribe((user) => {
          this.currentUserName = user.login;
          this.authService.changeAuthState(AuthState.PartialOAuthenticated);
        });
      });
    });
  }

  ngOnInit() {
    this.checkAppIsOutdated();
    this.authStateSubscription = this.auth.currentAuthState.subscribe((state) => {
      this.authState = state;
    });
    this.loginForm = this.formBuilder.group({
      username: ['', Validators.required],
      password: ['', Validators.required],
      session: ['', Validators.required],
    });
    this.profileForm = this.formBuilder.group({
      session: ['', Validators.required],
    });
  }

  ngOnDestroy() {
    this.authStateSubscription.unsubscribe();
  }

  /**
   * Checks whether the current version of CATcher is outdated.
   */
  checkAppIsOutdated(): void {
    this.isReady = false;
    this.appService.isApplicationOutdated().subscribe((isOutdated: boolean) => {
      this.isAppOutdated = isOutdated;
      this.isReady = true;
      this.versionCheckingError = false;
    }, (error) => {
      this.errorHandlingService.handleHttpError(error);
      this.isReady = true;
      this.versionCheckingError = true;
    });
  }

  /**
   * Informs user of missing profiles file.
   * @param profilesDetails - profiles file information.
   */
  onProfilesMissing(profilesDetails: {isDirectoryMessageVisible: boolean, fileName: string, fileDirectory: string}): void {
    this.profileLocationPrompt = profilesDetails.isDirectoryMessageVisible
      ? 'No custom '
          .concat(profilesDetails['fileName'])
          .concat(' file found in ')
          .concat(profilesDetails['fileDirectory'])
          .concat(' .')
      : '';
  }

  /**
   * Fills the login form with data from the given Profile.
   * @param profile - Profile selected by the user.
   */
  onProfileSelect(profile: Profile): void {
    if (this.isUserNotAuthenticated()) {
      this.loginForm.get('username').setValue(this.loginForm.get('username').value || profile.username);
      this.loginForm.get('password').setValue(this.loginForm.get('password').value || profile.password);
      this.loginForm.get('session').setValue(profile.encodedText);
    } else if (this.isUserPartiallyAuthenticated()) {
      this.profileForm.get('session').setValue(profile.encodedText);
    }
  }

  /**
   * Logs in the user using basic authentication (username and password).
   * DEPRECIATION WARNING: https://developer.github.com/changes/2019-11-05-deprecated-passwords-and-authorizations-api/
   * @param form - The login form to complete the login process.
   */
  login(form: NgForm) {
    if (this.loginForm.invalid) {
      return;
    }

    this.authService.changeAuthState(AuthState.AwaitingAuthentication);
    const username: string = this.loginForm.get('username').value;
    const password: string = this.loginForm.get('password').value;
    const sessionInformation: string = this.loginForm.get('session').value;
    const org: string = this.getOrgDetails(sessionInformation);
    const dataRepo: string = this.getDataRepoDetails(sessionInformation);

    this.githubService.storeOrganizationDetails(org, dataRepo);
    this.phaseService.setPhaseOwners(org, username);

    this.auth.authenticate(username, password).pipe(
      flatMap((loginConfirmation: {login: string}) => {
        return this.userService.createUserModel(loginConfirmation.login);
      }),
      flatMap(() => {
        return this.phaseService.sessionSetup();
      }),
      flatMap(() => {
        return this.githubEventService.setLatestChangeEvent();
      })
    ).subscribe(
      () => {
        this.handleAuthSuccess(form);
      },
      (error) => {
        this.auth.changeAuthState(AuthState.NotAuthenticated);
        this.onAuthFailure(form, error);
      }
    );
  }

  /**
   * Complete the initialization process of an already authenticated user through Github's OAuth Web Flow process.
   * @param form - The profile form to complete the setting up process.
   */
  finishSettingUpOAuthUser(form: NgForm) {
    if (this.profileForm.invalid) {
      return;
    }

    this.authService.changeAuthState(AuthState.SettingUpOAuthUser);
    const sessionInformation: string = this.profileForm.get('session').value;
    const org: string = this.getOrgDetails(sessionInformation);
    const dataRepo: string = this.getDataRepoDetails(sessionInformation);

    this.githubService.storeOrganizationDetails(org, dataRepo);
    this.phaseService.setPhaseOwners(org, this.currentUserName);

    this.userService.createUserModel(this.currentUserName).pipe(
      flatMap(() => {
        return this.phaseService.sessionSetup();
      }),
      flatMap(() => {
        return this.githubEventService.setLatestChangeEvent();
      })
    ).subscribe(() => {
      this.handleAuthSuccess(form);
    }, (error) => {
      this.auth.changeAuthState(AuthState.PartialOAuthenticated);
      this.onAuthFailure(form, error);
    });
  }

  /**
   * Handles the clean up required after authentication and setting up of user data is completed.
   * @param form - The form used in this authentication process.
   */
  handleAuthSuccess(form: NgForm) {
    form.resetForm();
    this.titleService.setTitle(appSetting.name
      .concat(' ')
      .concat(appSetting.version)
      .concat(' - ')
      .concat(this.phaseService.getPhaseDetail()));
    this.router.navigateByUrl(this.phaseService.currentPhase);
    this.authService.changeAuthState(AuthState.Authenticated);
  }

  /**
   * Handles the clean up required after the user encounter a failure in authentication.
   * @param form - the form using in the authentication process.
   * @param error - the error object that is being raised.
   */
  onAuthFailure(form: NgForm, error: any) {
    if (error instanceof HttpErrorResponse) {
      this.errorHandlingService.handleHttpError(error.error);
    } else {
      this.errorHandlingService.handleGeneralError(error);
    }
  }

  /**
   * Redirects the user from OAuth's set up page to Login page.
   */
  goBackToLoginPage(): void {
    this.userService.reset();
    this.authService.changeAuthState(AuthState.NotAuthenticated);
  }

  isUserNotAuthenticated(): boolean {
    return this.authState === AuthState.NotAuthenticated;
  }

  isUserAuthenticating(): boolean {
    return this.authState === AuthState.AwaitingAuthentication;
  }

  isUserPartiallyAuthenticated(): boolean {
    return this.authState === AuthState.PartialOAuthenticated;
  }

  isSettingUpOAuthUser(): boolean {
    return this.authState === AuthState.SettingUpOAuthUser;
  }

  /**
   * Extracts the Organization Details from the input sessionInformation.
   * @param sessionInformation - string in the format of 'orgName/dataRepo'
   */
  private getOrgDetails(sessionInformation: string) {
    return sessionInformation.split('/')[0];
  }

  /**
   * Extracts the Data Repository Details from the input sessionInformation.
   * @param sessionInformation - string in the format of 'orgName/dataRepo'
   */
  private getDataRepoDetails(sessionInformation: string) {
    return sessionInformation.split('/')[1];
  }
}

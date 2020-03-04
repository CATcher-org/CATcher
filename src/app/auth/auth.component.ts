import { Component, NgZone, OnDestroy, OnInit } from '@angular/core';
import { AuthService, AuthState } from '../core/services/auth.service';
import { Subscription, throwError } from 'rxjs';
import { FormBuilder, FormGroup, NgForm, Validators } from '@angular/forms';
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
import { DataService } from '../core/services/data.service';
import { session } from 'electron';
import { GithubUser } from '../core/models/github-user.model';

const appSetting = require('../../../package.json');

@Component({
  selector: 'app-auth',
  templateUrl: './auth.component.html',
  styleUrls: ['./auth.component.css']
})
export class AuthComponent implements OnInit, OnDestroy {
  // isReady is used to indicate whether the pre-processing of application is done.
  isReady: boolean;
  // isSettingUpSession is used to indicate whether CATcher is in the midst of setting up the session.
  isSettingUpSession: boolean;

  // Errors
  isAppOutdated: boolean;
  versionCheckingError: boolean;

  // The different login dialogs available
  isAtSessionSelection = true;
  isAtGithubAccountConfirmation: boolean;
  isAtNewGithubLogin: boolean;

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
      (event, {token, error, isWindowClosed}) => {
      this.ngZone.run(() => {
        if (error) {
          if (!isWindowClosed) {
            this.errorHandlingService.handleError(error);
          }
          this.authService.changeAuthState(AuthState.NotAuthenticated);
          this.goToNewGithubLogin();
          return;
        }
        this.githubService.storeOAuthAccessToken(token);
        this.userService.getAuthenticatedUser().subscribe((user: GithubUser) => {
          auth.setLoginStatusWithGithub(true);
          this.currentUserName = user.login;
          if (this.isAtGithubAccountConfirmation) {
            this.auth.changeAuthState(AuthState.ConfirmOAuthUser);
          } else {
            this.completeLoginProcess(this.currentUserName);
          }
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
    });
    this.profileForm = this.formBuilder.group({
      session: ['', Validators.required],
    });
  }

  ngOnDestroy() {
    this.electronService.ipcRenderer.removeAllListeners('github-oauth-reply');
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
      this.errorHandlingService.handleError(error);
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
    this.profileForm.get('session').setValue(profile.encodedText);
    this.loginForm.get('username').setValue(this.loginForm.get('username').value || profile.username);
    this.loginForm.get('password').setValue(this.loginForm.get('password').value || profile.password);
  }

  /**
   * Logs in the user using basic authentication (username and password).
   * DEPRECIATION WARNING: https://developer.github.com/changes/2019-11-05-deprecated-passwords-and-authorizations-api/
   * @param form - The login form to complete the login process.
   */
  loginWithUserNamePassword() {
    if (this.loginForm.invalid) {
      return;
    }

    this.authService.changeAuthState(AuthState.AwaitingAuthentication);
    const username: string = this.loginForm.get('username').value;
    const password: string = this.loginForm.get('password').value;

    return this.auth.authenticate(username, password).subscribe((loginConfirmation: {login: string}) => {
      this.completeLoginProcess(loginConfirmation.login);
    });
  }

  completeLoginProcess(username: string): void {
    this.auth.changeAuthState(AuthState.AwaitingAuthentication);
    this.phaseService.setPhaseOwners(this.currentSessionOrg, username);
    this.userService.createUserModel(username).pipe(
      flatMap(() => {
        return this.phaseService.sessionSetup();
      }),
      flatMap(() => {
        return this.githubEventService.setLatestChangeEvent();
      })
    ).subscribe(() => {
      this.handleAuthSuccess();
    }, (error) => {
      this.auth.changeAuthState(AuthState.NotAuthenticated);
      this.errorHandlingService.handleError(error);
    });
  }

  setupSession() {
    if (this.profileForm.invalid) {
      return;
    }
    this.isSettingUpSession = true;
    const sessionInformation: string = this.profileForm.get('session').value;
    const org: string = this.getOrgDetails(sessionInformation);
    const dataRepo: string = this.getDataRepoDetails(sessionInformation);
    this.githubService.storeOrganizationDetails(org, dataRepo);

    this.phaseService.storeSessionData().pipe(
      flatMap((isValidSession: boolean) => {
        if (!isValidSession) {
          throwError('Invalid Session');
        }
        return this.authService.hasExistingAuthWithGithub();
      }),
    ).subscribe((hasExistingSession: boolean) => {
      if (hasExistingSession) {
        this.goToGithubAccountConfirmation();
        this.auth.startOAuthProcess();
      } else {
        this.goToNewGithubLogin();
      }
    }, (error) => {
      this.errorHandlingService.handleError(error);
    }, () => {
      this.isSettingUpSession = false;
    });
  }

  logIntoAnotherAccount() {
    this.auth.setLoginStatusWithGithub(false);
    this.isAtGithubAccountConfirmation = false;
    this.isAtNewGithubLogin = true;
    this.auth.changeAuthState(AuthState.NotAuthenticated);
  }

  /**
   * Handles the clean up required after authentication and setting up of user data is completed.
   */
  handleAuthSuccess() {
    this.titleService.setTitle(appSetting.name
      .concat(' ')
      .concat(appSetting.version)
      .concat(' - ')
      .concat(this.phaseService.getPhaseDetail()));
    this.router.navigateByUrl(this.phaseService.currentPhase);
    this.authService.changeAuthState(AuthState.Authenticated);
  }

  goToSessionSelect() {
    this.isAtSessionSelection = true;
    this.isAtNewGithubLogin = false;
    this.isAtGithubAccountConfirmation = false;
  }

  goToGithubAccountConfirmation() {
    this.isAtSessionSelection = false;
    this.isAtNewGithubLogin = false;
    this.isAtGithubAccountConfirmation = true;
  }

  goToNewGithubLogin() {
    this.isAtSessionSelection = false;
    this.isAtNewGithubLogin = true;
    this.isAtGithubAccountConfirmation = false;
  }

  isUserNotAuthenticated(): boolean {
    return this.authState === AuthState.NotAuthenticated;
  }

  isUserAuthenticating(): boolean {
    return this.authState === AuthState.AwaitingAuthentication;
  }

  get currentSessionOrg(): string {
    const sessionInformation: string = this.profileForm.get('session').value;
    return this.getOrgDetails(sessionInformation);
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

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
import { flatMap } from 'rxjs/operators';
import { UserService } from '../core/services/user.service';
import { User } from '../core/models/user.model';
import { GithubEventService } from '../core/services/githubevent.service';


@Component({
  selector: 'app-auth',
  templateUrl: './auth.component.html',
  styleUrls: ['./auth.component.css']
})
export class AuthComponent implements OnInit, OnDestroy {
  authState: AuthState;
  authStateSubscription: Subscription;
  loginForm: FormGroup;
  profileLocationPrompt: string;

  constructor(private auth: AuthService,
              private githubService: GithubService,
              private githubEventService: GithubEventService,
              private userService: UserService,
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
      session: ['', Validators.required],
    });
  }

  ngOnDestroy() {
    this.authStateSubscription.unsubscribe();
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
    this.loginForm.get('username').setValue(profile.username);
    this.loginForm.get('password').setValue(profile.password);
    this.loginForm.get('session').setValue(profile.encodedText);
  }

  login(form: NgForm) {
    if (this.loginForm.invalid) {
      return;
    } else {
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
            this.authService.changeAuthState(AuthState.Authenticated);
            form.resetForm();
            this.titleService.setTitle(require('../../../package.json').name
              .concat(' ')
              .concat(require('../../../package.json').version)
              .concat(' - ')
              .concat(this.phaseService.getPhaseDetail()));
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

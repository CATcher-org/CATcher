import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Profile } from '../../core/models/profile.model';
import { AuthService, AuthState } from '../../core/services/auth.service';
import { ErrorHandlingService } from '../../core/services/error-handling.service';
import { GithubService } from '../../core/services/github.service';
import { LoggingService } from '../../core/services/logging.service';
import { PhaseService } from '../../core/services/phase.service';

@Component({
  selector: 'app-session-selection',
  templateUrl: './session-selection.component.html',
  styleUrls: ['./session-selection.component.css', '../auth.component.css']
})
export class SessionSelectionComponent implements OnInit {
  // isSettingUpSession is used to indicate whether CATcher is in the midst of setting up the session.
  isSettingUpSession: boolean;
  profileForm: FormGroup;

  @Input() urlEncodedSessionName: string;

  @Output() sessionEmitter: EventEmitter<string> = new EventEmitter<string>();

  constructor(
    private formBuilder: FormBuilder,
    private logger: LoggingService,
    private githubService: GithubService,
    private phaseService: PhaseService,
    private authService: AuthService,
    private errorHandlingService: ErrorHandlingService
  ) {}

  ngOnInit() {
    this.isSettingUpSession = false;
    this.initProfileForm();
  }

  /**
   * Fills the login form with data from the given Profile.
   * @param profile - Profile selected by the user.
   */
  onProfileSelect(profile: Profile): void {
    this.profileForm.get('session').setValue(profile.repoName);
    this.sessionEmitter.emit(profile.repoName);
  }

  setupSession() {
    if (this.profileForm.invalid) {
      return;
    }
    this.isSettingUpSession = true;
    const sessionInformation: string = this.profileForm.get('session').value;
    const org: string = this.getOrgDetails(sessionInformation);
    const dataRepo: string = this.getDataRepoDetails(sessionInformation);
    // Persist session information in local storage
    window.localStorage.setItem('org', org);
    window.localStorage.setItem('dataRepo', dataRepo);
    this.githubService.storeOrganizationDetails(org, dataRepo);

    this.logger.info(`Selected Settings Repo: ${sessionInformation}`);

    this.phaseService.storeSessionData().subscribe(
      () => {
        try {
          this.authService.startOAuthProcess();
        } catch (error) {
          this.errorHandlingService.handleError(error);
          this.authService.changeAuthState(AuthState.NotAuthenticated);
        }
      },
      (error) => {
        this.errorHandlingService.handleError(error);
        this.isSettingUpSession = false;
      },
      () => (this.isSettingUpSession = false)
    );
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

  private initProfileForm() {
    this.profileForm = this.formBuilder.group({
      session: ['', Validators.required]
    });
  }
}

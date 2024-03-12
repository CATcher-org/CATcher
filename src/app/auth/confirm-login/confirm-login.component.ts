import { Component, Input, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { mergeMap } from 'rxjs/operators';
import { AuthService, AuthState } from '../../core/services/auth.service';
import { ErrorHandlingService } from '../../core/services/error-handling.service';
import { GithubEventService } from '../../core/services/githubevent.service';
import { LoggingService } from '../../core/services/logging.service';
import { PhaseService } from '../../core/services/phase.service';
import { UserService } from '../../core/services/user.service';

@Component({
  selector: 'app-auth-confirm-login',
  templateUrl: './confirm-login.component.html',
  styleUrls: ['./confirm-login.component.css']
})
export class ConfirmLoginComponent implements OnInit {
  @Input() username: string;
  @Input() currentSessionOrg: string;

  constructor(
    private authService: AuthService,
    private phaseService: PhaseService,
    private userService: UserService,
    private errorHandlingService: ErrorHandlingService,
    private githubEventService: GithubEventService,
    private logger: LoggingService,
    private router: Router
  ) {}

  ngOnInit() {}

  onGithubWebsiteClicked() {
    window.open('https://github.com/', '_blank');
    window.location.reload();
  }

  logIntoAnotherAccount() {
    this.logger.info('ConfirmLoginComponent: Logging into another account');
    this.authService.startOAuthProcess();
  }

  /**
   * Handles the clean up required after authentication and setting up of user data is completed.
   */
  handleAuthSuccess() {
    this.authService.setTitleWithPhaseDetail();
    this.authService.changeAuthState(AuthState.Authenticated);
    this.authService.navigateToLandingPage();
  }

  /**
   * Will complete the process of logging in the given user.
   */
  completeLoginProcess(): void {
    this.authService.changeAuthState(AuthState.AwaitingAuthentication);
    this.phaseService.setPhaseOwners(this.currentSessionOrg, this.username);
    this.userService
      .createUserModel(this.username)
      .pipe(
        mergeMap(() => this.phaseService.sessionSetup()),
        mergeMap(() => this.githubEventService.setLatestChangeEvent())
      )
      .subscribe(
        () => {
          this.handleAuthSuccess();
        },
        (error) => {
          this.authService.changeAuthState(AuthState.NotAuthenticated);
          this.errorHandlingService.handleError(error);
          this.logger.info(`ConfirmLoginComponent: Completion of login process failed with an error: ${error}`);
        }
      );
  }
}

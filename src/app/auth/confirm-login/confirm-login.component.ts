import { Component, Input, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { flatMap } from 'rxjs/operators';
import { AuthService, AuthState } from 'src/app/core/services/auth.service';
import { ErrorHandlingService } from 'src/app/core/services/error-handling.service';
import { GithubEventService } from 'src/app/core/services/githubevent.service';
import { LoggingService } from 'src/app/core/services/logging.service';
import { PhaseService } from 'src/app/core/services/phase.service';
import { UserService } from 'src/app/core/services/user.service';
import Observable from 'zen-observable-ts';

const APPLICATION_VERSION_OUTDATED_ERROR = "Please update to the latest version of CATcher.";

@Component({
  selector: 'app-auth-confirm-login',
  templateUrl: './confirm-login.component.html',
  styleUrls: ['./confirm-login.component.css']
})
export class ConfirmLoginComponent implements OnInit {
  @Input() username: string;
  @Input() currentSessionOrg: string;
  @Input() checkAppIsOutdated: () => Observable<any>;

  constructor(private authService: AuthService,
              private phaseService: PhaseService,
              private userService: UserService,
              private errorHandlingService: ErrorHandlingService,
              private githubEventService: GithubEventService,
              private logger: LoggingService,
              private router: Router
  ) { }

  ngOnInit() { }

  /**
   * Handles the clean up required after authentication and setting up of user data is completed.
   */
  handleAuthSuccess() {
    this.authService.setTitleWithPhaseDetail();
    this.router.navigateByUrl(this.phaseService.currentPhase);
    this.authService.changeAuthState(AuthState.Authenticated);
  }

  /**
   * Will complete the process of logging in the given user.
   * @param username - The user to log in.
   */
  completeLoginProcess(username: string): void {
    this.authService.changeAuthState(AuthState.AwaitingAuthentication);
    this.phaseService.setPhaseOwners(this.currentSessionOrg, username);
    this.userService.createUserModel(username).pipe(
      flatMap(() => this.phaseService.sessionSetup()),
      flatMap(() => this.githubEventService.setLatestChangeEvent()),
      flatMap(() => this.checkAppIsOutdated()),
    ).subscribe(() => {
      this.handleAuthSuccess();
    }, (error) => {
      this.authService.changeAuthState(AuthState.NotAuthenticated);
      this.errorHandlingService.handleError(error);
      this.logger.info(`Completion of login process failed with an error: ${error}`);
    });
  }

}

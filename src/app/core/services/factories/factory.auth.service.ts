import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { NgZone } from '@angular/core';
import { ElectronService } from '../electron.service';
import { UserService } from '../user.service';
import { PhaseService } from '../phase.service';
import { ErrorHandlingService } from '../error-handling.service';
import { GithubService } from '../github.service';
import { IssueService } from '../issue.service';
import { DataService } from '../data.service';
import { LabelService } from '../label.service';
import { Title } from '@angular/platform-browser';
import { GithubEventService } from '../githubevent.service';
import { AppConfig } from '../../../../environments/environment';
import { LoggingService } from '../logging.service';
import { MockAuthService } from '../mocks/mock.auth.service';
import { AuthService } from '../auth.service';

export function AuthServiceFactory(electronService: ElectronService, router: Router, ngZone: NgZone,
                                   http: HttpClient,  errorHandlingService: ErrorHandlingService,
                                   githubService: GithubService,
                                   userService: UserService,
                                   issueService: IssueService,
                                   phaseService: PhaseService,
                                   labelService: LabelService,
                                   dataService: DataService,
                                   githubEventService: GithubEventService,
                                   titleService: Title,
                                   logger: LoggingService) {
  if (AppConfig.test) {
      return new MockAuthService(electronService, router, ngZone,
        http, errorHandlingService, githubService, userService, issueService,
        phaseService, labelService, dataService, githubEventService, titleService,
        logger);
  }
  return new AuthService(electronService, router, ngZone,
    http, errorHandlingService, githubService, userService, issueService,
    phaseService, labelService, dataService, githubEventService, titleService,
    logger);
}

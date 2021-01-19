import { HttpClient } from '@angular/common/http';
import { UserService } from '../user.service';
import { GithubService } from '../github.service';
import { LabelService } from '../label.service';
import { AppConfig } from '../../../../environments/environment';
import { MatDialog } from '@angular/material';
import { MockPhaseService } from '../mocks/mock.phase.service';
import { PhaseService } from '../phase.service';

export function PhaseServiceFactory(http: HttpClient,
                                   githubService: GithubService,
                                   labelService: LabelService,
                                   userService: UserService,
                                   phaseFixConfirmationDialog: MatDialog) {
  if (AppConfig.test) {
      return new MockPhaseService(http, githubService, labelService, userService,
        phaseFixConfirmationDialog);
  }
  return new PhaseService(http, githubService, labelService, userService,
    phaseFixConfirmationDialog);
}

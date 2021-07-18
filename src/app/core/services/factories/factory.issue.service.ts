import { GithubService } from '../github.service';
import { AppConfig } from '../../../../environments/environment';
import { MockIssueService } from '../mocks/mock.issue.service';
import { IssueService } from '../issue.service';
import { UserService } from '../user.service';
import { PhaseService } from '../phase.service';
import { DataService } from '../data.service';
import { ElectronService } from '../electron.service';

export function IssueServiceFactory(githubService: GithubService, userService: UserService, phaseService: PhaseService,
                                    electronService: ElectronService, dataService: DataService) {
  if (AppConfig.test) {
      return new MockIssueService(githubService, phaseService, dataService);
  }
  return new IssueService(githubService, userService, phaseService,
    electronService, dataService);
}

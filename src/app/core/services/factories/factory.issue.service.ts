import { AppConfig } from '../../../../environments/environment';
import { DataService } from '../data.service';
import { GithubService } from '../github.service';
import { IssueService } from '../issue.service';
import { LoggingService } from '../logging.service';
import { MockIssueService } from '../mocks/mock.issue.service';
import { PhaseService } from '../phase.service';
import { UserService } from '../user.service';

export function IssueServiceFactory(
  githubService: GithubService,
  userService: UserService,
  phaseService: PhaseService,
  dataService: DataService,
  logger: LoggingService
) {
  if (AppConfig.test) {
    return new MockIssueService(githubService, phaseService, dataService);
  }
  return new IssueService(githubService, userService, phaseService, dataService, logger);
}

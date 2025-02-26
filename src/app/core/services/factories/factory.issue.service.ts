import { AppConfig } from '../../../../environments/environment';
import { DataService } from '../data.service';
import { GithubService } from '../github.service';
import { IssueService } from '../issue.service';
import { LoggingService } from '../logging.service';
import { PhaseService } from '../phase.service';
import { UserService } from '../user.service';

export function IssueServiceFactory(
  githubService: GithubService,
  userService: UserService,
  phaseService: PhaseService,
  dataService: DataService,
  logger: LoggingService
) {
  return new IssueService(githubService, userService, phaseService, dataService, logger);
}

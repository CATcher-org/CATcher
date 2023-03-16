import { Apollo } from 'apollo-angular';
import { AppConfig } from '../../../../environments/environment';
import { ErrorHandlingService } from '../error-handling.service';
import { GithubService } from '../github.service';
import { LoggingService } from '../logging.service';
import { MockGithubService } from '../mocks/mock.github.service';

export function GithubServiceFactory(handling: ErrorHandlingService, apollo: Apollo, logger: LoggingService) {
  if (AppConfig.test) {
    return new MockGithubService();
  }
  return new GithubService(handling, apollo, logger);
}

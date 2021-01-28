import { AppConfig } from '../../../../environments/environment';
import { Apollo } from 'apollo-angular';
import { ElectronService } from '../electron.service';
import { ErrorHandlingService } from '../error-handling.service';
import { GithubService } from '../github.service';
import { MockGithubService } from '../mocks/mock.github.service';

export function GithubServiceFactory(apollo: Apollo, electron: ElectronService, handling: ErrorHandlingService) {
  if (AppConfig.test) {
      return new MockGithubService();
  }
  return new GithubService(handling, apollo, electron);
}

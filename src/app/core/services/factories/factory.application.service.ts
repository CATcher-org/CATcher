import { GithubService } from '../github.service';
import { AppConfig } from '../../../../environments/environment';
import { MockApplicationService } from '../mocks/mock.application.service';
import { ApplicationService } from '../application.service';

export function ApplicationServiceFactory(githubService: GithubService) {
  if (AppConfig.test) {
      return new MockApplicationService(githubService);
  }
  return new ApplicationService(githubService);
}


import { GithubService } from '../github.service';
import { DataService } from '../data.service';
import { AppConfig } from '../../../../environments/environment';
import { MockUserService } from '../mocks/mock.user.service';
import { UserService } from '../user.service';

export function UserServiceFactory(githubService: GithubService,
                                   dataService: DataService) {
  if (AppConfig.test) {
      return new MockUserService(githubService, dataService);
  }
  return new UserService(githubService, dataService);
}

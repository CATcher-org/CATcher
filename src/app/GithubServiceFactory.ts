import { AppConfig } from "../environments/environment";
import { Apollo } from "apollo-angular";
import { ElectronService } from "./core/services/electron.service";
import { ErrorHandlingService } from "./core/services/error-handling.service";
import { GithubService } from "./core/services/github.service";
import { MockGithubService } from "./core/services/mock.github.service";

export function GithubServiceFactory(apollo: Apollo, electron: ElectronService, handling: ErrorHandlingService) {

    if (AppConfig.production) {
        return new GithubService(handling, apollo, electron);
    } else if (AppConfig.test) {
        return new MockGithubService(handling, apollo, electron);
    }

}
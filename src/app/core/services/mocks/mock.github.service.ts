import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { GithubUser } from '../../models/github-user.model';
import { AppConfig } from '../../../../environments/environment.test';
import { Phase } from '../../models/phase.model';
import { SessionData } from '../../models/session.model';
import { GithubRelease } from '../../models/github/github.release';
import { LabelService } from '../label.service';
import { Label } from '../../models/label.model';

const Octokit = require('@octokit/rest');
const CATCHER_ORG = 'CATcher-org';
const CATCHER_REPO = 'CATcher';

let ORG_NAME = '';
let MOD_ORG = '';
let REPO = '';
let DATA_REPO = '';
let octokit = new Octokit();

@Injectable()
export class MockGithubService {

  constructor() {}

  storeOAuthAccessToken(accessToken: string) {
    octokit = new Octokit({
      auth() {
        return `Token ${accessToken}`;
      }
    });
  }

  storeOrganizationDetails(orgName: string, dataRepo: string) {
    MOD_ORG = orgName;
    DATA_REPO = dataRepo;
  }

  storePhaseDetails(phaseRepoOwner: string, repoName: string) {
    REPO = repoName;
    ORG_NAME = phaseRepoOwner;
  }

  /**
   * Always informs that repository exists for testing purposes.
   * @param owner - Owner of Specified Repository.
   * @param repo - Name of Repository.
   */
  isRepositoryPresent(owner: string, repo: string): Observable<boolean> {
    return of(true);
  }

  /**
   * Creates a fabricated object that matches the structure of that
   * returned by the Github API which always results in the required labels
   * being present.
   */
  fetchAllLabels(): Observable<Array<{}>> {
    return of(LabelService.getRequiredLabelsAsArray().map((label: Label) => {
      return {
        name: label.labelCategory ? `${label.labelCategory}.${label.labelValue}` : `${label.labelValue}`,
        color: `${label.labelColor}`
      };
    }));
  }

  /**
   * @return Empty Observable<[]>
   */
  fetchEventsForRepo(): Observable<any[]> {
    return of([]);
  }

  /**
   * Creates Fabricated Data File with Tester's Credentials.
   */
  fetchDataFile(): Observable<{}> {
    return of({
      data: 'role,name,team\n' +
        `${AppConfig.role},${AppConfig.username},${AppConfig.team}\n`
    });
  }

  /**
   * Creates a fabricated object that matches the structure of that
   * returned by the Github API which always results in Release Comparisons
   * to be true.
   */
  fetchLatestRelease(): Observable<GithubRelease> {
    const appSetting = require('../../../../../package.json');
    return of({
      html_url: `www.github.com/CATcher-org/releases/v${appSetting.version}`,
      tag_name: `v${appSetting.version}`
    } as GithubRelease);
  }

  /**
   * Fabricates session data in accordance with SessionData Requirements.
   * @return Observable<{}> representing session information.
   */
  fetchSettingsFile(): Observable<SessionData> {
    return of({
      openPhases : [Phase.phaseBugReporting, Phase.phaseTeamResponse, Phase.phaseTesterResponse, Phase.phaseModeration],
      [Phase.phaseBugReporting]: 'undefined',
      [Phase.phaseTeamResponse]: 'undefined',
      [Phase.phaseTesterResponse]: 'undefined',
      [Phase.phaseModeration]: 'undefined'
    } as SessionData);
  }

  /**
   * @return Observable<GithubUser> representation of TestUser Credentials.
   */
  fetchAuthenticatedUser(): Observable<GithubUser> {
    return of({
      login: AppConfig.username,
      name: AppConfig.username
    } as GithubUser);
  }

  reset(): void {
    // Function currently exists to prevent errors when logout is clicked and
    // services reset.
  }
}

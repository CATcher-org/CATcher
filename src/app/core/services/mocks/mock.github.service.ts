import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { AppConfig } from '../../../../environments/environment.test';
import { GithubUser } from '../../models/github-user.model';
import { GithubIssue } from '../../models/github/github-issue.model';
import { GithubLabel } from '../../models/github/github-label.model';
import { GithubRelease } from '../../models/github/github.release';
import { Label } from '../../models/label.model';
import { Phase } from '../../models/phase.model';
import { Profile } from '../../models/profile.model';
import { SessionData } from '../../models/session.model';
import { LabelService } from '../label.service';
import { generateIssueWithRandomData } from '../../../../../tests/constants/githubissue.constants';
import RestGithubIssueFilter from '../../models/github/github-issue-filter.model';
import { IssueState } from '../../../../../graphql/graphql-types';
import { GITHUB_LABEL_TEAM_LABEL, GITHUB_LABEL_TUTORIAL_LABEL } from '../../../../../tests/constants/githublabel.constants';
import { GithubComment } from '../../models/github/github-comment.model';
import { uuid } from '../../../../../src/app/shared/lib/uuid';
import { IssueComment } from '../../models/comment.model';

const { Octokit } = require('@octokit/rest');

let ORG_NAME = '';
let MOD_ORG = '';
let REPO = '';
let DATA_REPO = '';
let octokit = new Octokit();

@Injectable()
export class MockGithubService {
  numIssuesCreated: number; // tracks the number of GithubIssues created by this mock service
  githubIssues: { [id: number]: GithubIssue }; // stores the issues that are supposedly in the repository
  githubIssueComments: { [id: number]: GithubComment }; // stores references to the comments that can be tracked with id

  constructor() {
    this.numIssuesCreated = 0;
    this.githubIssues = {};
    this.initializeRandomData();
  }

  private initializeRandomData() {
    const NUM_ISSUES = 10;

    for (let i = 0; i < NUM_ISSUES; i++) {
      const githubIssue = generateIssueWithRandomData();
      // override the number with a custom number to keep the tally
      githubIssue.number = this.numIssuesCreated;
      githubIssue.id = this.numIssuesCreated.toString();
      this.numIssuesCreated++;
      this.githubIssues[githubIssue.number] = githubIssue;
    }
  }

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
   * Creates a GithubIssue with the specified title / description / labels.
   */
  createIssue(title: string, description: string, labels: string[]): Observable<GithubIssue> {
    const githubLabels: GithubLabel[] = labels.map((labelString) => new GithubLabel({ name: labelString }));
    githubLabels.push(new GithubLabel(GITHUB_LABEL_TUTORIAL_LABEL), new GithubLabel(GITHUB_LABEL_TEAM_LABEL));

    const githubIssue = generateIssueWithRandomData();

    githubIssue.number = this.numIssuesCreated;
    githubIssue.state = IssueState.Open;
    githubIssue.title = title;
    githubIssue.body = description;
    githubIssue.labels = githubLabels;

    this.numIssuesCreated++;

    this.githubIssues[githubIssue.number] = githubIssue;

    return of(githubIssue);
  }

  createIssueComment(issueId: number, description: string): Observable<GithubComment> {
    const githubIssue = this.githubIssues[issueId];
    const githubComment = {
      body: description,
      created_at: new Date().toISOString(),
      id: uuid(),
      issue_url: githubIssue.url,
      updated_at: new Date().toISOString(),
      url: githubIssue.url,
      user: { ...githubIssue.user, id: 0 }
    };
    githubIssue.comments.push(githubComment);
    githubComment[githubComment.id] = githubComment;

    return of(githubComment);
  }

  updateIssue(id: number, title: string, description: string, labels: string[], assignees?: string[]): Observable<GithubIssue> {
    const githubIssue = this.githubIssues[id];
    githubIssue.title = title;
    githubIssue.body = description;
    githubIssue.labels = labels.map((labelString) => new GithubLabel({ name: labelString }));

    if (assignees) {
      githubIssue.assignees = assignees.map((assignee) => {
        return {
          id: 0,
          login: assignee,
          url: ''
        };
      });
    }

    return of(githubIssue);
  }

  updateIssueComment(issueComment: IssueComment): Observable<GithubComment> {
    const githubComment = this.githubIssueComments[issueComment.id];

    githubComment.body = issueComment.description;

    return of(githubComment);
  }

  /**
   * Creates a fabricated object that matches the structure of that
   * returned by the Github API which always results in the required labels
   * being present.
   */
  fetchAllLabels(): Observable<Array<{}>> {
    return of(
      LabelService.getRequiredLabelsAsArray(true).map((label: Label) => {
        return {
          name: label.labelCategory ? `${label.labelCategory}.${label.labelValue}` : `${label.labelValue}`,
          color: `${label.labelColor}`
        };
      })
    );
  }

  /**
   * Fetches an array of filtered GitHubIssues stored in the service. (Currently does not apply any filter)
   *
   * If there have been no modifications, return nothing
   *
   * @param issuesFilter - The issue filter.
   * @returns An observable array of filtered GithubIssues
   */
  fetchIssuesGraphql(issuesFilter: RestGithubIssueFilter): Observable<Array<GithubIssue>> {
    return of(Object.values(this.githubIssues));
  }

  fetchIssuesGraphqlByTeam(tutorial: string, team: string, issuesFilter: RestGithubIssueFilter): Observable<Array<GithubIssue>> {
    return this.fetchIssuesGraphql(issuesFilter);
  }

  /**
   * Fetches information about an issue stored in the service.
   *
   * If there have been no modifications, return nothing
   *
   * @param id - The issue id.
   * @returns Observable<GithubIssue> that represents the response object.
   */
  fetchIssueGraphql(id: number): Observable<GithubIssue> {
    return of(this.githubIssues[id]);
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
      data:
        'role,name,team\n' +
        `${AppConfig.role},${AppConfig.username},${AppConfig.team}\n` +
        `${AppConfig.role},CATcher-Tester-Friend,${AppConfig.team}\n`
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
   * @return Observable<SessionData> representing session information.
   */
  fetchSettingsFile(): Observable<SessionData> {
    return of({
      openPhases: [
        Phase.phaseBugReporting,
        Phase.phaseBugTrimming,
        Phase.phaseTeamResponse,
        Phase.phaseTesterResponse,
        Phase.phaseModeration
      ],
      [Phase.phaseBugReporting]: 'undefined',
      [Phase.phaseBugTrimming]: 'undefined',
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

  getProfilesData(): Promise<Response> {
    const profiles = [
      <Profile>{
        profileName: 'CATcher',
        repoName: 'CATcher-org/public_data'
      }
    ];

    const mockResponse: Response = { json: () => Promise.resolve({ profiles: profiles }) } as Response;
    return Promise.resolve(mockResponse);
  }

  /**
   * Sets the issue state to closed
   * @param id Number of the issue to be closed
   * @returns The closed issue as an observable
   */
  closeIssue(id: number): Observable<GithubIssue> {
    const githubIssue = this.githubIssues[id];
    this.githubIssues[id].state = IssueState.Closed;
    return of(githubIssue);
  }

  /**
   * Sets the issue state to open
   * @param id Number of the issue to be opened
   * @returns The reopened issue as an observable
   */
  reopenIssue(id: number): Observable<GithubIssue> {
    const githubIssue = this.githubIssues[id];
    this.githubIssues[id].state = IssueState.Open;
    return of(githubIssue);
  }

  reset(): void {
    // Function currently exists to prevent errors when logout is clicked and
    // services reset.
  }
}

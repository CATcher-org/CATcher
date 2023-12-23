import { HttpErrorResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { ApolloQueryResult } from '@apollo/client/core';
import { Apollo, QueryRef } from 'apollo-angular';
import { DocumentNode } from 'graphql';
import { forkJoin, from, Observable, of, throwError } from 'rxjs';
import { catchError, filter, map, mergeMap, throwIfEmpty } from 'rxjs/operators';
import {
  FetchIssue,
  FetchIssueQuery,
  FetchIssues,
  FetchIssuesByTeam,
  FetchIssuesByTeamQuery,
  FetchIssuesQuery,
  FetchLabels,
  FetchLabelsQuery
} from '../../../../graphql/graphql-types';
import { AppConfig } from '../../../environments/environment';
import { getNumberOfPages } from '../../shared/lib/github-paginator-parser';
import { IssueComment } from '../models/comment.model';
import { GithubUser } from '../models/github-user.model';
import { IssueLastModifiedManagerModel } from '../models/github/cache-manager/issue-last-modified-manager.model';
import { IssuesCacheManager } from '../models/github/cache-manager/issues-cache-manager.model';
import { GithubComment } from '../models/github/github-comment.model';
import { GithubGraphqlIssue } from '../models/github/github-graphql.issue';
import RestGithubIssueFilter from '../models/github/github-issue-filter.model';
import { GithubIssue } from '../models/github/github-issue.model';
import { GithubLabel } from '../models/github/github-label.model';
import { GithubResponse } from '../models/github/github-response.model';
import { GithubRelease } from '../models/github/github.release';
import { SessionData } from '../models/session.model';
import { ERRORCODE_NOT_FOUND, ErrorHandlingService } from './error-handling.service';
import { LoggingService } from './logging.service';

const { Octokit } = require('@octokit/rest');
const CATCHER_ORG = 'CATcher-org';
const CATCHER_REPO = 'CATcher';
const UNABLE_TO_OPEN_IN_BROWSER = 'Unable to open this issue in Browser';
function getSettingsUrl(org: string, repoName: string): string {
  return `https://raw.githubusercontent.com/${org}/${repoName}/master/settings.json`;
}

let ORG_NAME = '';
let MOD_ORG = '';
let REPO = '';
let DATA_REPO = '';
const MAX_ITEMS_PER_PAGE = 100;

let octokit = new Octokit();

@Injectable({
  providedIn: 'root'
})

/**
 * Responsible for communicating with GitHub to create, update, read and delete
 * features related to Github using GitHub API Requests.
 * For example, issues, issue labels and repositories.
 */
export class GithubService {
  private static readonly IF_NONE_MATCH_EMPTY = { 'If-None-Match': '' };

  private issuesCacheManager = new IssuesCacheManager();
  private issuesLastModifiedManager = new IssueLastModifiedManagerModel();
  private issueQueryRefs = new Map<Number, QueryRef<FetchIssueQuery>>();

  constructor(private errorHandlingService: ErrorHandlingService, private apollo: Apollo, private logger: LoggingService) {}

  storeOAuthAccessToken(accessToken: string) {
    octokit = new Octokit({
      auth() {
        return `Token ${accessToken}`;
      },
      log: {
        debug: (message, ...otherInfo) => this.logger.debug('GithubService: ' + message, ...otherInfo),
        // Do not log info for HTTP response 304 due to repeated polling
        info: (message, ...otherInfo) =>
          /304 in \d+ms$/.test(message) ? undefined : this.logger.info('GithubService: ' + message, ...otherInfo),
        warn: (message, ...otherInfo) => this.logger.warn('GithubService: ' + message, ...otherInfo),
        error: (message, ...otherInfo) => this.logger.error('GithubService: ' + message, ...otherInfo)
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
   * Fetches an array of filtered GitHubIssues using GraphQL query for a given team.
   *
   * @param tutorial - The tutorial that the team belongs to.
   * @param team - The team's designated name.
   * @param issuesFilter - The issue filter.
   * @returns An observable array of filtered GithubIssues
   */
  fetchIssuesGraphqlByTeam(tutorial: string, team: string, issuesFilter: RestGithubIssueFilter): Observable<Array<GithubIssue>> {
    const graphqlFilter = issuesFilter.convertToGraphqlFilter();
    return this.toFetchIssues(issuesFilter).pipe(
      filter((toFetch) => toFetch),
      mergeMap(() => {
        return this.fetchGraphqlList<FetchIssuesByTeamQuery, GithubGraphqlIssue>(
          FetchIssuesByTeam,
          {
            owner: ORG_NAME,
            name: REPO,
            filter: {
              ...graphqlFilter,
              labels: [...(graphqlFilter.labels ? graphqlFilter.labels : []), team]
            },
            tutorial
          },
          (result) => result.data.repository.label.issues.edges,
          GithubGraphqlIssue
        );
      })
    );
  }

  /**
   * Fetches an array of filtered GitHubIssues using GraphQL query.
   * @param issuesFilter - The issue filter.
   * @returns An observable array of filtered GithubIssues
   */
  fetchIssuesGraphql(issuesFilter: RestGithubIssueFilter): Observable<Array<GithubIssue>> {
    const graphqlFilter = issuesFilter.convertToGraphqlFilter();
    return this.toFetchIssues(issuesFilter).pipe(
      filter((toFetch) => toFetch),
      mergeMap(() => {
        return this.fetchGraphqlList<FetchIssuesQuery, GithubGraphqlIssue>(
          FetchIssues,
          { owner: ORG_NAME, name: REPO, filter: graphqlFilter },
          (result) => result.data.repository.issues.edges,
          GithubGraphqlIssue
        );
      })
    );
  }

  /**
   * Checks if there are pages of filtered issues that are not cached in the cache model,
   * and updates the model to cache these new pages.
   * @param filter - The issue filter.
   * @returns Observable<boolean> that returns true if there are pages that do not exist in the cache model.
   */
  private toFetchIssues(filter: RestGithubIssueFilter): Observable<boolean> {
    let responseInFirstPage: GithubResponse<GithubIssue[]>;
    return this.getIssuesAPICall(filter, 1).pipe(
      map((response: GithubResponse<GithubIssue[]>) => {
        responseInFirstPage = response;
        return getNumberOfPages(response);
      }),
      mergeMap((numOfPages: number) => {
        const apiCalls: Observable<GithubResponse<GithubIssue[]>>[] = [];
        for (let i = 2; i <= numOfPages; i++) {
          apiCalls.push(this.getIssuesAPICall(filter, i));
        }
        return apiCalls.length === 0 ? of([]) : forkJoin(apiCalls);
      }),
      map((resultArray: GithubResponse<GithubIssue[]>[]) => {
        const responses = [responseInFirstPage, ...resultArray];
        const isCached = responses.reduce((result, response) => {
          return result && response.isCached;
        }, true);
        responses.forEach((resp, index) => this.issuesCacheManager.set(index + 1, resp));
        return !isCached;
      })
    );
  }

  /**
   * Checks if the specified repository exists.
   * @param owner - Owner of Specified Repository.
   * @param repo - Name of Repository.
   */
  isRepositoryPresent(owner: string, repo: string): Observable<boolean> {
    return from(octokit.repos.get({ owner: owner, repo: repo, headers: GithubService.IF_NONE_MATCH_EMPTY })).pipe(
      map((rawData: { status: number }) => {
        return rawData.status !== ERRORCODE_NOT_FOUND;
      }),
      catchError((err) => {
        return of(false);
      }),
      catchError((err) => throwError('Failed to fetch repo data.'))
    );
  }

  /**
   * Creates a repository in for the authenticated user location.
   * @param name - Name of Repo to create.
   * @return Observable<boolean> - That returns true if the repository has been successfully
   *                                created.
   */
  createRepository(name: string): void {
    octokit.repos.createForAuthenticatedUser({ name: name });
  }

  /**
   * Fetches information about an issue using GraphQL.
   *
   * If the issue is not modified, return a `304 - Not Modified` response.
   *
   * @param id - The issue id.
   * @returns Observable<GithubGraphqlIssue> that represents the response object.
   */
  fetchIssueGraphql(id: number): Observable<GithubGraphqlIssue> {
    if (this.issueQueryRefs.get(id) === undefined) {
      const newQueryRef = this.apollo.watchQuery<FetchIssueQuery>({
        query: FetchIssue,
        variables: {
          owner: ORG_NAME,
          name: REPO,
          issueId: id
        }
      });
      this.issueQueryRefs.set(id, newQueryRef);
    }

    const queryRef = this.issueQueryRefs.get(id);
    return this.toFetchIssue(id).pipe(
      filter((toFetch) => toFetch),
      mergeMap(() => from(queryRef.refetch())),
      map((value: ApolloQueryResult<FetchIssueQuery>) => {
        return new GithubGraphqlIssue(value.data.repository.issue);
      }),
      throwIfEmpty(() => new HttpErrorResponse({ status: 304 }))
    );
  }

  /**
   * Checks if the issue has been modified since the last query, and
   * updates the model to reflect the last modified time.
   *
   * @param id - The issue id.
   * @returns Observable<boolean> that returns true if the issue has been modified.
   */
  toFetchIssue(id: number): Observable<boolean> {
    return from(
      octokit.issues.get({
        owner: ORG_NAME,
        repo: REPO,
        issue_number: id,
        headers: { 'If-Modified-Since': this.issuesLastModifiedManager.get(id) }
      })
    ).pipe(
      map((response: GithubResponse<GithubIssue>) => {
        this.issuesLastModifiedManager.set(id, response.headers['last-modified']);
        return true;
      }),
      catchError((err) => throwError('Failed to fetch issue.'))
    );
  }

  /**
   * Fetches all labels in the current repository.
   */
  fetchAllLabels(): Observable<Array<GithubLabel>> {
    const githubLabels = this.fetchGraphqlList<FetchLabelsQuery, GithubLabel>(
      FetchLabels,
      { owner: ORG_NAME, name: REPO },
      (result) => result.data.repository.labels.edges,
      GithubLabel
    );

    return githubLabels.pipe(catchError((err) => throwError('Failed to fetch labels.')));
  }

  /**
   * Creates a label in the current repository.
   * @param formattedLabelName - name of new label.
   * @param labelColor - colour of new label.
   */
  createLabel(formattedLabelName: string, labelColor: string): void {
    octokit.issues.createLabel({ owner: ORG_NAME, repo: REPO, name: formattedLabelName, color: labelColor });
  }

  /**
   * Updates a label's information in the current repository.
   * @param labelName - name of existing label
   * @param labelColor - new color to be assigned to existing label.
   */
  updateLabel(labelName: string, labelColor: string): void {
    octokit.issues.updateLabel({ owner: ORG_NAME, repo: REPO, name: labelName, current_name: labelName, color: labelColor });
  }

  closeIssue(id: number): Observable<GithubIssue> {
    return from(octokit.issues.update({ owner: ORG_NAME, repo: REPO, issue_number: id, state: 'closed' })).pipe(
      map((response: GithubResponse<GithubIssue>) => {
        this.issuesLastModifiedManager.set(id, response.headers['last-modified']);
        return new GithubIssue(response.data);
      })
    );
  }

  reopenIssue(id: number): Observable<GithubIssue> {
    return from(octokit.issues.update({ owner: ORG_NAME, repo: REPO, issue_number: id, state: 'open' })).pipe(
      map((response: GithubResponse<GithubIssue>) => {
        this.issuesLastModifiedManager.set(id, response.headers['last-modified']);
        return new GithubIssue(response.data);
      })
    );
  }

  createIssue(title: string, description: string, labels: string[]): Observable<GithubIssue> {
    return from(octokit.issues.create({ owner: ORG_NAME, repo: REPO, title: title, body: description, labels: labels })).pipe(
      map((response: GithubResponse<GithubIssue>) => {
        return new GithubIssue(response.data);
      })
    );
  }

  createIssueComment(issueId: number, description: string): Observable<GithubComment> {
    return from(octokit.issues.createComment({ owner: ORG_NAME, repo: REPO, issue_number: issueId, body: description })).pipe(
      map((response: GithubResponse<GithubComment>) => {
        return response.data;
      })
    );
  }

  updateIssue(id: number, title: string, description: string, labels: string[], assignees?: string[]): Observable<GithubIssue> {
    return from(
      octokit.issues.update({
        owner: ORG_NAME,
        repo: REPO,
        issue_number: id,
        title: title,
        body: description,
        labels: labels,
        assignees: assignees
      })
    ).pipe(
      map((response: GithubResponse<GithubIssue>) => {
        this.issuesLastModifiedManager.set(id, response.headers['last-modified']);
        return new GithubIssue(response.data);
      }),
      catchError((err) => {
        return throwError(err);
      })
    );
  }

  updateIssueComment(issueComment: IssueComment): Observable<GithubComment> {
    return from(
      octokit.issues.updateComment({ owner: ORG_NAME, repo: REPO, comment_id: issueComment.id, body: issueComment.description })
    ).pipe(
      map((response: GithubResponse<GithubComment>) => {
        return response.data;
      })
    );
  }

  uploadFile(filename: string, base64String: string): Observable<any> {
    return from(
      octokit.repos.createOrUpdateFile({
        owner: ORG_NAME,
        repo: REPO,
        path: `files/${filename}`,
        message: 'upload file',
        content: base64String
      })
    );
  }

  fetchEventsForRepo(): Observable<any[]> {
    return from(octokit.issues.listEventsForRepo({ owner: ORG_NAME, repo: REPO, headers: GithubService.IF_NONE_MATCH_EMPTY })).pipe(
      map((response) => {
        return response['data'];
      }),
      catchError((err) => throwError('Failed to fetch events for repo.'))
    );
  }

  fetchDataFile(): Observable<{}> {
    return from(
      octokit.repos.getContents({ owner: MOD_ORG, repo: DATA_REPO, path: 'data.csv', headers: GithubService.IF_NONE_MATCH_EMPTY })
    ).pipe(
      map((rawData) => {
        return { data: atob(rawData['data']['content']) };
      }),
      catchError((err) => throwError('Failed to fetch data file.'))
    );
  }

  fetchLatestRelease(): Observable<GithubRelease> {
    return from(
      octokit.repos.getLatestRelease({ owner: CATCHER_ORG, repo: CATCHER_REPO, headers: GithubService.IF_NONE_MATCH_EMPTY })
    ).pipe(
      map((res) => res['data']),
      catchError((err) => throwError('Failed to fetch latest release.'))
    );
  }

  private fetchSettingsFromRawUrl(): Observable<SessionData> {
    return from(fetch(getSettingsUrl(MOD_ORG, DATA_REPO))).pipe(
      mergeMap((res) => res.json()),
      catchError((err) => throwError('Failed to fetch settings file.'))
    );
  }

  /**
   * Fetches the data file that is regulates session information.
   * @return Observable<SessionData> representing session information.
   */
  fetchSettingsFile(): Observable<SessionData> {
    return from(
      octokit.repos.getContents({ owner: MOD_ORG, repo: DATA_REPO, path: 'settings.json', headers: GithubService.IF_NONE_MATCH_EMPTY })
    ).pipe(
      map((rawData) => JSON.parse(atob(rawData['data']['content']))),
      catchError((err) => {
        this.logger.error(
          'GithubService: Failed to fetch settings file via REST API. Trying to fetch using raw.githubusercontent.com: ',
          err
        );
        return this.fetchSettingsFromRawUrl();
      })
    );
  }

  fetchAuthenticatedUser(): Observable<GithubUser> {
    return from(octokit.users.getAuthenticated()).pipe(
      map((response) => {
        return response['data'];
      }),
      catchError((err) => throwError('Failed to fetch authenticated user.'))
    );
  }

  getRepoURL(): string {
    return ORG_NAME.concat('/').concat(REPO);
  }

  viewIssueInBrowser(id: number, event: Event) {
    if (id) {
      window.open('https://github.com/'.concat(this.getRepoURL()).concat('/issues/').concat(String(id)));
    } else {
      this.errorHandlingService.handleError(new Error(UNABLE_TO_OPEN_IN_BROWSER));
    }
    event.stopPropagation();
  }

  reset(): void {
    this.logger.info(`GithubService: Resetting issues cache`);
    this.issuesCacheManager.clear();
    this.issuesLastModifiedManager.clear();
    this.issueQueryRefs.clear();
  }

  getProfilesData(): Promise<Response> {
    return fetch(AppConfig.clientDataUrl);
  }
  
  deleteLabel(labelString: string): void {
    octokit.issues.deletLabel(labelString);
  }
  /**
   * Performs an API call to fetch a page of filtered issues with a given pageNumber.
   *
   * The request is sent with the ETag of the latest cached HTTP response.
   * If page requested has the same ETag, or the request results in an error,
   * then the cached page is returned instead.
   *
   * @param filter - The issue filter
   * @param pageNumber - The page to be fetched
   * @returns An observable representing the response containing a single page of filtered issues
   */
  private getIssuesAPICall(filter: RestGithubIssueFilter, pageNumber: number): Observable<GithubResponse<GithubIssue[]>> {
    const apiCall: Promise<GithubResponse<GithubIssue[]>> = octokit.issues.listForRepo({
      ...filter,
      owner: ORG_NAME,
      repo: REPO,
      sort: 'created',
      direction: 'desc',
      per_page: MAX_ITEMS_PER_PAGE,
      page: pageNumber,
      headers: { 'If-None-Match': this.issuesCacheManager.getEtagFor(pageNumber) }
    });
    const apiCall$ = from(apiCall);
    return apiCall$.pipe(
      catchError((err) => {
        return of(this.issuesCacheManager.get(pageNumber));
      })
    );
  }

  /**
   * Fetches a list of items using a GraphQL query that queries for paginated data.
   *
   * @param query - The GraphQL query that queries for paginated data.
   * @param variables - Additional variables for the GraphQL query.
   * @callback pluckEdges A function that returns a list of edges in a ApolloQueryResult.
   * @callback Model Constructor for the item model.
   * @returns A list of items from the query.
   */
  private fetchGraphqlList<T, M>(
    query: DocumentNode,
    variables: {},
    pluckEdges: (results: ApolloQueryResult<T>) => Array<any>,
    Model: new (data) => M
  ): Observable<Array<M>> {
    return from(this.withPagination<T>(pluckEdges)(query, variables)).pipe(
      map((results: Array<ApolloQueryResult<T>>) => {
        const issues = results.reduce((accumulated, current) => accumulated.concat(pluckEdges(current)), []);
        return issues.map((issue) => new Model(issue.node));
      }),
      throwIfEmpty(() => {
        return new HttpErrorResponse({ status: 304 });
      })
    );
  }

  /**
   * Returns an async function that will accept a GraphQL query that requests for paginated items.
   * Said function will recursively query for all subsequent pages until a page that has less than 100 items is found,
   * then return all queried pages in an array.
   *
   * @callback pluckEdges - A function that returns a list of edges in a ApolloQueryResult.
   * @returns an async function that accepts a GraphQL query for paginated data and any additional variables to that query
   */
  private withPagination<T>(pluckEdges: (results: ApolloQueryResult<T>) => Array<any>) {
    return async (query: DocumentNode, variables: { [key: string]: any } = {}): Promise<Array<ApolloQueryResult<T>>> => {
      const cursor = variables.cursor || null;
      const graphqlQuery = this.apollo.watchQuery<T>({ query, variables: { ...variables, cursor } });
      return graphqlQuery.refetch().then(async (results: ApolloQueryResult<T>) => {
        const intermediate = Array.isArray(results) ? results : [results];
        const edges = pluckEdges(results);
        const nextCursor = edges.length === 0 ? null : edges[edges.length - 1].cursor;

        if (edges.length < MAX_ITEMS_PER_PAGE || !nextCursor) {
          return intermediate;
        }
        const nextResults = await this.withPagination<T>(pluckEdges)(query, {
          ...variables,
          cursor: nextCursor
        });
        return intermediate.concat(nextResults);
      });
    };
  }
}

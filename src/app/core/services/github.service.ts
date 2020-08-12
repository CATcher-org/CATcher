import { Injectable } from '@angular/core';
import { catchError, filter, flatMap, map, throwIfEmpty } from 'rxjs/operators';
import { forkJoin, from, Observable, of, throwError } from 'rxjs';
import { githubPaginatorParser } from '../../shared/lib/github-paginator-parser';
import { IssueComment } from '../models/comment.model';
import { shell } from 'electron';
import { ERRORCODE_NOT_FOUND, ErrorHandlingService } from './error-handling.service';
import { GithubUser } from '../models/github-user.model';
import { GithubRestIssue } from '../models/github/github-issue.model';
import { GithubComment } from '../models/github/github-comment.model';
import { GithubRelease } from '../models/github/github.release';
import { GithubResponse } from '../models/github/github-response.model';
import { IssuesEtagManager } from '../models/github/cache-manager/issues-etag-manager.model';
import { IssueLastModifiedManagerModel } from '../models/github/cache-manager/issue-last-modified-manager.model';
import { CommentsEtagManager } from '../models/github/cache-manager/comments-etag-manager.model';
import { Apollo, QueryRef } from 'apollo-angular';
import {
  CloseIssue,
  CloseIssueMutation,
  FetchIssue,
  FetchIssueQuery,
} from '../../../../graphql/graphql-types';
import { GithubGraphQlIssueModel } from '../models/github/github-graphql-issue.model';
import { ApolloQueryResult } from 'apollo-client';

const Octokit = require('@octokit/rest');
const CATCHER_ORG = 'CATcher-org';
const CATCHER_REPO = 'CATcher';

let ORG_NAME = '';
let MOD_ORG = '';
let REPO = '';
let DATA_REPO = '';
let octokit = new Octokit();

@Injectable({
  providedIn: 'root',
})
export class GithubService {
  private issuesEtagManager = new IssuesEtagManager();
  private issuesLastModifiedManager = new IssueLastModifiedManagerModel();
  private commentsEtagManager = new CommentsEtagManager();
  private issueQueryRefs = new Map<Number, QueryRef<FetchIssueQuery>>();
  private issuesQueryRef;

  constructor(
    private errorHandlingService: ErrorHandlingService,
    private apollo: Apollo,
  ) {}

  storeCredentials(user: String, passw: String) {
    octokit = new Octokit({
      auth: {
        username: user,
        password: passw,
      },
    });
  }

  storeOAuthAccessToken(accessToken: string) {
    octokit = new Octokit({
      auth() {
        return `token ${accessToken}`;
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
   * Will return an Observable with array of all of the issues in Github including the paginated issues.
   */
  fetchIssues(filter?: {}): Observable<Array<GithubRestIssue>> {
    let responseInFirstPage: GithubResponse<GithubRestIssue[]>;
    return from(this.getIssueAPICall(filter, 1)).pipe(
      map((response: GithubResponse<GithubRestIssue[]>) => {
        responseInFirstPage = response;
        return this.getNumberOfPages(response);
      }),
      flatMap((numOfPages: number) => {
        const apiCalls: Observable<GithubResponse<GithubRestIssue[]>>[] = [];
        for (let i = 2; i <= numOfPages; i++) {
          apiCalls.push(from(this.getIssueAPICall(filter, i)));
        }
        return apiCalls.length === 0 ? of([]) : forkJoin(apiCalls);
      }),
      map((resultArray: GithubResponse<GithubRestIssue[]>[]) => {
        const responses = [responseInFirstPage, ...resultArray];
        const collatedData: GithubRestIssue[] = [];
        let pageNum = 1;
        for (const response of responses) {
          this.issuesEtagManager.set(pageNum, response.headers.etag);
          pageNum++;
          for (const issue of response.data) {
            collatedData.push(new GithubRestIssue({
              ...issue,
              id: issue['node_id'],
            }));
          }
        }
        return collatedData;
      })
    );
  }

  fetchIssueComments(issueId: number): Observable<Array<GithubComment>> {
    let responseInFirstPage: GithubResponse<GithubComment[]>;
    return from(this.getCommentsAPICall(issueId, 1)).pipe(
      map((response: GithubResponse<GithubComment[]>) => {
        responseInFirstPage = response;
        return this.getNumberOfPages(response);
      }),
      flatMap((numOfPages: number) => {
        const apiCalls: Observable<GithubResponse<GithubComment[]>>[] = [];
        for (let i = 2; i <= numOfPages; i++) {
          apiCalls.push(from(this.getCommentsAPICall(issueId, i)));
        }
        return apiCalls.length === 0 ? of([]) : forkJoin(apiCalls);
      }),
      map((resultArray: GithubResponse<GithubComment[]>[]) => {
        const responses = [responseInFirstPage, ...resultArray];
        const collatedData: GithubComment[] = [];
        let pageNum = 1;
        for (const response of responses) {
          this.commentsEtagManager.set(issueId, pageNum, response.headers.etag);
          pageNum++;
          for (const comment of response.data) {
            collatedData.push(comment);
          }
        }
        return collatedData;
      })
    );
  }

  /**
   * Checks if the specified repository exists.
   * @param owner - Owner of Specified Repository.
   * @param repo - Name of Repository.
   */
  isRepositoryPresent(owner: string, repo: string): Observable<boolean> {
    return from(octokit.repos.get({owner: owner, repo: repo})).pipe(
      map((rawData: {status: number}) => {
        return rawData.status !== ERRORCODE_NOT_FOUND;
      }),
      catchError(err => {
        return of(false);
      })
    );
  }

  /**
   * Creates a repository in for the authenticated user location.
   * @param name - Name of Repo to create.
   * @return Observable<boolean> - That returns true if the repository has been successfully
   *                                created.
   */
  createRepository(name: string): void {
    octokit.repos.createForAuthenticatedUser({name: name});
  }

  fetchIssueGraphql(id: number): Observable<GithubGraphQlIssueModel> {
    if (this.issueQueryRefs.get(id) === undefined) {
      const newQueryRef = this.apollo.watchQuery<FetchIssueQuery>({
        query: FetchIssue,
        variables: {
          owner: ORG_NAME,
          name: REPO,
          issueId: id,
        }
      });
      this.issueQueryRefs.set(id, newQueryRef);
    }

    const queryRef = this.issueQueryRefs.get(id);
    return this.toFetchIssue(id).pipe(
      filter(toFetch => toFetch),
      flatMap(() => from(queryRef.refetch())),
      map((value: ApolloQueryResult<FetchIssueQuery>) => {
        return new GithubGraphQlIssueModel(value.data.repository.issue);
      }),
      throwIfEmpty(() => new Error(`Error in fetching issue ${id}`))
    );
  }

  toFetchIssue(id: number): Observable<boolean> {
    return from(octokit.issues.get({owner: ORG_NAME, repo: REPO, issue_number: id,
      headers: { 'If-Modified-Since': this.issuesLastModifiedManager.get(id) }})).pipe(
      map((response: GithubResponse<GithubRestIssue>) => {
        this.issuesLastModifiedManager.set(id, response.headers['last-modified']);
        return true;
      }),
      catchError(() => of(false))
    );
  }

  fetchAllLabels(): Observable<Array<{}>> {
    return from(octokit.issues.listLabelsForRepo({owner: ORG_NAME, repo: REPO})).pipe(
      map(response => {
        return response['data'];
      })
    );
  }

  /**
   * Creates a label in the current repository.
   * @param formattedLabelName - name of new label.
   * @param labelColor - colour of new label.
   */
  createLabel(formattedLabelName: string, labelColor: string): void {
    octokit.issues.createLabel({owner: ORG_NAME, repo: REPO, name: formattedLabelName, color: labelColor});
  }

  /**
   * Updates a label's information in the current repository.
   * @param labelName - name of existing label
   * @param labelColor - new color to be assigned to existing label.
   */
  updateLabel(labelName: string, labelColor: string): void {
    octokit.issues.updateLabel({owner: ORG_NAME, repo: REPO, name: labelName, current_name: labelName, color: labelColor});
  }

  closeIssueGraphql(id: string): Observable<GithubRestIssue> {
    return this.apollo.mutate<CloseIssueMutation>({
      mutation: CloseIssue,
      variables: {
        issueId: id,
      }
    }).pipe(
      map(value => {
        return new GithubGraphQlIssueModel(value.data.closeIssue.issue);
      })
    );
  }

  closeIssue(id: number): Observable<GithubRestIssue> {
    return from(octokit.issues.update({owner: ORG_NAME, repo: REPO, issue_number: id, state: 'closed'})).pipe(
      map((response: GithubResponse<GithubRestIssue>) => {
        this.issuesLastModifiedManager.set(id, response.headers['last-modified']);
        return new GithubRestIssue(response.data);
      })
    );
  }

  createIssue(title: string, description: string, labels: string[]): Observable<GithubRestIssue> {
    return from(octokit.issues.create({owner: ORG_NAME, repo: REPO, title: title, body: description, labels: labels})).pipe(
      map((response: GithubResponse<GithubRestIssue>) => {
        return new GithubRestIssue(response.data);
      })
    );
  }

  createIssueComment(issueId: number, description: string): Observable<GithubComment> {
    return from(octokit.issues.createComment({owner: ORG_NAME, repo: REPO, issue_number: issueId,
      body: description})).pipe(
      map((response: GithubResponse<GithubComment>) => {
        return response.data;
      })
    );
  }

  updateIssue(id: number, title: string, description: string, labels: string[], assignees?: string[]): Observable<GithubRestIssue> {
    return from(octokit.issues.update({owner: ORG_NAME, repo: REPO, issue_number: id, title: title, body: description, labels: labels,
      assignees: assignees})).pipe(
      map((response: GithubResponse<GithubRestIssue>) => {
        this.issuesLastModifiedManager.set(id, response.headers['last-modified']);
        return new GithubRestIssue(response.data);
      }),
      catchError(err => {
        return throwError(err);
      })
    );
  }

  updateIssueComment(issueComment: IssueComment): Observable<GithubComment> {
    return from(octokit.issues.updateComment({owner: ORG_NAME, repo: REPO, comment_id: issueComment.id,
      body: issueComment.description})).pipe(
      map((response: GithubResponse<GithubComment>) => {
        return response.data;
      })
    );
  }

  uploadFile(filename: string, base64String: string): Observable<any> {
    return from(octokit.repos.createOrUpdateFile({owner: ORG_NAME, repo: REPO, path: `files/${filename}`,
      message: 'upload file', content: base64String}));
  }

  fetchEventsForRepo(): Observable<any[]> {
    return from(octokit.issues.listEventsForRepo({owner: ORG_NAME, repo: REPO })).pipe(
      map(response => {
        return response['data'];
      })
    );
  }

  fetchDataFile(): Observable<{}> {
    return from(octokit.repos.getContents({owner: MOD_ORG, repo: DATA_REPO, path: 'data.csv'})).pipe(
      map(rawData => {
          return {data: atob(rawData['data']['content'])};
        })
    );
  }

  fetchLatestRelease(): Observable<GithubRelease> {
    return from(octokit.repos.getLatestRelease({owner: CATCHER_ORG, repo: CATCHER_REPO})).pipe(map(res => res['data']));
  }

  /**
   * Fetches the data file that is regulates session information.
   * @return Observable<{}> representing session information.
   */
  fetchSettingsFile(): Observable<{}> {
    return from(octokit.repos.getContents({owner: MOD_ORG, repo: DATA_REPO, path: 'settings.json'}))
        .pipe(map(rawData => JSON.parse(atob(rawData['data']['content']))));
  }

  fetchAuthenticatedUser(): Observable<GithubUser> {
    return from(octokit.users.getAuthenticated())
      .pipe(map(response => {
        return response['data'];
      }));
  }

  getRepoURL(): string {
    return ORG_NAME.concat('/').concat(REPO);
  }

  viewIssueInBrowser(id: number) {
    if (id) {
      shell.openExternal('https://github.com/'.concat(this.getRepoURL()).concat('/issues/').concat(String(id)));
    } else {
      this.errorHandlingService.handleError('Unable to open this issue in Browser');
    }
    event.stopPropagation();
  }

  reset(): void {
    this.issuesEtagManager.clear();
    this.issuesLastModifiedManager.clear();
    this.commentsEtagManager.clear();
  }

  /**
   * Get the number of paginated pages of issues in Github.
   * @param response
   */
  private getNumberOfPages<T>(response: GithubResponse<T>): number {
    let numberOfPages = 1;
    if (response.headers.link) {
      const paginatedData = githubPaginatorParser(response.headers.link);
      numberOfPages = +paginatedData['last'] || 1;
    }
    return numberOfPages;
  }

  private getIssueAPICall(filter: {}, pageNumber: number): Promise<GithubResponse<GithubRestIssue[]>> {
    return octokit.issues.listForRepo({...filter, owner: ORG_NAME, repo: REPO, sort: 'created',
      direction: 'desc', per_page: 100, page: pageNumber, headers: { 'If-None-Match': this.issuesEtagManager.get(pageNumber) }});
  }

  private getCommentsAPICall(issueId: number, pageNumber: number): Promise<GithubResponse<GithubComment[]>> {
    return octokit.issues.listComments({owner: ORG_NAME, repo: REPO, issue_number: issueId, page: pageNumber, per_page: 100,
      headers: { 'If-None-Match': this.commentsEtagManager.get(issueId, pageNumber)}});
  }
}

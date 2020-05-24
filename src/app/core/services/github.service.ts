import { Injectable } from '@angular/core';
import { catchError, flatMap, map } from 'rxjs/operators';
import { forkJoin, from, Observable, of, throwError } from 'rxjs';
import { githubPaginatorParser } from '../../shared/lib/github-paginator-parser';
import { IssueComment } from '../models/comment.model';
import { shell } from 'electron';
import { ERRORCODE_NOT_FOUND, ErrorHandlingService } from './error-handling.service';
import { GithubUser } from '../models/github-user.model';
import { GithubIssue } from '../models/github/github-issue.model';
import { GithubComment } from '../models/github/github-comment.model';
import { GithubRelease } from '../models/github/github.release';
import { GithubResponse } from '../models/github/github-response.model';
import { IssuesCacheManager } from '../models/github/cache-manager/issues-cache-manager.model';
import { IssueLastModifiedManagerModel } from '../models/github/cache-manager/issue-last-modified-manager.model';
import { CommentsCacheManager } from '../models/github/cache-manager/comments-cache-manager.model';
import { HttpErrorResponse } from '@angular/common/http';

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
  private issuesCacheManager = new IssuesCacheManager();
  private issuesLastModifiedManager = new IssueLastModifiedManagerModel();
  private commentsCacheManager = new CommentsCacheManager();

  constructor(private errorHandlingService: ErrorHandlingService) {}

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
  fetchIssues(filter?: {}): Observable<Array<GithubIssue>> {
    return this.makeMultipleRequestsToFetchIssues(filter).pipe(
      map((responses: GithubResponse<GithubIssue[]>[]) => {
        const collatedData: GithubIssue[] = [];
        let pageNum = 1;
        for (const response of responses) {
          this.issuesCacheManager.set(pageNum, response);
          pageNum++;
          for (const issue of response.data) {
            collatedData.push(new GithubIssue(issue));
          }
        }
        return collatedData;
      })
    );
  }

  /**
   * Will make multiple request to Github as per necessary so as to fetch all the issues in from different pages.
   * @param filter
   * @returns - The different responses that Github responded with.
   */
  private makeMultipleRequestsToFetchIssues(filter?: {}): Observable<GithubResponse<GithubIssue[]>[]> {
    let responseInFirstPage: GithubResponse<GithubIssue[]>;
    return this.getIssuesAPICall(filter, 1).pipe(
      map((response: GithubResponse<GithubIssue[]>) => {
        responseInFirstPage = response;
        return this.getNumberOfPages(response);
      }),
      flatMap((numOfPages: number) => {
        const apiCalls: Observable<GithubResponse<GithubIssue[]>>[] = [];
        for (let i = 2; i <= numOfPages; i++) {
          apiCalls.push(this.getIssuesAPICall(filter, i));
        }
        return apiCalls.length === 0 ? of([]) : forkJoin(apiCalls);
      }),
      flatMap((resultArray: GithubResponse<GithubIssue[]>[]) => {
        const responses = [responseInFirstPage, ...resultArray];
        const isCached = responses.reduce((result, response) => {
          return result && response.isCached;
        }, true);
        if (isCached) {
          return throwError(new HttpErrorResponse({status: 304}));
        } else {
          return of(responses);
        }
      }));
  }

  /**
   * Will make multiple request to Github as per necessary so as to fetch all the comments in from different pages.
   * @param issueId
   * @returns - The different responses that Github responded with.
   */
  fetchIssueComments(issueId: number): Observable<Array<GithubComment>> {
    return this.makeMultipleRequestsToFetchComments(issueId).pipe(
      map((responses: GithubResponse<GithubComment[]>[]) => {
        const collatedData: GithubComment[] = [];
        let pageNum = 1;
        for (const response of responses) {
          this.commentsCacheManager.set(issueId, pageNum, response);
          pageNum++;
          for (const comment of response.data) {
            collatedData.push(comment);
          }
        }
        return collatedData;
      })
    );
  }

  private makeMultipleRequestsToFetchComments(issueId: number) {
    let responseInFirstPage: GithubResponse<GithubComment[]>;
    return this.getCommentsAPICall(issueId, 1).pipe(
      map((response: GithubResponse<GithubComment[]>) => {
        responseInFirstPage = response;
        return this.getNumberOfPages(response);
      }),
      flatMap((numOfPages: number) => {
        const apiCalls: Observable<GithubResponse<GithubComment[]>>[] = [];
        for (let i = 2; i <= numOfPages; i++) {
          apiCalls.push(this.getCommentsAPICall(issueId, i));
        }
        return apiCalls.length === 0 ? of([]) : forkJoin(apiCalls);
      }),
      flatMap((resultArray: GithubResponse<GithubComment[]>[]) => {
        const responses = [responseInFirstPage, ...resultArray];
        const isCached = responses.reduce((result, response) => {
          return result && response.isCached;
        }, true);
        if (isCached) {
          return throwError(new HttpErrorResponse({status: 304}));
        } else {
          return of(responses);
        }
      }));
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

  fetchIssue(id: number): Observable<GithubIssue> {
    return from(octokit.issues.get({owner: ORG_NAME, repo: REPO, issue_number: id,
      headers: { 'If-Modified-Since': this.issuesLastModifiedManager.get(id) }})).pipe(
        map((response: GithubResponse<GithubIssue>) => {
          this.issuesLastModifiedManager.set(id, response.headers['last-modified']);
          return new GithubIssue(response.data);
        })
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

  closeIssue(id: number): Observable<GithubIssue> {
    return from(octokit.issues.update({owner: ORG_NAME, repo: REPO, issue_number: id, state: 'closed'})).pipe(
      map((response: GithubResponse<GithubIssue>) => {
        this.issuesLastModifiedManager.set(id, response.headers['last-modified']);
        return new GithubIssue(response.data);
      })
    );
  }

  createIssue(title: string, description: string, labels: string[]): Observable<GithubIssue> {
    return from(octokit.issues.create({owner: ORG_NAME, repo: REPO, title: title, body: description, labels: labels})).pipe(
      map((response: GithubResponse<GithubIssue>) => {
        return new GithubIssue(response.data);
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

  updateIssue(id: number, title: string, description: string, labels: string[], assignees?: string[]): Observable<GithubIssue> {
    return from(octokit.issues.update({owner: ORG_NAME, repo: REPO, issue_number: id, title: title, body: description, labels: labels,
      assignees: assignees})).pipe(
      map((response: GithubResponse<GithubIssue>) => {
        this.issuesLastModifiedManager.set(id, response.headers['last-modified']);
        return new GithubIssue(response.data);
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
    this.issuesCacheManager.clear();
    this.issuesLastModifiedManager.clear();
    this.commentsCacheManager.clear();
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

  private getIssuesAPICall(filter: {}, pageNumber: number): Observable<GithubResponse<GithubIssue[]>> {
    const apiCall: Promise<GithubResponse<GithubIssue[]>> = octokit.issues.listForRepo({...filter, owner: ORG_NAME,
      repo: REPO, sort: 'created', direction: 'desc', per_page: 100, page: pageNumber,
      headers: { 'If-None-Match': this.issuesCacheManager.getEtagFor(pageNumber) }});
    const apiCall$ = from(apiCall);
    return apiCall$.pipe(
      catchError(err => {
        return of(this.issuesCacheManager.get(pageNumber));
      })
    );
  }

  private getCommentsAPICall(issueId: number, pageNumber: number): Observable<GithubResponse<GithubComment[]>> {
    const apiCall: Promise<GithubResponse<GithubComment[]>> = octokit.issues.listComments({owner: ORG_NAME, repo: REPO,
      issue_number: issueId, page: pageNumber, per_page: 100,
      headers: { 'If-None-Match': this.commentsCacheManager.getEtagFor(issueId, pageNumber)}});
    const apiCall$ = from(apiCall);
    return apiCall$.pipe(
      catchError(err => {
        return of(this.commentsCacheManager.get(issueId, pageNumber));
      })
    );
  }
}

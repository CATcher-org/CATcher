import { Injectable } from '@angular/core';
import { catchError, flatMap, map } from 'rxjs/operators';
import { forkJoin, from, Observable, of } from 'rxjs';
import { githubPaginatorParser } from '../../shared/lib/github-paginator-parser';
import { IssueComment } from '../models/comment.model';
import { shell } from 'electron';
import { ERRORCODE_NOT_FOUND, ErrorHandlingService } from './error-handling.service';
import { GithubIssue } from '../models/github-issue.model';
import { GithubComment } from '../models/github-comment.model';
import { GithubRelease } from '../models/github.release';

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
  private issuesEtags = [];
  private issueLastModified = {};
  private commentsEtags = {};

  constructor(private errorHandlingService: ErrorHandlingService) {}

  storeCredentials(user: String, passw: String) {
    octokit = new Octokit({
      auth: {
        username: user,
        password: passw,
      },
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
    const responseInFirstPage = [];
    return from(this.getIssueAPICall(filter, 1)).pipe(
      map((response) => {
        responseInFirstPage.push(response);
        return this.getNumberOfPages(response);
      }),
      flatMap((numOfPages: number) => {
        const apiCalls = [];
        for (let i = 2; i <= numOfPages; i++) {
          apiCalls.push(from(this.getIssueAPICall(filter, i)));
        }
        return apiCalls.length === 0 ? of([]) : forkJoin(apiCalls);
      }),
      map((resultArray) => {
        const responses = [...responseInFirstPage, ...resultArray];
        const collatedData = [];
        let index = 0;
        for (const response of responses) {
          this.issuesEtags[index] = response['headers']['etag'];
          index++;
          for (const issue of response['data']) {
            collatedData.push(new GithubIssue(issue));
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

  fetchIssue(id: number): Observable<GithubIssue> {
    return from(octokit.issues.get({owner: ORG_NAME, repo: REPO, issue_number: id,
      headers: { 'If-Modified-Since': this.issueLastModified[id] || '' }})).pipe(
        map((response) => {
          this.issueLastModified[id] = response['headers']['last-modified'];
          return new GithubIssue(response['data']);
        })
    );
  }

  fetchIssueComments(issueId: number): Observable<Array<GithubComment>> {
    const responseInFirstPage = [];
    return from(this.getCommentsAPICall(issueId, 1)).pipe(
      map((response) => {
        responseInFirstPage.push(response);
        return this.getNumberOfPages(response);
      }),
      flatMap((numOfPages: number) => {
        const apiCalls = [];
        for (let i = 2; i <= numOfPages; i++) {
          apiCalls.push(from(this.getCommentsAPICall(issueId, i)));
        }
        return apiCalls.length === 0 ? of([]) : forkJoin(apiCalls);
      }),
      map((resultArray) => {
        const responses = [...responseInFirstPage, ...resultArray];
        const collatedData = [];
        let index = 0;
        for (const response of responses) {
          if (this.commentsEtags[issueId]) {
            this.commentsEtags[issueId][index] = response['headers']['etag'];
          } else {
            this.commentsEtags[issueId] = [response['headers']['etag']];
          }
          index++;

          for (const comment of response['data']) {
            collatedData.push(<GithubComment>comment);
          }
        }
        return collatedData;
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
      map(response => {
        return new GithubIssue(response['data']);
      })
    );
  }

  createIssue(title: string, description: string, labels: string[]): Observable<GithubIssue> {
    return from(octokit.issues.create({owner: ORG_NAME, repo: REPO, title: title, body: description, labels: labels})).pipe(
      map(response => {
        return new GithubIssue(response['data']);
      })
    );
  }

  createIssueComment(issueId: number, description: string): Observable<{}> {
    return from(octokit.issues.createComment({owner: ORG_NAME, repo: REPO, issue_number: issueId,
      body: description})).pipe(
      map(response => {
        return response['data'];
      })
    );
  }

  updateIssue(id: number, title: string, description: string, labels: string[], assignees?: string[]): Observable<GithubIssue> {
    return from(octokit.issues.update({owner: ORG_NAME, repo: REPO, issue_number: id, title: title, body: description, labels: labels,
      assignees: assignees})).pipe(
      map(response => {
        this.issueLastModified[id] = response['headers']['last-modified'];
        return new GithubIssue(response['data']);
      })
    );
  }

  updateIssueComment(issueComment: IssueComment): Observable<GithubComment> {
    return from(octokit.issues.updateComment({owner: ORG_NAME, repo: REPO, comment_id: issueComment.id,
      body: issueComment.description})).pipe(
      map(response => {
        return response['data'];
      })
    );
  }

  uploadFile(filename: string, base64String: string): Observable<any> {
    return from(octokit.repos.createFile({owner: ORG_NAME, repo: REPO, path: `files/${filename}`,
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
    // roles information
    return forkJoin(
      from(octokit.repos.getContents({owner: MOD_ORG, repo: DATA_REPO, path: 'data.csv'}))
        .pipe(map(rawData => atob(rawData['data']['content'])))
    ).pipe(
      map(([data]) => {
        return {data};
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

  getRepoURL(): string {
    return ORG_NAME.concat('/').concat(REPO);
  }

  viewIssueInBrowser(id: number) {
    if (id) {
      shell.openExternal('https://github.com/'.concat(this.getRepoURL()).concat('/issues/').concat(String(id)));
    } else {
      this.errorHandlingService.handleGeneralError('Unable to open this issue in Browser');
    }
    event.stopPropagation();
  }

  reset(): void {
    this.commentsEtags = {};
    this.issueLastModified = {};
    this.issuesEtags = [];
  }

  /**
   * Get the number of paginated pages of issues in Github.
   * @param response
   */
  private getNumberOfPages(response: {}): number {
    let numberOfPages = 1;
    if (response['headers'].link) {
      const paginatedData = githubPaginatorParser(response['headers'].link);
      numberOfPages = +paginatedData['last'] || 1;
    }
    return numberOfPages;
  }

  private getIssueAPICall(filter: {}, pageNumber: number): Promise<{}> {
    return octokit.issues.listForRepo({...filter, owner: ORG_NAME, repo: REPO, sort: 'created',
      direction: 'desc', per_page: 100, page: pageNumber, headers: { 'If-None-Match': this.issuesEtags[pageNumber - 1] || '' }});
  }

  private getCommentsAPICall(issueId: number, pageNumber: number): Promise<{}> {
    return octokit.issues.listComments({owner: ORG_NAME, repo: REPO, issue_number: issueId, page: pageNumber,
      headers: { 'If-None-Match': this.commentsEtags[issueId] ? this.commentsEtags[issueId][pageNumber - 1] || '' : ''}});
  }
}

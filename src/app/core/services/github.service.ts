import { Injectable } from '@angular/core';
import { catchError, map, mergeMap } from 'rxjs/operators';
import { forkJoin, from, Observable, of } from 'rxjs';
import { githubPaginatorParser } from '../../shared/lib/github-paginator-parser';
import { IssueComment } from '../models/comment.model';
import { shell } from 'electron';
import { ERRORCODE_NOT_FOUND, ErrorHandlingService } from './error-handling.service';
const Octokit = require('@octokit/rest');


let ORG_NAME = '';
let MOD_ORG = '';
let REPO = '';
let DATA_REPO = '';
let octokit;

@Injectable({
  providedIn: 'root',
})
export class GithubService {

  constructor(private errorHandlingService: ErrorHandlingService) {
  }

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
   * Will return an Observable with array of issues in JSON format.
   */
  fetchIssues(filter?: {}): Observable<Array<{}>> {
    return this.getNumberOfIssuePages(filter).pipe(
      mergeMap((numOfPages) => {
        const apiCalls = [];
        for (let i = 1; i <= numOfPages; i++) {
          apiCalls.push(from(octokit.issues.listForRepo({...filter, owner: ORG_NAME, repo: REPO,
            sort: 'created', direction: 'desc', per_page: 100, page: i})));
        }
        return forkJoin(apiCalls);
      }),
      map((resultArray) => {
        let collatedData = [];
        for (const response of resultArray) {
          collatedData = [
            ...collatedData,
            ...response['data'],
          ];
        }
        return collatedData;
      })
    );
  }

  /**
   * Check if the specified repository exists.
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

  fetchIssue(id: number): Observable<{}> {
    return from(octokit.issues.get({owner: ORG_NAME, repo: REPO, number: id})).pipe(
      map((response) => {
        return response['data'];
      })
    );
  }

  fetchIssueComments(issueId: number): Observable<Array<{}>> {
    return this.getNumberOfCommentPages(issueId).pipe(
      mergeMap((numOfPages) => {
        const apiCalls = [];
        for (let i = 1; i <= numOfPages; i++) {
          apiCalls.push(from(octokit.issues.listComments({owner: ORG_NAME, repo: REPO, issue_number: issueId, page: i})));
        }
        return forkJoin(apiCalls);
      }),
      map((resultArray) => {
        let collatedData = [];
        for (const response of resultArray) {
          collatedData = [
            ...collatedData,
            ...response['data'],
          ];
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

  closeIssue(id: number): Observable<{}> {
    return from(octokit.issues.update({owner: ORG_NAME, repo: REPO, issue_number: id, state: 'closed'})).pipe(
      map(response => {
        return response['data'];
      })
    );
  }

  createIssue(title: string, description: string, labels: string[]): Observable<{}> {
    return from(octokit.issues.create({owner: ORG_NAME, repo: REPO, title: title, body: description, labels: labels})).pipe(
      map(response => {
        return response['data'];
      })
    );
  }

  createIssueComment(comment: IssueComment): Observable<{}> {
    return from(octokit.issues.createComment({owner: ORG_NAME, repo: REPO, number: comment.id,
      body: comment.description})).pipe(
      map(response => {
        return response['data'];
      })
    );
  }

  updateIssue(id: number, title: string, description: string, labels: string[], assignees?: string[]): Observable<{}> {
    return from(octokit.issues.update({owner: ORG_NAME, repo: REPO, issue_number: id, title: title, body: description, labels: labels,
      assignees: assignees})).pipe(
      map(response => {
        return response['data'];
      })
    );
  }

  updateIssueComment(issueComment: IssueComment): Observable<{}> {
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

  getRepo(orgName: string, repoName: string) {
    return from(octokit.repos.get({owner: orgName, repo: repoName})).pipe(
      map(response => {
        return response['data'];
      })
    );
  }

  fetchEventsForRepo(): Observable<any[]> {
    return from(octokit.issues.listEventsForRepo({owner: ORG_NAME, repo: REPO})).pipe(
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

  /**
   * Fetches the data file that is regulates session information.
   * @return Observable<{}> representing session information.
   */
  fetchSettingsFile(): Observable<{}> {
    return from(octokit.repos.getContents({owner: MOD_ORG, repo: DATA_REPO, path: 'settings.json'}))
        .pipe(map(rawData => JSON.parse(atob(rawData['data']['content']))));
  }

  private getNumberOfIssuePages(filter?: {}): Observable<number> {
    return from(octokit.issues.listForRepo({...filter, owner: ORG_NAME, repo: REPO, sort: 'created',
      direction: 'desc', per_page: 100, page: 1})).pipe(
      map((response) => {
        if (!response['headers'].link) {
          return 1;
        }
        const paginatedData = githubPaginatorParser(response['headers'].link);
        return +paginatedData['last'] || 1;
      })
    );
  }

  private getNumberOfCommentPages(issueId: number): Observable<number> {
    return from(octokit.issues.listComments({owner: ORG_NAME, repo: REPO, issue_number: issueId, page: 1})).pipe(
      map((response) => {
        if (!response['headers'].link) {
          return 1;
        }
        const paginatedData = githubPaginatorParser(response['headers'].link);
        return +paginatedData['last'] || 1;
      })
    );
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
}

import { Injectable } from '@angular/core';
import {map, mergeMap} from 'rxjs/operators';
import {Issue, labelsToAttributeMapping, LABELS} from '../models/issue.model';
import {forkJoin, from, Observable } from 'rxjs';
import {githubPaginatorParser} from '../../shared/lib/github-paginator-parser';
import * as moment from 'moment';
import {IssueComment} from '../models/comment.model';
const Octokit = require('@octokit/rest');


let ORG_NAME = 'testathor';
let REPO = 'pe-results';
const DATA_REPO = 'public_data';
let octokit;

@Injectable({
  providedIn: 'root',
})
export class GithubService {

  constructor() {
  }

  storeCredentials(user: String, passw: String) {
    octokit = new Octokit({
      auth: {
        username: user,
        password: passw,
      },
    });
  }

  updatePhaseDetails(repoName: string, orgName: string) {
    ORG_NAME = orgName;
    REPO = repoName;
  }
  /**
   * Will return an Observable with JSON object conforming with the following structure:
   * data = { [issue.id]: Issue }
   */
  fetchIssues(filter?: {}): Observable<{}> {
    return this.getNumberOfPages(filter).pipe(
      mergeMap((numOfPages) => {
        const apiCalls = [];
        for (let i = 1; i <= numOfPages; i++) {
          apiCalls.push(from(octokit.issues.listForRepo({...filter, owner: ORG_NAME, repo: REPO,
            sort: 'created', direction: 'asc', per_page: 100, page: i})));
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
      }),
      map((collatedData) => {
        let mappedResult = {};
        for (const issue of collatedData) {
          const issueModel = this.createIssueModel(issue);
          mappedResult = {
            ...mappedResult,
            [issueModel.id]: issueModel,
          };
        }
        return mappedResult;
      })
    );
  }

  fetchIssue(id: number): Observable<Issue> {
    return from(octokit.issues.get({owner: ORG_NAME, repo: REPO, number: id})).pipe(
      map((response) => {
        return this.createIssueModel(response['data']);
      })
    );
  }

  fetchIssueComments(issueId: number): Observable<IssueComment[]> {
    return from(octokit.issues.listComments({owner: ORG_NAME, repo: REPO, number: issueId, per_page: 3, page: 1})).pipe(
      map((response) => {
        const issueComments = new Array<IssueComment>();
        for (const comment of response['data']) {
          issueComments.push(this.createIssueCommentModel(comment));
        }
        return issueComments;
      })
    );
  }

  closeIssue(id: number): Observable<Issue> {
    return from(octokit.issues.update({owner: ORG_NAME, repo: REPO, number: id, state: 'closed'})).pipe(
      map((response) => {
        return this.createIssueModel(response['data']);
      }
    ));
  }

  createIssue(title: string, description: string, labels: string[]): Observable<Issue> {
    return from(octokit.issues.create({owner: ORG_NAME, repo: REPO, title: title, body: description, labels: labels})).pipe(
      map((response) => {
        return this.createIssueModel(response['data']);
      })
    );
  }

  createIssueComment(comment: IssueComment): Observable<IssueComment> {
    return from(octokit.issues.createComment({owner: ORG_NAME, repo: REPO, number: comment.id,
                body: comment.description}))
      .pipe(map((response) => {
        return this.createIssueCommentModel(response['data']);
      })
    );
  }

  updateIssue(id: number, title: string, description: string, labels: string[], assignees?: string[]): Observable<Issue> {
    return from(octokit.issues.update({owner: ORG_NAME, repo: REPO, number: id, title: title, body: description, labels: labels,
      assignees: assignees})).pipe(
        map((response) => {
          return this.createIssueModel(response['data']);
        })
    );
  }

  updateIssueComment(issueComment: IssueComment) {
    return from(octokit.issues.updateComment({owner: ORG_NAME, repo: REPO, comment_id: issueComment.id,
      body: issueComment.description})).pipe(
        map((response) => {
          return this.createIssueCommentModel(response['data']);
        })
    );
  }

  uploadFile(filename: string, base64String: string): Observable<any> {
    return from(octokit.repos.createFile({owner: ORG_NAME, repo: REPO, path: `images/${filename}`,
      message: 'upload file', content: base64String}));
  }

  getDataFile(): Observable<{}> {
    return from(octokit.repos.getContents({owner: ORG_NAME, repo: DATA_REPO, path: 'data.json'})).pipe(map((resp) => {
      return JSON.parse(atob(resp['data']['content']));
    }));
  }

  private createIssueModel(issueInJson: {}): Issue {
    return <Issue>{
      id: +issueInJson['number'],
      created_at: moment(issueInJson['created_at']).format('lll'),
      title: issueInJson['title'],
      assignees: issueInJson['assignees'].map((assignee) => assignee['login']),
      description: issueInJson['body'],
      ...this.getFormattedLabels(issueInJson['labels'], LABELS),
    };
  }

  private createIssueCommentModel(issueCommentInJson: {}): IssueComment {
    return <IssueComment>{
      id: issueCommentInJson['id'],
      createdAt: moment(issueCommentInJson['created_at']).format('lll'),
      updatedAt: moment(issueCommentInJson['updated_at']).format('lll'),
      description: issueCommentInJson['body'],
    };
  }

  /**
   * Based on the kind labels specified in `desiredLabels` field, this function will produce a neatly formatted JSON object.
   *
   * For example:
   * desiredLabels = ['severity', 'type']
   * Output = {severity: High, type: FunctionalityBug}
   *
   * TODO: Add error handling for these assumptions.
   * Assumptions:
   * 1) The `labels` which were received from github has all the `desiredLabels` type we want.
   * 2) There are no duplicates for example labels will not contain `severity.High` and `severity.Low` at the same time.
   *
   * @param labels defines the raw label array from which is obtained from github.
   * @param desiredLabels defines the type of labels you want to be parsed out.
   */
  private getFormattedLabels(labels: Array<{}>, desiredLabels: Array<string>): {} {
    let result = {};
    for (const label of labels) {
      const labelName = String(label['name']).split('.');
      const labelType = labelName[0];
      const labelValue = labelName[1];

      if (label['name'] === 'duplicate') {
        result = {
          ...result,
          duplicated: true,
        };
      } else if (desiredLabels.includes(labelType)) {
        result = {
          ...result,
          [labelsToAttributeMapping[labelType]]: labelValue,
        };
      }
    }
    return result;
  }

  private getNumberOfPages(filter?: {}): Observable<number> {
    return from(octokit.issues.listForRepo({...filter, owner: ORG_NAME, repo: REPO, sort: 'created',
      direction: 'asc', per_page: 100, page: 1})).pipe(
        map((response) => {
          if (!response['headers'].link) {
            return 1;
          }
          const paginatedData = githubPaginatorParser(response['headers'].link);
          return +paginatedData['last'] || 1;
        })
    );
  }
}

import { Injectable } from '@angular/core';
import {from, Observable} from 'rxjs';
import {map} from 'rxjs/operators';
import {Issue, LABELS_IN_BUG_REPORTING} from '../models/issue.model';

const octokit = require('@octokit/rest')();

@Injectable({
  providedIn: 'root',
})
export class GithubService {

  constructor() {}

  /**
   * Will return an Observable with JSON object conforming with the following structure:
   * data = { [issue.id]: Issue }
   */
  fetchIssues(): Observable<{}> {
    return from(octokit.issues.listForRepo({owner: 'testathor', repo: 'pe', sort: 'created', direction: 'asc'})).pipe(
      map((response) => {
        let mappedResult = {};
        for (const issue of response['data']) {
          const issueModel = this.createIssueModel(issue);
          mappedResult = {
            ...mappedResult,
            [issueModel.id]: issueModel,
          };
        }
        return mappedResult;
      }),
    );
  }

  fetchIssue(id: number): Observable<Issue> {
    return from(octokit.issues.get({owner: 'testathor', repo: 'pe', number: id})).pipe(
      map((response) => {
        return this.createIssueModel(response['data']);
      })
    );
  }

  closeIssue(id: number): Observable<Issue> {
    return from(octokit.issues.update({owner: 'testathor', repo: 'pe', number: id, state: 'closed'})).pipe(
      map((response) => {
        return this.createIssueModel(response['data']);
      }
    ));
  }

  createNewIssue(title: string, description: string, labels: string[]): Observable<Issue> {
    return from(octokit.issues.create({owner: 'testathor', repo: 'pe', title: title, body: description, labels: labels})).pipe(
      map((response) => {
        return this.createIssueModel(response['data']);
      })
    );
  }

  editIssue(id: number, title: string, description: string, labels: string[]) {
    return from(octokit.issues.update({owner: 'testathor', repo: 'pe', number: id, title: title, body: description, labels: labels})).pipe(
      map((response) => {
        return this.createIssueModel(response['data']);
      })
    );
  }

  uploadImage(filename: string, base64String: string): Observable<any> {
    return from(octokit.repos.createFile({owner: 'testathor', repo: 'pe', path: `images/${filename}`,
      message: 'upload image', content: base64String}));
  }

  private createIssueModel(issueInJson: {}): Issue {
    return <Issue>{
      id: +issueInJson['number'],
      title: issueInJson['title'],
      description: issueInJson['body'],
      ...this.getFormattedLabels(issueInJson['labels'], LABELS_IN_BUG_REPORTING),
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

      if (desiredLabels.includes(labelType)) {
        result = {
          ...result,
          [labelType]: labelValue,
        };
      }
    }
    return result;
  }
}

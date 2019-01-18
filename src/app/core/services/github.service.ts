import { Injectable } from '@angular/core';
import {from, Observable} from 'rxjs';
import {map} from 'rxjs/operators';
import {Issue, LABELS_IN_BUG_REPORTING} from '../models/issue.model';

const octokit = require('@octokit/rest')();

@Injectable({
  providedIn: 'root',
})
export class GithubService {

  constructor() { }

  getIssues(): Observable<Array<Issue>> {
    return from(octokit.issues.listForRepo({owner: 'testathor', repo: 'pe'})).pipe(
      map((response) => {
        const mappedResult = new Array<Issue>();
        for (const issue of response['data']) {
          mappedResult.push(<Issue>{
            id: +issue['number'],
            title: issue['title'],
            ...this.getFormattedLabels(issue['labels'], LABELS_IN_BUG_REPORTING),
          });
        }
        // sort according to its id in ascending order.
        mappedResult.sort((a, b) => {
          return a.id > b.id ? 1 : a.id < b.id ? -1 : 0;
        });
        return mappedResult;
      }),
    );
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

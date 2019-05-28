import { Injectable } from '@angular/core';
import {map, mergeMap} from 'rxjs/operators';
import {forkJoin, from, Observable} from 'rxjs';
import {githubPaginatorParser} from '../../shared/lib/github-paginator-parser';
import {IssueComment} from '../models/comment.model';
const Octokit = require('@octokit/rest');


let ORG_NAME = '';
let REPO = '';
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
          apiCalls.push(from(octokit.issues.listComments({owner: ORG_NAME, repo: REPO, number: issueId, per_page: 1, page: i})));
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

  closeIssue(id: number): Observable<{}> {
    return from(octokit.issues.update({owner: ORG_NAME, repo: REPO, number: id, state: 'closed'})).pipe(
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
    return from(octokit.issues.update({owner: ORG_NAME, repo: REPO, number: id, title: title, body: description, labels: labels,
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

  parseRolesData(csvInput: string): {} {
    const CSV_HEADER_USER_TYPE = 'role';
    const CSV_HEADER_USER_NAME = 'member';

    const roles = {
      'roles' : {
        'students': {},
        'tutors' : {},
        'admins' : {}
      }
    };
    const students = {};
    const tutors = {};
    const admins = {};
    const rolesOutput = this.csvToObject(csvInput);

    rolesOutput.forEach(entry => {
      if (entry[CSV_HEADER_USER_TYPE] === 'student') {
        students[entry[CSV_HEADER_USER_NAME]] = 'true';
      } else if (entry[CSV_HEADER_USER_TYPE] === 'tutor') {
        tutors[entry[CSV_HEADER_USER_NAME]] = 'true';
      } else {
        admins[entry[CSV_HEADER_USER_NAME]] = 'true';
      }
    });

    roles['roles']['students'] = students;
    roles['roles']['tutors'] = tutors;
    roles['roles']['admins'] = admins;

    return roles;
  }

  fetchDataFile(): Observable<{}> {
    // roles information
    from(octokit.repos.getContents({owner: ORG_NAME, repo: DATA_REPO, path: 'roles.csv'})).subscribe(resp => {
      // const parser = require('csv-parse');
      console.log(this.parseRolesData(atob(resp['data']['content'])));
    });
    return from(octokit.repos.getContents({owner: ORG_NAME, repo: DATA_REPO, path: 'data.json'})).pipe(map((resp) => {
      console.log(JSON.parse(atob(resp['data']['content'])));
      return JSON.parse(atob(resp['data']['content']));
    }));
  }

  /**
   * Converts the input csv information to an array of
   * objects marked by the header values of the csv.
   * @param csvText - csv information.
   * @return - array of objects representing input csv info.
   */
  csvToObject(csvText) {
    // Split all the text into seperate lines on new lines and carriage return feeds
    const allTextLines = csvText.split(/\r\n|\n/);
    // Split per line on tabs and commas
    const headers = allTextLines[0].split(/\t|,/);
    const entries = [];

    for (let i = 1; i < allTextLines.length; i++) {

      const data = allTextLines[i].split(/\t|,/);

      if (data.length === headers.length) {

        const location = { 'roles' : data[0], 'members' : data[1] };
        entries.push(location);

      }

    }
    return entries;
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
    return from(octokit.issues.listComments({owner: ORG_NAME, repo: REPO, number: issueId, per_page: 1, page: 1})).pipe(
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

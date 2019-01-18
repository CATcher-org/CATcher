import { Injectable } from '@angular/core';
import {GithubService} from './github.service';
import {first} from 'rxjs/operators';
import {Observable, of} from 'rxjs';
import {Issue} from '../models/issue.model';

@Injectable({
  providedIn: 'root',
})
export class IssueService {
  issues: {};

  constructor(private githubService: GithubService) { }


  /**
   * Will return an Observable with JSON object conforming with the following structure:
   * issues = { [issue.id]: Issue }
   *
   * If the issues have been fetched before, the function will return the existing issues instead of calling from Github API.
   */
  getAllIssues(): Observable<{}> {
    if (this.issues === undefined) {
      this.githubService.fetchIssues().pipe(first()).subscribe((issues: {}) => {
        this.issues = issues;
      });
      return this.githubService.fetchIssues().pipe(first());
    } else {
      return of(this.issues);
    }
  }

  getIssue(id: number): Observable<Issue> {
    if (this.issues === undefined) {
      this.getAllIssues();
      return this.githubService.fetchIssue(id).pipe(first());
    } else {
      return of(this.issues[id]);
    }
  }
}

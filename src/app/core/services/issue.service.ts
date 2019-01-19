import { Injectable } from '@angular/core';
import {GithubService} from './github.service';
import {first, map} from 'rxjs/operators';
import {BehaviorSubject, Observable, of, Subject} from 'rxjs';
import {Issue} from '../models/issue.model';

@Injectable({
  providedIn: 'root',
})
export class IssueService {
  isInitialized = false;
  issues$: BehaviorSubject<Issue[]>;

  constructor(private githubService: GithubService) {
    this.issues$ = new BehaviorSubject(new Array<Issue>());
  }

  /**
   * Will return an Observable with JSON object conforming with the following structure:
   * issues = { [issue.id]: Issue }
   *
   * If the issues have been fetched before, the function will return the existing issues instead of calling from Github API.
   */
  getAllIssues(): Observable<Issue[]> {
    if (!this.isInitialized) {
      this.initializeData();
    }
    return this.issues$;
  }

  // TODO Error when there isn't the issue id.
  getIssue(id: number): Observable<Issue> {
    if (!this.isInitialized) {
      this.initializeData();
      return this.githubService.fetchIssue(id).pipe(first());
    } else {
      return this.issues$.pipe(map((issues) => {
        return issues.filter((issue) => {
          return issue.id === id;
        })[0];
      }));
    }
  }

  // TODO Error Toaster for this.
  deleteIssue(id: number): void {
    const newIssues = this.issues$.getValue().filter((issue) => {
      return issue.id !== id;
    });
    this.issues$.next(newIssues);
    this.githubService.closeIssue(id);
  }

  private initializeData() {
    this.githubService.fetchIssues().pipe(first()).subscribe((issues: Issue[]) => {
      this.isInitialized = true;
      this.issues$.next(issues);
    });
  }
}

import { Injectable } from '@angular/core';
import {GithubService} from './github.service';
import {catchError, first, map} from 'rxjs/operators';
import {BehaviorSubject, Observable, of} from 'rxjs';
import {Issue} from '../models/issue.model';
import {ErrorHandlingService} from './error-handling.service';

@Injectable({
  providedIn: 'root',
})
export class IssueService {
  issues: {};
  issues$: BehaviorSubject<Issue[]>;

  constructor(private githubService: GithubService, private errorHandlingService: ErrorHandlingService) {
    this.issues$ = new BehaviorSubject(new Array<Issue>());
  }

  /**
   * Will return an Observable with JSON object conforming with the following structure:
   * issues = { [issue.id]: Issue }
   *
   * If the issues have been fetched before, the function will return the existing issues instead of calling from Github API.
   */
  getAllIssues(): Observable<Issue[]> {
    if (this.issues === undefined) {
      this.initializeData();
    }
    return this.issues$;
  }

  getIssue(id: number): Observable<Issue> {
    if (this.issues === undefined) {
      this.initializeData();
      return this.githubService.fetchIssue(id).pipe(first());
    } else {
      return of(this.issues[id]);
    }
  }

  createNewIssue(title: string, description: string, severity: string, type: string): Observable<Issue> {
    const labelsArray = [this.createSeverityLabel(severity), this.createTypeLabel(type)];
    return this.githubService.createNewIssue(title, description, labelsArray);
  }

  updateIssue(issue: Issue) {
    const labelsArray = [this.createSeverityLabel(issue.severity), this.createTypeLabel(issue.type)];
    return this.githubService.updateIssue(issue.id, issue.title, issue.description, labelsArray);
  }

  deleteIssue(id: number): Observable<Issue> {
    return this.githubService.closeIssue(id);
  }

  deleteFromLocalStore(issueToDelete: Issue) {
    const { [issueToDelete.id]: issueToRemove, ...withoutIssueToRemove } = this.issues;
    this.issues = withoutIssueToRemove;
    this.issues$.next(Object.values(this.issues));
  }

  /**
   * To add/update an issue.
   */
  updateLocalStore(issueToUpdate: Issue) {
    this.issues = {
      ...this.issues,
      [issueToUpdate.id]: issueToUpdate,
    };
    this.issues$.next(Object.values(this.issues));
  }

  private initializeData() {
    this.githubService.fetchIssues().pipe(first()).subscribe((issues: Issue[]) => {
      this.issues = issues;
      this.issues$.next(Object.values(this.issues));
    }, (error) => this.errorHandlingService.handleHttpError(error, () => this.getAllIssues()));
  }

  private createSeverityLabel(value: string) {
    return `severity.${value}`;
  }

  private createTypeLabel(value: string) {
    return `type.${value}`;
  }
}

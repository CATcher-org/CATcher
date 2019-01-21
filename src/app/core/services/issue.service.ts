import { Injectable } from '@angular/core';
import {GithubService} from './github.service';
import {first, map} from 'rxjs/operators';
import {BehaviorSubject, Observable} from 'rxjs';
import {Issue} from '../models/issue.model';
import {MatSnackBar} from '@angular/material';

@Injectable({
  providedIn: 'root',
})
export class IssueService {
  issues: {};
  issues$: BehaviorSubject<Issue[]>;

  constructor(private githubService: GithubService, private errorMessage: MatSnackBar) {
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

  // TODO Error when there isn't the issue id.
  getIssue(id: number): Observable<Issue> {
    if (this.issues === undefined) {
      this.initializeData();
      return this.githubService.fetchIssue(id).pipe(first());
    } else {
      return this.issues$.pipe(map((issues) => {
        return issues.filter((issue) => issue.id === id)[0];
      }));
    }
  }

  // TODO Error Toaster for this.
  createNewIssue(title: string, description: string, severity: string, type: string): Observable<Issue> {
    const labelsArray = [this.createSeverityLabel(severity), this.createTypeLabel(type)];
    return this.githubService.createNewIssue(title, description, labelsArray);
  }

  // TODO Error Toaster for this.
  editIssue(id: number, title: string, description: string, severity: string, type: string) {
    const labelsArray = [this.createSeverityLabel(severity), this.createTypeLabel(type)];
    return this.githubService.editIssue(id, title, description, labelsArray);
  }

  // TODO Error Toaster for this.
  deleteIssue(id: number): void {
    const newIssues = this.issues$.getValue().filter((issue) => {
      return issue.id !== id;
    });
    this.issues$.next(newIssues);
    this.githubService.closeIssue(id);
  }

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
    }, (error) => {
      console.log(error);
    });
  }

  private createSeverityLabel(value: string) {
    return `severity.${value}`;
  }

  private createTypeLabel(value: string) {
    return `type.${value}`;
  }
}

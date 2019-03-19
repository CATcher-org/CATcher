import {Injectable} from '@angular/core';
import {GithubService} from './github.service';
import {flatMap, map} from 'rxjs/operators';
import {BehaviorSubject, forkJoin, Observable, of} from 'rxjs';
import {Issue, Issues, IssuesFilter} from '../models/issue.model';
import {UserService} from './user.service';
import {Student, UserRole} from '../models/user.model';
import {Phase, PhaseService} from './phase.service';
import {IssueCommentService} from './issue-comment.service';
import {RespondType} from '../models/comment.model';
import {PermissionService} from './permission.service';

@Injectable({
  providedIn: 'root',
})
export class IssueService {
  issues: Issues;
  issues$: BehaviorSubject<Issue[]>;

  constructor(private githubService: GithubService,
              private userService: UserService,
              private phaseService: PhaseService,
              private issueCommentService: IssueCommentService,
              private permissionService: PermissionService) {
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
      return this.initializeData();
    }
    return this.issues$;
  }

  getIssue(id: number): Observable<Issue> {
    if (this.issues === undefined) {
      return this.githubService.fetchIssue(id);
    } else {
      return of(this.issues[id]);
    }
  }

  createIssue(title: string, description: string, severity: string, type: string): Observable<Issue> {
    const labelsArray = [this.createLabel('severity', severity), this.createLabel('type', type)];
    return this.githubService.createIssue(title, description, labelsArray);
  }

  updateIssue(issue: Issue): Observable<Issue> {
    return this.githubService.updateIssue(issue.id, issue.title, issue.description, this.createLabelsForIssue(issue), issue.assignees);
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

  hasResponse(issueId: number, responseType: RespondType): boolean {
    return !!this.issueCommentService.comments.get(issueId)[responseType];
  }

  reset() {
    this.issues = undefined;
    this.issues$.next(new Array<Issue>());
  }

  private initializeData(): Observable<Issue[]> {
    let filter = {};

    switch (IssuesFilter[this.phaseService.currentPhase][this.userService.currentUser.role]) {
      case 'FILTER_BY_CREATOR':
        filter = {creator: this.userService.currentUser.loginId};
        break;
      case 'FILTER_BY_TEAM':
        const studentTeam = (<Student>this.userService.currentUser).team.id.split('-');
        filter = {
          labels: [this.createLabel('tutorial', studentTeam[0]), this.createLabel('team', studentTeam[1])]
        };
        break;
      case 'FILTER_BY_TEAM_ASSIGNED':
        break;
      case 'NO_FILTER':
        break;
      case 'NO_ACCESS':
      default:
        return of([]);
    }

    const fetchedIssues = this.githubService.fetchIssues(filter).pipe(
      map((issues) => {
        this.issues = issues;
        this.issues$.next(Object.values(this.issues));
        return Object.values(this.issues);
      })
    );
    if (!this.permissionService.requireComments()) {
      return fetchedIssues;
    } else { // Fetch the comments related to all the issues which will be used to populate the issue table
      return fetchedIssues.pipe(flatMap((issues: Issue[]) => {
        const commentsToFetch = [];
        for (const issue of issues) {
          commentsToFetch.push(this.issueCommentService.getIssueComments(issue.id));
        }
        return forkJoin(commentsToFetch);
      }),
        map(() => {
          for (const issue of <Issue[]>Object.values(this.issues)) {
            const commentsOfIssue = this.issueCommentService.comments.get(issue.id);
            if (commentsOfIssue.teamResponse && commentsOfIssue.teamResponse.duplicateOf) {
              const updatedIssue = {
                ...issue,
                duplicateOf: commentsOfIssue.teamResponse.duplicateOf,
              };
              this.updateLocalStore(updatedIssue);
            }
          }
          return Object.values(this.issues);
        })
      );
    }
  }

  private createLabelsForIssue(issue: Issue): string[] {
    const result = [];

    if (this.phaseService.currentPhase === Phase.phase2 && this.userService.currentUser.role === UserRole.Student) {
      const studentTeam = (<Student>this.userService.currentUser).team.id.split('-');
      result.push(this.createLabel('tutorial', studentTeam[0]), this.createLabel('team', studentTeam[1]));
    }

    if (issue.severity) {
      result.push(this.createLabel('severity', issue.severity));
    }

    if (issue.type) {
      result.push(this.createLabel('type', issue.type));
    }

    if (issue.responseTag) {
      result.push(this.createLabel('response', issue.responseTag));
    }

    if (issue.duplicated) {
      result.push('duplicate');
    }
    return result;
  }

  private createLabel(prepend: string, value: string) {
    return `${prepend}.${value}`;
  }
}

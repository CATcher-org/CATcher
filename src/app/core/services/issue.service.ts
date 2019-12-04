import { Injectable } from '@angular/core';
import { GithubService } from './github.service';
import { flatMap, map } from 'rxjs/operators';
import { BehaviorSubject, combineLatest, forkJoin, Observable, of } from 'rxjs';
import {
  Issue,
  Issues,
  IssuesFilter,
  RespondType
} from '../models/issue.model';
import { UserService } from './user.service';
import { Phase, PhaseService } from './phase.service';
import { IssueCommentService } from './issue-comment.service';
import { PermissionService } from './permission.service';
import { DataService } from './data.service';
import { ErrorHandlingService } from './error-handling.service';
import { IssueDispute } from '../models/issue-dispute.model';
import { BaseIssue } from '../models/base-issue.model';
import { GithubIssue, GithubLabel } from '../models/github-issue.model';
import { GithubComment } from '../models/github-comment.model';

@Injectable({
  providedIn: 'root',
})
export class IssueService {
  issues: Issues;
  issues$: BehaviorSubject<Issue[]>;
  private issueTeamFilter = 'All Teams';
  readonly MINIMUM_MATCHES = 1;

  constructor(private githubService: GithubService,
              private userService: UserService,
              private phaseService: PhaseService,
              private issueCommentService: IssueCommentService,
              private permissionService: PermissionService,
              private errorHandlingService: ErrorHandlingService,
              private dataService: DataService) {
    this.issues$ = new BehaviorSubject(new Array<Issue>());
  }

  /**
   * Fetch all the necessary issues. If the issues have been fetched before, the function will return the existing issues instead
   * of calling from Github API.
   *
   * @return An Observable containing an array of Issues.
   *
   */
  getAllIssues(): Observable<Issue[]> {
    if (this.issues === undefined) {
      return this.initializeData();
    }
    return this.issues$;
  }

  reloadAllIssues() {
    return this.initializeData();
  }

  getIssue(id: number): Observable<Issue> {
    if (this.issues === undefined) {
      return this.githubService.fetchIssue(id).pipe(
        flatMap((response) => {
          return this.createIssueModel(response);
        })
      );
    } else {
      return of(this.issues[id]);
    }
  }

  createIssue(title: string, description: string, severity: string, type: string): Observable<Issue> {
    const labelsArray = [this.createLabel('severity', severity), this.createLabel('type', type)];
    return this.githubService.createIssue(title, description, labelsArray).pipe(
      flatMap((response: GithubIssue) => {
        return this.createIssueModel(response);
      })
    );
  }

  updateIssue(issue: Issue): Observable<Issue> {
    const assignees = this.phaseService.currentPhase === Phase.phaseModeration ? [] : issue.assignees;
    return this.githubService.updateIssue(issue.id, issue.title, this.createGithubIssueDescription(issue),
      this.createLabelsForIssue(issue), assignees).pipe(
        flatMap((response: GithubIssue) => {
          return this.createIssueModel(response);
        })
    );
  }

  /**
   * This function will create a github representation of issue's description. Given the issue model, it will piece together the different
   * attributes to create the github's description.
   *
   */
  private createGithubIssueDescription(issue: Issue): string {
    switch (this.phaseService.currentPhase) {
      case Phase.phaseModeration:
        return `# Description\n${issue.description}\n# Team\'s Response\n${issue.teamResponse}\n ` +
         // `## State the duplicated issue here, if any\n${issue.duplicateOf ? `Duplicate of #${issue.duplicateOf}` : `--`}\n` +
          `# Disputes\n\n${this.getIssueDisputeString(issue.issueDisputes)}\n`;
      default:
        return issue.description;
    }
  }

  private getIssueDisputeString(issueDisputes: IssueDispute[]): string {
    let issueDisputeString = '';
    for (const issueDispute of issueDisputes) {
      issueDisputeString += issueDispute.toString();
    }
    return issueDisputeString;
  }

  deleteIssue(id: number): Observable<Issue> {
    return this.githubService.closeIssue(id).pipe(
      flatMap((response: GithubIssue) => {
        return this.createIssueModel(response).pipe(
          map(deletedIssue => {
            this.deleteFromLocalStore(deletedIssue);
            return deletedIssue;
          })
        );
      })
    );
  }

  /**
   * This function will update the issue's state of the application. This function needs to be called whenever a issue is deleted.
   */
  deleteFromLocalStore(issueToDelete: Issue) {
    const { [issueToDelete.id]: issueToRemove, ...withoutIssueToRemove } = this.issues;
    this.issues = withoutIssueToRemove;
    this.issues$.next(Object.values(this.issues));
  }

  /**
   * This function will update the issue's state of the application. This function needs to be called whenever a issue is added/updated.
   */
  updateLocalStore(issueToUpdate: Issue) {
    this.issues = {
      ...this.issues,
      [issueToUpdate.id]: issueToUpdate,
    };
    this.issues$.next(Object.values(this.issues));
  }

  /**
   * Check whether the issue has been responded in the phase 2/3.
   */
  hasResponse(issueId: number): boolean {
    const responseType = this.phaseService.currentPhase === Phase.phaseTeamResponse ? RespondType.teamResponse : RespondType.tutorResponse;
    return !!this.issues[issueId][responseType];
  }

  /**
   * Obtain an observable containing an array of issues that are duplicates of the parentIssue.
   */
  getDuplicateIssuesFor(parentIssue: Issue): Observable<Issue[]> {
    return this.issues$.pipe(map((issues) => {
      return issues.filter(issue => {
        return issue.duplicateOf === parentIssue.id;
      });
    }));
  }

  reset() {
    this.issues = undefined;
    this.issues$.next(new Array<Issue>());
  }

  private initializeData(): Observable<Issue[]> {
    const filters = [];

    switch (IssuesFilter[this.phaseService.currentPhase][this.userService.currentUser.role]) {
      case 'FILTER_BY_CREATOR':
        filters.push({creator: this.userService.currentUser.loginId});
        break;
      case 'FILTER_BY_TEAM': // Only student has this filter
        const studentTeam = this.userService.currentUser.team.id.split('-');
        filters.push({
          labels: [this.createLabel('tutorial', `${studentTeam[0]}-${studentTeam[1]}`), this.createLabel('team', studentTeam[2])]
        });
        break;
      case 'FILTER_BY_TEAM_ASSIGNED': // Only for Tutors and Admins
        const allocatedTeams = this.userService.currentUser.allocatedTeams;
        for (let i = 0; i < allocatedTeams.length; i++) {
          const labels = [];
          const team = allocatedTeams[i].id.split('-');
          labels.push(this.createLabel('tutorial', `${team[0]}-${team[1]}`));
          labels.push(this.createLabel('team', team[2]));
          filters.push({ labels: labels });
        }
        break;
      case 'NO_FILTER':
        break;
      case 'NO_ACCESS':
      default:
        return of([]);
    }

    const issuesPerFilter = [];
    if (filters.length === 0) {
      issuesPerFilter.push(this.githubService.fetchIssues({}));
    }
    for (const filter of filters) {
      issuesPerFilter.push(this.githubService.fetchIssues(filter));
    }

    return forkJoin(issuesPerFilter).pipe(
      flatMap((issuesByFilter: [][]) => {
        const mappingFunctions: Observable<Issue>[] = [];
        for (const issues of issuesByFilter) {
          for (const issue of issues) {
            mappingFunctions.push(this.createIssueModel(issue));
          }
        }
        return mappingFunctions.length === 0 ? of([]) : combineLatest(mappingFunctions);
      }),
      map((issueArray) => {
        let mappedResults: Issues = {};
        issueArray.forEach(issue => mappedResults = {
          ...mappedResults,
          [issue.id]: issue
        });
        return mappedResults;
      }),
      map((issues: Issues) => {
        this.issues = issues;
        this.issues$.next(Object.values(this.issues));
        return Object.values(this.issues);
      })
    );
  }

  /**
   * Given an issue model, create the necessary labels for github.
   */
  private createLabelsForIssue(issue: Issue): string[] {
    const result = [];

    if (this.phaseService.currentPhase !== Phase.phaseBugReporting &&
        this.phaseService.currentPhase !== Phase.phaseTesterResponse) {
      const studentTeam = issue.teamAssigned.id.split('-');
      result.push(this.createLabel('tutorial', `${studentTeam[0]}-${studentTeam[1]}`),
        this.createLabel('team', studentTeam[2]));
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

    if (issue.status) {
      result.push(this.createLabel('status', issue.status));
    }

    if (issue.pending) {
      if (+issue.pending > 0) {
        result.push(this.createLabel('pending', issue.pending));
      }
    }

    if (issue.unsure) {
      result.push('unsure');
    }

    return result;
  }

  private createLabel(prepend: string, value: string) {
    return `${prepend}.${value}`;
  }

  private extractTeamIdFromGithubIssue(githubIssue: GithubIssue): string {
    return githubIssue.findLabel(GithubLabel.LABELS.tutorial).concat('-').concat(githubIssue.findLabel(GithubLabel.LABELS.team));
  }

  private createIssueModel(githubIssue: GithubIssue): Observable<Issue> {
    switch (this.phaseService.currentPhase) {
      case Phase.phaseBugReporting:
        return of(BaseIssue.createPhaseBugReportingIssue(githubIssue));
      case Phase.phaseTeamResponse:
        return this.issueCommentService.getGithubComments(githubIssue.number).pipe(
          flatMap((githubComments: GithubComment[]) => {
            return of(BaseIssue.createPhaseTeamResponseIssue(githubIssue, githubComments,
              this.dataService.getTeam(this.extractTeamIdFromGithubIssue(githubIssue))));
          })
        );
      case Phase.phaseTesterResponse:
        return this.issueCommentService.getGithubComments(githubIssue.number).pipe(
          flatMap((githubComments: GithubComment[]) => {
            return of(BaseIssue.createPhaseTesterResponseIssue(githubIssue, githubComments));
          })
        );
      case Phase.phaseModeration:
        return this.issueCommentService.getGithubComments(githubIssue.number).pipe(
          flatMap((githubComments: GithubComment[]) => {
            return of(BaseIssue.createPhaseModerationIssue(githubIssue, githubComments,
              this.dataService.getTeam(this.extractTeamIdFromGithubIssue(githubIssue))));
          })
        );
      default:
        return;
    }
  }

  parseTeamResponseForTeamResponsePhase(toParse: string): string {
    let teamResponse = '';
    const regex = /# Team's Response[\r\n]*([\S\s]*?)[\r\n]*## Duplicate status \(if any\):/gi;
    const matches = regex.exec(toParse);

    if (matches && matches.length > this.MINIMUM_MATCHES) {
      teamResponse = matches[1].trim();
    }
    return teamResponse;
  }

  parseDuplicateOfForTeamResponsePhase(toParse: string): string {
    let duplicateOf = '';
    const regex = /## Duplicate status \(if any\):[\r\n]*Duplicate of #(.*)/gi;
    const matches = regex.exec(toParse);

    if (matches && matches.length > this.MINIMUM_MATCHES) {
      duplicateOf = matches[1].trim();
    }
    return duplicateOf;
  }

  setIssueTeamFilter(filterValue: string) {
    if (filterValue) {
      this.issueTeamFilter = filterValue;
    }
  }

  getIssueTeamFilter(): string {
    return this.issueTeamFilter;
  }
}

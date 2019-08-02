import { Injectable } from '@angular/core';
import { GithubService } from './github.service';
import { map, flatMap } from 'rxjs/operators';
import { BehaviorSubject, combineLatest, forkJoin, merge, Observable, of, zip } from 'rxjs';
import {
  Issue,
  Issues,
  IssuesFilter,
  LABELS,
  labelsToAttributeMapping,
  phaseTeamResponseDescriptionTemplate,
  phaseTesterResponseDescriptionTemplate,
  phaseModerationDescriptionTemplate,
  RespondType
} from '../models/issue.model';
import { UserService } from './user.service';
import { Phase, PhaseService } from './phase.service';
import { IssueCommentService } from './issue-comment.service';
import { PermissionService } from './permission.service';
import * as moment from 'moment';
import { Team } from '../models/team.model';
import { DataService } from './data.service';
import { ErrorHandlingService } from './error-handling.service';
import { TesterResponse } from '../models/tester-response.model';
import { IssueComments, IssueComment } from '../models/comment.model';
import { IssueDispute } from '../models/issue-dispute.model';
import { UserRole } from '../../core/models/user.model';

@Injectable({
  providedIn: 'root',
})
export class IssueService {
  issues: Issues;
  issues$: BehaviorSubject<Issue[]>;
  private issueTeamFilter = 'All Teams';
  readonly MINIMUM_MATCHES = 1;
  readonly userRole = UserRole;

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
      flatMap((response) => {
        return this.createIssueModel(response);
      })
    );
  }

  updateIssue(issue: Issue): Observable<Issue> {
    const assignees = this.phaseService.currentPhase === Phase.phaseModeration ? [] : issue.assignees;
    return this.githubService.updateIssue(issue.id, issue.title, this.createGithubIssueDescription(issue),
      this.createLabelsForIssue(issue), assignees).pipe(
        flatMap((response) => {
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
      case Phase.phaseTeamResponse:
        return `# Description\n${issue.description}\n# Team\'s Response\n${issue.teamResponse}\n ` +
          `## State the duplicated issue here, if any\n${issue.duplicateOf ? `Duplicate of #${issue.duplicateOf}` : `--`}`;
      case Phase.phaseModeration:
        return `# Description\n${issue.description}\n# Team\'s Response\n${issue.teamResponse}\n ` +
         // `## State the duplicated issue here, if any\n${issue.duplicateOf ? `Duplicate of #${issue.duplicateOf}` : `--`}\n` +
          `# Disputes\n\n${this.getIssueDisputeString(issue.issueDisputes)}\n`;
      default:
        return issue.description;
    }
  }

  private getTesterResponsesString(testerResponses: TesterResponse[]): string {
    let testerResponsesString = '';
    for (const testerResponse of testerResponses) {
      testerResponsesString += testerResponse.toString();
    }
    return testerResponsesString;
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
      flatMap((response) => {
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

  /**
   * Obtain the team that is assigned to the given issue.
   */
  getTeamAssignedToIssue(issueInJson: {}): Team {
    if (this.phaseService.currentPhase === Phase.phaseBugReporting) {
      return null;
    }

    let tutorial = '';
    let team = '';
    issueInJson['labels'].map((label) => {
      const labelName = String(label['name']).split('.');
      const labelType = labelName[0];
      const labelValue = labelName[1];
      if (labelType === 'team') {
        team = labelValue;
      } else if (labelType === 'tutorial') {
        tutorial = labelValue;
      }
    });
    const teamId = `${tutorial}-${team}`;
    return this.dataService.getTeam(teamId);
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
          labels: [this.createLabel('tutorial', studentTeam[0]), this.createLabel('team', studentTeam[1])]
        });
        break;
      case 'FILTER_BY_TEAM_ASSIGNED': // Only for Tutors and Admins
        const allocatedTeams = this.userService.currentUser.allocatedTeams;
        for (let i = 0; i < allocatedTeams.length; i++) {
          const labels = [];
          const team = allocatedTeams[i].id.split('-');
          labels.push(this.createLabel('tutorial', team[0]));
          labels.push(this.createLabel('team', team[1]));
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
        return combineLatest(mappingFunctions);
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
        this.issues = { ...this.issues, ...issues };
        this.issues = issues;
        this.issues$.next(Object.values(this.issues));
        return Object.values(this.issues);
      })
    );
  }

  /**
   * Will be used to parse the github representation of the issue's description
   */
  private getParsedBody(issue: any) {
    if (this.phaseService.currentPhase === Phase.phaseBugReporting ||
        this.phaseService.currentPhase === Phase.phaseTesterResponse) {
      return;
    }
    [issue.body, issue.teamResponse, issue.duplicateOf, issue.tutorResponse, issue.todoList,
      issue.proposedAssignees, issue.testerResponses, issue.issueDisputes] = this.parseBody(issue);
  }

  /**
   * Actual implementation of using regex to extract out the data from github's representation of the issue's description.
   */
  private parseBody(issue: {}): any {
    const body = issue['body'];

    let regexExp;
    switch (this.phaseService.currentPhase) {
      case Phase.phaseTeamResponse:
        regexExp = phaseTeamResponseDescriptionTemplate;
        break;
      case Phase.phaseTesterResponse:
        regexExp = phaseTesterResponseDescriptionTemplate;
        break;
      case Phase.phaseModeration:
        regexExp = phaseModerationDescriptionTemplate;
        break;
    }

    const matches = body.match(regexExp);
    regexExp.lastIndex = 0;

    if (matches == null) {
      return Array('', null, null, null, null, null);
    }

    let description,
    teamResponse,
    duplicateOf,
    tutorResponse,
    todoList,
    assignees,
    testerResponses,
    issueDisputes;

    for (const match of matches) {
      const groups = regexExp.exec(match)['groups'];
      regexExp.lastIndex = 0;
      switch (groups['header']) {
        case '# Description':
          description = groups['description'].trim();
          break;
        case '# Team\'s Response':
          if (groups['description'].trim() === 'Write your response here.') {
            teamResponse = null;
          } else {
            teamResponse = groups['description'].trim();
          }
          break;
        case '## State the duplicated issue here, if any':
          duplicateOf = this.parseDuplicateOfValue(groups['description']);
          break;
        case '# Tutor\'s Response':
          if (groups['description'].trim() === 'Write your response here.') {
            tutorResponse = null;
          } else {
            tutorResponse = groups['description'].trim();
          }
          break;
        case '## Tutor to check':
          todoList = groups['description'].split(/\r?\n/);
          todoList = todoList.filter(function (todo) {
            return todo.trim() !== '';
          });
          break;
        case '## Proposed Assignees':
          const proposedAssignees = groups['description'].split(',').map(a => a.toLowerCase().trim()) || [];
          const teamMembers = this.getTeamAssignedToIssue(issue).teamMembers.map(m => m.loginId);
          assignees = teamMembers.filter(m => proposedAssignees.includes(m.toLowerCase()));
          break;
        case '# Items for the Tester to Verify':
          testerResponses = this.parseTesterResponse(groups['description']);
          break;
        case '# Disputes':
          issueDisputes = this.parseIssueDisputes(groups['description']);
          break;
        default:
          break;
      }
    }
    return Array(description || '', teamResponse, duplicateOf, tutorResponse, todoList || [],
      assignees || [], testerResponses || [], issueDisputes || []);
  }

  /**
   * Given an issue model, create the necessary labels for github.
   */
  private createLabelsForIssue(issue: Issue): string[] {
    const result = [];

    if (this.phaseService.currentPhase !== Phase.phaseBugReporting &&
        this.phaseService.currentPhase !== Phase.phaseTesterResponse) {
      const studentTeam = issue.teamAssigned.id.split('-');
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

  private createIssueModel(issueInJson: {}): Observable<Issue> {
    this.getParsedBody(issueInJson);
    const issueId = +issueInJson['number'];
    return this.issueCommentService.getIssueComments(issueId).pipe(
      map((issueComments: IssueComments) => {
        const issueComment = this.getIssueComment(issueComments);
        return <Issue>{
        id: issueId,
        created_at: moment(issueInJson['created_at']).format('lll'),
        title: issueInJson['title'],
        assignees: this.phaseService.currentPhase === Phase.phaseModeration ? issueInJson['proposedAssignees'] :
          issueInJson['assignees'].map((assignee) => assignee['login']),
        description: issueInJson['body'],
        teamAssigned: this.getTeamAssignedToIssue(issueInJson),
        todoList: this.getToDoList(issueComment, issueInJson['issueDisputes']),
        teamResponse: issueInJson['teamResponse'],
        tutorResponse: issueInJson['tutorResponse'],
        duplicateOf: issueInJson['duplicateOf'],
        testerResponses: issueInJson['testerResponses'],
        issueComment: issueComment,
        issueDisputes: issueInJson['issueDisputes'],
        ...this.getFormattedLabels(issueInJson['labels'], LABELS),
        };
      }),
      map((issue: Issue) => {
        if (issue.issueComment === undefined) {
          return issue;
        }

        const LABEL_CATEGORY = 1;
        const LABEL_VALUE = 2;

        const issueLabelsExtractionRegex = /#{2} ?:question: ?Issue (\w+)[\n\r]*Team Chose `?(\w+)`?\.?/gi;
        let extractedLabelsAndValues: RegExpExecArray;

        while (extractedLabelsAndValues = issueLabelsExtractionRegex.exec(issue.issueComment.description)) {
          issue = {
            ...issue,
            [(extractedLabelsAndValues[LABEL_CATEGORY] === 'response'
              ? extractedLabelsAndValues[LABEL_CATEGORY].concat('Tag')
              : extractedLabelsAndValues[LABEL_CATEGORY])]: extractedLabelsAndValues[LABEL_VALUE]
          };
        }

        this.updateIssue(issue);
        return issue;
      })
    );
  }

  getIssueComment(issueComments: IssueComments): IssueComment {
    let regex = /# *Team\'?s Response[\n\r]*[\s\S]*# Items for the Tester to Verify/gi;
    if (this.phaseService.currentPhase === Phase.phaseModeration) {
      regex = /# Tutor Moderation[\n\r]*#{2} *:question: *.*[\n\r]*.*[\n\r]*[\s\S]*?(?=-{19})/gi;
    }

    for (const comment of issueComments.comments) {
      const matched = regex.exec(comment.description);
      if (matched) {
        return comment;
      }
    }
  }

  private parseDuplicateOfValue(toParse: string): number {
    const regex = /duplicate of\s*#(\d+)/i;
    const result = regex.exec(toParse);
    if (result && result.length > this.MINIMUM_MATCHES) {
      return +regex.exec(toParse)[1];
    } else {
      return null;
    }
  }

  // Template url: https://github.com/CATcher-org/templates#items-for-the-tester-to-verify
  parseTesterResponse(toParse: string): TesterResponse[] {
    let matches;
    const testerResponses: TesterResponse[] = [];
    const regex: RegExp = new RegExp('#{2} *:question: *([\\w ]+)[\\r\\n]*(Team Chose.*[\\r\\n]* *Originally.*'
      + '|Team Chose.*[\\r\\n]*)[\\r\\n]*(- \\[x? ?\\] I disagree)[\\r\\n]*\\*\\*Reason *for *disagreement:\\*\\* *([\\s\\S]*?)-{19}',
      'gi');
    while (matches = regex.exec(toParse)) {
      if (matches && matches.length > this.MINIMUM_MATCHES) {
        const [regexString, title, description, disagreeCheckbox, reasonForDiagreement] = matches;
        testerResponses.push(new TesterResponse(title, description, disagreeCheckbox, reasonForDiagreement.trim()));
      }
    }
    return testerResponses;
  }

  // Template url: https://github.com/CATcher-org/templates#teams-response-1
  parseTeamResponse(toParse: string): string {
    let teamResponse = '';
    const regex = /# *Team\'?s Response[\n\r]*([\s\S]*)# Items for the Tester to Verify/gi;
    const matches = regex.exec(toParse);

    if (matches && matches.length > this.MINIMUM_MATCHES) {
      teamResponse = matches[1].trim();
    }
    return teamResponse;
  }

  // Template url: https://github.com/CATcher-org/templates#disputes
  parseIssueDisputes(toParse: string): IssueDispute[] {
    let matches;
    const issueDisputes: IssueDispute[] = [];
    const regex = /#{2} *:question: *(.*)[\r\n]*([\s\S]*?(?=-{19}))/gi;
    while (matches = regex.exec(toParse)) {
      if (matches && matches.length > this.MINIMUM_MATCHES) {
        const [regexString, title, description] = matches;
        issueDisputes.push(new IssueDispute(title, description.trim()));
      }
    }
    return issueDisputes;
  }

  // Template url: https://github.com/CATcher-org/templates#tutor-moderations
  parseTutorResponseInComment(toParse: string, issueDispute: IssueDispute[]): IssueDispute[] {
    let matches, i = 0;
    const regex = /#{2} *:question: *.*[\n\r]*(.*)[\n\r]*([\s\S]*?(?=-{19}))/gi;
    while (matches = regex.exec(toParse)) {
      if (matches && matches.length > this.MINIMUM_MATCHES) {
        const [regexString, todo, tutorResponse] = matches;
        issueDispute[i].todo = todo;
        issueDispute[i].tutorResponse = tutorResponse.trim();
        i++;
      }
    }
    return issueDispute;
  }

  // Template url: https://github.com/CATcher-org/templates#tutor-moderations
  getToDoList(issueComment: IssueComment, issueDisputes: IssueDispute[]): string[] {
    let matches;
    const toDoList: string[] = [];
    const regex = /- .* Done/gi;

    if (this.userService.currentUser.role !== this.userRole.Tutor) {
      return toDoList;
    }

    if (!issueComment && issueDisputes) {
      for (const dispute of issueDisputes) {
        toDoList.push(dispute.todo);
      }
      return toDoList;
    }

    while (matches = regex.exec(issueComment.description)) {
      if (matches) {
        toDoList.push(matches[0]);
      }
    }
    return toDoList;
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
      } else if (label['name'] === 'unsure') {
        result = {
          ...result,
          unsure: true,
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

  setIssueTeamFilter(filterValue: string) {
    if (filterValue) {
      this.issueTeamFilter = filterValue;
    }
  }

  getIssueTeamFilter(): string {
    return this.issueTeamFilter;
  }
}

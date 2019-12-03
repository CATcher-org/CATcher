import { TeamResponseTemplate } from './templates/team-response-template.model';
import { Issue } from './issue.model';
import { IssueDispute } from './issue-dispute.model';
import { IssueComment } from './comment.model';
import { TutorModerationIssueTemplate } from './templates/tutor-moderation-issue-template.model';
import { TutorModerationTodoTemplate } from './templates/tutor-moderation-todo-template.model';
import { Team } from './team.model';
import { TesterResponse } from './tester-response.model';
import { TesterResponseTemplate } from './templates/tester-response-template.model';
import { GithubIssue, GithubLabel } from './github-issue.model';
import * as moment from 'moment';
import { GithubComment } from './github-comment.model';

export class BaseIssue implements Issue {

  /** Basic Fields */
  readonly id: number;
  readonly created_at: string;
  title: string;
  description: string;

  /** Fields derived from Labels */
  severity: string;
  type: string;
  responseTag?: string;
  duplicated?: boolean;
  status?: string;
  pending?: string;
  unsure?: boolean;
  teamAssigned?: Team;

  /** Depending on the phase, assignees attribute can be derived from Github's assignee feature OR from the Github's issue description */
  assignees?: string[];

  /** Fields derived from parsing of Github's issue description */
  duplicateOf?: number;
  todoList?: string[];
  teamResponse?: string;
  tutorResponse?: string;
  testerResponses?: TesterResponse[];
  issueComment?: IssueComment; // Issue comment is used for Tutor Response and Tester Response
  issueDisputes?: IssueDispute[];

  protected constructor(githubIssue: GithubIssue) {
    /** Basic Fields */
    this.id = +githubIssue.number;
    this.created_at = moment(githubIssue.created_at).format('lll');
    this.title = githubIssue.title;
    this.description = githubIssue.body;

    /** Fields derived from Labels */
    this.severity = githubIssue.findLabel(GithubLabel.LABELS.severity);
    this.type = githubIssue.findLabel(GithubLabel.LABELS.type);
    this.responseTag = githubIssue.findLabel(GithubLabel.LABELS.response);
    this.duplicated = !!githubIssue.findLabel(GithubLabel.LABELS.duplicated, false);
    this.status = githubIssue.findLabel(GithubLabel.LABELS.status);
    this.pending = githubIssue.findLabel(GithubLabel.LABELS.pending);
  }

  public static createPhaseBugReportingIssue(githubIssue: GithubIssue): BaseIssue {
    return new BaseIssue(githubIssue);
  }

  public static createPhaseTeamResponseIssue(githubIssue: GithubIssue, githubComments: GithubComment[],
                                             teamData: Team): Issue {
    const issue = new BaseIssue(githubIssue);
    const template = new TeamResponseTemplate(githubComments);

    issue.teamAssigned = teamData;
    issue.issueComment = template.comment;
    issue.teamResponse = template.teamResponse !== undefined ? template.teamResponse.content : undefined;
    issue.duplicateOf = template.duplicateOf !== undefined ? template.duplicateOf.issueNumber : undefined;
    issue.duplicated = issue.duplicateOf !== undefined && issue.duplicateOf !== null;
    issue.assignees = githubIssue.assignees.map(assignee => assignee.login);

    return issue;
  }

  public static createPhaseTesterResponseIssue(githubIssue: GithubIssue, githubComments: GithubComment[]): Issue {
    const issue = new BaseIssue(githubIssue);
    const template = new TesterResponseTemplate(githubComments);
    issue.issueComment = template.comment;
    issue.teamResponse = template.teamResponse !== undefined ? template.teamResponse.content : undefined;
    issue.testerResponses = template.testerResponse.testerResponses;
    return issue;
  }

  public static createPhaseModerationIssue(githubIssue: GithubIssue, githubComments: GithubComment[]): Issue {
    const issue = new BaseIssue(githubIssue);
    const issueTemplate = new TutorModerationIssueTemplate(githubIssue);
    const todoTemplate = new TutorModerationTodoTemplate(githubComments);

    issue.description = issueTemplate.description.content;
    issue.teamResponse = issueTemplate.teamResponse.content;
    issue.issueDisputes = issueTemplate.dispute.disputes;
    issue.todoList = todoTemplate.moderation.todoList;
    return issue;
  }
}

import { Team } from './team.model';
import { TesterResponse } from './tester-response.model';
import { IssueComment } from './comment.model';
import { IssueDispute } from './issue-dispute.model';
import { GithubIssue, GithubLabel } from './github/github-issue.model';
import { GithubComment } from './github/github-comment.model';
import { TeamResponseTemplate } from './templates/team-response-template.model';
import { TesterResponseTemplate } from './templates/tester-response-template.model';
import { TutorModerationIssueTemplate } from './templates/tutor-moderation-issue-template.model';
import { TutorModerationTodoTemplate } from './templates/tutor-moderation-todo-template.model';
import { Phase } from '../services/phase.service';
import * as moment from 'moment';

export class Issue {

  /** Basic Fields */
  readonly id: number;
  readonly created_at: string;
  readonly githubIssue: GithubIssue;
  githubComments: GithubComment[];
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
  teamResponse?: string;
  testerResponses?: TesterResponse[];
  issueComment?: IssueComment; // Issue comment is used for Tutor Response and Tester Response
  issueDisputes?: IssueDispute[];

    /**
   * Processes and cleans a raw issue description obtained from user input.
   */
  static updateDescription(description: string): string {
    const defaultString = 'No details provided by bug reporter.';
    return Issue.orDefaultString(description, defaultString);
  }

  /**
   * Processes and cleans a raw team response obtained from user input.
   */
  static updateTeamResponse(teamResponse: string): string {
    const defaultString = 'No details provided by team.';
    return Issue.orDefaultString(teamResponse, defaultString);
  }

  /**
   * Given two strings, returns the first if it is not an empty string or a false value such as null/undefined.
   * Returns the second string if the first is an empty string.
   */
  private static orDefaultString(stringA: string, def: string): string {
    if (!stringA) {
      return def;
    }
    return stringA.length !== 0 ? stringA : def;
  }

  protected constructor(githubIssue: GithubIssue) {
    /** Basic Fields */
    this.id = +githubIssue.number;
    this.created_at = moment(githubIssue.created_at).format('lll');
    this.title = githubIssue.title;
    this.description = Issue.updateDescription(githubIssue.body);
    this.githubIssue = githubIssue;

    /** Fields derived from Labels */
    this.severity = githubIssue.findLabel(GithubLabel.LABELS.severity);
    this.type = githubIssue.findLabel(GithubLabel.LABELS.type);
    this.responseTag = githubIssue.findLabel(GithubLabel.LABELS.response);
    this.duplicated = !!githubIssue.findLabel(GithubLabel.LABELS.duplicated, false);
    this.status = githubIssue.findLabel(GithubLabel.LABELS.status);
    this.pending = githubIssue.findLabel(GithubLabel.LABELS.pending);
  }

  public static createPhaseBugReportingIssue(githubIssue: GithubIssue): Issue {
    return new Issue(githubIssue);
  }

  public static createPhaseTeamResponseIssue(githubIssue: GithubIssue, githubComments: GithubComment[],
                                             teamData: Team): Issue {
    const issue = new Issue(githubIssue);
    const template = new TeamResponseTemplate(githubComments);

    issue.githubComments = githubComments;
    issue.teamAssigned = teamData;
    issue.issueComment = template.comment;
    issue.teamResponse = Issue.updateTeamResponse(template.teamResponse.content);
    issue.duplicateOf = template.duplicateOf !== undefined ? template.duplicateOf.issueNumber : undefined;
    issue.duplicated = issue.duplicateOf !== undefined && issue.duplicateOf !== null;
    issue.assignees = githubIssue.assignees.map(assignee => assignee.login);
    return issue;
  }

  public static createPhaseTesterResponseIssue(githubIssue: GithubIssue, githubComments: GithubComment[]): Issue {
    const issue = new Issue(githubIssue);
    const template = new TesterResponseTemplate(githubComments);

    issue.githubComments = githubComments;
    issue.issueComment = template.comment;
    issue.teamResponse = Issue.updateTeamResponse(template.teamResponse.content);
    issue.testerResponses = template.testerResponse !== undefined ? template.testerResponse.testerResponses : undefined;
    return issue;
  }

  public static createPhaseModerationIssue(githubIssue: GithubIssue, githubComments: GithubComment[],
                                           teamData: Team): Issue {
    const issue = new Issue(githubIssue);
    const issueTemplate = new TutorModerationIssueTemplate(githubIssue);
    const todoTemplate = new TutorModerationTodoTemplate(githubComments);

    issue.githubComments = githubComments;
    issue.teamAssigned = teamData;
    issue.description = issueTemplate.description.content;
    issue.teamResponse = Issue.updateTeamResponse(issueTemplate.teamResponse.content);
    issue.issueDisputes = issueTemplate.dispute.disputes;

    if (todoTemplate.moderation && todoTemplate.comment) {
      issue.issueDisputes = todoTemplate.moderation.disputesToResolve.map((dispute, i) => {
        dispute.description = issueTemplate.dispute.disputes[i].description;
        return dispute;
      });
      issue.issueComment = todoTemplate.comment;
    }
    return issue;
  }

  /**
   * Creates a new copy of an exact same issue.
   * This would come useful in the event when you want to update the issue but not the actual
   * state of the application.
   */
  clone(phase: Phase): Issue {
    switch (phase) {
      case Phase.phaseBugReporting:
        return Issue.createPhaseBugReportingIssue(this.githubIssue);
      case Phase.phaseTeamResponse:
        return Issue.createPhaseTeamResponseIssue(this.githubIssue, this.githubComments, this.teamAssigned);
      case Phase.phaseTesterResponse:
        return Issue.createPhaseTesterResponseIssue(this.githubIssue, this.githubComments);
      case Phase.phaseModeration:
        return Issue.createPhaseModerationIssue(this.githubIssue, this.githubComments, this.teamAssigned);
      default:
        return Issue.createPhaseBugReportingIssue(this.githubIssue);
    }
  }

  /**
   * Depending on the phase of the peer testing, each phase will have a response associated to them.
   * This function will allow the current instance of issue to retain the state of response of the given `issue`.
   *
   * @param phase - The phase in which you want to retain your responses.
   * @param issue - The issue which you want your current instance to retain from.
   */
  retainResponses(phase: Phase, issue: Issue) {
    this.issueComment = issue.issueComment;
    this.githubComments = issue.githubComments;
    switch (phase) {
      case Phase.phaseBugReporting:
        this.description = issue.description;
        break;
      case Phase.phaseTeamResponse:
        this.teamResponse = issue.teamResponse;
        break;
      case Phase.phaseTesterResponse:
        this.testerResponses = issue.testerResponses;
        this.teamResponse = issue.teamResponse;
        break;
      case Phase.phaseModeration:
        this.issueDisputes = issue.issueDisputes;
        break;
      default:
        break;
    }
  }

  /**
   * Updates the tester's responses and team response based on the given githubComment.
   * @param githubComment - A version of githubComment to update the issue with.
   */
  updateTesterResponse(githubComment: GithubComment): void {
    const template = new TesterResponseTemplate([githubComment]);
    this.issueComment = template.comment;
    this.teamResponse = template.teamResponse !== undefined ? template.teamResponse.content : undefined;
    this.testerResponses = template.testerResponse !== undefined ? template.testerResponse.testerResponses : undefined;
  }

  /**
   * Updates the tutor's resolution of the disputes with a new version of githubComment.
   * @param githubComment - A version of githubComment to update the dispute with.
   */
  updateDispute(githubComment: GithubComment): void {
    const todoTemplate = new TutorModerationTodoTemplate([githubComment]);
    this.issueComment = todoTemplate.comment;
    this.issueDisputes = todoTemplate.moderation.disputesToResolve.map((dispute, i) => {
      dispute.description = this.issueDisputes[i].description;
      return dispute;
    });
  }

  // Template url: https://github.com/CATcher-org/templates#dev-response-phase
  createGithubTeamResponse(): string {
    return `# Team\'s Response\n${this.teamResponse}\n ` +
      `## Duplicate status (if any):\n${this.duplicateOf ? `Duplicate of #${this.duplicateOf}` : `--`}`;
  }

  // Template url: https://github.com/CATcher-org/templates#tutor-moderation
  createGithubTutorResponse(): string {
    let tutorResponseString = '# Tutor Moderation\n\n';
    for (const issueDispute of this.issueDisputes) {
      tutorResponseString += issueDispute.toTutorResponseString();
    }
    return tutorResponseString;
  }

  // Template url: https://github.com/CATcher-org/templates#teams-response-1
  createGithubTesterResponse(): string {
    return `# Team\'s Response\n${this.teamResponse}\n ` +
      `# Items for the Tester to Verify\n${this.getTesterResponsesString(this.testerResponses)}`;
  }

  /**
   * Gets the number of unresolved disputes in an Issue.
   */
  numOfUnresolvedDisputes(): number {
    if (!this.issueDisputes) {
      return 0;
    }

    return this.issueDisputes.reduce((prev, current) => prev + Number(current.isDone()), 0);
  }

  private getTesterResponsesString(testerResponses: TesterResponse[]): string {
    let testerResponsesString = '';
    for (const testerResponse of testerResponses) {
      testerResponsesString += testerResponse.toString();
    }
    return testerResponsesString;
  }
}

export interface Issues {
  [id: number]: Issue;
}

export const SEVERITY_ORDER = { '-': 0 , VeryLow: 1, Low: 2, Medium: 3, High: 4 };

export const ISSUE_TYPE_ORDER = { '-': 0 , DocumentationBug: 1, FeatureFlaw: 2, FunctionalityBug: 3  };

export enum STATUS {
  Incomplete = 'Incomplete',
  Done = 'Done',
}

export const IssuesFilter = {
  phaseBugReporting: {
    Student: 'FILTER_BY_CREATOR',
    Tutor: 'NO_FILTER',
    Admin: 'NO_FILTER',
  },
  phaseTeamResponse: {
    Student: 'FILTER_BY_TEAM',
    Tutor: 'FILTER_BY_TEAM_ASSIGNED',
    Admin: 'NO_FILTER',
  },
  phaseTesterResponse: {
    Student: 'NO_FILTER',
    Tutor: 'NO_ACCESS',
    Admin: 'NO_FILTER',
  },
  phaseModeration: {
    Student: 'NO_ACCESS',
    Tutor: 'FILTER_BY_TEAM_ASSIGNED',
    Admin: 'NO_FILTER',
  }
};

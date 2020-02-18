import { Component, Input, OnInit, ViewChild } from '@angular/core';
import { Issue, STATUS } from '../../core/models/issue.model';
import { PermissionService } from '../../core/services/permission.service';
import { LabelService } from '../../core/services/label.service';
import { UserService } from '../../core/services/user.service';
import { GithubService } from '../../core/services/github.service';
import { IssueService } from '../../core/services/issue.service';
import { ErrorHandlingService } from '../../core/services/error-handling.service';
import { finalize } from 'rxjs/operators';
import { IssuesDataTable } from './IssuesDataTable';
import { MatPaginator, MatSort } from '@angular/material';

export enum ACTION_BUTTONS {
  VIEW_IN_WEB,
  MARK_AS_RESPONDED,
  MARK_AS_PENDING,
  RESPOND_TO_ISSUE,
  FIX_ISSUE,
  DELETE_ISSUE
}

export enum TABLE_COLUMNS {
  ID = 'id',
  TITLE = 'title',
  TEAM_ASSIGNED = 'teamAssigned',
  TYPE = 'type',
  SEVERITY = 'severity',
  RESPONSE = 'responseTag',
  ASSIGNEE = 'assignees',
  DUPLICATED_ISSUES = 'duplicatedIssues',
  TODO = 'Todo Remaining',
  ACTIONS = 'actions'
}

@Component({
  selector: 'app-issue-tables',
  templateUrl: './issue-tables.component.html',
  styleUrls: ['./issue-tables.component.css']
})
export class IssueTablesComponent implements OnInit {

  @Input() headers: string[];
  @Input() actions: ACTION_BUTTONS[];
  @Input() filters?: any = undefined;

  @ViewChild(MatSort) sort: MatSort;
  @ViewChild(MatPaginator) paginator: MatPaginator;

  issues: IssuesDataTable;
  issuesPendingDeletion: {[id: number]: boolean};
  private readonly action_buttons = ACTION_BUTTONS;

  constructor(public userService: UserService,
              private permissions: PermissionService,
              private labelService: LabelService,
              private githubService: GithubService,
              private issueService: IssueService,
              private errorHandlingService: ErrorHandlingService) { }

  ngOnInit() {
    this.issues = new IssuesDataTable(this.issueService, this.errorHandlingService, this.sort,
      this.paginator, this.headers, this.filters);
    this.issues.loadIssues();
    this.issuesPendingDeletion = {};
  }

  /**
   * Formats the title text to account for those that contain long words.
   * @param title - Title of Issue that is to be displayed in the Table Row.
   */
  fitTitleText(title: string): string {

    // Arbitrary Length of Characters beyond which an overflow occurs.
    const MAX_WORD_LENGTH = 43;
    const SPLITTER_TEXT = ' ';
    const ELLIPSES = '...';

    return title.split(SPLITTER_TEXT).map(word => {
      if (word.length > MAX_WORD_LENGTH) {
        return word.substring(0, MAX_WORD_LENGTH - 5).concat(ELLIPSES);
      }
      return word;
    }).join(SPLITTER_TEXT);
  }

  isActionVisible(action: ACTION_BUTTONS): boolean {
    return this.actions.includes(action);
  }

  markAsResponded(issue: Issue) {
    this.issueService.updateIssue(<Issue>{
      ...issue,
      status: STATUS.Done
    }).subscribe((updatedIssue) => {
      this.issueService.updateLocalStore(updatedIssue);
    }, error => {
      this.errorHandlingService.handleError(error);
    });
    event.stopPropagation();
  }

  markAsPending(issue: Issue) {
    this.issueService.updateIssue(<Issue>{
      ...issue,
      status: STATUS.Incomplete
    }).subscribe((updatedIssue) => {
      this.issueService.updateLocalStore(updatedIssue);
    }, error => {
      this.errorHandlingService.handleError(error);
    });
    event.stopPropagation();
  }

  /**
   * Checks if all the disputes are resolved.
   */
  isTodoListChecked(issue: Issue): boolean {
    return issue.issueDisputes && issue.getUnresolvedDisputes() === 0;
  }

  deleteIssue(id: number) {
    this.issuesPendingDeletion = {
      ...this.issuesPendingDeletion,
      [id]: true,
    };
    this.issueService.deleteIssue(id).pipe(finalize(() => {
      const { [id]: issueRemoved, ...theRest } = this.issuesPendingDeletion;
      this.issuesPendingDeletion = theRest;
    })).subscribe((removedIssue) => {
    }, (error) => {
      this.errorHandlingService.handleError(error);
    });
    event.stopPropagation();
  }
}

import { Component, Input, OnInit } from '@angular/core';
import { Issue, STATUS } from '../../core/models/issue.model';
import { PermissionService } from '../../core/services/permission.service';
import { LabelService } from '../../core/services/label.service';
import { UserService } from '../../core/services/user.service';
import { GithubService } from '../../core/services/github.service';
import { IssueService } from '../../core/services/issue.service';
import { ErrorHandlingService } from '../../core/services/error-handling.service';

export enum ACTION_BUTTONS {
  VIEW_IN_WEB,
  MARK_AS_RESPONDED,
  RESPOND_TO_ISSUE
}

@Component({
  selector: 'app-issue-tables',
  templateUrl: './issue-tables.component.html',
  styleUrls: ['./issue-tables.component.css']
})
export class IssueTablesComponent implements OnInit {

  @Input() issues: Issue[];
  @Input() headers: string[];
  @Input() actions: ACTION_BUTTONS[];

  private readonly action_buttons = ACTION_BUTTONS;

  constructor(private permissions: PermissionService,
              private labelService: LabelService,
              private userService: UserService,
              private githubService: GithubService,
              private issueService: IssueService,
              private errorHandlingService: ErrorHandlingService) { }

  ngOnInit() {
  }

  isActionVisible(action: ACTION_BUTTONS): boolean {
    return this.actions.includes(action);
  }

  markAsResponded(issue: Issue) {
    this.issueService.updateIssue({
      ...issue,
      status: STATUS.Done
    }).subscribe((updatedIssue) => {
      this.issueService.updateLocalStore(updatedIssue);
    }, error => {
      this.errorHandlingService.handleHttpError(error);
    });
  }

  isTodoListExists(issue): boolean {
    return issue.todoList.length !== 0;
  }

  todoFinished(issue): number {
    let count = 0;
    if (!this.isTodoListExists(issue)) {
      return count;
    }

    for (const todo of issue.todoList) {
      if (todo.charAt(3) === 'x') {
        count += 1;
      }
    }
    return count;
  }

  isTodoListChecked(issue): boolean {
    if (!this.isTodoListExists(issue)) {
      return true;
    }

    if (this.todoFinished(issue) === issue.todoList.length) {
      return true;
    }
    return false;
  }
}

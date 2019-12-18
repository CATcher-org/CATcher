import { Component, OnInit, OnDestroy, OnChanges, Input, SimpleChanges } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Issue } from '../../core/models/issue.model';
import { IssueService } from '../../core/services/issue.service';
import { FormBuilder } from '@angular/forms';
import { ErrorHandlingService } from '../../core/services/error-handling.service';
import { IssueCommentService } from '../../core/services/issue-comment.service';
import { IssueComment } from '../../core/models/comment.model';
import { UserService } from '../../core/services/user.service';
import { Subscription } from 'rxjs';
import { PermissionService } from '../../core/services/permission.service';
import { UserRole } from '../../core/models/user.model';

export enum ISSUE_COMPONENTS {
  TESTER_POST,
  TEAM_RESPONSE,
  NEW_TEAM_RESPONSE,
  TESTER_RESPONSE,
  ISSUE_DISPUTE,
  SEVERITY_LABEL,
  TYPE_LABEL,
  RESPONSE_LABEL,
  ASSIGNEE,
  DUPLICATE,
  UNSURE_CHECKBOX
}

export const SUBMIT_BUTTON_TEXT = {
  SUBMIT: 'Submit',
  SAVE: 'Save',
  OVERWRITE: 'Overwrite',
};

@Component({
  selector: 'app-view-issue',
  templateUrl: './view-issue.component.html',
  styleUrls: ['./view-issue.component.css']
})
export class ViewIssueComponent implements OnInit, OnDestroy, OnChanges {
  issue: Issue;
  isIssueLoading = true;
  isTutorResponseEditing = false;
  isIssueDescriptionEditing = false;
  isTeamResponseEditing = false;
  issueSubscription: Subscription;

  @Input() issueId: number;
  @Input() issueComponents: ISSUE_COMPONENTS[];

  public readonly issueComponentsEnum = ISSUE_COMPONENTS;
  public readonly userRole = UserRole;

  constructor(private issueCommentService: IssueCommentService,
              private route: ActivatedRoute,
              private formBuilder: FormBuilder,
              private errorHandlingService: ErrorHandlingService,
              public permissions: PermissionService,
              public userService: UserService,
              public issueService: IssueService) { }

  ngOnInit() {
    this.pollIssue(this.issueId);
  }

  /**
   * Will be triggered when there is a change in issueId (e.g. there is a navigation from 1 issue page to another issue page)
   * @param changes - The changes being applied to @Input.
   */
  ngOnChanges(changes: SimpleChanges) {
    if (!changes.issueId.firstChange) {
      this.stopPolling();
      this.isIssueLoading = true;
      this.pollIssue(changes.issueId.currentValue);
    }
  }

  ngOnDestroy() {
    this.stopPolling();
  }

  isComponentVisible(component: ISSUE_COMPONENTS): boolean {
    return this.issueComponents.includes(component);
  }

  isEditing(): boolean {
    return this.isIssueDescriptionEditing || this.isTutorResponseEditing || this.isTeamResponseEditing;
  }

  updateIssue(newIssue: Issue) {
    this.issue = newIssue;
    this.issueService.updateLocalStore(newIssue);
  }

  updateComment(newComment: IssueComment) {
    this.issue.issueComment = newComment;
    this.issueCommentService.updateLocalStore(newComment, this.issueId);
    this.issueService.updateLocalStore(this.issue);
  }

  updateDescriptionEditState(updatedState: boolean) {
    this.isIssueDescriptionEditing = updatedState;
  }

  updateTeamResponseEditState(updatedState: boolean) {
    this.isTeamResponseEditing = updatedState;
  }

  updateTutorResponseEditState(updatedState: boolean) {
    this.isTutorResponseEditing = updatedState;
  }

  private pollIssue(id: number): void {
    this.issueSubscription = this.issueService.pollIssue(id).subscribe((issue: Issue) => {
      if (this.isIssueDescriptionEditing) {
        const issueClone = issue.clone();
        issueClone.description = this.issue.description;
        this.issue = issueClone;
      } else {
        this.issue = issue;
      }
      this.isIssueLoading = false;
    }, (error) => {
      this.errorHandlingService.handleHttpError(error, () => this.pollIssue(id));
    });
  }

  private stopPolling(): void {
    if (this.issueSubscription) {
      this.issueSubscription.unsubscribe();
    }
  }
}

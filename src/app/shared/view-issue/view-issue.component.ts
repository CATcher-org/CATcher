import { Component, OnInit, OnDestroy, Input } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Issue } from '../../core/models/issue.model';
import { IssueService } from '../../core/services/issue.service';
import { FormBuilder } from '@angular/forms';
import { finalize } from 'rxjs/operators';
import { ErrorHandlingService } from '../../core/services/error-handling.service';
import { IssueCommentService } from '../../core/services/issue-comment.service';
import { IssueComment, IssueComments } from '../../core/models/comment.model';
import { UserService } from '../../core/services/user.service';
import { Subscription } from 'rxjs';
import { PermissionService } from '../../core/services/permission.service';
import { UserRole } from '../../core/models/user.model';

export enum ISSUE_COMPONENTS {
  TESTER_POST,
  TEAM_RESPONSE,
  NEW_TEAM_RESPONSE,
  TUTOR_RESPONSE, // Old component, unused
  NEW_TUTOR_RESPONSE, // Old component, unused
  TESTER_RESPONSE,
  ISSUE_DISPUTE,
  SEVERITY_LABEL,
  TYPE_LABEL,
  RESPONSE_LABEL,
  ASSIGNEE,
  DUPLICATE,
  TODO_LIST,
  UNSURE_CHECKBOX
}

@Component({
  selector: 'app-view-issue',
  templateUrl: './view-issue.component.html',
  styleUrls: ['./view-issue.component.css']
})
export class ViewIssueComponent implements OnInit, OnDestroy {
  issue: Issue;
  isIssueLoading = true;
  isTutorResponseEditing = false;
  isIssueDescriptionEditing = false;
  isTeamResponseEditing = false;
  issueSubscription: Subscription;
  issueCommentSubscription: Subscription;

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
    this.route.params.subscribe(
      params => {
        this.initializeIssue(this.issueId);
      }
    );
  }

  isComponentVisible(component: ISSUE_COMPONENTS): boolean {
    return this.issueComponents.includes(component);
  }

  isEditing(): boolean {
    return !this.isIssueDescriptionEditing && !this.isTutorResponseEditing && !this.isTeamResponseEditing;
  }

  private initializeIssue(id: number) {
    this.getIssue(id);
  }

  private getIssue(id: number) {
    this.issueSubscription = this.issueService.getAllIssues().subscribe((issues) => {
        this.issue = issues.find(issue => issue.id === id);
        this.isIssueLoading = false;
    }, (error) => {
      this.errorHandlingService.handleHttpError(error, () => this.initializeIssue(id));
    });
  }

  updateIssue(newIssue: Issue) {
    this.issue = newIssue;
    this.issueService.updateLocalStore(this.issue);
  }

  updateComment(newComment: IssueComment) {
    this.issue.issueComment = newComment;
    this.issueService.updateLocalStore(this.issue);
    this.issueCommentService.updateLocalStore(newComment, this.issueId);
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

  ngOnDestroy() {
    this.issueSubscription.unsubscribe();
  }

}

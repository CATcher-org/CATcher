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
  TUTOR_RESPONSE,
  NEW_TUTOR_RESPONSE,
  TESTER_RESPONSE,
  SEVERITY_LABEL,
  TYPE_LABEL,
  RESPONSE_LABEL,
  ASSIGNEE,
  DUPLICATE,
  TODO_LIST
}

@Component({
  selector: 'app-view-issue',
  templateUrl: './view-issue.component.html',
  styleUrls: ['./view-issue.component.css']
})
export class ViewIssueComponent implements OnInit, OnDestroy {
  issue: Issue;
  comments: IssueComment[];
  issueComment: IssueComment;
  isIssueLoading = true;
  isCommentsLoading = true;
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
    this.route.params.subscribe(
      params => {
        this.initializeIssue(this.issueId);
        this.initializeComments(this.issueId);
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

  updateDescriptionEditState(updatedState: boolean) {
    this.isIssueDescriptionEditing = updatedState;
  }

  updateTeamResponseEditState(updatedState: boolean) {
    this.isTeamResponseEditing = updatedState;
  }

  updateTutorResponseEditState(updatedState: boolean) {
    this.isTutorResponseEditing = updatedState;
  }

  setTeamAndTesterResponse() {
    this.issue.teamResponse = this.issueService.parseTeamResponse(this.issueComment.description);
    this.issue.testerResponses = this.issueService.parseTesterResponse(this.issueComment.description);
  }

  private initializeComments(id: number) {
    this.issueCommentService.getIssueComments(id).pipe(finalize(() => this.isCommentsLoading = false))
      .subscribe((issueComments: IssueComments) => {
        this.issueComment = issueComments.comments[0];
        // If there is no comment in the issue, don't need to continue
        if (!this.issueComment) {
          return;
        }
        // For Tester Response Phase, where team and tester response items are in the issue comment
        this.setTeamAndTesterResponse();
      }, (error) => {
        this.errorHandlingService.handleHttpError(error, () => this.initializeComments(id));
      });
  }

  ngOnDestroy() {
    this.issueSubscription.unsubscribe();
  }

}

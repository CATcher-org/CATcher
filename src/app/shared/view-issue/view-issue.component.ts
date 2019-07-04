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

export enum ISSUE_COMPONENTS {
  TEAM_RESPONSE,
  TUTOR_RESPONSE,
  SEVERITY_LABEL,
  TYPE_LABEL,
  RESPONSE_LABEL,
  ASSIGNEE,
  DUPLICATE,
  TODO
}

@Component({
  selector: 'app-view-issue',
  templateUrl: './view-issue.component.html',
  styleUrls: ['./view-issue.component.css']
})
export class ViewIssueComponent implements OnInit, OnDestroy {

  issue: Issue;
  comments: IssueComment[];
  isIssueLoading = true;
  isCommentsLoading = true;
  isTutorResponseEditing = false;
  isTeamResponseEditing = false;
  isIssueDescriptionEditing = false;
  isEditing = false;
  isResponseEditing = false;
  issueSubscription: Subscription;

  @Input() issueId: number;
  @Input() issue_components: ISSUE_COMPONENTS[];

  private readonly issue_components_enum = ISSUE_COMPONENTS;

  constructor(private issueCommentService: IssueCommentService,
              private route: ActivatedRoute,
              private formBuilder: FormBuilder,
              private errorHandlingService: ErrorHandlingService,
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
    return this.issue_components.includes(component);
  }

  canDeactivate() {
    return !this.isEditing && !this.isTutorResponseEditing && !this.isIssueDescriptionEditing
    && !this.isTeamResponseEditing && !this.isResponseEditing;
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

  updateEditState(newState: boolean) {
    this.isEditing = newState;
  }

  updateResponseEditState(updatedState: boolean) {
    this.isResponseEditing = updatedState;
  }

  updateTutorResponseEditState(updatedState: boolean) {
    this.isTutorResponseEditing = updatedState;
  }

  updateDescriptionEditState(updatedState: boolean) {
    this.isIssueDescriptionEditing = updatedState;
  }

  updateTeamResponseEditState(updatedState: boolean) {
    this.isTeamResponseEditing = updatedState;
  }

  private initializeComments(id: number) {
    this.issueCommentService.getIssueComments(id).pipe(finalize(() => this.isCommentsLoading = false))
      .subscribe((issueComments: IssueComments) => {
        this.comments = issueComments.comments;
        console.log('Comments: ', this.comments);
      }, (error) => {
        this.errorHandlingService.handleHttpError(error, () => this.initializeComments(id));
      });
  }

  ngOnDestroy() {
    this.issueSubscription.unsubscribe();
  }

}

import { Component, OnInit, OnDestroy } from '@angular/core';
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

@Component({
  selector: 'app-issue',
  templateUrl: './issue.component.html',
  styleUrls: ['./issue.component.css']
})
export class IssueComponent implements OnInit, OnDestroy {

  issue: Issue;
  comments: IssueComment[];
  isCommentsLoading = true;
  isTutorResponseEditing = false;
  isTeamResponseEditing = false;
  isIssueDescriptionEditing = false;
  issueSubscription: Subscription;
  isIssueLoading = true;

  constructor(private issueCommentService: IssueCommentService,
              private route: ActivatedRoute,
              private formBuilder: FormBuilder,
              private errorHandlingService: ErrorHandlingService,
              public userService: UserService,
              public issueService: IssueService) { }

  ngOnInit() {
    this.initialiseData();
  }

  initialiseData() {
    this.route.params.subscribe(
      params => {
        const id = +params['issue_id'];
        this.initializeIssue(id);
        this.initializeComments(id);
      }
    );
  }

  canDeactivate() {
    return !this.isTutorResponseEditing && !this.isIssueDescriptionEditing && !this.isTeamResponseEditing;
  }

  private initializeIssue(id: number) {
    this.issueSubscription = this.issueService.getIssues().subscribe((issues) => {
      if (issues !== undefined) {
        this.issue = issues[id];
        this.isIssueLoading = false;
      }
    }, (error) => {
      this.errorHandlingService.handleHttpError(error, () => this.initializeIssue(id));
    });
  }

  updateIssue(newIssue: Issue) {
    this.issue = newIssue;
    this.issueService.updateLocalStore(this.issue);
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

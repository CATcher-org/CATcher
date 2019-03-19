import {Component, OnInit} from '@angular/core';
import {ActivatedRoute} from '@angular/router';
import {Issue} from '../../core/models/issue.model';
import {IssueService} from '../../core/services/issue.service';
import {FormBuilder} from '@angular/forms';
import {finalize} from 'rxjs/operators';
import {ErrorHandlingService} from '../../core/services/error-handling.service';
import {IssueCommentService} from '../../core/services/issue-comment.service';
import {IssueComments} from '../../core/models/comment.model';
import {UserService} from '../../core/services/user.service';
import {PermissionService} from '../../core/services/permission.service';

@Component({
  selector: 'app-issue',
  templateUrl: './issue.component.html',
  styleUrls: ['./issue.component.css']
})
export class IssueComponent implements OnInit {
  issue: Issue;
  comments: IssueComments;
  isIssueLoading = true;
  isCommentsLoading = true;

  constructor(private issueService: IssueService,
              private issueCommentService: IssueCommentService,
              private route: ActivatedRoute,
              private formBuilder: FormBuilder,
              private errorHandlingService: ErrorHandlingService,
              public userService: UserService,
              public permissions: PermissionService) { }

  ngOnInit() {
    this.initializeIssue();
  }


  updateIssue(newIssue: Issue) {
    this.issue = newIssue;
    // overwrite the duplicateOf value with the most updated duplicateOf value that is provided the by latest comment.
    if (this.comments.teamResponse && this.comments.teamResponse.duplicateOf) {
      this.issue = {
        ...this.issue,
        duplicateOf: this.comments.teamResponse.duplicateOf,
      };
    }
    this.issueService.updateLocalStore(this.issue);
  }

  updateComments(newComments: IssueComments) {
    this.comments = newComments;
    this.issueCommentService.updateLocalStore(newComments);
    this.updateIssue(this.issue);
  }

  /**
   * Will obtain the issue from IssueService and then check whether the responses (aka comments) has been loaded into the application.
   * If they are not loaded, retrieve the comments from github. Else just use the already retrieved comments.
   */
  private initializeIssue() {
    const id = +this.route.snapshot.paramMap.get('issue_id');
    this.getIssue(id);
    this.getComments(id);
  }

  private getIssue(id: number) {
    this.issueService.getIssue(id).pipe(finalize(() => this.isIssueLoading = false)).subscribe((issue) => {
      this.issue = issue;
    }, (error) => {
      this.errorHandlingService.handleHttpError(error, () => this.initializeIssue());
    });
  }

  private getComments(id: number) {
    this.issueCommentService.getIssueComments(id).pipe(finalize(() => this.isCommentsLoading =  false)).subscribe((comments) => {
      this.comments = comments;
      this.updateIssue(this.issue);
    }, (error) => {
      this.errorHandlingService.handleHttpError(error, () => this.initializeIssue());
    });
  }
}

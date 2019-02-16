import {Component, OnInit} from '@angular/core';
import {ActivatedRoute} from '@angular/router';
import {Issue} from '../core/models/issue.model';
import {IssueService} from '../core/services/issue.service';
import {FormBuilder} from '@angular/forms';
import {ErrorHandlingService} from '../core/services/error-handling.service';
import {IssueComments} from '../core/models/comment.model';
import {IssueCommentService} from '../core/services/issue-comment.service';
import {forkJoin} from 'rxjs';
import {UserService} from '../core/services/user.service';

@Component({
  selector: 'app-issue',
  templateUrl: './issue.component.html',
  styleUrls: ['./issue.component.css']
})
export class IssueComponent implements OnInit {
  isPageLoading = true;
  issue: Issue;
  comments: IssueComments;

  constructor(private issueService: IssueService,
              private issueCommentService: IssueCommentService,
              private route: ActivatedRoute,
              private formBuilder: FormBuilder,
              private errorHandlingService: ErrorHandlingService,
              public userService: UserService) { }

  ngOnInit() {
    this.initializeIssue();
  }


  updateIssue(newIssue: Issue) {
    this.issue = newIssue;
    this.issueService.updateLocalStore(newIssue);
  }

  updateComments(newComments: IssueComments) {
    this.comments = newComments;
    this.issueCommentService.updateLocalStore(newComments);
  }

  /**
   * Will obtain the issue from IssueService and then check whether the responses (aka comments) has been loaded into the application.
   * If they are not loaded, retrieve the comments from github. Else just use the already retrieved comments.
   */
  private initializeIssue() {
    const id = +this.route.snapshot.paramMap.get('issue_id');
    forkJoin(this.issueService.getIssue(id), this.issueCommentService.getIssueComments(id)).subscribe((res) => {
      this.issue = res[0];
      this.comments = res[1];
      this.isPageLoading = false;
    }, (error) => {
      this.errorHandlingService.handleHttpError(error, () => this.initializeIssue());
    });
  }
}

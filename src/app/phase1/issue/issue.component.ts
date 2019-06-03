import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Issue } from '../../core/models/issue.model';
import { IssueService } from '../../core/services/issue.service';
import { FormBuilder } from '@angular/forms';
import { finalize } from 'rxjs/operators';
import { ErrorHandlingService } from '../../core/services/error-handling.service';
import { IssueCommentService } from '../../core/services/issue-comment.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-issue',
  templateUrl: './issue.component.html',
  styleUrls: ['./issue.component.css']
})
export class IssueComponent implements OnInit, OnDestroy {
  issue: Issue;
  isEditing = false;
  issueSubscription: Subscription;
  isIssueLoading = true;

  constructor(private issueService: IssueService,
              private issueCommentService: IssueCommentService,
              private route: ActivatedRoute,
              private formBuilder: FormBuilder,
              private errorHandlingService: ErrorHandlingService) { }

  ngOnInit() {
    this.initializeIssue();
  }

  canDeactivate() {
    return !this.isEditing;
  }

  updateIssue(newIssue: Issue) {
    this.issue = newIssue;
    this.issueService.updateLocalStore(this.issue);
  }

  updateEditState(newState: boolean) {
    this.isEditing = newState;
  }

  /**
   * Will obtain the issue from IssueService and then check whether the responses (aka comments) has been loaded into the application.
   * If they are not loaded, retrieve the comments from github. Else just use the already retrieved comments.
   */
  private initializeIssue() {
    const id = +this.route.snapshot.paramMap.get('issue_id');
    this.getIssue(id);
  }

  private getIssue(id: number) {
    this.issueSubscription = this.issueService.getIssues().subscribe((issues) => {
      if (issues !== undefined) {
        this.issue = issues[id];
        this.isIssueLoading = false;
      }
    }, (error) => {
      this.errorHandlingService.handleHttpError(error, () => this.initializeIssue());
    });
  }

  ngOnDestroy() {
    this.issueSubscription.unsubscribe();
  }

}

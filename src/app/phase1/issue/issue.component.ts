import {Component, OnInit} from '@angular/core';
import {ActivatedRoute, Router, NavigationEnd} from '@angular/router';
import {Issue} from '../../core/models/issue.model';
import {IssueService} from '../../core/services/issue.service';
import {FormBuilder} from '@angular/forms';
import {finalize} from 'rxjs/operators';
import {ErrorHandlingService} from '../../core/services/error-handling.service';
import {IssueCommentService} from '../../core/services/issue-comment.service';

@Component({
  selector: 'app-issue',
  templateUrl: './issue.component.html',
  styleUrls: ['./issue.component.css']
})
export class IssueComponent implements OnInit {
  issue: Issue;
  isIssueLoading = true;
  isEditing = false;
  private navigationSubscription;
  private runOnce = false;

  constructor(private issueService: IssueService,
              private issueCommentService: IssueCommentService,
              private route: ActivatedRoute,
              private router: Router,
              private formBuilder: FormBuilder,
              private errorHandlingService: ErrorHandlingService) {
                this.navigationSubscription = this.router.events.subscribe((e: any) => {
                  // If it is a NavigationEnd event re-initalise the data
                  if (e instanceof NavigationEnd) {
                    if (this.runOnce) {
                      this.issueService.reset();
                      this.initializeIssue();
                    }
                  }
                });
              }

  ngOnInit() {
    this.initializeIssue();
    this.runOnce = true;
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
    this.issueService.getIssue(id).pipe(finalize(() => this.isIssueLoading = false)).subscribe((issue) => {
      this.issue = issue;
    }, (error) => {
      this.errorHandlingService.handleHttpError(error, () => this.initializeIssue());
    });
  }

  ngOnDestroy() {
    if (this.navigationSubscription) {
       this.navigationSubscription.unsubscribe();
    }
  }
}

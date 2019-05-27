import { Component, OnInit, OnDestroy } from '@angular/core';
import {ActivatedRoute, Router, NavigationEnd} from '@angular/router';
import {Issue} from '../../core/models/issue.model';
import {IssueService} from '../../core/services/issue.service';
import {FormBuilder} from '@angular/forms';
import {finalize} from 'rxjs/operators';
import {ErrorHandlingService} from '../../core/services/error-handling.service';
import {IssueCommentService} from '../../core/services/issue-comment.service';
import {IssueComment, IssueComments} from '../../core/models/comment.model';
import {UserService} from '../../core/services/user.service';

@Component({
  selector: 'app-issue',
  templateUrl: './issue.component.html',
  styleUrls: ['./issue.component.css']
})
export class IssueComponent implements OnInit, OnDestroy {

  issue: Issue;
  comments: IssueComment[];
  isIssueLoading = true;
  isCommentsLoading = true;
  isTutorResponseEditing = false;
  isTeamResponseEditing = false;
  isIssueDescriptionEditing = false;
  private navigationSubscription;
  private runOnce = false;

  constructor(private issueCommentService: IssueCommentService,
              private route: ActivatedRoute,
              private formBuilder: FormBuilder,
              private errorHandlingService: ErrorHandlingService,
              public userService: UserService,
              private router: Router,
              public issueService: IssueService) {
                this.navigationSubscription = this.router.events.subscribe((e: any) => {
                  // If it is a NavigationEnd event re-initalise the data
                  if (e instanceof NavigationEnd && this.runOnce) {
                      this.issueService.reset();
                      this.issueCommentService.reset();
                      this.initialiseData();
                  }
                });
              }

  ngOnInit() {
    this.initialiseData();
    this.runOnce = true;
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
    this.getIssue(id);
  }

  private getIssue(id: number) {
    this.issueService.getIssue(id).pipe(finalize(() => this.isIssueLoading = false)).subscribe((issue) => {
      this.issue = issue;
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
    if (this.navigationSubscription) {
       this.navigationSubscription.unsubscribe();
    }
  }
}

import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';
import {FormBuilder, FormGroup, NgForm, Validators} from '@angular/forms';
import {IssueService} from '../../../core/services/issue.service';
import {ErrorHandlingService} from '../../../core/services/error-handling.service';
import {PermissionService} from '../../../core/services/permission.service';
import {Issue} from '../../../core/models/issue.model';
import {IssueCommentService} from '../../../core/services/issue-comment.service';
import {IssueComment} from '../../../core/models/comment.model';
import { SUBMIT_BUTTON_TEXT } from '../../view-issue/view-issue.component';
import { forkJoin, throwError } from 'rxjs';
import { finalize, map } from 'rxjs/operators';
import { flatMap } from 'rxjs/internal/operators';
import { Conflict } from '../../../core/models/conflict.model';
import { ConflictDialogComponent, ConflictDialogData } from '../conflict-dialog/conflict-dialog.component';
import { MatDialog } from '@angular/material';
import { HttpErrorResponse } from '@angular/common/http';

@Component({
  selector: 'app-team-response',
  templateUrl: './team-response.component.html',
  styleUrls: ['./team-response.component.css'],
})
export class TeamResponseComponent implements OnInit {
  isSavePending = false;
  responseForm: FormGroup;
  conflict: Conflict;

  submitButtonText: string;

  @Input() issue: Issue;
  @Input() isEditing: boolean;
  @Output() issueUpdated = new EventEmitter<Issue>();
  @Output() updateEditState = new EventEmitter<boolean>();
  @Output() commentUpdated = new EventEmitter<IssueComment>();

  constructor(private issueService: IssueService,
              private formBuilder: FormBuilder,
              private issueCommentService: IssueCommentService,
              private errorHandlingService: ErrorHandlingService,
              private permissions: PermissionService,
              private dialog: MatDialog) {
  }

  ngOnInit() {
    this.responseForm = this.formBuilder.group({
      description: ['', Validators.required],
    });
    this.submitButtonText = SUBMIT_BUTTON_TEXT.SAVE;
  }

  changeToEditMode() {
    this.updateEditState.emit(true);
    this.responseForm.setValue({
      description: this.issue.teamResponse || ''
    });
  }

  updateResponse(form: NgForm) {
    if (this.responseForm.invalid) {
      return;
    }
    this.isSavePending = true;

    const updatedIssue = this.getUpdatedIssue();
    const updatedIssueComment = <IssueComment>{
      ...updatedIssue.issueComment,
      description: this.issueCommentService.createGithubTeamResponse(updatedIssue.teamResponse, updatedIssue.duplicateOf)
    };

    this.issueService.getLatestIssue(this.issue.id).pipe(
      map((issue: Issue) => {
        return issue.teamResponse === this.issue.teamResponse;
      }),
      flatMap((isSaveToUpdate: boolean) => {
        if (isSaveToUpdate || this.submitButtonText === SUBMIT_BUTTON_TEXT.OVERWRITE) {
          return forkJoin([this.issueService.updateIssue(updatedIssue),
            this.issueCommentService.updateIssueComment(updatedIssueComment)]);
        } else {
          this.conflict = new Conflict(this.issue.teamResponse, this.issueService.issues[this.issue.id].teamResponse);
          this.submitButtonText = SUBMIT_BUTTON_TEXT.OVERWRITE;
          this.viewChanges();
          return throwError('The content you are editing has changed. Please verify the changes and try again.');
        }
      }),
      finalize(() => this.isSavePending = false)
    ).subscribe((resultArr: [Issue, IssueComment]) => {
      const [issue, comment] = resultArr;
      this.commentUpdated.emit(comment);
      issue.issueComment = comment;
      issue.teamResponse = this.issueService.parseTeamResponseForTeamResponsePhase(comment.description);
      issue.duplicateOf = +this.issueService.parseDuplicateOfForTeamResponsePhase(comment.description);
      this.issueUpdated.emit(issue);
      this.resetToDefault();
      form.resetForm();
    }, (error) => {
      if (error instanceof HttpErrorResponse) {
        this.errorHandlingService.handleHttpError(error);
      } else {
        this.errorHandlingService.handleGeneralError(error);
      }
    });
  }

  canEditIssue(): boolean {
    return this.permissions.isTeamResponseEditable();
  }

  resetToDefault(): void {
    this.submitButtonText = SUBMIT_BUTTON_TEXT.SAVE;
    this.conflict = undefined;
    this.updateEditState.emit(false);
  }

  viewChanges(): void {
    this.dialog.open(ConflictDialogComponent, {
      data: <ConflictDialogData>{
        conflict: this.conflict
      },
      autoFocus: false
    });
  }

  /**
   * When user exits exit mode, we will need to sync the issue in IssueService with this component.
   */
  cancelEditMode(): void {
    this.issueService.getIssue(this.issue.id).subscribe((issue: Issue) => {
      this.issueUpdated.emit(issue);
      this.resetToDefault();
    });
  }

  private getUpdatedIssue(): Issue {
    return <Issue> {
      ...this.issue,
      teamResponse: this.responseForm.get('description').value
    };
  }
}

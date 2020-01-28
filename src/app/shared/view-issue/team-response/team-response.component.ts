import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';
import {FormBuilder, FormGroup, NgForm, Validators} from '@angular/forms';
import {IssueService} from '../../../core/services/issue.service';
import {ErrorHandlingService} from '../../../core/services/error-handling.service';
import {PermissionService} from '../../../core/services/permission.service';
import {Issue} from '../../../core/models/issue.model';
import {IssueCommentService} from '../../../core/services/issue-comment.service';
import {IssueComment} from '../../../core/models/comment.model';
import { SUBMIT_BUTTON_TEXT } from '../view-issue.component';
import { forkJoin, Observable, throwError } from 'rxjs';
import { finalize, map } from 'rxjs/operators';
import { flatMap } from 'rxjs/internal/operators';
import { Conflict } from '../../../core/models/conflict/conflict.model';
import { ConflictDialogComponent } from '../../issue/conflict-dialog/conflict-dialog.component';
import { MatDialog } from '@angular/material';
import { PhaseService } from '../../../core/services/phase.service';

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

  constructor(private issueService: IssueService,
              private formBuilder: FormBuilder,
              private issueCommentService: IssueCommentService,
              private errorHandlingService: ErrorHandlingService,
              private permissions: PermissionService,
              private dialog: MatDialog,
              private phaseService: PhaseService) {
  }

  ngOnInit() {
    this.responseForm = this.formBuilder.group({
      description: [''],
    });
    this.submitButtonText = SUBMIT_BUTTON_TEXT.SAVE;
  }

  changeToEditMode() {
    this.updateEditState.emit(true);
    this.responseForm.setValue({
      description: this.issue.teamResponse || '',
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
      description: updatedIssue.createGithubTeamResponse(),
    };

    this.isSafeToUpdate().pipe(
      flatMap((isSaveToUpdate: boolean) => {
        if (isSaveToUpdate || this.submitButtonText === SUBMIT_BUTTON_TEXT.OVERWRITE) {
          return forkJoin([this.issueService.updateIssue(updatedIssue),
            this.issueCommentService.updateIssueComment(updatedIssue.id, updatedIssueComment)]);
        } else if (this.isUpdatingDeletedResponse()) {
          return forkJoin([this.issueService.updateIssue(updatedIssue),
            this.issueCommentService.createIssueComment(this.issue.id, updatedIssueComment.description)]);
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
      issue.issueComment = comment;
      issue.teamResponse = this.issueService.parseTeamResponseForTeamResponsePhase(comment.description);
      issue.duplicateOf = +this.issueService.parseDuplicateOfForTeamResponsePhase(comment.description);
      this.issueUpdated.emit(issue);
      this.resetToDefault();
      form.resetForm();
    }, (error) => {
      this.errorHandlingService.handleError(error);
    });
  }

  /**
   * @return - Determines whether it is safe to updated an existing team response.
   */
  isSafeToUpdate(): Observable<boolean> {
    return this.issueService.getLatestIssue(this.issue.id).pipe(
      map((issue: Issue) => {
        return issue.teamResponse === this.issue.teamResponse;
      })
    );
  }

  /**
   * Determines whether the user is updating a response that has already been deleted on Github.
   */
  isUpdatingDeletedResponse(): boolean {
    return this.issue.teamResponse && !this.issueService.issues[this.issue.id].teamResponse;
  }

  canEditIssue(): boolean {
    return this.permissions.isTeamResponseEditable();
  }

  /**
   * Resets to default form state.
   */
  resetToDefault(): void {
    this.submitButtonText = SUBMIT_BUTTON_TEXT.SAVE;
    this.conflict = undefined;
    this.updateEditState.emit(false);
  }

  viewChanges(): void {
    this.dialog.open(ConflictDialogComponent, {
      data: this.conflict,
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
    const clone = this.issue.clone(this.phaseService.currentPhase);
    clone.teamResponse = this.responseForm.get('description').value;
    return clone;
  }
}

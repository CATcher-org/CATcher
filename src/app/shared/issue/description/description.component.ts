import { Component, EventEmitter, Input, OnInit, Output, ViewChild, ViewContainerRef } from '@angular/core';
import { FormBuilder, FormGroup, NgForm } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { throwError } from 'rxjs';
import { map, mergeMap } from 'rxjs/operators';
import { Conflict } from '../../../core/models/conflict/conflict.model';
import { Issue } from '../../../core/models/issue.model';
import { DialogService } from '../../../core/services/dialog.service';
import { ErrorHandlingService } from '../../../core/services/error-handling.service';
import { IssueService } from '../../../core/services/issue.service';
import { LoadingService } from '../../../core/services/loading.service';
import { PermissionService } from '../../../core/services/permission.service';
import { PhaseService } from '../../../core/services/phase.service';
import { SUBMIT_BUTTON_TEXT } from '../../view-issue/view-issue.component';
import { ConflictDialogComponent } from '../conflict-dialog/conflict-dialog.component';

@Component({
  selector: 'app-issue-description',
  templateUrl: './description.component.html',
  styleUrls: ['./description.component.css'],
  providers: [LoadingService]
})
export class DescriptionComponent implements OnInit {
  // The container of the loading spinner
  @ViewChild('loadingSpinnerContainer', {
    read: ViewContainerRef,
    static: false
  })
  loadingSpinnerContainer: ViewContainerRef;

  isSavePending = false;
  issueDescriptionForm: FormGroup;
  conflict: Conflict;
  submitButtonText: string;

  @Input() issue: Issue;
  @Input() descriptionTitle: string;
  @Input() isEditing: boolean;
  @Output() issueUpdated = new EventEmitter<Issue>();
  @Output() changeEditState = new EventEmitter<boolean>();

  // Messages for the modal popup window upon cancelling edit
  private readonly cancelEditModalMessages = ['Do you wish to cancel?', 'Your changes will be discarded.'];
  private readonly yesButtonModalMessage = 'Cancel';
  private readonly noButtonModalMessage = 'Continue editing';

  constructor(
    private issueService: IssueService,
    private formBuilder: FormBuilder,
    private errorHandlingService: ErrorHandlingService,
    private dialog: MatDialog,
    private phaseService: PhaseService,
    public permissions: PermissionService,
    private dialogService: DialogService,
    public loadingService: LoadingService
  ) {}

  showSpinner(): void {
    this.loadingService.addViewContainerRef(this.loadingSpinnerContainer).showLoader();
    this.isSavePending = true;
  }

  hideSpinner(): void {
    this.loadingService.hideLoader();
    this.isSavePending = false;
  }

  ngOnInit() {
    this.issueDescriptionForm = this.formBuilder.group({
      description: ['']
    });
    this.submitButtonText = SUBMIT_BUTTON_TEXT.SAVE;
    // Build the loading service spinner
    this.loadingService
      .addAnimationMode('indeterminate')
      .addSpinnerOptions({ diameter: 15, strokeWidth: 2 })
      .addTheme('warn')
      .addCssClasses(['mat-progress-spinner']);
  }

  changeToEditMode() {
    this.changeEditState.emit(true);
    this.issueDescriptionForm.setValue({
      description: this.issue['description'] || ''
    });
  }

  updateDescription(form: NgForm) {
    if (this.issueDescriptionForm.invalid) {
      return;
    }

    this.showSpinner();
    this.issueService
      .getLatestIssue(this.issue.id)
      .pipe(
        map((issue: Issue) => issue.description === this.issue.description),
        mergeMap((isSaveToUpdate: boolean) => {
          if (isSaveToUpdate || this.submitButtonText === SUBMIT_BUTTON_TEXT.OVERWRITE) {
            return this.issueService.updateIssue(this.getUpdatedIssue());
          } else {
            this.conflict = new Conflict(this.issue.description, this.issueService.issues[this.issue.id].description);
            this.submitButtonText = SUBMIT_BUTTON_TEXT.OVERWRITE;
            this.viewChanges();
            return throwError('The content you are editing has changed. Please verify the changes and try again.');
          }
        })
      )
      .subscribe(
        (editedIssue: Issue) => {
          this.issueUpdated.emit(editedIssue);
          this.resetToDefault();
          form.resetForm();
          this.hideSpinner();
        },
        (error) => {
          this.errorHandlingService.handleError(error);
          this.hideSpinner();
        }
      );
  }

  viewChanges(): void {
    this.dialog.open(ConflictDialogComponent, {
      data: this.conflict,
      autoFocus: false
    });
  }

  resetToDefault(): void {
    this.submitButtonText = SUBMIT_BUTTON_TEXT.SAVE;
    this.conflict = undefined;
    this.changeEditState.emit(false);
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

  openCancelDialogIfModified(): void {
    const isModified = this.dialogService.checkIfFieldIsModified(this.issueDescriptionForm, 'description', 'description', this.issue);
    this.dialogService.performActionIfModified(
      isModified,
      () => this.openCancelDialog(),
      () => this.cancelEditMode()
    );
  }

  openCancelDialog(): void {
    const dialogRef = this.dialogService.openUserConfirmationModal(
      this.cancelEditModalMessages,
      this.yesButtonModalMessage,
      this.noButtonModalMessage
    );

    dialogRef.afterClosed().subscribe((res) => {
      if (res) {
        this.cancelEditMode();
      }
    });
  }

  private getUpdatedIssue(): Issue {
    const newIssue = this.issue.clone(this.phaseService.currentPhase);
    newIssue.description = Issue.updateDescription(this.issueDescriptionForm.get('description').value);
    return newIssue;
  }
}

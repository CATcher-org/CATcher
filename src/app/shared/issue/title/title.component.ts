import { Component, EventEmitter, Input, OnInit, Output, ViewChild, ViewContainerRef } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, NgForm, Validators } from '@angular/forms';
import { finalize } from 'rxjs/operators';
import { Issue } from '../../../core/models/issue.model';
import { DialogService } from '../../../core/services/dialog.service';
import { ErrorHandlingService } from '../../../core/services/error-handling.service';
import { IssueService } from '../../../core/services/issue.service';
import { LoadingService } from '../../../core/services/loading.service';
import { PermissionService } from '../../../core/services/permission.service';
import { PhaseService } from '../../../core/services/phase.service';

@Component({
  selector: 'app-issue-title',
  templateUrl: './title.component.html',
  styleUrls: ['./title.component.css'],
  providers: [LoadingService]
})
export class TitleComponent implements OnInit {
  // The container of the loading spinner
  @ViewChild('loadingSpinnerContainer', {
    read: ViewContainerRef,
    static: false
  })
  loadingSpinnerContainer: ViewContainerRef;

  isEditing = false;
  isSavePending = false;
  issueTitleForm: FormGroup;

  @Input() issue: Issue;
  @Output() issueUpdated = new EventEmitter<Issue>();

  // Messages for the modal popup window upon cancelling edit
  private readonly cancelEditModalMessages = ['Do you wish to cancel?', 'Your changes will be discarded.'];
  private readonly yesButtonModalMessage = 'Cancel';
  private readonly noButtonModalMessage = 'Continue editing';

  constructor(
    private issueService: IssueService,
    private formBuilder: FormBuilder,
    private errorHandlingService: ErrorHandlingService,
    public permissions: PermissionService,
    public phaseService: PhaseService,
    private dialogService: DialogService,
    public loadingService: LoadingService
  ) {}

  ngOnInit() {
    this.issueTitleForm = this.formBuilder.group({
      title: new FormControl('', [Validators.required, Validators.maxLength(256)])
    });
    // Build the loading service spinner
    this.loadingService
      .addAnimationMode('indeterminate')
      .addSpinnerOptions({ diameter: 15, strokeWidth: 2 })
      .addCssClasses(['mat-progress-spinner']);
  }

  changeToEditMode() {
    this.isEditing = true;

    this.issueTitleForm.setValue({
      title: this.issue.title || ''
    });
  }

  cancelEditMode() {
    this.isEditing = false;
  }

  updateTitle(form: NgForm) {
    if (this.issueTitleForm.invalid) {
      return;
    }

    this.showSpinner();
    const newIssue = this.issue.clone(this.phaseService.currentPhase);
    newIssue.title = this.issueTitleForm.get('title').value;
    this.issueService
      .updateIssue(newIssue)
      .pipe(
        finalize(() => {
          this.isEditing = false;
        })
      )
      .subscribe(
        (editedIssue: Issue) => {
          this.issueUpdated.emit(editedIssue);
          form.resetForm();
          this.hideSpinner();
        },
        (error) => {
          this.errorHandlingService.handleError(error);
          this.hideSpinner();
        }
      );
  }

  openCancelDialogIfModified(): void {
    const isModified = this.dialogService.checkIfFieldIsModified(this.issueTitleForm, 'title', 'title', this.issue);
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

  showSpinner() {
    this.loadingService.addViewContainerRef(this.loadingSpinnerContainer).showLoader();
    this.isSavePending = true;
  }

  hideSpinner() {
    this.loadingService.hideLoader();
    this.isSavePending = false;
  }
}

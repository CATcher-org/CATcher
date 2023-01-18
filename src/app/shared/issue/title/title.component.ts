import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, NgForm, Validators } from '@angular/forms';
import { finalize } from 'rxjs/operators';
import { Issue } from '../../../core/models/issue.model';
import { DialogService } from '../../../core/services/dialog.service';
import { ErrorHandlingService } from '../../../core/services/error-handling.service';
import { EditCancellable, IssueService } from '../../../core/services/issue.service';
import { PermissionService } from '../../../core/services/permission.service';
import { PhaseService } from '../../../core/services/phase.service';

@Component({
  selector: 'app-issue-title',
  templateUrl: './title.component.html',
  styleUrls: ['./title.component.css']
})
export class TitleComponent implements OnInit, EditCancellable {
  isEditing = false;
  isSavePending = false;
  formGroup: FormGroup;

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
    private dialogService: DialogService
  ) {}

  ngOnInit() {
    this.formGroup = this.formBuilder.group({
      title: new FormControl('', [Validators.required, Validators.maxLength(256)])
    });
  }

  changeToEditMode() {
    this.isEditing = true;

    this.formGroup.setValue({
      title: this.issue.title || ''
    });
  }

  cancelEditMode() {
    this.isEditing = false;
  }

  updateTitle(form: NgForm) {
    if (this.formGroup.invalid) {
      return;
    }

    this.isSavePending = true;
    const newIssue = this.issue.clone(this.phaseService.currentPhase);
    newIssue.title = this.formGroup.get('title').value;
    this.issueService
      .updateIssue(newIssue)
      .pipe(
        finalize(() => {
          this.isEditing = false;
          this.isSavePending = false;
        })
      )
      .subscribe(
        (editedIssue: Issue) => {
          this.issueUpdated.emit(editedIssue);
          form.resetForm();
        },
        (error) => {
          this.errorHandlingService.handleError(error);
        }
      );
  }

  openCancelDialogIfModified(): void {
    this.issueService.openCancelDialogIfModified(this, this.issue, 'title', 'title');
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
}

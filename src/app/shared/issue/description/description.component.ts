import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormBuilder, FormGroup, NgForm, Validators } from '@angular/forms';
import { Issue } from '../../../core/models/issue.model';
import { IssueService } from '../../../core/services/issue.service';
import { ErrorHandlingService } from '../../../core/services/error-handling.service';
import { finalize } from 'rxjs/operators';
import { PermissionService } from '../../../core/services/permission.service';
import { SUBMIT_BUTTON_TEXT } from '../../view-issue/view-issue.component';

@Component({
  selector: 'app-issue-description',
  templateUrl: './description.component.html',
  styleUrls: ['./description.component.css'],
})
export class DescriptionComponent implements OnInit {
  isSavePending = false;
  issueDescriptionForm: FormGroup;

  submitButtonText: string;

  @Input() issue: Issue;
  @Input() title: string;
  @Input() isEditing: boolean;
  @Output() issueUpdated = new EventEmitter<Issue>();
  @Output() changeEditState = new EventEmitter<boolean>();

  constructor(private issueService: IssueService,
              private formBuilder: FormBuilder,
              private errorHandlingService: ErrorHandlingService,
              public permissions: PermissionService) {
  }

  ngOnInit() {
    this.issueDescriptionForm = this.formBuilder.group({
      description: ['', Validators.required],
    });
    this.submitButtonText = SUBMIT_BUTTON_TEXT.SAVE;
  }

  changeToEditMode() {
    this.changeEditState.emit(true);
    this.issueDescriptionForm.setValue({
      description: this.issue['description'] || ''
    });
  }

  cancelEditMode() {
    this.changeEditState.emit(false);
  }

  updateDescription(form: NgForm) {
    if (this.issueDescriptionForm.invalid) {
      return;
    }

    this.isSavePending = true;
    this.issueService.updateIssue(this.getUpdatedIssue()).pipe(finalize(() => {
      this.changeEditState.emit(false);
      this.isSavePending = false;
    })).subscribe((editedIssue: Issue) => {
      this.issueUpdated.emit(editedIssue);
      form.resetForm();
    }, (error) => {
      this.errorHandlingService.handleHttpError(error);
    });
  }

  private getUpdatedIssue(): Issue {
    return <Issue> {
      ...this.issue,
      ['description']: this.issueDescriptionForm.get('description').value
    };
  }
}

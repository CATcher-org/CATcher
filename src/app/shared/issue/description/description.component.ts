import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';
import {FormBuilder, FormGroup, NgForm, Validators} from '@angular/forms';
import {Issue} from '../../../core/models/issue.model';
import {IssueService} from '../../../core/services/issue.service';
import {ErrorHandlingService} from '../../../core/services/error-handling.service';
import {finalize} from 'rxjs/operators';
import {PermissionService} from '../../../core/services/permission.service';

@Component({
  selector: 'app-issue-description',
  templateUrl: './description.component.html',
  styleUrls: ['./description.component.css'],
})
export class DescriptionComponent implements OnInit {
  isEditing = false;
  isSavePending = false;
  issueDescriptionForm: FormGroup;

  @Input() issue: Issue;
  @Input() title: string;
  @Output() issueUpdated = new EventEmitter<Issue>();

  constructor(private issueService: IssueService,
              private formBuilder: FormBuilder,
              private errorHandlingService: ErrorHandlingService,
              public permissions: PermissionService) {
  }

  ngOnInit() {
    this.issueDescriptionForm = this.formBuilder.group({
      description: ['', Validators.required],
    });
  }

  changeToEditMode() {
    this.isEditing = true;
    this.issueDescriptionForm.setValue({
      description: this.issue['description'] || ''
    });
  }

  cancelEditMode() {
    this.isEditing = false;
  }

  updateDescription(form: NgForm) {
    if (this.issueDescriptionForm.invalid) {
      return;
    }

    this.isSavePending = true;
    this.issueService.updateIssue(this.getUpdatedIssue()).pipe(finalize(() => {
      this.isEditing = false;
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

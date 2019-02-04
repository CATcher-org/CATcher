import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';
import {FormBuilder, FormGroup, NgForm, Validators} from '@angular/forms';
import {Issue} from '../../../core/models/issue.model';
import {IssueService} from '../../../core/services/issue.service';
import {ErrorHandlingService} from '../../../core/services/error-handling.service';
import {finalize} from 'rxjs/operators';

@Component({
  selector: 'app-issue-comment',
  templateUrl: './comment.component.html',
  styleUrls: ['./comment.component.css'],
})
export class CommentComponent implements OnInit {
  isEditing = false;
  isSavePending = false;
  issueCommentForm: FormGroup;

  @Input() issue: Issue;
  @Output() issueUpdated = new EventEmitter<Issue>();

  constructor(private issueService: IssueService,
              private formBuilder: FormBuilder,
              private errorHandlingService: ErrorHandlingService) {
  }

  ngOnInit() {
    this.issueCommentForm = this.formBuilder.group({
      description: ['', Validators.required],
    });
  }

  changeToEditMode() {
    this.isEditing = true;
    this.issueCommentForm.setValue({
      description: this.issue.description || ''
    });
  }

  cancelEditMode() {
    this.isEditing = false;
  }

  updateComment(form: NgForm) {
    if (this.issueCommentForm.invalid) {
      return;
    }

    this.isSavePending = true;
    this.issueService.updateIssue({
      ...this.issue,
      description: this.issueCommentForm.get('description').value,
    }).pipe(finalize(() => {
      this.isEditing = false;
      this.isSavePending = false;
    })).subscribe((editedIssue: Issue) => {
      this.issueService.updateLocalStore(editedIssue);
      this.issueUpdated.emit(editedIssue);
      form.resetForm();
    }, (error) => {
      this.errorHandlingService.handleHttpError(error);
    });
  }
}

import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';
import {FormBuilder, FormGroup, NgForm, Validators} from '@angular/forms';
import {Issue} from '../../../core/models/issue.model';
import {IssueService} from '../../../core/services/issue.service';
import {ErrorHandlingService} from '../../../core/services/error-handling.service';
import {finalize} from 'rxjs/operators';
import {IssueComment} from '../../../core/models/comment.model';

@Component({
  selector: 'app-issue-comment',
  templateUrl: './comment.component.html',
  styleUrls: ['./comment.component.css'],
})
export class CommentComponent implements OnInit {
  isEditing = false;
  isSavePending = false;
  issueCommentForm: FormGroup;

  readonly TITLE = {
    'teamResponse': 'Team\'s Response',
    'testerObjection': 'Tester\'s Objection',
    'tutorResponse': 'Tutor\'s Response'
  };

  readonly POSTER = {
    'teamResponse': 'Team',
    'testerObjection': 'Tester',
    'tutorResponse': 'Tutor'
  };

  readonly ACTION = {
    'teamResponse': 'responded',
    'testerObjection': 'objected',
    'tutorResponse': 'responded'
  };

  @Input() issue: Issue;
  @Input() title: string;
  @Input() attributeName: string;
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
      description: this.issue[this.attributeName]['description'] || ''
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
    this.issueService.updateIssueComment(this.getUpdatedIssueComment()).pipe(finalize(() => {
      this.isEditing = false;
      this.isSavePending = false;
    })).subscribe((updatedIssueComment: IssueComment) => {
      this.issueUpdated.emit(this.createUpdatedIssue(updatedIssueComment));
      form.resetForm();
    }, (error) => {
      this.errorHandlingService.handleHttpError(error);
    });
  }

  private createUpdatedIssue(updatedIssueComment: IssueComment) {
    return <Issue>{
      ...this.issue,
      [this.attributeName]: updatedIssueComment
    };
  }

  private getUpdatedIssueComment(): IssueComment {
    return <IssueComment> {
      ...this.issue[this.attributeName],
      ['description']: this.issueCommentForm.get('description').value
    };
  }
}

import { Component, OnInit, EventEmitter, Input, Output, ViewChild } from '@angular/core';
import { FormGroup, FormBuilder, FormControl, Validators, NgForm } from '@angular/forms';
import { Issue } from '../../core/models/issue.model';
import { IssueComment } from '../../core/models/comment.model';
import { CommentEditorComponent } from '../comment-editor/comment-editor.component';
import { IssueService } from '../../core/services/issue.service';
import { IssueCommentService } from '../../core/services/issue-comment.service';
import { UserService } from '../../core/services/user.service';
import { ErrorHandlingService } from '../../core/services/error-handling.service';
import { SUBMIT_BUTTON_TEXT } from '../view-issue/view-issue.component';

@Component({
  selector: 'app-issue-dispute',
  templateUrl: './issue-dispute.component.html',
  styleUrls: ['./issue-dispute.component.css']
})
export class IssueDisputeComponent implements OnInit {
  tutorResponseForm: FormGroup;
  isFormPending = false;
  isEditing = false;

  submitButtonText: string;

  @Input() issue: Issue;
  @Output() issueUpdated = new EventEmitter<Issue>();
  @Output() commentUpdated = new EventEmitter<IssueComment>();
  @ViewChild(CommentEditorComponent) commentEditor: CommentEditorComponent;

  constructor(private formBuilder: FormBuilder,
              private issueService: IssueService,
              private issueCommentService: IssueCommentService,
              public userService: UserService,
              private errorHandlingService: ErrorHandlingService) { }

  ngOnInit() {
    this.resetForm();
    this.isEditing = this.isNewResponse();
    this.submitButtonText = this.isNewResponse() ? SUBMIT_BUTTON_TEXT.SUBMIT : SUBMIT_BUTTON_TEXT.SAVE;
  }

  submitTutorResponseForm(form: NgForm) {
    if (this.tutorResponseForm.invalid) {
      return;
    }
    this.isFormPending = true;

    this.issue.pending = '' + this.getNumOfPending();

    // Update tutor's response in the issue comment
    if (this.issue.issueComment) {
      this.issueService.updateTutorResponse(this.issue, <IssueComment>{
        ...this.issue.issueComment,
        description: this.getTutorResponseFromForm()
      }).subscribe((issue: Issue) => {
        this.isFormPending = false;
        this.isEditing = false;
        this.commentUpdated.emit(issue.issueComment);
        this.issueUpdated.emit(issue);
        this.resetForm();
      }, (error) => {
        this.errorHandlingService.handleHttpError(error);
      });
    } else {
      const tutorResponse = this.getTutorResponseFromForm();
      this.issueService.createTutorResponse(this.issue, tutorResponse).subscribe((issue: Issue) => {
        this.isFormPending = false;
        this.isEditing = false;
        this.commentUpdated.emit(issue.issueComment);
        this.issueUpdated.emit(issue);
        this.resetForm();
      },
        (error) => {
        this.errorHandlingService.handleHttpError(error);
      });
    }

    this.issueService.updateIssue(this.issue).subscribe(
      (updatedIssue) => {
        this.issueUpdated.emit(updatedIssue);
      },
      (error) => {
        this.errorHandlingService.handleHttpError(error);
      });
  }

  changeToEditMode() {
    this.isEditing = true;
  }

  cancelEditMode() {
    this.isEditing = false;
    this.resetForm();
  }

  trackDisputeList(index: number, item: string[]): string {
    return item[index];
  }

  isNewResponse(): boolean {
    return !this.issue.issueComment;
  }

  resetForm(): void {
    this.tutorResponseForm = this.formBuilder.group(this.createFormGroup());
  }

  getItemTitleText(title: string): string {
    return '## ' + title;
  }

  getNumOfPending(): number {
    let pending = this.issue.issueDisputes.length; // Initial pending is number of disputes
    for (const issueDispute of this.issue.issueDisputes) {
      // For each number of Done that is checked, reduce pending by one
      if (issueDispute.isDone()) {
        pending--;
      }
    }
    return pending;
  }

  createFormGroup() {
    const group: any = {};
    // initialize fields for tutor response and the checkboxes for tutor to mark "Done"
    for (let i = 0; i < this.issue.issueDisputes.length; i++) {
      const dispute = this.issue.issueDisputes[i];
      group[this.getTutorResponseFormId(i)] = new FormControl(dispute.tutorResponse, Validators.required);
      group[this.getTodoFormId(i)] = new FormControl({value: dispute.isDone(), disabled: !this.isEditing}, Validators.required);
    }
    return group;
  }

  getTutorResponseFromForm(): string {
    if (!this.issue.issueDisputes) {
      return '';
    }

    let result = '# Tutor Moderation\n';
    const values = this.tutorResponseForm.getRawValue();
    const todos = [];
    const responses = [];

    let index = 0;
    for (const [key, value] of Object.entries(values)) {
      if (key.startsWith('todo')) {
        todos.push(value);
      } else if (key.startsWith('tutor-response')) {
        responses.push(value);
      }
      index++;
    }

    index = 0;
    for (const dispute of this.issue.issueDisputes) {
      result += dispute.getResponseFromValue(todos[index], responses[index] || dispute.tutorResponse);
      index++;
    }
    return result;
  }

  /**
   * @param index - index of dispute which the tutor resolve.
   */
  getTutorResponseFormId(index: number): string {
    return `tutor-response-${index}`;
  }

  /**
   * @param index - index of dispute which the tutor resolve.
   */
  getTodoFormId(index: number): string {
    return `todo-${index}`;
  }
}

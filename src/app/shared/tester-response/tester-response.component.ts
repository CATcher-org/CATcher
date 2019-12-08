import { Component, OnInit, Input, Output, EventEmitter, ViewChild } from '@angular/core';
import { FormGroup, FormBuilder, Validators, FormControl } from '@angular/forms';
import { Issue, STATUS } from '../../core/models/issue.model';
import { CommentEditorComponent } from '../comment-editor/comment-editor.component';
import { IssueService } from '../../core/services/issue.service';
import { finalize } from 'rxjs/operators';
import { ErrorHandlingService } from '../../core/services/error-handling.service';
import { UserService } from '../../core/services/user.service';
import { UserRole } from '../../core/models/user.model';
import { IssueCommentService } from '../../core/services/issue-comment.service';
import { IssueComment } from '../../core/models/comment.model';
import { SUBMIT_BUTTON_TEXT } from '../view-issue/view-issue.component';
import { TesterResponseHeaders } from '../../core/models/templates/tester-response-template.model';
import { TeamResponseHeaders } from '../../core/models/templates/team-response-template.model';

@Component({
  selector: 'app-tester-response',
  templateUrl: './tester-response.component.html',
  styleUrls: ['./tester-response.component.css']
})
export class TesterResponseComponent implements OnInit {

  testerResponseForm: FormGroup;
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
    this.resetForm(this.issue);
    this.isEditing = this.isNewResponse();
    this.submitButtonText = this.isNewResponse() ? SUBMIT_BUTTON_TEXT.SUBMIT : SUBMIT_BUTTON_TEXT.SAVE;
  }

  submitTesterResponseForm() {
    if (this.testerResponseForm.invalid) {
      return;
    }
    this.isFormPending = true;

    this.issue.status = STATUS.Done;
    this.issueService.updateIssue(this.issue).pipe(finalize(() => {
      this.isFormPending = false;
      this.isEditing = false;
    })).subscribe((updatedIssue: Issue) => {
      updatedIssue.teamResponse = this.issue.teamResponse;
      updatedIssue.testerResponses = this.issue.testerResponses;
      this.issueUpdated.emit(updatedIssue);
    }, (error) => {
      this.errorHandlingService.handleHttpError(error);
      this.issue.status = STATUS.Incomplete;
    });

    // For Tester Response phase, where the items are in the issue's comment
    if (this.issue.issueComment) {
      this.issueService.updateTesterResponse(this.issue, <IssueComment>{
        ...this.issue.issueComment,
        description: this.getTesterResponseFromForm()
      }).subscribe(
        (updatedIssue: Issue) => {
          this.commentUpdated.emit(updatedIssue.issueComment);
          this.issueUpdated.emit(updatedIssue);
          this.resetForm(updatedIssue);
        }, (error) => {
          this.errorHandlingService.handleHttpError(error);
      });
    }

  }

  changeToEditMode() {
    this.isEditing = true;
  }

  cancelEditMode() {
    this.isEditing = false;
    this.resetForm(this.issue);
  }

  handleChangeOfDisagreeCheckbox(event, index: number) {
    const checkboxFormControl = this.testerResponseForm.get(this.getDisagreeBoxFormId(index));
    const responseFormControl = this.testerResponseForm.get(this.getTesterResponseFormId(index));
    const isDisagreeChecked = checkboxFormControl.value;
    if (isDisagreeChecked) {
      responseFormControl.enable();
    } else {
      responseFormControl.disable();
    }
  }

  trackDisagreeList(index: number, item: string[]): string {
    return item[index];
  }

  isNewResponse(): boolean {
    return !this.issue.status && this.userService.currentUser.role === UserRole.Student;
  }

  getItemTitleText(title: string): string {
    return '## ' + title;
  }

  createFormGroup(issue: Issue) {
    const group: any = {};
    // initialize fields for tutor response and the checkboxes for tutor to mark "Done"
    for (let i = 0; i < issue.testerResponses.length; i++) {
      const response = issue.testerResponses[i];
      group[this.getTesterResponseFormId(i)] = new FormControl({
        value: response.reasonForDisagreement,
        disabled: !response.isDisagree()
      }, Validators.required);
      group[this.getDisagreeBoxFormId(i)] = new FormControl({
        value: response.isDisagree(),
        disabled: !this.isEditing
      }, Validators.required);
    }
    return group;
  }

  /**
   * Reset the form based on the initial values of the given issue.
   * @param issue - The issue to reset the form to.
   */
  resetForm(issue: Issue): void {
    this.testerResponseForm = this.formBuilder.group(this.createFormGroup(issue));
  }

  /**
   * Based on the updated form and `this.issue` we obtain the updated tester response in Github format.
   */
  getTesterResponseFromForm(): string {
    if (!this.issue.testerResponses) {
      return '';
    }

    let result = `${TeamResponseHeaders.teamResponse.toString()}\n` +
      `${this.issue.teamResponse}\n` +
      `${TesterResponseHeaders.testerResponses.toString()}\n`;

    const values = this.testerResponseForm.getRawValue();
    const disagrees = [];
    const reasons = [];

    let index = 0;
    for (const [key, value] of Object.entries(values)) {
      if (key.startsWith('disagree-box')) {
        disagrees.push(value);
      } else if (key.startsWith('tester-response')) {
        reasons.push(value);
      }
      index++;
    }

    index = 0;
    for (const response of this.issue.testerResponses) {
      const isDisagree = disagrees[index] === undefined ? response.isDisagree() : disagrees[index];
      const reason = isDisagree ? reasons[index] || response.reasonForDisagreement : response.INITIAL_RESPONSE;
      result += response.getResponseFromValue(isDisagree, reason);
      index++;
    }
    return result;
  }

  /**
   * @param index - index of action which the tester disagree.
   */
  getTesterResponseFormId(index: number): string {
    return `tester-response-${index}`;
  }

  /**
   * @param index - index of action which the tester disagree.
   */
  getDisagreeBoxFormId(index: number): string {
    return `disagree-box-${index}`;
  }
}

import { Component, OnInit, Input, Output, EventEmitter, ViewChild } from '@angular/core';
import { FormGroup, FormBuilder, Validators, FormControl, AbstractControl } from '@angular/forms';
import { Issue, STATUS } from '../../core/models/issue.model';
import { CommentEditorComponent } from '../comment-editor/comment-editor.component';
import { IssueService } from '../../core/services/issue.service';
import { finalize } from 'rxjs/operators';
import { ErrorHandlingService } from '../../core/services/error-handling.service';
import { UserService } from '../../core/services/user.service';
import { UserRole } from '../../core/models/user.model';
import { IssueCommentService } from '../../core/services/issue-comment.service';
import { IssueComment } from '../../core/models/comment.model';

@Component({
  selector: 'app-tester-response',
  templateUrl: './tester-response.component.html',
  styleUrls: ['./tester-response.component.css']
})
export class TesterResponseComponent implements OnInit {

  testerResponseForm: FormGroup;
  isFormPending = false;
  isEditing = false;

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
    const group: any = {};
    for (let i = 0; i < this.issue.testerResponses.length; i++) {
      const disabled: boolean = !this.isDisagreeChecked(this.issue.testerResponses[i].disagreeCheckbox);
      const value: string = this.issue.testerResponses[i].reasonForDiagreement;
      group[i.toString()] = new FormControl({value: value, disabled: disabled}, Validators.required);
    }
    group['testerResponse'] = [this.issue.testerResponses];
    this.testerResponseForm = this.formBuilder.group(group);

    if (this.isNewResponse()) {
      this.isEditing = true;
    }
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
    })).subscribe((updatedIssue) => {
      updatedIssue.teamResponse = this.issue.teamResponse;
      updatedIssue.testerResponses = this.issue.testerResponses;
      this.issueUpdated.emit(updatedIssue);
    }, (error) => {
      this.errorHandlingService.handleHttpError(error);
    });

    // For Tester Response phase, where the items are in the issue's comment
    if (this.issue.issueComment) {
      this.issue.issueComment.description = this.issueCommentService.
        createGithubTesterResponse(this.issue.teamResponse, this.issue.testerResponses);

      this.issueCommentService.updateIssueComment(this.issue.issueComment).subscribe(
        (updatedComment) => {
          this.commentUpdated.emit(updatedComment);
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
  }

  handleChangeOfDisagreeCheckbox(event, disagree, index) {
    this.issue.testerResponses[index].disagreeCheckbox = ('- [').concat((event.checked ? 'x' : ' '), '] ', disagree.substring(6));
    this.toggleCommentEditor(index, event.checked);
  }

  toggleCommentEditor(index: number, isCommentEditorEnabled: boolean) {
    const control: AbstractControl = this.testerResponseForm.controls[index];
    if (isCommentEditorEnabled) {
      control.enable({onlySelf: true});
    } else {
      control.disable({onlySelf: false});
      this.issue.testerResponses[index].reasonForDiagreement = '';
    }
  }

  handleChangeOfText(event, disagree, index) {
    if (event.target.value !== disagree && event.target.value !== undefined) {
      this.issue.testerResponses[index].reasonForDiagreement = event.target.value;
    }
  }

  trackDisagreeList(index: number, item: string[]): string {
    return item[index];
  }

  isDisagreeChecked(disagree): boolean {
    return disagree.charAt(3) === 'x';
  }

  isNewResponse(): boolean {
    return !this.issue.status && this.userService.currentUser.role === UserRole.Student;
  }

  getSubmitButtonText(): string {
    return this.isNewResponse() ? 'Submit' : 'Save';
  }

  getItemTitleText(title: string): string {
    return '## ' + title;
  }

}

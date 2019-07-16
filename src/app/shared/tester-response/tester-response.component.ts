import { Component, OnInit, Input, Output, EventEmitter, ViewChild } from '@angular/core';
import { FormGroup, FormBuilder, Validators, NgForm, FormControl } from '@angular/forms';
import { Issue, STATUS } from '../../core/models/issue.model';
import { CommentEditorComponent } from '../comment-editor/comment-editor.component';
import { IssueService } from '../../core/services/issue.service';
import { finalize } from 'rxjs/operators';
import { ErrorHandlingService } from '../../core/services/error-handling.service';
import { UserService } from '../../core/services/user.service';
import { UserRole } from '../../core/models/user.model';

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
  @ViewChild(CommentEditorComponent) commentEditor: CommentEditorComponent;

  constructor(private formBuilder: FormBuilder,
              private issueService: IssueService,
              public userService: UserService,
              private errorHandlingService: ErrorHandlingService) { }

  ngOnInit() {
    const group: any = {};
    for (let i = 0; i < this.issue.testerResponses.length; i++) {
      group[i.toString()] = new FormControl('', Validators.required);
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

    if (this.isNewResponse()) {
      this.issue.status = STATUS.Done;
    }

    this.issueService.updateIssue(this.issue).pipe(finalize(() => {
      this.isFormPending = false;
      this.isEditing = false;
    })).subscribe((updatedIssue) => {
      this.issueUpdated.emit(updatedIssue);
    }, (error) => {
      this.errorHandlingService.handleHttpError(error);
    });
  }

  changeToEditMode() {
    this.isEditing = true;
  }

  cancelEditMode() {
    this.isEditing = false;
  }

  handleChangeOfDisagreeCheckbox(event, disagree, index) {
    if (event.checked) {
      this.issue.testerResponses[index].disagreeCheckbox = '- [x]' + disagree.substring(5);
    } else {
      this.issue.testerResponses[index].disagreeCheckbox = '- [ ]' + disagree.substring(5);
    }
  }

  handleChangeOfText(event, disagree, index) {
    if (event.target.value !== disagree) {
      this.issue.testerResponses[index].reasonForDiagreement = event.target.value;
    }
  }

  trackDisagreeList(index: number, item: string[]): string {
    return item[index];
  }

  isDisagreeChecked(disagree): boolean {
    if (disagree.charAt(3) === 'x') {
      return true;
    }
    return false;
  }

  isNewResponse() {
    return (!this.issue.status && this.userService.currentUser.role === UserRole.Student);
  }

}

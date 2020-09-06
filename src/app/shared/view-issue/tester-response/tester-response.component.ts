import { Component, OnInit, Input, Output, EventEmitter, ViewChild, SimpleChanges, OnChanges } from '@angular/core';
import { FormGroup, FormBuilder, Validators, FormControl } from '@angular/forms';
import { Issue } from '../../../core/models/issue.model';
import { CommentEditorComponent } from '../../comment-editor/comment-editor.component';
import { IssueService } from '../../../core/services/issue.service';
import { ErrorHandlingService } from '../../../core/services/error-handling.service';
import { UserService } from '../../../core/services/user.service';
import { UserRole } from '../../../core/models/user.model';
import { IssueComment } from '../../../core/models/comment.model';
import { SUBMIT_BUTTON_TEXT } from '../view-issue.component';
import { finalize, map, flatMap } from 'rxjs/operators';
import { Observable, throwError } from 'rxjs';
import { MatDialog } from '@angular/material';
import { ConflictDialogComponent, TesterResponseConflictData } from './conflict-dialog/conflict-dialog.component';
import { PhaseService } from '../../../core/services/phase.service';

@Component({
  selector: 'app-tester-response',
  templateUrl: './tester-response.component.html',
  styleUrls: ['./tester-response.component.css']
})
export class TesterResponseComponent implements OnInit, OnChanges {
  testerResponseForm: FormGroup;
  isFormPending = false;

  submitButtonText: string;

  @Input() issue: Issue;
  @Input() isEditing: boolean;
  @Output() issueUpdated = new EventEmitter<Issue>();
  @Output() updateEditState = new EventEmitter<boolean>();
  @ViewChild(CommentEditorComponent) commentEditor: CommentEditorComponent;

  constructor(private formBuilder: FormBuilder,
              private issueService: IssueService,
              public userService: UserService,
              private errorHandlingService: ErrorHandlingService,
              private dialog: MatDialog,
              private phaseService: PhaseService) { }

  ngOnInit() {
    this.resetForm();
    this.submitButtonText = this.isNewResponse() ? SUBMIT_BUTTON_TEXT.SUBMIT : SUBMIT_BUTTON_TEXT.SAVE;
    setTimeout(() => {
      this.updateEditState.emit(this.isNewResponse());
    });
  }

  ngOnChanges(changes: SimpleChanges) {
    // Whenever there is a change in value of issue, we reset the form so to render the most up to date form.
    if (!this.isEditing && changes.issue && changes.issue.previousValue !== changes.issue.currentValue) {
      this.resetForm();
    }
  }

  submitTesterResponseForm() {
    if (this.testerResponseForm.invalid) {
      return;
    }
    this.isFormPending = true;

    this.isSafeToSubmit().pipe(
      flatMap((isSaveToSubmit: boolean) => {
        if (isSaveToSubmit || this.isUpdatingDeletedResponse() ||
            this.submitButtonText === SUBMIT_BUTTON_TEXT.OVERWRITE) {
          return this.issueService.updateTesterResponse(this.issue, <IssueComment>{
            ...this.issue.issueComment,
            description: this.getTesterResponseFromForm(),
          });
        } else {
          this.submitButtonText = SUBMIT_BUTTON_TEXT.OVERWRITE;
          this.viewChanges();
          return throwError('The content you are editing has changed. Please verify the changes and try again.');
        }
      }),
      finalize(() => this.isFormPending = false)
    ).subscribe((updatedIssue: Issue) => {
      this.issueUpdated.emit(updatedIssue);
      this.resetToDefault();
    }, (error) => {
      this.errorHandlingService.handleError(error);
    });
  }

  /**
   * @return - Determines whether it is safe to submit a tester response.
   */
  isSafeToSubmit(): Observable<boolean> {
    return this.issueService.getLatestIssue(this.issue.id).pipe(
      map((issue: Issue) => {
        if (!issue.testerResponses) {
          return false;
        }
        return issue.testerResponses.reduce((result, response, index) => {
          return result && response.compareTo(this.issue.testerResponses[index]) === 0;
        }, true);
      })
    );
  }

  /**
   * Determines whether the user is updating a response that has already been deleted on Github.
   */
  isUpdatingDeletedResponse(): boolean {
    return this.issue.testerResponses && !this.issueService.issues[this.issue.id].testerResponses;
  }

  /**
   * Pops up a dialog that shows the difference between the outdated tester's response and the updated one.
   */
  viewChanges(): void {
    this.dialog.open(ConflictDialogComponent, {
      data: <TesterResponseConflictData>{
        outdatedResponses: this.issue.testerResponses,
        updatedResponses: this.issueService.issues[this.issue.id].testerResponses,
      },
      autoFocus: false
    });
  }

  changeToEditMode() {
    this.updateEditState.emit(true);
  }

  cancelEditMode() {
    this.issueService.getIssue(this.issue.id).subscribe((issue: Issue) => {
      this.issueUpdated.emit(issue);
      this.resetToDefault();
    });
  }

  /**
   * Resets to default form state.
   */
  resetToDefault(): void {
    this.submitButtonText = SUBMIT_BUTTON_TEXT.SAVE;
    this.updateEditState.emit(false);
    this.resetForm();
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

  /**
   * Will create a form group with initial values in `this.issue`.
   */
  createFormGroup() {
    const group: any = {};
    // initialize fields for tester response and the checkboxes for tester to mark "Disagree"
    for (let i = 0; i < this.issue.testerResponses.length; i++) {
      const response = this.issue.testerResponses[i];
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

  resetForm(): void {
    this.testerResponseForm = this.formBuilder.group(this.createFormGroup());
  }

  /**
   * Based on the updated form and `this.issue` we obtain the updated tester response in Github format.
   */
  getTesterResponseFromForm(): string {
    if (!this.issue.testerResponses) {
      return '';
    }

    const updatedIssue = this.issue.clone(this.phaseService.currentPhase);
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
    for (const response of updatedIssue.testerResponses) {
      const isDisagree = disagrees[index] === undefined ? response.isDisagree() : disagrees[index];
      const reason = isDisagree ? reasons[index] || response.reasonForDisagreement : response.INITIAL_RESPONSE;
      response.setDisagree(isDisagree);
      response.setReasonForDisagreement(reason);
      index++;
    }

    return updatedIssue.createGithubTesterResponse();
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

  get conflict(): boolean {
    return this.submitButtonText === SUBMIT_BUTTON_TEXT.OVERWRITE;
  }
}

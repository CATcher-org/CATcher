import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { IssueService } from '../../../core/services/issue.service';
import { FormBuilder, FormGroup, NgForm, Validators } from '@angular/forms';
import { Issue, SEVERITY_ORDER, STATUS } from '../../../core/models/issue.model';
import { ErrorHandlingService } from '../../../core/services/error-handling.service';
import { finalize, flatMap, map } from 'rxjs/operators';
import { forkJoin, Observable, of, throwError } from 'rxjs';
import { LabelService } from '../../../core/services/label.service';
import { IssueCommentService } from '../../../core/services/issue-comment.service';
import { IssueComment } from '../../../core/models/comment.model';
import { SUBMIT_BUTTON_TEXT } from '../view-issue.component';
import { Conflict } from '../../../core/models/conflict.model';
import { HttpErrorResponse } from '@angular/common/http';
import { MatDialog } from '@angular/material';
import { ConflictDialogComponent } from './conflict-dialog/conflict-dialog.component';
import { PhaseService } from '../../../core/services/phase.service';

@Component({
  selector: 'app-new-team-response',
  templateUrl: './new-team-response.component.html',
  styleUrls: ['./new-team-response.component.css']
})
export class NewTeamResponseComponent implements OnInit {
  newTeamResponseForm: FormGroup;
  teamMembers: string[];
  duplicatedIssueList: Observable<Issue[]>;
  conflict: Conflict;

  isFormPending = false;

  submitButtonText: string;

  @Input() issue: Issue;
  @Output() issueUpdated = new EventEmitter<Issue>();
  @Output() updatedCommentEmitter = new EventEmitter<IssueComment>();

  constructor(private issueService: IssueService,
              private formBuilder: FormBuilder,
              private issueCommentService: IssueCommentService,
              public labelService: LabelService,
              private errorHandlingService: ErrorHandlingService,
              private dialog: MatDialog,
              private phaseService: PhaseService) { }

  ngOnInit() {
    this.teamMembers = this.issue.teamAssigned.teamMembers.map((member) => {
      return member.loginId;
    });
    this.duplicatedIssueList = this.getDupIssueList();
    this.newTeamResponseForm = this.formBuilder.group({
      description: ['', Validators.required],
      severity: [this.issue.severity, Validators.required],
      type: [this.issue.type, Validators.required],
      responseTag: [this.issue.responseTag, Validators.required],
      assignees: [this.issue.assignees.map(a => a.toLowerCase())],
      duplicated: [false],
      duplicateOf: ['']
    });
    this.duplicated.valueChanges.subscribe(checked => {
      if (checked) {
        this.duplicateOf.setValidators(Validators.required);
        this.responseTag.setValidators(null);
      } else {
        this.duplicateOf.setValidators(null);
        this.responseTag.setValidators(Validators.required);
      }
      this.duplicateOf.updateValueAndValidity();
      this.responseTag.updateValueAndValidity();
    });
    this.submitButtonText = SUBMIT_BUTTON_TEXT.SUBMIT;
  }

  submitNewTeamResponse(form: NgForm) {
    if (this.newTeamResponseForm.invalid) {
      return;
    }
    this.isFormPending = true;
    const latestIssue = this.getUpdatedIssue();

    this.issueService.getLatestIssue(this.issue.id).pipe(
      map((issue: Issue) => {
        return !issue.teamResponse;
      }),
      flatMap((isSaveToSubmit: boolean) => {
        const newCommentDescription = latestIssue.createGithubTeamResponse();
        if (isSaveToSubmit) {
          return forkJoin([this.issueService.updateIssue(latestIssue),
            this.issueCommentService.createIssueComment(this.issue.id, newCommentDescription)]);
        } else if (this.submitButtonText === SUBMIT_BUTTON_TEXT.OVERWRITE) {
          const issueCommentId = this.issueService.issues[this.issue.id].issueComment.id;
          return forkJoin([this.issueService.updateIssue(latestIssue),
            this.issueCommentService.updateIssueComment(latestIssue.id, <IssueComment>{
              id: issueCommentId,
              description: newCommentDescription,
            })
          ]);
        } else {
          this.conflict = new Conflict(' ', this.issueService.issues[this.issue.id].teamResponse);
          this.submitButtonText = SUBMIT_BUTTON_TEXT.OVERWRITE;
          this.viewChanges();
          return throwError('A response has been submitted. Please verify the changes and try again.');
        }
      }),
      finalize(() => this.isFormPending = false)
    ).subscribe((resultArr: [Issue, IssueComment]) => {
        const [updatedIssue, updatedComment] = resultArr;
      updatedIssue.teamResponse = this.description.value;
      updatedIssue.duplicateOf = this.duplicateOf.value === '' ? undefined : this.duplicateOf.value;
      updatedIssue.issueComment = updatedComment;
      this.issueUpdated.emit(updatedIssue);
      this.updatedCommentEmitter.emit(updatedComment);
      form.resetForm();
    }, (error) => {
      if (error instanceof HttpErrorResponse) {
        this.errorHandlingService.handleHttpError(error);
      } else {
        this.errorHandlingService.handleGeneralError(error);
      }
    });
  }

  getUpdatedIssue() {
    const clone = this.issue.clone(this.phaseService.currentPhase);
    clone.severity = this.severity.value;
    clone.type = this.type.value;
    clone.assignees = this.assignees.value;
    clone.responseTag = this.responseTag.value;
    clone.duplicated = this.duplicated.value;
    clone.duplicateOf = this.duplicateOf.value;
    clone.status = STATUS.Done;
    clone.teamResponse = this.description.value;
    return clone;
  }

  dupIssueOptionIsDisabled(issue: Issue): boolean {
    return SEVERITY_ORDER[this.severity.value] > SEVERITY_ORDER[issue.severity] || (issue.duplicated || !!issue.duplicateOf);
  }

  getDisabledDupOptionErrorText(issue: Issue): string {
    const reason = new Array<string>();
    if (this.dupIssueOptionIsDisabled(issue)) {
      if (SEVERITY_ORDER[this.severity.value] > SEVERITY_ORDER[issue.severity]) {
        reason.push('Issue of lower priority');
      } else if (issue.duplicated || !!issue.duplicateOf) {
        reason.push('A duplicated issue');
      }
    }
    return reason.join(', ');
  }

  handleChangeOfDuplicateCheckbox(event) {
    if (event.checked) {
      this.responseTag.setValue('');
      this.assignees.setValue([]);
      this.responseTag.markAsUntouched();
    } else {
      this.duplicateOf.setValue('');
      this.duplicateOf.markAsUntouched();
    }
  }

  viewChanges(): void {
    this.dialog.open(ConflictDialogComponent, {
      data: this.issueService.issues[this.issue.id],
      autoFocus: false
    });
  }

  refresh(): void {
    const updatedIssue = this.issueService.issues[this.issue.id];
    this.issueUpdated.emit(updatedIssue);
    this.updatedCommentEmitter.emit(updatedIssue.issueComment);
  }

  private getDupIssueList(): Observable<Issue[]> {
    return this.issueService.issues$.pipe(map((issues) => {
      return issues.filter((issue) => {
        return this.issue.id !== issue.id;
      });
    }));
  }

  get description() {
    return this.newTeamResponseForm.get('description');
  }

  get severity() {
    return this.newTeamResponseForm.get('severity');
  }

  get type() {
    return this.newTeamResponseForm.get('type');
  }

  get assignees() {
    return this.newTeamResponseForm.get('assignees');
  }

  get responseTag() {
    return this.newTeamResponseForm.get('responseTag');
  }

  get duplicated() {
    return this.newTeamResponseForm.get('duplicated');
  }

  get duplicateOf() {
    return this.newTeamResponseForm.get('duplicateOf');
  }
}

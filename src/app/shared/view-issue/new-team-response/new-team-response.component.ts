import { Component, EventEmitter, Input, OnDestroy, OnInit, Output } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, NgForm, Validators } from '@angular/forms';
import { MatCheckboxChange } from '@angular/material/checkbox';
import { MatDialog } from '@angular/material/dialog';
import { Observable, ReplaySubject, Subject, throwError } from 'rxjs';
import { finalize, first, flatMap, map, takeUntil } from 'rxjs/operators';
import { IssueComment } from '../../../core/models/comment.model';
import { Conflict } from '../../../core/models/conflict/conflict.model';
import { Issue, STATUS } from '../../../core/models/issue.model';
import { ErrorHandlingService } from '../../../core/services/error-handling.service';
import { IssueService } from '../../../core/services/issue.service';
import { LabelService } from '../../../core/services/label.service';
import { PhaseService } from '../../../core/services/phase.service';
import { TABLE_COLUMNS } from '../../issue-tables/issue-tables-columns';
import { applySearchFilter } from '../../issue-tables/search-filter';
import { SUBMIT_BUTTON_TEXT } from '../view-issue.component';
import { ConflictDialogComponent } from './conflict-dialog/conflict-dialog.component';

@Component({
  selector: 'app-new-team-response',
  templateUrl: './new-team-response.component.html',
  styleUrls: ['./new-team-response.component.css']
})
export class NewTeamResponseComponent implements OnInit, OnDestroy {
  newTeamResponseForm: FormGroup;
  teamMembers: string[];
  duplicatedIssueList: Observable<Issue[]>;
  conflict: Conflict;
  searchFilterCtrl: FormControl = new FormControl();
  filteredDuplicateIssueList: ReplaySubject<Issue[]> = new ReplaySubject<Issue[]>(1);

  isFormPending = false;

  submitButtonText: string;

  @Input() issue: Issue;
  @Output() issueUpdated = new EventEmitter<Issue>();

  // A subject that will emit a signal when this component is being destroyed
  private _onDestroy = new Subject<void>();

  constructor(
    public issueService: IssueService,
    private formBuilder: FormBuilder,
    public labelService: LabelService,
    private errorHandlingService: ErrorHandlingService,
    private dialog: MatDialog,
    private phaseService: PhaseService
  ) {}

  ngOnInit() {
    this.teamMembers = this.issue.teamAssigned.teamMembers.map((member) => {
      return member.loginId;
    });
    this.duplicatedIssueList = this.getDupIssueList();
    // Populate the filtered list with all the issues first
    this.duplicatedIssueList.pipe(first()).subscribe((issues) => this.filteredDuplicateIssueList.next(issues));
    this.searchFilterCtrl.valueChanges.pipe(takeUntil(this._onDestroy)).subscribe((_) => this.filterIssues());
    this.newTeamResponseForm = this.formBuilder.group({
      description: [''],
      severity: [this.issue.severity, Validators.required],
      type: [this.issue.type, Validators.required],
      responseTag: [this.issue.responseTag, Validators.required],
      assignees: [this.issue.assignees.map((a) => a.toLowerCase())],
      duplicated: [false],
      duplicateOf: ['']
    });
    this.duplicated.valueChanges.subscribe((checked) => {
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

  private filterIssues(): void {
    this.changeFilter(this.duplicatedIssueList, this.searchFilterCtrl.value).subscribe((issues) =>
      this.filteredDuplicateIssueList.next(issues)
    );
  }

  private changeFilter(issuesObservable: Observable<Issue[]>, searchInputString): Observable<Issue[]> {
    return issuesObservable.pipe(
      first(),
      map((issues) => {
        return applySearchFilter(searchInputString, [TABLE_COLUMNS.ID, TABLE_COLUMNS.TITLE], this.issueService, issues);
      })
    );
  }

  ngOnDestroy(): void {
    this._onDestroy.next(); // Emits the destroy signal
    this._onDestroy.complete();
  }

  submitNewTeamResponse(form: NgForm) {
    if (this.newTeamResponseForm.invalid) {
      return;
    }
    this.isFormPending = true;
    const latestIssue = this.getUpdatedIssue();

    this.isSafeToSubmit()
      .pipe(
        flatMap((isSaveToSubmit: boolean) => {
          const newCommentDescription = latestIssue.createGithubTeamResponse();
          if (isSaveToSubmit) {
            return this.issueService.createTeamResponse(latestIssue);
          } else if (this.submitButtonText === SUBMIT_BUTTON_TEXT.OVERWRITE) {
            const issueCommentId = this.issueService.issues[this.issue.id].issueComment.id;
            return this.issueService.updateIssueWithComment(latestIssue, <IssueComment>{
              id: issueCommentId,
              description: newCommentDescription
            });
          } else {
            this.conflict = new Conflict(' ', this.issueService.issues[this.issue.id].teamResponse);
            this.submitButtonText = SUBMIT_BUTTON_TEXT.OVERWRITE;
            this.viewUpdatedResponse();
            return throwError('A response has been submitted. Please verify the changes and try again.');
          }
        }),
        finalize(() => (this.isFormPending = false))
      )
      .subscribe(
        (updatedIssue: Issue) => {
          // updatedIssue.issueComment = updatedComment;
          this.issueUpdated.emit(updatedIssue);
          form.resetForm();
        },
        (error) => {
          this.errorHandlingService.handleError(error);
        }
      );
  }

  /**
   * @return - Determines whether it is safe to submit a tester response.
   */
  isSafeToSubmit(): Observable<boolean> {
    return this.issueService.getLatestIssue(this.issue.id).pipe(
      map((issue: Issue) => {
        return !issue.teamResponse;
      })
    );
  }

  /**
   * @return - an updated copy of issue with its updated value from the form.
   */
  getUpdatedIssue(): Issue {
    const clone = this.issue.clone(this.phaseService.currentPhase);
    clone.duplicated = this.duplicated.value;
    clone.duplicateOf = this.duplicateOf.value;
    if (clone.duplicated) {
      const duplicatedIssue = this.issueService.issues[clone.duplicateOf];
      clone.severity = duplicatedIssue.severity;
      clone.type = duplicatedIssue.type;
      clone.assignees = duplicatedIssue.assignees;
      clone.responseTag = duplicatedIssue.responseTag;
    } else {
      clone.severity = this.severity.value;
      clone.type = this.type.value;
      clone.assignees = this.assignees.value;
      clone.responseTag = this.responseTag.value;
    }
    clone.status = STATUS.Done;
    clone.teamResponse = Issue.updateTeamResponse(this.description.value);
    return clone;
  }

  dupIssueOptionIsDisabled(issue: Issue): boolean {
    return issue.duplicated || !!issue.duplicateOf;
  }

  getDisabledDupOptionErrorText(issue: Issue): string {
    return this.dupIssueOptionIsDisabled(issue) ? 'Duplicate of #' + issue.duplicateOf : '';
  }

  handleChangeOfDuplicateCheckbox(event: MatCheckboxChange) {
    if (event.checked) {
      this.responseTag.setValue('');
      this.assignees.setValue([]);
      this.responseTag.markAsUntouched();
    } else {
      this.duplicateOf.setValue('');
      this.duplicateOf.markAsUntouched();
    }
  }

  /**
   * Pops up a dialog that shows the updated team response that was submitted.
   */
  viewUpdatedResponse(): void {
    this.dialog.open(ConflictDialogComponent, {
      data: this.issueService.issues[this.issue.id],
      autoFocus: false
    });
  }

  refresh(): void {
    const updatedIssue = this.issueService.issues[this.issue.id];
    this.issueUpdated.emit(updatedIssue);
  }

  private getDupIssueList(): Observable<Issue[]> {
    return this.issueService.issues$.pipe(
      map((issues) => {
        return issues.filter((issue) => {
          return this.issue.id !== issue.id;
        });
      })
    );
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

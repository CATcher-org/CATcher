import { Component, EventEmitter, Input, OnDestroy, OnInit, Output, ViewChild, ViewEncapsulation } from '@angular/core';
import { FormControl } from '@angular/forms';
import { MatCheckbox } from '@angular/material/checkbox';
import { MatSelect, MatSelectChange } from '@angular/material/select';
import { Observable, ReplaySubject, Subject } from 'rxjs';
import { first, map, takeUntil } from 'rxjs/operators';
import { Issue } from '../../../core/models/issue.model';
import { ErrorHandlingService } from '../../../core/services/error-handling.service';
import { IssueService } from '../../../core/services/issue.service';
import { PermissionService } from '../../../core/services/permission.service';
import { PhaseService } from '../../../core/services/phase.service';
import { TABLE_COLUMNS } from '../../issue-tables/issue-tables-columns';
import { applySearchFilter } from '../../issue-tables/search-filter';

@Component({
  selector: 'app-duplicate-of-component',
  templateUrl: './duplicate-of.component.html',
  styleUrls: ['./duplicate-of.component.css'],
  encapsulation: ViewEncapsulation.None
})
export class DuplicateOfComponent implements OnInit, OnDestroy {
  isEditing = false;
  duplicatedIssueList: Observable<Issue[]>;
  searchFilterCtrl: FormControl = new FormControl();
  filteredDuplicateIssueList: ReplaySubject<Issue[]> = new ReplaySubject<Issue[]>(1);

  @Input() issue: Issue;

  @Output() issueUpdated = new EventEmitter<Issue>();

  @ViewChild(MatSelect, { static: true }) duplicateOfSelection: MatSelect;
  @ViewChild(MatCheckbox, { static: true }) duplicatedCheckbox: MatCheckbox;

  // A subject that will emit a signal when this component is being destroyed
  private _onDestroy = new Subject<void>();

  // Max chars visible for a duplicate entry in duplicates dropdown list.
  readonly MAX_TITLE_LENGTH_FOR_DUPLICATE_ISSUE = 17;
  // Max chars visible for a non-duplicate entry in duplicates dropdown list.
  readonly MAX_TITLE_LENGTH_FOR_NON_DUPLICATE_ISSUE = 37;

  constructor(
    public issueService: IssueService,
    public permissions: PermissionService,
    private errorHandlingService: ErrorHandlingService,
    private phaseService: PhaseService
  ) {}

  /**
   * Checks if the supplied issue requires a tooltip
   * in the UI as some information may be hidden due to truncation.
   * @param issue - Displayed issue that may need a tooltip.
   * @return - true (to enable tooltip) / false (to disable tooltip)
   */
  isTooltipNecessary(issue: Issue): boolean {
    // Maximum Possible Title length varies based on whether the issue
    // is a duplicate. (Whether the Duplicate Issue Tag is visible)
    let maxTitleLength: number;
    maxTitleLength = issue.duplicated ? this.MAX_TITLE_LENGTH_FOR_DUPLICATE_ISSUE : this.MAX_TITLE_LENGTH_FOR_NON_DUPLICATE_ISSUE;

    return issue.title.length > maxTitleLength;
  }

  ngOnDestroy(): void {
    this._onDestroy.next(); // Emits the destroy signal
    this._onDestroy.complete();
  }

  ngOnInit() {
    this.duplicatedIssueList = this.getDupIssueList();
    // Populate the filtered list with all the issues first
    this.duplicatedIssueList.pipe(first()).subscribe((issues) => this.filteredDuplicateIssueList.next(issues));
    this.searchFilterCtrl.valueChanges.pipe(takeUntil(this._onDestroy)).subscribe((_) => this.filterIssues());
  }

  private filterIssues(): void {
    this.changeFilter(this.duplicatedIssueList, this.searchFilterCtrl.value).subscribe((issues) =>
      this.filteredDuplicateIssueList.next(issues)
    );
  }

  updateDuplicateStatus(event: MatSelectChange) {
    const latestIssue = this.getUpdatedIssue(event);
    this.issueService.updateIssueWithComment(latestIssue, latestIssue.issueComment).subscribe(
      (issue) => this.issueUpdated.emit(issue),
      (error) => this.errorHandlingService.handleError(error)
    );
  }

  dupIssueOptionIsDisabled(issue: Issue): boolean {
    return issue.duplicated || !!issue.duplicateOf;
  }

  getDisabledDupOptionErrorText(issue: Issue): string {
    return this.dupIssueOptionIsDisabled(issue) ? 'Duplicate of #' + issue.duplicateOf : '';
  }

  handleCheckboxChange(event) {
    if (event.checked) {
      this.openSelection();
    } else {
      this.isEditing = false;
      this.duplicateOfSelection.close();
      this.duplicateOfSelection.value = null;
      this.updateDuplicateStatus(null);
    }
  }

  openSelection() {
    this.isEditing = true;
    this.duplicateOfSelection.open();
  }

  handleSelectionOpenChange(isOpen) {
    if (!isOpen) {
      this.isEditing = false;
      this.duplicatedCheckbox.checked = this.duplicateOfSelection.value;
    }
  }

  getUpdatedIssue(duplicateCheckboxEvent: MatSelectChange): Issue {
    const clone = this.issue.clone(this.phaseService.currentPhase);
    clone.duplicated = !!duplicateCheckboxEvent;
    clone.duplicateOf = duplicateCheckboxEvent ? duplicateCheckboxEvent.value : null;
    if (duplicateCheckboxEvent) {
      const duplicatedIssue = this.issueService.issues[clone.duplicateOf];
      clone.severity = duplicatedIssue.severity;
      clone.type = duplicatedIssue.type;
      clone.assignees = duplicatedIssue.assignees;
      clone.responseTag = duplicatedIssue.responseTag;
    }
    clone.issueComment.description = clone.createGithubTeamResponse();
    return clone;
  }

  private changeFilter(issuesObservable: Observable<Issue[]>, searchInputString): Observable<Issue[]> {
    return issuesObservable.pipe(
      first(),
      map((issues) => {
        return applySearchFilter(searchInputString, [TABLE_COLUMNS.ID, TABLE_COLUMNS.TITLE], this.issueService, issues);
      })
    );
  }

  private getDupIssueList(): Observable<Issue[]> {
    return this.issueService.issues$.pipe(
      map((issues) => {
        return issues.filter((issue) => {
          return this.issue.id !== issue.id && this.issue.teamAssigned.id === issue.teamAssigned.id;
        });
      })
    );
  }
}

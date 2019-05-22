import {Component, EventEmitter, Input, OnInit, Output, ViewChild, ViewEncapsulation} from '@angular/core';
import {Issue, SEVERITY_ORDER} from '../../../core/models/issue.model';
import {IssueService} from '../../../core/services/issue.service';
import {ErrorHandlingService} from '../../../core/services/error-handling.service';
import {map} from 'rxjs/operators';
import {Observable} from 'rxjs';
import {MatCheckbox, MatSelect} from '@angular/material';
import {PermissionService} from '../../../core/services/permission.service';

@Component({
  selector: 'app-duplicate-of-component',
  templateUrl: './duplicate-of.component.html',
  styleUrls: ['./duplicate-of.component.css'],
  encapsulation: ViewEncapsulation.None,
})
export class DuplicateOfComponent implements OnInit {
  isEditing = false;
  duplicatedIssueList: Observable<Issue[]>;

  @Input() issue: Issue;

  @Output() issueUpdated = new EventEmitter<Issue>();

  @ViewChild(MatSelect) duplicateOfSelection: MatSelect;
  @ViewChild(MatCheckbox) duplicatedCheckbox: MatCheckbox;

  // Max chars visible for a duplicate entry in duplicates dropdown list.
  readonly MAX_CHAR_VISIBLE_DUPLICATE = 17;
  // Max chars visible for a non-duplicate entry in duplicates dropdown list.
  readonly MAX_CHAR_VISIBLE_NONDUPLICATE = 37;

  constructor(public issueService: IssueService,
              private errorHandlingService: ErrorHandlingService,
              public permissions: PermissionService) {
  }

  /**
   * Method checks if the supplied issue requires a tooltip
   * in the UI as some information may be hidden due to truncation.
   * @param issue - Displayed issue that may need a tooltip.
   * @return - false (to enable tooltip) / true (to disable tooltip)
   */
  disableTooltip(issue: Issue): boolean {
    // Duplicated issues contain a postfix that reduce the screen-space
    // available to display the issue title.
    if (issue.duplicated) {
      // If length of issue title is less than threshold, it does not need
      // a tooltip hence the tooltip can be disabled, vice-versa.
      return (issue.title.length < this.MAX_CHAR_VISIBLE_DUPLICATE);
    } else {
      return (issue.title.length < this.MAX_CHAR_VISIBLE_NONDUPLICATE);
    }
  }

  ngOnInit() {
    this.duplicatedIssueList = this.getDupIssueList();
  }

  updateDuplicateStatus(event) {
    this.issueService.updateIssue({
      ...this.issue,
      duplicated: !!event,
      duplicateOf: event ? event.value : null,
    }).subscribe((updatedIssue) => {
      this.issueUpdated.emit(updatedIssue);
    }, (error) => {
      this.errorHandlingService.handleHttpError(error);
    });
  }

  dupIssueOptionIsDisabled(issue: Issue): boolean {
    return SEVERITY_ORDER[this.issue.severity] > SEVERITY_ORDER[issue.severity] || (issue.duplicated || !!issue.duplicateOf);
  }

  getDisabledDupOptionErrorText(issue: Issue): string {
    const reason = new Array<string>();
    if (this.dupIssueOptionIsDisabled(issue)) {
      if (SEVERITY_ORDER[this.issue.severity] > SEVERITY_ORDER[issue.severity]) {
        reason.push('Issue of lower priority');
      } else if (issue.duplicated || !!issue.duplicateOf) {
        reason.push('A duplicated issue');
      }
    }
    return reason.join(', ');
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

  private getDupIssueList(): Observable<Issue[]> {
    return this.issueService.issues$.pipe(map((issues) => {
      return issues.filter((issue) => {
        return this.issue.id !== issue.id && this.issue.teamAssigned.id === issue.teamAssigned.id;
      });
    }));
  }
}

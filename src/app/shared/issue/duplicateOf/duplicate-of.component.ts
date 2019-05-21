import {Component, EventEmitter, Input, OnInit, Output, ViewChild, ViewEncapsulation} from '@angular/core';
import {Issue, SEVERITY_ORDER} from '../../../core/models/issue.model';
import {IssueService} from '../../../core/services/issue.service';
import {ErrorHandlingService} from '../../../core/services/error-handling.service';
import {map} from 'rxjs/operators';
import {IssueCommentService} from '../../../core/services/issue-comment.service';
import {IssueComments} from '../../../core/models/comment.model';
import {forkJoin, Observable} from 'rxjs';
import {MatCheckbox, MatSelect} from '@angular/material';
import {PermissionService} from '../../../core/services/permission.service';
import {Phase, PhaseService} from '../../../core/services/phase.service';

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
  @Input() comments: IssueComments;

  @Output() issueUpdated = new EventEmitter<Issue>();
  @Output() commentsUpdated = new EventEmitter<IssueComments>();

  @ViewChild(MatSelect) duplicateOfSelection: MatSelect;
  @ViewChild(MatCheckbox) duplicatedCheckbox: MatCheckbox;

  // Max chars visible for a duplicate entry in duplicates dropdown list.
  readonly MAX_CHAR_VISIBLE_DUPLICATE = 17;
  // Max chars visible for a non-duplicate entry in duplicates dropdown list.
  readonly MAX_CHAR_VISIBLE_NONDUPLICATE = 40;

  constructor(public issueService: IssueService,
              private issueCommentService: IssueCommentService,
              private errorHandlingService: ErrorHandlingService,
              public permissions: PermissionService,
              private phaseService: PhaseService) {
  }

  /**
   * Method checks if the supplied issue requires a tooltip
   * in the UI as some information may be hidden due to truncation.
   * @param issue - Displayed issue that may need a tooltip.
   */
  needsTooltip(issue: Issue): boolean {
    // Duplicated issues contain a postfix that reduce the screen-space
    // available to display the issue title.
    if (issue.duplicated) {
      return (issue.title.length < this.MAX_CHAR_VISIBLE_DUPLICATE);
    } else {
      return (issue.title.length < this.MAX_CHAR_VISIBLE_NONDUPLICATE);
    }
  }

  ngOnInit() {
    this.duplicatedIssueList = this.getDupIssueList();
  }

  updateDuplicateStatus(event) {
    if (event) {
      const duplicateOfNumber = event.value;
      const responseType = this.phaseService.currentPhase === Phase.phase2 ? 'teamResponse' : 'tutorResponse';
      forkJoin(this.issueCommentService.updateWithDuplicateOfValue(this.issue.id, duplicateOfNumber), this.issueService.updateIssue({
        ...this.issue,
        duplicated: true,
      })).subscribe((res) => {
        this.commentsUpdated.emit({
          ...this.comments,
          [responseType]: {
            ...res[0],
            duplicateOf: duplicateOfNumber,
          },
        });
        this.issueUpdated.emit({
          ...res[1],
          duplicateOf: duplicateOfNumber,
        });
      });
    } else {
      const responseType = this.phaseService.currentPhase === Phase.phase2 ? 'teamResponse' : 'tutorResponse';
      forkJoin(this.issueCommentService.removeDuplicateOfValue(this.issue.id), this.issueService.updateIssue({
        ...this.issue,
        duplicated: false
      })).subscribe((res) => {
        this.commentsUpdated.emit({
          ...this.comments,
          [responseType]: res[0],
        });
        this.issueUpdated.emit(res[1]);
      });
    }
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

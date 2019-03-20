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

  constructor(public issueService: IssueService,
              private issueCommentService: IssueCommentService,
              private errorHandlingService: ErrorHandlingService,
              public permissions: PermissionService) {
  }

  ngOnInit() {
    this.duplicatedIssueList = this.getDupIssueList();
  }

  updateDuplicateStatus(event) {
    if (event) {
      const duplicateOfNumber = event.value;
      forkJoin(this.issueCommentService.updateWithDuplicateOfValue(this.issue.id, duplicateOfNumber), this.issueService.updateIssue({
        ...this.issue,
        duplicated: true,
      })).subscribe((res) => {
        this.commentsUpdated.emit({
          ...this.comments,
          teamResponse: {
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
      forkJoin(this.issueCommentService.removeDuplicateOfValue(this.issue.id), this.issueService.updateIssue({
        ...this.issue,
        duplicated: false
      })).subscribe((res) => {
        this.commentsUpdated.emit({
          ...this.comments,
          teamResponse: res[0],
        });
        this.issueUpdated.emit(res[1]);
      });
    }
  }

  dupIssueOptionIsDisabled(issue: Issue): boolean {
    return SEVERITY_ORDER[this.issue.severity] > SEVERITY_ORDER[issue.severity];
  }

  getDisabledDupOptionErrorText(issue: Issue): string {
    const reason = new Array<string>();
    if (this.dupIssueOptionIsDisabled(issue)) {
      if (SEVERITY_ORDER[this.issue.severity] > SEVERITY_ORDER[issue.severity]) {
        reason.push('Cannot set \'duplicate of\' to an issue of lower priority');
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

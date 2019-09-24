import {
  Component,
  EventEmitter,
  Input,
  OnInit,
  Output,
  ViewChild,
  ViewEncapsulation
} from '@angular/core';
import {
  ErrorHandlingService
} from '../../../core/services/error-handling.service';
import { Issue, SEVERITY_ORDER } from '../../../core/models/issue.model';
import { IssueService } from '../../../core/services/issue.service';
import { map } from 'rxjs/operators';
import { Observable } from 'rxjs';
import { MatCheckbox, MatSelect } from '@angular/material';
import { PermissionService } from '../../../core/services/permission.service';
import { IssueCommentService } from '../../../core/services/issue-comment.service';
import { IssueComment } from '../../../core/models/comment.model';

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
  @Output() commentUpdated = new EventEmitter<IssueComment>();

  @ViewChild(MatSelect) duplicateOfSelection: MatSelect;
  @ViewChild(MatCheckbox) duplicatedCheckbox: MatCheckbox;

  // Max chars visible for a duplicate entry in duplicates dropdown list.
  readonly MAX_TITLE_LENGTH_FOR_DUPLICATE_ISSUE = 17;
  // Max chars visible for a non-duplicate entry in duplicates dropdown list.
  readonly MAX_TITLE_LENGTH_FOR_NON_DUPLICATE_ISSUE = 37;

  constructor(public issueService: IssueService,
              public issueCommentService: IssueCommentService,
              private errorHandlingService: ErrorHandlingService,
              public permissions: PermissionService) {
  }

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
    maxTitleLength = issue.duplicated
      ? this.MAX_TITLE_LENGTH_FOR_DUPLICATE_ISSUE
      : this.MAX_TITLE_LENGTH_FOR_NON_DUPLICATE_ISSUE;

    return issue.title.length > maxTitleLength;
  }

  ngOnInit() {
    this.duplicatedIssueList = this.getDupIssueList();
  }

  updateDuplicateStatus(event) {
    const latestIssue = {
      ...this.issue,
      duplicated: !!event,
      duplicateOf: event ? event.value : null,
    };

    latestIssue.issueComment.description = this.issueCommentService.
    createGithubTeamResponse(latestIssue.teamResponse, latestIssue.duplicateOf);

    this.issueService.updateIssue(latestIssue).subscribe((updatedIssue) => {
      this.issueCommentService.updateIssueComment(latestIssue.issueComment).subscribe((updatedComment) => {
        latestIssue.issueComment = updatedComment;
        this.commentUpdated.emit(updatedComment);
        this.issueUpdated.emit(latestIssue);
      });
    }, (error) => {
      this.errorHandlingService.handleHttpError(error);
    });
  }

  dupIssueOptionIsDisabled(issue: Issue): boolean {
    return SEVERITY_ORDER[this.issue.severity] > SEVERITY_ORDER[issue.severity]
      || (issue.duplicated || !!issue.duplicateOf);
  }

  getDisabledDupOptionErrorText(issue: Issue): string {
    const reason = new Array<string>();
    if (this.dupIssueOptionIsDisabled(issue)) {
      if (SEVERITY_ORDER[this.issue.severity]
        > SEVERITY_ORDER[issue.severity]) {

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
        return this.issue.id !== issue.id
          && this.issue.teamAssigned.id === issue.teamAssigned.id;
      });
    }));
  }
}

import { Component, Input, OnInit, ViewEncapsulation } from '@angular/core';
import { Issue } from '../../../core/models/issue.model';
import { IssueService } from '../../../core/services/issue.service';
import { PermissionService } from '../../../core/services/permission.service';
import { forkJoin, Observable } from 'rxjs';
import { IssueCommentService } from '../../../core/services/issue-comment.service';
import { ErrorHandlingService } from '../../../core/services/error-handling.service';
import { IssueComment } from '../../../core/models/comment.model';
import { PhaseService } from '../../../core/services/phase.service';

@Component({
  selector: 'app-duplicated-issues-component',
  templateUrl: './duplicated-issues.component.html',
  styleUrls: ['./duplicated-issues.component.css'],
  encapsulation: ViewEncapsulation.None,
})
export class DuplicatedIssuesComponent implements OnInit {
  duplicatedIssues: Observable<Issue[]>;

  @Input() issue: Issue;

  constructor(public issueService: IssueService,
              public issueCommentService: IssueCommentService,
              public errorHandlingService: ErrorHandlingService,
              public phaseService: PhaseService,
              public permissions: PermissionService) {
  }

  ngOnInit() {
    this.duplicatedIssues = this.issueService.getDuplicateIssuesFor(this.issue);
  }

  removeDuplicateStatus(duplicatedIssue: Issue) {
    const latestIssue = this.getUpdatedIssueWithRemovedDuplicate(duplicatedIssue);
    forkJoin([this.issueService.updateIssue(latestIssue),
      this.issueCommentService.updateIssueComment(latestIssue.id, latestIssue.issueComment)]).subscribe(
      (resultArr: [Issue, IssueComment]) => {
        const [updatedIssue, updatedIssueComment] = resultArr;
        updatedIssue.issueComment = updatedIssueComment;
        this.issueService.updateLocalStore(updatedIssue);
      }, (error) => {
        this.errorHandlingService.handleError(error);
      }
    );
  }

  getUpdatedIssueWithRemovedDuplicate(duplicatedIssue: Issue): Issue {
    const clone = duplicatedIssue.clone(this.phaseService.currentPhase);
    clone.duplicated = false;
    clone.duplicateOf = null;
    clone.issueComment.description = clone.createGithubTeamResponse();
    return clone;
  }
}

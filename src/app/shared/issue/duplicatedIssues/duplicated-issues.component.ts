import {Component, Input, OnInit, ViewEncapsulation} from '@angular/core';
import {Issue} from '../../../core/models/issue.model';
import {IssueService} from '../../../core/services/issue.service';
import {ErrorHandlingService} from '../../../core/services/error-handling.service';
import {IssueCommentService} from '../../../core/services/issue-comment.service';
import {IssueComments} from '../../../core/models/comment.model';
import {PermissionService} from '../../../core/services/permission.service';
import {forkJoin, Observable} from 'rxjs';

@Component({
  selector: 'app-duplicated-issues-component',
  templateUrl: './duplicated-issues.component.html',
  styleUrls: ['./duplicated-issues.component.css'],
  encapsulation: ViewEncapsulation.None,
})
export class DuplicatedIssuesComponent implements OnInit {
  duplicatedIssues: Observable<Issue[]>;

  @Input() issue: Issue;
  @Input() comments: IssueComments;

  constructor(public issueService: IssueService,
              private issueCommentService: IssueCommentService,
              private errorHandlingService: ErrorHandlingService,
              public permissions: PermissionService) {
  }

  ngOnInit() {
    this.duplicatedIssues = this.issueService.getDuplicateIssuesFor(this.issue);
  }

  removeDuplicateStatus(duplicatedIssue: Issue) {
    forkJoin(this.issueCommentService.removeDuplicateOfValue(duplicatedIssue.id), this.issueService.updateIssue({
      ...duplicatedIssue,
      duplicated: false
    })).subscribe((res) => {
      this.issueCommentService.updateLocalStore({
        ...this.issueCommentService.comments.get(duplicatedIssue.id),
        teamResponse: res[0],
      });
      this.issueService.updateLocalStore(res[1]);
    });
  }
}

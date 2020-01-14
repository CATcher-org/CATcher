import {Component, Input, OnInit, ViewEncapsulation} from '@angular/core';
import {Issue} from '../../../core/models/issue.model';
import {IssueService} from '../../../core/services/issue.service';
import {PermissionService} from '../../../core/services/permission.service';
import {Observable} from 'rxjs';

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
              public permissions: PermissionService) {
  }

  ngOnInit() {
    this.duplicatedIssues = this.issueService.getDuplicateIssuesFor(this.issue);
  }

  removeDuplicateStatus(duplicatedIssue: Issue) {
    this.issueService.updateIssue(<Issue>{
      ...duplicatedIssue,
      duplicated: false,
      duplicateOf: null,
    }).subscribe((updatedIssue) => {
      this.issueService.updateLocalStore(updatedIssue);
    });
  }
}

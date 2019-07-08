import { Component, Input, OnChanges, OnInit, SimpleChanges, ViewChild } from '@angular/core';
import { IssueService } from '../../core/services/issue.service';
import { IssuesDataTable } from '../../shared/issue-tables/IssuesDataTable';
import { Issue } from '../../core/models/issue.model';
import { PermissionService } from '../../core/services/permission.service';
import { UserService } from '../../core/services/user.service';
import { UserRole } from '../../core/models/user.model';
import { ACTION_BUTTONS, IssueTablesComponent } from '../../shared/issue-tables/issue-tables.component';

@Component({
  selector: 'app-issues-pending',
  templateUrl: './issues-pending.component.html',
  styleUrls: ['./issues-pending.component.css']
})
export class IssuesPendingComponent implements OnInit, OnChanges {
  displayedColumns;
  filter: (issue: Issue) => boolean;

  readonly actionButtons: ACTION_BUTTONS[] = [ACTION_BUTTONS.VIEW_IN_WEB, ACTION_BUTTONS.RESPOND_TO_ISSUE,
      ACTION_BUTTONS.MARK_AS_RESPONDED];

  @Input() teamFilter: string;

  @ViewChild(IssueTablesComponent) table: IssueTablesComponent;

  constructor(public issueService: IssueService,
              public permissions: PermissionService, public userService: UserService) {
    if (userService.currentUser.role !== UserRole.Student) {
      this.displayedColumns = ['id', 'title', 'teamAssigned', 'type', 'severity', 'duplicatedIssues', 'actions'];
    } else {
      this.displayedColumns = ['id', 'title', 'type', 'severity', 'duplicatedIssues', 'actions'];
    }
  }

  ngOnChanges(changes: SimpleChanges) {
    if (!changes.teamFilter.isFirstChange()) {
      this.table.issues.teamFilter = changes.teamFilter.currentValue;
    }
  }

  ngOnInit() {
    this.filter = (issue: Issue) => {
      return (!this.issueService.hasResponse(issue.id) || (!issue.status || issue.status === 'Incomplete')) &&
        !issue.duplicateOf;
    };
  }

  applyFilter(filterValue: string) {
    this.table.issues.filter = filterValue;
  }
}

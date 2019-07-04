import { Component, Input, OnChanges, OnInit, SimpleChanges, ViewChild } from '@angular/core';
import { IssueService } from '../../core/services/issue.service';
import { IssuesDataTable } from '../../shared/issue-tables/IssuesDataTable';
import { Issue } from '../../core/models/issue.model';
import { UserService } from '../../core/services/user.service';
import { UserRole } from '../../core/models/user.model';
import { PermissionService } from '../../core/services/permission.service';
import { ACTION_BUTTONS, IssueTablesComponent } from '../../shared/issue-tables/issue-tables.component';

@Component({
  selector: 'app-issues-faulty',
  templateUrl: './issues-faulty.component.html',
  styleUrls: ['./issues-faulty.component.css'],
})
export class IssuesFaultyComponent implements OnInit, OnChanges {
  displayedColumns: string[];
  filter: (issue: Issue) => boolean;

  readonly actionButtons: ACTION_BUTTONS[] = [ACTION_BUTTONS.VIEW_IN_WEB, ACTION_BUTTONS.FIX_ISSUE];

  @Input() teamFilter: string;

  @ViewChild(IssueTablesComponent) table: IssueTablesComponent;

  constructor(public issueService: IssueService, public userService: UserService,
      public permissions: PermissionService) {
    if (userService.currentUser.role === UserRole.Student) {
      this.displayedColumns = ['id', 'title', 'type', 'severity', 'responseTag', 'assignees', 'duplicatedIssues', 'actions'];
    } else {
      this.displayedColumns = ['id', 'title', 'teamAssigned', 'type', 'severity', 'responseTag', 'assignees', 'duplicatedIssues',
        'actions'];
    }
  }

  ngOnChanges(changes: SimpleChanges) {
    if (!changes.teamFilter.isFirstChange()) {
      this.table.issues.teamFilter = changes.teamFilter.currentValue;
    }
  }

  ngOnInit() {
    this.filter = (issue: Issue): boolean => {
      return this.issueService.hasResponse(issue.id) &&
        (!!issue.duplicateOf && this.issueService.issues$.getValue().filter(childIssue => {
          return childIssue.duplicateOf === issue.id;
        }).length !== 0);
    };
  }

  applyFilter(filterValue: string) {
    this.table.issues.filter = filterValue;
  }
}

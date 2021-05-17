import { Component, Input, OnChanges, OnInit, SimpleChanges, ViewChild } from '@angular/core';
import { IssueService } from '../../core/services/issue.service';
import { IssuesDataTable } from '../../shared/issue-tables/IssuesDataTable';
import { Issue } from '../../core/models/issue.model';
import { UserService } from '../../core/services/user.service';
import { UserRole } from '../../core/models/user.model';
import { PermissionService } from '../../core/services/permission.service';
import { ACTION_BUTTONS, IssueTablesComponent } from '../../shared/issue-tables/issue-tables.component';
import { TABLE_COLUMNS } from '../../shared/issue-tables/issue-tables-columns';

@Component({
  selector: 'app-issues-faulty',
  templateUrl: './issues-faulty.component.html',
  styleUrls: ['./issues-faulty.component.css'],
})
export class IssuesFaultyComponent implements OnInit, OnChanges {
  displayedColumns: string[];
  filter: (issue: Issue) => boolean;

  readonly actionButtons: ACTION_BUTTONS[] = [
    ACTION_BUTTONS.VIEW_IN_WEB,
    ACTION_BUTTONS.FIX_ISSUE
  ];

  @Input() teamFilter: string;

  @ViewChild(IssueTablesComponent) table: IssueTablesComponent;

  constructor(public issueService: IssueService, public userService: UserService,
      public permissions: PermissionService) {
    if (userService.currentUser.role === UserRole.Student) {
      this.displayedColumns = [
        TABLE_COLUMNS.ID,
        TABLE_COLUMNS.TITLE,
        TABLE_COLUMNS.TYPE,
        TABLE_COLUMNS.SEVERITY,
        TABLE_COLUMNS.RESPONSE,
        TABLE_COLUMNS.ASSIGNEE,
        TABLE_COLUMNS.DUPLICATED_ISSUES,
        TABLE_COLUMNS.ACTIONS
      ];
    } else {
      this.displayedColumns = [
        TABLE_COLUMNS.ID,
        TABLE_COLUMNS.TITLE,
        TABLE_COLUMNS.TEAM_ASSIGNED,
        TABLE_COLUMNS.TYPE,
        TABLE_COLUMNS.SEVERITY,
        TABLE_COLUMNS.RESPONSE,
        TABLE_COLUMNS.ASSIGNEE,
        TABLE_COLUMNS.DUPLICATED_ISSUES,
        TABLE_COLUMNS.ACTIONS
      ];
    }
  }

  ngOnChanges(changes: SimpleChanges) {
    if (!changes.teamFilter.isFirstChange()) {
      this.table.issues.teamFilter = changes.teamFilter.currentValue;
    }
  }

  ngOnInit() {
    this.filter = (issue: Issue): boolean => {
      const hasTeamResponse = (issue: Issue) => this.issueService.hasTeamResponse(issue.id);
      const isDuplicateIssue = (issue: Issue) => !!issue.duplicateOf;
      const isDuplicatedBy = (issue: Issue) =>
            !!this.issueService.issues$.getValue().filter(childIssue => childIssue.duplicateOf === issue.id).length;
      return hasTeamResponse(issue) && isDuplicateIssue(issue) && isDuplicatedBy(issue);
    };
  }

  applyFilter(filterValue: string) {
    this.table.issues.filter = filterValue;
  }
}
